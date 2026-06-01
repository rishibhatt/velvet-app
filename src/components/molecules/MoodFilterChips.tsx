"use client";

import { MOODS } from "@/constants/moods";
import type { Mood } from "@/types/board.types";
import { cn } from "@/lib/utils";

interface MoodFilterChipsProps {
  value: Mood | null;
  onChange: (mood: Mood | null) => void;
  className?: string;
}

export function MoodFilterChips({
  value,
  onChange,
  className,
}: MoodFilterChipsProps) {
  return (
    <div
      className={cn(
        "-mx-margin-mobile flex gap-2 overflow-x-auto px-margin-mobile pb-1 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden",
        className,
      )}
      role="tablist"
      aria-label="Filter by mood"
    >
      <button
        type="button"
        role="tab"
        aria-selected={value === null}
        onClick={() => onChange(null)}
        className={cn(
          "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
          value === null
            ? "bg-primary text-on-primary shadow-sm"
            : "bg-surface-container-low text-on-surface ring-1 ring-outline-variant/25",
        )}
      >
        All
      </button>
      {MOODS.map((mood) => (
        <button
          key={mood.value}
          type="button"
          role="tab"
          aria-selected={value === mood.value}
          onClick={() => onChange(value === mood.value ? null : mood.value)}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors",
            value === mood.value
              ? "bg-primary text-on-primary shadow-sm"
              : "bg-surface-container-low text-on-surface ring-1 ring-outline-variant/25",
          )}
        >
          {mood.emoji} {mood.label}
        </button>
      ))}
    </div>
  );
}
