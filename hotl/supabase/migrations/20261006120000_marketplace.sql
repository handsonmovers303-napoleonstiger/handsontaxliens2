-- Secondary market for whole tax-lien certificates.
-- Trading flags and county rows are inserted disabled. Do not enable Arizona,
-- Florida, or Colorado from this file. A statute link is not an approval.
-- Members cannot update listing status, reviewer roles, or provider events directly.

create table if not exists public.marketplace_flags (
  key text primary key check (key in ('listings', 'solicitation', 'negotiation', 'transactions')),
  enabled boolean not null default false,
  legal_review_ref text,
  updated_at timestamptz,
  updated_by uuid
);

insert into public.marketplace_flags (key, enabled)
values ('listings', false), ('solicitation', false), ('negotiation', false), ('transactions', false)
on conflict (key) do nothing;

create table if not exists public.marketplace_roles (
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('reviewer')),
  granted_by uuid,
  granted_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table if not exists public.marketplace_policies (
  id uuid primary key default gen_random_uuid(),
  county_fips text not null check (county_fips ~ '^[0-9]{5}$'),
  state text not null check (state ~ '^[A-Z]{2}$'),
  county_name text not null,
  instrument text not null default 'tax_lien_certificate' check (instrument = 'tax_lien_certificate'),
  assignment_instructions text not null,
  forms jsonb not null default '[]'::jsonb,
  buyer_registration text,
  assignment_fee_cents bigint,
  fee_notes text,
  limitations text,
  official_hosts text[] not null default '{}',
  checked_on date not null,
  valid_until date not null,
  legal_review_ref text,
  enabled boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  unique (county_fips, instrument),
  constraint marketplace_policies_official_host check (enabled = false or cardinality(official_hosts) > 0)
);

create table if not exists public.marketplace_holdings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  portfolio_ref text,
  county_fips text not null,
  state text not null,
  county_name text not null,
  certificate_number text not null,
  certificate_year integer not null,
  instrument text not null default 'tax_lien_certificate',
  identity_key text not null,
  principal_cents bigint not null check (principal_cents > 0),
  original_premium_cents bigint,
  acquisition_date date,
  apn text,
  address text,
  created_at timestamptz not null default now()
);

create table if not exists public.marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  holding_id uuid references public.marketplace_holdings (id),
  county_fips text not null,
  state text not null,
  county_name text not null,
  certificate_number text not null,
  certificate_year integer not null,
  instrument text not null default 'tax_lien_certificate',
  identity_key text not null,
  principal_cents bigint not null check (principal_cents > 0),
  asking_price_cents bigint not null check (asking_price_cents > 0),
  original_premium_cents bigint,
  acquisition_date date,
  apn text,
  address text,
  statutory_terms text,
  redemption_quote_cents bigint,
  redemption_quote_date date,
  public_notes text,
  status text not null default 'draft' check (status in ('draft', 'in_review', 'active', 'paused', 'transfer_pending', 'sold', 'redeemed', 'withdrawn')),
  version integer not null default 1,
  ownership_review text not null default 'pending',
  ownership_reviewed_on date,
  ownership_reviewed_by uuid,
  evidence_coverage text,
  county_record jsonb,
  status_checked_on date,
  status_valid_until date,
  pause_reason text,
  review_failure_reason text,
  sample boolean not null default false,
  settlement_fee_cents bigint,
  activated_at timestamptz,
  first_offer_at timestamptz,
  sold_at timestamptz,
  completed_price_cents bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (sample = false)
);

create unique index if not exists marketplace_listings_one_live
  on public.marketplace_listings (identity_key)
  where status in ('in_review', 'active', 'paused', 'transfer_pending');

