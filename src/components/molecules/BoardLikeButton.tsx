"use client";

import type { MouseEvent } from "react";
import { Heart } from "lucide-react";
import { useToggleBoardLike } from "@/queries/likes/mutations";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { formatCount } from "@/utils/format";
import { cn } from "@/lib/utils";
import { velvetToast } from "@/lib/toast";
import { loginWithReturn } from "@/lib/auth-redirect-path";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();
  const { isAuthenticated, isAuthReady } = useAuth();
  const toggle = useToggleBoardLike();
  const loginHref = loginWithReturn(pathname || "/explore");
  const isFooter = appearance === "footer";
  const isToolbar = appearance === "toolbar";

  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthReady) return;

    if (!isAuthenticated) {
      velvetToast.info("Sign in to like", "Create an account to save favorites.");
      return;
    }
    if (!canLike) return;

    toggle.mutate(boardId);
  };

  const iconSize = isToolbar ? "h-4 w-4" : size === "md" ? "h-5 w-5" : "h-4 w-4";

  if (isToolbar) {
    const shell = cn(
      "relative inline-flex h-10 w-10 min-h-10 min-w-10 shrink-0 items-center justify-center rounded-full border border-outline-variant/40 bg-bg-elevated text-primary shadow-sm transition-all hover:bg-primary-fixed/50 active:scale-95",
      isLiked && "border-error/30 bg-error/10 text-error",
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
          {likeCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] rounded-full bg-primary px-1 py-px text-center text-[10px] font-bold leading-none text-on-primary">
              {formatCount(likeCount)}
            </span>
          )}
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
        className={cn(
          shell,
          (!canLike || !isAuthReady) && isAuthenticated && "opacity-70",
        )}
      >
        <Heart
          className={cn(iconSize, isLiked && "fill-current")}
          strokeWidth={2.25}
        />
        {likeCount > 0 && (
          <span
            className={cn(
              "absolute -top-0.5 -right-0.5 min-w-[18px] rounded-full px-1 py-px text-center text-[10px] font-bold leading-none",
              isLiked
                ? "bg-error text-on-primary"
                : "bg-primary text-on-primary",
            )}
          >
            {formatCount(likeCount)}
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
  );

  const toneStyles = isFooter
    ? isLiked
      ? "bg-primary text-on-primary shadow-sm ring-1 ring-primary/20"
      : "bg-bg-elevated text-primary shadow-sm ring-1 ring-outline-variant/25 hover:bg-primary-fixed/45"
    : isLiked
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
        <span className={countClass}>{formatCount(likeCount)}</span>
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
      className={cn(
        baseStyles,
        toneStyles,
        (!canLike || !isAuthReady) && isAuthenticated && "opacity-70",
        className,
      )}
    >
      <Heart
        className={cn(iconSize, isLiked && "fill-current")}
        strokeWidth={2.25}
      />
      <span className={countClass}>{formatCount(likeCount)}</span>
    </button>
  );
}
