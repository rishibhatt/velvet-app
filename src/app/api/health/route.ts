import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!url || !hasKey) {
    return NextResponse.json(
      { ok: false, error: "Missing Supabase env vars" },
      { status: 500 },
    );
  }

  try {
    const res = await fetch(`${url}/rest/v1/`, {
      headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! },
    });
    return NextResponse.json({
      ok: res.ok,
      supabaseUrl: url,
      status: res.status,
      hint:
        res.status === 200
          ? "Connected. If boards fail, run migration 003_fix_rls_and_storage.sql"
          : "Check Supabase project status",
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error: e instanceof Error ? e.message : "Fetch failed",
      },
      { status: 502 },
    );
  }
}
