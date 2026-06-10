"use client";

import { useState } from "react";
import type { BadgeType, CreatorBadge } from "@/types/board.types";
import { getMoodLabel } from "@/constants/moods";
import { cn } from "@/lib/utils";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";

const BADGE_CONFIG: Record<
  BadgeType,
  { label: string; icon: string; className: string; criteria: string }
> = {
  verified_creator: {
    label: "Verified Creator",
    icon: "✓",
    className: "bg-teal-100 text-teal-800 border-teal-200",
    criteria: "5+ public collections with 50+ total views",
  },
  trending: {
    label: "Trending",
    icon: "🔥",
    className: "bg-amber-100 text-amber-900 border-amber-200",
    criteria: "Top 3 trending this week in a category",
  },
  top_curator: {
    label: "Top Curator",
    icon: "🏆",
    className: "bg-purple-100 text-purple-900 border-purple-200",
    criteria: "#1 on the weekly leaderboard",
  },
  rising_star: {
    label: "Rising Star",
    icon: "⚡",
    className: "bg-blue-100 text-blue-900 border-blue-200",
    criteria: "Fastest trending growth this week",
  },
  velvet_pick: {
    label: "Velvet Pick",
    icon: "💜",
    className: "bg-primary-fixed text-primary border-primary/30",
    criteria: "Hand-picked by the Velvet team",
  },
};

const BADGE_PRIORITY: BadgeType[] = [
  "velvet_pick",
  "top_curator",
  "trending",
  "verified_creator",
  "rising_star",
];

export function pickPrimaryBadge(badges: CreatorBadge[]): CreatorBadge | null {
  for (const type of BADGE_PRIORITY) {
    const found = badges.find((b) => b.badge_type === type);
    if (found) return found;
  }
  return badges[0] ?? null;
}

export function BadgeChip({
  badge,
  size = "md",
  className,
}: {
  badge: CreatorBadge;
  size?: "sm" | "md";
  className?: string;
}) {
  const config = BADGE_CONFIG[badge.badge_type];
  const moodLabel = badge.mood ? getMoodLabel(badge.mood as never) : null;
  const label =
    badge.badge_type === "top_curator" && moodLabel
      ? `Top ${moodLabel} Curator`
      : config.label;

  return (
    <button
      type="button"
      title={`${label}: ${config.criteria}`}
      onClick={() =>
        track(ANALYTICS_EVENTS.BADGE_TAPPED, { badge_type: badge.badge_type })
      }
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-semibold",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        config.className,
        className,
      )}
    >
      <span aria-hidden>{config.icon}</span>
      {label}
    </button>
  );
}

export function BadgeRow({ badges }: { badges: CreatorBadge[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? badges : badges.slice(0, 3);
  if (!badges.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visible.map((b) => (
        <BadgeChip key={b.id} badge={b} size="sm" />
      ))}
      {badges.length > 3 && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-xs font-semibold text-primary"
        >
          + {badges.length - 3} more
        </button>
      )}
    </div>
  );
}
