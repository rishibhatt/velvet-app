"use client";

import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

export type ExploreViewMode = "grid" | "list";

interface ExploreViewToggleProps {
  value: ExploreViewMode;
  onChange: (mode: ExploreViewMode) => void;
  className?: string;
}

export function ExploreViewToggle({
  value,
  onChange,
  className,
}: ExploreViewToggleProps) {
  return (
    <div
      className={cn(
        "inline-flex rounded-full bg-surface-container-low p-1 ring-1 ring-outline-variant/20",
        className,
      )}
      role="group"
      aria-label="View mode"
    >
      <button
        type="button"
        aria-pressed={value === "grid"}
        onClick={() => onChange("grid")}
        className={cn(
          "inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition-colors sm:text-sm",
          value === "grid"
            ? "velvet-nav-pill-active text-primary shadow-sm"
            : "text-on-surface-variant hover:text-on-surface",
        )}
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="hidden sm:inline">Grid</span>
      </button>
      <button
        type="button"
        aria-pressed={value === "list"}
        onClick={() => onChange("list")}
        className={cn(
          "inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition-colors sm:text-sm",
          value === "list"
            ? "velvet-nav-pill-active text-primary shadow-sm"
            : "text-on-surface-variant hover:text-on-surface",
        )}
      >
        <List className="h-4 w-4" />
        <span className="hidden sm:inline">List</span>
      </button>
    </div>
  );
}
