import type { Config } from "@netlify/functions";
import { getServiceSupabase } from "./_supabase";

export default async function handler() {
  try {
    const supabase = getServiceSupabase();

    {
      const { data: fallback } = await supabase
        .from("profiles")
        .select("id, total_board_views")
        .gte("total_board_views", 50);

      if (!fallback?.length) {
        console.log("check-badges: no candidates");
        return new Response("OK", { status: 200 });
      }

      for (const profile of fallback) {
        const { count } = await supabase
          .from("boards")
          .select("id", { count: "exact", head: true })
          .eq("owner_id", profile.id)
          .eq("is_public", true)
          .is("deleted_at", null);

        if ((count ?? 0) < 5) continue;

        const { data: existing } = await supabase
          .from("creator_badges")
          .select("id")
          .eq("profile_id", profile.id)
          .eq("badge_type", "verified_creator")
          .maybeSingle();

        if (existing) continue;

        await supabase.from("creator_badges").insert({
          profile_id: profile.id,
          badge_type: "verified_creator",
        });

        await supabase
          .from("profiles")
          .update({ is_verified: true, verified_at: new Date().toISOString() })
          .eq("id", profile.id);

        await supabase.from("notifications").insert({
          recipient_id: profile.id,
          type: "badge_earned",
          title: "Verified Creator badge earned",
          body: "You earned the Verified Creator badge!",
          metadata: { badge_type: "verified_creator" },
        });
      }

      console.log("check-badges complete");
    }
    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("check-badges failed:", err);
    return new Response("Error", { status: 500 });
  }
}

export const config: Config = {
  schedule: "0 6 * * *",
};
