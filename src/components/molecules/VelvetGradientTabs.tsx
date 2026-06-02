"use client";

import { cn } from "@/lib/utils";

export interface VelvetTabOption<T extends string> {
  id: T;
  label: string;
}

interface VelvetGradientTabsProps<T extends string> {
  tabs: VelvetTabOption<T>[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
  "aria-label"?: string;
}

/** Theme gradient active state — reuse on Search, Profile, etc. */
export function VelvetGradientTabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
  "aria-label": ariaLabel,
}: VelvetGradientTabsProps<T>) {
  return (
    <div
      className={cn(
        "flex gap-1 overflow-x-auto rounded-2xl bg-surface-container-low p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
      role="tablist"
      aria-label={ariaLabel}
    >
      {tabs.map((tab) => {
        const active = value === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={cn(
              "min-h-[44px] flex-1 shrink-0 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
              active
                ? "velvet-tab-gradient-active text-primary shadow-sm"
                : "text-on-surface-variant hover:bg-bg-elevated/60 hover:text-on-surface",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
