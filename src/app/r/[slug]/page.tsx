import { PageShell } from "@/components/ui/page-shell";
import { ReceiptUploader } from "@/app/nieuw/receipt-uploader";
import { startManualBillAction } from "@/app/nieuw/actions";
import { getRestaurantBySlug } from "@/lib/restaurants";
import { notFound } from "next/navigation";

// Bonherkenning via Claude Vision kan langer duren dan het standaard
// serverless-timeout; verruim dit voor de Server Action op deze pagina.
export const maxDuration = 60;

export default async function RestaurantQrLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) notFound();

  return (
    <PageShell className="gap-6">
      <div className="animate-fade-up">
        <div className="mb-1 text-sm font-semibold tracking-wide text-brand-600">
          {restaurant.name}
        </div>
        <h1 className="text-xl font-semibold text-foreground">
          Fotografeer de bon
        </h1>
        <p className="mt-1 text-[15px] text-muted">
          Afgetikt herkent de producten automatisch. Daarna verdeel je de
          rekening met je tafelgenoten.
        </p>
      </div>

      <div className="animate-fade-up" style={{ animationDelay: "80ms" }}>
        <ReceiptUploader restaurantId={restaurant.id} />
      </div>

      <form action={startManualBillAction} className="text-center">
        <input type="hidden" name="restaurantId" value={restaurant.id} />
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
