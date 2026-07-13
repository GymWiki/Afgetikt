import { PageShell } from "@/components/ui/page-shell";
import { getOpenBillPublic } from "@/lib/bills";
import { notFound } from "next/navigation";
import { GroupBill } from "./group-bill";

export default async function GroupPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const data = await getOpenBillPublic(code);
  if (!data) notFound();

  const claimsByItem: Record<string, string[]> = {};
  for (const item of data.items) claimsByItem[item.id] = [];
  for (const claim of data.claims) {
    claimsByItem[claim.itemId]?.push(claim.participantId);
  }

  return (
    <PageShell className="gap-6">
      <GroupBill
        billId={code}
        title={data.bill.title}
        payerName={data.bill.payerName ?? ""}
        paymentLink={data.bill.paymentLink ?? ""}
        serviceCents={data.bill.serviceCents}
        items={data.items}
        initialParticipants={data.participants.map((p) => ({
          id: p.id,
          name: p.name,
          isPayer: p.isPayer,
          hasPaid: p.hasPaid,
        }))}
        initialClaimsByItem={claimsByItem}
      />
    </PageShell>
  );
}
