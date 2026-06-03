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
  /** When > 0 but no preview images, show “N saves” instead of empty */
  itemCount?: number;
  /** Passed to VelvetImage `sizes` (e.g. hero uses `100vw`) */
  imageSizes?: string;
}

function PosterImage({
  src,
  title,
  className,
  sizes = "(max-width: 640px) 45vw, 200px",
}: {
  src: string;
  title: string;
  className?: string;
  sizes?: string;
}) {
  return (
    <div className={cn("relative min-h-0 overflow-hidden bg-surface-container-low", className)}>
      <VelvetImage
        src={src}
        alt=""
        fill
        className="object-cover"
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
}: CollectionPosterGridProps) {
  const urls = images.filter(Boolean).slice(0, 4);
  const count = urls.length;

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

  const posterSizes = imageSizes;

  if (count === 1) {
    return (
      <PosterImage
        src={urls[0]!}
        title={title}
        sizes={posterSizes}
        className={cn("h-full w-full", className)}
      />
    );
  }

  if (count === 2) {
    return (
      <div
        className={cn(
          "grid h-full w-full grid-cols-2 gap-0.5 bg-outline-variant/20 p-0.5",
          className,
        )}
      >
        {urls.map((src, i) => (
          <PosterImage
            key={i}
            src={src}
            title={title}
            sizes={posterSizes}
            className="h-full min-h-[80px]"
          />
        ))}
      </div>
    );
  }

  if (count === 3) {
    return (
      <div
        className={cn(
          "grid h-full w-full grid-cols-2 grid-rows-2 gap-0.5 bg-outline-variant/20 p-0.5",
          className,
        )}
      >
        <PosterImage src={urls[0]!} title={title} sizes={posterSizes} className="row-span-1" />
        <PosterImage src={urls[1]!} title={title} sizes={posterSizes} className="row-span-1" />
        <PosterImage
          src={urls[2]!}
          title={title}
          sizes={posterSizes}
          className="col-span-2 row-span-1"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid h-full w-full grid-cols-2 grid-rows-2 gap-0.5 bg-outline-variant/20 p-0.5",
        className,
      )}
    >
      {urls.map((src, i) => (
        <PosterImage
          key={i}
          src={src}
          title={title}
          sizes={posterSizes}
          className="min-h-[72px]"
        />
      ))}
    </div>
  );
}
