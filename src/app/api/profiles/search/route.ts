import { NextResponse } from "next/server";
import { createClient } from "@/services/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils";
import { rateLimitProfileSearch } from "@/lib/rate-limit";

function sanitizeSearch(value: string) {
  return value.replace(/[%_]/g, "").trim().replace(/^@/, "").toLowerCase();
}

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "anonymous"
  );
}

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) return NextResponse.json({ profiles: [] });

  const ip = getClientIp(request);
  const allowed = await rateLimitProfileSearch(ip);
  if (!allowed) {
    return NextResponse.json({ profiles: [], error: "Too many requests" }, { status: 429 });
  }

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
