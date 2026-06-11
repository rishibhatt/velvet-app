import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { isSupabaseStorageUrl } from "@/lib/supabase-image";
import {
  serverIngestRemoteImage,
  type ServerIngestDebug,
} from "@/lib/server-ingest-image";
import { isSafeExternalUrl } from "@/lib/url-security";
import { createClient } from "@/services/supabase/server";

/** Server-side preview ingest — reliable on Netlify (no browser proxy + re-upload chain). */
export async function POST(request: Request) {
  const { error, user } = await requireApiUser();
  if (error) return error;

  try {
    const body = (await request.json()) as { url?: string; referer?: string };
    const url = body.url;
    const referer = body.referer;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    if (isSupabaseStorageUrl(url)) {
      return NextResponse.json({ url });
    }

    if (!isSafeExternalUrl(url)) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const supabase = await createClient();
    let debug: ServerIngestDebug | null = null;

    const stored = await serverIngestRemoteImage(supabase, user!.id, url, {
      referer,
      onDebug: (entry) => {
        debug = entry;
      },
    });

    if (!stored) {
      return NextResponse.json(
        { error: "Could not store preview", debug },
        { status: 502 },
      );
    }

    return NextResponse.json({ url: stored, debug });
  } catch {
    return NextResponse.json({ error: "Ingest failed" }, { status: 500 });
  }
}
