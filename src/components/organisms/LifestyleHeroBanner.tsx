"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { cn } from "@/lib/utils";

const HERO_IMAGE = "/images/hero-lifestyle.png";

interface LifestyleHeroBannerProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle: string;
  footer?: ReactNode;
  className?: string;
}

export function LifestyleHeroBanner({
  eyebrow,
  title,
  subtitle,
  footer,
  className,
}: LifestyleHeroBannerProps) {
  return (
    <motion.section
      className={cn("velvet-hero-banner mb-6 sm:mb-8", className)}
      {...fadeUp}
    >
      <div className="velvet-hero-banner__inner relative flex flex-col overflow-hidden lg:min-h-[240px] lg:flex-row lg:items-stretch">
        <div className="relative z-10 flex flex-1 flex-col justify-center px-5 py-5 sm:px-8 sm:py-8 lg:max-w-[56%] lg:px-10 lg:py-9">
          {eyebrow}
          <div className="mt-0">{title}</div>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-[#6f6a63] sm:mt-3 sm:text-[15px] lg:text-base">
            {subtitle}
          </p>
          {footer ? <div className="mt-5 sm:mt-6">{footer}</div> : null}
        </div>

        <div className="velvet-hero-banner__media relative mx-auto h-40 w-full max-w-md shrink-0 sm:h-64 sm:max-w-lg lg:absolute lg:right-0 lg:bottom-0 lg:top-0 lg:mx-0 lg:h-full lg:max-w-none lg:w-[44%] xl:w-[42%]">
          <Image
            src={HERO_IMAGE}
            alt=""
            width={800}
            height={640}
            priority
            unoptimized
            className="h-full w-full object-contain object-bottom lg:object-right-bottom"
          />
          <div
            className="velvet-hero-banner__fade pointer-events-none absolute inset-y-0 left-0 hidden lg:block"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-[var(--hero-surface)] to-transparent lg:hidden"
            aria-hidden
          />
        </div>
      </div>
    </motion.section>
  );
}
