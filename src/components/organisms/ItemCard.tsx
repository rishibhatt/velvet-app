"use client";

import { motion } from "framer-motion";
import { StickyNote, ChevronRight } from "lucide-react";
import { VelvetImage } from "@/components/atoms/VelvetImage";
import { SourceBadge } from "@/components/molecules/SourceBadge";
import { cn } from "@/lib/utils";
import { getPreviewAspectClass } from "@/lib/preview-image";
import type { Item } from "@/types/board.types";

interface ItemCardProps {
  item: Item;
  onClick?: () => void;
}

export function ItemCard({ item, onClick }: ItemCardProps) {
  const isNote = item.type === "note";
  const previewUrl = item.image_url;
  const aspectClass = getPreviewAspectClass(previewUrl);

  return (
    <motion.article
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-outline-variant/20 bg-bg-elevated shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[var(--shadow-hover)] active:scale-[0.99]"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      layout
    >
      {isNote ? (
        <div className="flex min-h-[140px] flex-1 flex-col bg-gradient-to-br from-primary-fixed/45 via-secondary-fixed/25 to-tertiary-fixed/35 p-4">
          <div className="mb-auto flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-bg-elevated/90 text-primary shadow-sm">
              <StickyNote className="h-4 w-4" />
            </div>
            <SourceBadge source="web" size="sm" />
          </div>
          <h3 className="font-display mt-3 line-clamp-3 text-base leading-snug text-on-surface">
            {item.title ?? "Note"}
          </h3>
          {(item.description || item.notes) && (
            <p className="mt-1.5 line-clamp-2 text-xs text-on-surface-variant">
              {item.description ?? item.notes}
            </p>
          )}
        </div>
      ) : (
        <>
          <div
            className={cn(
              "relative w-full overflow-hidden bg-surface-container",
              aspectClass,
            )}
          >
            {previewUrl ? (
              <VelvetImage
                src={previewUrl}
                alt={item.title ?? "Saved item"}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
            ) : (
              <div
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-2 p-4 text-center",
                  item.source === "instagram" && "bg-gradient-to-br from-[#fdf2f8] to-[#fce7f3]",
                  item.source === "youtube" && "bg-gradient-to-br from-[#fef2f2] to-[#fee2e2]",
                  item.source === "pinterest" && "bg-gradient-to-br from-tertiary-fixed/40 to-secondary-fixed/30",
                  (!item.source ||
                    item.source === "web" ||
                    item.source === "amazon" ||
                    item.source === "upload") &&
                    "bg-gradient-to-br from-surface-container to-primary-fixed/20",
                )}
              >
                {item.source && <SourceBadge source={item.source} size="sm" />}
                <p className="font-display line-clamp-3 text-sm text-on-surface">
                  {item.title ?? "Saved link"}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-2 border-t border-outline-variant/15 p-3">
            <div className="flex items-center justify-between gap-2">
              {item.source ? (
                <SourceBadge source={item.source} size="sm" />
              ) : (
                <span className="text-[9px] font-semibold uppercase tracking-wider text-on-surface-variant">
                  Saved
                </span>
              )}
              <ChevronRight className="h-4 w-4 shrink-0 text-outline transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </div>
            <h3 className="font-display line-clamp-2 text-sm leading-snug text-on-surface">
              {item.title ?? "Untitled save"}
            </h3>
            {item.tags && item.tags.length > 0 && (
              <div className="mt-auto flex flex-wrap gap-1 pt-1">
                {item.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag.id}
                    className="rounded-md bg-surface-container-high px-1.5 py-0.5 text-[10px] font-medium text-on-surface-variant"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </motion.article>
  );
}

export function ItemCardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-outline-variant/15"
        >
          <div className="skeleton-shimmer aspect-[4/5] w-full" />
          <div className="space-y-2 p-3">
            <div className="skeleton-shimmer h-4 w-16 rounded-full" />
            <div className="skeleton-shimmer h-4 w-full rounded-md" />
          </div>
        </div>
      ))}
    </>
  );
}
