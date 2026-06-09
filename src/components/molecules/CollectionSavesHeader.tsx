import type { ReactNode } from "react";
import { Bookmark } from "lucide-react";
import { VelvetStatMetric } from "@/components/molecules/VelvetStatMetric";
import { cn } from "@/lib/utils";

interface CollectionSavesHeaderProps {
  count: number;
  trailing?: ReactNode;
  className?: string;
}

/** Item grid heading — matches toolbar metric styling */
export function CollectionSavesHeader({
  count,
  trailing,
  className,
}: CollectionSavesHeaderProps) {
  return (
    <div
      className={cn(
        "mb-4 flex flex-wrap items-center justify-between gap-3",
        className,
      )}
    >
      <VelvetStatMetric
        compact
        icon={Bookmark}
        value={count}
        label={count === 1 ? "Save" : "Saves"}
      />
      {trailing}
    </div>
  );
}
