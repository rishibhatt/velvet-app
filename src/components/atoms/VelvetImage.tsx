"use client";

import Image, { type ImageProps } from "next/image";

/** Hosts that must bypass Next image optimization (Supabase CDN resolves to private IPs locally). */
function shouldBypassOptimization(src: string): boolean {
  if (src.startsWith("blob:") || src.startsWith("data:")) return true;
  try {
    const host = new URL(src).hostname;
    return host.endsWith(".supabase.co") || host === "supabase.co";
  } catch {
    return false;
  }
}

/**
 * Drop-in next/image wrapper that shows Supabase Storage and upload previews reliably.
 */
export function VelvetImage({ src, alt = "", unoptimized, ...props }: ImageProps) {
  const srcString = typeof src === "string" ? src : "";
  const bypass =
    unoptimized ?? (srcString ? shouldBypassOptimization(srcString) : false);

  if (!srcString) return null;

  return (
    <Image
      src={src}
      alt={alt}
      unoptimized={bypass}
      {...props}
    />
  );
}
