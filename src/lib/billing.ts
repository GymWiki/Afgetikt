import { eq } from "drizzle-orm";
import { db } from "@/db";
import type { restaurants } from "@/db/schema";
import { restaurants as restaurantsTable } from "@/db/schema";
import { getMollieClient } from "@/lib/mollie";

type RestaurantRow = typeof restaurants.$inferSelect;

// Toegang is geblokkeerd zodra de proefperiode of betaalde periode voorbij
// is en er geen actief abonnement is. Bij 'past_due' (mislukte incasso)
// blijft toegang bestaan tot het einde van de al betaalde periode — pas
// daarna slaat de betaalmuur dicht.
export function isAccessBlocked(restaurant: RestaurantRow): boolean {
  if (restaurant.subscriptionStatus === "active") return false;

  if (restaurant.subscriptionStatus === "trialing") {
    return restaurant.trialEndsAt.getTime() < Date.now();
  }

  if (restaurant.currentPeriodEnd) {
    return restaurant.currentPeriodEnd.getTime() < Date.now();
  }
  return true;
}

export function trialDaysLeft(restaurant: RestaurantRow): number {
  const ms = restaurant.trialEndsAt.getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

// Maakt (indien nodig) een Mollie-klant voor dit restaurant aan en slaat
// het klant-id op, zodat er maar één Mollie-klant per restaurant bestaat.
export async function ensureMollieCustomer(
  restaurant: RestaurantRow,
  email: string,
): Promise<string> {
  if (restaurant.mollieCustomerId) return restaurant.mollieCustomerId;

  const mollie = getMollieClient();
  const customer = await mollie.customers.create({
    name: restaurant.name,
    email,
  });

  await db
    .update(restaurantsTable)
    .set({ mollieCustomerId: customer.id })
    .where(eq(restaurantsTable.id, restaurant.id));

  return customer.id;
}
