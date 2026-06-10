import type { Config } from "@netlify/functions";
import { getServiceSupabase } from "./_supabase";

export default async function handler() {
  const start = Date.now();
  try {
    const supabase = getServiceSupabase();
    const { error } = await supabase.rpc("update_all_trending_scores");
    if (error) throw error;
    console.log(`update-trending OK in ${Date.now() - start}ms`);
    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("update-trending failed:", err);
    return new Response("Error", { status: 500 });
  }
}

export const config: Config = {
  schedule: "0 */6 * * *",
};
