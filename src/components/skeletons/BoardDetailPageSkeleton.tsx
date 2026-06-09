import { CollectionItemsGrid } from "@/components/organisms/CollectionItemsGrid";
import { ItemCardSkeleton } from "@/components/organisms/ItemCard";
import { SKELETON_BOARD_ITEMS_COUNT } from "@/constants/skeleton-layout";

/** Matches CollectionCoverHero `size="board"` + items section layout. */
export function BoardDetailPageSkeleton() {
  return (
    <div className="pb-32">
      <div className="flex min-h-[min(48vh,320px)] w-full flex-col sm:min-h-[360px] md:min-h-[400px] md:flex-row">
        <div className="skeleton-shimmer order-2 h-48 w-full md:order-1 md:h-auto md:min-h-[360px] md:flex-1" />
        <div className="skeleton-shimmer order-1 h-[min(42vw,240px)] w-full sm:h-[280px] md:order-2 md:h-auto md:min-h-[360px] md:flex-1" />
      </div>
      <div className="page-container mt-stack-lg space-y-5">
        <div className="space-y-2">
          <div className="skeleton-shimmer h-8 w-2/3 max-w-md rounded-lg" />
          <div className="skeleton-shimmer h-4 w-1/3 max-w-xs rounded-md" />
        </div>
        <CollectionItemsGrid>
          <ItemCardSkeleton count={SKELETON_BOARD_ITEMS_COUNT} />
        </CollectionItemsGrid>
      </div>
    </div>
  );
}
