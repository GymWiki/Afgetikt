"use client";

import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Check } from "lucide-react";
import { useState, useTransition } from "react";
import { updateRestaurantNameAction } from "./actions";

export function SettingsForm({
  restaurantId,
  initialName,
}: {
  restaurantId: string;
  initialName: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        setSaved(false);
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
          const result = await updateRestaurantNameAction(restaurantId, formData);
          if (!result.ok) {
            setError(result.error);
            return;
          }
          setSaved(true);
        });
      }}
    >
      <div>
        <Label htmlFor="name">Restaurantnaam</Label>
        <Input id="name" name="name" defaultValue={initialName} required />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Opslaan…" : "Opslaan"}
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-brand-600">
            <Check size={16} strokeWidth={2.5} />
            Opgeslagen
          </span>
        )}
      </div>
    </form>
  );
}
