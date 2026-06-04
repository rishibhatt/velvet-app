"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useNavigationProgress } from "@/providers/NavigationProgressProvider";

type VelvetLinkProps = ComponentProps<typeof Link>;

/** Link with a subtle top progress bar while the next route loads. */
export function VelvetLink({
  className,
  onClick,
  href,
  ...props
}: VelvetLinkProps) {
  const { startNavigation } = useNavigationProgress();

  return (
    <Link
      href={href}
      className={className}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        const target = e.currentTarget;
        const url = typeof href === "string" ? href : target.getAttribute("href");
        if (!url || url.startsWith("#") || target.target === "_blank") return;
        startNavigation();
      }}
      {...props}
    />
  );
}
