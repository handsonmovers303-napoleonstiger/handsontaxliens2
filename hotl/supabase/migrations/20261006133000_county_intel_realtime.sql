-- Publish county_intel for Realtime only when row level security is already on.
-- A public channel, or a table with RLS off, would send every change to anyone
-- holding the anon key. This migration does not create a SELECT policy and does
-- not publish user_kv, marketplace evidence, offers, or messages.
-- The client uses a private channel and then reloads county_intel_current.
-- If this raises, leave the table unpublished and keep the 10-minute reload.

do $$
declare
  rls boolean;
begin
  if to_regclass('public.county_intel') is null then
    raise notice 'county_intel is not in this database; realtime publication skipped';
    return;
  end if;
  select c.relrowsecurity into rls
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relname = 'county_intel';
  if not coalesce(rls, false) then
    raise exception 'Refusing to publish county_intel. Row level security is off. Turn it on and add a SELECT policy before Realtime.';
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'county_intel'
  ) then
    alter publication supabase_realtime add table public.county_intel;
  end if;
end $$;
