import createMollieClient from "@mollie/api-client";

let client: ReturnType<typeof createMollieClient> | null = null;

// Lazy init: pas de env var opeisen zodra een betaling nodig is, niet bij
// het inladen van de module (zou de build breken zonder MOLLIE_API_KEY).
export function getMollieClient() {
  if (!client) {
    const apiKey = process.env.MOLLIE_API_KEY;
    if (!apiKey) throw new Error("MOLLIE_API_KEY ontbreekt. Zie .env.example.");
    client = createMollieClient({ apiKey });
  }
  return client;
}

export type CreditPackType = "pack20" | "pack100" | "pro";

export const creditPacks: Record<
  CreditPackType,
  { label: string; description: string; priceCents: number; credits: number | null }
> = {
  pack20: {
    label: "20 bonnen",
    description: "20 extra scans voor je volgende etentjes.",
    priceCents: 199,
    credits: 20,
  },
  pack100: {
    label: "100 bonnen",
    description: "Ruim voldoende voor een heel seizoen uit eten.",
    priceCents: 499,
    credits: 100,
  },
  pro: {
    label: "Pro — onbeperkt",
    description: "Voor altijd onbeperkt scannen op dit apparaat.",
    priceCents: 799,
    credits: null,
  },
};

export type RestaurantPlan = "monthly" | "yearly";

export const restaurantPlans: Record<
  RestaurantPlan,
  { label: string; priceCents: number; interval: string; description: string }
> = {
  monthly: {
    label: "Maandelijks",
    priceCents: 1999,
    interval: "1 month",
    description: "€19,99 per maand, elke maand opzegbaar.",
  },
  yearly: {
    label: "Jaarlijks",
    priceCents: 19000,
    interval: "12 months",
    description: "€190 per jaar — twee maanden gratis t.o.v. maandelijks.",
  },
};

export function baseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
}

export function webhookUrl(): string {
  return `${baseUrl()}/api/mollie/webhook`;
}
