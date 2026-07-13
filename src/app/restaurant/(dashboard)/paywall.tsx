import { ButtonLink } from "@/components/ui/button";
import { Lock } from "lucide-react";

export function Paywall({ restaurantName }: { restaurantName: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-700">
        <Lock size={22} strokeWidth={2} />
      </div>
      <div>
        <div className="text-[15px] font-medium text-foreground">
          Je proefperiode voor {restaurantName} is verlopen
        </div>
        <p className="mt-1 max-w-sm text-sm text-muted">
          Kies een abonnement om je QR-code, dashboard en statistieken weer
          te gebruiken.
        </p>
      </div>
      <ButtonLink href="/restaurant/abonnement" className="mt-2">
        Abonnement kiezen
      </ButtonLink>
    </div>
  );
}
