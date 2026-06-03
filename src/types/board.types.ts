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

export type NotificationType = "board_invite" | "board_like" | "collab_request";

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
