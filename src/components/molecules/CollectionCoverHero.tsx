import type { ReactNode } from "react";
import {
  CollectionPosterGrid,
  type CollectionPosterEmptyVariant,
} from "@/components/molecules/CollectionPosterGrid";
import { PageWidthFrame } from "@/components/layouts/PageWidth";
import { cn } from "@/lib/utils";

interface CollectionCoverHeroProps {
  images?: string[];
  title: string;
  description?: string | null;
  badge?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  overlay?: ReactNode;
  className?: string;
  size?: "board" | "public";
  emptyVariant?: CollectionPosterEmptyVariant;
  itemCount?: number;
}

/**
 * Collection header — reference layout: copy on the left, 1–4 image poster on the right.
 */
export function CollectionCoverHero({
  images = [],
  title,
  description,
  badge,
  meta,
  actions,
  overlay,
  className,
  size = "board",
  emptyVariant = "own",
  itemCount = 0,
}: CollectionCoverHeroProps) {
  const isPublic = size === "public";

  return (
    <header
      className={cn(
        "relative border-b border-outline-variant/15 bg-background",
        className,
      )}
    >
      {overlay && (
        <div className="absolute inset-x-0 top-0 z-30">
          <PageWidthFrame innerClassName="pt-4 sm:pt-5">
            <div className="flex w-full items-center justify-between gap-3 px-4 sm:px-6 md:px-0">
              {overlay}
            </div>
          </PageWidthFrame>
        </div>
      )}

      <PageWidthFrame>
        <div
          className={cn(
            "flex w-full flex-col overflow-hidden md:flex-row md:rounded-2xl",
            isPublic
              ? "min-h-[min(56vh,420px)] md:min-h-[min(52vh,480px)]"
              : "min-h-[min(48vh,320px)] sm:min-h-[360px] md:min-h-[400px]",
          )}
        >
          {/* Copy — left on desktop */}
          <div className="relative z-20 order-2 flex flex-1 flex-col justify-end bg-background px-4 pb-6 pt-20 sm:px-6 sm:pb-8 sm:pt-24 md:order-1 md:max-w-[min(48%,520px)] md:justify-center md:px-0 md:py-10 md:pr-8 lg:max-w-[44%]">
            {badge && <div className="mb-3">{badge}</div>}
            <h1
              className={cn(
                "font-display leading-tight text-on-surface",
                isPublic ? "text-3xl md:text-4xl lg:text-5xl" : "text-2xl sm:text-3xl md:text-4xl",
              )}
            >
              {title}
            </h1>
            {description && (
              <p className="mt-2 max-w-xl text-sm text-on-surface-variant md:text-base">
                {description}
              </p>
            )}
            {meta && <div className="mt-4">{meta}</div>}
            {actions && (
              <div className="mt-5 flex flex-wrap items-center gap-2 sm:gap-2.5">
                {actions}
              </div>
            )}
          </div>

          {/* Poster grid — right on desktop, top on mobile */}
          <div
            className={cn(
              "relative order-1 w-full shrink-0 overflow-hidden md:order-2 md:min-h-0 md:flex-1",
              isPublic
                ? "h-[min(44vw,260px)] sm:h-[min(40vw,300px)] md:h-auto"
                : "h-[min(42vw,240px)] sm:h-[280px] md:h-auto",
            )}
          >
            <CollectionPosterGrid
              images={images}
              title={title}
              itemCount={itemCount}
              emptyVariant={emptyVariant}
              variant="hero"
              imageSizes="(max-width: 768px) 100vw, min(50vw, 640px)"
              priority
              className="h-full w-full"
            />
            {/* Fade into text panel (desktop) */}
            <div
              className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-[38%] bg-gradient-to-r from-background via-background/70 to-transparent md:block"
              aria-hidden
            />
            {/* Fade into copy below (mobile) */}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-background to-transparent md:hidden"
              aria-hidden
            />
          </div>
        </div>
      </PageWidthFrame>
    </header>
  );
}
