import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { billItems, bills, itemClaims, participants } from "@/db/schema";
import {
  createBillId,
  createClaimId,
  createItemId,
  createParticipantId,
  createSecretToken,
} from "@/lib/ids";

export type DraftItemInput = {
  name: string;
  priceCents: number;
  quantity: number;
};

export async function createDraftBill(
  items: DraftItemInput[],
  title: string | null,
  serviceCents = 0,
) {
  const billId = createBillId();
  const managerToken = createSecretToken();

  await db.transaction(async (tx) => {
    await tx.insert(bills).values({
      id: billId,
      managerToken,
      title,
      serviceCents,
      status: "draft",
    });

    if (items.length > 0) {
      await tx.insert(billItems).values(
        items.map((item, index) => ({
          id: createItemId(),
          billId,
          name: item.name,
          priceCents: item.priceCents,
          quantity: item.quantity,
          position: index,
        })),
      );
    }
  });

  return { billId, managerToken };
}

async function requireDraftBill(billId: string, managerToken: string) {
  const bill = await db.query.bills.findFirst({
    where: eq(bills.id, billId),
  });
  if (!bill || bill.managerToken !== managerToken) return null;
  return bill;
}

export async function getDraftBillForEdit(billId: string, managerToken: string) {
  const bill = await requireDraftBill(billId, managerToken);
  if (!bill) return null;
  const items = await db.query.billItems.findMany({
    where: eq(billItems.billId, billId),
    orderBy: (t, { asc }) => asc(t.position),
  });
  return { bill, items };
}

export async function addBillItem(
  billId: string,
  managerToken: string,
  item: DraftItemInput,
) {
  const bill = await requireDraftBill(billId, managerToken);
  if (!bill) return false;
  const existing = await db.query.billItems.findMany({
    where: eq(billItems.billId, billId),
  });
  await db.insert(billItems).values({
    id: createItemId(),
    billId,
    name: item.name,
    priceCents: item.priceCents,
    quantity: item.quantity,
    position: existing.length,
  });
  return true;
}

export async function updateBillItem(
  billId: string,
  managerToken: string,
  itemId: string,
  item: DraftItemInput,
) {
  const bill = await requireDraftBill(billId, managerToken);
  if (!bill) return false;
  await db
    .update(billItems)
    .set({
      name: item.name,
      priceCents: item.priceCents,
      quantity: item.quantity,
    })
    .where(and(eq(billItems.id, itemId), eq(billItems.billId, billId)));
  return true;
}

export async function deleteBillItem(
  billId: string,
  managerToken: string,
  itemId: string,
) {
  const bill = await requireDraftBill(billId, managerToken);
  if (!bill) return false;
  await db
    .delete(billItems)
    .where(and(eq(billItems.id, itemId), eq(billItems.billId, billId)));
  return true;
}

export async function publishBill(
  billId: string,
  managerToken: string,
  params: { payerName: string; paymentLink: string; serviceCents: number },
) {
  const bill = await requireDraftBill(billId, managerToken);
  if (!bill) return null;

  const payerAccessToken = createSecretToken();
  const payerId = createParticipantId();

  await db.transaction(async (tx) => {
    await tx
      .update(bills)
      .set({
        payerName: params.payerName,
        paymentLink: params.paymentLink,
        serviceCents: params.serviceCents,
        status: "open",
        updatedAt: new Date(),
      })
      .where(eq(bills.id, billId));

    await tx.insert(participants).values({
      id: payerId,
      billId,
      name: params.payerName,
      accessToken: payerAccessToken,
      isPayer: true,
      hasPaid: true,
    });
  });

  return { payerId, payerAccessToken };
}

export async function getOpenBillPublic(billId: string) {
  const bill = await db.query.bills.findFirst({
    where: and(eq(bills.id, billId), eq(bills.status, "open")),
  });
  if (!bill) return null;

  const [items, billParticipants] = await Promise.all([
    db.query.billItems.findMany({
      where: eq(billItems.billId, billId),
      orderBy: (t, { asc }) => asc(t.position),
    }),
    db.query.participants.findMany({
      where: eq(participants.billId, billId),
    }),
  ]);

  const claims = await db.query.itemClaims.findMany({
    where: (t, { inArray }) =>
      inArray(
        t.itemId,
        items.map((i) => i.id),
      ),
  });

  return { bill, items, participants: billParticipants, claims };
}

export async function joinBill(billId: string, name: string) {
  const bill = await db.query.bills.findFirst({
    where: and(eq(bills.id, billId), eq(bills.status, "open")),
  });
  if (!bill) return null;

  const id = createParticipantId();
  const accessToken = createSecretToken();
  await db.insert(participants).values({
    id,
    billId,
    name,
    accessToken,
    isPayer: false,
    hasPaid: false,
  });
  return { id, accessToken };
}

export async function setItemClaim(
  billId: string,
  participantId: string,
  participantToken: string,
  itemId: string,
  claimed: boolean,
) {
  const participant = await db.query.participants.findFirst({
    where: and(
      eq(participants.id, participantId),
      eq(participants.billId, billId),
    ),
  });
  if (!participant || participant.accessToken !== participantToken) {
    return false;
  }

  const item = await db.query.billItems.findFirst({
    where: and(eq(billItems.id, itemId), eq(billItems.billId, billId)),
  });
  if (!item) return false;

  if (claimed) {
    await db
      .insert(itemClaims)
      .values({ id: createClaimId(), itemId, participantId })
      .onConflictDoNothing();
  } else {
    await db
      .delete(itemClaims)
      .where(
        and(
          eq(itemClaims.itemId, itemId),
          eq(itemClaims.participantId, participantId),
        ),
      );
  }
  return true;
}

export async function setSelfPaid(
  billId: string,
  participantId: string,
  participantToken: string,
  hasPaid: boolean,
) {
  const participant = await db.query.participants.findFirst({
    where: and(
      eq(participants.id, participantId),
      eq(participants.billId, billId),
    ),
  });
  if (!participant || participant.accessToken !== participantToken) {
    return false;
  }
  await db
    .update(participants)
    .set({ hasPaid })
    .where(eq(participants.id, participantId));
  return true;
}

async function requireManagedBill(billId: string, managerToken: string) {
  const bill = await db.query.bills.findFirst({
    where: and(eq(bills.id, billId), eq(bills.status, "open")),
  });
  if (!bill || bill.managerToken !== managerToken) return null;
  return bill;
}

export async function getBillForManager(billId: string, managerToken: string) {
  const bill = await requireManagedBill(billId, managerToken);
  if (!bill) return null;

  const [items, billParticipants] = await Promise.all([
    db.query.billItems.findMany({
      where: eq(billItems.billId, billId),
      orderBy: (t, { asc }) => asc(t.position),
    }),
    db.query.participants.findMany({
      where: eq(participants.billId, billId),
    }),
  ]);

  const claims = await db.query.itemClaims.findMany({
    where: (t, { inArray }) =>
      inArray(
        t.itemId,
        items.map((i) => i.id),
      ),
  });

  return { bill, items, participants: billParticipants, claims };
}

export async function setParticipantPaid(
  billId: string,
  managerToken: string,
  participantId: string,
  hasPaid: boolean,
) {
  const bill = await requireManagedBill(billId, managerToken);
  if (!bill) return false;
  await db
    .update(participants)
    .set({ hasPaid })
    .where(
      and(eq(participants.id, participantId), eq(participants.billId, billId)),
    );
  return true;
}
