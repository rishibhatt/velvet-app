"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface AuthFooterProps {
  children: ReactNode;
  className?: string;
}

export function AuthFooter({ children, className }: AuthFooterProps) {
  return (
    <p className={cn("text-center text-sm text-[#7A665D]", className)}>
      {children}
    </p>
  );
}

interface AuthFooterLinkProps {
  href: string;
  children: ReactNode;
}

export function AuthFooterLink({ href, children }: AuthFooterLinkProps) {
  return (
    <Link
      href={href}
      className="font-semibold text-[#B96F5E] underline-offset-4 hover:underline"
    >
      {children}
    </Link>
  );
}
