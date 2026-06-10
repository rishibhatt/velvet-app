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
  BOARD_VIEWED_PUBLIC: "board_viewed_public",
  VIEW_MILESTONE_REACHED: "view_milestone_reached",
  ITEM_RESAVED: "item_resaved",
  INSPIRED_BY_TAPPED: "inspired_by_tapped",
  INSIGHTS_PAGE_VIEWED: "insights_page_viewed",
  LEADERBOARD_VIEWED: "leaderboard_viewed",
  NOTIFICATION_BELL_TAPPED: "notification_bell_tapped",
  NOTIFICATION_TAPPED: "notification_tapped",
  WEEKLY_DIGEST_OPENED: "weekly_digest_opened",
  BADGE_EARNED: "badge_earned",
  BADGE_TAPPED: "badge_tapped",
  AD_IMPRESSION: "ad_impression",
  AD_CLICKED: "ad_clicked",
  AFFILIATE_LINK_CLICKED: "affiliate_link_clicked",
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
