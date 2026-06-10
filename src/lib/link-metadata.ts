import type { ItemSource } from "@/types/board.types";
import {
  extractInstagramUsername,
  formatInstagramProfileTitle,
  isInstagramProfileUrl,
  parseInstagramEmbeddedData,
} from "@/lib/instagram-profile";
import { isWeakPreviewImage } from "@/lib/item-preview";
import {
  extractYouTubeVideoId,
  isYouTubeChannelUrl,
  isYouTubeVideoUrl,
  optimizeStoredImageUrl,
  youTubeThumbnailUrl,
} from "@/lib/optimize-image-url";

export { extractYouTubeVideoId } from "@/lib/optimize-image-url";

export interface ParsedLinkMetadata {
  title: string;
  imageUrl: string | null;
  description: string | null;
  source: ItemSource;
}

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const EMPTY_META = { title: null, imageUrl: null, description: null };

export function detectSourceFromUrl(url: string): ItemSource {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    if (hostname.includes("instagram")) return "instagram";
    if (hostname.includes("youtube") || hostname === "youtu.be") return "youtube";
    if (
      hostname.includes("amazon") ||
      hostname === "amzn.to" ||
      hostname === "amzn.in" ||
      hostname === "a.co"
    ) {
      return "amazon";
    }
    if (hostname.includes("pinterest") || hostname === "pin.it") return "pinterest";
    return "web";
  } catch {
    return "web";
  }
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16)),
    )
    .trim();
}

/** Short links (amzn.in, amzn.to) must be expanded before metadata APIs run. */
async function resolveCanonicalUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: HTML_FETCH_HEADERS,
      redirect: "follow",
      signal: AbortSignal.timeout(12000),
    });
    return response.url || url;
  } catch {
    return url;
  }
}

function isAmazonUrl(url: string): boolean {
  return detectSourceFromUrl(url) === "amazon";
}

/** Reads og/twitter meta regardless of attribute order. */
export function parseHtmlMetadata(html: string): {
  title: string | null;
  imageUrl: string | null;
  description: string | null;
} {
  const readMeta = (keys: string[]): string | null => {
    for (const key of keys) {
      const patterns = [
        new RegExp(
          `<meta[^>]*(?:property|name)=["']${key}["'][^>]*content=["']([^"']+)["']`,
          "i",
        ),
        new RegExp(
          `<meta[^>]*content=["']([^"']+)["'][^>]*(?:property|name)=["']${key}["']`,
          "i",
        ),
      ];
      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match?.[1]) return decodeHtmlEntities(match[1]);
      }
    }
    return null;
  };

  const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const titleFromTag = titleTag?.[1]
    ? decodeHtmlEntities(titleTag[1].trim())
    : null;
  const ogTitle = readMeta(["og:title", "twitter:title"]);
  const title =
    ogTitle && !/^instagram$/i.test(ogTitle.trim())
      ? ogTitle
      : titleFromTag ?? ogTitle;
  const imageUrl =
    readMeta([
      "og:image",
      "og:image:url",
      "og:image:secure_url",
      "twitter:image",
      "twitter:image:src",
    ]) ?? null;
  const description =
    readMeta(["og:description", "twitter:description", "description"]) ?? null;

  return { title, imageUrl, description };
}

function youTubeThumbnail(url: string): string | null {
  const id = extractYouTubeVideoId(url);
  return id ? youTubeThumbnailUrl(id) : null;
}

function googleMapsStaticImage(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("google") || !parsed.pathname.includes("/maps")) {
      return null;
    }
    const place = parsed.searchParams.get("q") ?? parsed.pathname.split("/").pop();
    if (!place) return null;
    const key = process.env.GOOGLE_MAPS_STATIC_API_KEY;
    if (!key) return null;
    return `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(place)}&zoom=14&size=600x400&maptype=roadmap&markers=color:red%7C${encodeURIComponent(place)}&key=${key}`;
  } catch {
    return null;
  }
}

const HTML_FETCH_HEADERS: Record<string, string> = {
  "User-Agent": BROWSER_UA,
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Cache-Control": "no-cache",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
};

