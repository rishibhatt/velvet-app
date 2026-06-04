import { SKELETON_EXPLORE_LIST_COUNT } from "@/constants/skeleton-layout";
import { cn } from "@/lib/utils";

export function ExploreListRowSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-2xl border border-outline-variant/15 bg-bg-elevated p-2 sm:gap-4 sm:p-3",
        className,
      )}
    >
      <div className="skeleton-shimmer h-24 w-24 shrink-0 rounded-xl sm:h-28 sm:w-32" />
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 py-1">
        <div className="skeleton-shimmer h-4 w-3/4 max-w-[200px] rounded-md" />
        <div className="skeleton-shimmer h-3 w-1/2 max-w-[140px] rounded-md" />
        <div className="skeleton-shimmer h-3 w-1/3 max-w-[100px] rounded-md" />
      </div>
    </div>
  );
}

export function ExploreListSkeleton({
  count = SKELETON_EXPLORE_LIST_COUNT,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <ExploreListRowSkeleton key={i} />
      ))}
    </div>
  );
}
