"use client";

import { Button, ButtonLink } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { MailCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  logInAndClaimBillAction,
  signUpAndClaimBillAction,
  type AccountGateResult,
} from "./actions";

export function AccountGateForm({
  billId,
  managerToken,
  klaarHref,
}: {
  billId: string;
  managerToken: string;
  klaarHref: string;
}) {
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [error, setError] = useState<string | null>(null);
  const [confirmEmail, setConfirmEmail] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleResult(result: AccountGateResult) {
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (result.needsEmailConfirmation) {
      setConfirmEmail(true);
      return;
    }
    router.push(klaarHref);
  }

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
            We hebben een bevestigingslink gestuurd om je account te
            activeren. Je bon staat al klaar om te delen.
          </p>
        </div>
        <ButtonLink href={klaarHref} className="mt-2 w-full">
          Verder naar delen
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
          const result =
            mode === "signup"
              ? await signUpAndClaimBillAction(billId, managerToken, formData)
              : await logInAndClaimBillAction(billId, managerToken, formData);
          handleResult(result);
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
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          minLength={mode === "signup" ? 8 : undefined}
          required
        />
        {mode === "signup" && (
          <p className="mt-1.5 text-xs text-muted">Minimaal 8 tekens.</p>
        )}
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={isPending}>
        {isPending
          ? "Bezig…"
          : mode === "signup"
            ? "Account aanmaken en delen"
            : "Inloggen en delen"}
      </Button>

      <button
        type="button"
        onClick={() => {
          setError(null);
          setMode(mode === "signup" ? "login" : "signup");
        }}
        className="text-center text-sm text-muted underline underline-offset-4 hover:text-foreground"
      >
        {mode === "signup"
          ? "Al een account? Log in"
          : "Nog geen account? Maak er een aan"}
      </button>
    </form>
  );
}
