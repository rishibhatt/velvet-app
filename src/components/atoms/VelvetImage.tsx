"use client";

import Image, { type ImageProps } from "next/image";
import { canUseNextImage } from "@/lib/remote-image";
import { cn } from "@/lib/utils";

const OPTIMIZED_HOSTS = new Set([
  "lh3.googleusercontent.com",
  "images.unsplash.com",
]);

/** Bypass optimization for Supabase, blobs, and social link-preview CDNs. */
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
 * Arbitrary link-preview hosts (Pinterest, Instagram, etc.) use a native img
 * so we do not need every CDN in next.config.
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
  ...props
}: ImageProps) {
  const srcString = typeof src === "string" ? src : "";

  if (!srcString) return null;

  if (!canUseNextImage(srcString)) {
    if (fill) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={srcString}
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
        src={srcString}
        alt={alt}
        className={className}
        width={typeof width === "number" ? width : undefined}
        height={typeof height === "number" ? height : undefined}
        onError={onError}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    );
  }

  const bypass =
    unoptimized ?? (srcString ? shouldBypassOptimization(srcString) : false);

  return (
    <Image
      src={src}
      alt={alt}
      unoptimized={bypass}
      className={className}
      fill={fill}
      width={width}
      height={height}
      priority={priority}
      onError={onError}
      {...props}
    />
  );
}
