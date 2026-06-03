"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { CollaboratorChips } from "@/components/molecules/CollaboratorChips";
import { CollectionPosterGrid } from "@/components/molecules/CollectionPosterGrid";
import type { CollectionPosterEmptyVariant } from "@/components/molecules/CollectionPosterGrid";
import { CollectionDiscoverFooter } from "@/components/molecules/CollectionDiscoverFooter";
import {
  COLLECTION_CARD_MEDIA,
  COLLECTION_CARD_SHELL,
  COLLECTION_CARD_SUBTITLE,
  COLLECTION_CARD_TITLE,
} from "@/constants/collection-ui";
import { ROUTES } from "@/constants/routes";
import { getMoodDisplayLabel, getMoodEmoji } from "@/constants/moods";
import { hasMultipleCollaborators } from "@/lib/collaborators";
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
  onClick?: () => void;
}

export function BoardCard({
  board,
  publicHref,
  owner,
  showLike = false,
  emptyVariant = "own",
  className,
  onClick,
}: BoardCardProps) {
  const showDiscoverFooter = Boolean(owner) && (showLike || Boolean(publicHref));
  const showCollab = hasMultipleCollaborators(board);
  const boardHref = publicHref ?? ROUTES.board(board.id);
  const previewImages = board.preview_images ?? [];
  const moodChip = getMoodDisplayLabel(board.mood, board.mood_label);

  return (
    <motion.article
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={cn("group flex h-full flex-col", COLLECTION_CARD_SHELL, className)}
    >
      <Link href={boardHref} className="relative block flex-1" onClick={onClick}>
        <div className={COLLECTION_CARD_MEDIA}>
          <CollectionPosterGrid
            images={previewImages}
            title={board.title}
            emptyVariant={emptyVariant}
            itemCount={board.item_count ?? 0}
            className="h-full transition-transform duration-700 group-hover:scale-[1.02]"
          />
          <div className="velvet-card-scrim absolute inset-0" aria-hidden />

          <div className="absolute top-2 left-2 z-10 sm:top-2.5 sm:left-2.5">
            <span className="velvet-chip-mood inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold text-primary shadow-sm ring-1 ring-outline-variant/15 sm:px-2.5 sm:text-[11px]">
              {getMoodEmoji(board.mood)} {moodChip.toLowerCase()}
            </span>
          </div>

          {showCollab && (
            <div className="absolute top-2 right-2 z-10 sm:top-2.5 sm:right-2.5">
              <CollaboratorChips board={board} className="shadow-md" />
            </div>
          )}

          <div className="absolute right-2 bottom-2 left-2 z-10 sm:right-2.5 sm:bottom-2.5 sm:left-2.5">
            <div className="flex items-end justify-between gap-1.5">
              <h3 className={cn("min-w-0 flex-1", COLLECTION_CARD_TITLE)}>
                {board.title}
              </h3>
              <span className="shrink-0 rounded-full bg-bg-elevated/95 px-2 py-0.5 text-[10px] font-bold tabular-nums text-primary shadow-sm ring-1 ring-outline-variant/20">
                {board.item_count ?? 0}
              </span>
            </div>
            {!showDiscoverFooter && board.description && (
              <p className={COLLECTION_CARD_SUBTITLE}>{board.description}</p>
            )}
            {!showDiscoverFooter && (board.like_count ?? 0) > 0 && board.is_public && (
              <span className="mt-1 inline-flex items-center gap-0.5 rounded-full bg-bg-elevated/90 px-2 py-0.5 text-[10px] font-semibold text-primary">
                <Heart className="h-3 w-3 fill-primary/30" />
                {formatCount(board.like_count ?? 0)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {showDiscoverFooter && owner && (
        <CollectionDiscoverFooter board={board} owner={owner} compact />
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
      <div className="h-12 border-t border-outline-variant/10" />
    </div>
  );
}
