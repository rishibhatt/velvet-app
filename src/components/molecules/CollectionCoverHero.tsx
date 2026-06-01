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
  className,
  size = "board",
}: CollectionCoverHeroProps) {
  const heights =
    size === "public"
      ? "h-[min(52vh,360px)] md:h-[400px]"
      : "h-[min(48vh,320px)] sm:h-[360px] md:h-[400px]";

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

      <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-6 sm:px-margin-mobile sm:pb-8 md:px-margin-desktop">
        <div
          className={cn(
            "mx-auto w-full",
            size === "public" ? "max-w-6xl" : "max-w-7xl",
          )}
        >
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
