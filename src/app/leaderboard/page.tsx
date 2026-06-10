import type { Metadata } from "next";
import { Suspense } from "react";
import { LeaderboardPageContent } from "@/features/leaderboard/components/LeaderboardPageContent";
import { BRAND } from "@/constants/brand";
import { ROUTES } from "@/constants/routes";
import { generateCanonicalUrl } from "@/lib/seo/canonical";

export const metadata: Metadata = {
  title: `Weekly Leaderboard | ${BRAND.name}`,
  description: `See who's leading the ${BRAND.name} community this week. Top curators ranked by views, likes, and re-saves.`,
  alternates: { canonical: generateCanonicalUrl(ROUTES.leaderboard) },
};

export default function LeaderboardPage() {
  return (
    <Suspense
      fallback={
        <main className="page-container py-stack-lg pb-28">
          <div className="mb-6 h-10 w-48 animate-pulse rounded-xl bg-surface-container-low" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-surface-container-low" />
            ))}
          </div>
        </main>
      }
    >
      <LeaderboardPageContent />
    </Suspense>
  );
}
