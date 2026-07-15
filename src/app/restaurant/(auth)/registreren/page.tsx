import { PageShell } from "@/components/ui/page-shell";
import Link from "next/link";
import { RegisterForm } from "./register-form";

export default function RegistrerenPage() {
  return (
    <PageShell className="gap-6">
      <div className="animate-fade-up">
        <div className="mb-1 text-sm font-semibold tracking-wide text-brand-600">
          Afgetikt voor restaurants
        </div>
        <h1 className="text-xl font-semibold text-foreground">
          Maak je restaurantaccount
        </h1>
        <p className="mt-1 text-[15px] text-muted">
          Dashboard, QR-code en statistieken voor je restaurant.
        </p>
      </div>

      <div className="animate-fade-up" style={{ animationDelay: "80ms" }}>
        <RegisterForm />
      </div>

      <p className="text-center text-sm text-muted">
        Al een account?{" "}
        <Link
          href="/restaurant/inloggen"
          className="font-medium text-foreground underline underline-offset-4"
        >
          Log in
        </Link>
      </p>
    </PageShell>
  );
}
