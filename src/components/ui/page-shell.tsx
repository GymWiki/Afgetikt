import { cn } from "@/lib/cn";
import Link from "next/link";
import type { HTMLAttributes } from "react";
import { Logo } from "@/components/ui/logo";

type PageShellProps = HTMLAttributes<HTMLDivElement> & {
  hideLogo?: boolean;
};

// Mobile-first: één kolom, ruime marges, max-breedte zodat het op desktop
// niet als een uitgerekte mobiele pagina oogt. Een kleine logo bovenaan
// geeft elke pagina hetzelfde vertrouwde merkanker, ook diep in de flow.
export function PageShell({
  className,
  hideLogo,
  children,
  ...props
}: PageShellProps) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-md flex-1 flex-col px-5 py-8 animate-fade-in",
        className,
      )}
      {...props}
    >
      {!hideLogo && (
        <Link href="/" className="mb-6 inline-flex w-fit">
          <Logo size="sm" />
        </Link>
      )}
      {children}
    </div>
  );
}
