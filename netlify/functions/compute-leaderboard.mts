import type { Config } from "@netlify/functions";
import { getServiceSupabase } from "./_supabase";

const MOODS = ["overall", "wedding", "travel", "home", "fashion", "events", "lifestyle"] as const;

function lastMonday(): string {
  const d = new Date();
  const day = d.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setUTCDate(d.getUTCDate() - diff);
  return d.toISOString().split("T")[0]!;
}

type Row = {
  profile_id: string;
  score: number;
  week_views: number;
  week_likes: number;
  week_resaves: number;
};

async function computeForMood(
  supabase: ReturnType<typeof getServiceSupabase>,
  mood: string,
): Promise<Row[]> {
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

  const byProfile = new Map<string, Row>();
  for (const b of boards) {
    const wv = b.weekly_view_count ?? 0;
    const wl = likesByBoard.get(b.id) ?? 0;
    const wr = resavesByBoard.get(b.id) ?? 0;
    const score = wv + wl * 3 + wr * 5;
    const cur = byProfile.get(b.owner_id) ?? {
      profile_id: b.owner_id,
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

  return [...byProfile.values()].sort((a, b) => b.score - a.score).slice(0, 10);
}

export default async function handler() {
  try {
    const supabase = getServiceSupabase();
    const weekStart = lastMonday();

    for (const mood of MOODS) {
      const rows = await computeForMood(supabase, mood);
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]!;
        await supabase.from("leaderboard_snapshots").upsert(
          {
            week_start: weekStart,
            mood,
            profile_id: row.profile_id,
            rank: i + 1,
            score: row.score,
            week_views: row.week_views,
            week_likes: row.week_likes,
            week_resaves: row.week_resaves,
          },
          { onConflict: "week_start,mood,profile_id" },
        );
      }

      if (rows[0]) {
        await supabase.from("creator_badges").upsert(
          {
            profile_id: rows[0].profile_id,
            badge_type: "top_curator",
            mood: mood === "overall" ? null : mood,
          },
          { onConflict: "profile_id,badge_type,mood" },
        );
      }

      for (let i = 0; i < Math.min(3, rows.length); i++) {
        const row = rows[i]!;
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        await supabase.from("creator_badges").upsert(
          {
            profile_id: row.profile_id,
            badge_type: "trending",
            mood: mood === "overall" ? null : mood,
            expires_at: expires,
          },
          { onConflict: "profile_id,badge_type,mood" },
        );
      }
    }

    console.log("compute-leaderboard complete for", weekStart);
    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("compute-leaderboard failed:", err);
    return new Response("Error", { status: 500 });
  }
}

export const config: Config = {
  schedule: "0 0 * * 1",
};
