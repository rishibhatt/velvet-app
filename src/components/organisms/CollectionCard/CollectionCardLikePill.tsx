"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useToggleBoardLike } from "@/queries/likes/mutations";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { formatCount } from "@/utils/format";
import { velvetToast } from "@/lib/toast";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface CollectionCardLikePillProps {
  boardId: string;
  likeCount: number;
  isLiked?: boolean;
  canLike?: boolean;
  /** Fires when the user likes (not unlike) — drives center heart burst */
  onLikeBurst?: () => void;
  className?: string;
}

/** Floating like pill — bottom-right on image (reference design). */
export function CollectionCardLikePill({
  boardId,
  likeCount,
  isLiked = false,
  canLike = true,
  onLikeBurst,
  className,
}: CollectionCardLikePillProps) {
  const { isAuthenticated, isAuthReady } = useAuth();
  const toggle = useToggleBoardLike();

  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthReady) return;
    if (!isAuthenticated) {
      velvetToast.info("Sign in to like", "Create an account to save favorites.");
      return;
    }
    if (!canLike) return;
    if (!isLiked) onLikeBurst?.();
    toggle.mutate(boardId);
  };

  const shell = cn(
    "pointer-events-auto inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg backdrop-blur-md transition-transform active:scale-95",
    isLiked && "border-error/40 bg-error/35",
    className,
  );

  if (isAuthReady && !isAuthenticated) {
    return (
      <Link
        href={ROUTES.login}
        onClick={(e) => e.stopPropagation()}
        className={shell}
        aria-label="Sign in to like"
      >
        <Heart className="h-3.5 w-3.5" strokeWidth={2.25} />
        <span className="tabular-nums">{formatCount(likeCount)}</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={(!canLike && isAuthenticated) || !isAuthReady}
      aria-label={isLiked ? "Unlike collection" : "Like collection"}
      aria-pressed={isLiked}
      className={cn(shell, (!canLike || !isAuthReady) && isAuthenticated && "opacity-80")}
    >
      <Heart
        className={cn("h-3.5 w-3.5", isLiked && "fill-current")}
        strokeWidth={2.25}
      />
      <span className="tabular-nums">{formatCount(likeCount)}</span>
    </button>
  );
}
