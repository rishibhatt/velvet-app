"use client";

import { Plus, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CollectionAddCardProps {
  onClick: () => void;
  title?: string;
  description?: string;
  className?: string;
}

/** Product-style empty slot — invites user to add their first save */
export function CollectionAddCard({
  onClick,
  title = "Add your first save",
  description = "Paste a link, upload an image, or jot a note to start curating.",
  className,
}: CollectionAddCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        "group relative flex w-full min-h-[220px] flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-primary/25 bg-gradient-to-br from-primary-fixed/30 via-bg-elevated to-secondary-fixed/20 px-5 py-8 text-center shadow-[var(--shadow-card)] transition-[border-color,box-shadow] hover:border-primary/45 hover:shadow-[var(--shadow-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:min-h-[300px] sm:rounded-3xl sm:px-8 sm:py-10",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, var(--primary-container) 0%, transparent 45%), radial-gradient(circle at 80% 70%, var(--tertiary-container) 0%, transparent 40%)",
        }}
      />

      <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-bg-elevated shadow-md ring-1 ring-primary/15 transition-transform group-hover:scale-105 sm:h-16 sm:w-16 sm:rounded-2xl">
        <Plus className="h-6 w-6 text-primary sm:h-8 sm:w-8" strokeWidth={2} />
      </div>

      <h3 className="relative mt-4 font-display text-lg text-on-surface sm:mt-6 sm:text-2xl">
        {title}
      </h3>
      <p className="relative mt-2 max-w-[16rem] text-xs leading-relaxed text-on-surface-variant sm:max-w-xs sm:text-sm">
        {description}
      </p>

      <span className="relative mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-on-primary shadow-md transition group-hover:bg-[#5a3228] sm:mt-6 sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm">
        <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
        Save something
      </span>
    </motion.button>
  );
}
