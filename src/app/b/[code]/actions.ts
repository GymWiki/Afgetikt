"use server";

import { joinBill, setItemClaimQuantity, setSelfPaid } from "@/lib/bills";
import { revalidatePath } from "next/cache";

export async function joinBillAction(billId: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const participant = await joinBill(billId, trimmed);
  if (!participant) return null;
  revalidatePath(`/b/${billId}`);
  return participant;
}

export async function setClaimQuantityAction(
  billId: string,
  participantId: string,
  participantToken: string,
  itemId: string,
  quantity: number,
) {
  const result = await setItemClaimQuantity(
    billId,
    participantId,
    participantToken,
    itemId,
    quantity,
  );
  if (result.ok) {
    revalidatePath(`/b/${billId}`);
    revalidatePath(`/b/${billId}/beheer`);
  }
  return result;
}

export async function markSelfPaidAction(
  billId: string,
  participantId: string,
  participantToken: string,
  hasPaid: boolean,
) {
  const success = await setSelfPaid(
    billId,
    participantId,
    participantToken,
    hasPaid,
  );
  if (success) {
    revalidatePath(`/b/${billId}`);
    revalidatePath(`/b/${billId}/beheer`);
  }
  return success;
}
