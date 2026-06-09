"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { AuthCard } from "./AuthCard";
import { cn } from "@/lib/utils";

const AuthHero = dynamic(() => import("./AuthHero").then((m) => ({ default: m.AuthHero })), {
  ssr: false,
  loading: () => <div className="h-48 w-full bg-surface-container-low sm:h-56 lg:min-h-[320px] lg:h-full" />,
});

interface AuthLayoutProps {
  children: ReactNode;
  /** Center content for success / illustration states */
  centered?: boolean;
  className?: string;
}

export function AuthLayout({ children, centered = false, className }: AuthLayoutProps) {
  return (
    <div className={cn("min-h-screen bg-[#FFFCF8]", className)}>
      <div className="lg:flex lg:min-h-screen">
        {/* Desktop hero — 55% */}
        <aside className="relative hidden lg:block lg:w-[55%] lg:shrink-0">
          <AuthHero variant="desktop" />
        </aside>

        {/* Auth panel — 45% */}
        <div className="flex min-h-screen flex-1 flex-col lg:w-[45%] lg:min-h-0">
          {/* Mobile hero */}
          <AuthHero variant="mobile" className="lg:hidden" />

          <div
            className={cn(
              "flex flex-1 flex-col px-4 pb-10 sm:px-6 lg:items-center lg:justify-center lg:px-12 lg:py-12",
              centered && "lg:justify-center",
            )}
          >
            <div className="w-full lg:flex lg:justify-center">
              <AuthCard>{children}</AuthCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
