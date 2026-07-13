import { eq } from "drizzle-orm";
import { db } from "@/db";
import { molliePayments } from "@/db/schema";
import { restaurantPlans, type RestaurantPlan } from "@/lib/mollie";
import { notFound } from "next/navigation";
import { PurchaseStatus } from "./purchase-status";

export default async function AbonnementGeluktPage({
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

  const plan = restaurantPlans[row.packType as RestaurantPlan];

  return (
    <div className="flex flex-col items-center gap-6 py-8 text-center">
      <PurchaseStatus
        reference={ref}
        initialStatus={
          row.status === "paid"
            ? "paid"
            : row.status === "open"
              ? "open"
              : "failed"
        }
        planLabel={plan?.label ?? "je abonnement"}
      />
    </div>
  );
}
