import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { isSafeExternalUrl } from "@/lib/url-security";

const BROWSER_UA =
  "Mozilla/5.0 (compatible; Velvet/1.0; +https://the-velvet.netlify.app)";
const MAX_BYTES = 8 * 1024 * 1024;

/** Fetch external preview images server-side (no CORS) for compression + Supabase upload. */
export async function POST(request: Request) {
  const { error } = await requireApiUser();
  if (error) return error;

  try {
    const body = (await request.json()) as { url?: string };
    const url = body.url;

    if (!url || typeof url !== "string" || !isSafeExternalUrl(url)) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const upstream = await fetch(url, {
      headers: {
        "User-Agent": BROWSER_UA,
        Accept: "image/*,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(12_000),
      redirect: "follow",
    });

    if (!upstream.ok) {
      return NextResponse.json({ error: "Image fetch failed" }, { status: 502 });
    }

    const contentType = upstream.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "Not an image" }, { status: 400 });
    }

    const buffer = await upstream.arrayBuffer();
    if (buffer.byteLength === 0 || buffer.byteLength > MAX_BYTES) {
      return NextResponse.json({ error: "Image too large" }, { status: 413 });
    }

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType.split(";")[0]!.trim(),
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
  }
}
