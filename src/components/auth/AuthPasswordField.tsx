"use client";

import {
  forwardRef,
  useId,
  useState,
  type InputHTMLAttributes,
} from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AuthPasswordFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className"> {
  label: string;
  error?: string;
}

export const AuthPasswordField = forwardRef<HTMLInputElement, AuthPasswordFieldProps>(
  ({ label, error, id: idProp, value, defaultValue, ...props }, ref) => {
    const generatedId = useId();
    const id = idProp ?? generatedId;
    const [focused, setFocused] = useState(false);
    const [visible, setVisible] = useState(false);
    const [internalValue, setInternalValue] = useState(
      () => (value ?? defaultValue ?? "").toString(),
    );
    const displayValue = value !== undefined ? value : internalValue;
    const floated =
      focused || (typeof displayValue === "string" && displayValue.length > 0);

    return (
      <div className="space-y-1.5">
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
            type={visible ? "text" : "password"}
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
              "h-14 w-full rounded-[20px] border bg-[#FFFCF8] px-5 pt-5 pr-12 pb-2 text-[15px] text-[#2D1E1A] shadow-[inset_0_1px_2px_rgba(45,30,26,0.04)] transition-colors",
              "focus:border-[#B96F5E] focus:outline-none focus:ring-2 focus:ring-[#B96F5E]/20",
              error ? "border-red-400/60" : "border-[#E9DDD4]",
            )}
            {...props}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVisible((v) => !v)}
            className="absolute top-1/2 right-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[#7A665D] transition-colors hover:bg-[#B96F5E]/10 hover:text-[#B96F5E]"
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {error && (
          <p className="px-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);
AuthPasswordField.displayName = "AuthPasswordField";
