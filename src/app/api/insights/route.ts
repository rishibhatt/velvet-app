import { NextResponse } from "next/server";
import { insightsService } from "@/services/insights/insights.service";
import { createClient } from "@/services/supabase/server";
import type { InsightsPeriod } from "@/types/board.types";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const period = (searchParams.get("period") ?? "this_week") as InsightsPeriod;

  const data = await insightsService.getInsights(user.id, period);

  return NextResponse.json(data, {
    headers: { "Cache-Control": "private, max-age=300" },
  });
}
