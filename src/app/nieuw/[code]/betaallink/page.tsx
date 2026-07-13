import { PageShell } from "@/components/ui/page-shell";
import { getDraftBillForEdit } from "@/lib/bills";
import { notFound } from "next/navigation";
import { publishBillAction } from "./actions";
import { PaymentForm } from "./payment-form";

export default async function BetaallinkPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ key?: string }>;
}) {
  const { code } = await params;
  const { key } = await searchParams;

  if (!key) notFound();
  const draft = await getDraftBillForEdit(code, key);
  if (!draft) notFound();

  return (
    <PageShell className="gap-6">
      <div>
        <div className="text-sm text-muted">Stap 2 van 2</div>
        <h1 className="text-xl font-semibold text-foreground">
          Hoe kunnen ze jou betalen?
        </h1>
        <p className="mt-1 text-[15px] text-muted">
          Afgetikt verwerkt zelf geen betalingen — iedereen betaalt
          rechtstreeks aan jou.
        </p>
      </div>

      <PaymentForm
        initialServiceCents={draft.bill.serviceCents}
        onSubmit={publishBillAction.bind(null, code, key)}
      />
    </PageShell>
  );
}
