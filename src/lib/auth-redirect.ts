import type { User } from "@supabase/supabase-js";

const AUTH_ONLY_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

const EMAIL_EXEMPT_ROUTES = [
  ...AUTH_ONLY_ROUTES,
  "/setup",
  "/auth/callback",
];

export function isAuthRoute(pathname: string): boolean {
  return AUTH_ONLY_ROUTES.some((route) => pathname.startsWith(route));
}

export function isEmailVerificationExempt(pathname: string): boolean {
  return EMAIL_EXEMPT_ROUTES.some((route) => pathname.startsWith(route));
}

export function isEmailVerified(user: User): boolean {
  if (user.app_metadata?.provider && user.app_metadata.provider !== "email") {
    return true;
  }
  return Boolean(user.email_confirmed_at);
}
