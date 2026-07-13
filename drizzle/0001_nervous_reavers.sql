ALTER TABLE "restaurants" ADD COLUMN "owner_user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "restaurants" ADD CONSTRAINT "restaurants_owner_user_id_unique" UNIQUE("owner_user_id");