# Hands On Tax Liens — Field Intelligence

**Home** puts it together: logo → Quantum Search bar (with visible scope) → drill-down coverage map → four categories (Counties · Properties · Auctions · OTC) → county and property cards that open evidence-backed dossiers beside the map (`src/holo/home/`). Every fact opens its evidence. Facts carry labels (Source-supported, Conflicting, Stale, Not checked, Unavailable), not percentages.

**Quantum Search** is the engine underneath: a verified public-record search engine for this data, with a built-in adversarial test (the Black Swan Protocol). See [`docs/QUANTUM_SEARCH.md`](docs/QUANTUM_SEARCH.md). Run the protocol with `npm run test:blackswan`.

A holographic field-research system for tax lien and tax deed investing. It has six connected screens: Explore, Analyze, Diligence, Field, Route and Results. It also keeps the full Scouting Department deck. Everything sits on the same verified data and syncs to Supabase.

```
Counties ─▶ Parcel dossiers ─▶ Due-diligence board ─▶ Field capture ─▶ Route ─▶ Outcomes
   01             02                   03                   04            05        06
```

## Data: only what is on file

Every number comes from the verified tables in `src/legacy/ScoutingDept.jsx`, plus the team's live corrections in Supabase:

| Source | What it holds |
| --- | --- |
| National county table | 3,143 counties: sale system, statutory rate, redemption, queue score, tier, verification level |
| `STATE_RULES` | State statutes verified against primary sources, with the rule text |
| `COUNTY_VERIFIED` | County terms opened and read against official sources, with links and levels |
| `PROPERTY_DB` | About 6,200 real parcels from county-published lists, scraped lists with a source, and curated lists (flagged as estimates) |
| `OUTCOME_STATS` / `OUTCOME_ROWS` | Published county sale results: sale-through, bidders, winning rates |
| Supabase `county_intel_current` | Team-verified corrections (sale dates, deadlines, phones, OTC) laid over the bundle |
| Supabase `parcels` | Parcels the team promoted from vetted intake batches |

The demo counties and parcels from the original file are compiled out (`DEMO_DATA = false`). Where a fact is not on file, the UI says **Not on file**. It never fills the gap.

## Supabase

Project `hands on tax liens general` (`hapdhoqlouxezgdpfvuu`).

- **Sign-in:** magic link, from the sync pill at the top right.
- **Live layer** (`src/lib/live.js`): loads `county_intel_current` into `window.__hotlLive` and `outreach_latest` into `window.__hotlOutreach`. Every sale-date, deadline, OTC and phone lookup reads through these.
- **Research sync** (`src/lib/storage.js`): implements the `window.storage` API that the Scouting Department uses. The app works offline first: writes land locally at once, then go up to `public.user_kv` when you are signed in and online. Row-level security means each scout sees only their own rows.
- **Outreach** (`src/legacy/outreach.js`): every county email is logged to `public.outreach` before Gmail opens, so no one writes the same treasurer twice.
- **Migrations:** `supabase/migrations/`.

Auth redirect: in the Supabase dashboard, open **Authentication → URL Configuration** and add the deployed URL (for example `https://<owner>.github.io/handsontaxliens/`) and `http://localhost:5173` to the redirect allow-list.

## Beta feedback

Every screen has a **Feedback** button (bottom right). Testers pick a type (broken, wrong data, idea, works well), write a note and optionally leave a contact. The note also records the screen, page link, browser and window size.

- Web app: rows go to `public.feedback`. Testers can insert but never read. Read them in the Supabase dashboard (**Table Editor → feedback**) or with `select * from feedback order by created_at desc;`.
- Artifact: notes go to the artifact db collection `feedback/`.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/
```

Optional environment overrides are in `.env.example`. The publishable key ships in the client by design, and row-level security guards every table.

## Claude artifact

`npm run build:artifact` writes `dist-artifact/artifact.html`, a single page with the CSS and JS inlined, for publishing as a claude.ai artifact with `capabilities: {db: {}, user: {}}`.

The artifact sandbox blocks Supabase, map tiles and GPS, so storage uses the artifact's own `db` instead (`src/lib/artifactDb.js`):

- `data/users/<id>/…` holds each scout's research: diligence records, stars, mission, pins and outcomes. It is private to that scout and synced across their devices.
- `team/…` holds field evidence the whole team sees: parcel photos (`hotl:photos:*`) and county call logs (`hotl:calls:*`).

Everything still saves locally first. Large values are split across documents, with the head part written last. Contributor access or higher is needed to save; Viewers get a read-only view. In the artifact the route map draws on a plain grid and photos carry no location.

## Deploy (GitHub Pages)

`.github/workflows/deploy.yml` builds every push and pull request, and deploys the default branch to Pages. To enable it, open **Settings → Pages** and set **Source** to **GitHub Actions**.

## Layout

```
src/
  main.jsx             storage shim + live layer, then the app
  App.jsx              shell, nav, hash routing, full-deck mount
  lib/                 supabase client, storage sync, live layer
  holo/
    holo.css           the hologram design system (tokens, materials, motion)
    ui.jsx             icons, ring meters, tilt cards, sync + sign-in
    data.js            read models over the verified tables
    store.jsx          shared state with the Scouting Department
    screens/           Command, Counties, Parcels, Board, Field, Route, Outcomes
  legacy/
    ScoutingDept.jsx   the full Scouting Department (data + deck), unchanged apart from real-data-only
    outreach.js        mail logging
docs/DESIGN_SYSTEM.md  visual direction, components, motion, React Native notes
```
