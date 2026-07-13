"use server";

import { addRestaurant, setActiveRestaurant } from "@/lib/restaurants";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/restaurant/inloggen");
}

export async function switchRestaurantAction(restaurantId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/restaurant/inloggen");

  await setActiveRestaurant(restaurantId);
  revalidatePath("/restaurant", "layout");
}

export type AddRestaurantResult = { ok: true } | { ok: false; error: string };

export async function addRestaurantAction(
  formData: FormData,
): Promise<AddRestaurantResult> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Vul een restaurantnaam in." };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Je bent niet ingelogd." };

  const restaurant = await addRestaurant(user.id, name);
  await setActiveRestaurant(restaurant.id);
  revalidatePath("/restaurant", "layout");
  return { ok: true };
}
