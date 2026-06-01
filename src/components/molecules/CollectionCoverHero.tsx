import type { ReactNode } from "react";
import { VelvetImage } from "@/components/atoms/VelvetImage";
import { cn } from "@/lib/utils";

interface CollectionCoverHeroProps {
  coverUrl?: string | null;
  title: string;
  description?: string | null;
  badge?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  /** Top bar (e.g. back) overlaid on the cover */
  overlay?: ReactNode;
  className?: string;
  size?: "board" | "public";
}

/** Readable collection header — sharp cover image + strong bottom scrim (no blur). */
export function CollectionCoverHero({
  coverUrl,
  title,
  description,
  badge,
  meta,
  actions,
  overlay,
  className,
  size = "board",
}: CollectionCoverHeroProps) {
  const heights =
    size === "public"
      ? "h-[min(56vh,420px)] md:h-[min(52vh,480px)]"
      : "h-[min(48vh,320px)] sm:h-[360px] md:h-[400px]";
  const maxWidth = size === "public" ? "max-w-6xl" : "max-w-7xl";

  return (
    <header className={cn("relative w-full overflow-hidden", heights, className)}>
      {coverUrl ? (
        <VelvetImage
          src={coverUrl}
          alt=""
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      ) : (
        <div
          className="h-full w-full bg-gradient-to-br from-primary-container via-secondary-container/80 to-tertiary-container/60"
          aria-hidden
        />
      )}

      {/* Scrim: solid readable band at bottom, light tint at top */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-background from-[28%] via-background/88 via-[55%] to-background/15"
        aria-hidden
      />

      {overlay && (
        <div className="absolute inset-x-0 top-0 z-20 px-4 pt-4 sm:px-margin-mobile sm:pt-5 md:px-margin-desktop">
          <div className={cn("mx-auto flex w-full items-center justify-between gap-3", maxWidth)}>
            {overlay}
          </div>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-6 sm:px-margin-mobile sm:pb-8 md:px-margin-desktop">
        <div className={cn("mx-auto w-full", maxWidth)}>
          {badge && <div className="mb-3">{badge}</div>}
          <h1
            className={cn(
              "font-display leading-tight text-on-surface",
              size === "public"
                ? "text-3xl md:text-5xl"
                : "text-2xl sm:text-3xl md:text-5xl",
            )}
          >
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-2xl text-base text-on-surface md:text-lg">
              {description}
            </p>
          )}
          {meta && <div className="mt-3">{meta}</div>}
          {actions && (
            <div className="mt-5 flex flex-wrap items-center gap-3">{actions}</div>
          )}
        </div>
      </div>
    </header>
  );
}
