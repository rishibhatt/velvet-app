"use client";

import { useEffect, useState } from "react";
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
  HOME_DISCOVER_CARD_RAIL,
  HOME_DISCOVER_CARD_RAIL_ITEM,
  HOME_OWNED_CARD_RAIL,
  HOME_OWNED_CARD_RAIL_ITEM,
} from "@/constants/collection-ui";
import { ROUTES } from "@/constants/routes";
import { UI_LABELS } from "@/constants/ui-labels";
import { useInfiniteSlice } from "@/hooks/useInfiniteSlice";

export default function HomePage() {
  const router = useRouter();
  const { data: boards, isLoading, isError, error, refetch } = useBoards();
  const [compactCreate, setCompactCreate] = useState(false);
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
    if (!isSupabaseConfigured() || isLoading || isError || !user) return;
    if (boards && boards.length === 0) {
      const skipped = user.user_metadata?.onboarding_skipped === true;
      if (!skipped) {
        router.replace("/onboarding");
      }
    }
  }, [boards, isLoading, isError, router, user]);

  useEffect(() => {
    const handleScroll = () => setCompactCreate(window.scrollY > 120);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
            <div className={HOME_DISCOVER_CARD_RAIL}>
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className={HOME_DISCOVER_CARD_RAIL_ITEM}>
                  <ShowcaseBoardCardSkeleton />
                </div>
              ))}
            </div>
          ) : (
            <div className={HOME_DISCOVER_CARD_RAIL}>
              {discoverPreview.map((board) => (
                <div key={board.id} className={HOME_DISCOVER_CARD_RAIL_ITEM}>
                  <ShowcaseBoardCard
                    board={board}
                    variant="discover"
                    owner={board.owner}
                    publicHref={
                      board.slug
                        ? board.owner?.username
                          ? ROUTES.publicCollection(board.owner.username, board.slug)
                          : ROUTES.legacyPublicCollection(board.slug)
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
          <div className={HOME_OWNED_CARD_RAIL}>
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className={HOME_OWNED_CARD_RAIL_ITEM}>
                <ShowcaseBoardCardSkeleton />
              </div>
            ))}
          </div>
        ) : boards && boards.length > 0 ? (
          <>
            <motion.div
              className={cn(HOME_OWNED_CARD_RAIL, "pb-2")}
              variants={stagger}
              initial="initial"
              animate="animate"
            >
              {visibleBoards.map((board) => (
                <motion.div key={board.id} variants={fadeUp} className={HOME_OWNED_CARD_RAIL_ITEM}>
                  <ShowcaseBoardCard board={board} variant="owned" />
                </motion.div>
              ))}
            </motion.div>
            {hasMoreBoards && (
              <div ref={boardsSentinelRef} className={cn(HOME_OWNED_CARD_RAIL, "mt-2")}>
                <div className={HOME_OWNED_CARD_RAIL_ITEM}>
                  <ShowcaseBoardCardSkeleton />
                </div>
                <div className={HOME_OWNED_CARD_RAIL_ITEM}>
                  <ShowcaseBoardCardSkeleton />
                </div>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            title="Your velvet world starts here"
            description="Create your first board and begin curating the moments that matter."
            actionLabel={UI_LABELS.createFirstCollection}
            onAction={openCreateBoard}
            className="border-0 bg-transparent px-4 py-10 shadow-none sm:py-12"
          />
        )}
      </section>

      <Button
        onClick={openCreateBoard}
        variant="gradient"
        size="lg"
        icon={Plus}
        className={cn(
          "fixed right-4 bottom-20 z-40 shadow-xl transition-all duration-300 max-[380px]:right-3 max-[380px]:text-sm sm:right-6 md:bottom-12 md:right-12",
          compactCreate && "h-14 w-14 !min-h-14 rounded-full px-0 sm:w-14",
        )}
        aria-label={UI_LABELS.newCollection}
      >
        <span className={cn(compactCreate && "sr-only")}>
          {UI_LABELS.newCollection}
        </span>
      </Button>
    </main>
  );
}
