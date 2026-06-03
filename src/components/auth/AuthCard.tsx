"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { authPageTransition } from "./auth-motion";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  children: ReactNode;
  className?: string;
}

export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <motion.div
      {...authPageTransition}
      className={cn(
        "relative z-20 w-full max-w-[480px]",
        "mx-auto rounded-[28px] border border-[#E9DDD4] bg-[#FAF7F2] p-6 shadow-[0_16px_48px_rgba(45,30,26,0.08)]",
        "sm:p-8",
        "lg:mx-0 lg:max-w-[480px] lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none",
        "-mt-8 lg:mt-0",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
