"use server";

import { createDraftBill } from "@/lib/bills";
import { consumeCredit, getOrCreateDeviceId, peekRemainingCredits } from "@/lib/credits";
import { parseReceiptImage, ReceiptParseError } from "@/lib/receipt-parser";
import { redirect } from "next/navigation";

export type ScanReceiptResult =
  | { ok: true; billId: string; managerToken: string }
  | { ok: false; error: string; outOfCredits?: boolean };

const OUT_OF_CREDITS_MESSAGE =
  "Je gratis bonnen zijn op. Scan de QR-code van een Afgetikt-restaurant voor een gratis bon — een betaalde versie voor eigen bonnen komt binnenkort.";

function readRestaurantId(formData: FormData): string | null {
  const raw = formData.get("restaurantId");
  return typeof raw === "string" && raw ? raw : null;
}

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

  const restaurantId = readRestaurantId(formData);

  if (!restaurantId && (await peekRemainingCredits()) <= 0) {
    return { ok: false, outOfCredits: true, error: OUT_OF_CREDITS_MESSAGE };
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
      {
        title: parsed.restaurantName,
        serviceCents: parsed.serviceCents,
        restaurantId,
      },
    );

    if (!restaurantId) {
      const deviceId = await getOrCreateDeviceId();
      await consumeCredit(deviceId);
    }

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

export async function startManualBillAction(formData: FormData) {
  const restaurantId = readRestaurantId(formData);

  if (!restaurantId && (await peekRemainingCredits()) <= 0) {
    redirect("/nieuw?outOfCredits=1");
  }

  const { billId, managerToken } = await createDraftBill([], { restaurantId });

  if (!restaurantId) {
    const deviceId = await getOrCreateDeviceId();
    await consumeCredit(deviceId);
  }

  redirect(`/nieuw/${billId}/controleren?key=${managerToken}`);
}
