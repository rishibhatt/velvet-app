"use client";

import { cn } from "@/lib/utils";
import {
  getPasswordStrength,
  passwordStrengthLabels,
} from "@/schemas/auth.schema";

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export function PasswordStrengthIndicator({
  password,
  className,
}: PasswordStrengthIndicatorProps) {
  if (!password) return null;

  const score = getPasswordStrength(password);
  const label = passwordStrengthLabels[score];

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              index < score
                ? score <= 1
                  ? "bg-error"
                  : score === 2
                    ? "bg-amber-500"
                    : "bg-primary"
                : "bg-outline-variant/30",
            )}
          />
        ))}
      </div>
      <p className="text-xs text-on-surface-variant">{label}</p>
    </div>
  );
}
