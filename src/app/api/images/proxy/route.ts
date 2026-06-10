import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { isSafeExternalUrl } from "@/lib/url-security";

const BROWSER_UA =
  "Mozilla/5.0 (compatible; Velvet/1.0; +https://the-velvet.netlify.app)";
const MAX_BYTES = 8 * 1024 * 1024;

function looksLikeImage(bytes: Uint8Array): boolean {
  if (bytes.byteLength < 4) return false;
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return true;
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return true;
  }
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return true;
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
    return true;
  }
  return false;
}

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

    const buffer = await upstream.arrayBuffer();
    if (buffer.byteLength === 0 || buffer.byteLength > MAX_BYTES) {
      return NextResponse.json({ error: "Image too large" }, { status: 413 });
    }

    const bytes = new Uint8Array(buffer);
    const contentType = upstream.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/") && !looksLikeImage(bytes)) {
      return NextResponse.json({ error: "Not an image" }, { status: 400 });
    }

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType.split(";")[0]!.trim() || "image/jpeg",
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
  }
}
