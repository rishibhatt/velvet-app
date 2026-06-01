-- Fix "Permission denied" when removing items (soft-delete via UPDATE)
-- Safe to run even if 004 or 006 were applied. Run in Supabase SQL Editor.
--
-- Root cause: migration 004's items_update_v2 required deleted_at IS NULL on the
-- NEW row (default WITH CHECK), so setting deleted_at was blocked.

-- Remove legacy / broken policies
drop policy if exists "Item owner can update" on items;
drop policy if exists "Item owner can delete" on items;
drop policy if exists "items_update_v2" on items;

-- Helper: board owner or editor/admin can modify items on the board
create or replace function public.can_edit_board_items(p_board_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.is_board_owner(p_board_id)
    or exists (
      select 1 from public.board_members bm
      where bm.board_id = p_board_id
        and bm.user_id = auth.uid()
        and bm.role in ('editor', 'admin')
    );
$$;

grant execute on function public.can_edit_board_items(uuid) to authenticated;
grant execute on function public.is_board_owner(uuid) to authenticated;
grant execute on function public.is_board_member(uuid) to authenticated;

create policy "items_update_v2"
  on items for update
  using (
    deleted_at is null
    and (
      user_id = auth.uid()
      or public.can_edit_board_items(board_id)
    )
  )
  with check (
    user_id = auth.uid()
    or public.can_edit_board_items(board_id)
  );
