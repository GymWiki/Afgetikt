import { Button, ButtonLink } from "@/components/ui/button";
import { generateQrSvg, restaurantUrl } from "@/lib/qr";
import { getRestaurantByOwner } from "@/lib/restaurants";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Printer } from "lucide-react";
import { redirect } from "next/navigation";

export default async function QrPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/restaurant/inloggen");

  const restaurant = await getRestaurantByOwner(user.id);
  if (!restaurant) redirect("/restaurant/registreren");

  const url = restaurantUrl(restaurant.slug);
  const svg = await generateQrSvg(url);
  const downloadHref = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Jouw QR-code</h1>
        <p className="mt-1 text-[15px] text-muted">
          Zet deze op tafel of bij de kassa. Gasten scannen, fotograferen de
          bon en kiezen direct hun producten — sneller dan zelf een link
          opzoeken.
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-8">
        <div
          className="h-56 w-56"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <div className="text-sm text-muted">{url}</div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
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
