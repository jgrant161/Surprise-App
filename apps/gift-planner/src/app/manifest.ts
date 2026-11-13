import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Surprise Stash",
    short_name: "Stash",
    description: "The family gift list that keeps the secret: hidden lists, claims, occasions and budgets.",
    start_url: "/",
    display: "standalone",
    background_color: "#fdf8f3",
    theme_color: "#d9486b",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
