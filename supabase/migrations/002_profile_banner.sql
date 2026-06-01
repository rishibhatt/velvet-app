-- Profile banner for user profile pages
alter table profiles add column if not exists banner_url text;
