-- Pocket LangHub Task 2 — vocab table with user_id isolation
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- Fresh install
create table if not exists public.vocab (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  user_email text,
  word text not null,
  translation text not null,
  language text not null,
  example text,
  created_at timestamptz default now()
);

create index if not exists vocab_user_id_idx on public.vocab (user_id);
create index if not exists vocab_language_idx on public.vocab (language);

alter table public.vocab enable row level security;
-- No public/anon policies: API uses SUPABASE_SERVICE_ROLE_KEY server-side only.

-- ---- Migration from July Phase 2 schema (user_email-only) ----
-- Uncomment and run once if the old table already exists:
--
-- alter table public.vocab add column if not exists user_id text;
-- alter table public.vocab add column if not exists user_email text;
-- -- Temporary backfill: copy email into user_id so old rows remain owned.
-- -- After redeploy, new writes use Auth.js token.sub; re-login may show empty
-- -- lists for users whose sub ≠ email — acceptable if table was empty / test data.
-- update public.vocab set user_id = user_email where user_id is null and user_email is not null;
-- alter table public.vocab alter column user_id set not null;
-- create index if not exists vocab_user_id_idx on public.vocab (user_id);
