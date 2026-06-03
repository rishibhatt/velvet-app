"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CollaboratorChips } from "@/components/molecules/CollaboratorChips";
import { CollectionDiscoverFooter } from "@/components/molecules/CollectionDiscoverFooter";
import { CollectionPosterGrid } from "@/components/molecules/CollectionPosterGrid";
import { hasMultipleCollaborators } from "@/lib/collaborators";
import { ROUTES } from "@/constants/routes";
import { getMoodDisplayLabel, getMoodEmoji } from "@/constants/moods";
import type { Board, Profile } from "@/types/board.types";
import {
  COLLECTION_CARD_MEDIA,
  COLLECTION_CARD_SHELL,
  COLLECTION_CARD_SUBTITLE,
  COLLECTION_CARD_TITLE,
} from "@/constants/collection-ui";
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
  const boardHref = publicHref ?? ROUTES.board(board.id);
  const moodChip = getMoodDisplayLabel(board.mood, board.mood_label);
  const subtitle =
    board.description?.trim() ||
    (board.mood ? `${moodChip} moodboard` : "Curated collection");
  const showCollab = hasMultipleCollaborators(board);
  const previewImages = board.preview_images ?? [];

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={cn("group flex flex-col", COLLECTION_CARD_SHELL, className)}
    >
      <Link href={boardHref} className="relative block">
        <div className={COLLECTION_CARD_MEDIA}>
          <CollectionPosterGrid
            images={previewImages}
            title={board.title}
            emptyVariant="other"
            itemCount={board.item_count ?? 0}
            className="h-full transition-transform duration-700 group-hover:scale-[1.02]"
          />

          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 via-40% to-transparent"
            aria-hidden
          />

          <div className="absolute top-2 left-2 z-10 flex flex-col items-start gap-1.5 sm:top-2.5 sm:left-2.5">
            <span className="velvet-chip-mood inline-flex items-center gap-0.5 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-primary shadow-sm sm:px-2.5 sm:text-[11px]">
              {getMoodEmoji(board.mood)} {moodChip}
            </span>
            {showCollab && <CollaboratorChips board={board} />}
          </div>

          <div className="absolute right-2 bottom-2 left-2 z-10 sm:right-2.5 sm:bottom-2.5 sm:left-2.5">
            <h3 className={cn(COLLECTION_CARD_TITLE, "text-white")}>{board.title}</h3>
            <p className={cn(COLLECTION_CARD_SUBTITLE, "text-white/90")}>{subtitle}</p>
          </div>
        </div>
      </Link>

      {owner && (
        <CollectionDiscoverFooter board={board} owner={owner} compact />
      )}
    </motion.article>
  );
}

export function ExploreCollectionCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(COLLECTION_CARD_SHELL, className)}>
      <div className={COLLECTION_CARD_MEDIA}>
        <div className="skeleton-shimmer h-full w-full" />
      </div>
      <div className="h-14 border-t border-outline-variant/10" />
    </div>
  );
}
