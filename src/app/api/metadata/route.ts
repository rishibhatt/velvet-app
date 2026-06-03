import { NextResponse } from "next/server";
import { resolveLinkMetadata } from "@/lib/link-metadata";
import { requireApiUser } from "@/lib/api-auth";
import { rateLimitMetadata } from "@/lib/rate-limit";
import { isSafeExternalUrl } from "@/lib/url-security";

export async function POST(request: Request) {
  const { error, user } = await requireApiUser();
  if (error) return error;

  const allowed = await rateLimitMetadata(user!.id);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    if (!isSafeExternalUrl(url)) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const metadata = await resolveLinkMetadata(url);
    return NextResponse.json(metadata);
  } catch {
    return NextResponse.json({ error: "Failed to fetch metadata" }, { status: 500 });
  }
}
