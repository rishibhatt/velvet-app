import { MOODS } from "@/constants/moods";
import { createServiceClient, isServiceRoleConfigured } from "@/lib/supabase/service";
import { createClient } from "@/services/supabase/server";
import type { CreatorBadge, LeaderboardEntry } from "@/types/board.types";

function lastMonday(): string {
  const d = new Date();
  const day = d.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setUTCDate(d.getUTCDate() - diff);
  return d.toISOString().split("T")[0]!;
}

export const leaderboardService = {
  async getLeaderboard(mood = "overall", limit = 10): Promise<LeaderboardEntry[]> {
    const weekStart = lastMonday();
    const supabase = isServiceRoleConfigured()
      ? createServiceClient()
      : await createClient();

    const { data: snapshots } = await supabase
      .from("leaderboard_snapshots")
      .select("rank, score, week_views, week_likes, week_resaves, profile_id")
      .eq("week_start", weekStart)
      .eq("mood", mood)
      .order("rank", { ascending: true })
      .limit(limit);

    if (snapshots?.length) {
      const profileIds = snapshots.map((s) => s.profile_id);
      const [{ data: profiles }, { data: badges }] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url, is_verified")
          .in("id", profileIds),
        supabase.from("creator_badges").select("*").in("profile_id", profileIds),
      ]);

      const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

      const entries: LeaderboardEntry[] = [];
      for (const row of snapshots) {
        const profile = profileMap.get(row.profile_id);
        if (!profile) continue;
        const profileBadges = (badges ?? []).filter(
          (b) => b.profile_id === profile.id,
        ) as CreatorBadge[];
        entries.push({
          rank: row.rank,
          score: row.score,
          week_views: row.week_views ?? 0,
          week_likes: row.week_likes ?? 0,
          week_resaves: row.week_resaves ?? 0,
          profile: {
            ...profile,
            is_verified: profile.is_verified ?? undefined,
          },
          badges: profileBadges,
        });
      }
      return entries;
    }

    return this.computeLive(mood, limit);
  },

  async computeLive(mood: string, limit: number): Promise<LeaderboardEntry[]> {
    const supabase = isServiceRoleConfigured()
      ? createServiceClient()
      : await createClient();

    let boardsQuery = supabase
      .from("boards")
      .select("id, owner_id, weekly_view_count, mood")
      .eq("is_public", true)
      .is("deleted_at", null);

    if (mood !== "overall") {
      boardsQuery = boardsQuery.eq("mood", mood);
    }

    const { data: boards } = await boardsQuery;
    if (!boards?.length) return [];

    const boardIds = boards.map((b) => b.id);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: likes } = await supabase
      .from("board_likes")
      .select("board_id")
      .in("board_id", boardIds)
      .gte("created_at", weekAgo);

    const { data: resaves } = await supabase
      .from("item_resaves")
      .select("original_board_id")
      .in("original_board_id", boardIds)
      .gte("created_at", weekAgo);

    const likesByBoard = new Map<string, number>();
    for (const l of likes ?? []) {
      likesByBoard.set(l.board_id, (likesByBoard.get(l.board_id) ?? 0) + 1);
    }

    const resavesByBoard = new Map<string, number>();
    for (const r of resaves ?? []) {
      resavesByBoard.set(
        r.original_board_id,
        (resavesByBoard.get(r.original_board_id) ?? 0) + 1,
      );
    }

    const byProfile = new Map<
      string,
      { score: number; week_views: number; week_likes: number; week_resaves: number }
    >();

    for (const b of boards) {
      const wv = b.weekly_view_count ?? 0;
      const wl = likesByBoard.get(b.id) ?? 0;
      const wr = resavesByBoard.get(b.id) ?? 0;
      const score = wv + wl * 3 + wr * 5;
      const cur = byProfile.get(b.owner_id) ?? {
        score: 0,
        week_views: 0,
        week_likes: 0,
        week_resaves: 0,
      };
      cur.score += score;
      cur.week_views += wv;
      cur.week_likes += wl;
      cur.week_resaves += wr;
      byProfile.set(b.owner_id, cur);
    }

    const sorted = [...byProfile.entries()]
      .sort((a, b) => b[1].score - a[1].score)
      .slice(0, limit);

    const profileIds = sorted.map(([id]) => id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url, is_verified")
      .in("id", profileIds);

    const { data: badges } = await supabase
      .from("creator_badges")
      .select("*")
      .in("profile_id", profileIds);

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

    return sorted.map(([profileId, stats], i) => {
      const p = profileMap.get(profileId)!;
      return {
        rank: i + 1,
        score: stats.score,
        week_views: stats.week_views,
        week_likes: stats.week_likes,
        week_resaves: stats.week_resaves,
        profile: { ...p, is_verified: p.is_verified ?? undefined },
        badges: (badges ?? []).filter((b) => b.profile_id === profileId) as CreatorBadge[],
      };
    });
  },

  moodOptions(): string[] {
    return ["overall", ...MOODS.filter((m) => m.value !== "other").map((m) => m.value)];
  },
};
