export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string | null;
          avatar_url: string | null;
          banner_url: string | null;
          bio: string | null;
          website: string | null;
          created_at: string;
          updated_at: string;
          total_board_views: number | null;
          weekly_reach: number | null;
          is_verified: boolean | null;
          verified_at: string | null;
          creator_score: number | null;
          email_digest_enabled: boolean | null;
        };
        Insert: {
          id: string;
          username: string;
          full_name?: string | null;
          avatar_url?: string | null;
          banner_url?: string | null;
          bio?: string | null;
          website?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          banner_url?: string | null;
          bio?: string | null;
          website?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      board_members: {
        Row: {
          id: string;
          board_id: string;
          user_id: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          board_id: string;
          user_id: string;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          board_id?: string;
          user_id?: string;
          role?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      board_likes: {
        Row: {
          board_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          board_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          board_id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      board_invitations: {
        Row: {
          id: string;
          board_id: string;
          inviter_id: string;
          invitee_id: string;
          role: string;
          status: string;
          responded_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          board_id: string;
          inviter_id: string;
          invitee_id: string;
          role: string;
          status?: string;
          responded_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          board_id?: string;
          inviter_id?: string;
          invitee_id?: string;
          role?: string;
          status?: string;
          responded_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      boards: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          slug: string | null;
          description: string | null;
          cover_url: string | null;
          mood: string | null;
          mood_label: string | null;
          is_public: boolean;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
          view_count: number | null;
          unique_view_count: number | null;
          weekly_view_count: number | null;
          last_viewed_at: string | null;
          trending_score: number | null;
          is_brand_collection: boolean | null;
          brand_name: string | null;
          brand_cta_url: string | null;
          brand_cta_text: string | null;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          slug?: string | null;
          description?: string | null;
          cover_url?: string | null;
          mood?: string | null;
          mood_label?: string | null;
          is_public?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          slug?: string | null;
          description?: string | null;
          cover_url?: string | null;
          mood?: string | null;
          mood_label?: string | null;
          is_public?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      items: {
        Row: {
          id: string;
          board_id: string;
          user_id: string;
          type: string;
          source_url: string | null;
          image_url: string | null;
          title: string | null;
          description: string | null;
          source: string | null;
          notes: string | null;
          sort_order: number;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
          resave_count: number | null;
          inspired_by_item_id: string | null;
          inspired_by_board_id: string | null;
        };
        Insert: {
          id?: string;
          board_id: string;
          user_id: string;
          type: string;
          source_url?: string | null;
          image_url?: string | null;
          title?: string | null;
          description?: string | null;
          source?: string | null;
          notes?: string | null;
          sort_order?: number;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
          resave_count?: number | null;
          inspired_by_item_id?: string | null;
          inspired_by_board_id?: string | null;
        };
        Update: {
          id?: string;
          board_id?: string;
          user_id?: string;
          type?: string;
          source_url?: string | null;
          image_url?: string | null;
          title?: string | null;
          description?: string | null;
          source?: string | null;
          notes?: string | null;
          sort_order?: number;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
          resave_count?: number | null;
          inspired_by_item_id?: string | null;
          inspired_by_board_id?: string | null;
        };
        Relationships: [];
      };
      activity_logs: {
        Row: {
          id: string;
          board_id: string;
          user_id: string;
          action: string;
          entity: string | null;
          entity_id: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          board_id: string;
          user_id: string;
          action: string;
          entity?: string | null;
          entity_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          board_id?: string;
          user_id?: string;
          action?: string;
          entity?: string | null;
          entity_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      tags: {
        Row: {
          id: string;
          board_id: string;
          name: string;
          color: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          board_id: string;
          name: string;
          color?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          board_id?: string;
          name?: string;
          color?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      item_tags: {
        Row: {
          item_id: string;
          tag_id: string;
        };
        Insert: {
          item_id: string;
          tag_id: string;
        };
        Update: {
          item_id?: string;
          tag_id?: string;
        };
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          item_id: string;
          user_id: string;
          content: string;
          parent_id: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          item_id: string;
          user_id: string;
          content: string;
          parent_id?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          item_id?: string;
          user_id?: string;
          content?: string;
          parent_id?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          recipient_id: string;
          actor_id: string | null;
          type: string;
          title: string;
          body: string | null;
          resource_type: string | null;
          resource_id: string | null;
          metadata: Json | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipient_id: string;
          actor_id?: string | null;
          type: string;
          title: string;
          body?: string | null;
          resource_type?: string | null;
          resource_id?: string | null;
          metadata?: Json | null;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          recipient_id?: string;
          actor_id?: string | null;
          type?: string;
          title?: string;
          body?: string | null;
          resource_type?: string | null;
          resource_id?: string | null;
          metadata?: Json | null;
          read_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      board_views: {
        Row: {
          id: string;
          board_id: string;
          viewer_id: string | null;
          viewer_fingerprint: string;
          viewed_at: string | null;
          source: string | null;
          referrer: string | null;
        };
        Insert: {
          id?: string;
          board_id: string;
          viewer_id?: string | null;
          viewer_fingerprint: string;
          viewed_at?: string | null;
          source?: string | null;
          referrer?: string | null;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      item_resaves: {
        Row: {
          id: string;
          original_item_id: string;
          original_board_id: string;
          original_owner_id: string;
          resaved_item_id: string;
          resaved_board_id: string;
          resaved_by: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          original_item_id: string;
          original_board_id: string;
          original_owner_id: string;
          resaved_item_id: string;
          resaved_board_id: string;
          resaved_by: string;
          created_at?: string | null;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      creator_badges: {
        Row: {
          id: string;
          profile_id: string;
          badge_type: string;
          mood: string | null;
          awarded_at: string | null;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          profile_id: string;
          badge_type: string;
          mood?: string | null;
          awarded_at?: string | null;
          expires_at?: string | null;
        };
        Update: Partial<{
          expires_at: string | null;
        }>;
        Relationships: [];
      };
      leaderboard_snapshots: {
        Row: {
          id: string;
          week_start: string;
          mood: string;
          profile_id: string;
          rank: number;
          score: number;
          week_views: number | null;
          week_likes: number | null;
          week_resaves: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          week_start: string;
          mood: string;
          profile_id: string;
          rank: number;
          score: number;
          week_views?: number | null;
          week_likes?: number | null;
          week_resaves?: number | null;
          created_at?: string | null;
        };
        Update: Partial<{
          rank: number;
          score: number;
        }>;
        Relationships: [];
      };
      ad_campaigns: {
        Row: {
          id: string;
          brand_name: string;
          brand_logo_url: string | null;
          type: string;
          target_moods: string[] | null;
          status: string | null;
          start_date: string | null;
          end_date: string | null;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      ad_units: {
        Row: {
          id: string;
          campaign_id: string;
          board_id: string | null;
          headline: string | null;
          cta_text: string | null;
          cta_url: string;
          image_url: string | null;
          placement: string;
          impressions: number | null;
          clicks: number | null;
          is_active: boolean | null;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      ad_events: {
        Row: {
          id: string;
          ad_unit_id: string;
          event_type: string;
          user_id: string | null;
          fingerprint: string | null;
          mood_context: string | null;
          occurred_at: string | null;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, never>;
        Relationships: [];
      };
      affiliate_programs: {
        Row: {
          id: string;
          name: string;
          base_domains: string[];
          tracking_param: string;
          affiliate_value: string;
          commission_notes: string | null;
          is_active: boolean | null;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      affiliate_clicks: {
        Row: {
          id: string;
          item_id: string | null;
          affiliate_program_id: string | null;
          original_url: string | null;
          rewritten_url: string | null;
          clicked_at: string | null;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, never>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      soft_delete_item: {
        Args: { p_item_id: string };
        Returns: undefined;
      };
      soft_delete_board: {
        Args: { p_board_id: string };
        Returns: undefined;
      };
      is_board_owner: {
        Args: { p_board_id: string };
        Returns: boolean;
      };
      is_board_member: {
        Args: { p_board_id: string };
        Returns: boolean;
      };
      can_edit_board_items: {
        Args: { p_board_id: string };
        Returns: boolean;
      };
      can_manage_board_invites: {
        Args: { p_board_id: string };
        Returns: boolean;
      };
      create_board_invitation: {
        Args: { p_board_id: string; p_invitee_id: string; p_role: string };
        Returns: string;
      };
      respond_board_invitation: {
        Args: { p_invitation_id: string; p_accept: boolean };
        Returns: string;
      };
      create_collaboration_request: {
        Args: { p_board_id: string; p_role?: string };
        Returns: string;
      };
      respond_collaboration_request: {
        Args: { p_request_id: string; p_accept: boolean };
        Returns: string;
      };
      create_item_comment_notification: {
        Args: { p_item_id: string };
        Returns: undefined;
      };
      create_board_like_notification: {
        Args: { p_board_id: string };
        Returns: undefined;
      };
      toggle_board_like: {
        Args: { p_board_id: string };
        Returns: Json;
      };
      get_board_preview_images: {
        Args: { p_board_ids: string[] };
        Returns: Array<{
          board_id: string;
          image_url: string;
          created_at: string;
        }>;
      };
      delete_user_account: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      get_platform_stats: {
        Args: Record<string, never>;
        Returns: Json;
      };
      increment_board_view: {
        Args: {
          p_board_id: string;
          p_is_unique: boolean;
          p_owner_id: string;
        };
        Returns: undefined;
      };
      update_all_trending_scores: {
        Args: Record<string, never>;
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
  };
}
