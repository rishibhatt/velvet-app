"use client";

import { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { CollectionPosterEmptyVariant } from "@/components/molecules/CollectionPosterGrid";
import { ROUTES, getPublicShareUrl } from "@/constants/routes";
import { getCollectionHref, getTrackedCollectionHref } from "@/lib/collection-href";
import type { PresetContext, TrackedLinkPreset } from "@/lib/attribution";
import { COLLECTION_CARD_SHELL } from "@/constants/collection-ui";
import { useBoardLikeDisplay } from "@/hooks/useBoardLikeDisplay";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useModalStore } from "@/store/modal.store";
import { velvetToast } from "@/lib/toast";
import type { Board, Profile } from "@/types/board.types";
import { cn } from "@/lib/utils";
import { CollectionCardMedia } from "./CollectionCardMedia";
import { CollectionCardOverlay } from "./CollectionCardOverlay";
import { DoubleTapHeartBurst } from "./DoubleTapHeartBurst";
import { useCollectionCardTap } from "./useCollectionCardTap";

import type { CollectionCardVariant } from "./collection-card.types";

export type { CollectionCardVariant } from "./collection-card.types";

export interface CollectionCardProps {
  board: Board;
  variant?: CollectionCardVariant;
  publicHref?: string;
  owner?: Pick<Profile, "username" | "full_name" | "avatar_url">;
  emptyVariant?: CollectionPosterEmptyVariant;
  className?: string;
  onClick?: () => void;
  /** First visible card — improves LCP on discover grids */
  priority?: boolean;
  /** Internal navigation attribution (explore, search, etc.) */
  trafficPreset?: TrackedLinkPreset;
  trafficContext?: PresetContext;
}

export function CollectionCard({
  board,
  variant = "discover",
  publicHref,
  owner,
  emptyVariant,
  className,
  onClick,
  priority = false,
  trafficPreset,
  trafficContext,
}: CollectionCardProps) {
  const { user, profile, isAuthenticated, isAuthReady } = useAuth();
  const openShareSheet = useModalStore((s) => s.openShareSheet);
  const [heartBurst, setHeartBurst] = useState(false);
  const { isLiked: displayLiked, isPending: likePending, toggleLike } =
    useBoardLikeDisplay({
      boardId: board.id,
      likeCount: board.like_count ?? 0,
      isLiked: board.is_liked ?? false,
    });

  const shareOwner =
    owner ??
    (variant === "owned" && profile
      ? {
          username: profile.username,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
        }
      : undefined);

  const boardHref = trafficPreset
    ? getTrackedCollectionHref(board, {
        userId: user?.id,
        ownerUsername: shareOwner?.username ?? owner?.username,
        preset: trafficPreset,
        presetContext: trafficContext,
      })
    : getCollectionHref(board, {
        userId: user?.id,
        ownerUsername: shareOwner?.username ?? owner?.username,
      });
  const posterEmpty: CollectionPosterEmptyVariant =
    emptyVariant ?? (variant === "owned" ? "own" : "other");
  const canLike =
    variant !== "owned" && board.is_public && user?.id !== board.owner_id;

  const shareUrl = useMemo(() => {
    if (!board.slug) return "";
    const username = shareOwner?.username ?? "";
    return getPublicShareUrl(username, board.slug);
  }, [board.slug, shareOwner?.username]);

  const handleShare = useCallback(() => {
    if (!board.is_public) {
      velvetToast.info("Make it public", "Set visibility to Public in collection settings.");
      return;
    }

    openShareSheet({
      url: shareUrl,
      title: board.title,
      text: board.description ?? undefined,
      imageUrls: (board.preview_images ?? []).slice(0, 4),
      eyebrow: "Velvet collection",
    });
  }, [board, openShareSheet, shareUrl]);

  const triggerLikeBurst = useCallback(() => setHeartBurst(true), []);

  const handleDoubleTap = useCallback(() => {
    if (!canLike || likePending) return;
    setHeartBurst(true);
    if (!isAuthReady) return;
    if (!isAuthenticated) {
      velvetToast.info("Sign in to like", "Create an account to save favorites.");
      return;
    }
    if (!displayLiked) toggleLike();
  }, [
    canLike,
    displayLiked,
    isAuthenticated,
    isAuthReady,
    likePending,
    toggleLike,
  ]);

  const { handleTap, openCollection, isPending } = useCollectionCardTap(boardHref, {
    onNavigate: onClick,
    onDoubleTap: handleDoubleTap,
  });

  const handleView = useCallback(() => {
    openCollection();
  }, [openCollection]);

  return (
    <motion.article
      whileHover={isPending ? undefined : { y: -4, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } }}
      whileTap={isPending ? undefined : { scale: 0.98, transition: { type: "spring", stiffness: 420, damping: 28 } }}
      aria-busy={isPending}
      className={cn(
        "group",
        COLLECTION_CARD_SHELL,
        isPending && "pointer-events-none opacity-[0.88] saturate-[0.92]",
        className,
      )}
    >
      <div className="relative">
        <CollectionCardMedia
          board={board}
          emptyVariant={posterEmpty}
          onTap={handleTap}
          isPending={isPending}
          priority={priority}
        />
        <CollectionCardOverlay
          board={board}
          variant={variant}
          owner={owner}
          shareUrl={shareUrl}
          canLike={canLike}
          onLikeBurst={triggerLikeBurst}
          onShare={handleShare}
          onView={handleView}
        />
        <DoubleTapHeartBurst show={heartBurst} onComplete={() => setHeartBurst(false)} />
      </div>
    </motion.article>
  );
}
