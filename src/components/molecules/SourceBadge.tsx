import { cn } from "@/lib/utils";
import type { ItemSource } from "@/types/board.types";
import { getSourceLabel } from "@/utils/url";

interface SourceBadgeProps {
  source: ItemSource | null;
  className?: string;
}

const sourceStyles: Record<ItemSource, string> = {
  instagram: "bg-[#E1306C] text-white",
  youtube: "bg-[#FF0000] text-white",
  amazon: "bg-[#FF9900] text-on-background",
  pinterest: "bg-accent-lavender text-on-tertiary-fixed-variant",
  web: "bg-primary text-white",
  upload: "bg-secondary text-white",
};

export function SourceBadge({ source, className }: SourceBadgeProps) {
  const key = source ?? "web";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold tracking-wider uppercase",
        sourceStyles[key],
        className,
      )}
    >
      {getSourceLabel(source)}
    </span>
  );
}
