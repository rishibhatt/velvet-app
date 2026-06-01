"use client";

import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { scaleIn } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

interface ModalShellProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Sticky footer (e.g. primary action) — always visible without scrolling */
  footer?: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  contentClassName?: string;
  overlayClassName?: string;
  hideClose?: boolean;
}

export function ModalShell({
  open,
  onClose,
  children,
  footer,
  title,
  subtitle,
  className,
  contentClassName,
  overlayClassName,
  hideClose = false,
}: ModalShellProps) {
  useBodyScrollLock(open);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={cn(
            "fixed inset-0 z-[100] flex items-end justify-center overflow-hidden p-0 sm:items-center sm:p-4",
            overlayClassName ?? "glass-overlay",
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            {...scaleIn}
            className={cn(
              "relative flex w-full max-w-2xl flex-col",
              "max-h-[min(92dvh,calc(100dvh-env(safe-area-inset-bottom,0px)))]",
              "rounded-t-[2rem] border border-outline-variant/20 bg-bg-elevated shadow-[var(--shadow-modal)] sm:max-h-[min(90vh,calc(100dvh-2rem))] sm:rounded-[2rem]",
              className,
            )}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {(title || !hideClose) && (
              <div className="relative shrink-0 border-b border-outline-variant/20 px-5 py-4 pr-14 sm:px-6">
                {title && (
                  <div>
                    <h2 className="font-display text-xl text-on-surface sm:text-2xl">
                      {title}
                    </h2>
                    {subtitle && (
                      <p className="mt-1 text-sm text-on-surface-variant">{subtitle}</p>
                    )}
                  </div>
                )}
                {!hideClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-3 right-3 rounded-full bg-surface-container-low p-2.5 text-on-surface-variant ring-1 ring-outline-variant/25 transition hover:bg-primary/10 hover:text-primary"
                    aria-label="Close modal"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            )}

            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto overscroll-y-contain custom-scrollbar",
                footer ? "pb-2" : "pb-[max(1rem,env(safe-area-inset-bottom))]",
                !title && !hideClose && "pt-12",
                contentClassName,
              )}
            >
              {children}
            </div>

            {footer && (
              <div className="shrink-0 border-t border-outline-variant/20 bg-bg-elevated px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
