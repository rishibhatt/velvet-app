"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthPrimaryButtonProps {
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export function AuthPrimaryButton({
  children,
  className,
  loading,
  disabled,
  type = "submit",
  ...props
}: AuthPrimaryButtonProps) {
  return (
    <motion.button
      type={type}
      whileHover={{ y: disabled || loading ? 0 : -2 }}
      whileTap={{ scale: 0.98 }}
      disabled={disabled || loading}
      className={cn(
        "flex h-14 w-full items-center justify-center gap-2 rounded-[20px] bg-[#B96F5E] text-base font-semibold text-white shadow-[0_8px_24px_rgba(185,111,94,0.35)] transition-colors",
        "hover:bg-[#a86354] disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : null}
      {children}
    </motion.button>
  );
}
