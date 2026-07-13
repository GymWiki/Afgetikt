import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const ParsedItemSchema = z.object({
  name: z.string().min(1).max(120),
  quantity: z.number().int().min(1).max(50),
  // Kan negatief zijn: kortingsregels (bv. loyaliteitskorting, actiebon)
  // staan vaak als eigen regel met een negatief bedrag op de bon.
  priceCents: z.number().int().min(-1_000_000).max(1_000_000),
});

const ParsedReceiptSchema = z.object({
  restaurantName: z.string().nullable(),
  items: z.array(ParsedItemSchema),
  serviceCents: z.number().int().min(0),
});

export type ParsedReceipt = z.infer<typeof ParsedReceiptSchema>;

const SYSTEM_PROMPT = `Je leest een foto van een Nederlandse of Europese restaurantrekening en zet die om naar strikt JSON.

Regels:
- "priceCents" is de TOTALE prijs voor die regel (dus prijs x aantal), in centen, als geheel getal. Is de regel een korting, loyaliteitsvoordeel of actiebon (bv. "uw glimlach", "korting"), gebruik dan een NEGATIEF getal.
- "quantity" is het aantal van dat product op de regel (minimaal 1).
- Splits geen enkel product op in meerdere regels; combineer identieke regels niet samengevoegd tenzij ze al zo op de bon staan.
- "serviceCents" is eventuele service-/bedieningskosten of fooi die apart op de bon staat (in centen). Staat er niets apart, gebruik dan 0. BTW die al in de prijzen is verwerkt telt niet mee als aparte service.
- "restaurantName" is de naam van het restaurant zoals op de bon, of null als onduidelijk.
- Geef ALLEEN geldig JSON terug, zonder uitleg, in dit exacte formaat:
{"restaurantName": string | null, "items": [{"name": string, "quantity": number, "priceCents": number}], "serviceCents": number}`;

export class ReceiptParseError extends Error {}

export async function parseReceiptImage(params: {
  base64Image: string;
  mediaType: "image/jpeg" | "image/png" | "image/webp";
}): Promise<ParsedReceipt> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new ReceiptParseError("ANTHROPIC_API_KEY is niet geconfigureerd.");
  }

  const client = new Anthropic({ apiKey });
  const model = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001";

  const response = await client.messages.create({
    model,
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: params.mediaType,
              data: params.base64Image,
            },
          },
          {
            type: "text",
            text: "Zet deze bon om naar het afgesproken JSON-formaat.",
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new ReceiptParseError("Geen tekstantwoord ontvangen van het model.");
  }

  const jsonText = extractJson(textBlock.text);
  let raw: unknown;
  try {
    raw = JSON.parse(jsonText);
  } catch {
    throw new ReceiptParseError("Kon het antwoord niet als JSON lezen.");
  }

  const parsed = ParsedReceiptSchema.safeParse(raw);
  if (!parsed.success) {
    console.error(
      "receipt-parser: onverwacht formaat",
      parsed.error.flatten(),
      jsonText,
    );
    throw new ReceiptParseError("De herkende bon had een onverwacht formaat.");
  }
  if (parsed.data.items.length === 0) {
    throw new ReceiptParseError("Er zijn geen producten op de bon herkend.");
  }
  return parsed.data;
}

function extractJson(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return text;
  return text.slice(start, end + 1);
}
