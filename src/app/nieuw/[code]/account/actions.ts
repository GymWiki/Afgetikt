"use server";

import { claimBill } from "@/lib/bills";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AccountGateResult =
  | { ok: true; needsEmailConfirmation: boolean }
  | { ok: false; error: string };

export async function signUpAndClaimBillAction(
  billId: string,
  managerToken: string,
  formData: FormData,
): Promise<AccountGateResult> {
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

  await claimBill(billId, managerToken, data.user.id);

  return { ok: true, needsEmailConfirmation: !data.session };
}

export async function logInAndClaimBillAction(
  billId: string,
  managerToken: string,
  formData: FormData,
): Promise<AccountGateResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, error: "Vul je e-mailadres en wachtwoord in." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.user) {
    return { ok: false, error: "E-mailadres of wachtwoord onjuist." };
  }

  await claimBill(billId, managerToken, data.user.id);

  return { ok: true, needsEmailConfirmation: false };
}
