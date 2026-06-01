"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl bg-surface-container-low px-8 py-16 text-center",
        className,
      )}
    >
      <svg
        viewBox="0 0 120 120"
        className="mb-6 h-24 w-24 opacity-80"
        aria-hidden
      >
        <rect x="20" y="30" width="50" height="40" rx="8" fill="#F4A896" opacity="0.3" />
        <rect x="45" y="20" width="50" height="40" rx="8" fill="#E8B4B8" opacity="0.4" />
        <rect x="35" y="50" width="50" height="40" rx="8" fill="#C9B6E4" opacity="0.3" />
        <path d="M15 90 Q30 80 45 90 T75 90 T105 90" stroke="#8a4e40" strokeWidth="2" fill="none" opacity="0.4" />
      </svg>
      <h3 className="font-display mb-2 text-2xl text-on-surface">{title}</h3>
      <p className="mb-6 max-w-sm text-on-surface-variant">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="lg">
          <Plus className="h-5 w-5" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
