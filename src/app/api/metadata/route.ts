import { NextResponse } from "next/server";
import { detectSource } from "@/utils/url";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const source = detectSource(url);
    let title = url;
    let imageUrl: string | null = null;
    let description: string | null = null;

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; VelvetBot/1.0)",
        },
        signal: AbortSignal.timeout(5000),
      });
      const html = await response.text();

      const ogTitle = html.match(
        /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i,
      );
      const ogImage = html.match(
        /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
      );
      const ogDesc = html.match(
        /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i,
      );
      const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i);

      title = ogTitle?.[1] ?? titleTag?.[1]?.trim() ?? url;
      imageUrl = ogImage?.[1] ?? null;
      description = ogDesc?.[1] ?? null;
    } catch {
      // Fallback to URL-based metadata
    }

    return NextResponse.json({ title, imageUrl, description, source });
  } catch {
    return NextResponse.json({ error: "Failed to fetch metadata" }, { status: 500 });
  }
}
