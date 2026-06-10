export type Mood =
  | "wedding"
  | "travel"
  | "fashion"
  | "home"
  | "events"
  | "lifestyle"
  | "other";

export type BoardRole = "viewer" | "editor" | "admin";

export type BoardInvitationStatus =
  | "pending"
  | "accepted"
  | "denied"
  | "cancelled";

export type NotificationType =
  | "board_invite"
  | "board_like"
  | "collab_request"
  | "item_comment"
  | "board_viewed_milestone"
  | "item_resaved"
  | "board_featured"
  | "weekly_digest"
  | "badge_earned"
  | "collaborator_added";

export type BadgeType =
  | "verified_creator"
  | "trending"
  | "top_curator"
  | "rising_star"
  | "velvet_pick";

export type InsightsPeriod = "this_week" | "last_week" | "last_30_days";

export type CollaborationRequestStatus = "pending" | "accepted" | "denied";

export type ItemType = "url" | "image" | "video" | "note";

export type ItemSource =
  | "instagram"
  | "youtube"
  | "amazon"
  | "pinterest"
  | "web"
  | "upload";

export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  bio: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
  is_verified?: boolean;
  total_board_views?: number;
  weekly_reach?: number;
}

export interface BoardCollaborationRequest {
  id: string;
  board_id: string;
  requester_id: string;
  role: BoardRole;
  status: CollaborationRequestStatus;
  responded_at: string | null;
  created_at: string;
  requester?: Pick<
    Profile,
    "id" | "username" | "full_name" | "avatar_url"
  > | null;
}

export interface Board {
  id: string;
  owner_id: string;
  title: string;
  slug: string | null;
  description: string | null;
  cover_url: string | null;
  mood: Mood | null;
  /** Custom display name (e.g. "Nursery"); mood stays a preset slug */
  mood_label?: string | null;
  is_public: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  item_count?: number;
  like_count?: number;
  is_liked?: boolean;
  view_count?: number;
  unique_view_count?: number;
  weekly_view_count?: number;
  trending_score?: number;
  is_brand_collection?: boolean;
  brand_name?: string | null;
  resave_count?: number;
  members?: BoardMember[];
  /** Up to 4 item images for poster-style cards */
  preview_images?: string[];
  /** Populated on discover / public search results */
  owner?: Pick<Profile, "id" | "username" | "full_name" | "avatar_url">;
}

export interface BoardMember {
  id: string;
  board_id: string;
  user_id: string;
  role: BoardRole;
  created_at: string;
  profile?: Profile;
}

export interface BoardInvitation {
  id: string;
  board_id: string;
  inviter_id: string;
  invitee_id: string;
  role: BoardRole;
  status: BoardInvitationStatus;
  responded_at: string | null;
  created_at: string;
}

export interface AppNotification {
  id: string;
  recipient_id: string;
  actor_id: string | null;
  type: NotificationType;
  title: string;
  body: string | null;
  resource_type: string | null;
  resource_id: string | null;
  metadata: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
  actor?: Pick<Profile, "id" | "username" | "full_name" | "avatar_url"> | null;
}

export interface Item {
  id: string;
  board_id: string;
  user_id: string;
  type: ItemType;
  source_url: string | null;
  image_url: string | null;
  title: string | null;
  description: string | null;
  source: ItemSource | null;
  notes: string | null;
  sort_order: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
  is_favorited?: boolean;
  resave_count?: number;
  inspired_by_item_id?: string | null;
  inspired_by_board_id?: string | null;
  inspired_by?: {
    username?: string;
    board_title?: string;
    board_slug?: string;
  };
}

export interface CreatorBadge {
  id: string;
  profile_id: string;
  badge_type: BadgeType;
  mood: string | null;
  awarded_at: string;
  expires_at: string | null;
}

export interface LeaderboardEntry {
  rank: number;
  score: number;
  week_views: number;
  week_likes: number;
  week_resaves: number;
  profile: Pick<Profile, "id" | "username" | "full_name" | "avatar_url"> & {
    is_verified?: boolean;
  };
  badges?: CreatorBadge[];
}

export interface AdUnit {
  id: string;
  campaign_id: string;
  board_id: string | null;
  headline: string | null;
  cta_text: string | null;
  cta_url: string;
  image_url: string | null;
  placement: string;
  campaign?: {
    brand_name: string;
    brand_logo_url: string | null;
  };
}

export interface InsightsData {
  overview: {
    total_views: number;
    weekly_views: number;
    weekly_change_pct: number;
    total_resaves: number;
    likes: number;
    public_boards: number;
    total_boards: number;
  };
  views_by_day: { date: string; count: number }[];
  views_by_source: { source: string; count: number }[];
  top_boards: Array<{
    id: string;
    title: string;
    mood: Mood | null;
    mood_label?: string | null;
    cover_url: string | null;
    view_count: number;
    weekly_view_count: number;
    created_at: string;
  }>;
  top_items: Array<{
    id: string;
    title: string | null;
    image_url: string | null;
    resave_count: number | null;
    board_id: string;
  }>;
  recent_resaves: unknown[];
  badges: CreatorBadge[];
  leaderboard_ranks: Array<{ mood: string; rank: number; score: number }>;
  username: string;
}

export interface Tag {
  id: string;
  board_id: string;
  name: string;
  color: string | null;
  created_at: string;
}

export interface Comment {
  id: string;
  item_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  profile?: Profile;
  likes?: number;
}

export interface ActivityLog {
  id: string;
  board_id: string;
  user_id: string;
  action: string;
  entity: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  profile?: Profile;
}

export interface CreateBoardInput {
  title: string;
  mood: Mood;
  moodLabel?: string | null;
  isPublic: boolean;
  description?: string;
}

export interface UpdateBoardInput {
  title?: string;
  description?: string | null;
  isPublic?: boolean;
  coverUrl?: string | null;
  mood?: Mood;
}

export interface SaveItemInput {
  boardId: string;
  type: ItemType;
  sourceUrl?: string;
  imageUrl?: string;
  title?: string;
  description?: string;
  source?: ItemSource;
  notes?: string;
  tags?: string[];
}

export interface UrlMetadata {
  title: string;
  imageUrl: string | null;
  description: string | null;
  source: ItemSource;
}
