import { PageShell } from "@/components/ui/page-shell";
import { claimBill, getDraftBillForEdit } from "@/lib/bills";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { AccountGateForm } from "./account-gate-form";

export default async function AccountGatePage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ key?: string; pid?: string; ptoken?: string }>;
}) {
  const { code } = await params;
  const { key, pid, ptoken } = await searchParams;
  if (!key || !pid || !ptoken) notFound();

  const draft = await getDraftBillForEdit(code, key);
  if (!draft) notFound();

  const klaarHref = `/nieuw/${code}/klaar?key=${key}&pid=${pid}&ptoken=${ptoken}`;

  // Al ingelogd (bv. tweede tabblad, of eerder deze sessie): meteen
  // koppelen en doorgaan, geen formulier nodig.
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    await claimBill(code, key, user.id);
    redirect(klaarHref);
  }

  return (
    <PageShell className="gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Bijna klaar{draft.bill.payerName ? `, ${draft.bill.payerName}` : ""}
        </h1>
        <p className="mt-1 text-[15px] text-muted">
          Maak een gratis account aan om je bonnen terug te zien en de status
          bij te houden. Daarna deel je meteen de link.
        </p>
      </div>

      <AccountGateForm billId={code} managerToken={key} klaarHref={klaarHref} />
    </PageShell>
  );
}
