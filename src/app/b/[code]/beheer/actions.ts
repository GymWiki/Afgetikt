"use server";

import { setParticipantPaid } from "@/lib/bills";
import { revalidatePath } from "next/cache";

export async function togglePaidAction(
  billId: string,
  managerToken: string,
  participantId: string,
  hasPaid: boolean,
) {
  const success = await setParticipantPaid(
    billId,
    managerToken,
    participantId,
    hasPaid,
  );
  if (success) {
    revalidatePath(`/b/${billId}/beheer`);
    revalidatePath(`/b/${billId}`);
  }
  return success;
}
