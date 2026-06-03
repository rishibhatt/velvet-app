import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = [
  "/",
  "/boards",
  "/profile",
  "/settings",
  "/search",
  "/onboarding",
];
const authRoutes = ["/login", "/signup", "/forgot-password"];
const publicRoutes = ["/setup", "/auth/callback", "/c", "/u"];

function redirectWithCookies(
  request: NextRequest,
  pathname: string,
  supabaseResponse: NextResponse,
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  const redirect = NextResponse.redirect(url);
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    redirect.cookies.set(cookie);
  });
  return redirect;
}

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const pathname = request.nextUrl.pathname;

  if (publicRoutes.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  if (!supabaseUrl || !supabaseKey) {
    if (
      protectedRoutes.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`),
      )
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/setup";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    });

    // Validates JWT and refreshes session cookies (required for SSR + ngrok)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isProtected = protectedRoutes.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    );
    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

    if (!user && isProtected) {
      return redirectWithCookies(request, "/login", supabaseResponse);
    }

    if (user && isAuthRoute) {
      return redirectWithCookies(request, "/", supabaseResponse);
    }
  } catch {
    return supabaseResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
