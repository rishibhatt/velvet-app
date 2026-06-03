-- Allow editors (not only admins) to update collection title, description, cover, etc.
drop policy if exists "boards_update_v2" on boards;
drop policy if exists "boards_update_v3" on boards;

create policy "boards_update_v3"
  on boards for update
  using (
    deleted_at is null
    and (
      owner_id = auth.uid()
      or exists (
        select 1 from public.board_members bm
        where bm.board_id = boards.id
          and bm.user_id = auth.uid()
          and bm.role in ('admin', 'editor')
      )
    )
  )
  with check (
    deleted_at is null
    and (
      owner_id = auth.uid()
      or exists (
        select 1 from public.board_members bm
        where bm.board_id = boards.id
          and bm.user_id = auth.uid()
          and bm.role in ('admin', 'editor')
      )
    )
  );
