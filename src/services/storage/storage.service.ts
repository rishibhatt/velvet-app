import imageCompression from "browser-image-compression";
import { isSupabaseStorageUrl } from "@/lib/supabase-image";
import { createClient } from "@/services/supabase/client";

const BUCKET = "velvet-uploads";
const CACHE_CONTROL = "31536000";
const MAX_REMOTE_BYTES = 8 * 1024 * 1024;

const FOLDER_CONFIG = {
  /** 256px — enough for 128px @2x avatars */
  avatars: { maxWidth: 256, maxSizeMB: 0.08, quality: 0.75 },
  banners: { maxWidth: 1200, maxSizeMB: 0.3, quality: 0.8 },
  covers: { maxWidth: 1200, maxSizeMB: 0.3, quality: 0.8 },
  /** Collection grid + detail modal */
  items: { maxWidth: 1280, maxSizeMB: 0.35, quality: 0.78 },
} as const;

export type UploadFolder = keyof typeof FOLDER_CONFIG;

async function validateImageFile(file: File): Promise<void> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please upload an image file.");
  }

  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const isJpeg = header[0] === 0xff && header[1] === 0xd8;
  const isPng =
    header[0] === 0x89 &&
    header[1] === 0x50 &&
    header[2] === 0x4e &&
    header[3] === 0x47;
  const isWebp =
    header[0] === 0x52 &&
    header[1] === 0x49 &&
    header[2] === 0x46 &&
    header[3] === 0x46;
  const isGif = header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46;

  if (!isJpeg && !isPng && !isWebp && !isGif) {
    throw new Error("Unsupported image format. Use JPEG, PNG, WebP, or GIF.");
  }
}

async function runCompression(
  file: File,
  config: (typeof FOLDER_CONFIG)[UploadFolder],
): Promise<File> {
  // Main thread only — web workers load from jsdelivr CDN and violate our CSP.
  return imageCompression(file, {
    maxWidthOrHeight: config.maxWidth,
    maxSizeMB: config.maxSizeMB,
    initialQuality: config.quality,
    useWebWorker: false,
    fileType: "image/webp",
    maxIteration: 12,
  });
}

/** Always returns WebP under size caps — stored in Supabase free tier bucket. */
export async function compressForUpload(
  file: File,
  folder: UploadFolder,
): Promise<File> {
  const config = FOLDER_CONFIG[folder];

  let compressed = await runCompression(file, config);

  if (compressed.size > config.maxSizeMB * 1024 * 1024 * 1.15) {
    try {
      compressed = await imageCompression(compressed, {
        maxWidthOrHeight: Math.round(config.maxWidth * 0.85),
        maxSizeMB: config.maxSizeMB,
        initialQuality: Math.max(0.6, config.quality - 0.1),
        useWebWorker: false,
        fileType: "image/webp",
        maxIteration: 10,
      });
    } catch {
      /* use best effort from first pass */
    }
  }

  return compressed;
}

export async function uploadImage(
  file: File,
  folder: UploadFolder = "items",
  onProgress?: (progress: number) => void,
): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in to upload files.");

  await validateImageFile(file);
  onProgress?.(10);

  const compressed = await compressForUpload(file, folder);
  onProgress?.(60);

  const path = `${user.id}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, compressed, {
      cacheControl: CACHE_CONTROL,
      upsert: false,
      contentType: "image/webp",
    });

  if (uploadError) throw uploadError;
  onProgress?.(100);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Download a link-preview image, compress, and store in Supabase.
 * Returns null on failure so callers can fall back to the external URL.
 */
export async function ingestRemoteImage(
  imageUrl: string,
  folder: UploadFolder = "items",
): Promise<string | null> {
  if (!imageUrl || isSupabaseStorageUrl(imageUrl)) {
    return imageUrl || null;
  }

  try {
    const proxyRes = await fetch("/api/images/proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: imageUrl }),
    });

    if (!proxyRes.ok) return null;

    const blob = await proxyRes.blob();
    if (blob.size === 0 || blob.size > MAX_REMOTE_BYTES) return null;

    const type = blob.type.startsWith("image/") ? blob.type : "image/jpeg";
    const file = new File([blob], "remote-preview", { type });
    return await uploadImage(file, folder);
  } catch {
    return null;
  }
}
