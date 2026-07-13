// Kleine client-only helpers om tokens te bewaren zonder account: het
// apparaat van de gebruiker is de "sessie". Fouten (bv. privémodus zonder
// opslag) worden bewust genegeerd — de gebruiker kan de flow dan gewoon
// opnieuw doorlopen via de link.

function key(billId: string, name: string) {
  return `afgetikt:${billId}:${name}`;
}

export function storeManagerToken(billId: string, token: string) {
  try {
    localStorage.setItem(key(billId, "manager"), token);
  } catch {}
}

export function getManagerToken(billId: string): string | null {
  try {
    return localStorage.getItem(key(billId, "manager"));
  } catch {
    return null;
  }
}

export function storeParticipantToken(
  billId: string,
  participantId: string,
  token: string,
) {
  try {
    localStorage.setItem(key(billId, "participantId"), participantId);
    localStorage.setItem(key(billId, "participantToken"), token);
  } catch {}
}

export function getParticipant(
  billId: string,
): { participantId: string; token: string } | null {
  try {
    const participantId = localStorage.getItem(key(billId, "participantId"));
    const token = localStorage.getItem(key(billId, "participantToken"));
    if (!participantId || !token) return null;
    return { participantId, token };
  } catch {
    return null;
  }
}

export function clearParticipant(billId: string) {
  try {
    localStorage.removeItem(key(billId, "participantId"));
    localStorage.removeItem(key(billId, "participantToken"));
  } catch {}
}
