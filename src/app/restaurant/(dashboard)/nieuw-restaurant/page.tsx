import { ButtonLink } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { NewRestaurantForm } from "./new-restaurant-form";

export default function NieuwRestaurantPage() {
  return (
    <div className="flex flex-col gap-6">
      <ButtonLink href="/restaurant" variant="ghost" className="w-fit px-0">
        <ArrowLeft size={16} />
        Terug
      </ButtonLink>

      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Nieuw restaurant toevoegen
        </h1>
        <p className="mt-1 text-[15px] text-muted">
          Beheer meerdere restaurants vanuit hetzelfde account. Elk restaurant
          krijgt zijn eigen QR-code en abonnement.
        </p>
      </div>

      <div className="max-w-sm rounded-2xl border border-border bg-surface p-5">
        <NewRestaurantForm />
      </div>
    </div>
  );
}
