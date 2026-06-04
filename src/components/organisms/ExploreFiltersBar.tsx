"use client";

import { LayoutGrid, List } from "lucide-react";
import type { Mood } from "@/types/board.types";
import type { ExploreViewMode } from "@/components/molecules/ExploreViewToggle";
import { ExploreMoodRail } from "@/components/organisms/ExploreMoodRail";
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
    <div
      className={cn(
        "sticky top-14 z-30 -mx-margin-mobile mb-5 border-b border-outline-variant/15 bg-background/95 px-margin-mobile py-3 backdrop-blur-md sm:top-16 sm:mb-6 md:static md:mx-0 md:border-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        {resultCount !== undefined ? (
          <p className="text-sm text-on-surface-variant">
            <span className="font-semibold text-on-surface">{resultCount}</span>{" "}
            {resultCount === 1 ? "collection" : "collections"}
          </p>
        ) : (
          <span className="text-sm font-semibold text-on-surface">Discover</span>
        )}
        <div
          className="ml-auto inline-flex shrink-0 gap-1.5"
          role="group"
          aria-label="View mode"
        >
          <ViewModeButton
            active={viewMode === "grid"}
            label="Grid view"
            onClick={() => onViewModeChange("grid")}
          >
            <LayoutGrid className="h-4 w-4" strokeWidth={2} />
          </ViewModeButton>
          <ViewModeButton
            active={viewMode === "list"}
            label="List view"
            onClick={() => onViewModeChange("list")}
          >
            <List className="h-4 w-4" strokeWidth={2} />
          </ViewModeButton>
        </div>
      </div>

      <ExploreMoodRail mood={mood} onMoodChange={onMoodChange} />
    </div>
  );
}

function ViewModeButton({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-xl border transition-all sm:h-10 sm:w-10",
        active
          ? "velvet-nav-pill-active border-transparent text-primary shadow-sm"
          : "border-outline-variant/35 bg-bg-elevated text-on-surface-variant hover:border-primary/25 hover:text-on-surface",
      )}
    >
      {children}
    </button>
  );
}
