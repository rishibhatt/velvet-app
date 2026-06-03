"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { Loader2, type LucideIcon } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const iconSizeClass = {
  sm: "h-4 w-4",
  md: "h-4 w-4",
  lg: "h-5 w-5",
} as const;

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 min-h-[44px] touch-manipulation",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-on-primary shadow-md hover:bg-[#5a3228] hover:shadow-lg",
        gradient:
          "velvet-btn-gradient text-white shadow-lg hover:shadow-xl hover:brightness-105",
        secondary:
          "border-2 border-primary bg-white text-primary shadow-sm hover:bg-primary hover:text-on-primary",
        ghost:
          "text-on-surface hover:bg-surface-container-high hover:text-primary",
        destructive:
          "bg-error text-white shadow-md hover:bg-[#9a1515] hover:shadow-lg",
        danger:
          "border border-[#8b4545]/30 bg-[#f8ecec] text-[#7a3434] shadow-sm hover:border-[#8b4545]/45 hover:bg-[#f3dede]",
        dangerSolid:
          "bg-[#9e4a4a] text-white shadow-md ring-1 ring-[#7a3434]/25 hover:bg-[#873f3f] hover:shadow-lg",
        outline:
          "border-2 border-primary/50 bg-white text-primary shadow-sm hover:border-primary hover:bg-primary/5",
      },
      size: {
        sm: "h-10 min-h-10 px-4 text-sm",
        md: "h-11 min-h-11 px-6 text-sm",
        lg: "h-14 min-h-14 px-8 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  loading?: boolean;
  /** Leading icon — sized consistently per button size */
  icon?: LucideIcon;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, loading, icon: Icon, children, disabled, ...props },
    ref,
  ) => {
    const resolvedSize = size ?? "md";
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          Icon && (
            <Icon
              className={iconSizeClass[resolvedSize]}
              strokeWidth={2}
              aria-hidden
            />
          )
        )}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
