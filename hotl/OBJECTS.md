# Objects

One row per thing that exists. **Verified** uses the project's own labels:
- **Source-supported:** proven by a check that runs, or was watched working.
- **Conflicting:** what's on file disagrees with what's live.
- **Stale:** was true, has drifted.
- **Not checked:** exists, never proven.
- **Unavailable:** can't be checked from here.

| name | kind | where | verified |
| --- | --- | --- | --- |
| Home (Quantum Intelligence Home) | screen | `src/holo/home/` (Home, IntelMap, Cards, Dossiers, Evidence, model) | Source-supported: search → county → parcel → evidence flow driven in Playwright, desktop and phone, 2026-09-28 |
| Console | screen | `src/holo/screens/Search.jsx` | Conflicting: still shows percentages, against the label law (HOTL-006) |
| Grid | screen | `src/holo/screens/Grid.jsx` | Source-supported: smoke test, no errors or overflow, 2026-09 |
| Counties | screen | `src/holo/screens/Counties.jsx` | Source-supported: smoke test + feedback test at 390px, 2026-09-28 |
| Dossiers (Parcels) | screen | `src/holo/screens/Parcels.jsx` | Source-supported: smoke test, 2026-09 |
| Missions (Board) | screen | `src/holo/screens/Board.jsx` | Source-supported: smoke test, 2026-09 |
| Scout (Field) | screen | `src/holo/screens/Field.jsx` | Source-supported: smoke test, 2026-09; camera/GPS on a real phone Not checked |
| Routes | screen | `src/holo/screens/Route.jsx` | Source-supported: smoke test, 2026-09 |
| Auctions | screen | `src/holo/screens/Auctions.jsx` | Source-supported: smoke test, 2026-09 |
| Portfolio | screen | `src/holo/screens/Portfolio.jsx` | Source-supported: smoke test, 2026-09 |
| Learning | screen | `src/holo/screens/Learning.jsx` | Source-supported: smoke test, 2026-09 |
| Full deck (Scouting Department) | screen + data | `src/legacy/ScoutingDept.jsx` | Source-supported: mounts in smoke test; DEMO_DATA=false |
| App shell | shell | `src/App.jsx` | Source-supported: hash routing and shortcut driven, 2026-09 |
| Feedback button | component | `src/holo/Feedback.jsx` | Source-supported for UI and RLS (anon insert in a rolled-back transaction, 2026-09-28); a real insert from a live browser is Not checked |
| Quantum engine | library | `src/quantum/` (core, evidence, parse, engine, intelBridge) | Source-supported: Black Swan in CI on every push |
| Black Swan Protocol | test | `src/quantum/blackswan.js`, `tests/blackswan.test.js` | Source-supported: 23 passed, CI run 36374588131 |
| Supabase client | library | `src/lib/supabase.js` | Not checked this session |
| Research sync (storage shim) | library | `src/lib/storage.js` | Not checked this session (no signed-in test) |
| Live layer | library | `src/lib/live.js` | Not checked this session |
| Artifact db backend | library | `src/lib/artifactDb.js` | Source-supported: artifact v6 published 2026-09-28; cross-device sync Not checked |
| Outreach logger | library | `src/legacy/outreach.js` | Not checked |
| Geography | library | `src/holo/geo.js` | Source-supported: map renders in Home flow |
| county_intel + county_intel_current | table + view | Supabase | Conflicting: live (734 rows), migration not in repo (HOTL-003) |
| outreach + outreach_latest | table + view | Supabase | Conflicting: live, migration not in repo (HOTL-003) |
| parcels | table | Supabase | Conflicting: live (0 rows), migration not in repo (HOTL-003) |
| user_kv | table | Supabase + `supabase/migrations/20260928000000_user_kv_sync.sql` | Source-supported: migration on file, advisors clean |
| feedback | table | Supabase + `supabase/migrations/20260928010000_beta_feedback.sql` | Source-supported: migration on file, RLS tested 2026-09-28 |
| Other tables (counties, intake_batches, staged_parcels, intel_review, question_fields, field_stakes, call_logs, claims, crews, profiles) | tables | Supabase | Conflicting: live, not in repo, unused by this app |
| Build and deploy workflow | CI | `.github/workflows/deploy.yml` | Conflicting: build green; deploy fails because Pages is not enabled (HOTL-001) |
| Artifact build | script | `scripts/build-artifact.mjs` | Source-supported: built and published 2026-09-28 |
| Claude artifact | deployment | https://claude.ai/artifact/5ppEAEY3M1DMMDa4eZNZiR | Source-supported: v6 live, private |
| GitHub Pages site | deployment | https://handsonmovers303-napoleonstiger.github.io/handsontaxliens/ | Unavailable: never deployed |
| README.md | doc | repo root | Stale: says six screens (HOTL-004) |
| DESIGN_SYSTEM.md | doc | `docs/` | Not checked since the Home redesign |
| QUANTUM_SEARCH.md | doc | `docs/` | Not checked this session |
| Kit (CLAUDE.md, memory/, BOARD.md, OBJECTS.md, LOG.md) | docs | repo root | Source-supported: written and checked 2026-09-28 |
