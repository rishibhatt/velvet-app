"use client";

import Link from "next/link";
import { BadgeCheck, Layers } from "lucide-react";
import { Avatar } from "@/components/atoms/Avatar";
import { BoardLikeButton } from "@/components/molecules/BoardLikeButton";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { Board, Profile } from "@/types/board.types";
import { cn } from "@/lib/utils";

interface CollectionDiscoverFooterProps {
  board: Board;
  owner: Pick<Profile, "username" | "full_name" | "avatar_url">;
  className?: string;
}

/** Creator row + saves count + like — below collection poster (home discover & explore). */
export function CollectionDiscoverFooter({
  board,
  owner,
  className,
}: CollectionDiscoverFooterProps) {
  const { user } = useAuth();
  const canLike = board.is_public && user?.id !== board.owner_id;
  const itemCount = board.item_count ?? 0;

  return (
    <div
      className={cn(
        "flex items-center gap-3 border-t border-outline-variant/15 bg-surface-container-low/90 px-3 py-2.5 sm:px-4 sm:py-3",
        className,
      )}
    >
      <Link
        href={ROUTES.creator(owner.username)}
        className="flex min-w-0 flex-1 items-center gap-2 rounded-lg outline-none transition-colors hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary"
        onClick={(e) => e.stopPropagation()}
      >
        <Avatar
          src={owner.avatar_url}
          name={owner.full_name ?? owner.username}
          size="sm"
          className="!h-8 !w-8 shrink-0 ring-1 ring-outline-variant/15"
        />
        <span className="truncate text-sm font-semibold text-on-surface">
          {owner.full_name ?? owner.username}
        </span>
        <BadgeCheck className="h-4 w-4 shrink-0 fill-primary-container text-primary" />
      </Link>

      <div
        className="flex shrink-0 items-center gap-2.5"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="presentation"
      >
        <span
          className="inline-flex items-center gap-1 rounded-full bg-surface-container px-2.5 py-1 text-xs font-semibold tabular-nums text-on-surface-variant ring-1 ring-outline-variant/15"
          title={`${itemCount} saves in this collection`}
        >
          <Layers className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
          {itemCount}
        </span>
        <BoardLikeButton
          boardId={board.id}
          likeCount={board.like_count ?? 0}
          isLiked={board.is_liked}
          canLike={canLike}
          appearance="footer"
        />
      </div>
    </div>
  );
}
