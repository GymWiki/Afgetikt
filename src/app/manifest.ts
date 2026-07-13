import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Afgetikt",
    short_name: "Afgetikt",
    description: "De rekening splitsen zonder gedoe.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f8f7",
    theme_color: "#f5f8f7",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
