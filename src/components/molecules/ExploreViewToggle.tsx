"use client";

import { VelvetViewModeToggle } from "@/components/molecules/VelvetViewModeToggle";

export type ExploreViewMode = "grid" | "list";

interface ExploreViewToggleProps {
  value: ExploreViewMode;
  onChange: (mode: ExploreViewMode) => void;
  className?: string;
}

/** @deprecated Prefer VelvetViewModeToggle — kept for existing imports */
export function ExploreViewToggle({ value, onChange, className }: ExploreViewToggleProps) {
  return <VelvetViewModeToggle value={value} onChange={onChange} className={className} />;
}
