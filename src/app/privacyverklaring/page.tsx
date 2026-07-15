import { Logo } from "@/components/ui/logo";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacyverklaring",
  description:
    "Welke gegevens Afgetikt verzamelt, waarom, en welke rechten je hebt onder de AVG.",
  alternates: { canonical: "/privacyverklaring" },
};

export default function PrivacyverklaringPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 py-8">
      <Link href="/" className="mb-6 inline-flex w-fit">
        <Logo size="sm" />
      </Link>

      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Terug naar Afgetikt
      </Link>

      <article className="flex flex-col gap-8 pb-16">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Privacyverklaring
          </h1>
          <p className="mt-2 text-sm text-muted">
            Laatst bijgewerkt: juli 2026
          </p>
        </div>

        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900">
          Dit is een eerste, feitelijke versie van onze privacyverklaring op
          basis van hoe Afgetikt technisch werkt. We raden aan deze door een
          jurist te laten toetsen voordat je &apos;m als definitief beschouwt.
        </p>

        <Section title="Wie is verantwoordelijk?">
          <p>
            Afgetikt is een product van GymWiki (KVK 97351911, BTW
            NL005266843B58). Voor vragen over je gegevens mail je naar{" "}
            <a
              href="mailto:info@afgetikt.nl"
              className="text-foreground underline underline-offset-4"
            >
              info@afgetikt.nl
            </a>
            .
          </p>
        </Section>

        <Section title="Welke gegevens verzamelen we?">
          <ul className="flex flex-col gap-2">
            <li>
              <strong className="text-foreground">
                Als je een bon scant of splitst
              </strong>{" "}
              — de foto van je bon (tijdelijk, om de producten en prijzen
              uit te lezen), de producten, prijzen en het totaalbedrag van de
              rekening, en de naam die je invult.
            </li>
            <li>
              <strong className="text-foreground">Een apparaat-cookie</strong>{" "}
              — om je gratis tegoed van 3 bonnen bij te houden, zonder dat je
              daarvoor een account nodig hebt.
            </li>
            <li>
              <strong className="text-foreground">
                Als je een account aanmaakt
              </strong>{" "}
              — je e-mailadres en (versleuteld) wachtwoord, zodat je je
              gescande bonnen later kunt terugvinden op je dashboard.
            </li>
            <li>
              <strong className="text-foreground">
                Als je een betaling doet
              </strong>{" "}
              — betaalgegevens die nodig zijn om een extra pakket of
              restaurantabonnement af te rekenen, verwerkt door onze
              betaalprovider Mollie. Afgetikt ziet en bewaart zelf geen
              kaart- of bankgegevens.
            </li>
            <li>
              <strong className="text-foreground">Als je restaurant je aanmeldt</strong>{" "}
              — restaurantnaam en de gegevens van het account waarmee je
              inlogt.
            </li>
          </ul>
        </Section>

        <Section title="Waarvoor gebruiken we deze gegevens?">
          <p>
            Uitsluitend om de dienst te laten werken: de bon uitlezen, de
            rekening tonen en verdelen, je gratis tegoed en eventuele
            betalingen bij te houden, en — als je een account hebt — je
            eerdere bonnen te tonen op je dashboard. We verkopen je gegevens
            niet en gebruiken ze niet voor advertenties.
          </p>
        </Section>

        <Section title="Wie helpt ons daarbij?">
          <p>
            We werken met een beperkt aantal partijen die noodzakelijk zijn
            om Afgetikt te laten draaien:
          </p>
          <ul className="flex flex-col gap-2">
            <li>
              <strong className="text-foreground">Supabase</strong> —
              hosting van onze database en inloggen (accounts).
            </li>
            <li>
              <strong className="text-foreground">Anthropic (Claude)</strong>{" "}
              — leest de producten en prijzen van je bonfoto uit.
            </li>
            <li>
              <strong className="text-foreground">Mollie</strong> — verwerkt
              betalingen voor extra bonnenpakketten en restaurantabonnementen.
            </li>
            <li>
              <strong className="text-foreground">Vercel</strong> — host de
              website zelf.
            </li>
          </ul>
        </Section>

        <Section title="Hoe lang bewaren we gegevens?">
          <p>
            Bonnen en rekeningen blijven bewaard zodat de betrokken groep de
            rekening kan blijven inzien. De foto van de bon zelf wordt niet
            langer bewaard dan nodig is om hem uit te lezen. Wil je je account
            of gegevens laten verwijderen? Mail ons en we regelen het.
          </p>
        </Section>

        <Section title="Jouw rechten">
          <p>
            Onder de AVG heb je recht op inzage, correctie en verwijdering
            van je persoonsgegevens, en het recht om bezwaar te maken tegen
            de verwerking ervan. Neem hiervoor contact op via{" "}
            <a
              href="mailto:info@afgetikt.nl"
              className="text-foreground underline underline-offset-4"
            >
              info@afgetikt.nl
            </a>
            . Je kunt ook een klacht indienen bij de Autoriteit
            Persoonsgegevens.
          </p>
        </Section>

        <Section title="Cookies">
          <p>
            Afgetikt gebruikt functionele cookies: één om je gratis tegoed
            per apparaat te herkennen, en — als je inlogt — cookies om je
            sessie te onthouden. We gebruiken geen trackingcookies voor
            advertenties.
          </p>
        </Section>
      </article>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <div className="flex flex-col gap-3 text-[15px] leading-relaxed text-muted">
        {children}
      </div>
    </section>
  );
}
