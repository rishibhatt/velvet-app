"use client";

import Link from "next/link";
import { VelvetLink } from "@/components/atoms/VelvetLink";
import { BadgeCheck, Lock } from "lucide-react";
import { CollectionPosterGrid } from "@/components/molecules/CollectionPosterGrid";
import { Avatar } from "@/components/atoms/Avatar";
import { BoardLikeButton } from "@/components/molecules/BoardLikeButton";
import { ROUTES } from "@/constants/routes";
import { getMoodDisplayLabel, getMoodEmoji } from "@/constants/moods";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { Board, Profile } from "@/types/board.types";
import type { PublicBoard } from "@/services/discover/discover.service";
import { cn } from "@/lib/utils";

export type CollectionListScope = "yours" | "public" | "private";

interface CollectionListRowProps {
  board: Board | PublicBoard;
  href: string;
  owner?: Pick<Profile, "username" | "full_name" | "avatar_url">;
  scope?: CollectionListScope;
  showLike?: boolean;
  onClick?: () => void;
  className?: string;
}

function scopeLabel(scope: CollectionListScope | undefined, isPublic: boolean) {
  if (scope === "yours") return "Yours";
  if (scope === "private" || !isPublic) return "Private";
  return "Public";
}

export function CollectionListRow({
  board,
  href,
  owner,
  scope,
  showLike = true,
  onClick,
  className,
}: CollectionListRowProps) {
  const { user } = useAuth();
  const previewImages = board.preview_images ?? [];
  const isOwned = scope === "yours" || user?.id === board.owner_id;
  const canLike =
    showLike && board.is_public && !isOwned && user?.id !== board.owner_id;
  const badge = scopeLabel(scope, board.is_public);

  return (
    <article
      className={cn(
        "flex gap-2.5 overflow-hidden rounded-2xl border border-outline-variant/20 bg-bg-elevated p-2 shadow-sm transition-shadow hover:shadow-[var(--shadow-card)] sm:gap-3 sm:p-2.5",
        className,
      )}
    >
      <VelvetLink
        href={href}
        onClick={onClick}
        className="relative block h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-xl sm:h-20 sm:w-20"
      >
        <CollectionPosterGrid
          images={previewImages}
          title={board.title}
          itemCount={board.item_count ?? 0}
          emptyVariant={isOwned ? "own" : "other"}
          compactEmpty
          className="h-full w-full"
          imageSizes="80px"
        />
      </VelvetLink>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 py-0.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-semibold text-primary sm:text-[11px]">
                {getMoodEmoji(board.mood)}{" "}
                {getMoodDisplayLabel(board.mood, board.mood_label).toLowerCase()}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-1.5 py-px text-[9px] font-bold uppercase tracking-wide sm:text-[10px]",
                  badge === "Yours"
                    ? "bg-primary-fixed/50 text-primary"
                    : badge === "Private"
                      ? "bg-surface-container-high text-on-surface-variant"
                      : "bg-primary/15 text-primary",
                )}
              >
                {badge === "Private" && <Lock className="h-2.5 w-2.5" aria-hidden />}
                {badge}
              </span>
            </div>
            <VelvetLink href={href} onClick={onClick}>
              <h3 className="font-display truncate text-base leading-tight text-on-surface sm:text-lg">
                {board.title}
              </h3>
            </VelvetLink>
            {board.description && (
              <p className="line-clamp-1 text-[11px] text-on-surface-variant sm:text-xs">
                {board.description}
              </p>
            )}
          </div>
          {canLike && (
            <BoardLikeButton
              boardId={board.id}
              likeCount={board.like_count ?? 0}
              isLiked={board.is_liked}
              canLike={canLike}
              appearance="footer"
              className="!min-h-8 shrink-0"
            />
          )}
        </div>

        {owner && !isOwned ? (
          <Link
            href={ROUTES.creator(owner.username)}
            className="mt-0.5 flex items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <Avatar
              src={owner.avatar_url}
              name={owner.full_name ?? owner.username}
              size="sm"
              className="!h-6 !w-6 sm:!h-7 sm:!w-7"
            />
            <span className="truncate text-[11px] font-semibold text-on-surface sm:text-xs">
              {owner.full_name ?? owner.username}
            </span>
            <BadgeCheck className="h-3 w-3 shrink-0 fill-primary-container text-primary" />
            <span className="ml-auto text-[11px] text-on-surface-variant">
              {board.item_count ?? 0} items
            </span>
          </Link>
        ) : (
          <p className="text-[11px] text-on-surface-variant sm:text-xs">
            {board.item_count ?? 0} items
            {scope === "yours" && !board.is_public && " · Private"}
            {scope === "yours" && board.is_public && " · Public"}
            {board.like_count != null && board.like_count > 0
              ? ` · ${board.like_count} likes`
              : ""}
          </p>
        )}
      </div>
    </article>
  );
}
