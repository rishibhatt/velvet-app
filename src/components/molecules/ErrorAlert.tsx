"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { getErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";

interface ErrorAlertProps {
  error: unknown;
  title?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorAlert({
  error,
  title = "Something went wrong",
  onRetry,
  className,
}: ErrorAlertProps) {
  const message = getErrorMessage(error);

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-error/25 bg-error/5 p-5 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
      role="alert"
    >
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-error/15">
          <AlertCircle className="h-5 w-5 text-error" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-on-surface">{title}</p>
          <p className="mt-1 text-sm text-on-surface-variant">{message}</p>
        </div>
      </div>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          className="w-full shrink-0 sm:w-auto"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
      )}
    </div>
  );
}
