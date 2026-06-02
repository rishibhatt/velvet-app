"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Avatar } from "@/components/atoms/Avatar";
import { CollaboratorChips } from "@/components/molecules/CollaboratorChips";
import { CollectionPosterGrid } from "@/components/molecules/CollectionPosterGrid";
import type { CollectionPosterEmptyVariant } from "@/components/molecules/CollectionPosterGrid";
import { BoardLikeButton } from "@/components/molecules/BoardLikeButton";
import { COLLECTION_CARD_MEDIA, COLLECTION_CARD_SHELL } from "@/constants/collection-ui";
import { ROUTES } from "@/constants/routes";
import { getMoodDisplayLabel, getMoodEmoji } from "@/constants/moods";
import { hasMultipleCollaborators } from "@/lib/collaborators";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { formatCount } from "@/utils/format";
import type { Board, Profile } from "@/types/board.types";
import { cn } from "@/lib/utils";

interface BoardCardProps {
  board: Board;
  publicHref?: string;
  owner?: Pick<Profile, "username" | "full_name" | "avatar_url">;
  showLike?: boolean;
  emptyVariant?: CollectionPosterEmptyVariant;
  className?: string;
}

export function BoardCard({
  board,
  publicHref,
  owner,
  showLike = false,
  emptyVariant = "own",
  className,
}: BoardCardProps) {
  const { user } = useAuth();
  const isPublicDiscover = showLike || Boolean(publicHref);
  const canLike =
    isPublicDiscover && board.is_public && user?.id !== board.owner_id;
  const showCollab = hasMultipleCollaborators(board);
  const boardHref = publicHref ?? ROUTES.board(board.id);
  const previewImages = board.preview_images ?? [];
  const moodChip = getMoodDisplayLabel(board.mood, board.mood_label);

  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={cn(COLLECTION_CARD_SHELL, className)}
    >
      <Link href={boardHref} className="group relative block">
        <div className={COLLECTION_CARD_MEDIA}>
          <CollectionPosterGrid
            images={previewImages}
            title={board.title}
            emptyVariant={emptyVariant}
            itemCount={board.item_count ?? 0}
            className="h-full transition-transform duration-700 group-hover:scale-[1.02]"
          />
          <div className="velvet-card-scrim absolute inset-0" aria-hidden />

          <div className="absolute top-3 left-3 z-10 sm:top-4 sm:left-4">
            <span className="velvet-chip-mood inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-primary shadow-sm ring-1 ring-outline-variant/15 sm:px-3 sm:text-xs">
              {getMoodEmoji(board.mood)} {moodChip.toLowerCase()}
            </span>
          </div>

          <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-2 sm:top-4 sm:right-4">
            {isPublicDiscover && (
              <BoardLikeButton
                boardId={board.id}
                likeCount={board.like_count ?? 0}
                isLiked={board.is_liked}
                canLike={canLike}
                size="md"
                className="shadow-md"
              />
            )}
            {board.is_public && !isPublicDiscover && (board.like_count ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-bg-elevated/95 px-2.5 py-1 text-xs font-semibold text-primary shadow-sm ring-1 ring-outline-variant/20">
                <Heart className="h-3.5 w-3.5 fill-primary/30" />
                {formatCount(board.like_count ?? 0)}
              </span>
            )}
            {showCollab && <CollaboratorChips board={board} className="shadow-md" />}
          </div>

          <div className="absolute right-3 bottom-3 left-3 z-10 sm:right-4 sm:bottom-4 sm:left-4">
            <div className="flex items-end justify-between gap-2">
              <h3 className="min-w-0 flex-1 font-display text-xl leading-tight text-bg-elevated drop-shadow-md sm:text-2xl">
                {board.title}
              </h3>
              <span className="shrink-0 rounded-full bg-bg-elevated/95 px-2.5 py-1 text-[11px] font-bold tabular-nums text-primary shadow-sm ring-1 ring-outline-variant/20 sm:text-xs">
                {board.item_count ?? 0} items
              </span>
            </div>
          </div>
        </div>
      </Link>

      {owner && (
        <Link
          href={ROUTES.creator(owner.username)}
          className="flex items-center gap-2 border-t border-outline-variant/15 bg-surface-container-low/80 px-3 py-2.5 transition-colors hover:bg-surface-container-low sm:px-4"
        >
          <Avatar
            src={owner.avatar_url}
            name={owner.full_name ?? owner.username}
            size="sm"
            className="!h-8 !w-8 shrink-0"
          />
          <span className="truncate text-sm font-semibold text-on-surface">
            {owner.full_name ?? owner.username}
          </span>
        </Link>
      )}
    </motion.article>
  );
}

export function BoardCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(COLLECTION_CARD_SHELL, className)}>
      <div className={COLLECTION_CARD_MEDIA}>
        <div className="skeleton-shimmer h-full w-full" />
      </div>
    </div>
  );
}
