# Operations

## Who can restore research

`user_kv` holds a member's research. Row Level Security lets that member read their own rows. It does not let another member, or this workspace, export the table.

The restore path is the project owner, in the Supabase dashboard for `hapdhoqlouxezgdpfvuu`, using the service role. Export `public.user_kv` before a destructive change. There is no automated backup job in this repo. If the owner loses dashboard access, the rows are not recoverable from the app.

## What is not deployed from this workspace

The member site on Vercel is a separate build. Applying a migration here does not apply it there. Subscription checkout is not connected. An empty `billing_subscriptions` table means nobody has paid.

## County corrections

The `county_intel` policies were created on the live database and are not in this repo. Do not invent a replacement and apply it over the live policies. Export them from the dashboard before changing Realtime.
