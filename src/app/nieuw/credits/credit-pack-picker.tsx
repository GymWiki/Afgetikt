"use client";

import { Button } from "@/components/ui/button";
import { creditPacks, type CreditPackType } from "@/lib/mollie";
import { formatCents } from "@/lib/money";
import { Check, Infinity as InfinityIcon, Ticket } from "lucide-react";
import { useState, useTransition } from "react";
import { purchaseCreditsAction } from "./actions";

const packOrder: CreditPackType[] = ["pack20", "pack100", "pro"];

export function CreditPackPicker() {
  const [pending, setPending] = useState<CreditPackType | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleBuy(packType: CreditPackType) {
    setError(null);
    setPending(packType);
    startTransition(async () => {
      try {
        await purchaseCreditsAction(packType);
      } catch {
        setError("Kon geen betaling starten. Probeer het nog eens.");
        setPending(null);
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {packOrder.map((packType) => {
        const pack = creditPacks[packType];
        const isPro = packType === "pro";
        return (
          <div
            key={packType}
            className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-5"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                {isPro ? (
                  <InfinityIcon size={18} strokeWidth={2} />
                ) : (
                  <Ticket size={18} strokeWidth={2} />
                )}
              </div>
              <div>
                <div className="text-[15px] font-semibold text-foreground">
                  {pack.label}
                </div>
                <p className="mt-0.5 text-sm text-muted">{pack.description}</p>
              </div>
            </div>
            <Button
              onClick={() => handleBuy(packType)}
              disabled={isPending}
              className="shrink-0"
            >
              {isPending && pending === packType
                ? "Bezig…"
                : formatCents(pack.priceCents)}
            </Button>
          </div>
        );
      })}

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-1 flex items-start gap-2 text-xs text-muted">
        <Check size={14} className="mt-0.5 shrink-0 text-brand-500" />
        Eenmalige betaling via Mollie. Credits blijven aan dit apparaat
        gekoppeld.
      </div>
    </div>
  );
}
