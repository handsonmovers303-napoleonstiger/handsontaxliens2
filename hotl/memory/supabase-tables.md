# Supabase tables

Project **hands on tax liens general**, ref `hapdhoqlouxezgdpfvuu`, us-west-2. All public tables have RLS enabled. Checked 2026-09-28 with `list_tables` and `list_migrations`.

## Migrations

Applied in the database (from `supabase_migrations`):

| Version | Name | SQL in this repo? |
| --- | --- | --- |
| 20260922053953 | live_county_intel | **No** |
| 20260924072304 | list_intake | **No** |
| 20260924162740 | outreach | **No** |
| 20260924202240 | counties | **No** |
| 20260924202447 | answers_close_the_loop | **No** |
| 20260928013219 | user_kv_sync | Yes: `supabase/migrations/20260928000000_user_kv_sync.sql` |
| 20260928033629 | beta_feedback | Yes: `supabase/migrations/20260928010000_beta_feedback.sql` |

The first five were applied from outside this repo. Their SQL is probably still recoverable from `supabase_migrations.schema_migrations.statements` (see card HOTL-003).

## Tables and who uses them

| Table / view | Rows (09-28) | Read by | Written by |
| --- | --- | --- | --- |
| county_intel | 734 | `src/holo/screens/Search.jsx` (fact history) | `src/lib/live.js` `reportIntel` (REPORTED) |
| county_intel_current (view) | — | `src/lib/live.js` → `window.__hotlLive` | — |
| outreach | 0 | `src/legacy/outreach.js` (14-day duplicate check) | `src/legacy/outreach.js` `log` |
| outreach_latest (view) | — | `src/lib/live.js` → `window.__hotlOutreach` | — |
| parcels | 0 | `src/holo/data.js` `fetchPromotedParcels` | not written by this app |
| user_kv | 0 | `src/lib/storage.js` (research sync) | `src/lib/storage.js` |
| feedback | 0 | nobody through the API (insert-only); owner reads it in the dashboard | `src/holo/Feedback.jsx` |
| counties, intake_batches, staged_parcels, intel_review, question_fields, field_stakes, call_logs, claims, crews, profiles | various | not referenced in this app's code | — |

Reads of county_intel, outreach and parcels require a signed-in user. `feedback` accepts inserts from anon.
