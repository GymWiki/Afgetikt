import { PageShell } from "@/components/ui/page-shell";
import Link from "next/link";
import { LoginForm } from "./login-form";

export default async function InloggenPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  return (
    <PageShell className="gap-6">
      <div className="animate-fade-up">
        <h1 className="text-xl font-semibold text-foreground">Inloggen</h1>
        <p className="mt-1 text-[15px] text-muted">
          Log in om je bonnen terug te zien.
        </p>
      </div>

      <div className="animate-fade-up" style={{ animationDelay: "80ms" }}>
        <LoginForm next={safeNext} />
      </div>

      <p className="text-center text-sm text-muted">
        Nog geen account?{" "}
        <Link
          href={`/registreren?next=${encodeURIComponent(safeNext)}`}
          className="font-medium text-foreground underline underline-offset-4"
        >
          Maak er een aan
        </Link>
      </p>
    </PageShell>
  );
}
