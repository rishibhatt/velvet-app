import type { ItemSource, UrlMetadata } from "@/types/board.types";

export function detectSource(url: string): ItemSource {
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    if (hostname.includes("instagram")) return "instagram";
    if (hostname.includes("youtube") || hostname.includes("youtu.be"))
      return "youtube";
    if (hostname.includes("amazon")) return "amazon";
    if (hostname.includes("pinterest")) return "pinterest";
    return "web";
  } catch {
    return "web";
  }
}

export async function fetchUrlMetadata(url: string): Promise<UrlMetadata> {
  const response = await fetch("/api/metadata", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    return {
      title: url,
      imageUrl: null,
      description: null,
      source: detectSource(url),
    };
  }

  return response.json();
}

export async function suggestTags(title: string): Promise<string[]> {
  try {
    const response = await fetch("/api/tags/suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!response.ok) return getFallbackTags(title);
    const data = await response.json();
    return data.tags ?? getFallbackTags(title);
  } catch {
    return getFallbackTags(title);
  }
}

function getFallbackTags(title: string): string[] {
  const words = title
    .split(/\s+/)
    .filter((w) => w.length > 4)
    .slice(0, 3)
    .map((w) => w.replace(/[^a-zA-Z]/g, ""));
  const defaults = ["Minimalist", "WarmIvory", "Inspiration"];
  return [...new Set([...words, ...defaults])].slice(0, 4);
}
