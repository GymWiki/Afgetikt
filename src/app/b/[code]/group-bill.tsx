"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  clearParticipant,
  getManagerToken,
  getParticipant,
  storeParticipantToken,
} from "@/lib/client-session";
import { formatCents, formatCentsForClipboard } from "@/lib/money";
import { staggerDelay } from "@/lib/motion";
import { calculateSplit, type SplitItemClaim } from "@/lib/split";
import { Check, ExternalLink, Loader2, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { joinBillAction, markSelfPaidAction, setClaimQuantityAction } from "./actions";

export type GroupItem = {
  id: string;
  name: string;
  priceCents: number;
  quantity: number;
};

export type GroupParticipant = {
  id: string;
  name: string;
  isPayer: boolean;
  hasPaid: boolean;
};

// Ververst de rekening periodiek zodat wijzigingen van anderen (nieuwe
// keuzes, betalingen) ook zichtbaar worden zonder dat je zelf iets doet.
const LIVE_REFRESH_MS = 6000;

export function GroupBill({
  billId,
  title,
  payerName,
  paymentLink,
  serviceCents,
  items,
  initialParticipants,
  initialClaimsByItem,
}: {
  billId: string;
  title: string | null;
  payerName: string;
  paymentLink: string;
  serviceCents: number;
  items: GroupItem[];
  initialParticipants: GroupParticipant[];
  initialClaimsByItem: Record<string, SplitItemClaim[]>;
}) {
  const router = useRouter();
  // Start altijd als "onbekend" op de server, en pas pas na hydratie de
  // localStorage-sessie in (anders ontstaat er een SSR/CSR mismatch).
  const [session, setSession] = useState<{
    checked: boolean;
    me: { participantId: string; token: string } | null;
    managerToken: string | null;
  }>({ checked: false, me: null, managerToken: null });
  const { checked: checkedSession, managerToken } = session;
  const setMe = (me: { participantId: string; token: string } | null) =>
    setSession((prev) => ({ ...prev, me }));
  const me = session.me;
  const [nameInput, setNameInput] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [participants, setParticipants] = useState(initialParticipants);
  const [claimsByItem, setClaimsByItem] = useState(initialClaimsByItem);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // localStorage bestaat niet op de server; dit moet na hydratie, anders
    // ontstaat een SSR/CSR-mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSession({
      checked: true,
      me: getParticipant(billId),
      managerToken: getManagerToken(billId),
    });
  }, [billId]);

  // Live-ish: elke paar seconden verse data ophalen zodat je ziet wat
  // anderen aan tafel kiezen of betalen, zonder zelf te hoeven verversen.
  useEffect(() => {
    const interval = setInterval(() => router.refresh(), LIVE_REFRESH_MS);
    return () => clearInterval(interval);
  }, [router]);

  useEffect(() => {
    // Nieuwe server-props na een live-refresh moeten de lokale kopie
    // overschrijven, anders blijft gepolld data onzichtbaar.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setParticipants(initialParticipants);
    setClaimsByItem(initialClaimsByItem);
  }, [initialParticipants, initialClaimsByItem]);

  const meParticipant = participants.find((p) => p.id === me?.participantId);

  const split = useMemo(() => {
    const splitItems = items.map((item) => ({
      id: item.id,
      priceCents: item.priceCents,
      quantity: item.quantity,
      claims: claimsByItem[item.id] ?? [],
    }));
    return calculateSplit(splitItems, participants, serviceCents);
  }, [items, claimsByItem, participants, serviceCents]);

  const myTotal = split.perParticipant.find(
    (p) => p.participantId === me?.participantId,
  );

  function handleJoin() {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setJoinError("Vul je naam in.");
      return;
    }
    setJoinError(null);
    startTransition(async () => {
      const participant = await joinBillAction(billId, trimmed);
      if (!participant) {
        setJoinError("Meedoen lukte niet. Probeer het opnieuw.");
        return;
      }
      storeParticipantToken(billId, participant.id, participant.accessToken);
      setParticipants((prev) => [
        ...prev,
        { id: participant.id, name: trimmed, isPayer: false, hasPaid: false },
      ]);
      setMe({ participantId: participant.id, token: participant.accessToken });
    });
  }

  function setMyClaimQuantity(itemId: string, quantity: number) {
    if (!me) return;
    const current = claimsByItem[itemId] ?? [];
    const previousMine = current.find((c) => c.participantId === me.participantId);
    const others = current.filter((c) => c.participantId !== me.participantId);
    const next =
      quantity > 0 ? [...others, { participantId: me.participantId, quantity }] : others;
    setClaimsByItem((prev) => ({ ...prev, [itemId]: next }));

    startTransition(async () => {
      const result = await setClaimQuantityAction(
        billId,
        me.participantId,
        me.token,
        itemId,
        quantity,
      );
      if (!result.ok) {
        // rollback bij mislukking (bv. iemand anders was net sneller)
        const rolledBack = previousMine ? [...others, previousMine] : others;
        setClaimsByItem((prev) => ({ ...prev, [itemId]: rolledBack }));
      }
    });
  }

  function toggleSelfPaid() {
    if (!me || !meParticipant) return;
    const next = !meParticipant.hasPaid;
    setParticipants((prev) =>
      prev.map((p) => (p.id === me.participantId ? { ...p, hasPaid: next } : p)),
    );
    startTransition(async () => {
      await markSelfPaidAction(billId, me.participantId, me.token, next);
    });
  }

  async function handlePay() {
    const amount = formatCentsForClipboard(myTotal?.totalCents ?? 0);
    try {
      await navigator.clipboard.writeText(amount);
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 3000);
    } catch {
      // clipboard kan geweigerd worden (bv. geen HTTPS of permissie); de
      // gebruiker kan het bedrag dan nog altijd zelf overtypen.
    }
    window.open(paymentLink, "_blank", "noopener,noreferrer");
  }

  if (!checkedSession) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <Loader2 size={20} className="animate-spin text-muted" />
      </div>
    );
  }

  if (!me) {
    return (
      <div className="flex flex-col gap-6">
        <div className="animate-fade-up">
          <h1 className="text-xl font-semibold text-foreground">
            {title ?? "Rekening"}
          </h1>
          <p className="mt-1 text-[15px] text-muted">
            Betaald door {payerName}
          </p>
        </div>
        <div className="animate-fade-up" style={staggerDelay(1, 80)}>
          <label
            htmlFor="participant-name"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Wat is je naam?
          </label>
          <Input
            id="participant-name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Bijv. Sanne"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
          />
        </div>
        {joinError && <p className="text-sm text-red-600">{joinError}</p>}
        <Button size="lg" onClick={handleJoin} disabled={isPending}>
          {isPending ? <Loader2 size={18} className="animate-spin" /> : "Meedoen"}
        </Button>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-5"
      style={{ paddingBottom: "calc(7rem + env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-normal text-muted">
            {title ?? "Rekening"}
          </h1>
          <p className="text-[15px] text-foreground">
            Hoi {meParticipant?.name} — betaald door {payerName}
          </p>
        </div>
        <button
          className="-m-2 shrink-0 p-2 text-xs text-muted underline underline-offset-4"
          onClick={() => {
            clearParticipant(billId);
            setMe(null);
          }}
        >
          Wissel
        </button>
      </div>

      <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-surface">
        {items.map((item, index) => (
          <ItemRow
            key={item.id}
            item={item}
            index={index}
            claims={claimsByItem[item.id] ?? []}
            participants={participants}
            myParticipantId={me.participantId}
            onChangeMyQuantity={(quantity) => setMyClaimQuantity(item.id, quantity)}
          />
        ))}
      </div>

      {split.unclaimedCents > 0 && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">
          Nog {formatCents(split.unclaimedCents)} aan producten niet gekozen
          door iemand.
        </p>
      )}

      <PaidList
        participants={participants}
        payerName={payerName}
        splitTotals={split.perParticipant}
      />

      <div
        className="fixed inset-x-0 bottom-0 border-t border-border bg-surface/95 backdrop-blur"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto flex max-w-md items-center gap-3 px-5 py-4">
          <div className="flex-1">
            <div className="text-xs text-muted">
              {copiedAmount
                ? "Gekopieerd ✓"
                : meParticipant?.isPayer
                  ? "Jij legde uit"
                  : "Jij betaalt"}
            </div>
            <div className="text-lg font-semibold tabular-nums text-foreground">
              {formatCents(
                meParticipant?.isPayer
                  ? split.grandTotalCents
                  : (myTotal?.totalCents ?? 0),
              )}
            </div>
          </div>
          {meParticipant?.isPayer ? (
            managerToken && (
              <Link href={`/b/${billId}/beheer?key=${managerToken}`}>
                <Button variant="secondary">Mijn overzicht</Button>
              </Link>
            )
          ) : meParticipant?.hasPaid ? (
            <Button variant="secondary" onClick={toggleSelfPaid}>
              <Check size={16} className="animate-pop" />
              Betaald
            </Button>
          ) : (
            <>
              <Button variant="secondary" onClick={toggleSelfPaid}>
                Ik heb betaald
              </Button>
              <Button onClick={handlePay}>
                Betaal
                <ExternalLink size={16} />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ItemRow({
  item,
  index,
  claims,
  participants,
  myParticipantId,
  onChangeMyQuantity,
}: {
  item: GroupItem;
  index: number;
  claims: SplitItemClaim[];
  participants: GroupParticipant[];
  myParticipantId: string;
  onChangeMyQuantity: (quantity: number) => void;
}) {
  const myClaim = claims.find((c) => c.participantId === myParticipantId);
  const myQuantity = myClaim?.quantity ?? 0;
  const others = claims.filter((c) => c.participantId !== myParticipantId);
  const totalClaimed = claims.reduce((sum, c) => sum + c.quantity, 0);
  const maxForMe = item.quantity - totalClaimed + myQuantity;

  const otherLabels = others
    .map((c) => {
      const name = participants.find((p) => p.id === c.participantId)?.name;
      if (!name) return null;
      return item.quantity > 1 ? `${name} (${c.quantity})` : name;
    })
    .filter((label): label is string => Boolean(label));

  if (item.quantity === 1) {
    const iClaimed = myQuantity > 0;
    return (
      <button
        onClick={() => onChangeMyQuantity(iClaimed ? 0 : 1)}
        className={`flex animate-fade-up items-center gap-3 px-4 py-3.5 text-left transition-colors ${
          iClaimed ? "bg-brand-50/60" : "hover:bg-black/[0.02]"
        }`}
        style={staggerDelay(index, 40)}
      >
        <div
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
            iClaimed ? "border-brand-500 bg-brand-500 text-white" : "border-border"
          }`}
        >
          {iClaimed && <Check size={14} strokeWidth={3} className="animate-pop" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-medium text-foreground">
            {item.name}
          </div>
          {otherLabels.length > 0 && (
            <div className="truncate text-xs text-muted">
              ook: {otherLabels.join(", ")}
            </div>
          )}
        </div>
        <div className="text-[15px] tabular-nums text-foreground">
          {formatCents(item.priceCents)}
        </div>
      </button>
    );
  }

  return (
    <div
      className={`flex animate-fade-up items-center gap-3 px-4 py-3 transition-colors duration-200 ${myQuantity > 0 ? "bg-brand-50/60" : ""}`}
      style={staggerDelay(index, 40)}
    >
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-medium text-foreground">
          {item.name}
          <span className="ml-1.5 text-sm text-muted">×{item.quantity}</span>
        </div>
        <div className="truncate text-xs text-muted">
          {totalClaimed} van de {item.quantity} gekozen
          {otherLabels.length > 0 && ` — ook: ${otherLabels.join(", ")}`}
        </div>
      </div>
      <div className="text-[15px] tabular-nums text-foreground">
        {formatCents(item.priceCents)}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          aria-label={`Eén minder ${item.name}`}
          onClick={() => onChangeMyQuantity(Math.max(0, myQuantity - 1))}
          disabled={myQuantity <= 0}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground disabled:opacity-30"
        >
          <Minus size={14} />
        </button>
        <span className="w-5 text-center text-[15px] tabular-nums text-foreground">
          {myQuantity}
        </span>
        <button
          aria-label={`Eén meer ${item.name}`}
          onClick={() => onChangeMyQuantity(myQuantity + 1)}
          disabled={myQuantity >= maxForMe}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground disabled:opacity-30"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

function PaidList({
  participants,
  payerName,
  splitTotals,
}: {
  participants: GroupParticipant[];
  payerName: string;
  splitTotals: { participantId: string; totalCents: number }[];
}) {
  const others = participants.filter((p) => !p.isPayer);
  if (others.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
        Status ({payerName} ziet dit ook)
      </div>
      <ul className="flex flex-col gap-2.5">
        {others.map((p, index) => {
          const total = splitTotals.find((s) => s.participantId === p.id);
          return (
            <li
              key={p.id}
              className="flex animate-fade-up items-center justify-between text-sm"
              style={staggerDelay(index, 40)}
            >
              <span className="text-foreground">{p.name}</span>
              <span className="flex items-center gap-2">
                <span className="tabular-nums text-muted">
                  {formatCents(total?.totalCents ?? 0)}
                </span>
                {p.hasPaid ? (
                  <span className="flex animate-pop items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                    <Check size={12} strokeWidth={3} />
                    Betaald
                  </span>
                ) : (
                  <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                    Nog niet
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
