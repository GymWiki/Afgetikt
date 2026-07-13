"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { molliePayments } from "@/db/schema";
import { getOrCreateDeviceId } from "@/lib/credits";
import { createSecretToken } from "@/lib/ids";
import {
  baseUrl,
  creditPacks,
  type CreditPackType,
  getMollieClient,
  webhookUrl,
} from "@/lib/mollie";

export async function purchaseCreditsAction(packType: CreditPackType) {
  const pack = creditPacks[packType];
  if (!pack) throw new Error("Onbekend pakket.");

  const deviceId = await getOrCreateDeviceId();
  const reference = createSecretToken();

  await db.insert(molliePayments).values({
    id: reference,
    kind: "credit_pack",
    deviceId,
    packType,
    amountCents: pack.priceCents,
  });

  const mollie = getMollieClient();
  const payment = await mollie.payments.create({
    amount: { currency: "EUR", value: (pack.priceCents / 100).toFixed(2) },
    description: `Afgetikt — ${pack.label}`,
    redirectUrl: `${baseUrl()}/nieuw/credits/gelukt?ref=${reference}`,
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

export type PurchaseStatus = "open" | "paid" | "failed";

export async function getCreditPurchaseStatusAction(
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
