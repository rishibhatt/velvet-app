import { Skeleton } from "@/components/atoms/Skeleton";
import { CollectionCardSkeletonRail } from "@/components/skeletons/CollectionCardSkeletonRail";

/** Mirrors home layout: hero, discover rail, owned rail. */
export function HomePageSkeleton() {
  return (
    <main className="page-container py-stack-lg md:py-12">
      <Skeleton className="mb-6 h-32 w-full rounded-3xl sm:h-36 md:h-40" />
      <section className="velvet-panel mb-6 p-4 sm:p-6 md:mb-8">
        <Skeleton className="mb-4 h-6 w-40 rounded-lg" />
        <CollectionCardSkeletonRail />
      </section>
      <section className="velvet-panel p-4 sm:p-6">
        <Skeleton className="mb-4 h-6 w-48 rounded-lg" />
        <CollectionCardSkeletonRail />
      </section>
    </main>
  );
}
