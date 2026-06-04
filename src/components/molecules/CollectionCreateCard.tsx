"use client";

import { Layers, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CollectionCreateCardProps {
  onClick: () => void;
  className?: string;
}

/** Compact rail card — create a new collection from home or profile previews. */
export function CollectionCreateCard({
  onClick,
  className,
}: CollectionCreateCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        "group flex h-full min-h-[220px] w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-[24px] border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary-fixed/25 via-bg-elevated to-secondary-fixed/15 px-4 py-6 text-center shadow-[var(--shadow-card)] transition-[border-color,box-shadow] hover:border-primary/50 hover:shadow-[var(--shadow-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:min-h-[280px]",
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-bg-elevated shadow-md ring-1 ring-primary/15 transition-transform group-hover:scale-105">
        <Plus className="h-6 w-6 text-primary" strokeWidth={2} />
      </div>
      <div>
        <p className="font-display text-base text-on-surface sm:text-lg">
          New collection
        </p>
        <p className="mt-1 text-xs leading-relaxed text-on-surface-variant sm:text-sm">
          Curate saves for a mood, trip, or project
        </p>
      </div>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
        <Layers className="h-3.5 w-3.5" aria-hidden />
        Create
      </span>
    </motion.button>
  );
}
