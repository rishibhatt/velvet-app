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
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "group relative flex min-h-[280px] w-full flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-primary/25 bg-gradient-to-br from-primary-fixed/30 via-bg-elevated to-secondary-fixed/20 p-8 text-center shadow-[var(--shadow-card)] transition-[border-color,box-shadow] hover:border-primary/45 hover:shadow-[var(--shadow-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:min-h-[320px]",
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

      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-bg-elevated shadow-md ring-1 ring-primary/15 transition-transform group-hover:scale-105">
        <Plus className="h-8 w-8 text-primary" strokeWidth={2} />
      </div>

      <h3 className="relative mt-6 font-display text-xl text-on-surface sm:text-2xl">
        {title}
      </h3>
      <p className="relative mt-2 max-w-xs text-sm leading-relaxed text-on-surface-variant">
        {description}
      </p>

      <span className="relative mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-md transition group-hover:bg-[#5a3228]">
        <Sparkles className="h-4 w-4" aria-hidden />
        Save something
      </span>
    </motion.button>
  );
}