create table if not exists public.marketplace_evidence (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.marketplace_listings (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  storage_path text not null,
  filename text not null,
  content_type text not null,
  byte_length integer not null check (byte_length > 0 and byte_length <= 1500000),
  note text,
  released_to uuid[] not null default '{}',
  uploaded_at timestamptz not null default now()
);

create table if not exists public.marketplace_reviews (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.marketplace_listings (id) on delete cascade,
  version integer not null,
  reviewer_id uuid not null references auth.users (id),
  decision text not null check (decision in ('approve', 'reject')),
  notes text,
  created_at timestamptz not null default now(),
  check (reviewer_id is not null)
);

create table if not exists public.marketplace_requests (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references auth.users (id) on delete cascade,
  states text[] not null default '{}',
  county_fips text[] not null default '{}',
  instrument text not null default 'tax_lien_certificate',
  year_min integer,
  year_max integer,
  price_min_cents bigint,
  price_max_cents bigint,
  expires_at timestamptz not null,
  public_preference text,
  status text not null default 'open' check (status in ('open', 'expired', 'withdrawn')),
  created_at timestamptz not null default now()
);

create table if not exists public.marketplace_offers (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.marketplace_listings (id) on delete cascade,
  listing_version integer not null,
  buyer_id uuid not null references auth.users (id),
  seller_id uuid not null references auth.users (id),
  amount_cents bigint not null check (amount_cents > 0),
  expires_at timestamptz not null,
  status text not null default 'open' check (status in ('open', 'withdrawn', 'declined', 'expired', 'outdated', 'selected', 'ineligible')),
  outdated_reason text,
  terms_snapshot jsonb not null,
  created_at timestamptz not null default now(),
  check (buyer_id <> seller_id)
);

create table if not exists public.marketplace_transfers (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.marketplace_listings (id),
  offer_id uuid not null references public.marketplace_offers (id),
  seller_id uuid not null references auth.users (id),
  buyer_id uuid not null references auth.users (id),
  amount_cents bigint not null,
  listing_version integer not null,
  state text not null check (state in ('open', 'frozen', 'reconciled', 'cancelled', 'cancelled_pending_provider')),
  freeze jsonb,
  checks jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  reconciled_at timestamptz
);

create unique index if not exists marketplace_transfers_one_open
  on public.marketplace_transfers (listing_id)
  where state in ('open', 'frozen', 'cancelled_pending_provider');

create table if not exists public.marketplace_events (
  id uuid primary key default gen_random_uuid(),
  transfer_id uuid references public.marketplace_transfers (id) on delete cascade,
  event_type text not null,
  actor_id uuid,
  actor_role text,
  detail text,
  provider_event_id text,
  created_at timestamptz not null default now()
);

create unique index if not exists marketplace_events_provider_once
  on public.marketplace_events (provider_event_id)
  where provider_event_id is not null;

create table if not exists public.marketplace_watches (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.marketplace_listings (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (listing_id, user_id)
);

create table if not exists public.marketplace_threads (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.marketplace_listings (id) on delete cascade,
  buyer_id uuid not null references auth.users (id),
  seller_id uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  unique (listing_id, buyer_id)
);

create table if not exists public.marketplace_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.marketplace_threads (id) on delete cascade,
  author_id uuid not null references auth.users (id),
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.marketplace_reports (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.marketplace_listings (id) on delete cascade,
  reporter_id uuid not null references auth.users (id),
  reason text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists public.marketplace_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null,
  body text not null,
  ref jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.marketplace_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  match_alerts boolean not null default false
);

create table if not exists public.marketplace_county_requests (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references auth.users (id) on delete cascade,
  county_fips text,
  state text not null,
  county_name text not null,
  note text,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists public.marketplace_provider (
  id text primary key default 'primary',
  name text,
  legal_review_ref text,
  configured boolean not null default false,
  -- signing secret is read only by security-definer functions, never by members
  signing_secret text
);

insert into public.marketplace_provider (id, configured) values ('primary', false)
on conflict (id) do nothing;

create table if not exists public.marketplace_audit (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null,
  detail jsonb,
  created_at timestamptz not null default now()
);

-- Buyers see an allowlist, not the listing row. security_invoker makes the
-- member's own SELECT policies apply. Without it the view owner bypasses them.
create or replace view public.marketplace_catalog
with (security_invoker = true) as
select
  l.id, l.county_fips, l.state, l.county_name, l.certificate_number, l.certificate_year,
  l.instrument, l.asking_price_cents, l.principal_cents, l.original_premium_cents,
  l.apn, l.address, l.public_notes, l.statutory_terms, l.redemption_quote_cents, l.redemption_quote_date,
  l.status_checked_on, l.status_valid_until, l.ownership_review, l.ownership_reviewed_on,
  l.evidence_coverage, l.county_record - 'holder' as county_record, l.version, l.status, l.sample,
  p.assignment_instructions, p.buyer_registration, p.limitations, p.forms,
  p.assignment_fee_cents, p.checked_on as policy_checked_on, p.valid_until as policy_valid_until
from public.marketplace_listings l
left join public.marketplace_policies p on p.county_fips = l.county_fips and p.instrument = l.instrument
where l.status = 'active';

alter table public.marketplace_flags enable row level security;
alter table public.marketplace_roles enable row level security;
alter table public.marketplace_policies enable row level security;
alter table public.marketplace_holdings enable row level security;
alter table public.marketplace_listings enable row level security;
alter table public.marketplace_evidence enable row level security;
alter table public.marketplace_reviews enable row level security;
alter table public.marketplace_requests enable row level security;
alter table public.marketplace_offers enable row level security;
alter table public.marketplace_transfers enable row level security;
alter table public.marketplace_events enable row level security;
alter table public.marketplace_watches enable row level security;
alter table public.marketplace_threads enable row level security;
alter table public.marketplace_messages enable row level security;
alter table public.marketplace_reports enable row level security;
alter table public.marketplace_notifications enable row level security;
alter table public.marketplace_preferences enable row level security;
alter table public.marketplace_county_requests enable row level security;
alter table public.marketplace_provider enable row level security;
alter table public.marketplace_audit enable row level security;

-- No member insert/update/delete policies. Mutations go through market_dispatch.
create policy marketplace_flags_read on public.marketplace_flags for select to authenticated using (true);
create policy marketplace_roles_read_own on public.marketplace_roles for select to authenticated using (user_id = (select auth.uid()));
create policy marketplace_policies_read on public.marketplace_policies for select to authenticated using (enabled = true or exists (select 1 from public.marketplace_roles r where r.user_id = (select auth.uid()) and r.role = 'reviewer'));
create policy marketplace_holdings_own on public.marketplace_holdings for select to authenticated using (owner_id = (select auth.uid()));
create policy marketplace_listings_visible on public.marketplace_listings for select to authenticated using (
  status = 'active'
  or owner_id = (select auth.uid())
  or exists (select 1 from public.marketplace_roles r where r.user_id = (select auth.uid()) and r.role = 'reviewer')
);
create policy marketplace_evidence_private on public.marketplace_evidence for select to authenticated using (
  owner_id = (select auth.uid())
  or exists (select 1 from public.marketplace_roles r where r.user_id = (select auth.uid()) and r.role = 'reviewer')
  or (select auth.uid()) = any (released_to)
);
create policy marketplace_reviews_reviewer on public.marketplace_reviews for select to authenticated using (
  exists (select 1 from public.marketplace_roles r where r.user_id = (select auth.uid()) and r.role = 'reviewer')
);
create policy marketplace_requests_read on public.marketplace_requests for select to authenticated using (
  status = 'open' or buyer_id = (select auth.uid())
);
create policy marketplace_offers_parties on public.marketplace_offers for select to authenticated using (
  buyer_id = (select auth.uid()) or seller_id = (select auth.uid())
  or exists (select 1 from public.marketplace_roles r where r.user_id = (select auth.uid()) and r.role = 'reviewer')
);
create policy marketplace_transfers_parties on public.marketplace_transfers for select to authenticated using (
  buyer_id = (select auth.uid()) or seller_id = (select auth.uid())
  or exists (select 1 from public.marketplace_roles r where r.user_id = (select auth.uid()) and r.role = 'reviewer')
);
create policy marketplace_events_parties on public.marketplace_events for select to authenticated using (
  exists (
    select 1 from public.marketplace_transfers t
    where t.id = transfer_id
      and (t.buyer_id = (select auth.uid()) or t.seller_id = (select auth.uid())
        or exists (select 1 from public.marketplace_roles r where r.user_id = (select auth.uid()) and r.role = 'reviewer'))
  )
);
create policy marketplace_watches_own on public.marketplace_watches for select to authenticated using (user_id = (select auth.uid()));
create policy marketplace_threads_parties on public.marketplace_threads for select to authenticated using (
  buyer_id = (select auth.uid()) or seller_id = (select auth.uid())
  or exists (select 1 from public.marketplace_roles r where r.user_id = (select auth.uid()) and r.role = 'reviewer')
);
create policy marketplace_messages_parties on public.marketplace_messages for select to authenticated using (
  exists (
    select 1 from public.marketplace_threads t
    where t.id = thread_id
      and (t.buyer_id = (select auth.uid()) or t.seller_id = (select auth.uid())
        or exists (select 1 from public.marketplace_roles r where r.user_id = (select auth.uid()) and r.role = 'reviewer'))
  )
);
create policy marketplace_reports_own on public.marketplace_reports for select to authenticated using (
  reporter_id = (select auth.uid())
  or exists (select 1 from public.marketplace_roles r where r.user_id = (select auth.uid()) and r.role = 'reviewer')
);
create policy marketplace_notifications_own on public.marketplace_notifications for select to authenticated using (user_id = (select auth.uid()));
create policy marketplace_preferences_own on public.marketplace_preferences for select to authenticated using (user_id = (select auth.uid()));
create policy marketplace_county_requests_own on public.marketplace_county_requests for select to authenticated using (
  actor_id = (select auth.uid())
  or exists (select 1 from public.marketplace_roles r where r.user_id = (select auth.uid()) and r.role = 'reviewer')
);
create policy marketplace_provider_status on public.marketplace_provider for select to authenticated using (true);
-- Column privilege: members can see that a provider exists, not its secret.
revoke select on public.marketplace_provider from authenticated, anon;
grant select (id, name, legal_review_ref, configured) on public.marketplace_provider to authenticated;

create policy marketplace_audit_reviewer on public.marketplace_audit for select to authenticated using (
  exists (select 1 from public.marketplace_roles r where r.user_id = (select auth.uid()) and r.role = 'reviewer')
);

grant select on public.marketplace_catalog to authenticated;
grant select on public.marketplace_listings to authenticated;
grant select on public.marketplace_policies to authenticated;
revoke all on public.marketplace_listings from anon;
revoke all on public.marketplace_policies from anon;

-- Role grants are service-role only. The client cannot insert its own reviewer row.
revoke all on public.marketplace_roles from authenticated, anon;

comment on table public.marketplace_listings is
  'Whole tax-lien certificate secondary listings. Status changes only through a reviewed market_dispatch body. Flags default off.';

-- Signed-in clients have no table writes. This function is the only mutation
-- grant, and it currently refuses work. Port src/marketplace/engine.js into
-- this function before turning any trading flag on. Do not add a member
-- "mark sold" or "mark paid" path here.
create or replace function public.market_dispatch(command text, payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return jsonb_build_object('ok', false, 'code', 'FORBIDDEN', 'message', 'Sign in is required.');
  end if;
  return jsonb_build_object(
    'ok', false,
    'code', 'REMOTE_NOT_PORTED',
    'message', 'Marketplace tables are installed and member writes are locked. Signed-in commands stay off until the tested engine is ported into this function and legal review turns the flags on. Nothing was published.'
  );
end;
$$;

revoke all on function public.market_dispatch(text, jsonb) from public, anon;
grant execute on function public.market_dispatch(text, jsonb) to authenticated;

