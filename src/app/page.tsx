import { Button, ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Reveal } from "@/components/ui/reveal";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  ArrowRight,
  BarChart3,
  Camera,
  CheckCircle2,
  ChevronDown,
  CircleCheckBig,
  Link2,
  QrCode,
  ShieldCheck,
  Sticker,
  Users,
  XCircle,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ReceiptPreviewCard } from "./receipt-preview-card";

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

const steps = [
  {
    icon: Camera,
    title: "Scan de bon",
    description:
      "Maak een foto van de bon. Afgetikt leest de producten en prijzen automatisch uit.",
  },
  {
    icon: Link2,
    title: "Deel de link",
    description:
      "Stuur de groepslink naar je tafelgenoten — via WhatsApp of hoe je maar wilt.",
  },
  {
    icon: Users,
    title: "Iedereen tikt zijn items aan",
    description:
      "Elke deelnemer ziet direct wat hij moet betalen en regelt zijn eigen deel.",
  },
];

const problems = [
  "Eén iemand schiet de hele rekening voor",
  "Weken later jaag je nog steeds Tikkies achterna",
  "Niemand weet meer wie de cola had en wie het water",
];

const solutions = [
  "Scan de bon zodra hij op tafel komt",
  "Iedereen tikt zijn eigen items aan en betaalt meteen zijn deel",
  "Geen rekenwerk, geen appjes achteraf, geen app nodig voor je vrienden",
];

const scenarios = [
  {
    title: "Etentje met de hele vriendengroep",
    description:
      "Zes man aan tafel? Binnen 30 seconden weet iedereen precies wat hij moet betalen.",
  },
  {
    title: "Weekendje weg",
    description:
      "Verdeel alle bonnetjes van een weekend met vrienden in een paar tikken, in plaats van achteraf te puzzelen.",
  },
  {
    title: "Borrel met collega's",
    description:
      "Niemand hoeft meer voor te schieten en achter geld aan te bellen op de zaak.",
  },
];

const restaurantFeatures = [
  {
    icon: QrCode,
    title: "QR-code op tafel",
    description:
      "Gasten scannen, fotograferen de bon en kiezen direct hun producten — sneller dan bij een willekeurig restaurant.",
  },
  {
    icon: BarChart3,
    title: "Statistieken-dashboard",
    description:
      "Zie hoeveel rekeningen er via Afgetikt zijn verwerkt, direct in je eigen dashboard.",
  },
  {
    icon: Sticker,
    title: "Downloadbare tafelsticker",
    description: "Print je QR-code als nette tafelsticker, klaar in één klik.",
  },
];

const trustPoints = [
  "Geen app nodig — werkt direct in de browser",
  "Gasten hebben geen account nodig om mee te doen",
  "Afgetikt verwerkt zelf geen betalingen — rechtstreeks naar jouw Tikkie of betaalverzoek",
];

const faqItems = [
  {
    question: "Is Afgetikt gratis?",
    answer:
      "Ja. Als hoofdbetaler krijg je 3 gratis bonnen. Daarna koop je eenmalig een pakket bij vanaf €1,99 — meedoen aan de rekening van iemand anders is voor je tafelgenoten altijd gratis.",
  },
  {
    question: "Moet iedereen een account aanmaken?",
    answer:
      "Nee. Alleen de hoofdbetaler maakt een gratis account aan, vlak voordat de link gedeeld wordt — zo zie je je bonnen later terug. Je tafelgenoten hoeven niets te installeren of aan te maken: ze openen de link en tikken hun items aan.",
  },
  {
    question: "Werkt Afgetikt met Tikkie?",
    answer:
      "Ja. Je plakt je eigen Tikkie- of ander betaalverzoek (ING, Rabobank, ABN AMRO, …) in Afgetikt. Zie het als een Tikkie-splitsen-alternatief: het echte geld loopt gewoon via jouw eigen betaalverzoek, Afgetikt regelt alleen de verdeling.",
  },
  {
    question: "Hoe werkt het scannen van een bon precies?",
    answer:
      "Je maakt een foto van de bon. Afgetikt leest automatisch de producten en prijzen uit, en jij controleert en corrigeert het resultaat voordat je de link deelt.",
  },
  {
    question: "Is mijn data veilig?",
    answer:
      "Afgetikt verwerkt zelf geen betalingen — die lopen rechtstreeks via jouw eigen betaalverzoek. We bewaren alleen wat nodig is om de rekening te kunnen tonen en delen. Lees de volledige uitleg in onze privacyverklaring.",
  },
  {
    question: "Werkt het ook voor grote groepen?",
    answer:
      "Ja, van een etentje met z'n tweeën tot een weekend weg met een grote groep — iedereen tikt gewoon zijn eigen items aan, ongeacht de groepsgrootte.",
  },
];

const webApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Afgetikt",
  description:
    "Scan de bon, deel de link en verdeel de rekening met vrienden. Iedereen tikt zijn eigen items aan en betaalt direct zijn deel.",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  url: siteUrl,
  inLanguage: "nl-NL",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "EUR",
    description:
      "3 gratis bonnen voor de hoofdbetaler, daarna eenmalige pakketten vanaf €1,99. Meedoen aan een rekening is altijd gratis.",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div className="flex flex-1 flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-6">
        <Link href="/">
          <Logo size="md" />
        </Link>
        <nav aria-label="Hoofdnavigatie">
          <Link
            href="#restaurants"
            className="text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            Voor restaurants
          </Link>
        </nav>
      </header>

      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section
          aria-labelledby="hero-heading"
          className="relative mx-auto w-full max-w-5xl overflow-hidden px-5 pb-16 pt-4 sm:pt-8"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle, var(--color-border) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              maskImage:
                "radial-gradient(ellipse 60% 55% at 50% 0%, black 40%, transparent 100%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 60% 55% at 50% 0%, black 40%, transparent 100%)",
            }}
          />

          <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-8">
            <div>
              <div
                className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold tracking-wide text-brand-600 animate-fade-up"
                style={{ animationDelay: "0ms" }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-accent motion-safe:animate-pop" />
                Scan · Tik · Klaar
              </div>
              <h1
                id="hero-heading"
                className="text-[1.85rem] font-bold leading-[1.12] tracking-tight text-foreground animate-fade-up sm:text-5xl"
                style={{ animationDelay: "80ms" }}
              >
                Nooit meer Tikkies achternazitten na het eten.
              </h1>
              <p
                className="mt-3 max-w-md text-[16px] leading-relaxed text-muted animate-fade-up sm:mt-4 sm:text-[17px]"
                style={{ animationDelay: "160ms" }}
              >
                Scan de bon, deel de link — iedereen tikt zijn eigen items aan
                en ziet meteen wat hij moet betalen. Zo verdeel je de kosten
                van een etentje in een paar tikken.
              </p>

              <div
                className="mt-6 flex flex-col gap-3 animate-fade-up sm:mt-8 sm:flex-row"
                style={{ animationDelay: "240ms" }}
              >
                <ButtonLink href="/nieuw" size="lg" className="group sm:w-auto">
                  Splits gratis je eerste bon
                  <ArrowRight
                    size={18}
                    strokeWidth={2.5}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </ButtonLink>
              </div>

              <div
                className="mt-6 flex items-center gap-6 border-t border-border pt-5 animate-fade-up sm:mt-10 sm:pt-6"
                style={{ animationDelay: "320ms" }}
              >
                <div className="flex items-center gap-2 text-sm text-muted">
                  <ShieldCheck size={16} className="text-brand-500" />
                  Geen betalingen via Afgetikt
                </div>
              </div>
            </div>

            <ReceiptPreviewCard />
          </div>
        </section>

        {/* Probleem / oplossing */}
        <section
          aria-labelledby="herkenbaar-heading"
          className="border-t border-border bg-surface"
        >
          <div className="mx-auto w-full max-w-5xl px-5 py-14 sm:py-20">
            <Reveal>
              <h2
                id="herkenbaar-heading"
                className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
              >
                Herkenbaar?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-center text-[15px] leading-relaxed text-muted">
                Zo gaat het splitsen van de rekening meestal — en zo kan het
                voortaan ook.
              </p>
            </Reveal>

            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <Reveal delay={80}>
                <div className="h-full rounded-2xl border border-border bg-background p-6">
                  <div className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted">
                    Zonder Afgetikt
                  </div>
                  <ul className="flex flex-col gap-3">
                    {problems.map((point) => (
                      <li key={point} className="flex items-start gap-3">
                        <XCircle
                          size={18}
                          strokeWidth={2}
                          className="mt-0.5 shrink-0 text-muted"
                        />
                        <span className="text-[15px] text-foreground">
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>

              <Reveal delay={160}>
                <div className="h-full rounded-2xl border border-brand-100 bg-brand-50/50 p-6">
                  <div className="mb-4 text-xs font-semibold uppercase tracking-wide text-brand-600">
                    Met Afgetikt
                  </div>
                  <ul className="flex flex-col gap-3">
                    {solutions.map((point) => (
                      <li key={point} className="flex items-start gap-3">
                        <CircleCheckBig
                          size={18}
                          strokeWidth={2}
                          className="mt-0.5 shrink-0 text-brand-500"
                        />
                        <span className="text-[15px] text-foreground">
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Hoe het werkt */}
        <section aria-labelledby="hoe-werkt-heading" className="mx-auto w-full max-w-5xl px-5 py-14 sm:py-20">
          <Reveal>
            <h2
              id="hoe-werkt-heading"
              className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
            >
              Hoe het werkt
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-[15px] leading-relaxed text-muted">
              Van bonnetje scannen tot iedereen betaald — in drie stappen.
            </p>
          </Reveal>
          <ol className="mt-10 grid gap-5 sm:grid-cols-3">
            {steps.map((step, i) => (
              <li key={step.title}>
                <Reveal delay={i * 100}>
                  <div className="h-full rounded-2xl border border-border bg-surface p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_12px_24px_-12px_rgba(18,36,32,0.18)]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                      <step.icon size={18} strokeWidth={2} />
                    </div>
                    <h3 className="mt-3 text-[15px] font-semibold text-foreground">
                      {i + 1}. {step.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">
                      {step.description}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </section>

        {/* Sociale bewijskracht / scenario's */}
        <section
          aria-labelledby="scenarios-heading"
          className="border-t border-border bg-surface"
        >
          <div className="mx-auto w-full max-w-5xl px-5 py-14 sm:py-20">
            <Reveal>
              <h2
                id="scenarios-heading"
                className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
              >
                Voor elk moment dat je samen uit eet
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {scenarios.map((scenario, i) => (
                <Reveal key={scenario.title} delay={i * 100}>
                  <div className="h-full rounded-2xl border border-border bg-background p-5">
                    <CheckCircle2
                      size={20}
                      strokeWidth={2}
                      className="text-brand-500"
                    />
                    <h3 className="mt-3 text-[15px] font-semibold text-foreground">
                      {scenario.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">
                      {scenario.description}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Voor restaurants */}
        <section id="restaurants" aria-labelledby="restaurants-heading" className="border-t border-border bg-surface">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-5 py-16 lg:py-20">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <Reveal>
                <div>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-600">
                    Voor restaurants
                  </div>
                  <h2
                    id="restaurants-heading"
                    className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
                  >
                    Laat gasten hun rekening zelf regelen
                  </h2>
                  <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-muted">
                    Hang je eigen QR-code op tafel of bij de kassa. Gasten
                    scannen, splitsen de rekening zelf en jij houdt overzicht —
                    zonder dat je personeel hoeft te rekenen of Tikkies hoeft na
                    te sturen.
                  </p>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <ButtonLink
                      href="/restaurant/registreren"
                      className="sm:w-auto"
                    >
                      Restaurant aanmelden
                    </ButtonLink>
                    <Link href="/restaurant/inloggen">
                      <Button variant="secondary" className="w-full sm:w-auto">
                        Al een account? Inloggen
                      </Button>
                    </Link>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={120} className="flex justify-center">
                <Image
                  src="/logo-icon.png"
                  alt="Het Afgetikt-icoon: een klembord met een camera en een vinkje, symbool voor het scannen en afvinken van de bon"
                  width={200}
                  height={200}
                  loading="lazy"
                  className="opacity-90 motion-safe:animate-float"
                />
              </Reveal>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {restaurantFeatures.map((feature, i) => (
                <Reveal key={feature.title} delay={i * 100}>
                  <div className="h-full rounded-2xl border border-border bg-background p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_12px_24px_-12px_rgba(18,36,32,0.14)]">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                      <feature.icon size={18} strokeWidth={2} />
                    </div>
                    <h3 className="text-[15px] font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">
                      {feature.description}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Vertrouwenspunten */}
        <section aria-label="Vertrouwenspunten" className="mx-auto w-full max-w-5xl px-5 py-14">
          <ul className="grid gap-4 sm:max-w-md">
            {trustPoints.map((point, i) => (
              <li key={point}>
                <Reveal delay={i * 80}>
                  <div className="flex items-start gap-3">
                    <CircleCheckBig
                      size={18}
                      strokeWidth={2}
                      className="mt-0.5 shrink-0 text-brand-500"
                    />
                    <span className="text-[15px] text-foreground">{point}</span>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section
          aria-labelledby="faq-heading"
          className="border-t border-border bg-surface"
        >
          <div className="mx-auto w-full max-w-3xl px-5 py-14 sm:py-20">
            <Reveal>
              <h2
                id="faq-heading"
                className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
              >
                Veelgestelde vragen
              </h2>
            </Reveal>
            <div className="mt-8 flex flex-col divide-y divide-border rounded-2xl border border-border bg-background">
              {faqItems.map((item, i) => (
                <Reveal key={item.question} delay={Math.min(i, 6) * 40}>
                  <details className="group px-5 py-4 open:pb-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium text-foreground marker:content-none">
                      {item.question}
                      <ChevronDown
                        size={18}
                        strokeWidth={2}
                        className="shrink-0 text-muted transition-transform duration-200 group-open:rotate-180"
                      />
                    </summary>
                    <p className="mt-2 text-[15px] leading-relaxed text-muted">
                      {item.answer}
                    </p>
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-auto border-t border-border">
        <div className="mx-auto w-full max-w-5xl px-5 py-10">
          <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
            <div className="flex flex-col gap-3">
              <Logo size="sm" />
              <div className="text-xs leading-relaxed text-muted">
                Afgetikt is een product van GymWiki
                <br />
                KVK 97351911 · BTW NL005266843B58
                <br />
                <a
                  href="mailto:info@afgetikt.nl"
                  className="underline underline-offset-4 transition-colors hover:text-foreground"
                >
                  info@afgetikt.nl
                </a>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <ShieldCheck size={14} />
                Afgetikt verwerkt geen betalingen
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs text-muted sm:text-right">
              <Link
                href="/restaurant/inloggen"
                className="transition-colors hover:text-foreground"
              >
                Restaurant inloggen
              </Link>
              <Link
                href="/privacyverklaring"
                className="transition-colors hover:text-foreground"
              >
                Privacyverklaring
              </Link>
              <Link
                href="/restaurant/registreren"
                className="transition-colors hover:text-foreground"
              >
                Restaurant aanmelden
              </Link>
              <Link
                href="/algemene-voorwaarden"
                className="transition-colors hover:text-foreground"
              >
                Algemene voorwaarden
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
