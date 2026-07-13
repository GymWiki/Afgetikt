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

export async function publishBillAction(
  billId: string,
  managerToken: string,
  formData: FormData,
): Promise<PublishResult> {
  const payerName = String(formData.get("payerName") ?? "").trim();
  const paymentLink = String(formData.get("paymentLink") ?? "").trim();
  const serviceInput = String(formData.get("service") ?? "").trim();

  if (!payerName) {
    return { ok: false, error: "Vul je naam in." };
  }
  if (!paymentLink || !looksLikeUrl(paymentLink)) {
    return {
      ok: false,
      error: "Voer een geldige betaalverzoek-link in (begint met https://).",
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
