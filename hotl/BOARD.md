# Board

**Rules:**
- Pick **one** card at boot and mark it `now`.
- A card closes only with a receipt naming the surface and the observed result.
- Done cards move to DONE and are never deleted.
- Work that isn't on the board gets a card first.

## OPEN

| id | title | status | done when | receipt |
| --- | --- | --- | --- | --- |
| HOTL-001 | Make `main` home | now | `main` exists with this history; `main` is the repo's default branch; `claude/serene-cray-lnlmhu` deleted; a Pages run from `main` deploys | **Blocked on owner approval:** pushing a new `main` was refused by the session's permission guard (2026-09-28). Owner creates `main` (or approves the push), sets it as default (Settings → General → Default branch), enables Pages (Settings → Pages → Source: GitHub Actions), then deletes the old branch. |
| HOTL-003 | Schema on file | open | SQL for the 5 migrations applied outside this repo (live_county_intel, list_intake, outreach, counties, answers_close_the_loop) is in `supabase/migrations/` with its original versions, covering county_intel, county_intel_current, outreach, outreach_latest, parcels | — |
| HOTL-004 | Fix the README screen list | open | README names the real screens (Home + 10 in `src/holo/screens/` + Full deck) and the layout section matches the tree | — |
| HOTL-005 | Weekly: read the feedback table | open (recurring) | Each week every new `public.feedback` row becomes a card or a dismissed-with-reason line in LOG.md | — |
| HOTL-006 | Console shows percentages | open | `src/holo/screens/Search.jsx` uses the five labels instead of percentage confidence, and Black Swan stays green | — |

## DONE

| id | title | done when | receipt |
| --- | --- | --- | --- |
| HOTL-002 | Adopt the kit (CLAUDE.md, memory/, BOARD.md, OBJECTS.md, LOG.md) | the five files exist on the default branch with facts checked this session (they reach `main` with HOTL-001) | 2026-09-28: files committed; code references grep-checked (DEMO_DATA=false at ScoutingDept.jsx:16, LABEL at model.js:13, reportIntel in live.js); Supabase `list_tables` + `list_migrations` read for memory/supabase-tables.md; `npm run test:blackswan -> 23 passed` |
