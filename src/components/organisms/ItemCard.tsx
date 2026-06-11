"use client";

import { motion } from "framer-motion";
import { StickyNote } from "lucide-react";
import { VelvetImage } from "@/components/atoms/VelvetImage";
import { ItemCardQuickActions } from "@/components/molecules/ItemCardQuickActions";
import { SourceBadge } from "@/components/molecules/SourceBadge";
import {
  ITEM_CARD_BODY,
  ITEM_CARD_MEDIA,
  ITEM_CARD_SHELL,
} from "@/constants/collection-ui";
import { getItemDisplayTitle, getItemPreviewImage } from "@/lib/item-preview";
import { cn } from "@/lib/utils";
import type { Item } from "@/types/board.types";

interface ItemCardProps {
  item: Item;
  onClick?: () => void;
  onEdit?: (item: Item) => void;
  boardId?: string;
  canEdit?: boolean;
  /** First above-the-fold tile — improves LCP */
  priority?: boolean;
}

function linkPlaceholderClass(source: Item["source"]) {
  if (source === "instagram") return "from-[#fdf2f8] to-[#fce7f3]";
  if (source === "youtube") return "from-[#fef2f2] to-[#fee2e2]";
  if (source === "pinterest") return "from-tertiary-fixed/50 to-secondary-fixed/35";
  return "from-surface-container to-primary-fixed/25";
}

function ItemCardToolbar({
  item,
  boardId,
  canEdit,
  onEdit,
}: Pick<ItemCardProps, "item" | "boardId" | "canEdit" | "onEdit">) {
  return (
    <div
      className={cn(
        "absolute top-2 right-2 z-20",
        "opacity-100 transition-opacity duration-200",
        "md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100",
      )}
    >
      <ItemCardQuickActions
        item={item}
        boardId={boardId}
        canEdit={canEdit}
        onEdit={onEdit}
      />
    </div>
  );
}

export function ItemCard({
  item,
  onClick,
  onEdit,
  boardId,
  canEdit = false,
  priority = false,
}: ItemCardProps) {
  const isNote = item.type === "note";
  const previewUrl = getItemPreviewImage(item);
  const title = getItemDisplayTitle(item);

  return (
    <motion.article
      className={ITEM_CARD_SHELL}
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      layout
    >
      {isNote ? (
        <div className="relative aspect-square w-full">
          <div className="flex h-full flex-col bg-gradient-to-br from-primary-fixed/50 via-secondary-fixed/30 to-tertiary-fixed/40 p-4">
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
          <ItemCardToolbar
            item={item}
            boardId={boardId}
            canEdit={canEdit}
            onEdit={onEdit}
          />
        </div>
      ) : (
        <>
          <div className={ITEM_CARD_MEDIA}>
            {previewUrl ? (
              <VelvetImage
                src={previewUrl}
                alt={title}
                fill
                priority={priority}
                imageRevision={`${item.updated_at}-${item.id}`}
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

            <ItemCardToolbar
              item={item}
              boardId={boardId}
              canEdit={canEdit}
              onEdit={onEdit}
            />
          </div>

          <div className={ITEM_CARD_BODY}>
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-on-surface">
              {title}
            </h3>
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
