"use client";

import { ButtonLink } from "@/components/ui/button";
import { CircleCheck, CircleX, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getCreditPurchaseStatusAction, type PurchaseStatus as Status } from "../actions";

const MAX_POLLS = 15;
const POLL_INTERVAL_MS = 2000;

export function PurchaseStatus({
  reference,
  initialStatus,
  packLabel,
}: {
  reference: string;
  initialStatus: Status;
  packLabel: string;
}) {
  const [status, setStatus] = useState<Status>(initialStatus);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (status !== "open" || attempts >= MAX_POLLS) return;
    const timer = setTimeout(async () => {
      const next = await getCreditPurchaseStatusAction(reference);
      setStatus(next);
      setAttempts((n) => n + 1);
    }, POLL_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [status, attempts, reference]);

  if (status === "paid") {
    return (
      <>
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <CircleCheck size={28} strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Betaling gelukt</h1>
          <p className="mt-1 text-[15px] text-muted">
            {packLabel} is toegevoegd aan dit apparaat. Je kunt direct verder.
          </p>
        </div>
        <ButtonLink href="/nieuw" size="lg" className="mt-2 w-full">
          Nieuwe rekening starten
        </ButtonLink>
      </>
    );
  }

  if (status === "failed" || attempts >= MAX_POLLS) {
    return (
      <>
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <CircleX size={28} strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Betaling niet gelukt
          </h1>
          <p className="mt-1 text-[15px] text-muted">
            Er is niets afgeschreven. Probeer het opnieuw.
          </p>
        </div>
        <ButtonLink href="/nieuw/credits" variant="secondary" className="mt-2 w-full">
          Terug naar pakketten
        </ButtonLink>
      </>
    );
  }

  return (
    <>
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <Loader2 size={28} strokeWidth={2} className="animate-spin" />
      </div>
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Betaling controleren…
        </h1>
        <p className="mt-1 text-[15px] text-muted">
          Dit duurt meestal een paar seconden.
        </p>
      </div>
    </>
  );
}
