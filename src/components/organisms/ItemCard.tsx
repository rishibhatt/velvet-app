"use client";

import { motion } from "framer-motion";
import { ExternalLink, StickyNote } from "lucide-react";
import { VelvetImage } from "@/components/atoms/VelvetImage";
import { SourceBadge } from "@/components/molecules/SourceBadge";
import {
  ITEM_CARD_BODY,
  ITEM_CARD_MEDIA,
  ITEM_CARD_SHELL,
} from "@/constants/collection-ui";
import { getItemSourceUrl } from "@/lib/item-source";
import { cn } from "@/lib/utils";
import type { Item } from "@/types/board.types";

interface ItemCardProps {
  item: Item;
  onClick?: () => void;
}

function linkPlaceholderClass(source: Item["source"]) {
  if (source === "instagram") return "from-[#fdf2f8] to-[#fce7f3]";
  if (source === "youtube") return "from-[#fef2f2] to-[#fee2e2]";
  if (source === "pinterest") return "from-tertiary-fixed/50 to-secondary-fixed/35";
  return "from-surface-container to-primary-fixed/25";
}

function ItemSourceButton({ item }: { item: Item }) {
  const sourceUrl = getItemSourceUrl(item);
  if (!sourceUrl) return null;

  return (
    <a
      href={sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-on-surface-variant ring-1 ring-outline-variant/25 transition hover:bg-surface-container-high hover:text-primary"
      aria-label="View source"
      title="View source"
    >
      <ExternalLink className="h-4 w-4" strokeWidth={2} />
    </a>
  );
}

export function ItemCard({ item, onClick }: ItemCardProps) {
  const isNote = item.type === "note";
  const previewUrl = item.image_url;
  const title = item.title?.trim() || (isNote ? "Note" : "Saved link");
  const hasSource = Boolean(getItemSourceUrl(item));

  return (
    <motion.article
      className={ITEM_CARD_SHELL}
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      layout
    >
      {isNote ? (
        <div className="flex aspect-square flex-col bg-gradient-to-br from-primary-fixed/50 via-secondary-fixed/30 to-tertiary-fixed/40 p-4">
          <div className="mb-auto flex items-start justify-between gap-2">
            <div className="velvet-icon-chip h-9 w-9 shrink-0">
              <StickyNote className="h-4 w-4" strokeWidth={2} />
            </div>
            <SourceBadge source="upload" size="sm" />
          </div>
          <h3 className="font-display line-clamp-4 text-sm leading-snug text-on-surface">
            {title}
          </h3>
        </div>
      ) : (
        <>
          <div className={ITEM_CARD_MEDIA}>
            {previewUrl ? (
              <VelvetImage
                src={previewUrl}
                alt={title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
              />
            ) : (
              <div
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-br p-4 text-center",
                  linkPlaceholderClass(item.source),
                )}
              >
                {item.source && (
                  <SourceBadge
                    source={item.source}
                    sourceUrl={item.source_url}
                    size="sm"
                  />
                )}
                <p className="font-display line-clamp-4 text-sm leading-snug text-on-surface">
                  {title}
                </p>
              </div>
            )}

            {item.source && previewUrl && (
              <div className="absolute top-2.5 left-2.5 z-10">
                <SourceBadge
                  source={item.source}
                  sourceUrl={item.source_url}
                  size="sm"
                  showLabel={false}
                  className="shadow-md ring-1 ring-white/40"
                />
              </div>
            )}
          </div>

          <div className={ITEM_CARD_BODY}>
            <div className="flex items-start gap-2">
              <h3 className="line-clamp-2 min-w-0 flex-1 text-sm font-semibold leading-snug text-on-surface">
                {title}
              </h3>
              {hasSource && <ItemSourceButton item={item} />}
            </div>
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {item.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag.id}
                    className="rounded-full bg-surface-container-high px-2 py-0.5 text-[10px] font-medium text-on-surface-variant"
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

export function ItemCardSkeleton({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl ring-1 ring-outline-variant/15"
        >
          <div className="skeleton-shimmer aspect-square w-full" />
          <div className="space-y-2 border-t border-outline-variant/10 p-3">
            <div className="skeleton-shimmer h-4 w-full rounded-md" />
            <div className="skeleton-shimmer h-3 w-2/3 rounded-md" />
          </div>
        </div>
      ))}
    </>
  );
}
