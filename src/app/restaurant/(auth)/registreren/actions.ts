"use server";

import { createRestaurant } from "@/lib/restaurants";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type RegisterResult =
  | { ok: true; needsEmailConfirmation: boolean }
  | { ok: false; error: string };

export async function registerRestaurantAction(
  formData: FormData,
): Promise<RegisterResult> {
  const restaurantName = String(formData.get("restaurantName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!restaurantName) {
    return { ok: false, error: "Vul de naam van je restaurant in." };
  }

  const supabase = await createSupabaseServerClient();

  const { data: existing } = await supabase.auth.getUser();
  let userId = existing.user?.id;

  if (!userId) {
    if (!email || password.length < 8) {
      return {
        ok: false,
        error: "Vul een e-mailadres in en een wachtwoord van minimaal 8 tekens.",
      };
    }
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { ok: false, error: error.message };
    if (!data.user) {
      return { ok: false, error: "Account aanmaken is niet gelukt." };
    }
    userId = data.user.id;

    if (!data.session) {
      // E-mailbevestiging staat aan: nog geen ingelogde sessie, maar de
      // restaurantnaam alvast koppelen aan het (onbevestigde) account.
      await createRestaurant(userId, restaurantName);
      return { ok: true, needsEmailConfirmation: true };
    }
  }

  await createRestaurant(userId, restaurantName);
  redirect("/restaurant");
}
