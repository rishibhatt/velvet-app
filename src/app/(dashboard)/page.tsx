"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
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
import {
  COLLECTION_CARD_RAIL,
  COLLECTION_CARD_RAIL_ITEM,
} from "@/constants/collection-ui";
import { ROUTES } from "@/constants/routes";
import { UI_LABELS } from "@/constants/ui-labels";
import { useInfiniteSlice } from "@/hooks/useInfiniteSlice";

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

  const {
    visible: visibleBoards,
    sentinelRef: boardsSentinelRef,
    hasMore: hasMoreBoards,
  } = useInfiniteSlice(boards ?? [], 8);

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
            <div className={COLLECTION_CARD_RAIL}>
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className={COLLECTION_CARD_RAIL_ITEM}>
                  <ShowcaseBoardCardSkeleton />
                </div>
              ))}
            </div>
          ) : (
            <div className={COLLECTION_CARD_RAIL}>
              {discoverPreview.map((board) => (
                <div key={board.id} className={COLLECTION_CARD_RAIL_ITEM}>
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
        <DiscoverSectionHeader
          title="Your collections"
          subtitle="Collections you own and curate"
          showSeeAll={false}
        />

        {isLoading ? (
          <div className={COLLECTION_CARD_RAIL}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={COLLECTION_CARD_RAIL_ITEM}>
                <ShowcaseBoardCardSkeleton />
              </div>
            ))}
          </div>
        ) : boards && boards.length > 0 ? (
          <>
            <motion.div
              className={cn(COLLECTION_CARD_RAIL, "pb-2")}
              variants={stagger}
              initial="initial"
              animate="animate"
            >
              {visibleBoards.map((board) => (
                <motion.div key={board.id} variants={fadeUp} className={COLLECTION_CARD_RAIL_ITEM}>
                  <ShowcaseBoardCard board={board} variant="owned" />
                </motion.div>
              ))}
            </motion.div>
            {hasMoreBoards && (
              <div ref={boardsSentinelRef} className={cn(COLLECTION_CARD_RAIL, "mt-2")}>
                <ShowcaseBoardCardSkeleton className={COLLECTION_CARD_RAIL_ITEM} />
                <ShowcaseBoardCardSkeleton className={COLLECTION_CARD_RAIL_ITEM} />
              </div>
            )}
          </>
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
