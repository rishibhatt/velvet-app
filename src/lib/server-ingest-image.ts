import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseStorageUrl } from "@/lib/supabase-image";
import { isSafeExternalUrl } from "@/lib/url-security";
import type { Database } from "@/types/database.types";

const BUCKET = "velvet-uploads";
const BROWSER_UA =
  "Mozilla/5.0 (compatible; Velvet/1.0; +https://the-velvet.netlify.app)";
const MAX_BYTES = 8 * 1024 * 1024;

type VelvetSupabase = SupabaseClient<Database>;

/** Server-side download, compress, and store a link-preview image in Supabase. */
export async function serverIngestRemoteImage(
  supabase: VelvetSupabase,
  userId: string,
  imageUrl: string,
): Promise<string | null> {
  if (!imageUrl || isSupabaseStorageUrl(imageUrl)) return imageUrl || null;
  if (!isSafeExternalUrl(imageUrl)) return null;

  try {
    const upstream = await fetch(imageUrl, {
      headers: { "User-Agent": BROWSER_UA, Accept: "image/*,*/*;q=0.8" },
      signal: AbortSignal.timeout(12_000),
      redirect: "follow",
    });
    if (!upstream.ok) return null;

    const contentType = upstream.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) return null;

    let bytes = new Uint8Array(await upstream.arrayBuffer());
    if (bytes.byteLength === 0 || bytes.byteLength > MAX_BYTES) return null;

    try {
      const sharp = (await import("sharp")).default;
      const compressed = await sharp(Buffer.from(bytes))
        .rotate()
        .resize(1280, undefined, { withoutEnlargement: true })
        .webp({ quality: 78 })
        .toBuffer();
      bytes = new Uint8Array(compressed);
    } catch {
      /* store original bytes if sharp unavailable */
    }

    const path = `${userId}/items/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, {
      contentType: "image/webp",
      cacheControl: "31536000",
      upsert: false,
    });
    if (error) return null;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  } catch {
    return null;
  }
}
