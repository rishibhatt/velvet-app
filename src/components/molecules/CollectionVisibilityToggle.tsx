"use client";

import { Globe, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollectionVisibilityToggleProps {
  isPublic: boolean;
  onChange: (isPublic: boolean) => void;
  disabled?: boolean;
  showPrivateHint?: boolean;
}

export function CollectionVisibilityToggle({
  isPublic,
  onChange,
  disabled,
  showPrivateHint = true,
}: CollectionVisibilityToggleProps) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-semibold text-on-surface-variant">Visibility</span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(false)}
          className={cn(
            "flex flex-1 flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-xs font-semibold transition-colors disabled:opacity-50",
            !isPublic
              ? "border-primary bg-primary-fixed/40 text-primary"
              : "border-outline-variant/30 bg-bg-elevated text-on-surface-variant hover:border-outline-variant/50",
          )}
        >
          <Lock className="h-5 w-5" aria-hidden />
          Private
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(true)}
          className={cn(
            "flex flex-1 flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-xs font-semibold transition-colors disabled:opacity-50",
            isPublic
              ? "border-primary bg-primary-fixed/40 text-primary"
              : "border-outline-variant/30 bg-bg-elevated text-on-surface-variant hover:border-outline-variant/50",
          )}
        >
          <Globe className="h-5 w-5" aria-hidden />
          Public
        </button>
      </div>
      {showPrivateHint && !isPublic && (
        <p className="text-xs text-on-surface-variant">
          Only you and collaborators can see this collection.
        </p>
      )}
    </div>
  );
}
