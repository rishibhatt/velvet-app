"use client";

import { useState } from "react";
import { VelvetImage } from "@/components/atoms/VelvetImage";
import { cn } from "@/lib/utils";
import { getInitials } from "@/utils/format";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: { box: "h-8 w-8", text: "text-[10px]" },
  md: { box: "h-10 w-10", text: "text-xs" },
  lg: { box: "h-12 w-12", text: "text-sm" },
  xl: { box: "h-24 w-24", text: "text-lg" },
};

export function Avatar({ src, alt, name, size = "md", className }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const dims = sizeMap[size];
  const showImage = Boolean(src) && !failed;

  if (showImage && src) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-full ring-2 ring-surface bg-surface-container",
          dims.box,
          className,
        )}
      >
        <VelvetImage
          src={src}
          alt={alt ?? name ?? "Avatar"}
          fill
          className="object-cover"
          sizes={size === "sm" ? "32px" : size === "xl" ? "96px" : "48px"}
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary-container font-bold text-on-primary-container ring-2 ring-surface",
        dims.box,
        dims.text,
        className,
      )}
      aria-label={name ?? "User avatar"}
    >
      {getInitials(name)}
    </div>
  );
}
