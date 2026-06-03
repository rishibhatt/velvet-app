import { NextResponse } from "next/server";
import { createClient } from "@/services/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/utils";
import type { Database } from "@/types/database.types";

export async function POST() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return NextResponse.json(
      { error: "Account deletion is not configured on the server." },
      { status: 503 },
    );
  }

  const { error: rpcError } = await supabase.rpc("delete_user_account");
  if (rpcError) {
    return NextResponse.json(
      { error: rpcError.message ?? "Failed to delete account data" },
      { status: 500 },
    );
  }

  const admin = createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) {
    return NextResponse.json(
      { error: deleteError.message ?? "Failed to delete auth user" },
      { status: 500 },
    );
  }

  await supabase.auth.signOut();

  return NextResponse.json({ ok: true });
}
