import { syncBoardCoverFromItems } from "@/lib/collection-previews";
import { isWeakPreviewImage } from "@/lib/item-preview";
import {
  extractYouTubeVideoId,
  optimizeStoredImageUrl,
  youTubeThumbnailUrl,
} from "@/lib/optimize-image-url";
import { isSupabaseStorageUrl } from "@/lib/supabase-image";
import {
  ingestRemoteImage,
} from "@/services/storage/storage.service";
import type { ItemSource } from "@/types/board.types";
import { parseSupabaseError, requireSupabase } from "@/lib/supabase-errors";
import { isSupabaseConfigured } from "@/lib/utils";
import { createClient } from "@/services/supabase/client";
import type { Comment, Item, SaveItemInput, UpdateItemInput } from "@/types/board.types";
import type { Database } from "@/types/database.types";

type ItemUpdate = Database["public"]["Tables"]["items"]["Update"];

const ITEM_SELECT = `
  *,
  item_tags(
    tag:tags(id, board_id, name, color, created_at)
  )
`;

async function resolveItemImageUrl(
  imageUrl: string | undefined | null,
  source?: ItemSource | null,
  sourceUrl?: string | null,
): Promise<string | null> {
  let url = imageUrl ?? null;
  if (url && isWeakPreviewImage(url)) url = null;

  if (!url && source === "youtube" && sourceUrl) {
    const id = extractYouTubeVideoId(sourceUrl);
    if (id) url = youTubeThumbnailUrl(id);
  }

  if (!url) return null;
  if (isSupabaseStorageUrl(url)) return url;

  const stored = await ingestRemoteImage(url, "items");
  if (stored) return stored;

  return optimizeStoredImageUrl(url, source);
}

function mapItem(row: Record<string, unknown>): Item {
  const itemTags = (row.item_tags as Array<{ tag: unknown }>) ?? [];
  const rest = { ...row };
  delete rest.item_tags;
  return {
    ...(rest as unknown as Item),
    tags: itemTags.map((it) => it.tag).filter(Boolean) as Item["tags"],
  };
}

export const ITEMS_PAGE_SIZE = 50;

export const itemsService = {
  async getItems(
    boardId: string,
    options: { page?: number; limit?: number } = {},
  ): Promise<{ items: Item[]; hasMore: boolean }> {
    if (!isSupabaseConfigured()) return { items: [], hasMore: false };
    requireSupabase();

    const page = options.page ?? 0;
    const limit = options.limit ?? ITEMS_PAGE_SIZE;
    const from = page * limit;
    const to = from + limit - 1;

    const supabase = createClient();
    const { data, error, count } = await supabase
      .from("items")
      .select(ITEM_SELECT, { count: "exact" })
      .eq("board_id", boardId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) throw error;

    const items = (data ?? []).map((row) => mapItem(row as Record<string, unknown>));
    const total = count ?? items.length;
    return {
      items,
      hasMore: from + items.length < total,
    };
  },

  async getItemById(itemId: string): Promise<Item | null> {
    if (!isSupabaseConfigured()) return null;
    requireSupabase();
    const supabase = createClient();
    const { data, error } = await supabase
      .from("items")
      .select(ITEM_SELECT)
      .eq("id", itemId)
      .single();
    if (error) return null;
    return mapItem(data as Record<string, unknown>);
  },

  async saveItem(input: SaveItemInput): Promise<Item> {
    requireSupabase();
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("You must be signed in to save items.");

    const imageUrl = await resolveItemImageUrl(
      input.imageUrl,
      input.source ?? "web",
      input.sourceUrl,
    );

    let sourceUrl = input.sourceUrl ?? null;
    if (sourceUrl) {
      try {
        const res = await fetch("/api/affiliate/rewrite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: sourceUrl }),
        });
        const data = (await res.json()) as { url?: string };
        if (data.url) sourceUrl = data.url;
      } catch {
        // keep original
      }
    }

    const { data, error } = await supabase
      .from("items")
      .insert({
        board_id: input.boardId,
        user_id: user.id,
        type: input.type,
        source_url: sourceUrl,
        image_url: imageUrl,
        title: input.title ?? null,
        description:
          input.description ??
          (input.type === "note" ? input.notes ?? null : null),
        source: input.source ?? "web",
        notes: input.notes ?? null,
      })
      .select(ITEM_SELECT)
      .single();

    if (error) throw error;

    const savedItem = mapItem(data as Record<string, unknown>);

    if (input.tags?.length) {
      for (const tagName of input.tags) {
        const { data: tag } = await supabase
          .from("tags")
          .upsert(
            { board_id: input.boardId, name: tagName },
            { onConflict: "board_id,name" },
          )
          .select()
          .single();
        const tagRow = tag as { id: string } | null;
        if (tagRow) {
          await supabase
            .from("item_tags")
            .upsert({ item_id: savedItem.id, tag_id: tagRow.id });
        }
      }
    }

    if (imageUrl) {
      const { data: board } = await supabase
        .from("boards")
        .select("cover_url")
        .eq("id", input.boardId)
        .single();
      const boardRow = board as { cover_url: string | null } | null;
      if (boardRow && !boardRow.cover_url) {
        await supabase
          .from("boards")
          .update({ cover_url: imageUrl })
          .eq("id", input.boardId);
      }
    }

    await supabase.from("activity_logs").insert({
      board_id: input.boardId,
      user_id: user.id,
      action: "saved an item",
      entity: "item",
      entity_id: savedItem.id,
      metadata: { title: input.title },
    });

    return savedItem;
  },

  async updateItem(itemId: string, input: UpdateItemInput): Promise<Item> {
    requireSupabase();
    const supabase = createClient();

    const { data: existing, error: existingError } = await supabase
      .from("items")
      .select("board_id, type, source, source_url")
      .eq("id", itemId)
      .is("deleted_at", null)
      .single();

    if (existingError || !existing) {
      throw new Error(parseSupabaseError(existingError ?? { message: "Item not found" }));
    }

    const row = existing as {
      board_id: string;
      type: string;
      source: ItemSource | null;
      source_url: string | null;
    };
    const patch: ItemUpdate = {};

    if (input.title !== undefined) patch.title = input.title;
    if (input.notes !== undefined) patch.notes = input.notes;
    if (input.description !== undefined) patch.description = input.description;
    if (input.type !== undefined) patch.type = input.type;

    let sourceUrl = input.sourceUrl;
    if (sourceUrl !== undefined && sourceUrl) {
      try {
        const res = await fetch("/api/affiliate/rewrite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: sourceUrl }),
        });
        const data = (await res.json()) as { url?: string };
        if (data.url) sourceUrl = data.url;
      } catch {
        /* keep original */
      }
      patch.source_url = sourceUrl;
    } else if (sourceUrl !== undefined) {
      patch.source_url = null;
    }

    if (input.source !== undefined) patch.source = input.source;

    if (input.imageUrl !== undefined) {
      let nextImage = input.imageUrl;
      const sourceChanged =
        input.sourceUrl !== undefined &&
        (input.sourceUrl?.trim() ?? "") !== (row.source_url?.trim() ?? "");

      // Don't keep an old Supabase preview when the link URL changed.
      if (sourceChanged && nextImage && isSupabaseStorageUrl(nextImage)) {
        nextImage = null;
      }

      patch.image_url = await resolveItemImageUrl(
        nextImage,
        input.source ?? row.source ?? "web",
        sourceUrl ?? input.sourceUrl ?? undefined,
      );
    }

    const { data, error } = await supabase
      .from("items")
      .update(patch)
      .eq("id", itemId)
      .is("deleted_at", null)
      .select(ITEM_SELECT)
      .single();

    if (error) throw new Error(parseSupabaseError(error));

    if (input.imageUrl !== undefined && row.board_id) {
      await syncBoardCoverFromItems(row.board_id);
    }

    return mapItem(data as Record<string, unknown>);
  },

  async deleteItem(itemId: string) {
    requireSupabase();
    const supabase = createClient();

    const { data: existing } = await supabase
      .from("items")
      .select("board_id")
      .eq("id", itemId)
      .is("deleted_at", null)
      .maybeSingle();

    const boardId = (existing as { board_id: string } | null)?.board_id;

    const { error: rpcError } = await supabase.rpc("soft_delete_item", {
      p_item_id: itemId,
    });

    if (rpcError) {
      const rpcMessage = parseSupabaseError(rpcError);
      const rpcMissing =
        rpcMessage.includes("soft_delete_item") ||
        rpcMessage.includes("Could not find the function");

      if (!rpcMissing) {
        throw new Error(rpcMessage);
      }

      const { error: updateError } = await supabase
        .from("items")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", itemId)
        .is("deleted_at", null);

      if (updateError) {
        throw new Error(parseSupabaseError(updateError));
      }
    }

    if (boardId) {
      await syncBoardCoverFromItems(boardId);
    }
  },
};

