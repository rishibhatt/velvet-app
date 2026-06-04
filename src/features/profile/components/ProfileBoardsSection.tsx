"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { UI_LABELS } from "@/constants/ui-labels";
import { BoardCard } from "@/components/organisms/BoardCard";
import { CollectionCardSkeleton } from "@/components/organisms/CollectionCard";
import { CollectionCardSkeletonGrid } from "@/components/skeletons/CollectionCardSkeletonGrid";
import { ProfileBoardTabs, type ProfileBoardTab } from "@/features/profile/components/ProfileBoardTabs";
import { COLLECTION_CARD_GRID } from "@/constants/collection-ui";
import { ROUTES } from "@/constants/routes";
import { useInfiniteSlice } from "@/hooks/useInfiniteSlice";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { Board } from "@/types/board.types";

interface ProfileBoardsSectionProps {
  boards: Board[];
  likedBoards: Board[];
  boardsLoading: boolean;
  likedLoading: boolean;
  onCreateBoard: () => void;
}

function ProfileBoardsEmpty({
  tab,
  onCreateBoard,
}: {
  tab: ProfileBoardTab;
  onCreateBoard: () => void;
}) {
  const isLiked = tab === "liked";

  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-outline-variant/35 bg-surface-container-low/60 px-6 py-12 text-center sm:px-10 sm:py-16">
      <h3 className="font-display text-xl text-on-surface sm:text-2xl">
        {isLiked
          ? "No liked collections yet"
          : "You haven't created any collections yet"}
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-on-surface-variant sm:text-base">
        {isLiked
          ? "Explore public collections and tap the heart to save inspiration here."
          : "Start by creating your first collection to save and organize your inspiration."}
      </p>
      {!isLiked && (
        <Button
          variant="gradient"
          size="lg"
          icon={Plus}
          className="mt-8 w-full max-w-xs shadow-lg sm:w-auto"
          onClick={onCreateBoard}
        >
          {UI_LABELS.createFirstCollection}
        </Button>
      )}
    </div>
  );
}

export function ProfileBoardsSection({
  boards,
  likedBoards,
  boardsLoading,
  likedLoading,
  onCreateBoard,
}: ProfileBoardsSectionProps) {
  const { profile } = useAuth();
  const [tab, setTab] = useState<ProfileBoardTab>("yours");

  const activeBoards = tab === "yours" ? boards : likedBoards;
  const loading = tab === "yours" ? boardsLoading : likedLoading;
  const { visible, sentinelRef, hasMore } = useInfiniteSlice(activeBoards, 12);

  const owner = profile
    ? {
        username: profile.username,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
      }
    : undefined;

  return (
    <section className="mt-8 sm:mt-10">
      <ProfileBoardTabs value={tab} onChange={setTab} />

      <div className="mt-6 sm:mt-8" role="tabpanel">
        {loading ? (
          <CollectionCardSkeletonGrid count={4} />
        ) : activeBoards.length > 0 ? (
          <>
            <div className={COLLECTION_CARD_GRID}>
              {visible.map((board) => (
                <BoardCard
                  key={board.id}
                  board={board}
                  variant={tab === "yours" ? "owned" : "liked"}
                  emptyVariant={tab === "yours" ? "own" : "other"}
                  owner={tab === "liked" ? undefined : owner}
                  publicHref={
                    board.slug && board.is_public
                      ? profile?.username
                        ? ROUTES.publicCollection(profile.username, board.slug)
                        : ROUTES.legacyPublicCollection(board.slug)
                      : undefined
                  }
                />
              ))}
            </div>
            {hasMore && (
              <div
                ref={sentinelRef}
                className={`${COLLECTION_CARD_GRID} mt-3`}
              >
                <CollectionCardSkeleton />
                <CollectionCardSkeleton />
              </div>
            )}
          </>
        ) : (
          <ProfileBoardsEmpty tab={tab} onCreateBoard={onCreateBoard} />
        )}
      </div>
    </section>
  );
}
