-- Per-scout app state for the window.storage shim (src/lib/storage.js).
-- Applied to project hapdhoqlouxezgdpfvuu ("hands on tax liens general") on 2026-09-28.
create table if not exists public.user_kv (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  key text not null,
  value text not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);
comment on table public.user_kv is 'Per-scout app state (window.storage shim): DD records, checks, photos, verdicts, positions. Synced from the Hands On Tax Liens client.';
alter table public.user_kv enable row level security;
create policy "read own kv" on public.user_kv for select to authenticated using (user_id = (select auth.uid()));
create policy "write own kv" on public.user_kv for insert to authenticated with check (user_id = (select auth.uid()));
create policy "update own kv" on public.user_kv for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "delete own kv" on public.user_kv for delete to authenticated using (user_id = (select auth.uid()));
