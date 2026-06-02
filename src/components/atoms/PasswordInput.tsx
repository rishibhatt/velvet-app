"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  wrapperClassName?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, wrapperClassName, id, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const inputId = id ?? "password";

    return (
      <div className={cn("relative", wrapperClassName)}>
        <input
          ref={ref}
          id={inputId}
          type={visible ? "text" : "password"}
          className={cn(
            "velvet-field w-full rounded-full border border-outline-variant/30 bg-surface-container-low py-3 pr-12 pl-5 shadow-[var(--shadow-inner)]",
            className,
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute top-1/2 right-2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary"
          aria-label={visible ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {visible ? (
            <EyeOff className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
          ) : (
            <Eye className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
          )}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";
