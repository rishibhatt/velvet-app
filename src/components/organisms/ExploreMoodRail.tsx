"use client";

import { LayoutGrid } from "lucide-react";
import { MOODS } from "@/constants/moods";
import type { Mood } from "@/types/board.types";
import { cn } from "@/lib/utils";

interface ExploreMoodRailProps {
  mood: Mood | null;
  onMoodChange: (mood: Mood | null) => void;
  className?: string;
  compact?: boolean;
}

/** Horizontal mood filter — compact emoji chips on mobile. */
export function ExploreMoodRail({
  mood,
  onMoodChange,
  className,
  compact = true,
}: ExploreMoodRailProps) {
  return (
    <div
      className={cn(
        "flex gap-1.5 overflow-x-auto hide-scrollbar snap-x snap-mandatory sm:gap-2",
        className,
      )}
      role="tablist"
      aria-label="Filter by mood"
    >
      <MoodChip
        label="All"
        selected={mood === null}
        onClick={() => onMoodChange(null)}
        compact={compact}
      >
        <LayoutGrid className="h-3.5 w-3.5 text-primary" strokeWidth={2} aria-hidden />
      </MoodChip>
      {MOODS.map((m) => (
        <MoodChip
          key={m.value}
          label={m.label}
          selected={mood === m.value}
          onClick={() => onMoodChange(mood === m.value ? null : m.value)}
          compact={compact}
        >
          <span className="text-sm leading-none" aria-hidden>
            {m.emoji}
          </span>
        </MoodChip>
      ))}
    </div>
  );
}

function MoodChip({
  label,
  selected,
  onClick,
  children,
  compact,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "flex shrink-0 snap-start items-center justify-center rounded-full border transition-all",
        compact ? "h-9 w-9 sm:h-10 sm:w-10" : "h-11 w-11",
        selected
          ? "border-primary bg-primary-fixed/55 shadow-sm"
          : "border-outline-variant/30 bg-bg-elevated hover:border-primary/35",
      )}
    >
      {children}
      <span className="sr-only">{label}</span>
    </button>
  );
}
