"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Compass } from "lucide-react";
import {
  BoardCard,
  BoardCardSkeleton,
} from "@/components/organisms/BoardCard";
import { MoodFilterChips } from "@/components/molecules/MoodFilterChips";
import { DiscoverSortToggle } from "@/components/molecules/DiscoverSortToggle";
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
      <motion.section className="mb-6" {...fadeUp}>
        <div className="mb-2 flex items-center gap-2 text-primary">
          <Compass className="h-6 w-6" aria-hidden />
          <span className="text-sm font-semibold uppercase tracking-wide">
            Discover
          </span>
        </div>
        <h1 className="font-display text-2xl text-on-surface md:text-3xl">
          Public collections
        </h1>
        <p className="mt-2 max-w-prose text-sm text-on-surface-variant md:text-base">
          Browse inspiration from the Velvet community — filter by mood or see
          what&apos;s trending.
        </p>
      </motion.section>

      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <DiscoverSortToggle value={sort} onChange={setSort} />
        <Link
          href={ROUTES.search}
          className="text-center text-sm font-semibold text-primary hover:underline sm:text-right"
        >
          Search people &amp; boards →
        </Link>
      </div>

      <MoodFilterChips value={mood} onChange={setMood} className="mb-8" />

      {isError && (
        <ErrorAlert
          className="mb-6"
          error={error}
          title="Couldn't load public collections"
          onRetry={() => refetch()}
        />
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <BoardCardSkeleton key={i} />
          ))}
        </div>
      ) : boards.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          variants={stagger}
          initial="initial"
          animate="animate"
        >
          {boards.map((board) => (
            <motion.div key={board.id} variants={fadeUp}>
              <BoardCard
                board={board}
                showLike
                owner={board.owner}
                publicHref={
                  board.slug ? ROUTES.publicCollection(board.slug) : undefined
                }
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <EmptyState
          title={mood ? "No public collections in this mood yet" : "Nothing to explore yet"}
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
