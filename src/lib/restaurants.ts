import { and, eq, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { bills, restaurants } from "@/db/schema";
import { createBillId } from "@/lib/ids";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const ACTIVE_RESTAURANT_COOKIE = "afgetikt_active_restaurant";

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "restaurant"
  );
}

async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name);
  let candidate = base;
  let attempt = 0;
  while (await db.query.restaurants.findFirst({ where: eq(restaurants.slug, candidate) })) {
    attempt += 1;
    candidate = `${base}-${attempt + 1}`;
  }
  return candidate;
}

async function insertRestaurant(ownerUserId: string, trimmedName: string) {
  const slug = await uniqueSlug(trimmedName);
  const id = createBillId();
  const [restaurant] = await db
    .insert(restaurants)
    .values({ id, ownerUserId, name: trimmedName, slug })
    .returning();
  return restaurant;
}

// Alleen voor de registratieflow: idempotent, zodat een dubbele
// formulier-submit tijdens signup geen duplicaat restaurant aanmaakt.
export async function createRestaurant(ownerUserId: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Restaurantnaam is verplicht.");

  const existing = await db.query.restaurants.findFirst({
    where: eq(restaurants.ownerUserId, ownerUserId),
  });
  if (existing) return existing;

  return insertRestaurant(ownerUserId, trimmed);
}

// Alle restaurants van dit account, oudste (= eerst aangemaakt) eerst.
export async function getRestaurantsByOwner(ownerUserId: string) {
  return db.query.restaurants.findMany({
    where: eq(restaurants.ownerUserId, ownerUserId),
    orderBy: (t, { asc }) => asc(t.createdAt),
  });
}

// Voegt een extra restaurant toe aan een bestaand account. In tegenstelling
// tot createRestaurant() is dit nooit idempotent: elke aanroep maakt een
// nieuw restaurant aan (één account kan er meerdere beheren).
export async function addRestaurant(ownerUserId: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Restaurantnaam is verplicht.");
  return insertRestaurant(ownerUserId, trimmed);
}

// Het restaurant dat nu actief staat voor dit account: het restaurant uit de
// keuze-cookie als dat nog bij dit account hoort, anders het oudste
// restaurant. Retourneert null als het account nog geen restaurant heeft.
export async function getCurrentRestaurant(ownerUserId: string) {
  const list = await getRestaurantsByOwner(ownerUserId);
  if (list.length === 0) return null;

  const cookieStore = await cookies();
  const activeId = cookieStore.get(ACTIVE_RESTAURANT_COOKIE)?.value;
  return list.find((r) => r.id === activeId) ?? list[0];
}

// Alleen aan te roepen vanuit een Server Action of Route Handler.
export async function setActiveRestaurant(restaurantId: string) {
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_RESTAURANT_COOKIE, restaurantId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
}

// Gedeelde guard voor elke restaurant-dashboardpagina: haalt de ingelogde
// gebruiker en zijn actieve restaurant op, of stuurt door als een van beide
// ontbreekt.
export async function requireCurrentRestaurant() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/restaurant/inloggen");

  const list = await getRestaurantsByOwner(user.id);
  if (list.length === 0) redirect("/restaurant/registreren");

  const cookieStore = await cookies();
  const activeId = cookieStore.get(ACTIVE_RESTAURANT_COOKIE)?.value;
  const restaurant = list.find((r) => r.id === activeId) ?? list[0];

  return { user, restaurant, restaurants: list };
}

export async function getRestaurantBySlug(slug: string) {
  return db.query.restaurants.findFirst({
    where: eq(restaurants.slug, slug),
  });
}

export async function renameRestaurant(
  ownerUserId: string,
  restaurantId: string,
  name: string,
) {
  const trimmed = name.trim();
  if (!trimmed) return false;
  const result = await db
    .update(restaurants)
    .set({ name: trimmed })
    .where(and(eq(restaurants.id, restaurantId), eq(restaurants.ownerUserId, ownerUserId)))
    .returning({ id: restaurants.id });
  return result.length > 0;
}

export async function getRestaurantStats(restaurantId: string) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  // postgres-js kan een raw Date niet als sql-parameter serialiseren in een
  // db.execute(sql`...`)-template; wel als ISO-string.
  const startOfMonthIso = startOfMonth.toISOString();

  // Per-bill totaal (items + service) en betaalde-deelnemers apart optellen
  // via lateral subqueries, en dan pas over bills sommeren — direct joinen
  // zou beide laten vermenigvuldigen ("fan-out").
  const result = await db.execute<{
    bill_count: number;
    bills_this_month: number;
    total_cents: number;
    paid_count: number;
  }>(sql`
    select
      count(*)::int as bill_count,
      count(*) filter (where b.created_at >= ${startOfMonthIso})::int as bills_this_month,
      coalesce(sum(b.service_cents + coalesce(items.subtotal_cents, 0)), 0)::int as total_cents,
      coalesce(sum(paid.paid_count), 0)::int as paid_count
    from ${bills} b
    left join lateral (
      select sum(price_cents) as subtotal_cents
      from bill_items
      where bill_items.bill_id = b.id
    ) items on true
    left join lateral (
      select count(*) as paid_count
      from participants
      where participants.bill_id = b.id
        and participants.has_paid
        and not participants.is_payer
    ) paid on true
    where b.restaurant_id = ${restaurantId} and b.status = 'open'
  `);

  const row = result[0];
  return {
    totalBills: row?.bill_count ?? 0,
    billsThisMonth: row?.bills_this_month ?? 0,
    totalCents: row?.total_cents ?? 0,
    paidCount: row?.paid_count ?? 0,
  };
}

export async function getRecentBills(restaurantId: string, limit = 10) {
  return db.query.bills.findMany({
    where: and(eq(bills.restaurantId, restaurantId), eq(bills.status, "open")),
    orderBy: (t, { desc }) => desc(t.createdAt),
    limit,
  });
}
