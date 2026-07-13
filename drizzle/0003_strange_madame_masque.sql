CREATE TABLE "mollie_payments" (
	"id" text PRIMARY KEY NOT NULL,
	"mollie_payment_id" text,
	"kind" text NOT NULL,
	"device_id" text,
	"restaurant_id" text,
	"pack_type" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mollie_payments_mollie_payment_id_unique" UNIQUE("mollie_payment_id")
);
--> statement-breakpoint
ALTER TABLE "restaurants" DROP CONSTRAINT "restaurants_owner_user_id_unique";--> statement-breakpoint
ALTER TABLE "payer_credits" ADD COLUMN "unlimited" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "subscription_status" text DEFAULT 'trialing' NOT NULL;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "subscription_plan" text;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "trial_ends_at" timestamp with time zone DEFAULT (now() + interval '30 days') NOT NULL;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "mollie_customer_id" text;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "mollie_subscription_id" text;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "current_period_end" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "mollie_payments" ADD CONSTRAINT "mollie_payments_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE no action ON UPDATE no action;