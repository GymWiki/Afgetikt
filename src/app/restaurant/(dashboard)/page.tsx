import { formatCents } from "@/lib/money";
import { isAccessBlocked, trialDaysLeft } from "@/lib/billing";
import { staggerDelay } from "@/lib/motion";
import { getRecentBills, getRestaurantStats, requireCurrentRestaurant } from "@/lib/restaurants";
import { BadgeCheck, Hourglass, QrCode } from "lucide-react";
import Link from "next/link";
import { Paywall } from "./paywall";

export default async function DashboardHomePage() {
  const { restaurant } = await requireCurrentRestaurant();

  if (isAccessBlocked(restaurant)) {
    return <Paywall restaurantName={restaurant.name} />;
  }

  const [stats, recentBills] = await Promise.all([
    getRestaurantStats(restaurant.id),
    getRecentBills(restaurant.id),
  ]);

  const daysLeft = trialDaysLeft(restaurant);

  return (
    <div className="flex flex-col gap-8">
      <div className="animate-fade-up">
        <h1 className="text-xl font-semibold text-foreground">Overzicht</h1>
        <p className="mt-1 text-[15px] text-muted">
          Bonnetjes verwerkt via jouw QR-code.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Deze maand" value={String(stats.billsThisMonth)} index={0} />
        <StatCard label="Totaal gescand" value={String(stats.totalBills)} index={1} />
        <StatCard label="Verwerkt bedrag" value={formatCents(stats.totalCents)} index={2} />
        <StatCard label="Betalingen" value={String(stats.paidCount)} index={3} />
      </div>

      {restaurant.subscriptionStatus === "trialing" ? (
        <Link
          href="/restaurant/abonnement"
          className="flex animate-fade-up items-center gap-3 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-brand-400/40"
          style={staggerDelay(4, 60)}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Hourglass size={18} strokeWidth={2} />
          </div>
          <div>
            <div className="text-[15px] font-medium text-foreground">
              Nog {daysLeft} {daysLeft === 1 ? "dag" : "dagen"} proefperiode
            </div>
            <p className="text-sm text-muted">
              Kies een abonnement om zonder onderbreking door te gaan.
            </p>
          </div>
        </Link>
      ) : (
        <div
          className="flex animate-fade-up items-center gap-3 rounded-2xl border border-border bg-surface p-4"
          style={staggerDelay(4, 60)}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <BadgeCheck size={18} strokeWidth={2} />
          </div>
          <div>
            <div className="text-[15px] font-medium text-foreground">
              Abonnement actief
            </div>
            <p className="text-sm text-muted">
              {restaurant.subscriptionPlan === "yearly"
                ? "Jaarlijks abonnement"
                : "Maandelijks abonnement"}
              {restaurant.currentPeriodEnd &&
                ` — verlengt op ${restaurant.currentPeriodEnd.toLocaleDateString("nl-NL")}`}
            </p>
          </div>
        </div>
      )}

      {stats.totalBills === 0 ? (
        <div
          className="flex animate-fade-up flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface p-10 text-center"
          style={staggerDelay(5, 60)}
        >
          <div className="flex h-12 w-12 animate-pop items-center justify-center rounded-full bg-brand-50 text-brand-600">
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
            {recentBills.map((bill, index) => (
              <li
                key={bill.id}
                className="flex animate-fade-up items-center justify-between px-4 py-3.5"
                style={staggerDelay(index, 40)}
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

function StatCard({
  label,
  value,
  index,
}: {
  label: string;
  value: string;
  index: number;
}) {
  return (
    <div
      className="animate-fade-up rounded-2xl border border-border bg-surface p-4"
      style={staggerDelay(index, 60)}
    >
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 text-lg font-semibold tabular-nums text-foreground">
        {value}
      </div>
    </div>
  );
}
