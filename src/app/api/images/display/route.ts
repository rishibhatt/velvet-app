import { NextRequest, NextResponse } from "next/server";
import { isSupabaseStorageUrl } from "@/lib/supabase-image";

const MAX_BYTES = 8 * 1024 * 1024;

/** Resize + cache public Supabase uploads for `next/image` (same-origin loader). */
export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url");
  const widthParam = Number.parseInt(
    request.nextUrl.searchParams.get("w") ?? "640",
    10,
  );
  const qualityParam = Number.parseInt(
    request.nextUrl.searchParams.get("q") ?? "70",
    10,
  );

  if (!rawUrl || !isSupabaseStorageUrl(rawUrl)) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const revision = request.nextUrl.searchParams.get("v");
  const width = Math.min(Math.max(Number.isFinite(widthParam) ? widthParam : 640, 32), 1920);
  const quality = Math.min(Math.max(Number.isFinite(qualityParam) ? qualityParam : 70, 40), 90);
  const cacheControl = revision
    ? "public, max-age=31536000, immutable"
    : "public, max-age=3600, stale-while-revalidate=86400";

  try {
    const upstream = await fetch(rawUrl, {
      headers: { Accept: "image/*" },
      signal: AbortSignal.timeout(12_000),
      cache: "no-store",
    });

    if (!upstream.ok) {
      return NextResponse.json({ error: "Upstream failed" }, { status: 502 });
    }

    const buffer = Buffer.from(await upstream.arrayBuffer());
    if (buffer.byteLength === 0 || buffer.byteLength > MAX_BYTES) {
      return NextResponse.json({ error: "Image too large" }, { status: 413 });
    }

    try {
      const sharp = (await import("sharp")).default;
      const resized = await sharp(buffer)
        .rotate()
        .resize(width, undefined, { withoutEnlargement: true })
        .webp({ quality })
        .toBuffer();

      return new NextResponse(new Uint8Array(resized), {
        status: 200,
        headers: {
          "Content-Type": "image/webp",
          "Cache-Control": cacheControl,
        },
      });
    } catch {
      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          "Content-Type": upstream.headers.get("content-type") ?? "image/webp",
          "Cache-Control": cacheControl,
        },
      });
    }
  } catch {
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
  }
}
