import type { MetadataRoute } from "next";
import { generateCanonicalUrl } from "@/lib/seo/canonical";

export function velvetRobots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/explore", "/u/", "/wedding", "/travel", "/home", "/fashion", "/events", "/lifestyle", "/tag/", "/brands"],
      disallow: [
        "/$",
        "/api/",
        "/boards/",
        "/profile",
        "/settings",
        "/onboarding",
        "/search",
        "/insights",
        "/notifications",
        "/login",
        "/signup",
        "/forgot-password",
        "/auth",
      ],
    },
    sitemap: generateCanonicalUrl("/sitemap.xml"),
  };
}
