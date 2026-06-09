"use client";

import { LayoutGrid, List } from "lucide-react";
import { VelvetSegmentedToggle } from "@/components/molecules/VelvetSegmentedToggle";
import type { ExploreViewMode } from "@/components/molecules/ExploreViewToggle";

const VIEW_OPTIONS = [
  { value: "grid" as const, label: "Grid view", icon: LayoutGrid },
  { value: "list" as const, label: "List view", icon: List },
];

interface VelvetViewModeToggleProps {
  value: ExploreViewMode;
  onChange: (mode: ExploreViewMode) => void;
  className?: string;
}

export function VelvetViewModeToggle({
  value,
  onChange,
  className,
}: VelvetViewModeToggleProps) {
  return (
    <VelvetSegmentedToggle
      value={value}
      onChange={onChange}
      options={VIEW_OPTIONS}
      ariaLabel="View mode"
      className={className}
    />
  );
}
