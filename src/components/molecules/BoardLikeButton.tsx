"use client";

import type { MouseEvent } from "react";
import { Heart } from "lucide-react";
import { useBoardLikeDisplay } from "@/hooks/useBoardLikeDisplay";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { formatCount } from "@/utils/format";
import { cn } from "@/lib/utils";
import { velvetToast } from "@/lib/toast";
import { loginWithReturn } from "@/lib/auth-redirect-path";
import { useReturnPath } from "@/hooks/useReturnPath";
import Link from "next/link";

interface BoardLikeButtonProps {
  boardId: string;
  likeCount: number;
  isLiked?: boolean;
  canLike?: boolean;
  size?: "sm" | "md";
  /** footer = card bar; overlay = on poster; toolbar = hero icon (matches share) */
  appearance?: "overlay" | "footer" | "toolbar";
  className?: string;
}

export function BoardLikeButton({
  boardId,
  likeCount,
  isLiked = false,
  canLike = true,
  size = "sm",
  appearance = "overlay",
  className,
}: BoardLikeButtonProps) {
  const returnPath = useReturnPath("/explore");
  const loginHref = loginWithReturn(returnPath);
  const { isAuthenticated, isAuthReady } = useAuth();
  const { likeCount: displayCount, isLiked: displayLiked, isPending, toggleLike } =
    useBoardLikeDisplay({ boardId, likeCount, isLiked });
  const isFooter = appearance === "footer";
  const isToolbar = appearance === "toolbar";

  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthReady || isPending) return;

    if (!isAuthenticated) {
      velvetToast.info("Sign in to like", "Create an account to save favorites.");
      return;
    }
    if (!canLike) return;

    toggleLike();
  };

  const iconSize = isToolbar ? "h-4 w-4" : size === "md" ? "h-5 w-5" : "h-4 w-4";

  if (isToolbar) {
    const shell = cn(
      "relative inline-flex h-10 w-10 min-h-10 min-w-10 shrink-0 items-center justify-center rounded-full border border-outline-variant/40 bg-bg-elevated text-primary shadow-sm transition-all hover:bg-primary-fixed/50 active:scale-95",
      displayLiked && "border-error/30 bg-error/10 text-error",
      isPending && "pointer-events-none opacity-80",
      className,
    );

    if (isAuthReady && !isAuthenticated) {
      return (
        <Link
          href={loginHref}
          onClick={(e) => e.stopPropagation()}
          className={shell}
          aria-label="Sign in to like"
        >
          <Heart className={iconSize} strokeWidth={2.25} />
          {displayCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] rounded-full bg-primary px-1 py-px text-center text-[10px] font-bold leading-none text-on-primary">
              {formatCount(displayCount)}
            </span>
          )}
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
        className={cn(
          shell,
          (!canLike || !isAuthReady) && isAuthenticated && "opacity-70",
        )}
      >
        <Heart
          className={cn(iconSize, displayLiked && "fill-current")}
          strokeWidth={2.25}
        />
        {displayCount > 0 && (
          <span
            className={cn(
              "absolute -top-0.5 -right-0.5 min-w-[18px] rounded-full px-1 py-px text-center text-[10px] font-bold leading-none",
              displayLiked
                ? "bg-error text-on-primary"
                : "bg-primary text-on-primary",
            )}
          >
            {formatCount(displayCount)}
          </span>
        )}
      </button>
    );
  }

  const pad = isFooter
    ? "min-h-[36px] gap-1.5 px-3 py-1.5"
    : size === "md"
      ? "px-3 py-2"
      : "px-2.5 py-1.5";

  const baseStyles = cn(
    "inline-flex items-center rounded-full font-semibold transition-all active:scale-95",
    pad,
    isPending && "pointer-events-none opacity-80",
  );

  const toneStyles = isFooter
    ? displayLiked
      ? "bg-primary text-on-primary shadow-sm ring-1 ring-primary/20"
      : "bg-bg-elevated text-primary shadow-sm ring-1 ring-outline-variant/25 hover:bg-primary-fixed/45"
    : displayLiked
      ? "bg-bg-elevated/95 text-error ring-1 ring-error/35 shadow-md"
      : "bg-bg-elevated/95 text-primary shadow-sm ring-1 ring-outline-variant/20 hover:bg-primary-fixed/50";

  const countClass = cn(
    "tabular-nums",
    isFooter ? "text-sm font-bold" : size === "md" ? "text-sm" : "text-xs",
  );

  if (isAuthReady && !isAuthenticated) {
    return (
      <Link
        href={loginHref}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          baseStyles,
          isFooter
            ? "bg-bg-elevated text-primary ring-1 ring-outline-variant/25 hover:bg-primary-fixed/40"
            : "bg-bg-elevated/95 text-primary shadow-sm ring-1 ring-outline-variant/20",
          className,
        )}
        aria-label="Sign in to like collections"
      >
        <Heart className={iconSize} strokeWidth={2.25} />
        <span className={countClass}>{formatCount(displayCount)}</span>
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
      className={cn(baseStyles, toneStyles, (!canLike || !isAuthReady) && isAuthenticated && "opacity-70", className)}
    >
      <Heart
        className={cn(iconSize, displayLiked && "fill-current")}
        strokeWidth={2.25}
      />
      <span className={countClass}>{formatCount(displayCount)}</span>
    </button>
  );
}
