import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export function IconButton({
  className,
  children,
  label,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "flex h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full border-2 border-primary bg-white text-primary shadow-sm transition-all hover:bg-primary hover:text-on-primary active:scale-95 touch-manipulation",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
