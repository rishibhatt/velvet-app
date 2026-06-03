import { COLLECTION_CARD_MEDIA, COLLECTION_CARD_SHELL } from "@/constants/collection-ui";
import { cn } from "@/lib/utils";

export function CollectionCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(COLLECTION_CARD_SHELL, className)}>
      <div className={COLLECTION_CARD_MEDIA}>
        <div className="skeleton-shimmer h-full w-full" />
        <div className="absolute inset-x-0 bottom-0 space-y-2 p-3">
          <div className="skeleton-shimmer h-3 w-16 rounded-full" />
          <div className="skeleton-shimmer h-5 w-3/4 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
