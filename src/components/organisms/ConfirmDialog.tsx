"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { slideInBottom, scaleIn } from "@/lib/animations";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useConfirmStore } from "@/store/confirm.store";
import { cn } from "@/lib/utils";

export function ConfirmDialog() {
  const {
    open,
    title,
    description,
    confirmLabel,
    cancelLabel,
    variant,
    confirm,
    cancel,
  } = useConfirmStore();

  const isDesktop = useMediaQuery("(min-width: 640px)");
  useBodyScrollLock(open);

  const isDestructive = variant === "destructive";

  return (
    <AnimatePresence>
      {open && (
        <div
          className={cn(
            "fixed inset-0 z-[110] flex justify-center",
            isDesktop ? "items-center p-4 sm:p-6" : "items-end p-0",
          )}
          role="presentation"
        >
          <motion.button
            type="button"
            className="absolute inset-0 bg-[#2a1f1f]/70 backdrop-blur-md"
            aria-label="Dismiss dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={cancel}
          />

          <motion.div
            {...(isDesktop ? scaleIn : slideInBottom)}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby={description ? "confirm-dialog-desc" : undefined}
            className={cn(
              "relative z-10 flex w-full flex-col overflow-hidden border border-outline-variant/25 bg-bg-elevated shadow-[0_24px_64px_rgba(46,42,39,0.28)]",
              isDesktop
                ? "max-w-md rounded-[1.75rem] sm:rounded-[2rem]"
                : "max-h-[min(70dvh,520px)] rounded-t-[1.75rem]",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {isDestructive && (
              <div
                className="h-1 w-full shrink-0 bg-gradient-to-r from-[#a85c5c] via-[#c97878] to-[#a85c5c]"
                aria-hidden
              />
            )}

            <div className="px-5 pt-6 pb-4 sm:px-8 sm:pt-8">
              <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                <div
                  className={cn(
                    "mb-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl",
                    isDestructive
                      ? "bg-[#f5e8e8] text-[#9e4a4a] ring-2 ring-[#c97878]/35"
                      : "bg-primary-fixed/70 text-primary ring-1 ring-primary/15",
                  )}
                >
                  {isDestructive ? (
                    <Trash2 className="h-7 w-7" strokeWidth={1.75} aria-hidden />
                  ) : (
                    <AlertTriangle className="h-7 w-7" strokeWidth={1.75} aria-hidden />
                  )}
                </div>
                <h2
                  id="confirm-dialog-title"
                  className="font-display text-xl leading-snug text-on-surface sm:text-2xl"
                >
                  {title}
                </h2>
                {description && (
                  <p
                    id="confirm-dialog-desc"
                    className="mt-2 text-sm leading-relaxed text-on-surface-variant"
                  >
                    {description}
                  </p>
                )}
                {isDestructive && (
                  <p className="mt-3 w-full rounded-xl bg-[#f8ecec]/80 px-3 py-2 text-xs font-medium text-[#7a3434] ring-1 ring-[#c97878]/20">
                    This action cannot be undone.
                  </p>
                )}
              </div>
            </div>

            <div
              className={cn(
                "flex shrink-0 flex-col gap-2.5 border-t border-outline-variant/20 bg-surface-container-low/50 px-4 py-4 sm:flex-row-reverse sm:justify-end sm:gap-3 sm:px-8 sm:py-5",
                !isDesktop && "pb-[calc(1rem+env(safe-area-inset-bottom,0px))]",
              )}
            >
              <Button
                type="button"
                variant={isDestructive ? "dangerSolid" : "gradient"}
                icon={isDestructive ? Trash2 : undefined}
                onClick={confirm}
                className="w-full sm:min-w-[10rem] sm:w-auto"
              >
                {confirmLabel}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={cancel}
                className="w-full sm:w-auto"
              >
                {cancelLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
