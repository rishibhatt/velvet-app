"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ExploreCollectionsToolbar } from "@/components/organisms/ExploreCollectionsToolbar";
import { CollectionCardSkeletonGrid } from "@/components/skeletons/CollectionCardSkeletonGrid";
import { ExploreListSkeleton } from "@/components/skeletons/ExploreListRowSkeleton";
import { CollectionCardSkeleton } from "@/components/organisms/CollectionCard";
import type { ExploreViewMode } from "@/components/molecules/ExploreViewToggle";
import { EmptyState } from "@/components/molecules/EmptyState";
import { ErrorAlert } from "@/components/molecules/ErrorAlert";
import { usePublicBoards } from "@/queries/discover/queries";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { Mood } from "@/types/board.types";
import type { PublicBoard, PublicBoardSort } from "@/services/discover/discover.service";
import { COLLECTION_CARD_GRID } from "@/constants/collection-ui";
import { useInfiniteSlice } from "@/hooks/useInfiniteSlice";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";
import { ExploreLeaderboardSection } from "@/components/creator/ExploreLeaderboardSection";
import { ExploreToolbarSkeleton } from "@/components/skeletons/ExploreToolbarSkeleton";
import { useAds } from "@/queries/ads/queries";

const ExploreFeedGrid = dynamic(
  () =>
    import("@/features/explore/components/ExploreFeedGrid").then((m) => m.ExploreFeedGrid),
  { ssr: false },
);

const MotionList = dynamic(
  () => import("@/features/explore/components/ExploreMotionGrid").then((m) => m.ExploreMotionList),
  { ssr: false },
);

interface ExplorePageContentProps {
  initialBoards: PublicBoard[];
  hideEmptyState?: boolean;
}

export function ExplorePageContent({
  initialBoards,
  hideEmptyState = false,
}: ExplorePageContentProps) {
  const { user } = useAuth();
  const [mood, setMood] = useState<Mood | null>(null);
  const [sort, setSort] = useState<PublicBoardSort>("trending");
  const [viewMode, setViewMode] = useState<ExploreViewMode>("grid");

  const filters = useMemo(
    () => ({
      mood,
      sort,
      excludeOwnerId: user?.id,
      limit: 48,
    }),
    [mood, sort, user?.id],
  );

  const isDefaultFilters = mood === null && sort === "trending";

  const { data: boards = [], isLoading, isFetching, isError, error, refetch } =
    usePublicBoards(filters, {
      initialData: isDefaultFilters ? initialBoards : undefined,
    });

  const { visible, sentinelRef, hasMore } = useInfiniteSlice(boards, 12);
  const { data: adsData } = useAds("explore_feed", mood ?? undefined);
  const ads = adsData?.ads ?? [];

  const showLoading = isLoading && boards.length === 0;
  const isRefetching = isFetching && boards.length > 0;

  const showEmpty =
    !showLoading &&
    boards.length === 0 &&
    !(hideEmptyState && isDefaultFilters && !isFetching);

  useEffect(() => {
    track(ANALYTICS_EVENTS.EXPLORE_VIEWED, {
      category: mood,
      sort,
      result_count: boards.length,
    });
  }, [boards.length, mood, sort]);

  const listBoards = viewMode === "list" ? visible : boards;

  return (
    <>
      <ExploreLeaderboardSection />

      {showLoading ? (
        <ExploreToolbarSkeleton />
      ) : (
        <ExploreCollectionsToolbar
          sort={sort}
          onSortChange={setSort}
          mood={mood}
          onMoodChange={setMood}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      )}

      {isError && (
        <ErrorAlert
          className="mb-6"
          error={error}
          title="Couldn't load public collections"
          onRetry={() => refetch()}
        />
      )}

      {showLoading ? (
        viewMode === "grid" ? (
          <CollectionCardSkeletonGrid />
        ) : (
          <ExploreListSkeleton />
        )
      ) : boards.length > 0 ? (
        <div
          className={isRefetching ? "opacity-60 transition-opacity duration-200" : undefined}
          aria-busy={isRefetching}
        >
        {viewMode === "grid" ? (
          <>
            <ExploreFeedGrid
              boards={visible}
              ads={ads}
              onBoardClick={(board) =>
                track(ANALYTICS_EVENTS.EXPLORE_COLLECTION_CLICKED, {
                  collection_id: board.id,
                  category: board.mood,
                })
              }
            />
            {hasMore && (
              <div ref={sentinelRef} className={`${COLLECTION_CARD_GRID} mt-3`}>
                <CollectionCardSkeleton />
                <CollectionCardSkeleton />
              </div>
            )}
          </>
        ) : (
          <>
            <MotionList
              boards={listBoards}
              onBoardClick={(board) =>
                track(ANALYTICS_EVENTS.EXPLORE_COLLECTION_CLICKED, {
                  collection_id: board.id,
                  category: board.mood,
                })
              }
            />
            {hasMore && <div ref={sentinelRef} className="h-4" aria-hidden />}
          </>
        )}
        </div>
      ) : showEmpty ? (
        <EmptyState
          title={
            mood ? "No public collections in this mood yet" : "Nothing to explore yet"
          }
          description={
            mood
              ? "Try another category or check back soon as creators publish more."
              : "When creators mark collections as public, they'll appear here."
          }
        />
      ) : null}
    </>
  );
}
