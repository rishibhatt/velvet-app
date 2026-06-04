"use client";

import { ChevronDown } from "lucide-react";
import { CUSTOM_MOOD_VALUE, MOODS, type MoodValue } from "@/constants/moods";
import { cn } from "@/lib/utils";

export type MoodSelection = MoodValue | typeof CUSTOM_MOOD_VALUE;

interface MoodSelectProps {
  value: MoodSelection;
  onChange: (value: MoodSelection) => void;
  id?: string;
  className?: string;
}

export function MoodSelect({ value, onChange, id = "collection-mood", className }: MoodSelectProps) {
  return (
    <div className={cn("relative", className)}>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as MoodSelection)}
        className="velvet-field w-full appearance-none rounded-xl py-2.5 pr-10 pl-3 text-sm font-medium"
        aria-label="Collection mood"
      >
        {MOODS.map((mood) => (
          <option key={mood.value} value={mood.value}>
            {mood.emoji} {mood.label}
          </option>
        ))}
        <option value={CUSTOM_MOOD_VALUE}>✏️ Custom mood</option>
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-on-surface-variant"
        aria-hidden
      />
    </div>
  );
}
