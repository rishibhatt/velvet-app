import type { UrlMetadata } from "@/types/board.types";
import { detectSourceFromUrl } from "@/lib/link-metadata";

export { detectSourceFromUrl as detectSource } from "@/lib/link-metadata";

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
      source: detectSourceFromUrl(url),
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
