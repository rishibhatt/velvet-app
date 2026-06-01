-- Velvet Database Migration
-- Run this in your Supabase SQL editor

create extension if not exists "uuid-ossp";

create table profiles (
  id          uuid references auth.users on delete cascade primary key,
  username    text unique not null,
  full_name   text,
  avatar_url  text,
  bio         text,
  website     text,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

create table boards (
  id           uuid default uuid_generate_v4() primary key,
  owner_id     uuid references profiles(id) on delete cascade not null,
  title        text not null,
  description  text,
  cover_url    text,
  mood         text check (mood in ('wedding','travel','fashion','home','events','lifestyle','other')),
  is_public    boolean default false not null,
  deleted_at   timestamptz,
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null
);

create table board_members (
  id         uuid default uuid_generate_v4() primary key,
  board_id   uuid references boards(id) on delete cascade not null,
  user_id    uuid references profiles(id) on delete cascade not null,
  role       text check (role in ('viewer','editor','admin')) default 'viewer',
  created_at timestamptz default now() not null,
  unique(board_id, user_id)
);

create table items (
  id           uuid default uuid_generate_v4() primary key,
  board_id     uuid references boards(id) on delete cascade not null,
  user_id      uuid references profiles(id) on delete cascade not null,
  type         text check (type in ('url','image','video','note')) not null,
  source_url   text,
  image_url    text,
  title        text,
  description  text,
  source       text check (source in ('instagram','youtube','amazon','pinterest','web','upload')),
  notes        text,
  sort_order   integer default 0,
  deleted_at   timestamptz,
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null
);

create table tags (
  id         uuid default uuid_generate_v4() primary key,
  board_id   uuid references boards(id) on delete cascade not null,
  name       text not null,
  color      text,
  created_at timestamptz default now() not null,
  unique(board_id, name)
);

create table item_tags (
  item_id uuid references items(id) on delete cascade,
  tag_id  uuid references tags(id) on delete cascade,
  primary key (item_id, tag_id)
);

create table comments (
  id         uuid default uuid_generate_v4() primary key,
  item_id    uuid references items(id) on delete cascade not null,
  user_id    uuid references profiles(id) on delete cascade not null,
  content    text not null,
  parent_id  uuid references comments(id) on delete cascade,
  deleted_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table activity_logs (
  id         uuid default uuid_generate_v4() primary key,
  board_id   uuid references boards(id) on delete cascade not null,
  user_id    uuid references profiles(id) on delete cascade not null,
  action     text not null,
  entity     text,
  entity_id  uuid,
  metadata   jsonb,
  created_at timestamptz default now() not null
);

create index on boards(owner_id);
create index on boards(created_at desc);
create index on board_members(board_id);
create index on board_members(user_id);
create index on items(board_id);
create index on items(created_at desc);
create index on comments(item_id);
create index on activity_logs(board_id);
create index on activity_logs(created_at desc);

alter table profiles enable row level security;
alter table boards enable row level security;
alter table board_members enable row level security;
alter table items enable row level security;
alter table tags enable row level security;
alter table item_tags enable row level security;
alter table comments enable row level security;
alter table activity_logs enable row level security;

create policy "Public profiles viewable by all" on profiles for select using (true);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);

create policy "Public boards viewable" on boards for select using (is_public = true or owner_id = auth.uid() or exists(select 1 from board_members where board_id = boards.id and user_id = auth.uid()));
create policy "Owner can insert board" on boards for insert with check (owner_id = auth.uid());
create policy "Owner/admin can update board" on boards for update using (owner_id = auth.uid() or exists(select 1 from board_members where board_id = boards.id and user_id = auth.uid() and role = 'admin'));
create policy "Owner can delete board" on boards for delete using (owner_id = auth.uid());

create policy "Board members view items" on items for select using (exists(select 1 from boards b left join board_members bm on bm.board_id = b.id where b.id = items.board_id and (b.is_public or b.owner_id = auth.uid() or bm.user_id = auth.uid())));
create policy "Members can insert items" on items for insert with check (exists(select 1 from board_members where board_id = items.board_id and user_id = auth.uid() and role in ('editor','admin')) or exists(select 1 from boards where id = items.board_id and owner_id = auth.uid()));
create policy "Item owner can update" on items for update using (user_id = auth.uid());
create policy "Item owner can delete" on items for delete using (user_id = auth.uid());

create or replace function handle_updated_at()
returns trigger as $$ begin new.updated_at = now(); return new; end; $$
language plpgsql;

create trigger on_profiles_updated before update on profiles for each row execute function handle_updated_at();
create trigger on_boards_updated before update on boards for each row execute function handle_updated_at();
create trigger on_items_updated before update on items for each row execute function handle_updated_at();
create trigger on_comments_updated before update on comments for each row execute function handle_updated_at();

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    split_part(new.email, '@', 1),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();
