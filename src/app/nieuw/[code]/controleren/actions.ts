"use server";

import { addBillItem, deleteBillItem, updateBillItem } from "@/lib/bills";
import { parseAmountToCents } from "@/lib/money";
import { revalidatePath } from "next/cache";

export type ItemActionResult = { ok: true } | { ok: false; error: string };

function parseItemForm(formData: FormData): {
  name: string;
  priceCents: number;
  quantity: number;
} | null {
  const name = String(formData.get("name") ?? "").trim();
  const priceCents = parseAmountToCents(String(formData.get("price") ?? ""));
  const quantityRaw = Number(formData.get("quantity") ?? "1");
  const quantity = Number.isFinite(quantityRaw)
    ? Math.max(1, Math.round(quantityRaw))
    : 1;

  if (!name || priceCents === null) return null;
  return { name, priceCents, quantity };
}

export async function addItemAction(
  billId: string,
  managerToken: string,
  formData: FormData,
): Promise<ItemActionResult> {
  const item = parseItemForm(formData);
  if (!item) return { ok: false, error: "Vul een naam en geldige prijs in." };

  const success = await addBillItem(billId, managerToken, item);
  if (!success) return { ok: false, error: "Kon product niet toevoegen." };

  revalidatePath(`/nieuw/${billId}/controleren`);
  return { ok: true };
}

export async function updateItemAction(
  billId: string,
  managerToken: string,
  itemId: string,
  formData: FormData,
): Promise<ItemActionResult> {
  const item = parseItemForm(formData);
  if (!item) return { ok: false, error: "Vul een naam en geldige prijs in." };

  const success = await updateBillItem(billId, managerToken, itemId, item);
  if (!success) return { ok: false, error: "Kon product niet bijwerken." };

  revalidatePath(`/nieuw/${billId}/controleren`);
  return { ok: true };
}

export async function deleteItemAction(
  billId: string,
  managerToken: string,
  itemId: string,
): Promise<ItemActionResult> {
  const success = await deleteBillItem(billId, managerToken, itemId);
  if (!success) return { ok: false, error: "Kon product niet verwijderen." };

  revalidatePath(`/nieuw/${billId}/controleren`);
  return { ok: true };
}
