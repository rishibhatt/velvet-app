import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  VELVET_TOOLBAR_CARD,
  VELVET_TOOLBAR_CARD_INNER,
} from "@/constants/velvet-toolbar";
import { VelvetStatMetric } from "@/components/molecules/VelvetStatMetric";

export interface VelvetActionStat {
  icon: LucideIcon;
  value: number | string;
  label: string;
}

interface VelvetActionStatsBarProps {
  actions: ReactNode;
  stats: VelvetActionStat[];
  className?: string;
}

/** Card bar — actions on the left, metric blocks on the right (mobile-first). */
export function VelvetActionStatsBar({
  actions,
  stats,
  className,
}: VelvetActionStatsBarProps) {
  if (stats.length === 0 && !actions) return null;

  return (
    <section className={cn(VELVET_TOOLBAR_CARD, className)}>
      <div
        className={cn(
          VELVET_TOOLBAR_CARD_INNER,
          "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6",
        )}
      >
        {actions ? (
          <div className="flex min-w-0 flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
            {actions}
          </div>
        ) : null}

        {stats.length > 0 ? (
          <div
            className={cn(
              "flex items-center justify-around gap-4 sm:gap-6",
              actions &&
                "border-t border-outline-variant/15 pt-4 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6",
            )}
          >
            {stats.map((stat) => (
              <VelvetStatMetric
                key={stat.label}
                icon={stat.icon}
                value={stat.value}
                label={stat.label}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
