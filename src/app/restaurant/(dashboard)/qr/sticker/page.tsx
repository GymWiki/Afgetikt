import { ButtonLink } from "@/components/ui/button";
import { isAccessBlocked } from "@/lib/billing";
import { generateQrSvg, restaurantUrl } from "@/lib/qr";
import { requireCurrentRestaurant } from "@/lib/restaurants";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { PrintButton } from "./print-button";

export default async function StickerPage() {
  const { restaurant } = await requireCurrentRestaurant();
  if (isAccessBlocked(restaurant)) redirect("/restaurant/qr");

  const svg = await generateQrSvg(restaurantUrl(restaurant.slug));

  return (
    <div className="flex flex-col items-center gap-6 print:gap-0">
      <div className="flex w-full max-w-sm items-center justify-between print:hidden">
        <ButtonLink href="/restaurant/qr" variant="ghost">
          <ArrowLeft size={16} />
          Terug
        </ButtonLink>
      </div>

      <div className="flex aspect-[3/4] w-full max-w-sm flex-col items-center justify-center gap-6 rounded-3xl border border-border bg-surface p-10 text-center print:aspect-auto print:min-h-screen print:w-full print:max-w-none print:rounded-none print:border-0">
        <div className="text-sm font-medium tracking-wide text-muted uppercase">
          {restaurant.name}
        </div>
        <div
          className="h-64 w-64"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Scan &amp; tik af
          </h1>
          <p className="mt-1 text-[15px] text-muted">
            Fotografeer de bon, deel de link, betaal je deel.
          </p>
        </div>
      </div>

      <PrintButton />
    </div>
  );
}
