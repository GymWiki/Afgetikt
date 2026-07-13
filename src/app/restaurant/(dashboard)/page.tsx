import { formatCents } from "@/lib/money";
import {
  getRecentBills,
  getRestaurantByOwner,
  getRestaurantStats,
} from "@/lib/restaurants";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { QrCode } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardHomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/restaurant/inloggen");

  const restaurant = await getRestaurantByOwner(user.id);
  if (!restaurant) redirect("/restaurant/registreren");

  const [stats, recentBills] = await Promise.all([
    getRestaurantStats(restaurant.id),
    getRecentBills(restaurant.id),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Overzicht</h1>
        <p className="mt-1 text-[15px] text-muted">
          Bonnetjes verwerkt via jouw QR-code.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Deze maand" value={String(stats.billsThisMonth)} />
        <StatCard label="Totaal" value={String(stats.totalBills)} />
        <StatCard label="Verwerkt bedrag" value={formatCents(stats.totalCents)} />
      </div>

      {stats.totalBills === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <QrCode size={22} strokeWidth={2} />
          </div>
          <div>
            <div className="text-[15px] font-medium text-foreground">
              Nog geen rekeningen verwerkt
            </div>
            <p className="mt-1 text-sm text-muted">
              Download je QR-code en zet hem op tafel om te beginnen.
            </p>
          </div>
          <Link
            href="/restaurant/qr"
            className="text-sm font-medium text-brand-600 underline underline-offset-4"
          >
            Naar je QR-code
          </Link>
        </div>
      ) : (
        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            Recente rekeningen
          </div>
          <ul className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-surface">
            {recentBills.map((bill) => (
              <li
                key={bill.id}
                className="flex items-center justify-between px-4 py-3.5"
              >
                <div>
                  <div className="text-[15px] font-medium text-foreground">
                    {bill.title ?? "Rekening"}
                  </div>
                  <div className="text-sm text-muted">
                    {bill.createdAt.toLocaleDateString("nl-NL", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <div className="text-sm text-muted">
                  {bill.payerName ?? ""}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 text-lg font-semibold tabular-nums text-foreground">
        {value}
      </div>
    </div>
  );
}
