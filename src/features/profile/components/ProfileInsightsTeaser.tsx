"use client";

import Link from "next/link";
import { BarChart3, ChevronRight, TrendingDown, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/atoms/Skeleton";
import { ROUTES } from "@/constants/routes";
import { useInsights } from "@/queries/insights/queries";
import { formatCount } from "@/utils/format";
import { cn } from "@/lib/utils";

interface ProfileInsightsTeaserProps {
  className?: string;
}

/** Profile entry to creator insights — Instagram-style professional dashboard teaser. */
export function ProfileInsightsTeaser({ className }: ProfileInsightsTeaserProps) {
  const { data, isLoading } = useInsights("this_week");

  if (isLoading) {
    return (
      <Skeleton
        className={cn("h-[4.75rem] w-full rounded-2xl sm:h-20 sm:rounded-3xl", className)}
      />
    );
  }

  const views = data?.overview.weekly_views ?? 0;
  const change = data?.overview.weekly_change_pct ?? 0;
  const hasPublicBoards = (data?.overview.public_boards ?? 0) > 0;

  if (!hasPublicBoards) return null;

  const changeLabel =
    change > 0
      ? `${change}% more than last week`
      : change < 0
        ? `${Math.abs(change)}% less than last week`
        : views > 0
          ? "Same as last week"
          : "Start sharing to see who visits";

  return (
    <Link
      href={ROUTES.insights}
      className={cn(
        "group flex items-center gap-3 rounded-2xl border border-outline-variant/20 bg-bg-elevated px-4 py-3.5 shadow-[var(--shadow-card)] transition-colors hover:border-primary/25 hover:bg-primary-fixed/20 sm:rounded-3xl sm:px-5 sm:py-4",
        className,
      )}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-fixed/80 text-primary sm:h-12 sm:w-12">
        <BarChart3 className="h-5 w-5" aria-hidden />
      </div>

      <div className="min-w-0 flex-1 text-left">
        <p className="text-sm font-semibold text-on-surface sm:text-base">
          Creator insights
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-on-surface-variant sm:text-sm">
          <span>
            {formatCount(views)} {views === 1 ? "view" : "views"} this week
          </span>
          {change !== 0 ? (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-semibold",
                change > 0 ? "text-primary" : "text-error",
              )}
            >
              {change > 0 ? (
                <TrendingUp className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" aria-hidden />
              )}
              {changeLabel}
            </span>
          ) : (
            <span className="text-on-surface-variant/90">{changeLabel}</span>
          )}
        </p>
      </div>

      <ChevronRight
        className="h-5 w-5 shrink-0 text-on-surface-variant transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
        aria-hidden
      />
    </Link>
  );
}
