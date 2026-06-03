import type { MetadataRoute } from "next";
import { generateCanonicalUrl } from "@/lib/seo/canonical";

export function velvetRobots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/settings", "/admin", "/api", "/login", "/signup", "/forgot-password", "/auth"],
    },
    sitemap: generateCanonicalUrl("/sitemap.xml"),
  };
}
