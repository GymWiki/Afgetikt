"use client";

import { Button } from "@/components/ui/button";
import { formatCents } from "@/lib/money";
import { calculateSplit, type SplitItem } from "@/lib/split";
import { Check, Copy } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { togglePaidAction } from "./actions";

type Participant = {
  id: string;
  name: string;
  isPayer: boolean;
  hasPaid: boolean;
};

export function ManagerDashboard({
  billId,
  managerToken,
  items,
  initialParticipants,
  claimsByItem,
  serviceCents,
}: {
  billId: string;
  managerToken: string;
  items: { id: string; name: string; priceCents: number }[];
  initialParticipants: Participant[];
  claimsByItem: Record<string, string[]>;
  serviceCents: number;
}) {
  const [participants, setParticipants] = useState(initialParticipants);
  const [copied, setCopied] = useState(false);
  const [, startTransition] = useTransition();

  const split = useMemo(() => {
    const splitItems: SplitItem[] = items.map((item) => ({
      id: item.id,
      priceCents: item.priceCents,
      claimedByParticipantIds: claimsByItem[item.id] ?? [],
    }));
    return calculateSplit(splitItems, participants, serviceCents);
  }, [items, claimsByItem, participants, serviceCents]);

  const others = participants.filter((p) => !p.isPayer);
  const paidCount = others.filter((p) => p.hasPaid).length;
  const receivedCents = split.perParticipant
    .filter((p) => others.some((o) => o.id === p.participantId && o.hasPaid))
    .reduce((sum, p) => sum + p.totalCents, 0);

  function toggle(participantId: string, next: boolean) {
    setParticipants((prev) =>
      prev.map((p) => (p.id === participantId ? { ...p, hasPaid: next } : p)),
    );
    startTransition(async () => {
      const ok = await togglePaidAction(billId, managerToken, participantId, next);
      if (!ok) {
        setParticipants((prev) =>
          prev.map((p) =>
            p.id === participantId ? { ...p, hasPaid: !next } : p,
          ),
        );
      }
    });
  }

  async function copyLink() {
    await navigator.clipboard.writeText(`${window.location.origin}/b/${billId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="text-xs text-muted">Ontvangen</div>
          <div className="text-lg font-semibold tabular-nums text-foreground">
            {formatCents(receivedCents)}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="text-xs text-muted">Betaald</div>
          <div className="text-lg font-semibold tabular-nums text-foreground">
            {paidCount} / {others.length}
          </div>
        </div>
      </div>

      {split.unclaimedCents > 0 && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Er is nog {formatCents(split.unclaimedCents)} aan producten door
          niemand gekozen.
        </p>
      )}

      <div>
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
          Deelnemers
        </div>
        <ul className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-surface">
          {others.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-muted">
              Nog niemand heeft de link geopend.
            </li>
          )}
          {others.map((p) => {
            const total = split.perParticipant.find(
              (s) => s.participantId === p.id,
            );
            return (
              <li key={p.id} className="flex items-center gap-3 px-4 py-3.5">
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-medium text-foreground">
                    {p.name}
                  </div>
                  <div className="text-sm tabular-nums text-muted">
                    {formatCents(total?.totalCents ?? 0)}
                  </div>
                </div>
                <button
                  onClick={() => toggle(p.id, !p.hasPaid)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    p.hasPaid
                      ? "bg-brand-500 text-white"
                      : "bg-red-50 text-red-700 hover:bg-red-100"
                  }`}
                >
                  {p.hasPaid && <Check size={14} strokeWidth={3} />}
                  {p.hasPaid ? "Betaald" : "Nog niet"}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <Button variant="secondary" onClick={copyLink}>
        {copied ? <Check size={18} /> : <Copy size={18} />}
        {copied ? "Gekopieerd" : "Kopieer groepslink"}
      </Button>
    </div>
  );
}
