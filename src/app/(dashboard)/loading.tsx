import { ItemCardSkeleton } from "@/components/organisms/ItemCard";
import { ShowcaseBoardCardSkeleton } from "@/components/organisms/ShowcaseBoardCard";

export default function DashboardLoading() {
  return (
    <main className="page-container py-stack-lg">
      <div className="skeleton-shimmer mb-8 h-10 w-48 rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ShowcaseBoardCardSkeleton />
        <ShowcaseBoardCardSkeleton />
        <ShowcaseBoardCardSkeleton />
      </div>
      <div className="mt-12">
        <ItemCardSkeleton count={4} />
      </div>
    </main>
  );
}
