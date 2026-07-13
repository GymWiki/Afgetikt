"use client";

import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import type { PublishResult } from "./actions";

export function PaymentForm({
  initialServiceCents,
  onSubmit,
}: {
  initialServiceCents: number;
  onSubmit: (formData: FormData) => Promise<PublishResult>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
          const result = await onSubmit(formData);
          if (!result.ok) setError(result.error);
        });
      }}
    >
      <div>
        <Label htmlFor="payerName">Jouw naam</Label>
        <Input
          id="payerName"
          name="payerName"
          placeholder="Bijv. Pieter"
          autoComplete="name"
          required
        />
      </div>

      <div>
        <Label htmlFor="paymentLink">Jouw betaalverzoek</Label>
        <Input
          id="paymentLink"
          name="paymentLink"
          placeholder="Plak hier de link, of het hele berichtje van je bank"
          autoComplete="off"
          required
        />
        <p className="mt-1.5 text-xs text-muted">
          Maak in je bank-app (Tikkie, ING, Rabobank, ABN AMRO, …) een
          betaalverzoek met een <strong>open bedrag</strong> — iedereen
          betaalt namelijk een ander bedrag. Plak daarna de link, of gewoon
          het hele gedeelde berichtje: Afgetikt haalt de link er zelf uit.
        </p>
      </div>

      <div>
        <Label htmlFor="service">Fooi / bediening (optioneel)</Label>
        <Input
          id="service"
          name="service"
          placeholder="0,00"
          inputMode="decimal"
          defaultValue={
            initialServiceCents > 0
              ? (initialServiceCents / 100).toFixed(2).replace(".", ",")
              : ""
          }
        />
        <p className="mt-1.5 text-xs text-muted">
          Wordt evenredig verdeeld over iedereen, naar rato van wat ze
          bestelden.
        </p>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Bezig…
          </>
        ) : (
          "Groepslink maken"
        )}
      </Button>
    </form>
  );
}
