"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ExploreHero } from "@/components/organisms/ExploreHero";
import { ExploreFiltersBar } from "@/components/organisms/ExploreFiltersBar";
import {
  ExploreCollectionCard,
  ExploreCollectionCardSkeleton,
} from "@/components/organisms/ExploreCollectionCard";
import type { ExploreViewMode } from "@/components/molecules/ExploreViewToggle";
import { ExploreBoardListRow } from "@/components/molecules/ExploreBoardListRow";
import { EmptyState } from "@/components/molecules/EmptyState";
import { ErrorAlert } from "@/components/molecules/ErrorAlert";
import { usePublicBoards } from "@/queries/discover/queries";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { PublicBoardSort } from "@/services/discover/discover.service";
import type { Mood } from "@/types/board.types";
import { ROUTES } from "@/constants/routes";
import { fadeUp, stagger } from "@/lib/animations";

export default function ExplorePage() {
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

  const { data: boards = [], isLoading, isError, error, refetch } =
    usePublicBoards(filters);

  return (
    <main className="page-container py-stack-lg pb-28 md:py-12 md:pb-12">
      <ExploreHero sort={sort} onSortChange={setSort} />

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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ExploreCollectionCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl skeleton-shimmer" />
            ))}
          </div>
        )
      ) : boards.length > 0 ? (
        viewMode === "grid" ? (
          <motion.div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4"
            variants={stagger}
            initial="initial"
            animate="animate"
          >
            {boards.map((board) => (
              <motion.div key={board.id} variants={fadeUp}>
                <ExploreCollectionCard
                  board={board}
                  owner={board.owner}
                  publicHref={
                    board.slug ? ROUTES.publicCollection(board.slug) : undefined
                  }
                />
              </motion.div>
            ))}
          </motion.div>
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
                  publicHref={
                    board.slug ? ROUTES.publicCollection(board.slug) : undefined
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
