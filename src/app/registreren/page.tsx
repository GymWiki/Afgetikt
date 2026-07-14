import { PageShell } from "@/components/ui/page-shell";
import Link from "next/link";
import { RegisterForm } from "./register-form";

export default async function RegistrerenPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  return (
    <PageShell className="gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Maak een account
        </h1>
        <p className="mt-1 text-[15px] text-muted">
          Zie al je bonnen terug en hou bij wie er heeft betaald.
        </p>
      </div>

      <RegisterForm next={safeNext} />

      <p className="text-center text-sm text-muted">
        Al een account?{" "}
        <Link
          href={`/inloggen?next=${encodeURIComponent(safeNext)}`}
          className="font-medium text-foreground underline underline-offset-4"
        >
          Log in
        </Link>
      </p>
    </PageShell>
  );
}
