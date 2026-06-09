"use client";

import { Layers } from "lucide-react";
import type { Mood } from "@/types/board.types";
import type { ExploreViewMode } from "@/components/molecules/ExploreViewToggle";
import { ExploreMoodRail } from "@/components/organisms/ExploreMoodRail";
import { VelvetStatMetric } from "@/components/molecules/VelvetStatMetric";
import { VelvetViewModeToggle } from "@/components/molecules/VelvetViewModeToggle";
import {
  VELVET_TOOLBAR_CARD,
  VELVET_TOOLBAR_CARD_INNER,
} from "@/constants/velvet-toolbar";
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
        "sticky top-14 z-30 -mx-margin-mobile mb-3 sm:top-16 md:static md:mx-0 md:mb-5",
        className,
      )}
    >
      <div className={cn(VELVET_TOOLBAR_CARD, "bg-background/95 backdrop-blur-md md:bg-bg-elevated md:backdrop-blur-none")}>
        <div
          className={cn(
            VELVET_TOOLBAR_CARD_INNER,
            "flex items-center gap-3 py-2.5 sm:gap-4 sm:py-3",
          )}
        >
          <ExploreMoodRail
            mood={mood}
            onMoodChange={onMoodChange}
            className="min-w-0 flex-1"
          />

          <div className="flex shrink-0 items-center gap-3 border-l border-outline-variant/20 pl-3 sm:gap-4 sm:pl-4">
            {resultCount !== undefined ? (
              <VelvetStatMetric
                compact
                icon={Layers}
                value={resultCount}
                label="Collections"
              />
            ) : null}
            <VelvetViewModeToggle value={viewMode} onChange={onViewModeChange} />
          </div>
        </div>
      </div>
    </div>
  );
}
