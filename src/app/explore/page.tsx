import type { Metadata } from "next";
import { ExplorePageContent } from "@/features/explore/components/ExplorePageContent";
import { exploreMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = exploreMetadata();

export default function ExplorePage() {
  return <ExplorePageContent />;
}
