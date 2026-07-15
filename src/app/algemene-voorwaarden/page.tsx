import { Logo } from "@/components/ui/logo";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Algemene voorwaarden",
  description:
    "De spelregels voor het gebruik van Afgetikt, inclusief betalingen en aansprakelijkheid.",
  alternates: { canonical: "/algemene-voorwaarden" },
};

export default function AlgemeneVoorwaardenPage() {
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
            Algemene voorwaarden
          </h1>
          <p className="mt-2 text-sm text-muted">
            Laatst bijgewerkt: juli 2026
          </p>
        </div>

        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900">
          Dit is een eerste, feitelijke versie van onze voorwaarden op basis
          van hoe Afgetikt werkt. We raden aan deze door een jurist te laten
          toetsen voordat je &apos;m als definitief beschouwt.
        </p>

        <Section title="1. Wie zijn wij?">
          <p>
            Afgetikt is een dienst van GymWiki (KVK 97351911, BTW
            NL005266843B58, e-mail{" "}
            <a
              href="mailto:info@afgetikt.nl"
              className="text-foreground underline underline-offset-4"
            >
              info@afgetikt.nl
            </a>
            ). Door Afgetikt te gebruiken ga je akkoord met deze voorwaarden.
          </p>
        </Section>

        <Section title="2. Wat Afgetikt doet — en niet doet">
          <p>
            Afgetikt helpt je een restaurantbon te scannen en de rekening
            per item te verdelen over je tafelgenoten via een deellink.
            Afgetikt verwerkt zelf <strong className="text-foreground">geen</strong>{" "}
            betalingen tussen jou en je tafelgenoten: het bedrag dat iemand
            aan jou moet betalen, wordt rechtstreeks voldaan via het
            betaalverzoek (bijvoorbeeld Tikkie) dat jij zelf hebt aangemaakt
            en gedeeld. Afgetikt is geen partij bij die betaling en kan niet
            garanderen dat tafelgenoten daadwerkelijk betalen.
          </p>
        </Section>

        <Section title="3. Account en gebruik">
          <p>
            Als hoofdbetaler maak je een account aan om je bonnen terug te
            zien. Je bent zelf verantwoordelijk voor de juistheid van de
            gegevens die je invoert (zoals de door de bon-scan herkende
            producten en prijzen) en voor het correct delen van je eigen
            betaalverzoek-link.
          </p>
        </Section>

        <Section title="4. Betaalde pakketten en abonnementen">
          <p>
            Na je 3 gratis bonnen kun je eenmalige pakketten bijkopen (vanaf
            €1,99) om verder te kunnen scannen. Restaurants kunnen een
            maand- of jaarabonnement afsluiten voor het restaurant-dashboard
            (€19,99 per maand of €190 per jaar, per restaurant). Betalingen
            worden verwerkt door Mollie. Bij een abonnement kun je op elk
            moment opzeggen; je houdt dan toegang tot het einde van de
            lopende, al betaalde periode. Eenmalige aankopen worden niet
            gerestitueerd, tenzij de wet dat vereist.
          </p>
        </Section>

        <Section title="5. Aansprakelijkheid">
          <p>
            Afgetikt doet zijn best om bonnen correct uit te lezen en
            rekeningen correct te verdelen, maar geeft geen garantie dat dit
            altijd foutloos gebeurt — controleer daarom altijd de herkende
            producten en bedragen voordat je de link deelt. Afgetikt is niet
            aansprakelijk voor schade die voortvloeit uit onjuiste bedragen,
            niet-uitgevoerde betalingen tussen gebruikers onderling, of het
            niet beschikbaar zijn van de dienst.
          </p>
        </Section>

        <Section title="6. Wijzigingen">
          <p>
            We kunnen deze voorwaarden aanpassen. Bij belangrijke wijzigingen
            laten we dit zien in de app. Blijf je de dienst gebruiken na een
            wijziging, dan ga je akkoord met de nieuwe voorwaarden.
          </p>
        </Section>

        <Section title="7. Contact">
          <p>
            Vragen over deze voorwaarden? Mail{" "}
            <a
              href="mailto:info@afgetikt.nl"
              className="text-foreground underline underline-offset-4"
            >
              info@afgetikt.nl
            </a>
            .
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
