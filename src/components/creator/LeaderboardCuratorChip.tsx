"use client";

import Link from "next/link";
import { Avatar } from "@/components/atoms/Avatar";
import { ROUTES } from "@/constants/routes";
import { formatCount } from "@/utils/format";
import type { LeaderboardEntry } from "@/types/board.types";
import { cn } from "@/lib/utils";

const RANK_BADGE = [
  "bg-amber-400 text-amber-950 shadow-amber-200/60",
  "bg-slate-300 text-slate-800 shadow-slate-200/60",
  "bg-amber-700 text-white shadow-amber-900/30",
  "bg-surface-container-high text-on-surface-variant",
  "bg-surface-container-high text-on-surface-variant",
];

/** Box-shadow rings avoid clipping inside overflow scroll containers */
const RANK_AVATAR_HIGHLIGHT = [
  "shadow-[0_0_0_2px_#fbbf24,0_0_0_4px_rgba(251,191,36,0.25)]",
  "shadow-[0_0_0_2px_#cbd5e1,0_0_0_4px_rgba(203,213,225,0.35)]",
  "shadow-[0_0_0_2px_#b45309,0_0_0_4px_rgba(180,83,9,0.25)]",
];

interface LeaderboardCuratorChipProps {
  entry: LeaderboardEntry;
  index: number;
  size?: "sm" | "md";
}

export function LeaderboardCuratorChip({
  entry,
  index,
  size = "md",
}: LeaderboardCuratorChipProps) {
  const isTopThree = index < 3;
  const avatarSize = size === "sm" ? "h-12! w-12!" : "h-16! w-16! sm:h-[4.5rem]! sm:w-[4.5rem]!";

  return (
    <Link
      href={ROUTES.creator(entry.profile.username)}
      className="group flex w-[5.5rem] shrink-0 snap-start flex-col items-center pt-1 sm:w-24"
    >
      <div className="relative mb-2 px-0.5 pt-0.5">
        <Avatar
          src={entry.profile.avatar_url}
          name={entry.profile.full_name ?? entry.profile.username}
          size="lg"
          className={cn(avatarSize, isTopThree && RANK_AVATAR_HIGHLIGHT[index])}
        />
        <span
          className={cn(
            "absolute -bottom-0.5 -left-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shadow-sm sm:h-6 sm:w-6 sm:text-xs",
            RANK_BADGE[index] ?? RANK_BADGE[3],
          )}
        >
          {entry.rank}
        </span>
      </div>
      <p className="w-full truncate text-center text-[11px] font-semibold text-on-surface group-hover:text-primary sm:text-xs">
        @{entry.profile.username}
      </p>
      <p className="mt-0.5 text-center text-[10px] text-on-surface-variant sm:text-[11px]">
        {formatCount(entry.week_views)} views
      </p>
    </Link>
  );
}
