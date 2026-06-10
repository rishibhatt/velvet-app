"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Check, ChevronDown, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

export interface VelvetPillSelectOption<T extends string = string> {
  value: T;
  label: string;
  icon?: LucideIcon;
}

interface VelvetPillSelectProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: VelvetPillSelectOption<T>[];
  ariaLabel: string;
  icon?: LucideIcon;
  className?: string;
  triggerClassName?: string;
}

/** Themed pill dropdown — shared across explore, insights, and filters. */
export function VelvetPillSelect<T extends string = string>({
  value,
  onChange,
  options,
  ariaLabel,
  icon: TriggerIcon,
  className,
  triggerClassName,
}: VelvetPillSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selected = options.find((o) => o.value === value) ?? options[0];
  const DisplayIcon = TriggerIcon ?? selected?.icon ?? LayoutGrid;

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative min-w-0", className)}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full min-w-0 items-center gap-2 rounded-full border border-outline-variant/35 bg-bg-elevated py-2.5 pr-3 pl-3.5 text-sm font-semibold text-on-surface shadow-sm transition-colors",
          "hover:border-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/15",
          open && "border-primary/35 ring-2 ring-primary/10",
          triggerClassName,
        )}
      >
        <DisplayIcon className="h-4 w-4 shrink-0 text-on-surface-variant" strokeWidth={2.25} aria-hidden />
        <span className="min-w-0 flex-1 truncate text-left">{selected?.label}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-on-surface-variant transition-transform",
            open && "rotate-180",
          )}
          strokeWidth={2.25}
          aria-hidden
        />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={ariaLabel}
          className="absolute top-[calc(100%+0.35rem)] right-0 z-50 max-h-[min(16rem,50dvh)] min-w-full overflow-y-auto rounded-2xl border border-outline-variant/25 bg-bg-elevated p-1.5 shadow-[var(--shadow-hover)] custom-scrollbar"
        >
          {options.map((opt) => {
            const Icon = opt.icon;
            const active = opt.value === value;
            return (
              <li key={opt.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors",
                    active
                      ? "velvet-nav-pill-active text-primary"
                      : "text-on-surface hover:bg-surface-container-low",
                  )}
                >
                  {Icon && (
                    <Icon
                      className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-on-surface-variant")}
                      strokeWidth={2.25}
                      aria-hidden
                    />
                  )}
                  <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                  {active && <Check className="h-4 w-4 shrink-0 text-primary" strokeWidth={2.5} aria-hidden />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
