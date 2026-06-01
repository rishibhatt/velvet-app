"use client";

import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { scaleIn } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface ModalShellProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  overlayClassName?: string;
  hideClose?: boolean;
}

export function ModalShell({
  open,
  onClose,
  children,
  className,
  overlayClassName,
  hideClose = false,
}: ModalShellProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={cn(
            "fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4",
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
              "relative max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-[2rem] bg-bg-elevated shadow-[var(--shadow-modal)] custom-scrollbar sm:max-h-[90vh] sm:rounded-[2rem]",
              className,
            )}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {!hideClose && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 rounded-full p-2 text-outline transition-colors hover:text-primary"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
