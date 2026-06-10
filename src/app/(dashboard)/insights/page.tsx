import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo/metadata";
import { InsightsPageContent } from "@/features/insights/components/InsightsPageContent";

export const metadata: Metadata = noIndexMetadata("Creator Insights");

export default function InsightsPage() {
  return <InsightsPageContent />;
}
