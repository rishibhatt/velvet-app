import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseStorageUrl } from "@/lib/supabase-image";
import { isSafeExternalUrl } from "@/lib/url-security";
import type { Database } from "@/types/database.types";

const BUCKET = "velvet-uploads";
const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
const MAX_BYTES = 8 * 1024 * 1024;

function looksLikeImage(bytes: Uint8Array): boolean {
  if (bytes.byteLength < 4) return false;
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return true;
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return true;
  }
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return true;
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
    return true;
  }
  return false;
}

type VelvetSupabase = SupabaseClient<Database>;

export type ServerIngestDebug = {
  requestedUrl: string;
  referer: string | null;
  upstreamUrl?: string;
  contentType?: string;
  byteLength?: number;
  storedUrl?: string | null;
  failedAt?: string;
};

/** Server-side download, compress, and store a link-preview image in Supabase. */
export async function serverIngestRemoteImage(
  supabase: VelvetSupabase,
  userId: string,
  imageUrl: string,
  options: { referer?: string; onDebug?: (debug: ServerIngestDebug) => void } = {},
): Promise<string | null> {
  if (!imageUrl || isSupabaseStorageUrl(imageUrl)) return imageUrl || null;
  if (!isSafeExternalUrl(imageUrl)) return null;

  const referer =
    options.referer && isSafeExternalUrl(options.referer)
      ? options.referer
      : undefined;

  try {
    const debug: ServerIngestDebug = {
      requestedUrl: imageUrl,
      referer: referer ?? null,
    };
    const upstream = await fetch(imageUrl, {
      headers: {
        "User-Agent": BROWSER_UA,
        Accept: "image/*,*/*;q=0.8",
        ...(referer ? { Referer: referer } : {}),
      },
      signal: AbortSignal.timeout(12_000),
      redirect: "follow",
    });
    debug.upstreamUrl = upstream.url;
    if (!upstream.ok) {
      debug.failedAt = `upstream:${upstream.status}`;
      options.onDebug?.(debug);
      return null;
    }

    let bytes = new Uint8Array(await upstream.arrayBuffer());
    debug.byteLength = bytes.byteLength;
    if (bytes.byteLength === 0 || bytes.byteLength > MAX_BYTES) {
      debug.failedAt = "byte-size";
      options.onDebug?.(debug);
      return null;
    }

    const contentType = upstream.headers.get("content-type") ?? "";
    debug.contentType = contentType;
    if (!contentType.startsWith("image/") && !looksLikeImage(bytes)) {
      debug.failedAt = "not-image";
      options.onDebug?.(debug);
      return null;
    }

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
    if (error) {
      debug.failedAt = "upload";
      options.onDebug?.(debug);
      return null;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    debug.storedUrl = data.publicUrl;
    options.onDebug?.(debug);
    return data.publicUrl;
  } catch {
    options.onDebug?.({
      requestedUrl: imageUrl,
      referer: referer ?? null,
      failedAt: "exception",
    });
    return null;
  }
}
