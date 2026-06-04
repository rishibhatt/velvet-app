import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

interface DestructiveIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

/** Icon-only destructive control — consistent remove/delete affordance. */
export function DestructiveIconButton({
  className,
  children,
  label,
  ...props
}: DestructiveIconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "flex h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full border border-error/35 bg-bg-elevated text-error shadow-sm transition-colors",
        "hover:border-error/55 hover:bg-error/10 hover:text-error",
        "active:scale-95 disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error/40 focus-visible:ring-offset-2",
        "touch-manipulation",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
