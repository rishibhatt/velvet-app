export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
  onboarding: "/onboarding",
  authCallback: "/auth/callback",
  boards: "/boards",
  board: (id: string) => `/boards/${id}`,
  publicCollection: (username: string, slug: string) => `/u/${username}/${slug}`,
  legacyPublicCollection: (slug: string) => `/c/${slug}`,
  creator: (username: string) => `/u/${username}`,
  tag: (slug: string) => `/tag/${slug}`,
  category: (slug: string) => `/${slug}`,
  search: "/search",
  explore: "/explore",
  profile: "/profile",
  settings: "/settings",
  setup: "/setup",
} as const;

export { getPublicShareUrl } from "@/lib/app-url";
