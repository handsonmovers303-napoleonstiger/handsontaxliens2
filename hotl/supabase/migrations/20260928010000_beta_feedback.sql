-- Beta feedback: anyone testing the app can send a note; nobody can read notes
-- back through the API. The owner reads them in the Supabase dashboard.
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid default auth.uid() references auth.users(id) on delete set null,
  kind text not null default 'idea' check (kind in ('bug', 'idea', 'data', 'praise')),
  message text not null check (char_length(message) between 1 and 4000),
  contact text check (contact is null or char_length(contact) <= 200),
  screen text check (screen is null or char_length(screen) <= 60),
  url text check (url is null or char_length(url) <= 500),
  user_agent text check (user_agent is null or char_length(user_agent) <= 400),
  viewport text check (viewport is null or char_length(viewport) <= 40)
);
alter table public.feedback enable row level security;
revoke all on public.feedback from anon, authenticated;
grant insert (kind, message, contact, screen, url, user_agent, viewport) on public.feedback to anon, authenticated;
drop policy if exists "anyone can send feedback" on public.feedback;
create policy "anyone can send feedback" on public.feedback
  for insert to anon, authenticated
  with check (char_length(message) between 1 and 4000 and (user_id is null or user_id = (select auth.uid())));
create index if not exists feedback_user_id_idx on public.feedback (user_id);
