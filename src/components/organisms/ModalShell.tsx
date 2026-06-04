"use client";

import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { scaleIn, slideInBottom } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useConfirmStore } from "@/store/confirm.store";

interface ModalShellProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  contentClassName?: string;
  overlayClassName?: string;
  stackClassName?: string;
  hideClose?: boolean;
  responsive?: boolean;
  /** When false, body does not scroll — keeps compact modals on one screen. */
  scrollBody?: boolean;
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
  stackClassName = "z-[100]",
  hideClose = false,
  responsive = true,
  scrollBody = true,
}: ModalShellProps) {
  useBodyScrollLock(open);
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const useSheet = responsive && !isDesktop;
  const confirmOpen = useConfirmStore((s) => s.open);
  const dimForConfirm = confirmOpen && stackClassName === "z-[100]";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={cn(
            "fixed inset-0 flex justify-center",
            useSheet ? "items-end" : "items-center p-4",
            stackClassName,
            overlayClassName ?? "glass-overlay",
            dimForConfirm && "opacity-0 pointer-events-none",
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: dimForConfirm ? 0 : 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          aria-hidden={dimForConfirm}
        >
          <motion.div
            {...(useSheet ? slideInBottom : scaleIn)}
            className={cn(
              "relative flex w-full flex-col overflow-hidden border border-outline-variant/20 bg-bg-elevated shadow-[var(--shadow-modal)]",
              useSheet
                ? "max-h-[min(78dvh,calc(100dvh-env(safe-area-inset-bottom,0px)-5.5rem))] rounded-t-[1.75rem]"
                : "max-h-[min(90vh,calc(100dvh-2rem))] rounded-[1.75rem] sm:rounded-[2rem]",
              className,
            )}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {useSheet && (
              <div className="flex shrink-0 justify-center pt-2.5 pb-1" aria-hidden>
                <span className="h-1 w-10 rounded-full bg-outline-variant/50" />
              </div>
            )}

            {(title || !hideClose) && (
              <header className="relative shrink-0 border-b border-outline-variant/20 px-4 py-3.5 pr-12 sm:px-6 sm:py-4 sm:pr-14">
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
                    className="absolute top-3 right-3 rounded-full bg-surface-container-low p-2.5 text-on-surface-variant ring-1 ring-outline-variant/25 transition hover:bg-primary/10 hover:text-primary sm:top-4 sm:right-4"
                    aria-label="Close modal"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </header>
            )}

            <div
              className={cn(
                "min-h-0 flex-1",
                scrollBody
                  ? "overflow-y-auto overscroll-y-contain custom-scrollbar"
                  : "overflow-visible",
                !footer && "pb-[max(1rem,env(safe-area-inset-bottom))]",
                !title && !hideClose && "pt-12",
                contentClassName,
              )}
            >
              {children}
            </div>

            {footer && (
              <footer
                className={cn(
                  "shrink-0 border-t border-outline-variant/20 bg-bg-elevated px-4 py-3 shadow-[0_-10px_28px_rgba(46,42,39,0.08)] sm:px-6 sm:py-4",
                  useSheet
                    ? "pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))]"
                    : "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
                )}
              >
                {footer}
              </footer>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
