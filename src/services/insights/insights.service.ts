import { createClient } from "@/services/supabase/server";
import type { CreatorBadge, InsightsData, InsightsPeriod, Mood } from "@/types/board.types";

async function countBoardViewsInRange(
  supabase: Awaited<ReturnType<typeof createClient>>,
  boardIds: string[],
  fromIso: string,
  toIso?: string,
): Promise<number> {
  if (boardIds.length === 0) return 0;

  let request = supabase
    .from("board_views")
    .select("id", { count: "exact", head: true })
    .in("board_id", boardIds)
    .gte("viewed_at", fromIso);

  if (toIso) {
    request = request.lt("viewed_at", toIso);
  }

  const { count } = await request;
  return count ?? 0;
}

function periodStart(period: InsightsPeriod): Date {
  const now = new Date();
  if (period === "last_week") {
    const d = new Date(now);
    d.setDate(d.getDate() - 14);
    return d;
  }
  if (period === "last_30_days") {
    const d = new Date(now);
    d.setDate(d.getDate() - 30);
    return d;
  }
  const d = new Date(now);
  const day = d.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setUTCDate(d.getUTCDate() - diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export const insightsService = {
  async getInsights(userId: string, period: InsightsPeriod = "this_week"): Promise<InsightsData> {
    const supabase = await createClient();
    const start = periodStart(period);
    const startIso = start.toISOString();

    const { data: profile } = await supabase
      .from("profiles")
      .select("total_board_views, weekly_reach, username")
      .eq("id", userId)
      .single();

    const { data: boards } = await supabase
      .from("boards")
      .select("id, title, mood, mood_label, cover_url, weekly_view_count, view_count, is_public, created_at")
      .eq("owner_id", userId)
      .is("deleted_at", null)
      .order("weekly_view_count", { ascending: false });

    const boardIds = (boards ?? []).map((b) => b.id);
    const publicCount = (boards ?? []).filter((b) => b.is_public).length;

    let viewsByDay: InsightsData["views_by_day"] = [];
    let viewsBySource: InsightsData["views_by_source"] = [];

    if (boardIds.length > 0) {
      const { data: views } = await supabase
        .from("board_views")
        .select("viewed_at, source")
        .in("board_id", boardIds)
        .gte("viewed_at", startIso);

      const dayMap = new Map<string, number>();
      const sourceMap = new Map<string, number>();
      for (const v of views ?? []) {
        const day = v.viewed_at?.split("T")[0] ?? "";
        dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
        const src = v.source ?? "direct";
        sourceMap.set(src, (sourceMap.get(src) ?? 0) + 1);
      }
      viewsByDay = [...dayMap.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({ date, count }));
      viewsBySource = [...sourceMap.entries()].map(([source, count]) => ({ source, count }));
    }

    const { data: topItems } = await supabase
      .from("items")
      .select("id, title, image_url, resave_count, board_id")
      .in("board_id", boardIds.length ? boardIds : ["00000000-0000-0000-0000-000000000000"])
      .is("deleted_at", null)
      .order("resave_count", { ascending: false })
      .limit(5);

    const { data: recentResaves } = await supabase
      .from("item_resaves")
      .select(
        `
          id, created_at,
          resaver:profiles!item_resaves_resaved_by_fkey(username, avatar_url),
          original_item:items!item_resaves_original_item_id_fkey(title, image_url)
        `,
      )
      .eq("original_owner_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    const { data: badges } = await supabase
      .from("creator_badges")
      .select("*")
      .eq("profile_id", userId);

    const weekStart = periodStart("this_week").toISOString().split("T")[0]!;
    const { data: ranks } = await supabase
      .from("leaderboard_snapshots")
      .select("mood, rank, score")
      .eq("profile_id", userId)
      .eq("week_start", weekStart);

    const totalViews = profile?.total_board_views ?? 0;
    const weeklyViews = profile?.weekly_reach ?? 0;
    const weeklyBoardViews = (boards ?? []).reduce(
      (sum, b) => sum + (b.weekly_view_count ?? 0),
      0,
    );

    const thisWeekStart = periodStart("this_week");
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setUTCDate(lastWeekStart.getUTCDate() - 7);

    const [thisWeekViewCount, lastWeekViewCount] = await Promise.all([
      countBoardViewsInRange(supabase, boardIds, thisWeekStart.toISOString()),
      countBoardViewsInRange(
        supabase,
        boardIds,
        lastWeekStart.toISOString(),
        thisWeekStart.toISOString(),
      ),
    ]);

    let weekly_change_pct = 0;
    if (lastWeekViewCount > 0) {
      weekly_change_pct = Math.round(
        ((thisWeekViewCount - lastWeekViewCount) / lastWeekViewCount) * 100,
      );
    } else if (thisWeekViewCount > 0) {
      weekly_change_pct = 100;
    }

    const { count: resaveTotal } = await supabase
      .from("item_resaves")
      .select("id", { count: "exact", head: true })
      .eq("original_owner_id", userId)
      .gte("created_at", startIso);

    const { count: likeCount } = await supabase
      .from("board_likes")
      .select("id", { count: "exact", head: true })
      .in("board_id", boardIds.length ? boardIds : ["00000000-0000-0000-0000-000000000000"])
      .gte("created_at", startIso);

    return {
      overview: {
        total_views: totalViews,
        weekly_views: thisWeekViewCount || weeklyBoardViews || weeklyViews,
        weekly_change_pct,
        total_resaves: resaveTotal ?? 0,
        likes: likeCount ?? 0,
        public_boards: publicCount,
        total_boards: boards?.length ?? 0,
      },
      views_by_day: viewsByDay,
      views_by_source: viewsBySource,
      top_boards: (boards ?? [])
        .filter((b) => (b.view_count ?? 0) > 0 || (b.weekly_view_count ?? 0) > 0)
        .slice(0, 5)
        .map((b) => ({
        id: b.id,
        title: b.title,
        mood: b.mood as Mood | null,
        mood_label: b.mood_label,
        cover_url: b.cover_url,
        view_count: b.view_count ?? 0,
        weekly_view_count: b.weekly_view_count ?? 0,
        created_at: b.created_at,
      })),
      top_items: (topItems ?? []).filter((i) => (i.resave_count ?? 0) > 0),
      recent_resaves: recentResaves ?? [],
      badges: (badges ?? []) as CreatorBadge[],
      leaderboard_ranks: ranks ?? [],
      username: profile?.username ?? "",
    };
  },
};
