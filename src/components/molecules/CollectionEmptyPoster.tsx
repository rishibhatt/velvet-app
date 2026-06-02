"use client";

import { ImagePlus, Layers, Sparkles, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";

export type CollectionPosterEmptyVariant = "own" | "other";

interface CollectionEmptyPosterProps {
  variant: CollectionPosterEmptyVariant;
  title: string;
  className?: string;
  compact?: boolean;
}

/** Shared empty collection poster — used on cards and poster grids */
export function CollectionEmptyPoster({
  variant,
  title,
  className,
  compact = false,
}: CollectionEmptyPosterProps) {
  const isOwn = variant === "own";

  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col items-center justify-center overflow-hidden text-center",
        "bg-gradient-to-br from-primary-fixed/40 via-surface-container-low to-secondary-fixed/35",
        compact ? "gap-2 p-4" : "gap-3 p-6",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 25% 20%, var(--primary-container) 0%, transparent 50%), radial-gradient(circle at 75% 80%, var(--tertiary-container) 0%, transparent 45%)",
        }}
      />
      <div
        className={cn(
          "relative flex items-center justify-center rounded-2xl bg-bg-elevated/90 shadow-md ring-1 ring-primary/15",
          compact ? "h-11 w-11" : "h-14 w-14",
        )}
      >
        {isOwn ? (
          <ImagePlus
            className={cn("text-primary", compact ? "h-5 w-5" : "h-7 w-7")}
            strokeWidth={1.75}
            aria-hidden
          />
        ) : (
          <Layers
            className={cn("text-primary/70", compact ? "h-5 w-5" : "h-7 w-7")}
            strokeWidth={1.75}
            aria-hidden
          />
        )}
      </div>
      <div className={cn("relative", compact ? "max-w-[11rem]" : "max-w-[14rem]")}>
        <p
          className={cn(
            "font-display leading-tight text-on-surface",
            compact ? "text-base" : "text-lg sm:text-xl",
          )}
        >
          {isOwn ? "Start curating" : "Currently empty"}
        </p>
        {!compact && (
          <p className="mt-1.5 text-xs leading-relaxed text-on-surface-variant sm:text-sm">
            {isOwn
              ? "Add a link, photo, or note to fill this collection."
              : "This collection doesn’t have any saves yet."}
          </p>
        )}
      </div>
      {isOwn && !compact && (
        <span className="relative inline-flex items-center gap-1.5 rounded-full bg-primary/90 px-3 py-1 text-[11px] font-semibold text-on-primary shadow-sm">
          <Sparkles className="h-3 w-3" aria-hidden />
          Add your first save
        </span>
      )}
      <span className="sr-only">{title} — empty collection</span>
    </div>
  );
}

/** Collection has saves but no image previews (notes, links without OG, etc.) */
export function CollectionTextSavesPoster({
  itemCount,
  variant,
  title,
  className,
}: {
  itemCount: number;
  variant: CollectionPosterEmptyVariant;
  title: string;
  className?: string;
}) {
  const isOwn = variant === "own";

  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden p-6 text-center",
        "bg-gradient-to-br from-secondary-fixed/35 via-surface-container-low to-primary-fixed/30",
        className,
      )}
    >
      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-bg-elevated/90 shadow-md ring-1 ring-primary/15">
        <StickyNote className="h-7 w-7 text-primary" strokeWidth={1.75} aria-hidden />
      </div>
      <div>
        <p className="font-display text-lg text-on-surface sm:text-xl">
          {itemCount} {itemCount === 1 ? "save" : "saves"}
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-on-surface-variant sm:text-sm">
          {isOwn
            ? "Add photos or links with previews to see them on the cover."
            : "Saves in this collection — open to explore."}
        </p>
      </div>
      <span className="sr-only">{title} — {itemCount} saves without cover images</span>
    </div>
  );
}
