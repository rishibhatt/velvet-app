"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Eye, Heart, Layers, Repeat2 } from "lucide-react";
import { BadgeRow } from "@/components/creator/BadgeChip";
import { ROUTES } from "@/constants/routes";
import { useInsights } from "@/queries/insights/queries";
import { formatCount } from "@/utils/format";
import { getMoodDisplayLabel } from "@/constants/moods";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";
import type { InsightsPeriod } from "@/types/board.types";
import Link from "next/link";
import { VelvetImage } from "@/components/atoms/VelvetImage";
import { getItemPreviewImage } from "@/lib/item-preview";
import { VelvetPillSelect } from "@/components/atoms/VelvetPillSelect";

const InsightsCharts = dynamic(
  () => import("./InsightsCharts").then((m) => m.InsightsCharts),
  { ssr: false, loading: () => <div className="h-48 animate-pulse rounded-2xl bg-surface-container-low" /> },
);

const PERIODS: { value: InsightsPeriod; label: string }[] = [
  { value: "this_week", label: "This week" },
  { value: "last_week", label: "Last week" },
  { value: "last_30_days", label: "Last 30 days" },
];

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2 rounded-2xl border border-outline-variant/20 bg-bg-elevated px-4 py-4 shadow-sm sm:gap-3 sm:px-5 sm:py-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-fixed/80 text-primary sm:h-10 sm:w-10">
        {icon}
      </div>
      <div>
        <motion.p
          className="font-display text-2xl leading-none text-on-surface sm:text-3xl"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {value}
        </motion.p>
        <p className="mt-1 text-sm font-semibold text-on-surface">{label}</p>
        {sub && <p className="mt-0.5 text-xs leading-snug text-on-surface-variant">{sub}</p>}
      </div>
    </div>
  );
}

export function InsightsPageContent() {
  const [period, setPeriod] = useState<InsightsPeriod>("this_week");
  const { data, isLoading } = useInsights(period);

  useEffect(() => {
    if (data) {
      track(ANALYTICS_EVENTS.INSIGHTS_PAGE_VIEWED, {
        weekly_views: data.overview.weekly_views,
        has_leaderboard_rank: data.leaderboard_ranks.length > 0,
      });
    }
  }, [data]);

  if (isLoading || !data) {
    return (
      <main className="page-container py-stack-lg pb-28 md:py-12 md:pb-12">
        <h1 className="font-display mb-6 text-2xl text-on-surface">Creator Insights</h1>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-surface-container-low" />
          ))}
        </div>
      </main>
    );
  }

  const { overview } = data;
  const bestRank = [...data.leaderboard_ranks].sort((a, b) => a.rank - b.rank)[0];
  const topBoards = data.top_boards.filter(
    (b) => (b.view_count ?? 0) > 0 || (b.weekly_view_count ?? 0) > 0,
  );
  const hasViewActivity =
    overview.weekly_views > 0 ||
    overview.total_views > 0 ||
    data.views_by_day.some((d) => d.count > 0);

  const sections = (() => {
    const list: { key: string; node: ReactNode }[] = [];

    if (hasViewActivity) {
      list.push({
        key: "charts",
        node: (
          <InsightsCharts
            viewsByDay={data.views_by_day}
            viewsBySource={data.views_by_source}
            period={period}
          />
        ),
      });
    }

    if (topBoards.length > 0) {
      list.push({
        key: "top-boards",
        node: (
          <section className="mb-8">
            <h2 className="font-display mb-3 text-lg text-on-surface">Top performing collections</h2>
            <ul className="space-y-2">
              {topBoards.map((board) => (
                <li key={board.id}>
                  <Link
                    href={ROUTES.board(board.id)}
                    className="flex items-center gap-3 rounded-2xl border border-outline-variant/15 bg-bg-elevated p-3"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-container-low">
                      {board.cover_url && (
                        <VelvetImage src={board.cover_url} alt="" fill className="object-cover" sizes="64px" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-on-surface">{board.title}</p>
                      <p className="text-xs text-on-surface-variant">
                        {getMoodDisplayLabel(board.mood, board.mood_label)} ·{" "}
                        {formatCount(board.weekly_view_count ?? board.view_count ?? 0)} views
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ),
      });
    }

    if (data.top_items.length > 0) {
      list.push({
        key: "top-items",
        node: (
          <section className="mb-8">
            <h2 className="font-display mb-3 text-lg text-on-surface">Most saved by others</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {data.top_items.map((item) => {
                const preview = getItemPreviewImage(item);
                return (
                  <div key={item.id} className="min-w-0">
                    <div className="relative aspect-square overflow-hidden rounded-xl bg-surface-container-low">
                      {preview && (
                        <VelvetImage
                          src={preview}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="144px"
                        />
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs font-medium text-on-surface">{item.title}</p>
                    <p className="text-[11px] text-on-surface-variant">
                      Saved {item.resave_count ?? 0} times
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        ),
      });
    }

    if (bestRank) {
      list.push({
        key: "rank",
        node: (
          <section className="mb-8">
            <h2 className="font-display mb-3 text-lg text-on-surface">Your rank this week</h2>
            <p className="rounded-2xl bg-primary-fixed/25 px-4 py-3 text-sm font-semibold text-on-surface">
              You&apos;re #{bestRank.rank} in {bestRank.mood} this week
            </p>
          </section>
        ),
      });
    }

    if (data.badges.length > 0) {
      list.push({
        key: "badges",
        node: (
          <section className="mb-8">
            <h2 className="font-display mb-3 text-lg text-on-surface">Badges</h2>
            <BadgeRow badges={data.badges} />
          </section>
        ),
      });
    }

    return list;
  })();

  return (
    <main className="page-container py-stack-lg pb-28 md:py-12 md:pb-12">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl text-on-surface">Creator Insights</h1>
        <VelvetPillSelect
          value={period}
          onChange={setPeriod}
          options={PERIODS}
          ariaLabel="Time period"
          className="w-full sm:w-44"
        />
      </header>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Eye className="h-5 w-5" />}
          label="Views"
          value={formatCount(overview.weekly_views)}
          sub={`${formatCount(overview.total_views)} all time`}
        />
        <StatCard
          icon={<Repeat2 className="h-5 w-5" />}
          label="Re-saves"
          value={formatCount(overview.total_resaves)}
        />
        <StatCard
          icon={<Heart className="h-5 w-5" />}
          label="Likes"
          value={formatCount(overview.likes)}
        />
        <StatCard
          icon={<Layers className="h-5 w-5" />}
          label="Collections"
          value={String(overview.total_boards)}
          sub={`${overview.public_boards} public`}
        />
      </div>

      {sections.length > 0 ? (
        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.key}>{section.node}</div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-outline-variant/30 bg-surface-container-low/50 px-6 py-12 text-center">
          <p className="font-display text-lg text-on-surface">No activity yet this period</p>
          <p className="mt-2 text-sm text-on-surface-variant">
            Publish public collections and share them — views, re-saves, and rankings will show up here.
          </p>
          <Link
            href={ROUTES.explore}
            className="mt-5 inline-block text-sm font-bold text-primary hover:underline"
          >
            Explore the community
          </Link>
        </div>
      )}
    </main>
  );
}
