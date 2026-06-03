import { NextResponse } from "next/server";
import { createClient } from "@/services/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils";

export async function requireApiUser() {
  if (!isSupabaseConfigured()) {
    return {
      error: NextResponse.json({ error: "Service unavailable" }, { status: 503 }),
      user: null,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      user: null,
    };
  }

  return { error: null, user };
}
