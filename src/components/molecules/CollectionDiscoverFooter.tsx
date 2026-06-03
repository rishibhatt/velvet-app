"use client";

import Link from "next/link";
import { Layers } from "lucide-react";
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
  compact?: boolean;
}

/** Creator row + saves count + like — below collection poster (home discover & explore). */
export function CollectionDiscoverFooter({
  board,
  owner,
  className,
  compact = false,
}: CollectionDiscoverFooterProps) {
  const { user } = useAuth();
  const canLike = board.is_public && user?.id !== board.owner_id;
  const itemCount = board.item_count ?? 0;
  const displayName = owner.full_name ?? owner.username;

  return (
    <div
      className={cn(
        "relative border-t border-outline-variant/25 bg-bg-elevated shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]",
        "before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-primary/20 before:to-transparent",
        compact ? "px-2.5 py-2" : "px-3 py-2.5 sm:px-4 sm:py-3",
        className,
      )}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2.5">
        <Link
          href={ROUTES.creator(owner.username)}
          className="flex min-w-0 items-center gap-2 overflow-hidden rounded-xl outline-none transition-colors hover:bg-surface-container-low/70 focus-visible:ring-2 focus-visible:ring-primary"
          onClick={(e) => e.stopPropagation()}
        >
          <Avatar
            src={owner.avatar_url}
            name={displayName}
            size="sm"
            className={cn(
              "shrink-0 ring-1 ring-outline-variant/15",
              compact ? "!h-7 !w-7" : "!h-8 !w-8",
            )}
          />
          <span
            className={cn(
              "min-w-0 truncate font-semibold text-on-surface",
              compact ? "text-xs" : "text-sm",
            )}
            title={`@${owner.username}`}
          >
            {displayName}
          </span>
        </Link>

        <div
          className="flex shrink-0 items-center gap-1 sm:gap-2"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          role="presentation"
        >
          <span
            className={cn(
              "max-w-[3.25rem] items-center justify-center gap-0.5 rounded-full bg-surface-container px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-on-surface-variant ring-1 ring-outline-variant/15 sm:max-w-none sm:gap-1 sm:px-2.5 sm:py-1 sm:text-xs",
              compact ? "hidden sm:inline-flex" : "inline-flex",
            )}
            title={`${itemCount} saves in this collection`}
          >
            <Layers className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
            <span className="truncate">{itemCount}</span>
          </span>
          <BoardLikeButton
            boardId={board.id}
            likeCount={board.like_count ?? 0}
            isLiked={board.is_liked}
            canLike={canLike}
            appearance="footer"
            className={compact ? "min-h-8 gap-1 px-2.5 py-1 text-xs shadow-sm" : "shadow-sm"}
          />
        </div>
      </div>
    </div>
  );
}
