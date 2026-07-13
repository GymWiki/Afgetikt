"use server";

import { publishBill } from "@/lib/bills";
import { parseAmountToCents } from "@/lib/money";
import { redirect } from "next/navigation";

export type PublishResult = { ok: true } | { ok: false; error: string };

function looksLikeUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

// Sommige banken sturen een hele zin met de link erin, bv.
// "Betaal Jan voor eten https://tikkie.me/pay/xyz". Haal de link eruit
// zodat gebruikers niet zelf hoeven te knippen.
function extractPaymentUrl(input: string): string | null {
  const match = input.match(/https?:\/\/\S+/i);
  if (!match) return null;
  const candidate = match[0].replace(/[.,;:!?)\]'"]+$/, "");
  return looksLikeUrl(candidate) ? candidate : null;
}

export async function publishBillAction(
  billId: string,
  managerToken: string,
  formData: FormData,
): Promise<PublishResult> {
  const payerName = String(formData.get("payerName") ?? "").trim();
  const paymentInput = String(formData.get("paymentLink") ?? "").trim();
  const serviceInput = String(formData.get("service") ?? "").trim();

  if (!payerName) {
    return { ok: false, error: "Vul je naam in." };
  }

  const paymentLink = looksLikeUrl(paymentInput)
    ? paymentInput
    : extractPaymentUrl(paymentInput);
  if (!paymentLink) {
    return {
      ok: false,
      error:
        "Kon geen link vinden. Plak de betaalverzoek-link, of het hele berichtje van je bank waar de link in staat.",
    };
  }

  const serviceCents =
    serviceInput === "" ? 0 : (parseAmountToCents(serviceInput) ?? 0);

  const result = await publishBill(billId, managerToken, {
    payerName,
    paymentLink,
    serviceCents,
  });
  if (!result) {
    return { ok: false, error: "Deze rekening kon niet worden gepubliceerd." };
  }

  redirect(
    `/nieuw/${billId}/klaar?key=${managerToken}&pid=${result.payerId}&ptoken=${result.payerAccessToken}`,
  );
}
