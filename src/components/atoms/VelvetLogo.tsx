"use client";

import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/constants/brand";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export type VelvetLogoVariant = "nav" | "auth" | "footer" | "inline";

const VARIANTS: Record<
  VelvetLogoVariant,
  {
    iconSize: number;
    iconSrc: string;
    sizeClass: string;
    rounded: string;
    wordClass: string;
    gap: string;
    wordmarkResponsive?: boolean;
  }
> = {
  nav: {
    iconSize: 56,
    iconSrc: BRAND.logo.nav128,
    sizeClass: "h-[52px] w-[52px] sm:h-14 sm:w-14",
    rounded: "rounded-[13px] sm:rounded-[14px]",
    wordClass: "text-xl sm:text-2xl md:text-[1.65rem]",
    gap: "gap-2.5 sm:gap-3",
    wordmarkResponsive: true,
  },
  auth: {
    iconSize: 88,
    iconSrc: BRAND.logo.nav128,
    sizeClass: "h-[5.5rem] w-[5.5rem] sm:h-24 sm:w-24",
    rounded: "rounded-2xl",
    wordClass: "text-3xl sm:text-4xl",
    gap: "gap-3.5 sm:gap-4",
  },
  footer: {
    iconSize: 52,
    iconSrc: BRAND.logo.nav96,
    sizeClass: "h-[3.25rem] w-[3.25rem]",
    rounded: "rounded-[12px]",
    wordClass: "text-xl",
    gap: "gap-2.5",
  },
  inline: {
    iconSize: 48,
    iconSrc: BRAND.logo.nav96,
    sizeClass: "h-12 w-12",
    rounded: "rounded-[11px]",
    wordClass: "text-lg",
    gap: "gap-2.5",
  },
};

export interface VelvetLogoProps {
  variant?: VelvetLogoVariant;
  href?: string | null;
  className?: string;
  iconOnly?: boolean;
  priority?: boolean;
}

export function VelvetLogo({
  variant = "nav",
  href = ROUTES.home,
  className,
  iconOnly = false,
  priority = false,
}: VelvetLogoProps) {
  const cfg = VARIANTS[variant];

  const mark = (
    <Image
      src={cfg.iconSrc}
      alt={iconOnly ? BRAND.name : ""}
      width={cfg.iconSize}
      height={cfg.iconSize}
      priority={priority}
      className={cn("shrink-0 object-cover", cfg.sizeClass, cfg.rounded)}
      sizes={`(max-width: 640px) 52px, ${cfg.iconSize}px`}
    />
  );

  const wordmark = (
    <span
      className={cn(
        "font-display leading-none tracking-tight text-primary",
        cfg.wordClass,
        iconOnly && "sr-only",
        !iconOnly && cfg.wordmarkResponsive && "hidden sm:inline",
      )}
    >
      {BRAND.name}
    </span>
  );

  const inner = (
    <span className={cn("inline-flex items-center", cfg.gap)}>
      {mark}
      {wordmark}
      {iconOnly && <span className="sr-only">{BRAND.name}</span>}
    </span>
  );

  const rootClass = cn("inline-flex shrink-0 items-center", className);

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          rootClass,
          "rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        )}
      >
        {inner}
      </Link>
    );
  }

  return <span className={rootClass}>{inner}</span>;
}
