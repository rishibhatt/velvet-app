"use client";

import { LayoutGrid } from "lucide-react";
import { MOODS } from "@/constants/moods";
import type { Mood } from "@/types/board.types";
import { cn } from "@/lib/utils";

interface ExploreMoodRailProps {
  mood: Mood | null;
  onMoodChange: (mood: Mood | null) => void;
  className?: string;
}

/** Instagram-style circular category rail — scroll horizontally on mobile. */
export function ExploreMoodRail({ mood, onMoodChange, className }: ExploreMoodRailProps) {
  return (
    <div
      className={cn(
        "flex gap-3 overflow-x-auto pb-1 hide-scrollbar snap-x snap-mandatory",
        className,
      )}
      role="tablist"
      aria-label="Filter by mood"
    >
      <MoodOrb
        label="All"
        selected={mood === null}
        onClick={() => onMoodChange(null)}
      >
        <LayoutGrid className="h-5 w-5 text-primary" strokeWidth={2} aria-hidden />
      </MoodOrb>
      {MOODS.map((m) => (
        <MoodOrb
          key={m.value}
          label={m.label}
          selected={mood === m.value}
          onClick={() => onMoodChange(mood === m.value ? null : m.value)}
        >
          <span className="text-xl leading-none" aria-hidden>
            {m.emoji}
          </span>
        </MoodOrb>
      ))}
    </div>
  );
}

function MoodOrb({
  label,
  selected,
  onClick,
  children,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onClick}
      className="flex w-[4.25rem] shrink-0 snap-start flex-col items-center gap-1.5 sm:w-[4.75rem]"
    >
      <span
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full border-2 bg-bg-elevated shadow-sm transition-all sm:h-[3.75rem] sm:w-[3.75rem]",
          selected
            ? "border-primary bg-primary-fixed/50 ring-2 ring-primary/25"
            : "border-outline-variant/30 hover:border-primary/35 hover:bg-primary-fixed/25",
        )}
      >
        {children}
      </span>
      <span
        className={cn(
          "max-w-full truncate text-center text-[10px] font-semibold sm:text-[11px]",
          selected ? "text-primary" : "text-on-surface-variant",
        )}
      >
        {label}
      </span>
    </button>
  );
}
