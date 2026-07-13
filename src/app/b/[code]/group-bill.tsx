"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  clearParticipant,
  getManagerToken,
  getParticipant,
  storeParticipantToken,
} from "@/lib/client-session";
import { formatCents } from "@/lib/money";
import { calculateSplit } from "@/lib/split";
import { Check, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { joinBillAction, markSelfPaidAction, toggleClaimAction } from "./actions";

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
  initialClaimsByItem: Record<string, string[]>;
}) {
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

  const meParticipant = participants.find((p) => p.id === me?.participantId);

  const split = useMemo(() => {
    const splitItems = items.map((item) => ({
      id: item.id,
      priceCents: item.priceCents,
      claimedByParticipantIds: claimsByItem[item.id] ?? [],
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

  function toggleClaim(itemId: string) {
    if (!me) return;
    const current = claimsByItem[itemId] ?? [];
    const claimed = current.includes(me.participantId);
    const next = claimed
      ? current.filter((id) => id !== me.participantId)
      : [...current, me.participantId];
    setClaimsByItem((prev) => ({ ...prev, [itemId]: next }));

    startTransition(async () => {
      const success = await toggleClaimAction(
        billId,
        me.participantId,
        me.token,
        itemId,
        !claimed,
      );
      if (!success) {
        // rollback bij mislukking
        setClaimsByItem((prev) => ({ ...prev, [itemId]: current }));
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

  if (!checkedSession) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <Loader2 size={20} className="animate-spin text-muted" />
      </div>
    );
  }

  if (!me) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="text-sm text-muted">Betaald door</div>
          <div className="text-[15px] font-medium text-foreground">
            {payerName}
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Wat is je naam?
          </label>
          <Input
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
          <div className="text-sm text-muted">{title ?? "Rekening"}</div>
          <div className="text-[15px] text-foreground">
            Hoi {meParticipant?.name} — betaald door {payerName}
          </div>
        </div>
        <button
          className="shrink-0 text-xs text-muted underline underline-offset-4"
          onClick={() => {
            clearParticipant(billId);
            setMe(null);
          }}
        >
          Wissel
        </button>
      </div>

      <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-surface">
        {items.map((item) => {
          const claimants = claimsByItem[item.id] ?? [];
          const iClaimed = claimants.includes(me.participantId);
          const otherNames = claimants
            .filter((id) => id !== me.participantId)
            .map((id) => participants.find((p) => p.id === id)?.name)
            .filter(Boolean);

          return (
            <button
              key={item.id}
              onClick={() => toggleClaim(item.id)}
              className={`flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${
                iClaimed ? "bg-brand-50/60" : "hover:bg-black/[0.02]"
              }`}
            >
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                  iClaimed
                    ? "border-brand-500 bg-brand-500 text-white"
                    : "border-border"
                }`}
              >
                {iClaimed && <Check size={14} strokeWidth={3} />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[15px] font-medium text-foreground">
                  {item.name}
                  {item.quantity > 1 && (
                    <span className="ml-1.5 text-sm text-muted">
                      ×{item.quantity}
                    </span>
                  )}
                </div>
                {otherNames.length > 0 && (
                  <div className="truncate text-xs text-muted">
                    ook: {otherNames.join(", ")}
                  </div>
                )}
              </div>
              <div className="text-[15px] tabular-nums text-foreground">
                {formatCents(item.priceCents)}
              </div>
            </button>
          );
        })}
      </div>

      {split.unclaimedCents > 0 && (
        <p className="text-center text-xs text-muted">
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
              {meParticipant?.isPayer ? "Jij legde uit" : "Jij betaalt"}
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
              <Check size={16} />
              Betaald
            </Button>
          ) : (
            <>
              <Button variant="secondary" onClick={toggleSelfPaid}>
                Ik heb betaald
              </Button>
              <a href={paymentLink} target="_blank" rel="noopener noreferrer">
                <Button>
                  Betaal
                  <ExternalLink size={16} />
                </Button>
              </a>
            </>
          )}
        </div>
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
        {others.map((p) => {
          const total = splitTotals.find((s) => s.participantId === p.id);
          return (
            <li key={p.id} className="flex items-center justify-between text-sm">
              <span className="text-foreground">{p.name}</span>
              <span className="flex items-center gap-2">
                <span className="tabular-nums text-muted">
                  {formatCents(total?.totalCents ?? 0)}
                </span>
                {p.hasPaid ? (
                  <span className="flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                    <Check size={12} strokeWidth={3} />
                    Betaald
                  </span>
                ) : (
                  <span className="rounded-full bg-black/[0.04] px-2 py-0.5 text-xs text-muted">
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
