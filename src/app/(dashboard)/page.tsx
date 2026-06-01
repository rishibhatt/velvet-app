"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/atoms/Button";
import {
  ShowcaseBoardCard,
  ShowcaseBoardCardSkeleton,
} from "@/components/organisms/ShowcaseBoardCard";
import { HomeHero } from "@/components/organisms/HomeHero";
import { DiscoverSectionHeader } from "@/components/molecules/DiscoverSectionHeader";
import { EmptyState } from "@/components/molecules/EmptyState";
import { ErrorAlert } from "@/components/molecules/ErrorAlert";
import { useBoards } from "@/queries/board/queries";
import { usePublicBoards } from "@/queries/discover/queries";
import { useModalStore } from "@/store/modal.store";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getGreeting } from "@/utils/format";
import { fadeUp, stagger } from "@/lib/animations";
import { isSupabaseConfigured } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { UI_LABELS } from "@/constants/ui-labels";

export default function HomePage() {
  const router = useRouter();
  const { data: boards, isLoading, isError, error, refetch } = useBoards();
  const { openCreateBoard } = useModalStore();
  const { profile, user } = useAuth();
  const { data: discoverPreview = [], isLoading: discoverLoading } =
    usePublicBoards({
      sort: "trending",
      limit: 4,
      excludeOwnerId: user?.id,
    });

  useEffect(() => {
    if (!isSupabaseConfigured() || isLoading || isError) return;
    if (boards && boards.length === 0) {
      const skipped = sessionStorage.getItem("velvet_onboarding_skip");
      if (!skipped) {
        router.replace("/onboarding");
      }
    }
  }, [boards, isLoading, isError, router]);

  return (
    <main className="page-container py-stack-lg md:py-12">
      {isError && (
        <ErrorAlert
          className="mb-6"
          error={error}
          title="Couldn't load your collections"
          onRetry={() => refetch()}
        />
      )}

      <HomeHero greeting={getGreeting(profile?.full_name)} />

      {(discoverLoading || discoverPreview.length > 0) && (
        <section className="velvet-panel mb-6 p-4 sm:p-6 md:mb-8">
          <DiscoverSectionHeader />
          {discoverLoading ? (
            <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-1 hide-scrollbar sm:grid sm:grid-cols-2 sm:overflow-visible md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[min(82vw,300px)] shrink-0 sm:w-auto"
                >
                  <ShowcaseBoardCardSkeleton />
                </div>
              ))}
            </div>
          ) : (
            <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-1 hide-scrollbar sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible md:gap-6 lg:grid-cols-4">
              {discoverPreview.map((board) => (
                <div
                  key={board.id}
                  className="w-[min(82vw,300px)] shrink-0 sm:w-auto"
                >
                  <ShowcaseBoardCard
                    board={board}
                    variant="discover"
                    showLike
                    owner={board.owner}
                    publicHref={
                      board.slug
                        ? ROUTES.publicCollection(board.slug)
                        : undefined
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="velvet-panel p-4 sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-display flex items-center gap-2 text-xl text-on-surface sm:text-2xl">
            <Heart className="h-5 w-5 fill-primary/25 text-primary" aria-hidden />
            Your collections
          </h2>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={Plus}
            onClick={openCreateBoard}
            className="w-full sm:w-auto"
          >
            {UI_LABELS.newCollection}
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <ShowcaseBoardCardSkeleton key={i} />
            ))}
          </div>
        ) : boards && boards.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 gap-5 pb-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
            variants={stagger}
            initial="initial"
            animate="animate"
          >
            {boards.map((board) => (
              <motion.div key={board.id} variants={fadeUp}>
                <ShowcaseBoardCard board={board} variant="owned" />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <EmptyState
            title="Your velvet world starts here"
            description="Create your first board and begin curating the moments that matter."
            actionLabel={UI_LABELS.createFirstCollection}
            onAction={openCreateBoard}
            className="border-0 bg-transparent shadow-none"
          />
        )}
      </section>

      <Button
        onClick={openCreateBoard}
        variant="gradient"
        size="lg"
        icon={Plus}
        className="fixed right-4 bottom-20 z-40 shadow-xl max-[380px]:right-3 max-[380px]:text-sm sm:right-6 md:bottom-12 md:right-12"
        aria-label={UI_LABELS.newCollection}
      >
        {UI_LABELS.newCollection}
      </Button>
    </main>
  );
}
