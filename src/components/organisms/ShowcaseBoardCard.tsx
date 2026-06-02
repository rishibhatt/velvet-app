"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar } from "@/components/atoms/Avatar";
import { CollaboratorChips } from "@/components/molecules/CollaboratorChips";
import { getBoardCollaboratorProfiles, hasMultipleCollaborators } from "@/lib/collaborators";
import { CollectionPosterGrid } from "@/components/molecules/CollectionPosterGrid";
import { CollectionDiscoverFooter } from "@/components/molecules/CollectionDiscoverFooter";
import { ROUTES } from "@/constants/routes";
import { getMoodDisplayLabel, getMoodEmoji } from "@/constants/moods";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { formatCount } from "@/utils/format";
import type { Board, Profile } from "@/types/board.types";
import { COLLECTION_CARD_MEDIA, COLLECTION_CARD_SHELL } from "@/constants/collection-ui";
import { cn } from "@/lib/utils";

export type ShowcaseBoardVariant = "discover" | "owned";

interface ShowcaseBoardCardProps {
  board: Board;
  variant?: ShowcaseBoardVariant;
  publicHref?: string;
  owner?: Pick<Profile, "username" | "full_name" | "avatar_url">;
  showLike?: boolean;
  className?: string;
}

export function ShowcaseBoardCard({
  board,
  variant = "discover",
  publicHref,
  owner,
  showLike = false,
  className,
}: ShowcaseBoardCardProps) {
  const { user, profile } = useAuth();
  const isDiscover = variant === "discover";
  const boardHref = publicHref ?? ROUTES.board(board.id);
  const collaboratorProfiles = getBoardCollaboratorProfiles(board);
  const showCollab = hasMultipleCollaborators(board);
  const previewImages = board.preview_images ?? [];
  const moodChip = getMoodDisplayLabel(board.mood, board.mood_label);
  const subtitle =
    board.description?.trim() ||
    (board.mood ? `${moodChip} inspiration` : "Curated collection");

  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={cn("group flex h-full flex-col", COLLECTION_CARD_SHELL, className)}
    >
      <Link href={boardHref} className="relative block flex-1">
        <div className={COLLECTION_CARD_MEDIA}>
          <CollectionPosterGrid
            images={previewImages}
            title={board.title}
            emptyVariant={isDiscover ? "other" : "own"}
            itemCount={board.item_count ?? 0}
            className="h-full transition-transform duration-700 group-hover:scale-[1.02]"
          />
          <div className="velvet-card-scrim absolute inset-0" aria-hidden />

          <div className="absolute top-3 left-3 z-10 sm:top-4 sm:left-4">
            <span className="velvet-chip-mood inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-primary shadow-sm ring-1 ring-outline-variant/15 sm:px-3 sm:text-xs">
              {getMoodEmoji(board.mood)} {moodChip.toLowerCase()}
            </span>
          </div>

          <div className="absolute top-3 right-3 z-10 flex items-start gap-2 sm:top-4 sm:right-4">
            {showCollab && (
              <CollaboratorChips board={board} className="shadow-md" />
            )}
            {!isDiscover && !showCollab && (
              <Avatar
                src={profile?.avatar_url}
                name={profile?.full_name ?? profile?.username}
                size="sm"
                className="!h-9 !w-9 ring-2 ring-bg-elevated shadow-md sm:!h-10 sm:!w-10"
              />
            )}
            {isDiscover && !showCollab && collaboratorProfiles.length > 0 && (
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-elevated/95 text-primary shadow-sm ring-2 ring-surface"
                aria-hidden
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
              </span>
            )}
          </div>

          <div className="absolute right-3 bottom-3 left-3 z-10 sm:right-4 sm:bottom-4 sm:left-4">
            {isDiscover ? (
              <div className="min-w-0">
                <h3 className="font-display text-xl leading-tight text-bg-elevated drop-shadow-md sm:text-2xl">
                  {board.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs font-medium text-bg-elevated/90 sm:text-sm">
                  {subtitle}
                </p>
              </div>
            ) : (
              <div className="flex items-end justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-xl leading-tight text-bg-elevated drop-shadow-md sm:text-2xl">
                    {board.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs font-medium text-bg-elevated/90 sm:text-sm">
                    {subtitle}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-bg-elevated/95 px-2.5 py-1 text-[11px] font-bold tabular-nums text-primary shadow-sm ring-1 ring-outline-variant/20 sm:text-xs">
                  {board.item_count ?? 0} items
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>

      {isDiscover && owner && showLike && (
        <CollectionDiscoverFooter board={board} owner={owner} />
      )}
    </motion.article>
  );
}

export function ShowcaseBoardCardSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-3xl shadow-[var(--shadow-card)]",
        className,
      )}
    >
      <div className={COLLECTION_CARD_MEDIA}>
        <div className="skeleton-shimmer h-full w-full" />
      </div>
    </div>
  );
}
