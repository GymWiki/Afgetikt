import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Afgetikt",
    short_name: "Afgetikt",
    description: "De rekening splitsen zonder gedoe.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafaf8",
    theme_color: "#fafaf8",
    icons: [],
  };
}
