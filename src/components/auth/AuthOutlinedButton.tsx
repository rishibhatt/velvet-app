"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AuthOutlinedButtonProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export function AuthOutlinedButton({
  children,
  className,
  disabled,
  ...props
}: AuthOutlinedButtonProps) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: disabled ? 0 : -2 }}
      whileTap={{ scale: 0.98 }}
      disabled={disabled}
      className={cn(
        "flex h-14 w-full items-center justify-center gap-2.5 rounded-[20px] border border-[#E9DDD4] bg-[#FFFCF8] text-base font-semibold text-[#2D1E1A] shadow-[0_4px_16px_rgba(45,30,26,0.04)]",
        "hover:border-[#B96F5E]/40 hover:bg-white disabled:opacity-60",
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
