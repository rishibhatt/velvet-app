"use client";

import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface DiscoverSectionHeaderProps {
  title?: string;
  subtitle?: string;
  showSeeAll?: boolean;
  className?: string;
}

export function DiscoverSectionHeader({
  title = "Discover",
  subtitle = "Trending public collections from the community",
  showSeeAll = true,
  className,
}: DiscoverSectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-5 flex items-end justify-between gap-3 sm:mb-6",
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="font-display flex items-center gap-2 text-xl text-on-surface sm:text-2xl">
          <Sparkles className="h-5 w-5 shrink-0 text-primary" aria-hidden />
          {title}
        </h2>
        <p className="mt-1 text-sm text-on-surface-variant sm:text-[15px]">
          {subtitle}
        </p>
      </div>
      {showSeeAll && (
        <Link
          href={ROUTES.explore}
          className="flex shrink-0 items-center gap-0.5 rounded-full px-2 py-1 text-sm font-semibold text-primary transition-colors hover:bg-primary-fixed/40"
        >
          See all
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
