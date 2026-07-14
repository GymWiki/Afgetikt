import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { getBillsForOwner, type OwnerBillSummary } from "@/lib/bills";
import { formatCents } from "@/lib/money";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Camera, CircleCheck, Receipt } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "./actions";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/inloggen?next=/dashboard");

  const bills = await getBillsForOwner(user.id);

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <Link href="/">
            <Logo size="sm" />
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-sm text-muted underline underline-offset-4 hover:text-foreground"
            >
              Uitloggen
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-5 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Jouw bonnen
            </h1>
            <p className="mt-1 text-[15px] text-muted">{user.email}</p>
          </div>
          <ButtonLink href="/nieuw" size="lg" className="sm:w-auto">
            <Camera size={18} strokeWidth={2} />
            Nieuwe rekening scannen
          </ButtonLink>
        </div>

        {bills.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <Receipt size={22} strokeWidth={2} />
            </div>
            <div>
              <div className="text-[15px] font-medium text-foreground">
                Nog geen bonnen
              </div>
              <p className="mt-1 text-sm text-muted">
                Scan je eerste bon en zie hem hier terug, met de status van
                wie er al betaald heeft.
              </p>
            </div>
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-surface">
            {bills.map((bill) => (
              <BillRow key={bill.id} bill={bill} />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

function BillRow({ bill }: { bill: OwnerBillSummary }) {
  const allPaid = bill.participantCount > 0 && bill.paidCount === bill.participantCount;

  return (
    <li>
      <Link
        href={`/b/${bill.id}/beheer?key=${bill.managerToken}`}
        className="flex items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-brand-50/40"
      >
        <div>
          <div className="text-[15px] font-medium text-foreground">
            {bill.title ?? "Rekening"}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-sm text-muted">
            {bill.createdAt.toLocaleDateString("nl-NL", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
            <span aria-hidden="true">·</span>
            {bill.participantCount === 0 ? (
              "Wacht op deelnemers"
            ) : allPaid ? (
              <span className="inline-flex items-center gap-1 text-brand-600">
                <CircleCheck size={14} strokeWidth={2} />
                Iedereen heeft betaald
              </span>
            ) : (
              `${bill.paidCount}/${bill.participantCount} betaald`
            )}
          </div>
        </div>
        <div className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
          {formatCents(bill.totalCents)}
        </div>
      </Link>
    </li>
  );
}
