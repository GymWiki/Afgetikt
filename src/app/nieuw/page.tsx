import { PageShell } from "@/components/ui/page-shell";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ReceiptUploader } from "./receipt-uploader";
import { startManualBillAction } from "./actions";

export default function NieuwePage() {
  return (
    <PageShell className="gap-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Terug
      </Link>

      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Nieuwe rekening
        </h1>
        <p className="mt-1 text-[15px] text-muted">
          Afgetikt herkent automatisch de producten en prijzen op de bon.
        </p>
      </div>

      <ReceiptUploader />

      <form action={startManualBillAction} className="text-center">
        <button
          type="submit"
          className="text-sm text-muted underline underline-offset-4 hover:text-foreground"
        >
          Liever zelf producten invoeren
        </button>
      </form>
    </PageShell>
  );
}
