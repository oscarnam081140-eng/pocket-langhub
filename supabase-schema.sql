-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)

create table if not exists public.vocab (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  word text not null,
  translation text not null,
  language text not null,
  example text,
  created_at timestamptz default now()
);

-- Index for fast lookup by user
create index if not exists vocab_user_email_idx on public.vocab (user_email);
create index if not exists vocab_language_idx on public.vocab (language);

-- Optional: enable RLS (we use service role key on server, so this is extra safety)
alter table public.vocab enable row level security;

-- No public access policies needed because we only use service role key server-side
