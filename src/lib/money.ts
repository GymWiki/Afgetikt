const formatter = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
});

export function formatCents(cents: number): string {
  return formatter.format(cents / 100);
}

// Zonder €-teken: geschikt om naar het klembord te kopiëren voor een
// bedragveld in een bank-app (die verwacht meestal alleen het getal).
export function formatCentsForClipboard(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}

// Parst gebruikersinvoer zoals "12,50", "12.50" of "12" naar centen.
// Bevat de invoer een komma, dan is dat de decimaalscheiding (NL-notatie) en
// worden punten als duizendtalscheiding weggehaald. Zonder komma is een punt
// de decimaalscheiding.
export function parseAmountToCents(input: string): number | null {
  const trimmed = input.trim();
  if (trimmed === "") return null;
  const normalized = trimmed.includes(",")
    ? trimmed.replace(/\./g, "").replace(",", ".")
    : trimmed;
  if (!/^\d+(\.\d+)?$/.test(normalized)) return null;
  const value = Number(normalized);
  if (Number.isNaN(value) || value < 0) return null;
  return Math.round(value * 100);
}
