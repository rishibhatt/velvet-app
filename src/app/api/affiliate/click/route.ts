import { NextResponse } from "next/server";
import { maybeRewriteAffiliateUrl } from "@/lib/affiliate";
import { createServiceClient, isServiceRoleConfigured } from "@/lib/supabase/service";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const itemId = body.item_id as string | undefined;
    if (!itemId) {
      return NextResponse.json({ error: "item_id required" }, { status: 400 });
    }

    if (!isServiceRoleConfigured()) {
      return NextResponse.json({ url: null }, { status: 503 });
    }

    const supabase = createServiceClient();
    const { data: item } = await supabase
      .from("items")
      .select("source_url")
      .eq("id", itemId)
      .single();

    if (!item?.source_url) {
      return NextResponse.json({ error: "No URL" }, { status: 404 });
    }

    const url = await maybeRewriteAffiliateUrl(item.source_url, itemId);
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
