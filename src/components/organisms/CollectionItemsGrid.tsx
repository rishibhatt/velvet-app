"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CollectionItemsGridProps {
  children: ReactNode;
  className?: string;
  /** Optional heading row above the grid */
  header?: ReactNode;
}

/** Mobile-first 2-column grid; scales to 3–4 columns on larger screens. */
export function CollectionItemsGrid({
  children,
  className,
  header,
}: CollectionItemsGridProps) {
  return (
    <div className={cn("w-full", className)}>
      {header}
      <div className="collection-grid">{children}</div>
    </div>
  );
}
