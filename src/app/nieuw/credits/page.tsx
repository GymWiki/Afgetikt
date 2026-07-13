import { PageShell } from "@/components/ui/page-shell";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CreditPackPicker } from "./credit-pack-picker";

export default function CreditsPage() {
  return (
    <PageShell className="gap-6">
      <Link
        href="/nieuw"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Terug
      </Link>

      <div>
        <h1 className="text-xl font-semibold text-foreground">Meer bonnen scannen</h1>
        <p className="mt-1 text-[15px] text-muted">
          Koop een pakket en ga direct verder. Via de QR-code van een
          Afgetikt-restaurant blijft scannen altijd gratis.
        </p>
      </div>

      <CreditPackPicker />
    </PageShell>
  );
}
