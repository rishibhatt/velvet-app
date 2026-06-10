"use client";

import Link from "next/link";
import { useLeaderboard } from "@/queries/leaderboard/queries";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import { Skeleton } from "@/components/atoms/Skeleton";
import { LeaderboardCuratorChip } from "./LeaderboardCuratorChip";
import { cn } from "@/lib/utils";

const SHOWCASE_LIMIT = 5;
const OVERALL_MOOD = "overall";

function LeaderboardShowcaseSkeleton({ compact }: { compact?: boolean }) {
  const count = compact ? 3 : 5;
  return (
    <section className="mb-6 overflow-visible rounded-3xl border border-outline-variant/20 bg-bg-elevated px-3 py-4 shadow-[var(--shadow-card)] sm:px-5 sm:py-5">
      <div className="mb-4 flex items-center justify-between gap-3 px-0.5">
        <Skeleton className="h-6 w-44 rounded-lg" />
        <Skeleton className="h-4 w-14 rounded" />
      </div>
      <div
        className={cn(
          "flex gap-3 overflow-x-auto hide-scrollbar px-1 py-1.5 sm:gap-4",
          "md:justify-start md:gap-6 md:overflow-visible md:px-0",
        )}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex w-[5.5rem] shrink-0 flex-col items-center sm:w-24">
            <Skeleton className="h-16 w-16 rounded-full sm:h-[4.5rem] sm:w-[4.5rem]" />
            <Skeleton className="mt-2 h-3 w-16 rounded" />
            <Skeleton className="mt-1.5 h-2.5 w-12 rounded" />
          </div>
        ))}
      </div>
    </section>
  );
}

interface ExploreLeaderboardSectionProps {
  /** Smaller embed for insights / category pages */
  compact?: boolean;
  className?: string;
}

export function ExploreLeaderboardSection({
  compact = false,
  className,
}: ExploreLeaderboardSectionProps) {
  const { profile } = useAuth();
  const { data, isLoading } = useLeaderboard(OVERALL_MOOD, SHOWCASE_LIMIT);
  const entries = data?.entries ?? [];
  const showcase = entries.slice(0, compact ? 3 : SHOWCASE_LIMIT);
  const userEntry = entries.find((e) => e.profile.id === profile?.id);

  if (isLoading) {
    return <LeaderboardShowcaseSkeleton compact={compact} />;
  }

  if (entries.length === 0) {
    return (
      <section
        className={cn(
          "mb-6 rounded-3xl border border-outline-variant/20 bg-bg-elevated px-4 py-8 text-center sm:px-5 sm:py-10",
          className,
        )}
      >
        <h2 className="font-display text-lg text-on-surface">Top Curators This Week</h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          Leaderboard updates every Monday. Be the first to appear!
        </p>
      </section>
    );
  }

  return (
    <section
      className={cn(
        "mb-6 overflow-visible rounded-3xl border border-outline-variant/20 bg-bg-elevated px-3 py-4 shadow-[var(--shadow-card)] sm:px-5 sm:py-5",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3 px-0.5 sm:mb-4">
        <h2 className="font-display text-base text-on-surface sm:text-lg">
          Top Curators This Week
        </h2>
        <Link
          href={ROUTES.leaderboard}
          className="shrink-0 text-xs font-bold text-primary hover:underline sm:text-sm"
        >
          View all
        </Link>
      </div>

      <div
        className={cn(
          "-mx-1 flex justify-start gap-3 overflow-x-auto overflow-y-visible hide-scrollbar snap-x snap-mandatory px-1 py-1.5 sm:gap-4",
          "md:mx-0 md:justify-start md:gap-6 md:overflow-visible md:snap-none md:px-0",
        )}
      >
        {showcase.map((entry, i) => (
          <LeaderboardCuratorChip key={entry.profile.id} entry={entry} index={i} />
        ))}
      </div>

      {profile && !userEntry && (
        <p className="mt-3 px-0.5 text-center text-xs text-on-surface-variant sm:mt-4">
          Post more public collections to appear on the leaderboard.
        </p>
      )}
    </section>
  );
}
