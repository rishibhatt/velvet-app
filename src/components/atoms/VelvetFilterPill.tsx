"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface VelvetFilterPillProps {
  label: string;
  active?: boolean;
  onClick: () => void;
  icon?: LucideIcon;
  title?: string;
  className?: string;
}

/** Sort / filter toggle pill — gradient fill when active (explore toolbar). */
export function VelvetFilterPill({
  label,
  active = false,
  onClick,
  icon: Icon,
  title,
  className,
}: VelvetFilterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title ?? label}
      className={cn(
        "inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition-all sm:min-h-0 sm:px-4 sm:py-2",
        active
          ? "velvet-nav-pill-active text-primary shadow-sm"
          : "bg-transparent text-on-surface-variant hover:text-on-surface",
        className,
      )}
    >
      {Icon && (
        <Icon
          className={cn("h-4 w-4 shrink-0", active && "text-primary")}
          strokeWidth={2.25}
          aria-hidden
        />
      )}
      <span>{label}</span>
    </button>
  );
}
