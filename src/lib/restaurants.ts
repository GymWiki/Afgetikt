import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { bills, restaurants } from "@/db/schema";
import { createBillId } from "@/lib/ids";

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

export async function createRestaurant(ownerUserId: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Restaurantnaam is verplicht.");

  const existing = await db.query.restaurants.findFirst({
    where: eq(restaurants.ownerUserId, ownerUserId),
  });
  if (existing) return existing;

  const slug = await uniqueSlug(trimmed);
  const id = createBillId();
  const [restaurant] = await db
    .insert(restaurants)
    .values({ id, ownerUserId, name: trimmed, slug })
    .returning();
  return restaurant;
}

export async function getRestaurantByOwner(ownerUserId: string) {
  return db.query.restaurants.findFirst({
    where: eq(restaurants.ownerUserId, ownerUserId),
  });
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

  // Per-bill totaal (items + service) eerst apart optellen, en dan pas
  // over bills sommeren — direct joinen zou het servicebedrag per item
  // laten vermenigvuldigen ("fan-out").
  const result = await db.execute<{
    bill_count: number;
    bills_this_month: number;
    total_cents: number;
  }>(sql`
    select
      count(*)::int as bill_count,
      count(*) filter (where b.created_at >= ${startOfMonthIso})::int as bills_this_month,
      coalesce(sum(b.service_cents + coalesce(items.subtotal_cents, 0)), 0)::int as total_cents
    from ${bills} b
    left join lateral (
      select sum(price_cents) as subtotal_cents
      from bill_items
      where bill_items.bill_id = b.id
    ) items on true
    where b.restaurant_id = ${restaurantId} and b.status = 'open'
  `);

  const row = result[0];
  return {
    totalBills: row?.bill_count ?? 0,
    billsThisMonth: row?.bills_this_month ?? 0,
    totalCents: row?.total_cents ?? 0,
  };
}

export async function getRecentBills(restaurantId: string, limit = 10) {
  return db.query.bills.findMany({
    where: and(eq(bills.restaurantId, restaurantId), eq(bills.status, "open")),
    orderBy: (t, { desc }) => desc(t.createdAt),
    limit,
  });
}
