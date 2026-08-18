import type { MetadataRoute } from "next";

// PWA manifest — installable to a phone home screen. Icons are added in Phase 1.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JosHomes — Houses & shops to rent in Jos",
    short_name: "JosHomes",
    description:
      "Find verified houses and shops to rent in Jos, Plateau State. Browse, inspect, and deal with verified agents.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#059669",
    lang: "en-NG",
    categories: ["business", "shopping", "lifestyle"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
