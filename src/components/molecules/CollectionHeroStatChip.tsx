import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CollectionHeroStatChipProps {
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function CollectionHeroStatChip({
  icon,
  children,
  className,
}: CollectionHeroStatChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-outline-variant/25 bg-bg-elevated/95 px-2.5 py-1 text-xs font-semibold text-on-surface shadow-sm backdrop-blur-sm",
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
