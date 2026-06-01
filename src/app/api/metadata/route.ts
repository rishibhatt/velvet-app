import { NextResponse } from "next/server";
import { resolveLinkMetadata } from "@/lib/link-metadata";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const metadata = await resolveLinkMetadata(url);
    return NextResponse.json(metadata);
  } catch {
    return NextResponse.json({ error: "Failed to fetch metadata" }, { status: 500 });
  }
}
