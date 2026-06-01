"use client";

import { LayoutGrid, List } from "lucide-react";
import { MOODS } from "@/constants/moods";
import type { Mood } from "@/types/board.types";
import type { ExploreViewMode } from "@/components/molecules/ExploreViewToggle";
import { cn } from "@/lib/utils";

interface ExploreFiltersBarProps {
  mood: Mood | null;
  onMoodChange: (mood: Mood | null) => void;
  viewMode: ExploreViewMode;
  onViewModeChange: (mode: ExploreViewMode) => void;
  resultCount?: number;
  className?: string;
}

export function ExploreFiltersBar({
  mood,
  onMoodChange,
  viewMode,
  onViewModeChange,
  resultCount,
  className,
}: ExploreFiltersBarProps) {
  return (
    <div className={cn("mb-6 space-y-3 sm:mb-8", className)}>
      <div className="flex items-center justify-between gap-3">
        {resultCount !== undefined && (
          <p className="text-sm text-on-surface-variant">
            <span className="font-semibold text-on-surface">{resultCount}</span>{" "}
            collection{resultCount === 1 ? "" : "s"}
          </p>
        )}
        <div
          className="ml-auto inline-flex shrink-0 gap-1.5"
          role="group"
          aria-label="View mode"
        >
          <button
            type="button"
            aria-pressed={viewMode === "grid"}
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl border transition-all sm:h-11 sm:w-11",
              viewMode === "grid"
                ? "velvet-nav-pill-active border-transparent text-primary shadow-sm"
                : "border-outline-variant/35 bg-bg-elevated text-on-surface-variant hover:border-primary/25 hover:text-on-surface",
            )}
          >
            <LayoutGrid className="h-4 w-4" strokeWidth={2} />
          </button>
          <button
            type="button"
            aria-pressed={viewMode === "list"}
            onClick={() => onViewModeChange("list")}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl border transition-all sm:h-11 sm:w-11",
              viewMode === "list"
                ? "velvet-nav-pill-active border-transparent text-primary shadow-sm"
                : "border-outline-variant/35 bg-bg-elevated text-on-surface-variant hover:border-primary/25 hover:text-on-surface",
            )}
          >
            <List className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div
        className="flex gap-2 overflow-x-auto pb-0.5 hide-scrollbar"
        role="tablist"
        aria-label="Filter by mood"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mood === null}
          onClick={() => onMoodChange(null)}
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold transition-all",
            mood === null
              ? "bg-primary text-on-primary shadow-md hover:brightness-105"
              : "border border-outline-variant/35 bg-bg-elevated text-on-surface shadow-sm hover:border-primary/30 hover:bg-primary-fixed/25",
          )}
        >
          <LayoutGrid className="h-3.5 w-3.5" aria-hidden />
          All
        </button>
        {MOODS.map((m) => (
          <button
            key={m.value}
            type="button"
            role="tab"
            aria-selected={mood === m.value}
            onClick={() => onMoodChange(mood === m.value ? null : m.value)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all",
              mood === m.value
                ? "bg-primary text-on-primary shadow-md hover:brightness-105"
                : "border border-outline-variant/35 bg-bg-elevated text-on-surface shadow-sm hover:border-primary/30 hover:bg-primary-fixed/25",
            )}
          >
            <span aria-hidden>{m.emoji}</span>
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
