"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Trophy } from "lucide-react";
import { Avatar } from "@/components/atoms/Avatar";
import { ROUTES } from "@/constants/routes";
import { MoodCategoryRail } from "@/components/organisms/MoodCategoryRail";
import { useLeaderboard } from "@/queries/leaderboard/queries";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { BadgeChip, pickPrimaryBadge } from "@/components/creator/BadgeChip";
import { formatCount } from "@/utils/format";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { VELVET_TOOLBAR_CARD } from "@/constants/velvet-toolbar";

const RANK_AVATAR_HIGHLIGHT = [
  "shadow-[0_0_0_2px_#fbbf24]",
  "shadow-[0_0_0_2px_#cbd5e1]",
  "shadow-[0_0_0_2px_#b45309]",
];

export function LeaderboardPageContent() {
  const searchParams = useSearchParams();
  const initialMood = searchParams.get("mood") ?? "overall";
  const [mood, setMood] = useState(initialMood);
  const { profile } = useAuth();
  const { data, isLoading } = useLeaderboard(mood, 50);

  useEffect(() => {
    const param = searchParams.get("mood");
    if (param) setMood(param);
  }, [searchParams]);

  useEffect(() => {
    track(ANALYTICS_EVENTS.LEADERBOARD_VIEWED, { mood, full_page: true });
  }, [mood]);

  const entries = data?.entries ?? [];
  const userEntry = entries.find((e) => e.profile.id === profile?.id);

  return (
    <main className="page-container py-stack-lg pb-28 md:py-12 md:pb-12">
      <header className="mb-6">
        <div className="mb-2 flex items-center gap-2 text-primary">
          <Trophy className="h-5 w-5" strokeWidth={2.25} aria-hidden />
          <span className="text-xs font-bold tracking-[0.15em] uppercase">Community</span>
        </div>
        <h1 className="font-display text-2xl text-on-surface sm:text-3xl">Weekly Leaderboard</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Top curators ranked by views, likes, and re-saves this week. Resets every Monday.
        </p>
      </header>

      <div className={cn(VELVET_TOOLBAR_CARD, "mb-6 bg-bg-elevated px-3 py-3 sm:px-5 sm:py-4")}>
        <MoodCategoryRail
          value={mood === "overall" ? "overall" : (mood as import("@/types/board.types").Mood)}
          onChange={(v) => setMood(v === null || v === "overall" ? "overall" : v)}
          allLabel="Overall"
          allValue="overall"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-surface-container-low" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-3xl border border-outline-variant/20 bg-bg-elevated px-6 py-16 text-center">
          <p className="font-display text-lg text-on-surface">No rankings yet</p>
          <p className="mt-2 text-sm text-on-surface-variant">
            Publish public collections to compete this week.
          </p>
          <Link
            href={ROUTES.explore}
            className="mt-6 inline-block text-sm font-bold text-primary hover:underline"
          >
            Explore collections
          </Link>
        </div>
      ) : (
        <section className="rounded-3xl border border-outline-variant/20 bg-bg-elevated p-4 sm:p-5">
          <h2 className="font-display mb-4 text-lg text-on-surface">Rankings</h2>
          <ul className="divide-y divide-outline-variant/15">
            {entries.map((entry, i) => {
              const primaryBadge = pickPrimaryBadge(entry.badges ?? []);
              const isMe = entry.profile.id === profile?.id;
              return (
                <li key={entry.profile.id}>
                  <Link
                    href={ROUTES.creator(entry.profile.username)}
                    className={cn(
                      "flex items-center gap-3 py-3.5 transition-colors hover:bg-surface-container-low/60 sm:gap-4 sm:px-2",
                      isMe && "bg-primary-fixed/25",
                    )}
                  >
                    <span className="w-6 shrink-0 text-center text-sm font-bold text-on-surface-variant">
                      {entry.rank}
                    </span>
                    <Avatar
                      src={entry.profile.avatar_url}
                      name={entry.profile.full_name ?? entry.profile.username}
                      size="sm"
                      className={cn("h-10! w-10!", i < 3 && RANK_AVATAR_HIGHLIGHT[i])}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-on-surface">
                        @{entry.profile.username}
                      </p>
                      <p className="text-[11px] text-on-surface-variant">
                        {entry.score} pts · {formatCount(entry.week_views)} views ·{" "}
                        {entry.week_likes} likes
                      </p>
                    </div>
                    {primaryBadge && (
                      <BadgeChip badge={primaryBadge} size="sm" className="shrink-0 max-[400px]:hidden" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {profile && userEntry && (
        <p className="mt-6 rounded-2xl bg-primary-fixed/30 px-4 py-3 text-center text-sm font-semibold text-on-surface">
          You&apos;re #{userEntry.rank} in {mood === "overall" ? "overall" : mood} this week — keep
          creating!
        </p>
      )}
      {profile && !userEntry && entries.length > 0 && (
        <p className="mt-6 text-center text-sm text-on-surface-variant">
          Post more public collections to appear on the leaderboard.
        </p>
      )}
    </main>
  );
}
