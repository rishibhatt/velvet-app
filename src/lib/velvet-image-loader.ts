import type { ImageLoaderProps } from "next/image";
import { isSupabaseStorageUrl } from "@/lib/supabase-image";

/** Bust CDN / Next image cache after an item preview changes. */
export function createVelvetImageLoader(revision?: string) {
  return ({ src, width, quality }: ImageLoaderProps): string => {
    if (isSupabaseStorageUrl(src)) {
      const params = new URLSearchParams({
        url: src,
        w: String(width),
        q: String(quality ?? 70),
      });
      if (revision) params.set("v", revision);
      return `/api/images/display?${params}`;
    }

    const encoded = encodeURIComponent(src);
    const revisionParam = revision ? `&v=${encodeURIComponent(revision)}` : "";
    return `/_next/image?url=${encoded}&w=${width}&q=${quality ?? 75}${revisionParam}`;
  };
}

/** @deprecated Use createVelvetImageLoader — default loader without revision. */
export function velvetImageLoader(props: ImageLoaderProps): string {
  return createVelvetImageLoader()(props);
}
