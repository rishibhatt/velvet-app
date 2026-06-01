import { cn } from "@/lib/utils";
import type { ItemSource } from "@/types/board.types";
import { getSourceLabel } from "@/utils/url";

interface SourceBadgeProps {
  source: ItemSource | null;
  className?: string;
  size?: "sm" | "md";
}

const sourceConfig: Record<
  ItemSource,
  { dot: string; bg: string; text: string; ring: string }
> = {
  instagram: {
    dot: "bg-[#E1306C]",
    bg: "bg-[#FDF2F8]",
    text: "text-[#C13584]",
    ring: "ring-[#F9C2D9]",
  },
  youtube: {
    dot: "bg-[#FF0000]",
    bg: "bg-[#FEF2F2]",
    text: "text-[#CC0000]",
    ring: "ring-[#FECACA]",
  },
  amazon: {
    dot: "bg-[#FF9900]",
    bg: "bg-[#FFFBEB]",
    text: "text-[#B45309]",
    ring: "ring-[#FDE68A]",
  },
  pinterest: {
    dot: "bg-[#BD081C]",
    bg: "bg-tertiary-fixed/80",
    text: "text-on-tertiary-fixed-variant",
    ring: "ring-tertiary-container",
  },
  web: {
    dot: "bg-primary",
    bg: "bg-primary-fixed/50",
    text: "text-on-primary-fixed-variant",
    ring: "ring-primary-fixed-dim/40",
  },
  upload: {
    dot: "bg-secondary",
    bg: "bg-secondary-fixed/60",
    text: "text-on-secondary-fixed-variant",
    ring: "ring-secondary-container",
  },
};

export function SourceBadge({ source, className, size = "md" }: SourceBadgeProps) {
  const key = source ?? "web";
  const config = sourceConfig[key];
  const label = getSourceLabel(source);

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-full font-semibold uppercase tracking-wide ring-1",
        size === "sm" ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-[10px]",
        config.bg,
        config.text,
        config.ring,
        className,
      )}
    >
      <span className={cn("shrink-0 rounded-full", size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2", config.dot)} />
      <span className="truncate">{label}</span>
    </span>
  );
}
