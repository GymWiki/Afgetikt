import { customAlphabet, nanoid } from "nanoid";

// Geen 0/O/1/l/i: voorkomt verwarring als een code hardop wordt voorgelezen
// of overgetypt. 8 tekens uit dit alfabet is ruim voldoende voor het
// verwachte volume van deze app.
const billCodeAlphabet = "23456789abcdefghjkmnpqrstuvwxyz";
const generateBillId = customAlphabet(billCodeAlphabet, 8);

export function createBillId(): string {
  return generateBillId();
}

export function createItemId(): string {
  return `item_${nanoid(12)}`;
}

export function createParticipantId(): string {
  return `p_${nanoid(12)}`;
}

export function createClaimId(): string {
  return `claim_${nanoid(12)}`;
}

// Geheime tokens: nooit voorspelbaar, alleen bekend bij wie de link heeft.
export function createSecretToken(): string {
  return nanoid(32);
}
