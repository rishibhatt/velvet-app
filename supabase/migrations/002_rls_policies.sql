-- Additional RLS policies for full Velvet flow

-- board_members
create policy "View board members for accessible boards"
  on board_members for select
  using (
    exists (
      select 1 from boards b
      where b.id = board_members.board_id
        and b.deleted_at is null
        and (
          b.owner_id = auth.uid()
          or b.is_public = true
          or exists (
            select 1 from board_members bm
            where bm.board_id = b.id and bm.user_id = auth.uid()
          )
        )
    )
  );

create policy "Owner can add board members"
  on board_members for insert
  with check (
    exists (
      select 1 from boards b
      where b.id = board_members.board_id
        and b.owner_id = auth.uid()
    )
    or user_id = auth.uid()
  );

-- activity_logs
create policy "Board members view activity"
  on activity_logs for select
  using (
    exists (
      select 1 from boards b
      where b.id = activity_logs.board_id
        and (
          b.owner_id = auth.uid()
          or exists (
            select 1 from board_members bm
            where bm.board_id = b.id and bm.user_id = auth.uid()
          )
        )
    )
  );

create policy "Members can insert activity"
  on activity_logs for insert
  with check (user_id = auth.uid());

-- tags
create policy "Board members view tags"
  on tags for select
  using (
    exists (
      select 1 from boards b
      where b.id = tags.board_id
        and (b.owner_id = auth.uid() or b.is_public = true
          or exists (select 1 from board_members bm where bm.board_id = b.id and bm.user_id = auth.uid()))
    )
  );

create policy "Members can manage tags"
  on tags for insert
  with check (
    exists (
      select 1 from boards b
      where b.id = tags.board_id and b.owner_id = auth.uid()
    )
  );

-- item_tags
create policy "View item tags for accessible items"
  on item_tags for select
  using (
    exists (
      select 1 from items i
      join boards b on b.id = i.board_id
      where i.id = item_tags.item_id
        and (b.owner_id = auth.uid() or b.is_public = true
          or exists (select 1 from board_members bm where bm.board_id = b.id and bm.user_id = auth.uid()))
    )
  );

create policy "Members can link item tags"
  on item_tags for insert
  with check (
    exists (
      select 1 from items i
      join boards b on b.id = i.board_id
      where i.id = item_tags.item_id and b.owner_id = auth.uid()
    )
  );

-- comments policies
create policy "View comments on accessible items"
  on comments for select
  using (
    exists (
      select 1 from items i
      join boards b on b.id = i.board_id
      where i.id = comments.item_id
        and (b.owner_id = auth.uid() or b.is_public = true
          or exists (select 1 from board_members bm where bm.board_id = b.id and bm.user_id = auth.uid()))
    )
  );

create policy "Authenticated users can comment"
  on comments for insert
  with check (user_id = auth.uid());

create policy "Users update own comments"
  on comments for update
  using (user_id = auth.uid());
