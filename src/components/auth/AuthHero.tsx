"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { AUTH_HERO_IMAGE, AUTH_STATS } from "@/constants/auth";
import { cn } from "@/lib/utils";

interface AuthHeroProps {
  variant?: "desktop" | "mobile";
  className?: string;
}

export function AuthHero({ variant = "desktop", className }: AuthHeroProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);

  const isMobile = variant === "mobile";

  return (
    <div
      ref={ref}
      className={cn(
        "relative overflow-hidden",
        isMobile
          ? "h-[220px] w-full shrink-0 rounded-b-[28px]"
          : "h-full min-h-screen w-full",
        className,
      )}
    >
      <motion.div className="absolute inset-0" style={isMobile ? undefined : { y: parallaxY }}>
        <motion.div
          className="relative h-full w-full"
          animate={{ scale: [1, 1.05] }}
          transition={{ duration: 15, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        >
          <Image
            src={AUTH_HERO_IMAGE}
            alt="Inspiration starts with a single idea — Velvet"
            fill
            priority
            className={cn(
              "object-cover",
              isMobile ? "object-[18%_center]" : "object-[12%_center]",
            )}
            sizes={isMobile ? "100vw" : "55vw"}
          />
        </motion.div>
      </motion.div>

      {/* Warm ivory overlay — no darkening */}
      <div
        className="pointer-events-none absolute inset-0 bg-[#FFFCF8]/25"
        aria-hidden
      />

      {!isMobile && (
        <>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#FFFCF8]/50 via-transparent to-transparent" />
          <div className="relative z-10 flex h-full flex-col justify-end p-10 xl:p-14">
            <div className="flex flex-wrap gap-3">
              {AUTH_STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.35 + i * 0.1,
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="rounded-[20px] border border-[#E9DDD4]/80 bg-[#FFFCF8]/90 px-5 py-3.5 shadow-[0_8px_32px_rgba(45,30,26,0.06)] backdrop-blur-sm"
                >
                  <p className="font-display text-2xl text-[#2D1E1A]">{stat.value}</p>
                  <p className="mt-0.5 text-xs font-medium text-[#7A665D]">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
