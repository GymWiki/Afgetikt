import { PageShell } from "@/components/ui/page-shell";
import { getBillForManager } from "@/lib/bills";
import { notFound } from "next/navigation";
import { ManagerDashboard } from "./manager-dashboard";

export default async function BeheerPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ key?: string }>;
}) {
  const { code } = await params;
  const { key } = await searchParams;
  if (!key) notFound();

  const data = await getBillForManager(code, key);
  if (!data) notFound();

  const claimsByItem: Record<string, string[]> = {};
  for (const item of data.items) claimsByItem[item.id] = [];
  for (const claim of data.claims) {
    claimsByItem[claim.itemId]?.push(claim.participantId);
  }

  return (
    <PageShell className="gap-6">
      <div>
        <div className="text-sm text-muted">{data.bill.title ?? "Rekening"}</div>
        <h1 className="text-xl font-semibold text-foreground">Jouw overzicht</h1>
      </div>

      <ManagerDashboard
        billId={code}
        managerToken={key}
        items={data.items}
        initialParticipants={data.participants.map((p) => ({
          id: p.id,
          name: p.name,
          isPayer: p.isPayer,
          hasPaid: p.hasPaid,
        }))}
        claimsByItem={claimsByItem}
        serviceCents={data.bill.serviceCents}
      />
    </PageShell>
  );
}
