"use server";

import { renameRestaurant } from "@/lib/restaurants";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type UpdateNameResult = { ok: true } | { ok: false; error: string };

export async function updateRestaurantNameAction(
  restaurantId: string,
  formData: FormData,
): Promise<UpdateNameResult> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Vul een naam in." };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Je bent niet ingelogd." };

  const success = await renameRestaurant(user.id, restaurantId, name);
  if (!success) return { ok: false, error: "Opslaan is niet gelukt." };

  revalidatePath("/restaurant/instellingen");
  revalidatePath("/restaurant");
  return { ok: true };
}
