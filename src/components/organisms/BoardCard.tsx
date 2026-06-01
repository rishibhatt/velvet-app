"use client";

import Link from "next/link";
import { VelvetImage } from "@/components/atoms/VelvetImage";
import { motion } from "framer-motion";
import { ROUTES } from "@/constants/routes";
import { getMoodEmoji } from "@/constants/moods";
import type { Board, Profile } from "@/types/board.types";
import { AvatarStack } from "@/components/molecules/AvatarStack";
import { Avatar } from "@/components/atoms/Avatar";
import { BoardLikeButton } from "@/components/molecules/BoardLikeButton";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { formatCount } from "@/utils/format";
import { Heart } from "lucide-react";

interface BoardCardProps {
  board: Board;
  /** Link to public page instead of private board detail */
  publicHref?: string;
  /** Show creator on public/discover cards */
  owner?: Pick<Profile, "username" | "full_name" | "avatar_url">;
  /** Show like control (public discover collections) */
  showLike?: boolean;
}

export function BoardCard({
  board,
  publicHref,
  owner,
  showLike = false,
}: BoardCardProps) {
  const { user } = useAuth();
  const isPublicDiscover = showLike || Boolean(publicHref);
  const canLike =
    isPublicDiscover &&
    board.is_public &&
    user?.id !== board.owner_id;
  const members =
    board.members?.map((m) => m.profile).filter(Boolean) ?? [];
  const boardHref = publicHref ?? ROUTES.board(board.id);

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-3xl bg-surface-container-low shadow-[var(--shadow-card)] transition-shadow duration-300 hover:shadow-[var(--shadow-hover)]"
    >
      <Link href={boardHref} className="group relative block">
        <div className="relative aspect-[4/3] overflow-hidden">
          {board.cover_url ? (
            <VelvetImage
              src={board.cover_url}
              alt={board.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary-container/50 to-secondary-container/40" />
          )}
          <div
            className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 from-25% via-inverse-surface/35 via-55% to-transparent"
            aria-hidden
          />

          <div className="absolute top-4 left-4 rounded-full bg-bg-elevated/95 px-3 py-1 text-xs font-semibold text-primary shadow-sm ring-1 ring-outline-variant/20">
            {getMoodEmoji(board.mood)} {board.mood}
          </div>

          <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
            {isPublicDiscover && (
              <BoardLikeButton
                boardId={board.id}
                likeCount={board.like_count ?? 0}
                isLiked={board.is_liked}
                canLike={canLike}
              />
            )}
            {board.is_public && !isPublicDiscover && (board.like_count ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-bg-elevated/95 px-2.5 py-1 text-xs font-semibold text-primary shadow-sm ring-1 ring-outline-variant/20">
                <Heart className="h-3.5 w-3.5 fill-primary/30" />
                {formatCount(board.like_count ?? 0)}
              </span>
            )}
            {members.length > 0 && (
              <AvatarStack profiles={members} max={2} />
            )}
          </div>

          <div className="absolute right-5 bottom-5 left-5 flex items-end justify-between gap-3">
            <h4 className="font-display text-xl leading-tight text-bg-elevated drop-shadow-sm md:text-2xl">
              {board.title}
            </h4>
            <span className="shrink-0 rounded-full bg-bg-elevated/95 px-3 py-1 text-xs font-semibold text-primary shadow-sm ring-1 ring-outline-variant/20">
              {board.item_count ?? 0} items
            </span>
          </div>

        </div>
      </Link>

      {owner && (
        <Link
          href={ROUTES.creator(owner.username)}
          className="flex items-center gap-2 border-t border-outline-variant/15 bg-surface-container-high/80 px-4 py-2.5 backdrop-blur-sm transition-colors hover:bg-surface-container-high"
        >
          <Avatar
            src={owner.avatar_url}
            name={owner.full_name ?? owner.username}
            size="sm"
            className="!h-7 !w-7 shrink-0"
          />
          <span className="truncate text-xs font-semibold text-on-surface">
            @{owner.username}
          </span>
        </Link>
      )}
    </motion.div>
  );
}

export function BoardCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl">
      <div className="aspect-[4/5] sm:aspect-[4/3]">
        <div className="skeleton-shimmer h-full w-full rounded-3xl" />
      </div>
    </div>
  );
}
