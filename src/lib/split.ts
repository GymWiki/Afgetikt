export type SplitItemClaim = {
  participantId: string;
  quantity: number;
};

export type SplitItem = {
  id: string;
  priceCents: number;
  quantity: number;
  claims: SplitItemClaim[];
};

export type SplitParticipant = {
  id: string;
  name: string;
};

export type ParticipantTotal = {
  participantId: string;
  name: string;
  itemsSubtotalCents: number;
  serviceShareCents: number;
  totalCents: number;
};

export type SplitResult = {
  perParticipant: ParticipantTotal[];
  unclaimedCents: number;
  claimedSubtotalCents: number;
  grandTotalCents: number;
};

const UNCLAIMED = "__unclaimed__";

/**
 * Verdeelt bonregels over deelnemers. Een regel (bv. "6x Biertje") kan per
 * eenheid geclaimd worden: twee mensen kunnen samen bv. 2 en 4 van de 6
 * claimen. Het niet-geclaimde deel telt mee als `unclaimedCents`.
 * Servicekosten worden naar rato van ieders aandeel in de geclaimde items
 * verdeeld.
 *
 * Rondingsverschillen (centen) worden weggewerkt met de "largest remainder"
 * methode, zodat de som van alle bedragen altijd exact het totaal is.
 */
export function calculateSplit(
  items: SplitItem[],
  participants: SplitParticipant[],
  serviceCents: number,
): SplitResult {
  const subtotalByParticipant = new Map<string, number>(
    participants.map((p) => [p.id, 0]),
  );
  const knownParticipants = new Set(participants.map((p) => p.id));

  let claimedSubtotalCents = 0;
  let unclaimedCents = 0;

  for (const item of items) {
    const claims = item.claims.filter((c) => knownParticipants.has(c.participantId));
    const claimedQuantity = claims.reduce((sum, c) => sum + c.quantity, 0);
    const remainingQuantity = Math.max(0, item.quantity - claimedQuantity);

    const weighted = [
      ...claims.map((c) => ({ id: c.participantId, weight: c.quantity })),
      ...(remainingQuantity > 0 ? [{ id: UNCLAIMED, weight: remainingQuantity }] : []),
    ];

    const shares = distributeProportionally(item.priceCents, weighted);
    for (const [id, cents] of shares) {
      if (id === UNCLAIMED) {
        unclaimedCents += cents;
      } else {
        claimedSubtotalCents += cents;
        subtotalByParticipant.set(id, (subtotalByParticipant.get(id) ?? 0) + cents);
      }
    }
  }

  const serviceByParticipant =
    claimedSubtotalCents > 0
      ? distributeProportionally(
          serviceCents,
          participants.map((p) => ({
            id: p.id,
            weight: subtotalByParticipant.get(p.id) ?? 0,
          })),
        )
      : new Map<string, number>();

  const perParticipant: ParticipantTotal[] = participants.map((p) => {
    const itemsSubtotalCents = subtotalByParticipant.get(p.id) ?? 0;
    const serviceShareCents = serviceByParticipant.get(p.id) ?? 0;
    return {
      participantId: p.id,
      name: p.name,
      itemsSubtotalCents,
      serviceShareCents,
      totalCents: itemsSubtotalCents + serviceShareCents,
    };
  });

  return {
    perParticipant,
    unclaimedCents,
    claimedSubtotalCents,
    grandTotalCents: claimedSubtotalCents + serviceCents,
  };
}

/**
 * Verdeelt `amountCents` naar rato van de gewichten, met de largest-remainder
 * methode zodat de som van de uitkomsten exact `amountCents` is.
 */
function distributeProportionally(
  amountCents: number,
  weighted: { id: string; weight: number }[],
): Map<string, number> {
  const result = new Map<string, number>();
  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
  if (amountCents === 0 || totalWeight === 0) {
    for (const w of weighted) result.set(w.id, 0);
    return result;
  }

  const raw = weighted.map((w) => ({
    id: w.id,
    exact: (amountCents * w.weight) / totalWeight,
  }));

  let allocated = 0;
  for (const r of raw) {
    const floor = Math.floor(r.exact);
    result.set(r.id, floor);
    allocated += floor;
  }

  let remainder = amountCents - allocated;
  const byRemainderDesc = [...raw].sort(
    (a, b) => b.exact - Math.floor(b.exact) - (a.exact - Math.floor(a.exact)),
  );
  for (const r of byRemainderDesc) {
    if (remainder <= 0) break;
    result.set(r.id, (result.get(r.id) ?? 0) + 1);
    remainder -= 1;
  }

  return result;
}
