-- Supabase SQL Editor에서 이 파일 전체를 실행하세요.
-- users(프로필)와 readings(풀이)를 나누고 user_id로 연결합니다.

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

alter table public.users enable row level security;
alter table public.readings enable row level security;

drop policy if exists "users_select_own" on public.users;
drop policy if exists "users_insert_own" on public.users;
drop policy if exists "users_update_own" on public.users;
drop policy if exists "readings_select_own" on public.readings;
drop policy if exists "readings_insert_own" on public.readings;

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
