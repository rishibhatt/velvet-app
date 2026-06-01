"use client";

import {
  Bookmark,
  FolderOpen,
  Heart,
  Users,
  type LucideIcon,
} from "lucide-react";
import { formatCount } from "@/utils/format";
import { cn } from "@/lib/utils";

interface StatItem {
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
}

interface ProfileStatsGridProps {
  boardsCount: number;
  itemsCount: number;
  collaboratorsCount: number;
  likesReceived: number;
  className?: string;
}

export function ProfileStatsGrid({
  boardsCount,
  itemsCount,
  collaboratorsCount,
  likesReceived,
  className,
}: ProfileStatsGridProps) {
  const stats: StatItem[] = [
    {
      label: "Boards",
      value: boardsCount,
      hint: "Collections created",
      icon: FolderOpen,
    },
    {
      label: "Items saved",
      value: itemsCount,
      hint: "Across all boards",
      icon: Bookmark,
    },
    {
      label: "Collaborators",
      value: collaboratorsCount,
      hint: "People you work with",
      icon: Users,
    },
    {
      label: "Likes received",
      value: likesReceived,
      hint: "On your collections",
      icon: Heart,
    },
  ];

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4",
        className,
      )}
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col gap-3 rounded-2xl border border-outline-variant/20 bg-bg-elevated px-4 py-4 shadow-sm sm:px-5 sm:py-5"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-fixed/80 text-primary sm:h-11 sm:w-11">
            <stat.icon className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <p className="font-display text-2xl leading-none text-on-surface sm:text-3xl">
              {formatCount(stat.value)}
            </p>
            <p className="mt-1 text-sm font-semibold text-on-surface">
              {stat.label}
            </p>
            <p className="mt-0.5 text-xs leading-snug text-on-surface-variant sm:text-sm">
              {stat.hint}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
