"use client";

import { Button } from "@/components/ui/button";
import { useState, useTransition } from "react";
import { cancelSubscriptionAction } from "./actions";

export function CancelButton() {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="w-fit text-sm text-muted underline underline-offset-4 hover:text-foreground"
      >
        Abonnement opzeggen
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5">
      <p className="text-[15px] text-foreground">
        Weet je het zeker? Je houdt toegang tot het einde van de huidige
        periode, daarna wordt niet meer geïncasseerd.
      </p>
      <div className="flex gap-3">
        <Button
          variant="secondary"
          onClick={() => setConfirming(false)}
          disabled={isPending}
        >
          Annuleren
        </Button>
        <Button
          variant="secondary"
          className="border-red-200 text-red-700 hover:bg-red-50"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await cancelSubscriptionAction();
              setConfirming(false);
            })
          }
        >
          {isPending ? "Bezig…" : "Ja, opzeggen"}
        </Button>
      </div>
    </div>
  );
}
