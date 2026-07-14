import { and, eq, sql } from "drizzle-orm";
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

export type CreateDraftBillOptions = {
  title?: string | null;
  serviceCents?: number;
  restaurantId?: string | null;
};

export async function createDraftBill(
  items: DraftItemInput[],
  options: CreateDraftBillOptions = {},
) {
  const billId = createBillId();
  const managerToken = createSecretToken();
  const { title = null, serviceCents = 0, restaurantId = null } = options;

  await db.transaction(async (tx) => {
    await tx.insert(bills).values({
      id: billId,
      managerToken,
      title,
      serviceCents,
      restaurantId,
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
  params: {
    payerName: string;
    paymentLink: string;
    serviceCents: number;
    ownerUserId: string | null;
  },
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
        ownerUserId: params.ownerUserId,
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

// Koppelt een account met terugwerkende kracht aan een al gepubliceerde bon
// — het account-moment zit vlak vóór het delen, dus de bon bestaat en is al
// 'open' op het moment dat dit aangeroepen wordt.
export async function claimBill(
  billId: string,
  managerToken: string,
  ownerUserId: string,
): Promise<boolean> {
  const result = await db
    .update(bills)
    .set({ ownerUserId })
    .where(and(eq(bills.id, billId), eq(bills.managerToken, managerToken)))
    .returning({ id: bills.id });
  return result.length > 0;
}

export type OwnerBillSummary = {
  id: string;
  managerToken: string;
  title: string | null;
  createdAt: Date;
  totalCents: number;
  paidCount: number;
  participantCount: number;
};

export async function getBillsForOwner(
  ownerUserId: string,
): Promise<OwnerBillSummary[]> {
  const result = await db.execute<{
    id: string;
    manager_token: string;
    title: string | null;
    created_at: Date;
    total_cents: number;
    paid_count: number;
    participant_count: number;
  }>(sql`
    select
      b.id,
      b.manager_token,
      b.title,
      b.created_at,
      (b.service_cents + coalesce(items.subtotal_cents, 0))::int as total_cents,
      coalesce(paid.paid_count, 0)::int as paid_count,
      coalesce(cnt.participant_count, 0)::int as participant_count
    from ${bills} b
    left join lateral (
      select sum(price_cents) as subtotal_cents
      from bill_items
      where bill_items.bill_id = b.id
    ) items on true
    left join lateral (
      select count(*) as paid_count
      from participants
      where participants.bill_id = b.id
        and participants.has_paid
        and not participants.is_payer
    ) paid on true
    left join lateral (
      select count(*) as participant_count
      from participants
      where participants.bill_id = b.id
        and not participants.is_payer
    ) cnt on true
    where b.owner_user_id = ${ownerUserId} and b.status = 'open'
    order by b.created_at desc
  `);

  return result.map((row) => ({
    id: row.id,
    managerToken: row.manager_token,
    title: row.title,
    createdAt: row.created_at,
    totalCents: row.total_cents,
    paidCount: row.paid_count,
    participantCount: row.participant_count,
  }));
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

export type ClaimQuantityResult =
  | { ok: true }
  | { ok: false; error: "not_found" | "exceeds_available" };

/**
 * Zet de hoeveelheid van `itemId` die `participantId` claimt (0 = niet
 * geclaimd). Bewaakt dat de som van alle claims op een item nooit meer is
 * dan item.quantity — bv. bij 6 biertjes kunnen twee mensen samen niet meer
 * dan 6 claimen.
 */
export async function setItemClaimQuantity(
  billId: string,
  participantId: string,
  participantToken: string,
  itemId: string,
  quantity: number,
): Promise<ClaimQuantityResult> {
  const participant = await db.query.participants.findFirst({
    where: and(
      eq(participants.id, participantId),
      eq(participants.billId, billId),
    ),
  });
  if (!participant || participant.accessToken !== participantToken) {
    return { ok: false, error: "not_found" };
  }

  const item = await db.query.billItems.findFirst({
    where: and(eq(billItems.id, itemId), eq(billItems.billId, billId)),
  });
  if (!item) return { ok: false, error: "not_found" };

  const clamped = Math.max(0, Math.min(quantity, item.quantity));

  return db.transaction(async (tx) => {
    const others = await tx
      .select({ quantity: itemClaims.quantity })
      .from(itemClaims)
      .where(
        and(
          eq(itemClaims.itemId, itemId),
          sql`${itemClaims.participantId} != ${participantId}`,
        ),
      );
    const claimedByOthers = others.reduce((sum, o) => sum + o.quantity, 0);
    const available = item.quantity - claimedByOthers;

    if (clamped > available) {
      return { ok: false, error: "exceeds_available" };
    }

    if (clamped === 0) {
      await tx
        .delete(itemClaims)
        .where(
          and(
            eq(itemClaims.itemId, itemId),
            eq(itemClaims.participantId, participantId),
          ),
        );
    } else {
      await tx
        .insert(itemClaims)
        .values({ id: createClaimId(), itemId, participantId, quantity: clamped })
        .onConflictDoUpdate({
          target: [itemClaims.itemId, itemClaims.participantId],
          set: { quantity: clamped },
        });
    }

    return { ok: true };
  });
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
