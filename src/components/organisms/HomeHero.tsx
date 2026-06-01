"use client";

import { Sparkles } from "lucide-react";
import { LifestyleHeroBanner } from "@/components/organisms/LifestyleHeroBanner";

interface HomeHeroProps {
  greeting: string;
}

export function HomeHero({ greeting }: HomeHeroProps) {
  return (
    <LifestyleHeroBanner
      eyebrow={
        <p className="velvet-eyebrow flex items-center gap-1.5 text-[#6b3d32]">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Welcome back
        </p>
      }
      title={
        <h1 className="velvet-hero-title-strong text-[1.65rem] leading-[1.12] sm:text-4xl lg:text-[2.65rem]">
          {greeting}
        </h1>
      }
      subtitle="Your creative space is ready for today&apos;s inspiration."
    />
  );
}
