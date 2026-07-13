export type SplitItem = {
  id: string;
  priceCents: number;
  claimedByParticipantIds: string[];
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

/**
 * Verdeelt bonregels over deelnemers. Een item met meerdere claims (bv. een
 * gedeeld schaaltje bitterballen) wordt evenredig verdeeld. Servicekosten
 * worden naar rato van ieders aandeel in de geclaimde items verdeeld.
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

  let claimedSubtotalCents = 0;
  let unclaimedCents = 0;

  for (const item of items) {
    const claimants = item.claimedByParticipantIds.filter((id) =>
      subtotalByParticipant.has(id),
    );
    if (claimants.length === 0) {
      unclaimedCents += item.priceCents;
      continue;
    }
    claimedSubtotalCents += item.priceCents;
    distributeEvenly(item.priceCents, claimants, subtotalByParticipant);
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

function distributeEvenly(
  amountCents: number,
  participantIds: string[],
  target: Map<string, number>,
): void {
  const shares = distributeProportionally(
    amountCents,
    participantIds.map((id) => ({ id, weight: 1 })),
  );
  for (const [id, share] of shares) {
    target.set(id, (target.get(id) ?? 0) + share);
  }
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
