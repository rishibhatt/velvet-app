"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface VelvetInputShellProps {
  children: ReactNode;
  prefix?: ReactNode;
  className?: string;
}

const inputReset =
  "[&_input]:min-w-0 [&_input]:flex-1 [&_input]:border-0 [&_input]:bg-transparent [&_input]:p-0 [&_input]:text-on-surface [&_input]:shadow-none [&_input]:outline-none [&_input]:ring-0 [&_input]:appearance-none [&_input]:placeholder:text-outline/70 [&_input:focus]:border-0 [&_input:focus]:shadow-none [&_input:focus]:outline-none [&_input:focus]:ring-0 [&_input:focus-visible]:border-0 [&_input:focus-visible]:shadow-none [&_input:focus-visible]:outline-none [&_input:focus-visible]:ring-0";

const textareaReset =
  "[&_textarea]:min-w-0 [&_textarea]:flex-1 [&_textarea]:border-0 [&_textarea]:bg-transparent [&_textarea]:p-0 [&_textarea]:text-on-surface [&_textarea]:shadow-none [&_textarea]:outline-none [&_textarea]:ring-0 [&_textarea]:appearance-none [&_textarea:focus]:border-0 [&_textarea]:shadow-none [&_textarea]:outline-none [&_textarea]:ring-0";

/** Matches velvet-field — border on shell only; inner inputs never show a focus ring. */
export function VelvetInputShell({
  children,
  prefix,
  className,
}: VelvetInputShellProps) {
  return (
    <div
      className={cn(
        "velvet-input-shell flex items-center gap-2 rounded-2xl border border-outline-variant/55 bg-surface-container-high px-4 py-3 outline-none transition-[border-color,background-color,box-shadow] duration-200",
        "focus-within:border-outline-variant/80 focus-within:bg-bg-elevated focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--outline-variant)_18%,transparent)]",
        inputReset,
        textareaReset,
        className,
      )}
    >
      {prefix}
      {children}
    </div>
  );
}
