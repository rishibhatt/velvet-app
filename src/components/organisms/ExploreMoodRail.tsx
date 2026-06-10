"use client";

import type { Mood } from "@/types/board.types";
import { MoodCategoryRail } from "@/components/organisms/MoodCategoryRail";

interface ExploreMoodRailProps {
  mood: Mood | null;
  onMoodChange: (mood: Mood | null) => void;
  className?: string;
}

/** @deprecated Use MoodCategoryRail — kept for backwards compatibility */
export function ExploreMoodRail({ mood, onMoodChange, className }: ExploreMoodRailProps) {
  return (
    <MoodCategoryRail
      value={mood}
      onChange={(v) => onMoodChange(v as Mood | null)}
      className={className}
    />
  );
}
