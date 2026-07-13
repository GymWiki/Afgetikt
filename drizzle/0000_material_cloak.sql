CREATE TABLE "bill_items" (
	"id" text PRIMARY KEY NOT NULL,
	"bill_id" text NOT NULL,
	"name" text NOT NULL,
	"price_cents" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bills" (
	"id" text PRIMARY KEY NOT NULL,
	"manager_token" text NOT NULL,
	"restaurant_id" text,
	"title" text,
	"payer_name" text,
	"payment_link" text,
	"service_cents" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bills_manager_token_unique" UNIQUE("manager_token")
);
--> statement-breakpoint
CREATE TABLE "item_claims" (
	"id" text PRIMARY KEY NOT NULL,
	"item_id" text NOT NULL,
	"participant_id" text NOT NULL,
	CONSTRAINT "item_claims_item_id_participant_id_unique" UNIQUE("item_id","participant_id")
);
--> statement-breakpoint
CREATE TABLE "participants" (
	"id" text PRIMARY KEY NOT NULL,
	"bill_id" text NOT NULL,
	"name" text NOT NULL,
	"access_token" text NOT NULL,
	"is_payer" boolean DEFAULT false NOT NULL,
	"has_paid" boolean DEFAULT false NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "participants_access_token_unique" UNIQUE("access_token")
);
--> statement-breakpoint
CREATE TABLE "restaurants" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "restaurants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "bill_items" ADD CONSTRAINT "bill_items_bill_id_bills_id_fk" FOREIGN KEY ("bill_id") REFERENCES "public"."bills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bills" ADD CONSTRAINT "bills_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_claims" ADD CONSTRAINT "item_claims_item_id_bill_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."bill_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_claims" ADD CONSTRAINT "item_claims_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_bill_id_bills_id_fk" FOREIGN KEY ("bill_id") REFERENCES "public"."bills"("id") ON DELETE cascade ON UPDATE no action;