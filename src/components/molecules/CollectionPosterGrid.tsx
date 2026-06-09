"use client";

import { VelvetImage } from "@/components/atoms/VelvetImage";
import {
  CollectionEmptyPoster,
  CollectionTextSavesPoster,
  type CollectionPosterEmptyVariant,
} from "@/components/molecules/CollectionEmptyPoster";
import { cn } from "@/lib/utils";

export type { CollectionPosterEmptyVariant };

interface CollectionPosterGridProps {
  images: string[];
  title: string;
  className?: string;
  emptyVariant?: CollectionPosterEmptyVariant;
  compactEmpty?: boolean;
  itemCount?: number;
  imageSizes?: string;
  priority?: boolean;
  /** Hero banners use tighter gaps and full-bleed cells */
  variant?: "card" | "hero";
}

const GRID_FRAME = "h-full w-full gap-1 bg-outline-variant/15 p-1";

function PosterImage({
  src,
  title,
  className,
  sizes = "(max-width: 640px) 45vw, 200px",
  priority = false,
}: {
  src: string;
  title: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative h-full min-h-0 w-full overflow-hidden rounded-sm bg-surface-container-low",
        className,
      )}
    >
      <VelvetImage
        src={src}
        alt=""
        fill
        priority={priority}
        className="object-cover object-center"
        sizes={sizes}
      />
      <span className="sr-only">{title}</span>
    </div>
  );
}

export function CollectionPosterGrid({
  images,
  title,
  className,
  emptyVariant = "other",
  compactEmpty = false,
  itemCount = 0,
  imageSizes,
  priority = false,
  variant = "card",
}: CollectionPosterGridProps) {
  const urls = images.filter(Boolean).slice(0, 4);
  const count = urls.length;
  const posterSizes = imageSizes;
  const frame = variant === "hero" ? GRID_FRAME : cn(GRID_FRAME, "gap-0.5 p-0.5");
  const cellRadius = variant === "hero" ? "rounded-sm" : "rounded-none";

  if (count === 0) {
    if (itemCount > 0) {
      return (
        <CollectionTextSavesPoster
          itemCount={itemCount}
          variant={emptyVariant}
          title={title}
          className={className}
        />
      );
    }
    return (
      <CollectionEmptyPoster
        variant={emptyVariant}
        title={title}
        compact={compactEmpty}
        className={className}
      />
    );
  }

  if (count === 1) {
    return (
      <PosterImage
        src={urls[0]!}
        title={title}
        sizes={posterSizes}
        priority={priority}
        className={cn("h-full w-full", cellRadius, className)}
      />
    );
  }

  if (count === 2) {
    return (
      <div className={cn("grid grid-cols-2", frame, className)}>
        {urls.map((src, i) => (
          <PosterImage
            key={i}
            src={src}
            title={title}
            sizes={posterSizes}
            priority={priority}
            className={cellRadius}
          />
        ))}
      </div>
    );
  }

  if (count === 3) {
    return (
      <div className={cn("grid grid-cols-2 grid-rows-2", frame, className)}>
        <PosterImage
          src={urls[0]!}
          title={title}
          sizes={posterSizes}
          priority={priority}
          className={cn("row-span-2", cellRadius)}
        />
        <PosterImage
          src={urls[1]!}
          title={title}
          sizes={posterSizes}
          priority={priority}
          className={cellRadius}
        />
        <PosterImage
          src={urls[2]!}
          title={title}
          sizes={posterSizes}
          priority={priority}
          className={cellRadius}
        />
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-2 grid-rows-2", frame, className)}>
      {urls.map((src, i) => (
        <PosterImage
          key={i}
          src={src}
          title={title}
          sizes={posterSizes}
          priority={priority}
          className={cellRadius}
        />
      ))}
    </div>
  );
}
