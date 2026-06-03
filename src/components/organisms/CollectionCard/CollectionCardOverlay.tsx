"use client";

import Link from "next/link";
import { Lock, Share2 } from "lucide-react";
import { Avatar } from "@/components/atoms/Avatar";
import { CollaboratorChips } from "@/components/molecules/CollaboratorChips";
import { COLLECTION_CARD_TITLE } from "@/constants/collection-ui";
import { getMoodDisplayLabel, getMoodEmoji } from "@/constants/moods";
import { ROUTES } from "@/constants/routes";
import { formatCount } from "@/utils/format";
import type { Board, Profile } from "@/types/board.types";
import type { CollectionCardVariant } from "./collection-card.types";
import { CollectionCardLikePill } from "./CollectionCardLikePill";
import { CollectionCardMoreMenu } from "./CollectionCardMoreMenu";
import { cn } from "@/lib/utils";

const CARD_QUICK_ACTION =
  "pointer-events-auto inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white shadow-lg backdrop-blur-md transition-transform active:scale-95";

interface CollectionCardOverlayProps {
  board: Board;
  variant: CollectionCardVariant;
  owner?: Pick<Profile, "username" | "full_name" | "avatar_url">;
  shareUrl: string;
  canLike: boolean;
  onLikeBurst: () => void;
  onShare: () => void;
  onView: () => void;
}

export function CollectionCardOverlay({
  board,
  variant,
  owner,
  shareUrl,
  canLike,
  onLikeBurst,
  onShare,
  onView,
}: CollectionCardOverlayProps) {
  const moodChip = getMoodDisplayLabel(board.mood, board.mood_label);
  const itemCount = board.item_count ?? 0;
  const isOwned = variant === "owned";
  const displayOwner = owner;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 p-2.5 sm:p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/85 px-2.5 py-1 text-[10px] font-semibold text-primary shadow-sm backdrop-blur-md sm:text-[11px]">
            {getMoodEmoji(board.mood)} {moodChip}
          </span>
          {isOwned && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold backdrop-blur-md sm:text-[11px]",
                board.is_public
                  ? "border border-white/25 bg-primary/80 text-on-primary"
                  : "border border-white/20 bg-black/40 text-white",
              )}
            >
              {!board.is_public && <Lock className="h-2.5 w-2.5" aria-hidden />}
              {board.is_public ? "Public" : "Private"}
            </span>
          )}
        </div>
        <CollectionCardMoreMenu shareUrl={shareUrl} onView={onView} />
      </div>

      {/* Bottom content + floating actions */}
      <div className="mt-auto flex items-end justify-between gap-3 p-3 sm:p-3.5">
        <div className="min-w-0 flex-1 pr-3">
          {!isOwned && displayOwner && (
            <Link
              href={ROUTES.creator(displayOwner.username)}
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto mb-2 inline-flex max-w-full items-center gap-2 rounded-full py-0.5 pr-2 transition-opacity hover:opacity-90"
            >
              <Avatar
                src={displayOwner.avatar_url}
                name={displayOwner.full_name ?? displayOwner.username}
                size="sm"
                className="!h-6 !w-6 ring-1 ring-white/40 sm:!h-7 sm:!w-7"
              />
              <span className="truncate text-xs font-medium text-white/92 sm:text-sm">
                {displayOwner.full_name ?? displayOwner.username}
              </span>
            </Link>
          )}

          <h3 className={cn(COLLECTION_CARD_TITLE, "text-white")}>{board.title}</h3>
          <p className="mt-1 text-[10px] font-medium text-white/75 sm:text-[11px]">
            {formatCount(itemCount)} {itemCount === 1 ? "item" : "items"}
          </p>

          <CollaboratorChips board={board} className="mt-2 max-w-full" />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {!isOwned && (
            <>
              <CollectionCardLikePill
                boardId={board.id}
                likeCount={board.like_count ?? 0}
                isLiked={board.is_liked}
                canLike={canLike}
                onLikeBurst={onLikeBurst}
              />
              {board.is_public && (
                <button
                  type="button"
                  aria-label="Share collection"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onShare();
                  }}
                  className={CARD_QUICK_ACTION}
                >
                  <Share2 className="h-4 w-4" strokeWidth={2.25} />
                </button>
              )}
            </>
          )}
          {isOwned && (
            <button
              type="button"
              aria-label="Share collection"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onShare();
              }}
              className={CARD_QUICK_ACTION}
            >
              <Share2 className="h-4 w-4" strokeWidth={2.25} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
