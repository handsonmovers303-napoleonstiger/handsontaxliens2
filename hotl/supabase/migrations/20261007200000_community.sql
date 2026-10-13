-- Member community. Signed-in members can read every post and chat line.
-- A member can insert and delete only their own rows.
-- Anonymous visitors cannot read or write.
-- A post is not a listing.

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  author_label text not null check (char_length(btrim(author_label)) between 1 and 40),
  body text not null check (char_length(btrim(body)) between 1 and 280),
  parent_id uuid references public.community_posts (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint community_posts_no_pitch check (body !~* '(guaranteed return|will redeem|risk-free|double your money|this is sold)')
);

create table if not exists public.community_chat (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  author_label text not null check (char_length(btrim(author_label)) between 1 and 40),
  body text not null check (char_length(btrim(body)) between 1 and 180),
  created_at timestamptz not null default now(),
  constraint community_chat_no_pitch check (body !~* '(guaranteed return|will redeem|risk-free|double your money|this is sold)')
);

alter table public.community_posts enable row level security;
alter table public.community_chat enable row level security;
revoke all on public.community_posts from anon;
revoke all on public.community_chat from anon;
grant select, insert, delete on public.community_posts to authenticated;
grant select, insert, delete on public.community_chat to authenticated;

drop policy if exists community_posts_read on public.community_posts;
drop policy if exists community_posts_insert on public.community_posts;
drop policy if exists community_posts_delete on public.community_posts;
create policy community_posts_read on public.community_posts for select to authenticated using (true);
create policy community_posts_insert on public.community_posts for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and (
      parent_id is null
      or exists (
        select 1 from public.community_posts parent
        where parent.id = parent_id and parent.parent_id is null
      )
    )
  );
create policy community_posts_delete on public.community_posts for delete to authenticated
  using (author_id = (select auth.uid()));

drop policy if exists community_chat_read on public.community_chat;
drop policy if exists community_chat_insert on public.community_chat;
drop policy if exists community_chat_delete on public.community_chat;
create policy community_chat_read on public.community_chat for select to authenticated using (true);
create policy community_chat_insert on public.community_chat for insert to authenticated
  with check (author_id = (select auth.uid()));
create policy community_chat_delete on public.community_chat for delete to authenticated
  using (author_id = (select auth.uid()));

create index if not exists community_posts_created_idx on public.community_posts (created_at desc);
create index if not exists community_chat_created_idx on public.community_chat (created_at desc);

do $$
begin
  alter publication supabase_realtime add table public.community_posts;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.community_chat;
exception
  when duplicate_object then null;
end $$;
