"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ExploreFiltersBar } from "@/components/organisms/ExploreFiltersBar";
import { CollectionCardSkeletonGrid } from "@/components/skeletons/CollectionCardSkeletonGrid";
import { ExploreListSkeleton } from "@/components/skeletons/ExploreListRowSkeleton";
import { CollectionCardSkeleton } from "@/components/organisms/CollectionCard";
import type { ExploreViewMode } from "@/components/molecules/ExploreViewToggle";
import { EmptyState } from "@/components/molecules/EmptyState";
import { ErrorAlert } from "@/components/molecules/ErrorAlert";
import { usePublicBoards } from "@/queries/discover/queries";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { Mood } from "@/types/board.types";
import type { PublicBoard } from "@/services/discover/discover.service";
import { COLLECTION_CARD_GRID } from "@/constants/collection-ui";
import { useInfiniteSlice } from "@/hooks/useInfiniteSlice";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";

const MotionGrid = dynamic(
  () => import("@/features/explore/components/ExploreMotionGrid").then((m) => m.ExploreMotionGrid),
  { ssr: false },
);

const MotionList = dynamic(
  () => import("@/features/explore/components/ExploreMotionGrid").then((m) => m.ExploreMotionList),
  { ssr: false },
);

interface ExplorePageContentProps {
  initialBoards: PublicBoard[];
  /** Server already rendered empty UI — skip duplicate on first paint */
  hideEmptyState?: boolean;
}

export function ExplorePageContent({
  initialBoards,
  hideEmptyState = false,
}: ExplorePageContentProps) {
  const { user } = useAuth();
  const [mood, setMood] = useState<Mood | null>(null);
  const [viewMode, setViewMode] = useState<ExploreViewMode>("grid");

  const filters = useMemo(
    () => ({
      mood,
      sort: "trending" as const,
      excludeOwnerId: user?.id,
      limit: 48,
    }),
    [mood, user?.id],
  );

  const isDefaultFilters = mood === null;

  const { data: boards = [], isLoading, isFetching, isError, error, refetch } =
    usePublicBoards(filters, {
      initialData: isDefaultFilters ? initialBoards : undefined,
    });

  const { visible, sentinelRef, hasMore } = useInfiniteSlice(boards, 12);

  const showLoading =
    (isLoading || (isFetching && boards.length === 0)) && !isDefaultFilters;

  const showEmpty =
    !showLoading &&
    boards.length === 0 &&
    !(hideEmptyState && isDefaultFilters && !isFetching);

  useEffect(() => {
    track(ANALYTICS_EVENTS.EXPLORE_VIEWED, {
      category: mood,
      result_count: boards.length,
    });
  }, [boards.length, mood]);

  return (
    <>
      <ExploreFiltersBar
        mood={mood}
        onMoodChange={setMood}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        resultCount={boards.length}
      />

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
        viewMode === "grid" ? (
          <>
            <MotionGrid
              boards={visible}
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
          <MotionList
            boards={boards}
            onBoardClick={(board) =>
              track(ANALYTICS_EVENTS.EXPLORE_COLLECTION_CLICKED, {
                collection_id: board.id,
                category: board.mood,
              })
            }
          />
        )
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
