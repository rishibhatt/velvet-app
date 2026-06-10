import { NextResponse } from "next/server";
import { leaderboardService } from "@/services/leaderboard/leaderboard.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mood = searchParams.get("mood") ?? "overall";
  const limit = Math.min(Number(searchParams.get("limit") ?? 10), 50);

  const entries = await leaderboardService.getLeaderboard(mood, limit);

  return NextResponse.json(
    { entries, mood },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    },
  );
}
