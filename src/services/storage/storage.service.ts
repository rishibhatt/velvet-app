import imageCompression from "browser-image-compression";
import { createClient } from "@/services/supabase/client";

const BUCKET = "velvet-uploads";
const CACHE_CONTROL = "31536000";

const FOLDER_CONFIG = {
  avatars: { maxWidth: 512, maxSizeMB: 0.2, quality: 0.8 },
  banners: { maxWidth: 1200, maxSizeMB: 0.35, quality: 0.82 },
  covers: { maxWidth: 1200, maxSizeMB: 0.35, quality: 0.82 },
  items: { maxWidth: 1920, maxSizeMB: 0.5, quality: 0.85 },
} as const;

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

async function compressForUpload(
  file: File,
  folder: keyof typeof FOLDER_CONFIG,
): Promise<File> {
  const config = FOLDER_CONFIG[folder];
  return imageCompression(file, {
    maxWidthOrHeight: config.maxWidth,
    maxSizeMB: config.maxSizeMB,
    initialQuality: config.quality,
    useWebWorker: true,
    fileType: "image/webp",
  });
}

export async function uploadImage(
  file: File,
  folder: "items" | "avatars" | "covers" | "banners" = "items",
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
