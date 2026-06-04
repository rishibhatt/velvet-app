"use client";

import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { ClientPortal } from "@/components/atoms/ClientPortal";
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
  footerClassName?: string;
  overlayClassName?: string;
  stackClassName?: string;
  hideClose?: boolean;
  responsive?: boolean;
  /** When false, body does not scroll — keeps compact modals on one screen. */
  scrollBody?: boolean;
}

const sheetMaxHeight =
  "max-h-[min(92dvh,calc(100dvh-env(safe-area-inset-bottom,0px)-0.5rem))]";

function ModalCloseButton({ onClose, className }: { onClose: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClose}
      className={cn(
        "flex shrink-0 min-h-10 min-w-10 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant ring-1 ring-outline-variant/25 transition hover:bg-primary/10 hover:text-primary",
        className,
      )}
      aria-label="Close"
    >
      <X className="h-5 w-5" />
    </button>
  );
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
  footerClassName,
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
  const showHeader = Boolean(title || !hideClose);
  const showTopChrome = useSheet || showHeader;

  return (
    <ClientPortal>
      <AnimatePresence>
        {open && (
          <motion.div
            className={cn(
              "fixed inset-0 flex justify-center",
              useSheet ? "items-end" : "items-center p-4",
              stackClassName,
              overlayClassName ?? "glass-overlay",
              dimForConfirm && "pointer-events-none opacity-0",
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
                "relative flex w-full flex-col overflow-hidden border border-outline-variant/20 bg-bg-elevated shadow-modal",
                useSheet
                  ? cn("rounded-t-[1.75rem]", sheetMaxHeight)
                  : "max-h-[min(90vh,calc(100dvh-2rem))] rounded-[1.75rem] sm:rounded-4xl",
                className,
              )}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? "modal-shell-title" : undefined}
            >
              {showTopChrome && (
                <div className="shrink-0 border-b border-outline-variant/20 bg-bg-elevated">
                  {useSheet && (
                    <div className="flex justify-center pt-2.5 pb-1" aria-hidden>
                      <span className="h-1 w-10 rounded-full bg-outline-variant/50" />
                    </div>
                  )}
                  {showHeader && (
                    <div
                      className={cn(
                        "flex items-start justify-between gap-3 px-4 pb-3.5 sm:px-6 sm:pb-4",
                        useSheet ? "pt-0" : "pt-3.5 sm:pt-4",
                      )}
                    >
                      {title ? (
                        <div className="min-w-0 flex-1">
                          <h2
                            id="modal-shell-title"
                            className="font-display text-lg leading-snug text-on-surface sm:text-xl"
                          >
                            {title}
                          </h2>
                          {subtitle && (
                            <p className="mt-1 text-sm text-on-surface-variant">
                              {subtitle}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="min-w-0 flex-1" aria-hidden />
                      )}
                      {!hideClose && <ModalCloseButton onClose={onClose} />}
                    </div>
                  )}
                </div>
              )}

              <div
                className={cn(
                  "min-h-0 flex-1 overflow-x-hidden",
                  scrollBody
                    ? "overflow-y-auto overscroll-y-contain custom-scrollbar"
                    : "overflow-hidden",
                  !footer && "pb-[max(1rem,env(safe-area-inset-bottom,0px))]",
                  contentClassName,
                )}
              >
                {children}
              </div>

              {footer && (
                <footer
                  className={cn(
                    "shrink-0 border-t border-outline-variant/20 bg-bg-elevated px-4 py-3 sm:px-6",
                    "pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]",
                    footerClassName,
                  )}
                >
                  {footer}
                </footer>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ClientPortal>
  );
}
