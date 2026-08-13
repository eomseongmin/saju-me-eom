-- Table Editor 대신 SQL Editor에서 실행해도 됩니다.
-- RLS는 오늘 실습용으로 끕니다.

create table if not exists public.readings (
  id bigint generated always as identity primary key,
  name text,
  birth date,
  birth_time text,
  gender text,
  result text,
  created_at timestamptz default now()
);

alter table public.readings disable row level security;
