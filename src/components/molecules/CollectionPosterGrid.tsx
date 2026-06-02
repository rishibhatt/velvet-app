"use client";

import { ImagePlus, LayoutGrid } from "lucide-react";
import { VelvetImage } from "@/components/atoms/VelvetImage";
import { cn } from "@/lib/utils";

interface CollectionPosterGridProps {
  images: string[];
  title: string;
  className?: string;
}

const SLOT_COUNT = 4;

export function CollectionPosterGrid({
  images,
  title,
  className,
}: CollectionPosterGridProps) {
  const slots = Array.from({ length: SLOT_COUNT }, (_, i) => images[i] ?? null);
  const filled = images.filter(Boolean).length;

  return (
    <div
      className={cn(
        "grid h-full w-full grid-cols-2 grid-rows-2 gap-0.5 bg-outline-variant/20 p-0.5",
        className,
      )}
    >
      {slots.map((src, i) => (
        <div
          key={i}
          className="relative min-h-0 overflow-hidden bg-surface-container-low"
        >
          {src ? (
            <VelvetImage
              src={src}
              alt=""
              fill
              className="object-cover"
              sizes="160px"
            />
          ) : (
            <div className="flex h-full min-h-[72px] w-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-primary-fixed/25 via-surface-container-low to-secondary-fixed/20 p-2">
              {filled === 0 && i === 0 ? (
                <>
                  <ImagePlus
                    className="h-5 w-5 text-primary/50"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <span className="text-center text-[9px] font-medium leading-tight text-on-surface-variant/80">
                    Add saves
                  </span>
                </>
              ) : (
                <LayoutGrid
                  className="h-4 w-4 text-outline-variant/50"
                  strokeWidth={1.5}
                  aria-hidden
                />
              )}
            </div>
          )}
        </div>
      ))}
      <span className="sr-only">{title} preview</span>
    </div>
  );
}
