"use client";

import { Bookmark, Clock, TrendingUp } from "lucide-react";
import type { PublicBoardSort } from "@/services/discover/discover.service";
import { cn } from "@/lib/utils";

interface DiscoverSortToggleProps {
  value: PublicBoardSort;
  onChange: (sort: PublicBoardSort) => void;
  className?: string;
  variant?: "default" | "explore";
}

const OPTIONS: {
  value: PublicBoardSort;
  label: string;
  hint: string;
  icon: typeof TrendingUp;
}[] = [
  { value: "trending", label: "Trending", hint: "Most liked", icon: TrendingUp },
  { value: "most_items", label: "Most saved", hint: "Most items", icon: Bookmark },
  { value: "new", label: "New", hint: "Recently published", icon: Clock },
];

export function DiscoverSortToggle({
  value,
  onChange,
  className,
  variant = "default",
}: DiscoverSortToggleProps) {
  const isExplore = variant === "explore";

  return (
    <div
      className={cn(
        "flex gap-2 overflow-x-auto hide-scrollbar sm:flex-wrap sm:overflow-visible",
        className,
      )}
      role="group"
      aria-label="Sort collections"
    >
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            title={opt.hint}
            className={cn(
              "inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all sm:min-h-0 sm:py-2",
              isExplore
                ? active
                  ? "border border-[#f0ccc4] bg-[#fde8e4] text-[#8f3d32] shadow-sm"
                  : "border border-outline-variant/35 bg-bg-elevated text-on-surface shadow-sm hover:border-primary/30 hover:bg-primary-fixed/30"
                : active
                  ? "velvet-nav-pill-active text-primary shadow-sm ring-1 ring-primary/10"
                  : "bg-bg-elevated text-on-surface-variant ring-1 ring-outline-variant/25 hover:text-on-surface",
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 shrink-0",
                isExplore && active && opt.value === "trending" && "text-[#c94c3a]",
                !isExplore && active && opt.value === "trending" && "text-error",
              )}
              strokeWidth={2.25}
            />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
