import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/coordinator/", "/vrijwilliger/", "/familie/", "/account/", "/demo/"],
    },
    sitemap: "https://welzijnsklik.nl/sitemap.xml",
  };
}
