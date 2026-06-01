-- Fix soft-delete on items (UPDATE must allow setting deleted_at)
-- Allow board admins to invite collaborators
-- Run AFTER 004 in Supabase SQL Editor

-- Item soft-delete: see 007_fix_item_soft_delete_rls.sql (006 originally missed WITH CHECK vs USING split)
drop policy if exists "items_update_v2" on items;

drop policy if exists "board_members_insert_v2" on board_members;

create policy "board_members_insert_v3"
  on board_members for insert
  with check (
    user_id = auth.uid()
    or public.is_board_owner(board_id)
    or (
      public.is_board_member(board_id)
      and exists (
        select 1 from public.board_members bm
        where bm.board_id = board_members.board_id
          and bm.user_id = auth.uid()
          and bm.role = 'admin'
      )
    )
  );

drop policy if exists "board_members_delete_v2" on board_members;

create policy "board_members_delete_v2"
  on board_members for delete
  using (
    public.is_board_owner(board_id)
    or (
      public.is_board_member(board_id)
      and exists (
        select 1 from public.board_members bm
        where bm.board_id = board_members.board_id
          and bm.user_id = auth.uid()
          and bm.role = 'admin'
      )
    )
  );
