import { Button, ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Reveal } from "@/components/ui/reveal";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  ArrowRight,
  BarChart3,
  Camera,
  CircleCheckBig,
  Link2,
  QrCode,
  ShieldCheck,
  Sticker,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ReceiptPreviewCard } from "./receipt-preview-card";

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

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-6">
        <Link href="/">
          <Logo size="md" />
        </Link>
        <Link
          href="#restaurants"
          className="text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          Voor restaurants
        </Link>
      </header>

      <section className="relative mx-auto w-full max-w-5xl overflow-hidden px-5 pb-20 pt-6 sm:pt-10">
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

        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-8">
          <div>
            <div
              className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold tracking-wide text-brand-600 animate-fade-up"
              style={{ animationDelay: "0ms" }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent motion-safe:animate-pop" />
              Scan · Tik · Klaar
            </div>
            <h1
              className="text-[2.25rem] font-bold leading-[1.1] tracking-tight text-foreground animate-fade-up sm:text-5xl"
              style={{ animationDelay: "80ms" }}
            >
              De rekening splitsen, zonder rekenwerk.
            </h1>
            <p
              className="mt-4 max-w-md text-[17px] leading-relaxed text-muted animate-fade-up"
              style={{ animationDelay: "160ms" }}
            >
              Jij betaalt. Afgetikt regelt de rest binnen een minuut — geen
              Tikkies achteraf, geen discussie over wie wat had.
            </p>

            <div
              className="mt-8 flex flex-col gap-3 animate-fade-up sm:flex-row"
              style={{ animationDelay: "240ms" }}
            >
              <ButtonLink href="/nieuw" size="lg" className="group sm:w-auto">
                Nieuwe rekening starten
                <ArrowRight
                  size={18}
                  strokeWidth={2.5}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </ButtonLink>
            </div>

            <div
              className="mt-10 flex items-center gap-6 border-t border-border pt-6 animate-fade-up"
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

        <div className="mt-20">
          <Reveal>
            <div className="mb-6 text-xs font-semibold uppercase tracking-wide text-muted">
              Hoe het werkt
            </div>
          </Reveal>
          <ol className="grid gap-5 sm:grid-cols-3">
            {steps.map((step, i) => (
              <li key={step.title}>
                <Reveal delay={i * 100}>
                  <div className="h-full rounded-2xl border border-border bg-surface p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_12px_24px_-12px_rgba(18,36,32,0.18)]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                      <step.icon size={18} strokeWidth={2} />
                    </div>
                    <div className="mt-3 text-[15px] font-semibold text-foreground">
                      {i + 1}. {step.title}
                    </div>
                    <div className="mt-1 text-sm leading-relaxed text-muted">
                      {step.description}
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="restaurants" className="border-t border-border bg-surface">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-5 py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <Reveal>
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-600">
                  Voor restaurants
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
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
                alt="Afgetikt"
                width={200}
                height={200}
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
                  <div className="text-[15px] font-semibold text-foreground">
                    {feature.title}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {feature.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-5 py-16">
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

      <footer className="mt-auto border-t border-border">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 px-5 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <Logo size="sm" />
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <ShieldCheck size={14} />
              Afgetikt verwerkt geen betalingen
            </div>
            <div className="flex gap-4 text-xs text-muted">
              <Link
                href="/restaurant/inloggen"
                className="transition-colors hover:text-foreground"
              >
                Restaurant inloggen
              </Link>
              <Link
                href="/restaurant/registreren"
                className="transition-colors hover:text-foreground"
              >
                Restaurant aanmelden
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
