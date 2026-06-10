import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { getAppBaseUrlFromHeaders } from "@/lib/app-url";
import { sanitizeAuthRedirect } from "@/lib/url-security";
import type { Database } from "@/types/database.types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeAuthRedirect(searchParams.get("next"));

  const headerStore = await headers();
  const origin =
    getAppBaseUrlFromHeaders(headerStore) || new URL(request.url).origin;

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          },
        },
      },
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const verified = Boolean(session?.user?.email_confirmed_at);
      const destination =
        verified && next === "/onboarding" ? "/email-verified" : next;
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
