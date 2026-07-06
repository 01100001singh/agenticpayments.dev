-- Subscribers table for agenticpayments.dev
-- Run once in the Supabase SQL editor.

create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  source text,                       -- page path the signup came from
  created_at timestamptz not null default now()
);

alter table public.subscribers enable row level security;

-- The anon key may INSERT and nothing else: no select, update, or delete.
create policy "anon can subscribe"
  on public.subscribers
  for insert
  to anon
  with check (true);

-- Duplicate emails return 409 to the client (unique constraint), which the
-- form treats as "already subscribed".
