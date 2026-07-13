"use server";

import { joinBill, setItemClaim, setSelfPaid } from "@/lib/bills";
import { revalidatePath } from "next/cache";

export async function joinBillAction(billId: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const participant = await joinBill(billId, trimmed);
  if (!participant) return null;
  revalidatePath(`/b/${billId}`);
  return participant;
}

export async function toggleClaimAction(
  billId: string,
  participantId: string,
  participantToken: string,
  itemId: string,
  claimed: boolean,
) {
  const success = await setItemClaim(
    billId,
    participantId,
    participantToken,
    itemId,
    claimed,
  );
  if (success) revalidatePath(`/b/${billId}`);
  return success;
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
