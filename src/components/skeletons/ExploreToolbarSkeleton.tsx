import { Skeleton } from "@/components/atoms/Skeleton";
import { VELVET_TOOLBAR_CARD } from "@/constants/velvet-toolbar";
import { cn } from "@/lib/utils";

export function ExploreToolbarSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "sticky top-14 z-30 -mx-4 mb-5 px-4 pb-1 sm:top-16 sm:mx-0 sm:px-0",
        className,
      )}
    >
      <div className={cn(VELVET_TOOLBAR_CARD, "bg-bg-elevated px-3 py-3 sm:px-5 sm:py-3.5")}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <Skeleton className="h-10 w-full max-w-[9.5rem] rounded-full sm:w-36" />
          <div className="flex gap-2 sm:gap-2.5">
            <Skeleton className="h-10 min-w-0 flex-1 rounded-full sm:w-34 sm:flex-none" />
            <Skeleton className="h-10 min-w-0 flex-1 rounded-full sm:w-28 sm:flex-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
