import { NextResponse } from "next/server";
import { adsService } from "@/services/ads/ads.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const placement = searchParams.get("placement") ?? "explore_feed";
  const mood = searchParams.get("mood");
  const limit = Number(searchParams.get("limit") ?? 2);

  try {
    const ads = await adsService.serveAds({ placement, mood, limit });
    return NextResponse.json(
      { ads },
      { headers: { "Cache-Control": "public, s-maxage=300" } },
    );
  } catch {
    return NextResponse.json({ ads: [] });
  }
}
