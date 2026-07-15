import { ButtonLink } from "@/components/ui/button";
import { PageShell } from "@/components/ui/page-shell";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <PageShell className="flex-1 items-center justify-center gap-4 text-center">
      <div className="flex h-14 w-14 animate-pop items-center justify-center rounded-full bg-black/[0.04] text-muted">
        <SearchX size={26} strokeWidth={2} />
      </div>
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Deze link bestaat niet (meer)
        </h1>
        <p className="mt-1 text-[15px] text-muted">
          Controleer of je de juiste link hebt, of vraag de hoofdbetaler om
          hem opnieuw te delen.
        </p>
      </div>
      <ButtonLink href="/" variant="secondary" className="mt-2">
        Naar de homepage
      </ButtonLink>
    </PageShell>
  );
}
