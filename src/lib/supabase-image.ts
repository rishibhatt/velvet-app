const BUCKET = "velvet-uploads";

/** Image transforms require Supabase Pro — opt in via env. */
export function supabaseTransformsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_SUPABASE_IMAGE_TRANSFORMS === "true";
}

/** Strip transform URL back to the original public object URL. */
export function getSupabasePublicUrl(src: string): string {
  try {
    const url = new URL(src);
    const renderMarker = `/storage/v1/render/image/public/${BUCKET}/`;
    const objectMarker = `/storage/v1/object/public/${BUCKET}/`;

    const renderIdx = url.pathname.indexOf(renderMarker);
    if (renderIdx !== -1) {
      const objectPath = url.pathname.slice(renderIdx + renderMarker.length);
      url.pathname = objectMarker + objectPath;
      url.search = "";
      return url.toString();
    }

    return src;
  } catch {
    return src;
  }
}

/** Build a Supabase Image Transformation URL for resized delivery (Pro only). */
export function getSupabaseTransformUrl(
  publicUrl: string,
  options: { width?: number; quality?: number } = {},
): string {
  if (!supabaseTransformsEnabled()) return publicUrl;

  const { width = 800, quality = 80 } = options;

  try {
    const url = new URL(publicUrl);
    if (!url.hostname.endsWith(".supabase.co")) return publicUrl;

    const marker = `/storage/v1/object/public/${BUCKET}/`;
    const idx = url.pathname.indexOf(marker);
    if (idx === -1) return publicUrl;

    const objectPath = url.pathname.slice(idx + marker.length);
    const renderPath = `/storage/v1/render/image/public/${BUCKET}/${objectPath}`;
    const renderUrl = new URL(renderPath, url.origin);
    renderUrl.searchParams.set("width", String(width));
    renderUrl.searchParams.set("quality", String(quality));
    return renderUrl.toString();
  } catch {
    return publicUrl;
  }
}

export function isSupabaseStorageUrl(src: string): boolean {
  try {
    const url = new URL(src);
    return (
      (url.hostname.endsWith(".supabase.co") || url.hostname === "supabase.co") &&
      url.pathname.includes(`/storage/v1/object/public/${BUCKET}/`)
    );
  } catch {
    return false;
  }
}
