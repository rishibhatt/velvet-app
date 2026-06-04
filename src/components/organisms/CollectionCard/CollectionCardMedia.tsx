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
  isPending?: boolean;
  className?: string;
}

export function CollectionCardMedia({
  board,
  emptyVariant,
  onTap,
  isPending = false,
  className,
}: CollectionCardMediaProps) {
  const previewImages = board.preview_images ?? [];

  return (
    <button
      type="button"
      onClick={onTap}
      disabled={isPending}
      className={cn(
        "relative block w-full cursor-pointer overflow-hidden text-left outline-none focus:outline-none focus-visible:outline-none",
        COLLECTION_CARD_MEDIA,
        isPending && "cursor-wait",
        className,
      )}
      aria-label={`Open ${board.title}`}
      aria-busy={isPending}
    >
      <CollectionPosterGrid
        images={previewImages}
        title={board.title}
        emptyVariant={emptyVariant}
        itemCount={board.item_count ?? 0}
        className={cn(
          "h-full transition-transform duration-700 ease-out group-hover:scale-[1.02]",
          isPending && "scale-[1.01]",
        )}
      />

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 via-50% to-transparent"
        aria-hidden
      />

      {isPending && (
        <div
          className="pointer-events-none absolute inset-0 z-10 bg-black/15"
          aria-hidden
        >
          <div className="absolute inset-x-0 top-0 h-0.5 overflow-hidden bg-white/10">
            <div className="h-full w-2/5 animate-[velvet-nav-indeterminate_1.35s_cubic-bezier(0.45,0.05,0.25,0.95)_infinite] rounded-full bg-white/70" />
          </div>
        </div>
      )}
    </button>
  );
}
