-- Supabase SQL Editor에서 이 파일 전체를 실행하세요.
-- users(프로필) · readings(내 풀이) · feed(공개 한 줄 피드)

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  birth date not null,
  birth_time text not null,
  gender text not null,
  calendar text not null default 'solar',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.readings (
  id bigint generated always as identity primary key,
  name text,
  birth date,
  birth_time text,
  gender text,
  result text,
  created_at timestamptz default now()
);

alter table public.readings
  add column if not exists user_id uuid references public.users (id) on delete cascade;

create index if not exists readings_user_id_idx on public.readings (user_id);

-- 모두의 운세 한 줄 (공개 Realtime 피드)
create table if not exists public.feed (
  id bigint generated always as identity primary key,
  nickname text not null,
  one_liner text not null,
  created_at timestamptz default now()
);

alter table public.users enable row level security;
alter table public.readings enable row level security;
alter table public.feed enable row level security;

drop policy if exists "users_select_own" on public.users;
drop policy if exists "users_insert_own" on public.users;
drop policy if exists "users_update_own" on public.users;
drop policy if exists "readings_select_own" on public.readings;
drop policy if exists "readings_insert_own" on public.readings;
drop policy if exists "readings_delete_own" on public.readings;
drop policy if exists "feed_select_all" on public.feed;
drop policy if exists "feed_insert_auth" on public.feed;

create policy "users_select_own"
  on public.users for select
  using (auth.uid() = id);

create policy "users_insert_own"
  on public.users for insert
  with check (auth.uid() = id);

create policy "users_update_own"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "readings_select_own"
  on public.readings for select
  using (auth.uid() = user_id);

create policy "readings_insert_own"
  on public.readings for insert
  with check (auth.uid() = user_id);

create policy "readings_delete_own"
  on public.readings for delete
  using (auth.uid() = user_id);

-- feed: 읽기는 모두, 쓰기는 로그인한 사람만
create policy "feed_select_all"
  on public.feed for select
  using (true);

create policy "feed_insert_auth"
  on public.feed for insert
  with check (auth.uid() is not null);

-- Realtime: feed INSERT 구독 (이미 추가돼 있으면 무시)
do $$
begin
  alter publication supabase_realtime add table public.feed;
exception
  when duplicate_object then null;
end $$;
