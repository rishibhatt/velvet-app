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
        "sticky top-14 z-30 -mx-margin-mobile mb-3 border-b border-outline-variant/10 bg-background/90 px-margin-mobile py-2 backdrop-blur-md sm:top-16 md:static md:mx-0 md:mb-5 md:border-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <ExploreMoodRail
          mood={mood}
          onMoodChange={onMoodChange}
          className="min-w-0 flex-1"
        />
        <div className="flex shrink-0 items-center gap-1.5 border-l border-outline-variant/20 pl-2">
          {resultCount !== undefined && (
            <span className="hidden text-[11px] font-medium text-on-surface-variant sm:inline">
              {resultCount}
            </span>
          )}
          <div className="inline-flex gap-0.5" role="group" aria-label="View mode">
            <ViewModeButton
              active={viewMode === "grid"}
              label="Grid view"
              onClick={() => onViewModeChange("grid")}
            >
              <LayoutGrid className="h-3.5 w-3.5" strokeWidth={2} />
            </ViewModeButton>
            <ViewModeButton
              active={viewMode === "list"}
              label="List view"
              onClick={() => onViewModeChange("list")}
            >
              <List className="h-3.5 w-3.5" strokeWidth={2} />
            </ViewModeButton>
          </div>
        </div>
      </div>
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
        "flex h-8 w-8 items-center justify-center rounded-lg border transition-all",
        active
          ? "velvet-nav-pill-active border-transparent text-primary"
          : "border-transparent text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface",
      )}
    >
      {children}
    </button>
  );
}
