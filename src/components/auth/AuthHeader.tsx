"use client";

import { VelvetLogo } from "@/components/atoms/VelvetLogo";
import { cn } from "@/lib/utils";

interface AuthHeaderProps {
  headline: string;
  subtext?: string;
  align?: "left" | "center";
  showLogo?: boolean;
  className?: string;
}

export function AuthHeader({
  headline,
  subtext,
  align = "left",
  showLogo = true,
  className,
}: AuthHeaderProps) {
  const centered = align === "center";

  return (
    <header className={cn("mb-8", centered && "text-center", className)}>
      {showLogo && (
        <div className={cn("mb-6", centered && "flex justify-center")}>
          <VelvetLogo variant="auth" href={null} priority />
        </div>
      )}
      <h1
        className={cn(
          "font-display text-[1.75rem] leading-[1.12] text-[#2D1E1A] sm:text-4xl",
          centered && "text-center",
        )}
      >
        {headline}
      </h1>
      {subtext && (
        <p
          className={cn(
            "mt-2 text-base leading-relaxed text-[#7A665D]",
            centered && "text-center",
          )}
        >
          {subtext}
        </p>
      )}
    </header>
  );
}
