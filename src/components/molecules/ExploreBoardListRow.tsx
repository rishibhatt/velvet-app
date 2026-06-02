"use client";

import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { VelvetImage } from "@/components/atoms/VelvetImage";
import { Avatar } from "@/components/atoms/Avatar";
import { BoardLikeButton } from "@/components/molecules/BoardLikeButton";
import { ROUTES } from "@/constants/routes";
import { getMoodDisplayLabel, getMoodEmoji } from "@/constants/moods";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { Board, Profile } from "@/types/board.types";
import type { PublicBoard } from "@/services/discover/discover.service";

interface ExploreBoardListRowProps {
  board: Board | PublicBoard;
  publicHref?: string;
  owner?: Pick<Profile, "username" | "full_name" | "avatar_url">;
}

export function ExploreBoardListRow({
  board,
  publicHref,
  owner,
}: ExploreBoardListRowProps) {
  const { user } = useAuth();
  const href = publicHref ?? ROUTES.board(board.id);
  const canLike = board.is_public && user?.id !== board.owner_id;

  return (
    <article className="flex gap-3 overflow-hidden rounded-2xl border border-outline-variant/20 bg-bg-elevated p-2 shadow-sm transition-shadow hover:shadow-[var(--shadow-card)] sm:gap-4 sm:p-3">
      <Link href={href} className="relative block h-24 w-24 shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-32">
        {board.cover_url ? (
          <VelvetImage
            src={board.cover_url}
            alt=""
            fill
            className="object-cover"
            sizes="128px"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary-fixed/60 to-secondary-fixed/40" />
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 pr-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-primary">
              {getMoodEmoji(board.mood)}{" "}
              {getMoodDisplayLabel(board.mood, board.mood_label).toLowerCase()}
            </span>
            <Link href={href}>
              <h3 className="font-display truncate text-lg text-on-surface">
                {board.title}
              </h3>
            </Link>
            {board.description && (
              <p className="line-clamp-1 text-xs text-on-surface-variant sm:text-sm">
                {board.description}
              </p>
            )}
          </div>
          <BoardLikeButton
            boardId={board.id}
            likeCount={board.like_count ?? 0}
            isLiked={board.is_liked}
            canLike={canLike}
            appearance="footer"
          />
        </div>

        {owner && (
          <Link
            href={ROUTES.creator(owner.username)}
            className="mt-1 flex items-center gap-2"
          >
            <Avatar
              src={owner.avatar_url}
              name={owner.full_name ?? owner.username}
              size="sm"
              className="!h-7 !w-7"
            />
            <span className="truncate text-xs font-semibold text-on-surface">
              {owner.full_name ?? owner.username}
            </span>
            <BadgeCheck className="h-3.5 w-3.5 shrink-0 fill-primary-container text-primary" />
            <span className="ml-auto text-xs text-on-surface-variant">
              {board.item_count ?? 0} items
            </span>
          </Link>
        )}
      </div>
    </article>
  );
}
