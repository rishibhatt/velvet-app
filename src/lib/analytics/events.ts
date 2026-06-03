export const ANALYTICS_EVENTS = {
  SESSION_STARTED: "session_start",
  PAGE_VIEWED: "page_view",
  COLLECTION_CREATED: "collection_created",
  COLLECTION_VIEWED: "collection_viewed",
  COLLECTION_SHARED: "collection_shared",
  COLLECTION_LIKED: "collection_liked",
  COLLECTION_DELETED: "collection_deleted",
  PROFILE_VIEWED: "profile_viewed",
  PROFILE_SHARED: "profile_shared",
  EXPLORE_VIEWED: "explore_viewed",
  EXPLORE_COLLECTION_CLICKED: "explore_collection_clicked",
  EXPLORE_TAG_CLICKED: "explore_tag_clicked",
  LINK_SAVED: "link_saved",
  IMAGE_SAVED: "image_saved",
  SEARCH_PERFORMED: "search_performed",
  SEARCH_RESULT_CLICKED: "search_result_clicked",
  SIGNUP_STARTED: "signup_started",
  SIGNUP_COMPLETED: "signup_completed",
  LOGIN_COMPLETED: "login_completed",
  LOGOUT: "logout",
  ERROR_TRACKED: "error_tracked",
} as const;

export type AnalyticsEventName =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

export type AnalyticsProperties = Record<
  string,
  string | number | boolean | null | undefined
>;

export interface AnalyticsUser {
  id: string;
  email?: string | null;
  username?: string | null;
  collection_count?: number;
}

export function sanitizeProperties(properties?: AnalyticsProperties) {
  if (!properties) return undefined;
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined),
  );
}
