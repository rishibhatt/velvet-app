"use client";

import { LayoutGrid, List } from "lucide-react";
import type { PublicBoardSort } from "@/services/discover/discover.service";
import type { ExploreViewMode } from "@/components/molecules/ExploreViewToggle";
import type { Mood } from "@/types/board.types";
import { MOODS } from "@/constants/moods";
import { EXPLORE_SORT_OPTIONS } from "@/constants/explore-sort";
import { VelvetPillSelect } from "@/components/atoms/VelvetPillSelect";
import { VELVET_TOOLBAR_CARD } from "@/constants/velvet-toolbar";
import { cn } from "@/lib/utils";

const MOOD_OPTIONS = [
  { value: "all" as const, label: "All moods", icon: LayoutGrid },
  ...MOODS.map((m) => ({ value: m.value, label: m.label, icon: m.Icon })),
];

const VIEW_OPTIONS: { value: ExploreViewMode; label: string; icon: typeof LayoutGrid }[] = [
  { value: "grid", label: "Grid", icon: LayoutGrid },
  { value: "list", label: "List", icon: List },
];

interface ExploreCollectionsToolbarProps {
  sort: PublicBoardSort;
  onSortChange: (sort: PublicBoardSort) => void;
  mood: Mood | null;
  onMoodChange: (mood: Mood | null) => void;
  viewMode: ExploreViewMode;
  onViewModeChange: (mode: ExploreViewMode) => void;
  className?: string;
}

export function ExploreCollectionsToolbar({
  sort,
  onSortChange,
  mood,
  onMoodChange,
  viewMode,
  onViewModeChange,
  className,
}: ExploreCollectionsToolbarProps) {
  const moodValue = mood ?? "all";
  const sortValue = EXPLORE_SORT_OPTIONS.some((o) => o.value === sort)
    ? sort
    : "trending";

  return (
    <div
      className={cn(
        "sticky top-14 z-30 -mx-4 mb-5 px-4 pb-1 sm:top-16 sm:mx-0 sm:px-0",
        className,
      )}
    >
      <div
        className={cn(
          VELVET_TOOLBAR_CARD,
          "border-outline-variant/20 bg-bg-elevated/95 px-3 py-3 shadow-[var(--shadow-card)] backdrop-blur-md sm:px-5 sm:py-3.5",
        )}
      >
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <VelvetPillSelect
            value={sortValue}
            onChange={onSortChange}
            options={EXPLORE_SORT_OPTIONS}
            ariaLabel="Sort collections"
            className="w-full min-w-0 sm:w-auto sm:min-w-[10.5rem]"
          />

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end sm:gap-2.5">
            <VelvetPillSelect
              value={moodValue}
              onChange={(v) => onMoodChange(v === "all" ? null : (v as Mood))}
              options={MOOD_OPTIONS}
              ariaLabel="Filter by mood"
              className="min-w-0"
            />
            <VelvetPillSelect
              value={viewMode}
              onChange={onViewModeChange}
              options={VIEW_OPTIONS}
              ariaLabel="View mode"
              className="min-w-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
