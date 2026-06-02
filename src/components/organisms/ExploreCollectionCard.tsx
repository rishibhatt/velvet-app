"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { BadgeCheck, Heart, Layers } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar } from "@/components/atoms/Avatar";
import { CollaboratorChips } from "@/components/molecules/CollaboratorChips";
import { CollectionPosterGrid } from "@/components/molecules/CollectionPosterGrid";
import { hasMultipleCollaborators } from "@/lib/collaborators";
import { ROUTES } from "@/constants/routes";
import { getMoodLabel } from "@/constants/moods";
import { useToggleBoardLike } from "@/queries/likes/mutations";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { formatCount } from "@/utils/format";
import { velvetToast } from "@/lib/toast";
import type { Board, Profile } from "@/types/board.types";
import { cn } from "@/lib/utils";

interface ExploreCollectionCardProps {
  board: Board;
  publicHref?: string;
  owner?: Pick<Profile, "username" | "full_name" | "avatar_url">;
  className?: string;
}

export function ExploreCollectionCard({
  board,
  publicHref,
  owner,
  className,
}: ExploreCollectionCardProps) {
  const { user, isAuthenticated, isAuthReady } = useAuth();
  const toggleLike = useToggleBoardLike();
  const boardHref = publicHref ?? ROUTES.board(board.id);
  const canLike = board.is_public && user?.id !== board.owner_id;
  const moodLabel = board.mood ? getMoodLabel(board.mood) : "Collection";
  const subtitle =
    board.description?.trim() ||
    (board.mood ? `${moodLabel} moodboard` : "Curated collection");
  const likeCount = board.like_count ?? 0;
  const isLiked = board.is_liked ?? false;
  const showCollab = hasMultipleCollaborators(board);
  const previewImages =
    board.preview_images ??
    (board.cover_url ? [board.cover_url] : []);

  const handleLike = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthReady) return;
    if (!isAuthenticated) {
      velvetToast.info("Sign in to like", "Create an account to save favorites.");
      return;
    }
    if (!canLike) return;
    toggleLike.mutate(board.id);
  };

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group flex flex-col overflow-hidden rounded-[1.35rem] bg-bg-elevated shadow-[0_4px_20px_rgba(46,42,39,0.08)] transition-shadow hover:shadow-[0_8px_28px_rgba(46,42,39,0.12)] sm:rounded-3xl",
        className,
      )}
    >
      <Link href={boardHref} className="relative block">
        <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[5/6]">
          <CollectionPosterGrid
            images={previewImages}
            title={board.title}
            className="h-full transition-transform duration-700 group-hover:scale-[1.02]"
          />

          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 via-40% to-transparent"
            aria-hidden
          />

          <div className="absolute top-3 left-3 z-10 flex flex-col items-start gap-2 sm:top-3.5 sm:left-3.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-on-surface shadow-sm sm:px-3 sm:text-xs">
              {moodLabel}
            </span>
            {showCollab && (
              <CollaboratorChips board={board} className="bg-white/95" />
            )}
          </div>

          <button
            type="button"
            onClick={handleLike}
            disabled={!canLike && isAuthenticated}
            aria-label={isLiked ? "Unlike collection" : "Like collection"}
            aria-pressed={isLiked}
            className={cn(
              "absolute top-3 right-3 z-10 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-on-surface shadow-sm transition-transform active:scale-95 sm:top-3.5 sm:right-3.5 sm:px-3 sm:text-xs",
              !canLike && isAuthenticated && "opacity-80",
            )}
          >
            <Heart
              className={cn(
                "h-3.5 w-3.5",
                isLiked ? "fill-error text-error" : "text-on-surface-variant",
              )}
              strokeWidth={2}
            />
            {formatCount(likeCount)}
          </button>

          <div className="absolute right-3 bottom-3 left-3 z-10 sm:right-4 sm:bottom-4 sm:left-4">
            <h3 className="font-display text-[1.35rem] leading-[1.15] text-white drop-shadow-md sm:text-2xl">
              {board.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-xs font-medium leading-snug text-white/90 sm:text-sm">
              {subtitle}
            </p>
          </div>
        </div>
      </Link>

      {owner && (
        <Link
          href={ROUTES.creator(owner.username)}
          className="flex items-center justify-between gap-2 border-t border-outline-variant/10 bg-bg-elevated px-3 py-2.5 transition-colors hover:bg-surface-container-low/50 sm:px-3.5 sm:py-3"
        >
          <div className="flex min-w-0 items-center gap-2">
            <Avatar
              src={owner.avatar_url}
              name={owner.full_name ?? owner.username}
              size="sm"
              className="!h-8 !w-8 shrink-0 ring-1 ring-outline-variant/15"
            />
            <span className="truncate text-sm font-semibold text-on-surface">
              {owner.full_name ?? owner.username}
            </span>
            <BadgeCheck className="h-4 w-4 shrink-0 fill-[#e8a5a5] text-primary" />
          </div>
          <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-on-surface-variant">
            <Layers className="h-3.5 w-3.5 opacity-70" aria-hidden />
            {board.item_count ?? 0} items
          </span>
        </Link>
      )}
    </motion.article>
  );
}

export function ExploreCollectionCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[1.35rem] bg-bg-elevated shadow-[0_4px_20px_rgba(46,42,39,0.08)] sm:rounded-3xl",
        className,
      )}
    >
      <div className="aspect-[4/5] sm:aspect-[5/6]">
        <div className="skeleton-shimmer h-full w-full" />
      </div>
      <div className="h-14 border-t border-outline-variant/10" />
    </div>
  );
}