async function fetchHtml(url: string): Promise<string | null> {
  const isInstagram = hostIncludes(url, ["instagram"]);
  const timeoutMs = isInstagram ? 15000 : 10000;
  try {
    const response = await fetch(url, {
      headers: HTML_FETCH_HEADERS,
      signal: AbortSignal.timeout(timeoutMs),
      redirect: "follow",
    });
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

async function fetchMicrolink(
  url: string,
  options: { timeoutMs?: number } = {},
): Promise<{
  title: string | null;
  imageUrl: string | null;
  description: string | null;
}> {
  const timeoutMs = options.timeoutMs ?? 10000;
  try {
    const endpoint = `https://api.microlink.io?url=${encodeURIComponent(url)}&screenshot=false&video=false&audio=false&timeout=${Math.min(timeoutMs, 30000)}`;
    const response = await fetch(endpoint, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(timeoutMs + 5000),
    });
    if (!response.ok) return EMPTY_META;
    const json = (await response.json()) as {
      data?: {
        title?: string;
        description?: string;
        image?: { url?: string };
      };
    };
    const data = json.data;
    const imageUrl = data?.image?.url ?? null;
    const title = data?.title?.trim() ?? null;
    return {
      title: title && !/^instagram$/i.test(title) ? title : null,
      imageUrl: imageUrl && !isWeakPreviewImage(imageUrl) ? imageUrl : null,
      description: data?.description ?? null,
    };
  } catch {
    return EMPTY_META;
  }
}

async function fetchNoembed(url: string): Promise<{
  title: string | null;
  imageUrl: string | null;
  description: string | null;
}> {
  try {
    const endpoint = `https://noembed.com/embed?format=json&url=${encodeURIComponent(url)}`;
    const response = await fetch(endpoint, {
      signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) return EMPTY_META;
    const data = (await response.json()) as {
      title?: string;
      thumbnail_url?: string;
      description?: string;
      author_name?: string;
      error?: string;
    };
    if (data.error) return EMPTY_META;
    const imageUrl =
      data.thumbnail_url && !isWeakPreviewImage(data.thumbnail_url)
        ? data.thumbnail_url
        : null;
    const description =
      data.description ??
      (data.author_name ? `By ${data.author_name}` : null);
    return {
      title: data.title ?? null,
      imageUrl,
      description,
    };
  } catch {
    return EMPTY_META;
  }
}

async function fetchYoutubeOembed(url: string): Promise<{
  title: string | null;
  imageUrl: string | null;
  description: string | null;
}> {
  try {
    const endpoint = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`;
    const response = await fetch(endpoint, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) return EMPTY_META;
    const data = (await response.json()) as {
      title?: string;
      thumbnail_url?: string;
      author_name?: string;
    };
    const imageUrl =
      data.thumbnail_url && !isWeakPreviewImage(data.thumbnail_url)
        ? data.thumbnail_url
        : youTubeThumbnail(url);
    return {
      title: data.title ?? null,
      imageUrl,
      description: data.author_name ? `Channel: ${data.author_name}` : null,
    };
  } catch {
    return EMPTY_META;
  }
}

async function fetchSpotifyOembed(url: string): Promise<{
  title: string | null;
  imageUrl: string | null;
  description: string | null;
}> {
  try {
    const endpoint = `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`;
    const response = await fetch(endpoint, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return EMPTY_META;
    const data = (await response.json()) as {
      title?: string;
      thumbnail_url?: string;
      description?: string;
    };
    return {
      title: data.title ?? null,
      imageUrl:
        data.thumbnail_url && !isWeakPreviewImage(data.thumbnail_url)
          ? data.thumbnail_url
          : null,
      description: data.description ?? null,
    };
  } catch {
    return EMPTY_META;
  }
}

async function fetchPinterestOembed(url: string): Promise<string | null> {
  try {
    const endpoint = `https://www.pinterest.com/oembed.json?url=${encodeURIComponent(url)}`;
    const response = await fetch(endpoint, {
      headers: { "User-Agent": BROWSER_UA },
      signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { thumbnail_url?: string };
    const thumb = data.thumbnail_url ?? null;
    return thumb && !isWeakPreviewImage(thumb) ? thumb : null;
  } catch {
    return null;
  }
}

function normalizeImageUrl(imageUrl: string | null, pageUrl: string): string | null {
  if (!imageUrl) return null;
  try {
    if (imageUrl.startsWith("//")) return `https:${imageUrl}`;
    if (imageUrl.startsWith("/")) return new URL(imageUrl, pageUrl).href;
    return imageUrl;
  } catch {
    return imageUrl;
  }
}

function hostIncludes(url: string, fragments: string[]): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return fragments.some((f) => host.includes(f));
  } catch {
    return false;
  }
}

function mergeMetadata(
  current: { title: string | null; imageUrl: string | null; description: string | null },
  incoming: { title: string | null; imageUrl: string | null; description: string | null },
  pageUrl: string,
) {
  if (!current.title && incoming.title) {
    current.title = decodeHtmlEntities(incoming.title);
  }
  if (!current.description && incoming.description) {
    current.description = incoming.description;
  }
  if (!current.imageUrl && incoming.imageUrl) {
    const normalized = normalizeImageUrl(incoming.imageUrl, pageUrl);
    if (normalized && !isWeakPreviewImage(normalized)) {
      current.imageUrl = normalized;
    }
  }
}

export async function resolveLinkMetadata(url: string): Promise<ParsedLinkMetadata> {
  const needsCanonical =
    hostIncludes(url, ["amzn.in", "amzn.to", "a.co", "pin.it", "youtu.be"]) ||
    isAmazonUrl(url);
  const fetchUrl = needsCanonical ? await resolveCanonicalUrl(url) : url;

  const source = detectSourceFromUrl(fetchUrl);
  const meta = { title: null as string | null, imageUrl: null as string | null, description: null as string | null };

  if (source === "youtube" && isYouTubeVideoUrl(fetchUrl)) {
    mergeMetadata(
      meta,
      { title: null, imageUrl: youTubeThumbnail(fetchUrl), description: null },
      fetchUrl,
    );
    mergeMetadata(meta, await fetchYoutubeOembed(fetchUrl), fetchUrl);
  }

  if (hostIncludes(fetchUrl, ["google"]) && fetchUrl.includes("/maps")) {
    mergeMetadata(meta, { title: null, imageUrl: googleMapsStaticImage(fetchUrl), description: null }, fetchUrl);
  }

  if (hostIncludes(fetchUrl, ["spotify"])) {
    mergeMetadata(meta, await fetchSpotifyOembed(fetchUrl), fetchUrl);
  }

  // Instagram: Microlink returns the IG logo — rely on direct HTML OG tags instead.
  const useMicrolink =
    !hostIncludes(fetchUrl, ["instagram"]) &&
    hostIncludes(fetchUrl, [
      "amazon",
      "amzn.to",
      "amzn.in",
      "a.co",
      "facebook",
      "fb.watch",
      "fb.com",
      "twitter",
      "x.com",
      "tiktok",
      "reddit",
      "redd.it",
    ]);

  const instagramProfile = source === "instagram" && isInstagramProfileUrl(fetchUrl);
  const instagramUsername = instagramProfile ? extractInstagramUsername(fetchUrl) : null;

  const useNoembed =
    (hostIncludes(fetchUrl, [
      "instagram",
      "youtube",
      "youtu.be",
      "twitter",
      "x.com",
      "tiktok",
      "vimeo",
      "reddit",
      "redd.it",
    ]) ||
      source === "pinterest") &&
    !instagramProfile;

  const microlinkTimeout = isAmazonUrl(fetchUrl) ? 28000 : 10000;

  const [html, microlink, noembed] = await Promise.all([
    fetchHtml(fetchUrl),
    useMicrolink
      ? fetchMicrolink(fetchUrl, { timeoutMs: microlinkTimeout })
      : Promise.resolve(EMPTY_META),
    useNoembed ? fetchNoembed(fetchUrl) : Promise.resolve(EMPTY_META),
  ]);

  if (html) {
    if (instagramProfile) {
      const embedded = parseInstagramEmbeddedData(html);
      mergeMetadata(
        meta,
        {
          title: embedded.fullName,
          imageUrl: embedded.profilePicUrl,
          description: embedded.biography,
        },
        fetchUrl,
      );
    }
    mergeMetadata(meta, parseHtmlMetadata(html), fetchUrl);
  }

  mergeMetadata(meta, microlink, fetchUrl);
  mergeMetadata(meta, noembed, fetchUrl);

  if (source === "pinterest" && !meta.imageUrl) {
    mergeMetadata(meta, { title: null, imageUrl: await fetchPinterestOembed(fetchUrl), description: null }, fetchUrl);
  }

  if (source === "youtube" && isYouTubeVideoUrl(fetchUrl)) {
    mergeMetadata(
      meta,
      { title: null, imageUrl: youTubeThumbnail(fetchUrl), description: null },
      fetchUrl,
    );
    if (!meta.title) {
      mergeMetadata(meta, await fetchYoutubeOembed(fetchUrl), fetchUrl);
    }
  }

  if (source === "youtube" && isYouTubeChannelUrl(fetchUrl) && !meta.title) {
    mergeMetadata(meta, await fetchMicrolink(fetchUrl, { timeoutMs: 15000 }), fetchUrl);
  }

  const titleMissing = !meta.title || meta.title === fetchUrl || meta.title === url;
  if (source === "web" && (!meta.imageUrl || titleMissing)) {
    mergeMetadata(meta, await fetchMicrolink(fetchUrl, { timeoutMs: 20000 }), fetchUrl);
  }

  if (instagramUsername) {
    meta.title = formatInstagramProfileTitle(meta.title, instagramUsername);
  }

  if (meta.imageUrl && isWeakPreviewImage(meta.imageUrl)) {
    meta.imageUrl = null;
  }

  if (meta.imageUrl) {
    meta.imageUrl = optimizeStoredImageUrl(meta.imageUrl, source);
  }

  return {
    title: meta.title ?? (instagramUsername ? `@${instagramUsername}` : fetchUrl),
    imageUrl: meta.imageUrl,
    description: meta.description,
    source,
  };
}
