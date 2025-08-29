import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hiruko",
    short_name: "Hiruko",
    description: "Personal Finance Tracker",
    start_url: "/",
    display: "standalone",
    background_color: "#537979",
    theme_color: "#FDD535",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
