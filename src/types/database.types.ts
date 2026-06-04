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
    };
    Enums: Record<string, never>;
  };
}
