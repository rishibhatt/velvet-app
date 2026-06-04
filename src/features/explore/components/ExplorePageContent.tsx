"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ExploreFiltersBar } from "@/components/organisms/ExploreFiltersBar";
import { ExploreCollectionCard } from "@/components/organisms/ExploreCollectionCard";
import { CollectionCardSkeletonGrid } from "@/components/skeletons/CollectionCardSkeletonGrid";
import { ExploreListSkeleton } from "@/components/skeletons/ExploreListRowSkeleton";
import { CollectionCardSkeleton } from "@/components/organisms/CollectionCard";
import type { ExploreViewMode } from "@/components/molecules/ExploreViewToggle";
import { ExploreBoardListRow } from "@/components/molecules/ExploreBoardListRow";
import { EmptyState } from "@/components/molecules/EmptyState";
import { ErrorAlert } from "@/components/molecules/ErrorAlert";
import { usePublicBoards } from "@/queries/discover/queries";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { Mood } from "@/types/board.types";
import { COLLECTION_CARD_GRID } from "@/constants/collection-ui";
import { useInfiniteSlice } from "@/hooks/useInfiniteSlice";
import { ROUTES } from "@/constants/routes";
import { fadeUp, stagger } from "@/lib/animations";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";

export function ExplorePageContent() {
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

  const { data: boards = [], isLoading, isError, error, refetch } =
    usePublicBoards(filters);

  const { visible, sentinelRef, hasMore } = useInfiniteSlice(boards, 12);

  useEffect(() => {
    track(ANALYTICS_EVENTS.EXPLORE_VIEWED, {
      category: mood,
      result_count: boards.length,
    });
  }, [boards.length, mood]);

  return (
    <main className="page-container py-4 pb-28 md:py-8 md:pb-12">
      <header className="mb-2 sm:mb-3">
        <h1 className="font-display text-xl text-on-surface sm:text-2xl">
          Explore
        </h1>
        <p className="mt-0.5 text-xs text-on-surface-variant sm:text-sm">
          Public collections from the community
        </p>
      </header>

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

      {isLoading ? (
        viewMode === "grid" ? (
          <CollectionCardSkeletonGrid />
        ) : (
          <ExploreListSkeleton />
        )
      ) : boards.length > 0 ? (
        viewMode === "grid" ? (
          <>
            <motion.div
              className={COLLECTION_CARD_GRID}
              variants={stagger}
              initial="initial"
              animate="animate"
            >
              {visible.map((board) => (
                <motion.div key={board.id} variants={fadeUp}>
                  <ExploreCollectionCard
                    board={board}
                    owner={board.owner}
                    onClick={() =>
                      track(ANALYTICS_EVENTS.EXPLORE_COLLECTION_CLICKED, {
                        collection_id: board.id,
                        category: board.mood,
                      })
                    }
                    publicHref={
                      board.slug && board.owner?.username
                        ? ROUTES.publicCollection(board.owner.username, board.slug)
                        : undefined
                    }
                  />
                </motion.div>
              ))}
            </motion.div>
            {hasMore && (
              <div ref={sentinelRef} className={`${COLLECTION_CARD_GRID} mt-3`}>
                <CollectionCardSkeleton />
                <CollectionCardSkeleton />
              </div>
            )}
          </>
        ) : (
          <motion.ul
            className="space-y-3"
            variants={stagger}
            initial="initial"
            animate="animate"
          >
            {boards.map((board) => (
              <motion.li key={board.id} variants={fadeUp}>
                <ExploreBoardListRow
                  board={board}
                  owner={board.owner}
                  onClick={() =>
                    track(ANALYTICS_EVENTS.EXPLORE_COLLECTION_CLICKED, {
                      collection_id: board.id,
                      category: board.mood,
                    })
                  }
                  publicHref={
                    board.slug && board.owner?.username
                      ? ROUTES.publicCollection(board.owner.username, board.slug)
                      : undefined
                  }
                />
              </motion.li>
            ))}
          </motion.ul>
        )
      ) : (
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
      )}
    </main>
  );
}
