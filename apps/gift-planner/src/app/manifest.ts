import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Surprise",
    short_name: "Surprise",
    description: "Family gift planner with hidden lists, occasions and budgets.",
    start_url: "/",
    display: "standalone",
    background_color: "#fdf8f3",
    theme_color: "#d9486b",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
