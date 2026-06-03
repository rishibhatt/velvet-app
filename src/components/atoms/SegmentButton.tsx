"use client";

import { cn } from "@/lib/utils";

interface SegmentOption {
  value: string;
  label: string;
}

interface SegmentButtonProps {
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SegmentButton({
  options,
  value,
  onChange,
  className,
}: SegmentButtonProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-wrap gap-1 rounded-2xl border-2 border-primary/20 bg-white p-1 sm:rounded-full sm:flex-nowrap",
        className,
      )}
      role="tablist"
    >
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(opt.value)}
            className={cn(
              "min-h-[44px] flex-1 rounded-xl px-3 py-2.5 text-xs font-bold transition-all duration-200 sm:rounded-full sm:text-sm",
              selected
                ? "bg-primary text-on-primary shadow-md"
                : "text-on-surface hover:bg-surface-container-low",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
