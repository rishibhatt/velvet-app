export type TrackedLinkPreset =
  | "share_collection"
  | "share_profile"
  | "share_item"
  | "email_digest"
  | "internal_explore"
  | "internal_search"
  | "internal_tag"
  | "internal_category"
  | "internal_home";

export type BoardViewSource =
  | "explore"
  | "direct"
  | "share"
  | "search"
  | "category"
  | "tag";

export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  fbclid?: string;
  msclkid?: string;
}

export interface AttributionSnapshot extends UtmParams {
  captured_at: string;
}

export interface PresetContext {
  username?: string;
  slug?: string;
  boardId?: string;
  itemId?: string;
  userId?: string;
  query?: string;
  mood?: string;
}

export interface BuildTrackedUrlOptions extends PresetContext {
  /** Product traffic source for board_views.source */
  src?: BoardViewSource | string;
  extraQuery?: Record<string, string | undefined>;
}
