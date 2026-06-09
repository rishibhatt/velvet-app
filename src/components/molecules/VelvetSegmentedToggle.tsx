"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  VELVET_SEGMENTED_ACTIVE,
  VELVET_SEGMENTED_INACTIVE,
  VELVET_SEGMENTED_SHELL,
} from "@/constants/velvet-toolbar";

export interface VelvetSegmentOption<T extends string> {
  value: T;
  label: string;
  icon: LucideIcon;
}

interface VelvetSegmentedToggleProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: VelvetSegmentOption<T>[];
  ariaLabel: string;
  className?: string;
  /** Icon-only square cells (grid/list) vs pill with text */
  iconOnly?: boolean;
}

export function VelvetSegmentedToggle<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  className,
  iconOnly = true,
}: VelvetSegmentedToggleProps<T>) {
  return (
    <div
      className={cn(VELVET_SEGMENTED_SHELL, className)}
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            aria-label={opt.label}
            title={opt.label}
            onClick={() => onChange(opt.value)}
            className={cn(
              "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200",
              iconOnly
                ? "h-9 w-9 min-h-9 min-w-9"
                : "min-h-9 gap-1.5 rounded-lg px-3 py-2 text-xs sm:text-sm",
              active ? VELVET_SEGMENTED_ACTIVE : VELVET_SEGMENTED_INACTIVE,
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
            {!iconOnly ? <span>{opt.label}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
