import type { Config } from "@netlify/functions";
import { getServiceSupabase } from "./_supabase";

export default async function handler() {
  try {
    const supabase = getServiceSupabase();
    const { error: boardsErr } = await supabase
      .from("boards")
      .update({ weekly_view_count: 0 })
      .neq("weekly_view_count", 0);
    if (boardsErr) throw boardsErr;

    const { error: profilesErr } = await supabase
      .from("profiles")
      .update({ weekly_reach: 0 })
      .neq("weekly_reach", 0);
    if (profilesErr) throw profilesErr;

    console.log("reset-weekly-views complete");
    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("reset-weekly-views failed:", err);
    return new Response("Error", { status: 500 });
  }
}

export const config: Config = {
  schedule: "0 1 * * 1",
};
