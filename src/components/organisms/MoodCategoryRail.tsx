"use client";

import { ChevronRight, LayoutGrid } from "lucide-react";
import { MOODS } from "@/constants/moods";
import type { Mood } from "@/types/board.types";
import { cn } from "@/lib/utils";

type MoodRailValue = Mood | null | "overall";

interface MoodCategoryRailProps {
  /** `null` or `"overall"` = all categories */
  value: MoodRailValue;
  onChange: (value: MoodRailValue) => void;
  /** Label for the “all” chip */
  allLabel?: "All" | "Overall";
  /** Value emitted when the all chip is selected */
  allValue?: null | "overall";
  className?: string;
}

/** Horizontal mood icon rail — explore filters, leaderboard, category pages. */
export function MoodCategoryRail({
  value,
  onChange,
  allLabel = "All",
  allValue = null,
  className,
}: MoodCategoryRailProps) {
  const allSelected = value === allValue || (allValue === null && value === null);

  return (
    <div className={cn("relative min-w-0 pr-6", className)}>
      <div
        className="flex gap-3 overflow-x-auto overflow-y-visible hide-scrollbar snap-x snap-mandatory py-1.5 sm:gap-3.5"
        role="tablist"
        aria-label="Filter by mood"
      >
        <MoodChip
          label={allLabel}
          selected={allSelected}
          onClick={() => onChange(allValue)}
          chipClass="bg-primary-fixed/70 text-primary"
          chipSelectedClass="bg-primary-fixed text-primary shadow-[0_0_0_2px_color-mix(in_srgb,var(--primary)_45%,transparent)]"
        >
          <LayoutGrid className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={2.25} aria-hidden />
        </MoodChip>
        {MOODS.map((m) => {
          const Icon = m.Icon;
          return (
            <MoodChip
              key={m.value}
              label={m.label}
              selected={value === m.value}
              onClick={() => onChange(value === m.value ? allValue : m.value)}
              chipClass={m.chipClass}
              chipSelectedClass={cn(
                m.chipSelectedClass,
                "shadow-[0_0_0_2px_color-mix(in_srgb,var(--primary)_35%,transparent)]",
              )}
            >
              <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={2.25} aria-hidden />
            </MoodChip>
          );
        })}
      </div>
      <div
        className="pointer-events-none absolute top-0 right-0 flex h-full w-6 items-center justify-end bg-gradient-to-l from-bg-elevated via-bg-elevated/95 to-transparent"
        aria-hidden
      >
        <ChevronRight className="h-4 w-4 text-on-surface-variant/50" />
      </div>
    </div>
  );
}

function MoodChip({
  label,
  selected,
  onClick,
  children,
  chipClass,
  chipSelectedClass,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  chipClass: string;
  chipSelectedClass: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      aria-label={label}
      onClick={onClick}
      className="group flex w-[3.75rem] shrink-0 snap-start flex-col items-center gap-1.5 sm:w-[4.25rem]"
    >
      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full border border-transparent transition-all sm:h-11 sm:w-11",
          selected ? cn("shadow-md", chipSelectedClass) : cn("hover:scale-105 hover:shadow-sm", chipClass),
        )}
      >
        {children}
      </span>
      <span
        className={cn(
          "w-full truncate text-center text-[10px] font-semibold sm:text-[11px]",
          selected ? "text-primary" : "text-on-surface-variant",
        )}
      >
        {label}
      </span>
    </button>
  );
}
