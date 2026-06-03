"use client";

import {
  forwardRef,
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export interface AuthFloatingFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
  label: string;
  error?: string;
  hint?: ReactNode;
  wrapperClassName?: string;
}

export const AuthFloatingField = forwardRef<HTMLInputElement, AuthFloatingFieldProps>(
  ({ label, error, hint, wrapperClassName, id: idProp, value, defaultValue, ...props }, ref) => {
    const generatedId = useId();
    const id = idProp ?? generatedId;
    const [focused, setFocused] = useState(false);
    const [internalValue, setInternalValue] = useState(
      () => (value ?? defaultValue ?? "").toString(),
    );
    const displayValue = value !== undefined ? value : internalValue;
    const floated =
      focused || (typeof displayValue === "string" && displayValue.length > 0);

    return (
      <div className={cn("space-y-1.5", wrapperClassName)}>
        <div className="relative">
          <label
            htmlFor={id}
            className={cn(
              "pointer-events-none absolute left-5 z-10 origin-left transition-all duration-200",
              floated
                ? "top-2 text-[11px] font-semibold text-[#B96F5E]"
                : "top-1/2 -translate-y-1/2 text-sm font-medium text-[#7A665D]",
            )}
          >
            {label}
          </label>
          <input
            ref={ref}
            id={id}
            value={value}
            defaultValue={value === undefined ? defaultValue : undefined}
            onChange={(e) => {
              if (value === undefined) setInternalValue(e.target.value);
              props.onChange?.(e);
            }}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            className={cn(
              "h-14 w-full rounded-[20px] border bg-[#FFFCF8] px-5 pt-5 pb-2 text-[15px] text-[#2D1E1A] shadow-[inset_0_1px_2px_rgba(45,30,26,0.04)] transition-colors",
              "placeholder:text-transparent focus:border-[#B96F5E] focus:outline-none focus:ring-2 focus:ring-[#B96F5E]/20",
              error ? "border-red-400/60" : "border-[#E9DDD4]",
            )}
            {...props}
          />
        </div>
        {hint}
        {error && (
          <p className="px-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);
AuthFloatingField.displayName = "AuthFloatingField";
