"use client";

import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/ui/page-shell";
import { TriangleAlert } from "lucide-react";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageShell className="flex-1 items-center justify-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
        <TriangleAlert size={26} strokeWidth={2} />
      </div>
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Er ging iets mis
        </h1>
        <p className="mt-1 text-[15px] text-muted">
          Probeer het nog een keer. Blijft het misgaan, probeer dan de link
          opnieuw te openen.
        </p>
      </div>
      <Button variant="secondary" className="mt-2" onClick={reset}>
        Opnieuw proberen
      </Button>
    </PageShell>
  );
}
