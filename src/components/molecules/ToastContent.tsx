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
  { Icon: typeof CheckCircle2; border: string; icon: string }
> = {
  success: {
    Icon: CheckCircle2,
    border: "border-l-[3px] border-l-[#2d6a4f]",
    icon: "text-[#2d6a4f]",
  },
  error: {
    Icon: AlertCircle,
    border: "border-l-[3px] border-l-error",
    icon: "text-error",
  },
  info: {
    Icon: Info,
    border: "border-l-[3px] border-l-primary",
    icon: "text-primary",
  },
  loading: {
    Icon: Loader2,
    border: "border-l-[3px] border-l-outline-variant",
    icon: "text-on-surface-variant",
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
  const { Icon, border, icon } = variantConfig[variant];

  return (
    <div
      className={cn(
        "pointer-events-auto flex w-full max-w-[min(100vw-2rem,380px)] items-start gap-3 rounded-xl border border-outline-variant/30 bg-bg-elevated px-4 py-3.5 shadow-md",
        border,
      )}
      role="status"
    >
      <Icon
        className={cn(
          "mt-0.5 h-5 w-5 shrink-0",
          icon,
          variant === "loading" && "animate-spin",
        )}
        strokeWidth={2}
        aria-hidden
      />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-snug text-on-surface">{title}</p>
        {description && (
          <p className="mt-0.5 text-xs leading-relaxed text-on-surface-variant">
            {description}
          </p>
        )}
      </div>

      {onDismiss && variant !== "loading" && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-md p-1 text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
