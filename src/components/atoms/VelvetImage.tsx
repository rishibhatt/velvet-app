"use client";

import Image, { type ImageProps } from "next/image";
import { canUseNextImage } from "@/lib/remote-image";
import {
  optimizeImageUrlForDisplay,
  resolveImageWidth,
} from "@/lib/optimize-image-url";
import { cn } from "@/lib/utils";

/**
 * User images: WebP in Supabase Storage on upload; Next.js Image resizes to `sizes` at request time.
 * Blob/data URLs and hosts outside the allowlist use a native `<img>`.
 */
export function VelvetImage({
  src,
  alt = "",
  unoptimized,
  onError,
  className,
  fill,
  width,
  height,
  priority,
  sizes,
  quality = 70,
  ...props
}: ImageProps) {
  const srcString = typeof src === "string" ? src : "";
  const targetWidth = resolveImageWidth(sizes, width);
  const numericQuality = typeof quality === "number" ? quality : 70;

  const displaySrc = srcString
    ? optimizeImageUrlForDisplay(srcString, { width: targetWidth })
    : "";

  if (!srcString) return null;

  const isBlobOrData =
    displaySrc.startsWith("blob:") || displaySrc.startsWith("data:");
  const useNativeImg = isBlobOrData || !canUseNextImage(displaySrc);
  const bypassNextOptimizer = unoptimized === true || useNativeImg;

  if (bypassNextOptimizer) {
    if (fill) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={displaySrc}
          alt={alt}
          className={cn("absolute inset-0 h-full w-full", className)}
          onError={onError}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />
      );
    }

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={displaySrc}
        alt={alt}
        className={className}
        width={typeof width === "number" ? width : targetWidth}
        height={typeof height === "number" ? height : undefined}
        onError={onError}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    );
  }

  return (
    <Image
      src={displaySrc}
      alt={alt}
      className={className}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      priority={priority}
      sizes={sizes}
      quality={numericQuality}
      onError={onError}
      {...props}
    />
  );
}
