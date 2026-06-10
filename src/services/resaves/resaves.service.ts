import { parseSupabaseError, requireSupabase } from "@/lib/supabase-errors";
import { createClient } from "@/services/supabase/server";
import type { Item } from "@/types/board.types";

export const resavesService = {
  async resaveItem(itemId: string, targetBoardId: string, userId: string): Promise<Item> {
    requireSupabase();
    const supabase = await createClient();

    const { data: targetBoard, error: boardErr } = await supabase
      .from("boards")
      .select("id, owner_id")
      .eq("id", targetBoardId)
      .is("deleted_at", null)
      .single();

    if (boardErr || !targetBoard || targetBoard.owner_id !== userId) {
      throw new Error("You can only save to your own collections.");
    }

    const { data: original, error: itemErr } = await supabase
      .from("items")
      .select("*")
      .eq("id", itemId)
      .is("deleted_at", null)
      .single();

    if (itemErr || !original) {
      throw new Error("Item not found.");
    }

    const { data: sourceBoard } = await supabase
      .from("boards")
      .select("owner_id, is_public")
      .eq("id", original.board_id)
      .single();

    if (!sourceBoard?.is_public) {
      throw new Error("You can only re-save items from public collections.");
    }

    if (original.board_id === targetBoardId) {
      throw new Error("Choose a different collection than the one this save is already in.");
    }

    const { data: existingResave } = await supabase
      .from("item_resaves")
      .select("id")
      .eq("original_item_id", itemId)
      .eq("resaved_by", userId)
      .eq("resaved_board_id", targetBoardId)
      .maybeSingle();

    if (existingResave) {
      throw new Error("You already saved this item to that collection.");
    }

    const { data: newItem, error: insertErr } = await supabase
      .from("items")
      .insert({
        board_id: targetBoardId,
        user_id: userId,
        type: original.type,
        source_url: original.source_url,
        image_url: original.image_url,
        title: original.title,
        description: original.description,
        source: original.source,
        notes: original.notes,
        inspired_by_item_id: original.id,
        inspired_by_board_id: original.board_id,
      })
      .select("*")
      .single();

    if (insertErr || !newItem) {
      throw new Error(parseSupabaseError(insertErr));
    }

    const { error: resaveLogErr } = await supabase.from("item_resaves").insert({
      original_item_id: original.id,
      original_board_id: original.board_id,
      original_owner_id: sourceBoard.owner_id,
      resaved_item_id: newItem.id,
      resaved_board_id: targetBoardId,
      resaved_by: userId,
    });

    if (resaveLogErr) {
      await supabase.from("items").delete().eq("id", newItem.id);
      throw new Error(parseSupabaseError(resaveLogErr));
    }

    const currentCount = original.resave_count ?? 0;
    await supabase
      .from("items")
      .update({ resave_count: currentCount + 1 })
      .eq("id", original.id);

    if (sourceBoard.owner_id !== userId) {
      await supabase.from("notifications").insert({
        recipient_id: sourceBoard.owner_id,
        actor_id: userId,
        type: "item_resaved",
        title: "Someone saved your item",
        body: "A creator added one of your saves to their collection.",
        resource_type: "item",
        resource_id: original.id,
        metadata: {
          boardId: original.board_id,
          itemId: original.id,
          targetBoardId,
        },
      });
    }

    return newItem as Item;
  },
};
