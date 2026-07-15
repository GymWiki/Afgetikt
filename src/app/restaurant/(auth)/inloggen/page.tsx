import { PageShell } from "@/components/ui/page-shell";
import Link from "next/link";
import { LoginForm } from "./login-form";

export default function InloggenPage() {
  return (
    <PageShell className="gap-6">
      <div className="animate-fade-up">
        <div className="mb-1 text-sm font-semibold tracking-wide text-brand-600">
          Afgetikt voor restaurants
        </div>
        <h1 className="text-xl font-semibold text-foreground">
          Inloggen
        </h1>
      </div>

      <div className="animate-fade-up" style={{ animationDelay: "80ms" }}>
        <LoginForm />
      </div>

      <p className="text-center text-sm text-muted">
        Nog geen account?{" "}
        <Link
          href="/restaurant/registreren"
          className="font-medium text-foreground underline underline-offset-4"
        >
          Maak er een aan
        </Link>
      </p>
    </PageShell>
  );
}
