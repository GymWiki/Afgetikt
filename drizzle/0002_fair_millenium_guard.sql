CREATE TABLE "payer_credits" (
	"device_id" text PRIMARY KEY NOT NULL,
	"credits" integer DEFAULT 3 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "item_claims" ADD COLUMN "quantity" integer DEFAULT 1 NOT NULL;