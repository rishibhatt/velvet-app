"use client";

import {
  AlertCircle,
  CheckCircle2,
  Info,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error" | "info" | "loading";

const variantStyles: Record<
  ToastVariant,
  { ring: string; icon: string; Icon: typeof CheckCircle2 }
> = {
  success: {
    ring: "border-l-[#5a8f6a]",
    icon: "text-[#3d6b4a] bg-[#e8f5ec]",
    Icon: CheckCircle2,
  },
  error: {
    ring: "border-l-error",
    icon: "text-error bg-[#fdeaea]",
    Icon: AlertCircle,
  },
  info: {
    ring: "border-l-primary",
    icon: "text-primary bg-primary/10",
    Icon: Info,
  },
  loading: {
    ring: "border-l-accent-coral",
    icon: "text-primary bg-primary/10",
    Icon: Loader2,
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
  const { ring, icon, Icon } = variantStyles[variant];

  return (
    <div
      className={cn(
        "velvet-toast pointer-events-auto flex w-full max-w-[min(100vw-2rem,380px)] items-start gap-3 rounded-2xl border border-outline-variant/30 border-l-4 bg-bg-elevated/95 p-4 shadow-[var(--shadow-modal)] backdrop-blur-xl",
        ring,
      )}
      role="status"
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          icon,
        )}
      >
        <Icon
          className={cn("h-5 w-5", variant === "loading" && "animate-spin")}
          aria-hidden
        />
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="font-display text-sm leading-snug font-semibold text-on-surface">
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
          className="shrink-0 rounded-full p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function ToastBrandMark() {
  return (
    <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
  );
}
