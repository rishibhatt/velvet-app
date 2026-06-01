import type { ItemSource } from "@/types/board.types";

export interface ParsedLinkMetadata {
  title: string;
  imageUrl: string | null;
  description: string | null;
  source: ItemSource;
}

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

export function detectSourceFromUrl(url: string): ItemSource {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    if (hostname.includes("instagram")) return "instagram";
    if (hostname.includes("youtube") || hostname === "youtu.be") return "youtube";
    if (hostname.includes("amazon")) return "amazon";
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
    .trim();
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
  const title =
    readMeta(["og:title", "twitter:title"]) ??
    titleTag?.[1]?.trim() ??
    null;
  const imageUrl =
    readMeta([
      "og:image",
      "og:image:url",
      "twitter:image",
      "twitter:image:src",
    ]) ?? null;
  const description =
    readMeta(["og:description", "twitter:description", "description"]) ?? null;

  return { title, imageUrl, description };
}

export function extractYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.slice(1).split("/")[0] || null;
    }
    if (parsed.pathname.startsWith("/shorts/")) {
      return parsed.pathname.split("/")[2] ?? null;
    }
    if (parsed.pathname.startsWith("/embed/")) {
      return parsed.pathname.split("/")[2] ?? null;
    }
    return parsed.searchParams.get("v");
  } catch {
    return null;
  }
}

function youTubeThumbnail(url: string): string | null {
  const id = extractYouTubeVideoId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
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

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": BROWSER_UA,
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(8000),
      redirect: "follow",
    });
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

async function fetchMicrolink(url: string): Promise<{
  title: string | null;
  imageUrl: string | null;
  description: string | null;
}> {
  try {
    const endpoint = `https://api.microlink.io?url=${encodeURIComponent(url)}&screenshot=false&video=false&audio=false`;
    const response = await fetch(endpoint, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return { title: null, imageUrl: null, description: null };
    const json = (await response.json()) as {
      data?: {
        title?: string;
        description?: string;
        image?: { url?: string };
        logo?: { url?: string };
      };
    };
    const data = json.data;
    return {
      title: data?.title ?? null,
      imageUrl: data?.image?.url ?? data?.logo?.url ?? null,
      description: data?.description ?? null,
    };
  } catch {
    return { title: null, imageUrl: null, description: null };
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
    if (!response.ok) return { title: null, imageUrl: null, description: null };
    const data = (await response.json()) as {
      title?: string;
      thumbnail_url?: string;
      description?: string;
      error?: string;
    };
    if (data.error) return { title: null, imageUrl: null, description: null };
    return {
      title: data.title ?? null,
      imageUrl: data.thumbnail_url ?? null,
      description: data.description ?? null,
    };
  } catch {
    return { title: null, imageUrl: null, description: null };
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
    return data.thumbnail_url ?? null;
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

export async function resolveLinkMetadata(url: string): Promise<ParsedLinkMetadata> {
  const source = detectSourceFromUrl(url);
  let title: string | null = null;
  let imageUrl: string | null = null;
  let description: string | null = null;

  if (source === "youtube") {
    imageUrl = youTubeThumbnail(url);
  }

  if (hostIncludes(url, ["google"]) && url.includes("/maps")) {
    imageUrl = googleMapsStaticImage(url) ?? imageUrl;
  }

  const needsNoembed =
    hostIncludes(url, [
      "instagram",
      "facebook",
      "fb.watch",
      "fb.com",
      "twitter",
      "x.com",
      "tiktok",
    ]) || (source === "pinterest" && !imageUrl);

  if (source === "instagram" || needsNoembed) {
    const microlink = await fetchMicrolink(url);
    title = title ?? microlink.title;
    imageUrl = imageUrl ?? microlink.imageUrl;
    description = description ?? microlink.description;
  }

  if ((needsNoembed || source === "pinterest") && !imageUrl) {
    const noembed = await fetchNoembed(url);
    title = title ?? noembed.title;
    imageUrl = imageUrl ?? noembed.imageUrl;
    description = description ?? noembed.description;
  }

  if (source === "pinterest" && !imageUrl) {
    imageUrl = await fetchPinterestOembed(url);
  }

  if (!title || !imageUrl) {
    const html = await fetchHtml(url);
    if (html) {
      const parsed = parseHtmlMetadata(html);
      title = title ?? parsed.title;
      imageUrl = imageUrl ?? parsed.imageUrl;
      description = description ?? parsed.description;
    }
  }

  if (source === "youtube" && !imageUrl) {
    imageUrl = youTubeThumbnail(url);
  }

  imageUrl = normalizeImageUrl(imageUrl, url);

  return {
    title: title ?? url,
    imageUrl,
    description,
    source,
  };
}
