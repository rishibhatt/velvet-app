"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CollectionItemsGridProps {
  children: ReactNode;
  className?: string;
  /** Optional heading row above the grid */
  header?: ReactNode;
  /** Single empty-state card spans full width on mobile (not squeezed in 2-col grid) */
  emptyState?: boolean;
}

/** Mobile-first 2-column grid; scales to 3–4 columns on larger screens. */
export function CollectionItemsGrid({
  children,
  className,
  header,
  emptyState = false,
}: CollectionItemsGridProps) {
  return (
    <div className={cn("w-full", className)}>
      {header}
      <div
        className={cn(
          "collection-grid",
          emptyState && "collection-grid--empty",
        )}
      >
        {children}
      </div>
    </div>
  );
}
