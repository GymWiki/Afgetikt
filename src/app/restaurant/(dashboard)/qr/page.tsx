import { Button, ButtonLink } from "@/components/ui/button";
import { isAccessBlocked } from "@/lib/billing";
import { generateQrSvg, restaurantUrl } from "@/lib/qr";
import { requireCurrentRestaurant } from "@/lib/restaurants";
import { Printer } from "lucide-react";
import { Paywall } from "../paywall";

export default async function QrPage() {
  const { restaurant } = await requireCurrentRestaurant();

  if (isAccessBlocked(restaurant)) {
    return <Paywall restaurantName={restaurant.name} />;
  }

  const url = restaurantUrl(restaurant.slug);
  const svg = await generateQrSvg(url);
  const downloadHref = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

  return (
    <div className="flex flex-col gap-8">
      <div className="animate-fade-up">
        <h1 className="text-xl font-semibold text-foreground">Jouw QR-code</h1>
        <p className="mt-1 text-[15px] text-muted">
          Zet deze op tafel of bij de kassa. Gasten scannen, fotograferen de
          bon en kiezen direct hun producten — sneller dan zelf een link
          opzoeken.
        </p>
      </div>

      <div
        className="flex animate-fade-up flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-8"
        style={{ animationDelay: "80ms" }}
      >
        <div
          className="h-56 w-56"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <div className="text-sm text-muted">{url}</div>
      </div>

      <div className="flex animate-fade-up flex-col gap-2 sm:flex-row" style={{ animationDelay: "140ms" }}>
        <a href={downloadHref} download={`afgetikt-qr-${restaurant.slug}.svg`}>
          <Button variant="secondary" className="w-full">
            QR-code downloaden (SVG)
          </Button>
        </a>
        <ButtonLink href="/restaurant/qr/sticker" className="w-full">
          <Printer size={18} />
          Tafelsticker afdrukken
        </ButtonLink>
      </div>
    </div>
  );
}
