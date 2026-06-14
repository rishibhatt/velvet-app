"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useBoardLikeDisplay } from "@/hooks/useBoardLikeDisplay";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { formatCount } from "@/utils/format";
import { velvetToast } from "@/lib/toast";
import { loginWithReturn } from "@/lib/auth-redirect-path";
import { useReturnPath } from "@/hooks/useReturnPath";
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
  const returnPath = useReturnPath("/explore");
  const { isAuthenticated, isAuthReady } = useAuth();
  const { likeCount: displayCount, isLiked: displayLiked, isPending, toggleLike } =
    useBoardLikeDisplay({ boardId, likeCount, isLiked });

  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthReady || isPending) return;
    if (!isAuthenticated) {
      velvetToast.info("Sign in to like", "Create an account to save favorites.");
      return;
    }
    if (!canLike) return;
    if (!displayLiked) onLikeBurst?.();
    toggleLike();
  };

  const shell = cn(
    "pointer-events-auto inline-flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-full border border-white/15 bg-black/45 px-3 text-xs font-semibold text-white shadow-lg backdrop-blur-md transition-transform active:scale-95",
    displayLiked && "border-error/40 bg-error/35",
    isPending && "pointer-events-none opacity-80",
    className,
  );

  if (isAuthReady && !isAuthenticated) {
    return (
      <Link
        href={loginWithReturn(returnPath)}
        onClick={(e) => e.stopPropagation()}
        className={shell}
        aria-label="Sign in to like"
      >
        <Heart className="h-4 w-4 shrink-0" strokeWidth={2.25} />
        <span className="tabular-nums">{formatCount(displayCount)}</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={(!canLike && isAuthenticated) || !isAuthReady || isPending}
      aria-label={displayLiked ? "Unlike collection" : "Like collection"}
      aria-pressed={displayLiked}
      aria-busy={isPending}
      className={cn(shell, (!canLike || !isAuthReady) && isAuthenticated && "opacity-80")}
    >
      <Heart
        className={cn("h-4 w-4 shrink-0", displayLiked && "fill-current")}
        strokeWidth={2.25}
      />
      <span className="tabular-nums">{formatCount(displayCount)}</span>
    </button>
  );
}
