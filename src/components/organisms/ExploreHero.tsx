"use client";

import { Sparkles } from "lucide-react";
import { LifestyleHeroBanner } from "@/components/organisms/LifestyleHeroBanner";

export function ExploreHero() {
  return (
    <LifestyleHeroBanner
      eyebrow={
        <p className="velvet-eyebrow flex items-center gap-1.5 text-[#6b3d32]">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Discover
        </p>
      }
      title={
        <h1 className="text-[1.65rem] leading-[1.12] sm:text-4xl lg:text-[2.5rem]">
          <span className="velvet-hero-title-strong">Explore </span>
          <span className="velvet-hero-title-soft text-[1.55rem] sm:text-[2.25rem] lg:text-[2.35rem]">
            public collections
          </span>
        </h1>
      }
      subtitle="Browse inspiration from the Velvet community - filter by mood or see what's trending right now."
    />
  );
}
