import type { Metadata } from "next";
import { ExplorePageContent } from "@/features/explore/components/ExplorePageContent";
import { ExploreEmptyStatic } from "@/features/explore/components/ExploreEmptyStatic";
import { ExploreStaticHeader } from "@/features/explore/components/ExploreStaticHeader";
import { getExploreBoardsServer } from "@/lib/discover-server";
import { exploreMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = exploreMetadata();

export const revalidate = 60;

export default async function ExplorePage() {
  const initialBoards = await getExploreBoardsServer({
    sort: "trending",
    limit: 48,
  });

  const isInitiallyEmpty = initialBoards.length === 0;

  return (
    <main className="page-container py-4 pb-28 md:py-8 md:pb-12">
      <ExploreStaticHeader />
      {isInitiallyEmpty && <ExploreEmptyStatic />}
      <ExplorePageContent
        initialBoards={initialBoards}
        hideEmptyState={isInitiallyEmpty}
      />
    </main>
  );
}
