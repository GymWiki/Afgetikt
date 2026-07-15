import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        // Bon-/rekeninglinks zijn privé (alleen bereikbaar via een geheime
        // code/token) en hebben geen SEO-waarde.
        "/nieuw/*/",
        "/b/",
        "/dashboard",
        "/r/",
        "/restaurant/qr",
        "/restaurant/instellingen",
        "/restaurant/abonnement",
        "/restaurant/nieuw-restaurant",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
