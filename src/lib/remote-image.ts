/** Hosts allowed in next.config.ts `images.remotePatterns`. */
const NEXT_IMAGE_EXACT_HOSTS = new Set([
  "lh3.googleusercontent.com",
  "yt3.googleusercontent.com",
  "images.unsplash.com",
  "i.ytimg.com",
  "maps.google.com",
  "s.microlink.io",
]);

const NEXT_IMAGE_HOST_SUFFIXES = [
  ".googleusercontent.com",
  ".supabase.co",
  ".cdninstagram.com",
  ".fbcdn.net",
  ".twimg.com",
  ".redd.it",
  ".pinimg.com",
  ".pinterest.com",
  ".media-amazon.com",
];

/** Channel avatars on this host often time out via the Next.js image optimizer. */
function isSlowGoogleImageHost(host: string): boolean {
  return host === "yt3.googleusercontent.com";
}

/** Whether `next/image` may load this URL (hostname allowlist). */
export function canUseNextImage(src: string): boolean {
  if (!src || src.startsWith("blob:") || src.startsWith("data:")) return true;
  try {
    const host = new URL(src).hostname;
    if (isSlowGoogleImageHost(host)) return false;
    if (NEXT_IMAGE_EXACT_HOSTS.has(host)) return true;
    if (host.endsWith(".supabase.co") || host === "supabase.co") return true;
    return NEXT_IMAGE_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix));
  } catch {
    return false;
  }
}
