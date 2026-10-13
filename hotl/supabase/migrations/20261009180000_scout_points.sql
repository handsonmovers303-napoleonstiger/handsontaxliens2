-- HOTL Scout Points. Closed-loop product rewards.
-- Points are not cash, not a token, and not a claim on a tax lien.
-- Members cannot insert ledger rows. Approval, redemption, reversal, and adjustments go through functions.
-- Balances are the sum of posted ledger entries.

create table if not exists public.scout_reviewers (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.scout_rewards (
  code text primary key,
  label text not null,
  detail text not null,
  cost integer not null check (cost > 0)
);

insert into public.scout_rewards (code, label, detail, cost) values
  ('research_desk', 'Research desk for 30 days', 'Opens paid research tools on this site for 30 days. This is not a tax lien and it is not cash.', 200),
  ('photo_archive', 'Shared photo archive for 12 months', 'Keeps approved scout photos in the paid-member research layer for 12 months.', 150),
  ('subscription_credit', 'Subscription credit', 'One credit toward a Hands On Tax Liens subscription. It cannot be cashed out or used to buy a tax lien.', 800)
on conflict (code) do nothing;

create table if not exists public.scout_contributions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('county_update', 'auction_update', 'property_photo')),
  share boolean not null check (share = true),
  title text not null,
  context text not null check (char_length(btrim(context)) >= 12),
  source_url text,
  county text,
  state text,
  parcel_ref text,
  fingerprint text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'changes', 'withdrawn')),
  review_note text,
  reviewer_id uuid references auth.users (id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.scout_redemptions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references auth.users (id) on delete cascade,
  reward_code text not null references public.scout_rewards (code),
  request_key text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.scout_point_ledger (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references auth.users (id) on delete cascade,
  amount integer not null check (amount <> 0),
  entry_type text not null check (entry_type in ('earn', 'redeem', 'reversal', 'adjustment', 'expire')),
  contribution_id uuid references public.scout_contributions (id),
  redemption_id uuid references public.scout_redemptions (id),
  status text not null default 'posted' check (status = 'posted'),
  reason text not null,
  actor_id uuid,
  request_key text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists scout_ledger_member_idx on public.scout_point_ledger (member_id, created_at desc);
create index if not exists scout_contributions_member_idx on public.scout_contributions (member_id, created_at desc);
create index if not exists scout_contributions_status_idx on public.scout_contributions (status);

alter table public.scout_reviewers enable row level security;
alter table public.scout_rewards enable row level security;
alter table public.scout_contributions enable row level security;
alter table public.scout_redemptions enable row level security;
alter table public.scout_point_ledger enable row level security;

revoke all on public.scout_reviewers from anon, authenticated;
revoke all on public.scout_rewards from anon, authenticated;
revoke all on public.scout_contributions from anon, authenticated;
revoke all on public.scout_redemptions from anon, authenticated;
revoke all on public.scout_point_ledger from anon, authenticated;

grant select on public.scout_rewards to authenticated;
grant select on public.scout_contributions to authenticated;
grant select on public.scout_redemptions to authenticated;
grant select on public.scout_point_ledger to authenticated;
grant select on public.scout_reviewers to authenticated;

create or replace function public.scout_is_reviewer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.scout_reviewers where user_id = auth.uid());
$$;

drop policy if exists scout_rewards_read on public.scout_rewards;
create policy scout_rewards_read on public.scout_rewards for select to authenticated using (true);

drop policy if exists scout_reviewers_self on public.scout_reviewers;
create policy scout_reviewers_self on public.scout_reviewers for select to authenticated using (user_id = auth.uid());

drop policy if exists scout_contributions_read on public.scout_contributions;
create policy scout_contributions_read on public.scout_contributions for select to authenticated
  using (member_id = auth.uid() or public.scout_is_reviewer());

drop policy if exists scout_redemptions_read on public.scout_redemptions;
create policy scout_redemptions_read on public.scout_redemptions for select to authenticated
  using (member_id = auth.uid() or public.scout_is_reviewer());

drop policy if exists scout_ledger_read on public.scout_point_ledger;
create policy scout_ledger_read on public.scout_point_ledger for select to authenticated
  using (member_id = auth.uid() or public.scout_is_reviewer());

create or replace function public.scout_balance(uid uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(amount), 0)::integer from public.scout_point_ledger where member_id = uid;
$$;

create or replace function public.scout_my_balance()
returns integer
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'Sign in required'; end if;
  return public.scout_balance(auth.uid());
end;
$$;

create or replace function public.scout_submit(
  p_kind text,
  p_title text,
  p_context text,
  p_source_url text,
  p_county text,
  p_state text,
  p_parcel_ref text,
  p_share boolean,
  p_rules boolean
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  cid uuid;
  print text;
begin
  if uid is null then raise exception 'Sign in required'; end if;
  if p_share is not true then raise exception 'Points are only for research you choose to share with paid members'; end if;
  if p_rules is not true then raise exception 'Read the earning and redemption rules before submitting'; end if;
  if p_kind not in ('county_update', 'auction_update', 'property_photo') then raise exception 'That contribution is not eligible for points'; end if;
  if char_length(btrim(coalesce(p_context, ''))) < 12 then raise exception 'Add enough context for a reviewer to check the contribution'; end if;
  if p_kind <> 'property_photo' and coalesce(p_source_url, '') !~* '^https?://' then raise exception 'A county or auction update needs a source link'; end if;
  if p_kind = 'property_photo' and char_length(btrim(coalesce(p_parcel_ref, ''))) = 0 then raise exception 'A property photo needs the parcel it belongs to'; end if;
  print := lower(p_kind || '|' || btrim(coalesce(p_source_url, '')) || '|' || regexp_replace(btrim(p_context), '\s+', ' ', 'g') || '|' || btrim(coalesce(p_parcel_ref, '')));
  if exists (
    select 1 from public.scout_contributions
    where member_id = uid and fingerprint = print and status not in ('withdrawn', 'rejected')
  ) then
    raise exception 'That contribution is already on file. A duplicate is not rewarded';
  end if;
  insert into public.scout_contributions (member_id, kind, share, title, context, source_url, county, state, parcel_ref, fingerprint)
  values (uid, p_kind, true, coalesce(nullif(btrim(p_title), ''), 'Shared research'), btrim(p_context), nullif(btrim(p_source_url), ''), nullif(btrim(p_county), ''), nullif(btrim(p_state), ''), nullif(btrim(p_parcel_ref), ''), print)
  returning id into cid;
  return cid;
end;
$$;

create or replace function public.scout_review(p_id uuid, p_decision text, p_note text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  row public.scout_contributions%rowtype;
  award public.scout_point_ledger%rowtype;
  points integer;
  posted uuid;
begin
  if uid is null or not public.scout_is_reviewer() then raise exception 'A reviewer account is required'; end if;
  select * into row from public.scout_contributions where id = p_id;
  if row.id is null then raise exception 'That contribution is not on file'; end if;
  if p_decision = 'approve' then
    select * into award from public.scout_point_ledger where request_key = 'earn:' || row.id::text;
    if award.id is not null then return award.id; end if;
    if row.share is not true then raise exception 'A private contribution cannot be rewarded'; end if;
    if row.status in ('rejected', 'withdrawn') then raise exception 'A rejected or withdrawn contribution is not rewarded'; end if;
    points := case row.kind when 'county_update' then 25 when 'auction_update' then 20 else 15 end;
    update public.scout_contributions set status = 'approved', reviewer_id = uid, reviewed_at = now(), review_note = null where id = row.id;
    insert into public.scout_point_ledger (member_id, amount, entry_type, contribution_id, status, reason, actor_id, request_key)
    values (row.member_id, points, 'earn', row.id, 'posted', 'Approved ' || replace(row.kind, '_', ' '), uid, 'earn:' || row.id::text)
    returning id into posted;
    return posted;
  elsif p_decision = 'reject' then
    if char_length(btrim(coalesce(p_note, ''))) < 3 then raise exception 'A rejection needs a reason'; end if;
    update public.scout_contributions set status = 'rejected', reviewer_id = uid, reviewed_at = now(), review_note = btrim(p_note) where id = row.id;
    select * into award from public.scout_point_ledger where contribution_id = row.id and entry_type = 'earn';
    if award.id is null then return null; end if;
    if exists (select 1 from public.scout_point_ledger where request_key = 'reversal:' || row.id::text) then
      select id into posted from public.scout_point_ledger where request_key = 'reversal:' || row.id::text;
      return posted;
    end if;
    insert into public.scout_point_ledger (member_id, amount, entry_type, contribution_id, status, reason, actor_id, request_key)
    values (row.member_id, -award.amount, 'reversal', row.id, 'posted', 'Rejected after approval: ' || btrim(p_note), uid, 'reversal:' || row.id::text)
    returning id into posted;
    return posted;
  elsif p_decision = 'changes' then
    if row.status = 'approved' then raise exception 'An approved contribution is not sent back as a draft'; end if;
    if char_length(btrim(coalesce(p_note, ''))) < 3 then raise exception 'Say what needs to change'; end if;
    update public.scout_contributions set status = 'changes', reviewer_id = uid, reviewed_at = now(), review_note = btrim(p_note) where id = row.id;
    return null;
  else
    raise exception 'Unknown review decision';
  end if;
end;
$$;

create or replace function public.scout_withdraw(p_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  row public.scout_contributions%rowtype;
  award public.scout_point_ledger%rowtype;
  posted uuid;
begin
  if uid is null then raise exception 'Sign in required'; end if;
  select * into row from public.scout_contributions where id = p_id and member_id = uid;
  if row.id is null then raise exception 'That contribution is not on your account'; end if;
  if row.status = 'withdrawn' then
    select id into posted from public.scout_point_ledger where request_key = 'reversal:' || row.id::text;
    return posted;
  end if;
  update public.scout_contributions set status = 'withdrawn', reviewed_at = now() where id = row.id;
  select * into award from public.scout_point_ledger where contribution_id = row.id and entry_type = 'earn';
  if award.id is null then return null; end if;
  if exists (select 1 from public.scout_point_ledger where request_key = 'reversal:' || row.id::text) then
    select id into posted from public.scout_point_ledger where request_key = 'reversal:' || row.id::text;
    return posted;
  end if;
  insert into public.scout_point_ledger (member_id, amount, entry_type, contribution_id, status, reason, actor_id, request_key)
  values (row.member_id, -award.amount, 'reversal', row.id, 'posted', 'Withdrawn by the member', uid, 'reversal:' || row.id::text)
  returning id into posted;
  return posted;
end;
$$;

create or replace function public.scout_redeem(p_code text, p_request text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  reward public.scout_rewards%rowtype;
  existing uuid;
  rid uuid;
  posted uuid;
begin
  if uid is null then raise exception 'Sign in required'; end if;
  if p_request is null or btrim(p_request) = '' then raise exception 'A redemption needs a request id'; end if;
  select id into existing from public.scout_point_ledger where request_key = p_request;
  if existing is not null then return existing; end if;
  select * into reward from public.scout_rewards where code = p_code;
  if reward.code is null then raise exception 'That reward is not offered'; end if;
  if public.scout_balance(uid) < reward.cost then raise exception 'Redemption cannot reduce the balance below zero'; end if;
  insert into public.scout_redemptions (member_id, reward_code, request_key) values (uid, reward.code, p_request) returning id into rid;
  insert into public.scout_point_ledger (member_id, amount, entry_type, redemption_id, status, reason, actor_id, request_key)
  values (uid, -reward.cost, 'redeem', rid, 'posted', 'Redeemed ' || reward.label, uid, p_request)
  returning id into posted;
  return posted;
end;
$$;

create or replace function public.scout_adjust(p_member uuid, p_amount integer, p_reason text, p_request text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  existing uuid;
  posted uuid;
begin
  if uid is null or not public.scout_is_reviewer() then raise exception 'A reviewer account is required'; end if;
  if p_request is null or btrim(p_request) = '' then raise exception 'An adjustment needs a request id'; end if;
  select id into existing from public.scout_point_ledger where request_key = p_request;
  if existing is not null then return existing; end if;
  if p_amount is null or p_amount = 0 then raise exception 'An adjustment needs a non-zero whole number of points'; end if;
  if char_length(btrim(coalesce(p_reason, ''))) < 3 then raise exception 'An adjustment needs a reason'; end if;
  insert into public.scout_point_ledger (member_id, amount, entry_type, status, reason, actor_id, request_key)
  values (p_member, p_amount, 'adjustment', 'posted', btrim(p_reason), uid, p_request)
  returning id into posted;
  return posted;
end;
$$;

revoke all on function public.scout_is_reviewer() from public, anon;
revoke all on function public.scout_balance(uuid) from public, anon;
revoke all on function public.scout_my_balance() from public, anon;
revoke all on function public.scout_submit(text, text, text, text, text, text, text, boolean, boolean) from public, anon;
revoke all on function public.scout_review(uuid, text, text) from public, anon;
revoke all on function public.scout_withdraw(uuid) from public, anon;
revoke all on function public.scout_redeem(text, text) from public, anon;
revoke all on function public.scout_adjust(uuid, integer, text, text) from public, anon;

grant execute on function public.scout_is_reviewer() to authenticated;
grant execute on function public.scout_my_balance() to authenticated;
grant execute on function public.scout_submit(text, text, text, text, text, text, text, boolean, boolean) to authenticated;
grant execute on function public.scout_review(uuid, text, text) to authenticated;
grant execute on function public.scout_withdraw(uuid) to authenticated;
grant execute on function public.scout_redeem(text, text) to authenticated;
grant execute on function public.scout_adjust(uuid, integer, text, text) to authenticated;