export const commentsService = {
  async getComments(itemId: string): Promise<Comment[]> {
    if (!isSupabaseConfigured()) return [];
    requireSupabase();
    const supabase = createClient();
    const { data, error } = await supabase
      .from("comments")
      .select("*, profile:profiles(*)")
      .eq("item_id", itemId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []) as unknown as Comment[];
  },

  async addComment(itemId: string, content: string): Promise<Comment> {
    requireSupabase();
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("You must be signed in to comment.");

    const { data: item } = await supabase
      .from("items")
      .select("board_id")
      .eq("id", itemId)
      .single();
    const itemRow = item as { board_id: string } | null;

    const { data, error } = await supabase
      .from("comments")
      .insert({
        item_id: itemId,
        user_id: user.id,
        content,
      })
      .select("*, profile:profiles(*)")
      .single();

    if (error) throw error;

    const comment = data as unknown as Comment;

    if (itemRow?.board_id) {
      await supabase.from("activity_logs").insert({
        board_id: itemRow.board_id,
        user_id: user.id,
        action: "commented on an item",
        entity: "comment",
        entity_id: comment.id,
      });
    }

    const { error: notificationError } = await supabase.rpc(
      "create_item_comment_notification",
      { p_item_id: itemId },
    );
    if (
      notificationError &&
      !parseSupabaseError(notificationError).includes(
        "create_item_comment_notification",
      )
    ) {
      throw new Error(parseSupabaseError(notificationError));
    }

    return comment;
  },
};

export const activityService = {
  async getBoardActivity(boardId: string): Promise<import("@/types/board.types").ActivityLog[]> {
    if (!isSupabaseConfigured()) return [];
    requireSupabase();
    const supabase = createClient();
    const { data: rows, error } = await supabase
      .from("activity_logs")
      .select("*")
      .eq("board_id", boardId)
      .order("created_at", { ascending: false })
      .limit(30);
    if (error) throw error;
    if (!rows?.length) return [];

    const userIds = [...new Set(rows.map((r) => r.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select(
        "id, username, full_name, avatar_url, banner_url, bio, website, created_at, updated_at",
      )
      .in("id", userIds);

    const profileById = new Map(
      (profiles ?? []).map((p) => [p.id, p]),
    );

    return rows.map((row) => ({
      ...row,
      metadata: row.metadata as Record<string, unknown> | null,
      profile: profileById.get(row.user_id),
    }));
  },
};
