import type { ImageLoaderProps } from "next/image";
import { isSupabaseStorageUrl } from "@/lib/supabase-image";

/**
 * Supabase Storage → same-origin display API (avoids Next optimizer private-IP DNS blocks).
 * Other allowlisted hosts → default `/_next/image` optimizer.
 */
export function velvetImageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  if (isSupabaseStorageUrl(src)) {
    const params = new URLSearchParams({
      url: src,
      w: String(width),
      q: String(quality ?? 70),
    });
    return `/api/images/display?${params}`;
  }

  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality ?? 75}`;
}
