import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

// Mobile-first: één kolom, ruime marges, max-breedte zodat het op desktop
// niet als een uitgerekte mobiele pagina oogt.
export function PageShell({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-md flex-1 flex-col px-5 py-8",
        className,
      )}
      {...props}
    />
  );
}
