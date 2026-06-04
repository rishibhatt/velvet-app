import { CollectionCardSkeleton } from "@/components/organisms/CollectionCard";
import { COLLECTION_CARD_GRID } from "@/constants/collection-ui";
import { SKELETON_COLLECTION_GRID_COUNT } from "@/constants/skeleton-layout";
import { cn } from "@/lib/utils";

interface CollectionCardSkeletonGridProps {
  count?: number;
  className?: string;
}

export function CollectionCardSkeletonGrid({
  count = SKELETON_COLLECTION_GRID_COUNT,
  className,
}: CollectionCardSkeletonGridProps) {
  return (
    <div className={cn(COLLECTION_CARD_GRID, className)}>
      {Array.from({ length: count }).map((_, i) => (
        <CollectionCardSkeleton key={i} />
      ))}
    </div>
  );
}
