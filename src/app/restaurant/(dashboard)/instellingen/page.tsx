import { requireCurrentRestaurant } from "@/lib/restaurants";
import { SettingsForm } from "./settings-form";

export default async function InstellingenPage() {
  const { user, restaurant } = await requireCurrentRestaurant();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Instellingen</h1>
        <p className="mt-1 text-[15px] text-muted">
          Ingelogd als {user.email}
        </p>
      </div>

      <div className="max-w-sm rounded-2xl border border-border bg-surface p-5">
        <SettingsForm restaurantId={restaurant.id} initialName={restaurant.name} />
      </div>
    </div>
  );
}
