"use client";

import type { FormHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuthFormProps extends FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode;
}

export function AuthForm({ children, className, ...props }: AuthFormProps) {
  return (
    <form className={cn("space-y-5", className)} {...props}>
      {children}
    </form>
  );
}
