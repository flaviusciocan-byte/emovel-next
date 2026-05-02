import type { MetadataRoute } from "next";
import { siteUrl } from "./seo";

const routes = [
  "",
  "/ecosystem",
  "/builder",
  "/assistants",
  "/prompt-engine",
  "/docs",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
}
