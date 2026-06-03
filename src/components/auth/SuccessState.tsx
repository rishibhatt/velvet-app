"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { authSuccessScale } from "./auth-motion";
import { cn } from "@/lib/utils";

interface SuccessStateProps {
  icon: ReactNode;
  headline: string;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function SuccessState({
  icon,
  headline,
  description,
  children,
  className,
}: SuccessStateProps) {
  return (
    <motion.div
      {...authSuccessScale}
      className={cn("text-center", className)}
    >
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#E9DDD4] bg-[#FFFCF8] shadow-[0_8px_32px_rgba(45,30,26,0.06)]">
        {icon}
      </div>
      <h2 className="font-display text-3xl text-[#2D1E1A] sm:text-4xl">{headline}</h2>
      {description && (
        <div className="mt-3 text-base leading-relaxed text-[#7A665D]">{description}</div>
      )}
      {children && <div className="mt-8 space-y-3">{children}</div>}
    </motion.div>
  );
}
