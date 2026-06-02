-- Fix "Permission denied" when deleting collections (soft-delete via UPDATE)
-- Root cause: boards_update_v2 USING requires deleted_at IS NULL on the NEW row (default WITH CHECK).

drop policy if exists "Owner/admin can update board" on boards;
drop policy if exists "boards_update_v2" on boards;

create policy "boards_update_v2"
  on boards for update
  using (
    deleted_at is null
    and (
      owner_id = auth.uid()
      or (
        public.is_board_member(id)
        and exists (
          select 1 from public.board_members bm
          where bm.board_id = boards.id
            and bm.user_id = auth.uid()
            and bm.role = 'admin'
        )
      )
    )
  )
  with check (
    owner_id = auth.uid()
    or (
      public.is_board_member(id)
      and exists (
        select 1 from public.board_members bm
        where bm.board_id = boards.id
          and bm.user_id = auth.uid()
          and bm.role = 'admin'
      )
    )
  );

create or replace function public.soft_delete_board(p_board_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.boards b
    where b.id = p_board_id
      and b.deleted_at is null
      and b.owner_id = auth.uid()
  ) then
    raise exception 'Permission denied' using errcode = '42501';
  end if;

  update public.boards
  set deleted_at = now()
  where id = p_board_id;
end;
$$;

revoke all on function public.soft_delete_board(uuid) from public;
grant execute on function public.soft_delete_board(uuid) to authenticated;
