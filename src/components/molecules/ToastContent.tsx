"use client";

import {
  AlertCircle,
  CheckCircle2,
  Info,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error" | "info" | "loading";

const variantConfig: Record<
  ToastVariant,
  {
    Icon: typeof CheckCircle2;
    accentBar: string;
    iconWrap: string;
    glow: string;
  }
> = {
  success: {
    Icon: CheckCircle2,
    accentBar: "bg-gradient-to-b from-primary-container via-accent-coral to-primary-fixed-dim",
    iconWrap:
      "bg-gradient-to-br from-primary-fixed to-primary-container/40 text-on-primary-container ring-1 ring-primary/10",
    glow: "shadow-[0_8px_32px_rgba(107,61,50,0.12)]",
  },
  error: {
    Icon: AlertCircle,
    accentBar: "bg-gradient-to-b from-error/80 to-[#c97a7a]",
    iconWrap: "bg-[#fce8e8] text-error ring-1 ring-error/15",
    glow: "shadow-[0_8px_32px_rgba(186,26,26,0.1)]",
  },
  info: {
    Icon: Info,
    accentBar: "bg-gradient-to-b from-tertiary-container to-accent-lavender",
    iconWrap:
      "bg-gradient-to-br from-tertiary-fixed/90 to-secondary-fixed/50 text-tertiary ring-1 ring-tertiary/10",
    glow: "shadow-[var(--shadow-card)]",
  },
  loading: {
    Icon: Loader2,
    accentBar: "bg-gradient-to-b from-accent-coral to-primary-container",
    iconWrap: "bg-primary-fixed/80 text-primary ring-1 ring-primary/10",
    glow: "shadow-[var(--shadow-card)]",
  },
};

interface ToastContentProps {
  variant: ToastVariant;
  title: string;
  description?: string;
  onDismiss?: () => void;
}

export function ToastContent({
  variant,
  title,
  description,
  onDismiss,
}: ToastContentProps) {
  const { Icon, accentBar, iconWrap, glow } = variantConfig[variant];

  return (
    <div
      className={cn(
        "velvet-toast pointer-events-auto relative flex w-full max-w-[min(100vw-2rem,400px)] overflow-hidden rounded-2xl border border-outline-variant/25 bg-bg-elevated/98 backdrop-blur-xl",
        glow,
      )}
      role="status"
    >
      <div className={cn("w-1 shrink-0", accentBar)} aria-hidden />

      <div className="flex min-w-0 flex-1 items-start gap-3 p-4 pr-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            iconWrap,
          )}
        >
          <Icon
            className={cn("h-5 w-5", variant === "loading" && "animate-spin")}
            strokeWidth={2}
            aria-hidden
          />
        </div>

        <div className="min-w-0 flex-1 pt-0.5">
          <p className="font-display text-[0.9375rem] leading-snug font-semibold text-on-surface">
            {title}
          </p>
          {description && (
            <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">
              {description}
            </p>
          )}
        </div>

        {onDismiss && variant !== "loading" && (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 rounded-full p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
