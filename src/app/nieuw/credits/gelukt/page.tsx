import { PageShell } from "@/components/ui/page-shell";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { molliePayments } from "@/db/schema";
import { creditPacks, type CreditPackType } from "@/lib/mollie";
import { notFound } from "next/navigation";
import { PurchaseStatus } from "./purchase-status";

export default async function CreditsGeluktPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  if (!ref) notFound();

  const row = await db.query.molliePayments.findFirst({
    where: eq(molliePayments.id, ref),
  });
  if (!row) notFound();

  const pack = creditPacks[row.packType as CreditPackType];

  return (
    <PageShell className="items-center gap-6 text-center">
      <PurchaseStatus
        reference={ref}
        initialStatus={
          row.status === "paid"
            ? "paid"
            : row.status === "open"
              ? "open"
              : "failed"
        }
        packLabel={pack?.label ?? "je pakket"}
      />
    </PageShell>
  );
}
