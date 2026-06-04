-- Single round-trip like toggle (faster than multiple client queries).

create or replace function public.toggle_board_like(p_board_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_owner_id uuid;
  v_is_public boolean;
  v_deleted timestamptz;
  v_exists boolean;
  v_liked boolean;
  v_count integer;
begin
  if v_user_id is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  select b.owner_id, b.is_public, b.deleted_at
    into v_owner_id, v_is_public, v_deleted
    from public.boards b
    where b.id = p_board_id;

  if v_owner_id is null or v_deleted is not null then
    raise exception 'Collection not found';
  end if;

  if not v_is_public then
    raise exception 'Only public collections can be liked.';
  end if;

  if v_owner_id = v_user_id then
    raise exception 'You cannot like your own collection.';
  end if;

  select exists (
    select 1
    from public.board_likes bl
    where bl.board_id = p_board_id
      and bl.user_id = v_user_id
  )
  into v_exists;

  if v_exists then
    delete from public.board_likes
    where board_id = p_board_id
      and user_id = v_user_id;
    v_liked := false;
  else
    insert into public.board_likes (board_id, user_id)
    values (p_board_id, v_user_id);

    v_liked := true;

    begin
      perform public.create_board_like_notification(p_board_id);
    exception
      when others then
        null;
    end;
  end if;

  select count(*)::integer
    into v_count
    from public.board_likes
    where board_id = p_board_id;

  return jsonb_build_object('liked', v_liked, 'likeCount', v_count);
end;
$$;

revoke all on function public.toggle_board_like(uuid) from public;
grant execute on function public.toggle_board_like(uuid) to authenticated;
