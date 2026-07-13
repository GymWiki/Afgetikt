import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

// bills.restaurantId blijft null voor niet-partnerrestaurants (bon buiten
// een QR-scan om verwerkt).
export const restaurants = pgTable("restaurants", {
  id: text("id").primaryKey(),
  // Supabase Auth user id (auth.users.id) van de restauranteigenaar.
  // Eén restaurant per account in deze versie — geen medewerkersbeheer.
  ownerUserId: text("owner_user_id").notNull().unique(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
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
  },
  (table) => [unique().on(table.itemId, table.participantId)],
);

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
