"use client";

import { ButtonLink, Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { MailCheck } from "lucide-react";
import { useState, useTransition } from "react";
import { registerAction } from "./actions";

export function RegisterForm({ next }: { next: string }) {
  const [error, setError] = useState<string | null>(null);
  const [confirmEmail, setConfirmEmail] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (confirmEmail) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <MailCheck size={22} strokeWidth={2} />
        </div>
        <div>
          <div className="text-[15px] font-medium text-foreground">
            Check je e-mail
          </div>
          <p className="mt-1 text-sm text-muted">
            We hebben een bevestigingslink gestuurd. Klik erop om je account
            te activeren en in te loggen.
          </p>
        </div>
        <ButtonLink href="/inloggen" variant="secondary" className="mt-2 w-full">
          Naar inloggen
        </ButtonLink>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
          const result = await registerAction(next, formData);
          if (!result.ok) {
            setError(result.error);
            return;
          }
          if (result.needsEmailConfirmation) setConfirmEmail(true);
        });
      }}
    >
      <div>
        <Label htmlFor="email">E-mailadres</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          autoFocus
        />
      </div>
      <div>
        <Label htmlFor="password">Wachtwoord</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <p className="mt-1.5 text-xs text-muted">Minimaal 8 tekens.</p>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? "Bezig…" : "Account aanmaken"}
      </Button>
    </form>
  );
}
