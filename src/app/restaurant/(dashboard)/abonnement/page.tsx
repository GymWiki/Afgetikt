import { isAccessBlocked, trialDaysLeft } from "@/lib/billing";
import { requireCurrentRestaurant } from "@/lib/restaurants";
import { BadgeCheck, CircleAlert, Hourglass } from "lucide-react";
import { PlanPicker } from "./plan-picker";
import { CancelButton } from "./cancel-button";

export default async function AbonnementPage() {
  const { restaurant } = await requireCurrentRestaurant();
  const blocked = isAccessBlocked(restaurant);
  const daysLeft = trialDaysLeft(restaurant);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Abonnement</h1>
        <p className="mt-1 text-[15px] text-muted">
          {restaurant.name} — €19,99 per maand of €190 per jaar, per
          restaurant.
        </p>
      </div>

      <StatusCard
        status={restaurant.subscriptionStatus}
        blocked={blocked}
        daysLeft={daysLeft}
        plan={restaurant.subscriptionPlan}
        periodEnd={restaurant.currentPeriodEnd}
      />

      {restaurant.subscriptionStatus !== "active" && (
        <div>
          <div className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
            Kies een plan
          </div>
          <PlanPicker />
        </div>
      )}

      {restaurant.subscriptionStatus === "active" && (
        <CancelButton />
      )}
    </div>
  );
}

function StatusCard({
  status,
  blocked,
  daysLeft,
  plan,
  periodEnd,
}: {
  status: string;
  blocked: boolean;
  daysLeft: number;
  plan: string | null;
  periodEnd: Date | null;
}) {
  if (status === "active") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <BadgeCheck size={20} strokeWidth={2} />
        </div>
        <div>
          <div className="text-[15px] font-semibold text-foreground">
            Actief — {plan === "yearly" ? "jaarlijks" : "maandelijks"}
          </div>
          {periodEnd && (
            <p className="text-sm text-muted">
              Verlengt automatisch op{" "}
              {periodEnd.toLocaleDateString("nl-NL", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              .
            </p>
          )}
        </div>
      </div>
    );
  }

  if (status === "canceled") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-700">
          <CircleAlert size={20} strokeWidth={2} />
        </div>
        <div>
          <div className="text-[15px] font-semibold text-foreground">
            Opgezegd
          </div>
          <p className="text-sm text-muted">
            {periodEnd && !blocked
              ? `Je houdt toegang tot ${periodEnd.toLocaleDateString("nl-NL")}.`
              : "Kies een nieuw plan om weer toegang te krijgen."}
          </p>
        </div>
      </div>
    );
  }

  if (status === "past_due") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
          <CircleAlert size={20} strokeWidth={2} />
        </div>
        <div>
          <div className="text-[15px] font-semibold text-foreground">
            Betaling mislukt
          </div>
          <p className="text-sm text-muted">
            De laatste incasso is niet gelukt. Kies hieronder opnieuw een
            plan om je toegang te behouden.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <Hourglass size={20} strokeWidth={2} />
      </div>
      <div>
        <div className="text-[15px] font-semibold text-foreground">
          {blocked
            ? "Proefperiode verlopen"
            : `Proefperiode — nog ${daysLeft} ${daysLeft === 1 ? "dag" : "dagen"}`}
        </div>
        <p className="text-sm text-muted">
          {blocked
            ? "Kies hieronder een plan om verder te gaan."
            : "Kies alvast een plan, of gebruik de resterende proefdagen."}
        </p>
      </div>
    </div>
  );
}
