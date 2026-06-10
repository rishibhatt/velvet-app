"use client";

import type { Mood } from "@/types/board.types";
import { ExploreMoodRail } from "@/components/organisms/ExploreMoodRail";
import { VELVET_TOOLBAR_CARD } from "@/constants/velvet-toolbar";
import { cn } from "@/lib/utils";

interface ExploreFiltersBarProps {
  mood: Mood | null;
  onMoodChange: (mood: Mood | null) => void;
  className?: string;
}

/** Sticky mood category rail for the explore page. */
export function ExploreFiltersBar({
  mood,
  onMoodChange,
  className,
}: ExploreFiltersBarProps) {
  return (
    <div
      className={cn(
        "sticky top-14 z-30 -mx-4 mb-4 px-4 sm:top-16 md:-mx-0 md:px-0",
        className,
      )}
    >
      <div
        className={cn(
          VELVET_TOOLBAR_CARD,
          "bg-bg-elevated/95 shadow-[var(--shadow-card)] backdrop-blur-md",
        )}
      >
        <div className="px-3 py-3 sm:px-5 sm:py-4">
          <ExploreMoodRail mood={mood} onMoodChange={onMoodChange} />
        </div>
      </div>
    </div>
  );
}
