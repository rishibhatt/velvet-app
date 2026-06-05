import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export const revalidate = 300;

type PlatformStats = {
  publicCollections: number;
  creators: number;
  itemsSaved: number;
};

const EMPTY: PlatformStats = {
  publicCollections: 0,
  creators: 0,
  itemsSaved: 0,
};

/** Public aggregate counts for auth marketing hero. */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json(EMPTY);
  }

  const supabase = createClient<Database>(url, key);

  const { data, error } = await supabase.rpc("get_platform_stats");

  if (error || !data || typeof data !== "object") {
    return NextResponse.json(EMPTY);
  }

  const row = data as Record<string, unknown>;

  const stats: PlatformStats = {
    publicCollections: Number(row.publicCollections) || 0,
    creators: Number(row.creators) || 0,
    itemsSaved: Number(row.itemsSaved) || 0,
  };

  return NextResponse.json(stats, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
  });
}
