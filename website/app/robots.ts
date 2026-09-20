import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/checkout/return"],
      },
    ],
    sitemap: "https://igexport.auraflame.tech/sitemap.xml",
    host: "https://igexport.auraflame.tech",
  };
}
