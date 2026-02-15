create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  content text not null,
  created_at timestamptz not null default now(),
  like_count integer not null default 0 check (like_count >= 0)
);

create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_user_id_idx on public.posts (user_id);

alter table public.posts enable row level security;

drop policy if exists "Posts are readable by everyone" on public.posts;
create policy "Posts are readable by everyone"
  on public.posts
  for select
  using (true);

drop policy if exists "Posts are insertable by authenticated users" on public.posts;
create policy "Posts are insertable by authenticated users"
  on public.posts
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Posts are updatable by owner" on public.posts;
create policy "Posts are updatable by owner"
  on public.posts
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Posts are deletable by owner" on public.posts;
create policy "Posts are deletable by owner"
  on public.posts
  for delete
  using (auth.uid() = user_id);

create table if not exists public.post_likes (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create index if not exists post_likes_user_id_idx on public.post_likes (user_id);
create index if not exists post_likes_created_at_idx on public.post_likes (created_at desc);

alter table public.post_likes enable row level security;

drop policy if exists "Post likes are readable by owner" on public.post_likes;
create policy "Post likes are readable by owner"
  on public.post_likes
  for select
  using (auth.uid() = user_id);

drop policy if exists "Post likes are insertable by owner" on public.post_likes;
create policy "Post likes are insertable by owner"
  on public.post_likes
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Post likes are deletable by owner" on public.post_likes;
create policy "Post likes are deletable by owner"
  on public.post_likes
  for delete
  using (auth.uid() = user_id);

create or replace function public.increment_post_like_count(target_post_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  next_count integer;
begin
  update public.posts
  set like_count = like_count + 1
  where id = target_post_id
  returning like_count into next_count;

  return next_count;
end;
$$;
