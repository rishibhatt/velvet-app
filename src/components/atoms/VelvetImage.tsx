"use client";

import { useCallback, useState } from "react";
import Image, { type ImageProps } from "next/image";
import { canUseNextImage } from "@/lib/remote-image";
import {
  getSupabasePublicUrl,
  getSupabaseTransformUrl,
  isSupabaseStorageUrl,
  supabaseTransformsEnabled,
} from "@/lib/supabase-image";
import { cn } from "@/lib/utils";

const OPTIMIZED_HOSTS = new Set([
  "lh3.googleusercontent.com",
  "images.unsplash.com",
]);

function resolveImageWidth(sizes?: string, width?: number | `${number}`): number {
  if (typeof width === "number") return width;
  if (sizes?.includes("800")) return 800;
  if (sizes?.includes("400") || sizes?.includes("33vw")) return 400;
  return 800;
}

function resolveSrc(
  src: string,
  options: { width?: number | `${number}`; sizes?: string; quality?: number },
): string {
  if (isSupabaseStorageUrl(src)) {
    const transformWidth = resolveImageWidth(options.sizes, options.width);
    return getSupabaseTransformUrl(src, {
      width: transformWidth,
      quality: options.quality ?? 80,
    });
  }
  return src;
}

/** Supabase public URLs work on all plans; use native img to skip Next optimizer issues in dev. */
function shouldBypassOptimization(src: string): boolean {
  if (src.startsWith("blob:") || src.startsWith("data:")) return true;
  try {
    const host = new URL(src).hostname;
    if (host.endsWith(".supabase.co") || host === "supabase.co") return true;
    return !OPTIMIZED_HOSTS.has(host);
  } catch {
    return false;
  }
}

/**
 * Drop-in next/image wrapper for user content (boards, items, avatars).
 * Supabase uploads use direct public URLs by default; enable transforms on Pro via env.
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
  quality,
  ...props
}: ImageProps) {
  const srcString = typeof src === "string" ? src : "";
  const [useOriginal, setUseOriginal] = useState(false);

  const displaySrc = srcString
    ? useOriginal
      ? getSupabasePublicUrl(srcString)
      : resolveSrc(srcString, {
          width,
          sizes,
          quality: typeof quality === "number" ? quality : undefined,
        })
    : "";

  const handleError = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
      if (
        !useOriginal &&
        supabaseTransformsEnabled() &&
        isSupabaseStorageUrl(srcString)
      ) {
        setUseOriginal(true);
        return;
      }
      onError?.(event);
    },
    [onError, srcString, useOriginal],
  );

  if (!srcString) return null;

  if (!canUseNextImage(displaySrc)) {
    if (fill) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={displaySrc}
          alt={alt}
          className={cn("absolute inset-0 h-full w-full", className)}
          onError={handleError}
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
        width={typeof width === "number" ? width : undefined}
        height={typeof height === "number" ? height : undefined}
        onError={handleError}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    );
  }

  const bypass =
    unoptimized ?? (displaySrc ? shouldBypassOptimization(displaySrc) : false);

  return (
    <Image
      src={displaySrc}
      alt={alt}
      unoptimized={bypass}
      className={className}
      fill={fill}
      width={width}
      height={height}
      priority={priority}
      sizes={sizes}
      quality={quality}
      onError={handleError}
      {...props}
    />
  );
}
