"use client";

import { Button } from "@/components/ui/button";
import { restaurantPlans, type RestaurantPlan } from "@/lib/mollie";
import { formatCents } from "@/lib/money";
import { staggerDelay } from "@/lib/motion";
import { Check } from "lucide-react";
import { useState, useTransition } from "react";
import { startSubscriptionAction } from "./actions";

const planOrder: RestaurantPlan[] = ["monthly", "yearly"];

export function PlanPicker() {
  const [pending, setPending] = useState<RestaurantPlan | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handlePick(plan: RestaurantPlan) {
    setError(null);
    setPending(plan);
    startTransition(async () => {
      try {
        await startSubscriptionAction(plan);
      } catch {
        setError("Kon geen betaling starten. Probeer het nog eens.");
        setPending(null);
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {planOrder.map((plan, index) => {
        const config = restaurantPlans[plan];
        return (
          <div
            key={plan}
            className="flex animate-fade-up items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-5"
            style={staggerDelay(index, 80)}
          >
            <div>
              <div className="text-[15px] font-semibold text-foreground">
                {config.label}
              </div>
              <p className="mt-0.5 text-sm text-muted">{config.description}</p>
            </div>
            <Button
              onClick={() => handlePick(plan)}
              disabled={isPending}
              className="shrink-0"
            >
              {isPending && pending === plan
                ? "Bezig…"
                : formatCents(config.priceCents)}
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
        Automatische incasso via Mollie. Elke maand opzegbaar.
      </div>
    </div>
  );
}
