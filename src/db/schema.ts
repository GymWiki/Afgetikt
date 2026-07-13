import { relations, sql } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

export const subscriptionStatusValues = [
  "trialing",
  "active",
  "past_due",
  "canceled",
] as const;
export type SubscriptionStatus = (typeof subscriptionStatusValues)[number];

export const subscriptionPlanValues = ["monthly", "yearly"] as const;
export type SubscriptionPlan = (typeof subscriptionPlanValues)[number];

// bills.restaurantId blijft null voor niet-partnerrestaurants (bon buiten
// een QR-scan om verwerkt).
export const restaurants = pgTable("restaurants", {
  id: text("id").primaryKey(),
  // Supabase Auth user id (auth.users.id) van de restauranteigenaar. Eén
  // account kan meerdere restaurants beheren, dus geen unique-constraint.
  ownerUserId: text("owner_user_id").notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  subscriptionStatus: text("subscription_status", {
    enum: subscriptionStatusValues,
  })
    .notNull()
    .default("trialing"),
  subscriptionPlan: text("subscription_plan", { enum: subscriptionPlanValues }),
  trialEndsAt: timestamp("trial_ends_at", { withTimezone: true })
    .notNull()
    .default(sql`(now() + interval '30 days')`),
  mollieCustomerId: text("mollie_customer_id"),
  mollieSubscriptionId: text("mollie_subscription_id"),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const billStatusValues = ["draft", "open"] as const;
export type BillStatus = (typeof billStatusValues)[number];

export const bills = pgTable("bills", {
  // Het id is tevens de publieke, niet-raadbare code in de deel-URL (/b/[id]).
  id: text("id").primaryKey(),
  // Los geheim nodig om bij /b/[id]/beheer te komen; nooit gedeeld met deelnemers.
  managerToken: text("manager_token").notNull().unique(),
  restaurantId: text("restaurant_id").references(() => restaurants.id),
  title: text("title"),
  payerName: text("payer_name"),
  paymentLink: text("payment_link"),
  serviceCents: integer("service_cents").notNull().default(0),
  status: text("status", { enum: billStatusValues })
    .notNull()
    .default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const billItems = pgTable("bill_items", {
  id: text("id").primaryKey(),
  billId: text("bill_id")
    .notNull()
    .references(() => bills.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  priceCents: integer("price_cents").notNull(),
  quantity: integer("quantity").notNull().default(1),
  position: integer("position").notNull().default(0),
});

export const participants = pgTable("participants", {
  id: text("id").primaryKey(),
  billId: text("bill_id")
    .notNull()
    .references(() => bills.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  // Geheim token, opgeslagen in localStorage van de deelnemer, om hun eigen
  // keuzes te mogen wijzigen zonder account.
  accessToken: text("access_token").notNull().unique(),
  isPayer: boolean("is_payer").notNull().default(false),
  hasPaid: boolean("has_paid").notNull().default(false),
  joinedAt: timestamp("joined_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const itemClaims = pgTable(
  "item_claims",
  {
    id: text("id").primaryKey(),
    itemId: text("item_id")
      .notNull()
      .references(() => billItems.id, { onDelete: "cascade" }),
    participantId: text("participant_id")
      .notNull()
      .references(() => participants.id, { onDelete: "cascade" }),
    // Hoeveel van item.quantity deze deelnemer claimt (bv. 2 van de 6
    // biertjes). Eén claimrij per (item, deelnemer)-combinatie.
    quantity: integer("quantity").notNull().default(1),
  },
  (table) => [unique().on(table.itemId, table.participantId)],
);

// Anonieme credit-tracking per apparaat (cookie), zodat een hoofdbetaler
// zonder account toch een gratis-tegoed heeft. QR-scans via een
// partnerrestaurant tellen hier niet tegen mee (altijd gratis voor de gast).
export const payerCredits = pgTable("payer_credits", {
  deviceId: text("device_id").primaryKey(),
  credits: integer("credits").notNull().default(3),
  // Eenmalige "pro"-aankoop (€7,99): voor altijd onbeperkt scannen op dit
  // apparaat, credits tellen dan niet meer mee.
  unlimited: boolean("unlimited").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const molliePaymentKindValues = [
  "credit_pack",
  "restaurant_subscription",
] as const;
export type MolliePaymentKind = (typeof molliePaymentKindValues)[number];

export const molliePaymentStatusValues = [
  "open",
  "paid",
  "failed",
  "canceled",
  "expired",
] as const;
export type MolliePaymentStatus = (typeof molliePaymentStatusValues)[number];

// Eigen boekhouding van Mollie-betalingen: nodig om webhooks idempotent te
// verwerken (Mollie kan dezelfde notificatie meerdere keren sturen) en om
// terug te vinden welk pakket/plan bij welke betaling hoort. We genereren
// zelf de primary key (vóórdat de Mollie-betaling bestaat) zodat de
// redirectUrl er al naar kan verwijzen; molliePaymentId volgt zodra Mollie
//'m teruggeeft.
export const molliePayments = pgTable("mollie_payments", {
  id: text("id").primaryKey(),
  molliePaymentId: text("mollie_payment_id").unique(),
  kind: text("kind", { enum: molliePaymentKindValues }).notNull(),
  deviceId: text("device_id"),
  restaurantId: text("restaurant_id").references(() => restaurants.id),
  packType: text("pack_type").notNull(),
  amountCents: integer("amount_cents").notNull(),
  status: text("status", { enum: molliePaymentStatusValues })
    .notNull()
    .default("open"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const billsRelations = relations(bills, ({ many, one }) => ({
  items: many(billItems),
  participants: many(participants),
  restaurant: one(restaurants, {
    fields: [bills.restaurantId],
    references: [restaurants.id],
  }),
}));

export const billItemsRelations = relations(billItems, ({ one, many }) => ({
  bill: one(bills, { fields: [billItems.billId], references: [bills.id] }),
  claims: many(itemClaims),
}));

export const participantsRelations = relations(
  participants,
  ({ one, many }) => ({
    bill: one(bills, {
      fields: [participants.billId],
      references: [bills.id],
    }),
    claims: many(itemClaims),
  }),
);

export const itemClaimsRelations = relations(itemClaims, ({ one }) => ({
  item: one(billItems, {
    fields: [itemClaims.itemId],
    references: [billItems.id],
  }),
  participant: one(participants, {
    fields: [itemClaims.participantId],
    references: [participants.id],
  }),
}));
