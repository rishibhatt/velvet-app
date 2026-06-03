import { NextResponse } from "next/server";
import { createClient } from "@/services/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils";

function sanitizeSearch(value: string) {
  return value.replace(/[%_]/g, "").trim().replace(/^@/, "").toLowerCase();
}

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) return NextResponse.json({ profiles: [] });

  const { searchParams } = new URL(request.url);
  const query = sanitizeSearch(searchParams.get("q") ?? "");
  if (query.length < 2) return NextResponse.json({ profiles: [] });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pattern = `%${query}%`;
  let requestBuilder = supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url")
    .or(`username.ilike.${pattern},full_name.ilike.${pattern}`)
    .order("username", { ascending: true })
    .limit(8);

  if (user?.id) {
    requestBuilder = requestBuilder.neq("id", user.id);
  }

  const { data, error } = await requestBuilder;
  if (error) return NextResponse.json({ profiles: [] });

  return NextResponse.json({ profiles: data ?? [] });
}
