"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ProfileActionGroupProps {
  children: ReactNode;
  className?: string;
}

export function ProfileActionGroup({ children, className }: ProfileActionGroupProps) {
  return (
    <div
      className={cn(
        "inline-flex flex-wrap items-stretch justify-center gap-0.5 rounded-2xl border border-outline-variant/30 bg-surface-container-low/60 p-1.5 sm:gap-1 sm:p-2",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface ProfileActionItemProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export function ProfileActionItem({ label, children, className }: ProfileActionItemProps) {
  return (
    <div
      className={cn(
        "flex min-w-[4.25rem] flex-col items-center justify-center gap-1 px-2 py-1 sm:min-w-[4.75rem] sm:px-2.5",
        className,
      )}
    >
      {children}
      <span className="max-w-[5.5rem] truncate text-center text-[10px] font-medium leading-tight text-on-surface-variant sm:max-w-none sm:text-[11px]">
        {label}
      </span>
    </div>
  );
}

export const profileActionIconClass =
  "flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/35 bg-bg-elevated text-primary transition-colors hover:border-primary/40 hover:bg-primary-fixed/45 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-1";

/** Circular icon control used inside profile action group. */
export function ProfileActionIconButton({
  label,
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(profileActionIconClass, className)}
      {...props}
    >
      {children}
    </button>
  );
}
