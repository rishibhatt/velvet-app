"use client";

import Link from "next/link";
import { BadgeCheck, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { VelvetImage } from "@/components/atoms/VelvetImage";
import { Avatar } from "@/components/atoms/Avatar";
import { AvatarStack } from "@/components/molecules/AvatarStack";
import { BoardLikeButton } from "@/components/molecules/BoardLikeButton";
import { ROUTES } from "@/constants/routes";
import { getMoodEmoji, getMoodLabel } from "@/constants/moods";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { formatCount } from "@/utils/format";
import type { Board, Profile } from "@/types/board.types";
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
  const members =
    board.members?.map((m) => m.profile).filter(Boolean) ?? [];
  const canLike =
    showLike && board.is_public && user?.id !== board.owner_id;
  const moodLabel = board.mood ? getMoodLabel(board.mood) : "Collection";
  const subtitle =
    board.description?.trim() ||
    (board.mood ? `${moodLabel} inspiration` : "Curated collection");

  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-3xl bg-bg-elevated shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-hover)]",
        className,
      )}
    >
      <Link href={boardHref} className="relative block flex-1">
        <div
          className={cn(
            "relative w-full overflow-hidden",
            isDiscover ? "aspect-[4/5] sm:aspect-[3/4]" : "aspect-[4/5] sm:aspect-[5/6]",
          )}
        >
          {board.cover_url ? (
            <VelvetImage
              src={board.cover_url}
              alt={board.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              sizes="(max-width: 640px) 85vw, 320px"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary-fixed/70 via-secondary-fixed/50 to-tertiary-fixed/40" />
          )}
          <div className="velvet-card-scrim absolute inset-0" aria-hidden />

          <div className="absolute top-3 left-3 z-10 sm:top-4 sm:left-4">
            <span className="velvet-chip-mood inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-primary shadow-sm ring-1 ring-outline-variant/15 sm:px-3 sm:text-xs">
              {getMoodEmoji(board.mood)} {moodLabel.toLowerCase()}
            </span>
          </div>

          <div className="absolute top-3 right-3 z-10 flex items-start gap-2 sm:top-4 sm:right-4">
            {isDiscover && showLike && (
              <BoardLikeButton
                boardId={board.id}
                likeCount={board.like_count ?? 0}
                isLiked={board.is_liked}
                canLike={canLike}
                size="md"
                className="shadow-md"
              />
            )}
            {isDiscover && members.length > 0 && (
              <div className="hidden items-center sm:flex">
                <AvatarStack profiles={members} max={3} size="sm" />
                <span
                  className="-ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-bg-elevated/95 text-primary shadow-sm ring-2 ring-surface"
                  aria-hidden
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
              </div>
            )}
            {!isDiscover && (
              <Avatar
                src={profile?.avatar_url}
                name={profile?.full_name ?? profile?.username}
                size="sm"
                className="!h-9 !w-9 ring-2 ring-bg-elevated shadow-md sm:!h-10 sm:!w-10"
              />
            )}
          </div>

          <div className="absolute right-3 bottom-3 left-3 z-10 sm:right-4 sm:bottom-4 sm:left-4">
            <div className="flex items-end justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-xl leading-tight text-bg-elevated drop-shadow-md sm:text-2xl">
                  {board.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs font-medium text-bg-elevated/90 sm:text-sm">
                  {subtitle}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold tabular-nums shadow-sm sm:text-xs",
                  isDiscover
                    ? "bg-inverse-surface/75 text-bg-elevated backdrop-blur-sm"
                    : "bg-bg-elevated/95 text-primary ring-1 ring-outline-variant/20",
                )}
              >
                {board.item_count ?? 0} items
              </span>
            </div>
          </div>
        </div>
      </Link>

      {isDiscover && owner && (
        <Link
          href={ROUTES.creator(owner.username)}
          className="flex items-center justify-between gap-2 border-t border-outline-variant/15 bg-surface-container-low/80 px-3 py-2.5 transition-colors hover:bg-surface-container-low sm:px-4"
        >
          <div className="flex min-w-0 items-center gap-2">
            <Avatar
              src={owner.avatar_url}
              name={owner.full_name ?? owner.username}
              size="sm"
              className="!h-8 !w-8 shrink-0"
            />
            <span className="truncate text-sm font-semibold text-on-surface">
              {owner.full_name ?? owner.username}
            </span>
            <BadgeCheck className="h-4 w-4 shrink-0 fill-primary-container text-primary" />
          </div>
          <span className="shrink-0 text-xs font-semibold text-on-surface-variant">
            {board.item_count ?? 0} items
          </span>
        </Link>
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
      <div className="aspect-[4/5] sm:aspect-[3/4]">
        <div className="skeleton-shimmer h-full w-full" />
      </div>
    </div>
  );
}
