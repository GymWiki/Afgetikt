"use client";

import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addRestaurantAction } from "../../actions";

export function NewRestaurantForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
          const result = await addRestaurantAction(formData);
          if (!result.ok) {
            setError(result.error);
            return;
          }
          router.push("/restaurant");
          router.refresh();
        });
      }}
    >
      <div>
        <Label htmlFor="name">Naam van het restaurant</Label>
        <Input id="name" name="name" placeholder="Bijv. Café Central" required autoFocus />
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? "Bezig…" : "Restaurant toevoegen"}
      </Button>
    </form>
  );
}
