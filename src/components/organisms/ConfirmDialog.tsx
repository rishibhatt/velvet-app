"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { ModalShell } from "@/components/organisms/ModalShell";
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

  const isDestructive = variant === "destructive";

  return (
    <ModalShell
      open={open}
      onClose={cancel}
      hideClose
      className="max-w-md"
      contentClassName="px-6 py-6 sm:px-8 sm:py-8"
      stackClassName="z-[110]"
      overlayClassName="glass-overlay"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={cancel}
            className="w-full sm:w-auto"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={isDestructive ? "destructive" : "gradient"}
            onClick={confirm}
            className="w-full sm:w-auto"
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
        <div
          className={cn(
            "mb-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl sm:mb-0 sm:mr-5",
            isDestructive
              ? "bg-error/10 text-error ring-1 ring-error/20"
              : "bg-primary-fixed/70 text-primary ring-1 ring-primary/15",
          )}
        >
          <AlertTriangle className="h-7 w-7" strokeWidth={1.75} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl leading-snug text-on-surface sm:text-2xl">
            {title}
          </h2>
          {description && (
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              {description}
            </p>
          )}
        </div>
      </div>
    </ModalShell>
  );
}
