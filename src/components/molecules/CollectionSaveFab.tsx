"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { UI_LABELS } from "@/constants/ui-labels";
import { useScrollCompact } from "@/hooks/useScrollCompact";
import { cn } from "@/lib/utils";

interface CollectionSaveFabProps {
  onClick: () => void;
  label?: string;
}

/** Floating add control — full label when at top, icon-only after scroll. */
export function CollectionSaveFab({
  onClick,
  label = UI_LABELS.saveToCollection,
}: CollectionSaveFabProps) {
  const compact = useScrollCompact(100);

  return (
    <div
      className={cn(
        "pointer-events-none fixed z-40 flex justify-end",
        "right-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:right-8 md:bottom-8",
      )}
    >
      <Button
        type="button"
        onClick={onClick}
        variant="gradient"
        size="lg"
        icon={Plus}
        aria-label={label}
        className={cn(
          "pointer-events-auto shadow-lg transition-all duration-300",
          compact
            ? "h-14 w-14 !min-h-14 !min-w-14 rounded-full px-0"
            : "max-w-[min(calc(100vw-2rem),280px)]",
        )}
      >
        <span className={cn(compact && "sr-only")}>{label}</span>
      </Button>
    </div>
  );
}
