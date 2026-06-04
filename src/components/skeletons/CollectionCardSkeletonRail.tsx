import { CollectionCardSkeleton } from "@/components/organisms/CollectionCard";
import {
  HOME_DISCOVER_CARD_RAIL,
  HOME_DISCOVER_CARD_RAIL_ITEM,
} from "@/constants/collection-ui";
import { SKELETON_HOME_RAIL_COUNT } from "@/constants/skeleton-layout";
import { cn } from "@/lib/utils";

interface CollectionCardSkeletonRailProps {
  count?: number;
  className?: string;
}

export function CollectionCardSkeletonRail({
  count = SKELETON_HOME_RAIL_COUNT,
  className,
}: CollectionCardSkeletonRailProps) {
  return (
    <div className={cn(HOME_DISCOVER_CARD_RAIL, className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={HOME_DISCOVER_CARD_RAIL_ITEM}>
          <CollectionCardSkeleton />
        </div>
      ))}
    </div>
  );
}
