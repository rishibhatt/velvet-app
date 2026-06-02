import Image from "next/image";
import { cn } from "@/lib/utils";
import { getSourceIconUrl } from "@/lib/source-icons";
import type { ItemSource } from "@/types/board.types";
import { getSourceLabel } from "@/utils/url";

interface SourceBadgeProps {
  source: ItemSource | null;
  /** Page URL for web/maps favicon */
  sourceUrl?: string | null;
  className?: string;
  size?: "sm" | "md";
  showLabel?: boolean;
}

export function SourceBadge({
  source,
  sourceUrl,
  className,
  size = "md",
  showLabel = true,
}: SourceBadgeProps) {
  const iconUrl = getSourceIconUrl(source, sourceUrl);
  const label = getSourceLabel(source);
  const iconPx = size === "sm" ? 14 : 16;

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-full bg-bg-elevated/95 font-semibold uppercase tracking-wide text-on-surface ring-1 ring-outline-variant/25",
        size === "sm" ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-[10px]",
        className,
      )}
    >
      <span
        className={cn(
          "velvet-icon-chip relative shrink-0 overflow-hidden",
          size === "sm" ? "h-5 w-5" : "h-6 w-6",
        )}
      >
        <Image
          src={iconUrl}
          alt=""
          width={iconPx}
          height={iconPx}
          className="h-full w-full object-contain p-0.5"
          unoptimized
        />
      </span>
      {showLabel && <span className="truncate">{label}</span>}
    </span>
  );
}
