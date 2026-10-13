-- Account name and phone, and the subscription row a webhook may write.
-- Members can read and edit only their own profile.
-- Members can read only their own subscription. They cannot insert one.
-- billing_events has no member policy, so webhook ids are not visible and not writable from the app.
-- This file does not call Stripe and does not mark anyone paid.

create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (char_length(btrim(full_name)) between 1 and 80),
  phone text not null check (phone ~ '^[0-9]{10,15}$'),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists profiles_own_select on public.profiles;
drop policy if exists profiles_own_insert on public.profiles;
drop policy if exists profiles_own_update on public.profiles;
create policy profiles_own_select on public.profiles for select to authenticated using (user_id = (select auth.uid()));
create policy profiles_own_insert on public.profiles for insert to authenticated with check (user_id = (select auth.uid()));
create policy profiles_own_update on public.profiles for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
grant select, insert, update on public.profiles to authenticated;
revoke all on public.profiles from anon;

create table if not exists public.billing_subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  customer_id text,
  subscription_id text,
  status text not null,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.billing_subscriptions enable row level security;
drop policy if exists billing_own_select on public.billing_subscriptions;
create policy billing_own_select on public.billing_subscriptions for select to authenticated using (user_id = (select auth.uid()));
grant select on public.billing_subscriptions to authenticated;
revoke insert, update, delete on public.billing_subscriptions from authenticated, anon;

create table if not exists public.billing_events (
  event_id text primary key,
  type text not null,
  applied_at timestamptz not null default now()
);
alter table public.billing_events enable row level security;
revoke all on public.billing_events from authenticated, anon;
