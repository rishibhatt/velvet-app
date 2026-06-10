import type { MetadataRoute } from "next";
import { generateVelvetSitemap } from "@/lib/seo/sitemap";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return generateVelvetSitemap();
}
