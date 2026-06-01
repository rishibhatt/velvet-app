"use client";

import { Toaster } from "sonner";
import type { ReactNode } from "react";

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-center"
        expand
        visibleToasts={4}
        gap={12}
        offset="max(1rem, env(safe-area-inset-top))"
        mobileOffset="max(0.75rem, env(safe-area-inset-top))"
        toastOptions={{
          unstyled: true,
          classNames: {
            toast: "velvet-toast-host !p-0 !bg-transparent !border-0 !shadow-none",
          },
        }}
        className="velvet-sonner"
      />
    </>
  );
}
