"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CollectionCreateFab } from "@/components/molecules/CollectionCreateFab";
import { CollectionCreateCard } from "@/components/molecules/CollectionCreateCard";
import { ShowcaseBoardCard } from "@/components/organisms/ShowcaseBoardCard";
import { CollectionCardSkeletonRail } from "@/components/skeletons/CollectionCardSkeletonRail";
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
  HOME_OWNED_PREVIEW_COUNT,
} from "@/constants/collection-ui";
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

  const ownedPreview = useMemo(
    () => (boards ?? []).slice(0, HOME_OWNED_PREVIEW_COUNT),
    [boards],
  );

  useEffect(() => {
    if (!isSupabaseConfigured() || isLoading || isError || !user) return;
    if (boards && boards.length === 0) {
      const skipped = user.user_metadata?.onboarding_skipped === true;
      if (!skipped) {
        router.replace("/onboarding");
      }
    }
  }, [boards, isLoading, isError, router, user]);

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
            <CollectionCardSkeletonRail />
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
          seeAllHref={ROUTES.profileCollections}
          seeAllLabel="View all"
          showSeeAll={Boolean(boards && boards.length > 0)}
        />

        {isLoading ? (
          <CollectionCardSkeletonRail />
        ) : boards && boards.length > 0 ? (
          <motion.div
            className={`${HOME_OWNED_CARD_RAIL} pb-2`}
            variants={stagger}
            initial="initial"
            animate="animate"
          >
            {ownedPreview.map((board) => (
              <motion.div
                key={board.id}
                variants={fadeUp}
                className={HOME_OWNED_CARD_RAIL_ITEM}
              >
                <ShowcaseBoardCard board={board} variant="owned" />
              </motion.div>
            ))}
            <motion.div variants={fadeUp} className={HOME_OWNED_CARD_RAIL_ITEM}>
              <CollectionCreateCard onClick={openCreateBoard} />
            </motion.div>
          </motion.div>
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

      <CollectionCreateFab onClick={openCreateBoard} />
    </main>
  );
}
