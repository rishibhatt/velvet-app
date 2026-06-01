"use client";

import { motion } from "framer-motion";
import { Heart, StickyNote } from "lucide-react";
import { VelvetImage } from "@/components/atoms/VelvetImage";
import { SourceBadge } from "@/components/molecules/SourceBadge";
import { cn } from "@/lib/utils";
import type { Item } from "@/types/board.types";

interface ItemCardProps {
  item: Item;
  onClick?: () => void;
}

export function ItemCard({ item, onClick }: ItemCardProps) {
  const isNote = item.type === "note";
  const previewUrl = item.image_url;

  return (
    <motion.article
      className="item-card group relative cursor-pointer overflow-hidden rounded-2xl bg-surface-container-lowest shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-hover)]"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      layout
    >
      {isNote ? (
        <div className="min-h-[160px] bg-gradient-to-br from-primary-fixed/40 to-secondary-fixed/30 p-5">
          <StickyNote className="mb-3 h-6 w-6 text-primary" />
          <h3 className="font-display text-lg leading-snug text-on-surface">
            {item.title ?? "Note"}
          </h3>
          {(item.description || item.notes) && (
            <p className="mt-2 line-clamp-4 text-sm text-on-surface-variant">
              {item.description ?? item.notes}
            </p>
          )}
        </div>
      ) : (
        <div className="relative">
          {previewUrl ? (
            <VelvetImage
              src={previewUrl}
              alt={item.title ?? "Saved item"}
              width={400}
              height={500}
              className="w-full object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="flex min-h-[200px] items-center justify-center bg-surface-container p-6 text-center">
              <p className="font-display text-lg text-on-surface">
                {item.title ?? "Saved link"}
              </p>
            </div>
          )}
          {item.source && (
            <div className="absolute top-3 left-3">
              <SourceBadge source={item.source} />
            </div>
          )}
          <button
            className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/40 backdrop-blur-md transition-opacity"
            aria-label={item.is_favorited ? "Unfavorite" : "Favorite"}
            onClick={(e) => e.stopPropagation()}
          >
            <Heart
              className={cn(
                "h-4 w-4",
                item.is_favorited ? "fill-error text-error" : "text-white",
              )}
            />
          </button>
        </div>
      )}
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 p-2">
          {item.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="rounded-md bg-surface-container px-2 py-0.5 text-[10px] text-on-surface-variant"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      )}
    </motion.article>
  );
}

const skeletonHeights = [240, 320, 180, 280, 200, 360, 240, 300, 220];

export function ItemCardSkeleton({ count = 9 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="mb-3 break-inside-avoid overflow-hidden rounded-2xl"
          style={{ height: skeletonHeights[i % skeletonHeights.length] }}
        >
          <div className="skeleton-shimmer h-full w-full rounded-2xl" />
        </div>
      ))}
    </>
  );
}
