"use client";

import type { MouseEvent } from "react";
import { Heart } from "lucide-react";
import { useToggleBoardLike } from "@/queries/likes/mutations";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { formatCount } from "@/utils/format";
import { cn } from "@/lib/utils";
import { velvetToast } from "@/lib/toast";

interface BoardLikeButtonProps {
  boardId: string;
  likeCount: number;
  isLiked?: boolean;
  /** Must be public and not owned by viewer */
  canLike?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function BoardLikeButton({
  boardId,
  likeCount,
  isLiked = false,
  canLike = true,
  size = "sm",
  className,
}: BoardLikeButtonProps) {
  const { isAuthenticated } = useAuth();
  const toggle = useToggleBoardLike();

  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      velvetToast.info("Sign in to like", "Create an account to save favorites.");
      return;
    }
    if (!canLike) return;

    toggle.mutate(boardId);
  };

  const iconSize = size === "md" ? "h-5 w-5" : "h-4 w-4";
  const pad = size === "md" ? "px-3 py-2" : "px-2.5 py-1.5";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!canLike && isAuthenticated}
      aria-label={isLiked ? "Unlike collection" : "Like collection"}
      aria-pressed={isLiked}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold transition-all active:scale-95",
        pad,
        isLiked
          ? "bg-error/15 text-error ring-1 ring-error/30"
          : "bg-bg-elevated/95 text-primary shadow-sm ring-1 ring-outline-variant/20 hover:bg-primary/10",
        !canLike && "opacity-70",
        className,
      )}
    >
      <Heart
        className={cn(iconSize, isLiked && "fill-current")}
        strokeWidth={2.25}
      />
      <span className={cn("tabular-nums", size === "md" ? "text-sm" : "text-xs")}>
        {formatCount(likeCount)}
      </span>
    </button>
  );
}
