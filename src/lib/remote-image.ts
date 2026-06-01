/** Hosts allowed in next.config.ts `images.remotePatterns`. */
const NEXT_IMAGE_EXACT_HOSTS = new Set([
  "lh3.googleusercontent.com",
  "images.unsplash.com",
  "i.ytimg.com",
]);

/** Whether `next/image` may load this URL (hostname allowlist). */
export function canUseNextImage(src: string): boolean {
  if (!src || src.startsWith("blob:") || src.startsWith("data:")) return true;
  try {
    const host = new URL(src).hostname;
    if (NEXT_IMAGE_EXACT_HOSTS.has(host)) return true;
    if (host.endsWith(".googleusercontent.com")) return true;
    if (host.endsWith(".supabase.co") || host === "supabase.co") return true;
    return false;
  } catch {
    return false;
  }
}
