import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  isAuthRoute,
  isEmailVerificationExempt,
  isEmailVerified,
} from "@/lib/auth-redirect";
import { ROUTES } from "@/constants/routes";

const PUBLIC_HOME_REDIRECT = 308;

const protectedRoutes = [
  "/",
  "/boards",
  "/profile",
  "/settings",
  "/search",
  "/onboarding",
  "/insights",
  "/notifications",
];
const publicRoutes = [
  "/setup",
  "/auth/callback",
  "/c",
  "/u",
  "/explore",
  "/brands",
  "/wedding",
  "/travel",
  "/home",
  "/fashion",
  "/events",
  "/lifestyle",
  "/tag",
];

function redirectWithCookies(
  request: NextRequest,
  pathname: string,
  supabaseResponse: NextResponse,
  status = 307,
  search?: string,
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = search ?? "";
  const redirect = NextResponse.redirect(url, status);
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    redirect.cookies.set(cookie);
  });
  return redirect;
}

function redirectToLogin(request: NextRequest, supabaseResponse: NextResponse) {
  const returnPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  const search = `next=${encodeURIComponent(returnPath)}`;
  return redirectWithCookies(request, "/login", supabaseResponse, 307, search);
}

function isProtected(pathname: string): boolean {
  return protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export async function proxy(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const pathname = request.nextUrl.pathname;

  if (publicRoutes.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  if (!supabaseUrl || !supabaseKey) {
    if (pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = ROUTES.explore;
      return NextResponse.redirect(url, PUBLIC_HOME_REDIRECT);
    }
    if (isProtected(pathname)) {
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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && pathname === "/") {
      return redirectWithCookies(
        request,
        ROUTES.explore,
        supabaseResponse,
        PUBLIC_HOME_REDIRECT,
      );
    }

    if (!user && isProtected(pathname)) {
      return redirectToLogin(request, supabaseResponse);
    }

    if (
      user &&
      !isEmailVerified(user) &&
      isProtected(pathname) &&
      !isEmailVerificationExempt(pathname)
    ) {
      return redirectWithCookies(request, "/verify-email", supabaseResponse);
    }

    if (user && isAuthRoute(pathname)) {
      if (pathname.startsWith("/reset-password")) {
        return supabaseResponse;
      }
      if (!isEmailVerified(user) && pathname.startsWith("/verify-email")) {
        return supabaseResponse;
      }
      if (isEmailVerified(user)) {
        return redirectWithCookies(request, "/", supabaseResponse);
      }
    }
  } catch {
    if (pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = ROUTES.explore;
      return NextResponse.redirect(url, PUBLIC_HOME_REDIRECT);
    }
    if (isProtected(pathname)) {
      return redirectToLogin(request, supabaseResponse);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
