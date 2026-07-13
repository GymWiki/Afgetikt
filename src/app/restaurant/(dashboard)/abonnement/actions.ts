"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { molliePayments, restaurants } from "@/db/schema";
import { ensureMollieCustomer } from "@/lib/billing";
import { createSecretToken } from "@/lib/ids";
import { SequenceType } from "@mollie/api-client";
import {
  baseUrl,
  getMollieClient,
  restaurantPlans,
  type RestaurantPlan,
  webhookUrl,
} from "@/lib/mollie";
import { requireCurrentRestaurant } from "@/lib/restaurants";

export async function startSubscriptionAction(plan: RestaurantPlan) {
  const planConfig = restaurantPlans[plan];
  if (!planConfig) throw new Error("Onbekend abonnement.");

  const { user, restaurant } = await requireCurrentRestaurant();
  const customerId = await ensureMollieCustomer(restaurant, user.email ?? "");

  const reference = createSecretToken();
  await db.insert(molliePayments).values({
    id: reference,
    kind: "restaurant_subscription",
    restaurantId: restaurant.id,
    packType: plan,
    amountCents: planConfig.priceCents,
  });

  const mollie = getMollieClient();
  const payment = await mollie.payments.create({
    customerId,
    sequenceType: SequenceType.first,
    amount: { currency: "EUR", value: (planConfig.priceCents / 100).toFixed(2) },
    description: `Afgetikt voor restaurants — ${planConfig.label} (${restaurant.name})`,
    redirectUrl: `${baseUrl()}/restaurant/abonnement/gelukt?ref=${reference}`,
    webhookUrl: webhookUrl(),
    metadata: { reference },
  });

  await db
    .update(molliePayments)
    .set({ molliePaymentId: payment.id })
    .where(eq(molliePayments.id, reference));

  const checkoutUrl = payment.getCheckoutUrl();
  if (!checkoutUrl) throw new Error("Kon geen betaallink aanmaken.");
  redirect(checkoutUrl);
}

export async function cancelSubscriptionAction() {
  const { restaurant } = await requireCurrentRestaurant();

  if (restaurant.mollieCustomerId && restaurant.mollieSubscriptionId) {
    const mollie = getMollieClient();
    await mollie.customerSubscriptions
      .cancel(restaurant.mollieSubscriptionId, {
        customerId: restaurant.mollieCustomerId,
      })
      .catch(() => {
        // Al geannuleerd of niet meer te vinden bij Mollie: lokaal alsnog
        // als geannuleerd markeren, dat is de gewenste eindstatus.
      });
  }

  await db
    .update(restaurants)
    .set({ subscriptionStatus: "canceled" })
    .where(eq(restaurants.id, restaurant.id));

  revalidatePath("/restaurant/abonnement");
  revalidatePath("/restaurant");
}

export type PurchaseStatus = "open" | "paid" | "failed";

export async function getSubscriptionPurchaseStatusAction(
  reference: string,
): Promise<PurchaseStatus> {
  const row = await db.query.molliePayments.findFirst({
    where: eq(molliePayments.id, reference),
  });
  if (!row) return "failed";
  if (row.status === "paid") return "paid";
  if (row.status === "failed" || row.status === "canceled" || row.status === "expired") {
    return "failed";
  }
  return "open";
}
