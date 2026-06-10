import { NextResponse } from "next/server";
import { hashSHA256 } from "@/lib/hash";
import { adsService } from "@/services/ads/ads.service";
import { createClient } from "@/services/supabase/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

function createAdClickLimiter() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(3, "1 h"),
    analytics: false,
  });
}

const adClickLimiter = createAdClickLimiter();

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const adUnitId = body.ad_unit_id as string | undefined;
  if (!adUnitId) {
    return NextResponse.json({ error: "ad_unit_id required" }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ua = request.headers.get("user-agent") ?? "";
  const fingerprint = await hashSHA256(`${ip}:${ua}:${adUnitId}`);

  if (adClickLimiter) {
    const { success } = await adClickLimiter.limit(`ad-click:${fingerprint}`);
    if (!success) {
      return NextResponse.json({ error: "Rate limited" }, { status: 429 });
    }
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectUrl = await adsService.trackClick(adUnitId, fingerprint, user?.id ?? null);
  if (!redirectUrl) {
    return NextResponse.json({ error: "Ad not found" }, { status: 404 });
  }

  return NextResponse.json(
    { redirect_url: redirectUrl },
    { headers: { "Cache-Control": "no-cache" } },
  );
}
