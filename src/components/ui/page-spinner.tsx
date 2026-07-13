import { PageShell } from "@/components/ui/page-shell";
import { Loader2 } from "lucide-react";

export function PageSpinner() {
  return (
    <PageShell className="flex-1 items-center justify-center">
      <Loader2 size={22} className="animate-spin text-muted" />
    </PageShell>
  );
}
