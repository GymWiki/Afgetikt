import { PageShell } from "@/components/ui/page-shell";
import { ButtonLink } from "@/components/ui/button";
import { peekRemainingCredits } from "@/lib/credits";
import { ArrowLeft, TicketX } from "lucide-react";
import Link from "next/link";
import { ReceiptUploader } from "./receipt-uploader";
import { startManualBillAction } from "./actions";

// Bonherkenning via Claude Vision kan langer duren dan het standaard
// serverless-timeout; verruim dit voor de Server Action op deze pagina.
export const maxDuration = 60;

export default async function NieuwePage({
  searchParams,
}: {
  searchParams: Promise<{ restaurantId?: string }>;
}) {
  const { restaurantId } = await searchParams;
  const remainingCredits = restaurantId ? null : await peekRemainingCredits();
  const outOfCredits = remainingCredits !== null && remainingCredits <= 0;

  return (
    <PageShell className="gap-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Terug
      </Link>

      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Nieuwe rekening
        </h1>
        <p className="mt-1 text-[15px] text-muted">
          Afgetikt herkent automatisch de producten en prijzen op de bon.
        </p>
      </div>

      {outOfCredits ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-700">
            <TicketX size={22} strokeWidth={2} />
          </div>
          <div>
            <div className="text-[15px] font-medium text-foreground">
              Je gratis bonnen zijn op
            </div>
            <p className="mt-1 text-sm text-muted">
              Je hebt je 3 gratis bonnen gebruikt. Scan de QR-code van een
              Afgetikt-restaurant voor een gratis bon — een betaalde versie
              voor eigen bonnen komt binnenkort.
            </p>
          </div>
          <ButtonLink href="/" variant="secondary" className="mt-2">
            Naar de homepage
          </ButtonLink>
        </div>
      ) : (
        <>
          <ReceiptUploader restaurantId={restaurantId} />

          <form action={startManualBillAction} className="text-center">
            {restaurantId && (
              <input type="hidden" name="restaurantId" value={restaurantId} />
            )}
            <button
              type="submit"
              className="text-sm text-muted underline underline-offset-4 hover:text-foreground"
            >
              Liever zelf producten invoeren
            </button>
          </form>

          {remainingCredits !== null && (
            <p className="text-center text-xs text-muted">
              Nog {remainingCredits}{" "}
              {remainingCredits === 1 ? "gratis bon" : "gratis bonnen"} over.
              Via de QR-code van een restaurant is het altijd gratis.
            </p>
          )}
        </>
      )}
    </PageShell>
  );
}
