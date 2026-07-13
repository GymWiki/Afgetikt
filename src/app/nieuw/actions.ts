"use server";

import { createDraftBill } from "@/lib/bills";
import { parseReceiptImage, ReceiptParseError } from "@/lib/receipt-parser";
import { redirect } from "next/navigation";

export type ScanReceiptResult =
  | { ok: true; billId: string; managerToken: string }
  | { ok: false; error: string };

export async function scanReceiptAction(
  formData: FormData,
): Promise<ScanReceiptResult> {
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Kies eerst een foto van de bon." };
  }
  if (file.size > 10 * 1024 * 1024) {
    return { ok: false, error: "De foto is te groot (max 10 MB)." };
  }

  const allowed = ["image/jpeg", "image/png", "image/webp"] as const;
  const mediaType = allowed.find((t) => t === file.type);
  if (!mediaType) {
    return { ok: false, error: "Gebruik een JPEG-, PNG- of WEBP-foto." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64Image = buffer.toString("base64");

  try {
    const parsed = await parseReceiptImage({ base64Image, mediaType });
    const { billId, managerToken } = await createDraftBill(
      parsed.items.map((item) => ({
        name: item.name,
        priceCents: item.priceCents,
        quantity: item.quantity,
      })),
      parsed.restaurantName,
      parsed.serviceCents,
    );
    return { ok: true, billId, managerToken };
  } catch (err) {
    if (err instanceof ReceiptParseError) {
      return { ok: false, error: err.message };
    }
    console.error("scanReceiptAction failed", err);
    return {
      ok: false,
      error: "Het lukte niet om de bon te lezen. Probeer het opnieuw.",
    };
  }
}

export async function startManualBillAction() {
  const { billId, managerToken } = await createDraftBill([], null);
  redirect(`/nieuw/${billId}/controleren?key=${managerToken}`);
}
