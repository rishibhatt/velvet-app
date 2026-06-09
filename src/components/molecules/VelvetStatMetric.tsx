import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCount } from "@/utils/format";

interface VelvetStatMetricProps {
  icon: LucideIcon;
  value: number | string;
  label: string;
  /** Tighter layout for filter bars */
  compact?: boolean;
  className?: string;
}

export function VelvetStatMetric({
  icon: Icon,
  value,
  label,
  compact = false,
  className,
}: VelvetStatMetricProps) {
  const display = typeof value === "number" ? formatCount(value) : value;

  return (
    <div
      className={cn(
        "flex flex-col items-center text-center",
        compact ? "min-w-[3.25rem] gap-0" : "min-w-[4.25rem] gap-0.5",
        className,
      )}
    >
      <div className="flex items-center gap-1.5">
        <Icon
          className={cn(
            "shrink-0 text-primary",
            compact ? "h-3.5 w-3.5" : "h-4 w-4",
          )}
          strokeWidth={2}
          aria-hidden
        />
        <span
          className={cn(
            "font-display font-semibold tabular-nums text-primary",
            compact ? "text-base leading-none" : "text-xl leading-none sm:text-2xl",
          )}
        >
          {display}
        </span>
      </div>
      <span
        className={cn(
          "font-medium text-on-surface-variant",
          compact ? "text-[10px] leading-tight" : "text-[11px] leading-tight sm:text-xs",
        )}
      >
        {label}
      </span>
    </div>
  );
}
