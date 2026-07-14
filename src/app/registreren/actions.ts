"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type RegisterResult =
  | { ok: true; needsEmailConfirmation: boolean }
  | { ok: false; error: string };

export async function registerAction(
  next: string,
  formData: FormData,
): Promise<RegisterResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || password.length < 8) {
    return {
      ok: false,
      error: "Vul een e-mailadres in en een wachtwoord van minimaal 8 tekens.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { ok: false, error: error.message };
  if (!data.user) return { ok: false, error: "Account aanmaken is niet gelukt." };

  if (!data.session) {
    return { ok: true, needsEmailConfirmation: true };
  }

  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");
}
