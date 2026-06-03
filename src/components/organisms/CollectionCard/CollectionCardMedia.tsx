"use client";

import { CollectionPosterGrid } from "@/components/molecules/CollectionPosterGrid";
import type { CollectionPosterEmptyVariant } from "@/components/molecules/CollectionPosterGrid";
import { COLLECTION_CARD_MEDIA } from "@/constants/collection-ui";
import type { Board } from "@/types/board.types";
import { cn } from "@/lib/utils";

interface CollectionCardMediaProps {
  board: Board;
  emptyVariant: CollectionPosterEmptyVariant;
  onTap: () => void;
  className?: string;
}

export function CollectionCardMedia({
  board,
  emptyVariant,
  onTap,
  className,
}: CollectionCardMediaProps) {
  const previewImages = board.preview_images ?? [];

  return (
    <button
      type="button"
      onClick={onTap}
      className={cn(
        "relative block w-full cursor-pointer overflow-hidden text-left",
        COLLECTION_CARD_MEDIA,
        className,
      )}
      aria-label={`Open ${board.title}`}
    >
      <CollectionPosterGrid
        images={previewImages}
        title={board.title}
        emptyVariant={emptyVariant}
        itemCount={board.item_count ?? 0}
        className="h-full transition-transform duration-700 ease-out group-hover:scale-[1.02]"
      />

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 via-50% to-transparent"
        aria-hidden
      />
    </button>
  );
}
