import { ButtonLink } from "@/components/ui/button";
import { PageShell } from "@/components/ui/page-shell";
import { Camera, Link2, Users } from "lucide-react";

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

export default function Home() {
  return (
    <PageShell className="justify-between gap-12 py-12">
      <div>
        <div className="mb-2 text-sm font-semibold tracking-wide text-brand-600">
          Afgetikt
        </div>
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
              <div className="text-sm text-muted">{step.description}</div>
            </div>
          </li>
        ))}
      </ol>

      <p className="text-center text-xs text-muted">
        Afgetikt verwerkt geen betalingen. Je deelnemers betalen rechtstreeks
        via jouw eigen betaalverzoek.
      </p>
    </PageShell>
  );
}
