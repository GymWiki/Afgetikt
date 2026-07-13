import type { Payment } from "@mollie/api-client";
import { eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  molliePayments,
  payerCredits,
  restaurants,
  type MolliePaymentStatus,
} from "@/db/schema";
import { createSecretToken } from "@/lib/ids";
import {
  creditPacks,
  getMollieClient,
  restaurantPlans,
  webhookUrl,
  type CreditPackType,
  type RestaurantPlan,
} from "@/lib/mollie";

// Mollie stuurt alleen een payment-id, nooit de status zelf — je moet die
// altijd opnieuw bij Mollie ophalen. Zo kan de payload nooit vervalst
// worden om ten onrechte credits/abonnementen vrij te geven.
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const paymentId = formData.get("id");
  if (typeof paymentId !== "string" || !paymentId) {
    return NextResponse.json({ error: "missing id" }, { status: 400 });
  }

  const mollie = getMollieClient();
  const payment = await mollie.payments.get(paymentId);

  const row = await db.query.molliePayments.findFirst({
    where: eq(molliePayments.molliePaymentId, paymentId),
  });

  if (row) {
    await handleKnownPayment(row, payment);
  } else if (payment.subscriptionId) {
    await handleRecurringSubscriptionPayment(payment);
  }

  return NextResponse.json({ ok: true });
}

type MolliePaymentRow = typeof molliePayments.$inferSelect;

function toMollieStatus(status: string): MolliePaymentStatus | "open" {
  if (status === "paid") return "paid";
  if (status === "failed") return "failed";
  if (status === "canceled") return "canceled";
  if (status === "expired") return "expired";
  return "open";
}

async function handleKnownPayment(row: MolliePaymentRow, payment: Payment) {
  // Al verwerkt: webhooks kunnen meerdere keren voor dezelfde betaling
  // binnenkomen, dit maakt de hele afhandeling idempotent.
  if (row.status === "paid") return;

  const status = toMollieStatus(payment.status);
  if (status === "open") return;

  if (status === "paid") {
    if (row.kind === "credit_pack" && row.deviceId) {
      await grantCreditPack(row.deviceId, row.packType as CreditPackType);
    } else if (row.kind === "restaurant_subscription" && row.restaurantId) {
      await activateRestaurantSubscription(row, payment);
    }
  }

  await db
    .update(molliePayments)
    .set({ status })
    .where(eq(molliePayments.id, row.id));
}

async function grantCreditPack(deviceId: string, packType: CreditPackType) {
  const pack = creditPacks[packType];
  if (!pack) return;

  await db
    .insert(payerCredits)
    .values({ deviceId })
    .onConflictDoNothing({ target: payerCredits.deviceId });

  if (packType === "pro") {
    await db
      .update(payerCredits)
      .set({ unlimited: true })
      .where(eq(payerCredits.deviceId, deviceId));
  } else if (pack.credits) {
    await db
      .update(payerCredits)
      .set({ credits: sql`${payerCredits.credits} + ${pack.credits}` })
      .where(eq(payerCredits.deviceId, deviceId));
  }
}

async function activateRestaurantSubscription(
  row: MolliePaymentRow,
  payment: Payment,
) {
  const plan = row.packType as RestaurantPlan;
  const config = restaurantPlans[plan];
  if (!config || !row.restaurantId) return;

  const restaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.id, row.restaurantId),
  });
  if (!restaurant?.mollieCustomerId || !payment.mandateId) return;

  const mollie = getMollieClient();
  const subscription = await mollie.customerSubscriptions.create({
    customerId: restaurant.mollieCustomerId,
    amount: { currency: "EUR", value: (config.priceCents / 100).toFixed(2) },
    interval: config.interval,
    description: `Afgetikt voor restaurants — ${config.label} (${restaurant.name})`,
    webhookUrl: webhookUrl(),
    mandateId: payment.mandateId,
  });

  const periodEnd = new Date();
  if (plan === "monthly") periodEnd.setMonth(periodEnd.getMonth() + 1);
  else periodEnd.setFullYear(periodEnd.getFullYear() + 1);

  await db
    .update(restaurants)
    .set({
      subscriptionStatus: "active",
      subscriptionPlan: plan,
      mollieSubscriptionId: subscription.id,
      currentPeriodEnd: periodEnd,
    })
    .where(eq(restaurants.id, restaurant.id));
}

// Vervolgbetalingen van een lopend abonnement maakt Mollie zelf aan (niet
// via onze eigen actions), dus die hebben nog geen rij in mollie_payments —
// we herkennen ze via het subscriptionId en boeken de rij hier alsnog bij,
// zodat herhaalde webhooks ook hiervoor idempotent blijven.
async function handleRecurringSubscriptionPayment(payment: Payment) {
  if (!payment.subscriptionId) return;

  const existing = await db.query.molliePayments.findFirst({
    where: eq(molliePayments.molliePaymentId, payment.id),
  });
  if (existing && existing.status !== "open") return;

  const restaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.mollieSubscriptionId, payment.subscriptionId),
  });
  if (!restaurant) return;

  const plan = (restaurant.subscriptionPlan ?? "monthly") as RestaurantPlan;
  const status = toMollieStatus(payment.status);

  if (status === "paid") {
    const base =
      restaurant.currentPeriodEnd && restaurant.currentPeriodEnd.getTime() > Date.now()
        ? restaurant.currentPeriodEnd
        : new Date();
    const periodEnd = new Date(base);
    if (plan === "monthly") periodEnd.setMonth(periodEnd.getMonth() + 1);
    else periodEnd.setFullYear(periodEnd.getFullYear() + 1);

    await db
      .update(restaurants)
      .set({ subscriptionStatus: "active", currentPeriodEnd: periodEnd })
      .where(eq(restaurants.id, restaurant.id));
  } else if (status === "failed") {
    await db
      .update(restaurants)
      .set({ subscriptionStatus: "past_due" })
      .where(eq(restaurants.id, restaurant.id));
  }

  if (status === "open") return;

  if (existing) {
    await db.update(molliePayments).set({ status }).where(eq(molliePayments.id, existing.id));
  } else {
    await db.insert(molliePayments).values({
      id: createSecretToken(),
      molliePaymentId: payment.id,
      kind: "restaurant_subscription",
      restaurantId: restaurant.id,
      packType: plan,
      amountCents: Math.round(parseFloat(payment.amount.value) * 100),
      status,
    });
  }
}
