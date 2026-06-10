import { NextResponse } from "next/server";
import { maybeRewriteAffiliateUrl } from "@/lib/affiliate";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const url = body.url as string | undefined;
    if (!url) {
      return NextResponse.json({ url: null }, { status: 400 });
    }
    const rewritten = await maybeRewriteAffiliateUrl(url);
    return NextResponse.json({ url: rewritten });
  } catch {
    return NextResponse.json({ url: null });
  }
}
