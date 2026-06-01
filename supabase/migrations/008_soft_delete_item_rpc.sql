-- Reliable item removal (works even when UPDATE RLS policies are misconfigured)
-- Run in Supabase SQL Editor after 003. Safe to re-run.

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

drop policy if exists "Item owner can update" on items;
drop policy if exists "Item owner can delete" on items;
drop policy if exists "items_update_v2" on items;

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

create or replace function public.soft_delete_item(p_item_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_board_id uuid;
  v_item_owner uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  select board_id, user_id
  into v_board_id, v_item_owner
  from public.items
  where id = p_item_id
    and deleted_at is null;

  if v_board_id is null then
    raise exception 'Item not found or already removed';
  end if;

  if not (
    v_item_owner = auth.uid()
    or public.can_edit_board_items(v_board_id)
  ) then
    raise exception 'Permission denied' using errcode = '42501';
  end if;

  update public.items
  set deleted_at = now()
  where id = p_item_id;
end;
$$;

revoke all on function public.soft_delete_item(uuid) from public;
grant execute on function public.soft_delete_item(uuid) to authenticated;
