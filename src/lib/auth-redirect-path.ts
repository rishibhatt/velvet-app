import { ROUTES } from "@/constants/routes";

/** Safe in-app return path for post-login redirects. */
export function getSafeReturnPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return ROUTES.home;
  }
  return next;
}

export function loginWithReturn(returnPath: string): string {
  return `${ROUTES.login}?next=${encodeURIComponent(returnPath)}`;
}

export function signupWithReturn(returnPath: string): string {
  return `${ROUTES.signup}?next=${encodeURIComponent(returnPath)}`;
}
