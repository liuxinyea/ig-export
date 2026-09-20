import type { MetadataRoute } from "next";

const BASE_URL = "https://igexport.auraflame.tech";
const locales = ["en", "zh"];

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: "", priority: 1, frequency: "weekly" as const },
    { path: "/ig-follower-export-tool", priority: 0.9, frequency: "weekly" as const },
    { path: "/pricing", priority: 0.9, frequency: "monthly" as const },
    { path: "/docs/overview/introduction", priority: 0.7, frequency: "monthly" as const },
    { path: "/docs/overview/quick-start", priority: 0.8, frequency: "monthly" as const },
    { path: "/docs/reference/supported-fields", priority: 0.7, frequency: "monthly" as const },
    { path: "/docs/reference/troubleshooting", priority: 0.7, frequency: "monthly" as const },
    { path: "/support", priority: 0.6, frequency: "monthly" as const },
    { path: "/privacy", priority: 0.3, frequency: "monthly" as const },
    { path: "/terms", priority: 0.3, frequency: "monthly" as const },
  ];
  const lastModified = new Date();

  return locales.flatMap((locale) =>
    routes.map((route) => ({
      url: `${BASE_URL}/${locale}${route.path}`,
      lastModified,
      changeFrequency: route.frequency,
      priority: route.priority,
    }))
  );
}
