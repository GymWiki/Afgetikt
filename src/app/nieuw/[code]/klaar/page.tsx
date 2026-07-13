import { PageShell } from "@/components/ui/page-shell";
import { CircleCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { ShareCard } from "./share-card";

export default async function KlaarPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ key?: string; pid?: string; ptoken?: string }>;
}) {
  const { code } = await params;
  const { key, pid, ptoken } = await searchParams;

  if (!key || !pid || !ptoken) notFound();

  return (
    <PageShell className="gap-6">
      <div className="flex flex-col items-center gap-3 pt-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <CircleCheck size={28} strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            De rekening staat klaar
          </h1>
          <p className="mt-1 text-[15px] text-muted">
            Deel de link met je tafelgenoten. Iedereen kiest zelf wat hij of
            zij had.
          </p>
        </div>
      </div>

      <ShareCard
        billId={code}
        managerToken={key}
        payerId={pid}
        payerAccessToken={ptoken}
      />
    </PageShell>
  );
}
