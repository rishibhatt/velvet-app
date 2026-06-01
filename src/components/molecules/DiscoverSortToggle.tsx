"use client";

import type { PublicBoardSort } from "@/services/discover/discover.service";
import { cn } from "@/lib/utils";

interface DiscoverSortToggleProps {
  value: PublicBoardSort;
  onChange: (sort: PublicBoardSort) => void;
}

const OPTIONS: { value: PublicBoardSort; label: string; hint: string }[] = [
  { value: "trending", label: "Trending", hint: "Most liked" },
  { value: "most_items", label: "Most saved", hint: "Most items" },
  { value: "new", label: "New", hint: "Recently published" },
];

export function DiscoverSortToggle({ value, onChange }: DiscoverSortToggleProps) {
  return (
    <div
      className="flex w-full flex-wrap gap-2 sm:inline-flex sm:w-auto sm:flex-nowrap sm:rounded-full sm:bg-surface-container-low sm:p-1 sm:ring-1 sm:ring-outline-variant/20"
      role="group"
      aria-label="Sort collections"
    >
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          title={opt.hint}
          className={cn(
            "min-h-[44px] flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors sm:min-h-0 sm:flex-none sm:py-2",
            value === opt.value
              ? "velvet-nav-pill-active text-primary shadow-sm"
              : "bg-surface-container-low text-on-surface-variant ring-1 ring-outline-variant/20 sm:bg-transparent sm:ring-0",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
