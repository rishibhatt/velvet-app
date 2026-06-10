"use client";

import { Flame, Heart, LayoutGrid, Plus } from "lucide-react";
import type { PublicBoardSort } from "@/services/discover/discover.service";
import { VelvetFilterPill } from "@/components/atoms/VelvetFilterPill";
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
  icon: typeof Flame;
}[] = [
  { value: "trending", label: "Trending", hint: "Trending this week", icon: Flame },
  { value: "new", label: "New", hint: "Recently published", icon: Plus },
  { value: "most_items", label: "Most Items", hint: "Most saves", icon: LayoutGrid },
  { value: "most_liked", label: "Most Liked", hint: "Most likes", icon: Heart },
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
        "flex gap-1 overflow-x-auto hide-scrollbar sm:gap-2 sm:overflow-visible",
        className,
      )}
      role="group"
      aria-label="Sort collections"
    >
      {OPTIONS.map((opt) => {
        const active = value === opt.value;
        if (isExplore) {
          return (
            <VelvetFilterPill
              key={opt.value}
              label={opt.label}
              icon={opt.icon}
              active={active}
              title={opt.hint}
              onClick={() => onChange(opt.value)}
            />
          );
        }
        return (
          <VelvetFilterPill
            key={opt.value}
            label={opt.label}
            icon={opt.icon}
            active={active}
            title={opt.hint}
            onClick={() => onChange(opt.value)}
            className={
              active
                ? undefined
                : "ring-1 ring-outline-variant/25 bg-bg-elevated hover:bg-surface-container-low"
            }
          />
        );
      })}
    </div>
  );
}
