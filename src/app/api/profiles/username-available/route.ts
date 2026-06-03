import { NextResponse } from "next/server";
import { createClient } from "@/services/supabase/server";

const USERNAME_RE = /^[a-z0-9_]{3,30}$/;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("username")?.trim().toLowerCase() ?? "";

  if (!USERNAME_RE.test(raw)) {
    return NextResponse.json({
      available: false,
      reason: "invalid",
    });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", raw)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    available: !data,
    username: raw,
  });
}
