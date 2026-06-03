import type { MetadataRoute } from "next";
import { velvetRobots } from "@/lib/seo/robots";

export default function robots(): MetadataRoute.Robots {
  return velvetRobots();
}
