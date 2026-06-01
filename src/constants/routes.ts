export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
  boards: "/boards",
  board: (id: string) => `/boards/${id}`,
  publicCollection: (slug: string) => `/c/${slug}`,
  creator: (username: string) => `/u/${username}`,
  search: "/search",
  profile: "/profile",
  settings: "/settings",
  setup: "/setup",
} as const;

export function getPublicShareUrl(slug: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}${ROUTES.publicCollection(slug)}`;
  }
  return ROUTES.publicCollection(slug);
}
