CREATE INDEX "bill_items_bill_id_idx" ON "bill_items" USING btree ("bill_id");--> statement-breakpoint
CREATE INDEX "bills_restaurant_id_idx" ON "bills" USING btree ("restaurant_id");--> statement-breakpoint
CREATE INDEX "bills_owner_user_id_idx" ON "bills" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "participants_bill_id_idx" ON "participants" USING btree ("bill_id");--> statement-breakpoint
CREATE INDEX "restaurants_owner_user_id_idx" ON "restaurants" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "restaurants_mollie_subscription_id_idx" ON "restaurants" USING btree ("mollie_subscription_id");