import { Button, ButtonLink } from "@/components/ui/button";
import {
  BarChart3,
  Camera,
  CircleCheckBig,
  Link2,
  QrCode,
  ShieldCheck,
  Sticker,
  Users,
} from "lucide-react";
import Link from "next/link";

const steps = [
  {
    icon: Camera,
    title: "Fotografeer de bon",
    description: "Afgetikt leest de producten en prijzen automatisch uit.",
  },
  {
    icon: Link2,
    title: "Deel één link",
    description: "Voeg je eigen Tikkie of betaalverzoek toe en deel de link.",
  },
  {
    icon: Users,
    title: "Klaar",
    description:
      "Iedereen kiest zijn eigen producten. Jij ziet wie al betaald heeft.",
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

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-6">
        <span className="text-sm font-semibold tracking-wide text-brand-600">
          Afgetikt
        </span>
        <Link
          href="#restaurants"
          className="text-sm text-muted hover:text-foreground"
        >
          Voor restaurants
        </Link>
      </header>

      <section className="mx-auto w-full max-w-3xl px-5 pb-16 pt-4">
        <div className="flex flex-col gap-12 sm:max-w-md">
          <div>
            <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight text-foreground">
              De rekening splitsen, zonder rekenwerk.
            </h1>
            <p className="mt-3 text-[17px] leading-relaxed text-muted">
              Jij betaalt. Afgetikt regelt de rest binnen een minuut — geen
              Tikkies achteraf, geen discussie over wie wat had.
            </p>

            <ButtonLink href="/nieuw" size="lg" className="mt-8 w-full">
              Nieuwe rekening starten
            </ButtonLink>
          </div>

          <div>
            <div className="mb-5 text-xs font-medium uppercase tracking-wide text-muted">
              Hoe het werkt
            </div>
            <ol className="flex flex-col gap-5">
              {steps.map((step, i) => (
                <li key={step.title} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                    <step.icon size={18} strokeWidth={2} />
                  </div>
                  <div>
                    <div className="text-[15px] font-medium text-foreground">
                      {i + 1}. {step.title}
                    </div>
                    <div className="text-sm text-muted">
                      {step.description}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section id="restaurants" className="border-t border-border bg-surface">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-5 py-16">
          <div className="max-w-lg">
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-brand-600">
              Voor restaurants
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Laat gasten hun rekening zelf regelen
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              Hang je eigen QR-code op tafel of bij de kassa. Gasten scannen,
              splitsen de rekening zelf en jij houdt overzicht — zonder dat
              je personeel hoeft te rekenen of Tikkies hoeft na te sturen.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {restaurantFeatures.map((feature) => (
              <div key={feature.title}>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  <feature.icon size={18} strokeWidth={2} />
                </div>
                <div className="text-[15px] font-medium text-foreground">
                  {feature.title}
                </div>
                <p className="mt-1 text-sm text-muted">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/restaurant/registreren" className="sm:w-auto">
              Restaurant aanmelden
            </ButtonLink>
            <Link href="/restaurant/inloggen">
              <Button variant="secondary" className="w-full sm:w-auto">
                Al een account? Inloggen
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-5 py-16">
        <ul className="flex flex-col gap-4 sm:max-w-md">
          {trustPoints.map((point) => (
            <li key={point} className="flex items-start gap-3">
              <CircleCheckBig
                size={18}
                strokeWidth={2}
                className="mt-0.5 shrink-0 text-brand-500"
              />
              <span className="text-[15px] text-foreground">{point}</span>
            </li>
          ))}
        </ul>
      </section>

      <footer className="mt-auto border-t border-border">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-3 px-5 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <ShieldCheck size={14} />
            Afgetikt verwerkt geen betalingen
          </div>
          <div className="flex gap-4 text-xs text-muted">
            <Link href="/restaurant/inloggen" className="hover:text-foreground">
              Restaurant inloggen
            </Link>
            <Link
              href="/restaurant/registreren"
              className="hover:text-foreground"
            >
              Restaurant aanmelden
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
