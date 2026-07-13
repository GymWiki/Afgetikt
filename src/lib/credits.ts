import { and, eq, gt, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/db";
import { payerCredits } from "@/db/schema";
import { createSecretToken } from "@/lib/ids";

export const FREE_CREDITS = 3;

const DEVICE_COOKIE = "afgetikt_device";

/**
 * Alleen aan te roepen vanuit een Server Action of Route Handler (die mogen
 * cookies zetten). Maakt bij het eerste bezoek een nieuw, anoniem device-id
 * aan dat op dit apparaat blijft staan.
 */
export async function getOrCreateDeviceId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(DEVICE_COOKIE)?.value;
  if (existing) return existing;

  const id = createSecretToken();
  cookieStore.set(DEVICE_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365 * 2,
    path: "/",
  });
  return id;
}

// Weergavewaarde voor een apparaat met de eenmalige "pro"-aankoop: geen
// getal, dus Infinity zodat elke "<= 0"-check hier nooit op slaat.
export const UNLIMITED_CREDITS = Infinity;

/**
 * Alleen voor weergave (bv. "nog 2 gratis bonnen") vanuit een Server
 * Component. Zet geen cookie en maakt geen database-rij aan.
 */
export async function peekRemainingCredits(): Promise<number> {
  const cookieStore = await cookies();
  const deviceId = cookieStore.get(DEVICE_COOKIE)?.value;
  if (!deviceId) return FREE_CREDITS;

  const row = await db.query.payerCredits.findFirst({
    where: eq(payerCredits.deviceId, deviceId),
  });
  if (row?.unlimited) return UNLIMITED_CREDITS;
  return row?.credits ?? FREE_CREDITS;
}

/**
 * Trekt atomisch 1 credit af als er nog tegoed is (of doet niets bij
 * onbeperkt scannen). Retourneert het resterende aantal credits, ongeacht
 * of het gelukt is.
 */
export async function consumeCredit(
  deviceId: string,
): Promise<{ ok: boolean; remaining: number }> {
  await db
    .insert(payerCredits)
    .values({ deviceId })
    .onConflictDoNothing({ target: payerCredits.deviceId });

  const existing = await db.query.payerCredits.findFirst({
    where: eq(payerCredits.deviceId, deviceId),
  });
  if (existing?.unlimited) {
    return { ok: true, remaining: UNLIMITED_CREDITS };
  }

  const decremented = await db
    .update(payerCredits)
    .set({ credits: sql`${payerCredits.credits} - 1` })
    .where(and(eq(payerCredits.deviceId, deviceId), gt(payerCredits.credits, 0)))
    .returning({ credits: payerCredits.credits });

  if (decremented.length > 0) {
    return { ok: true, remaining: decremented[0].credits };
  }

  const current = await db.query.payerCredits.findFirst({
    where: eq(payerCredits.deviceId, deviceId),
  });
  return { ok: false, remaining: current?.credits ?? 0 };
}
