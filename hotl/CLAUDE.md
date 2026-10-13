# Hands On Tax Liens — CLAUDE.md

This file is the statute. Read it first, every session.

## What this is

A field-intelligence app for tax lien and tax deed investing. **Home** shows Quantum Search, a drill-down coverage map, four categories (Counties · Properties · Auctions · OTC), and county and property dossiers where every fact opens its evidence. Behind it sit the working screens (Console, Grid, Counties, Dossiers, Missions, Scout, Routes, Auctions, Portfolio, Learning) and the full Scouting Department deck. The data is the verified tables bundled in `src/legacy/ScoutingDept.jsx`, with the team's corrections from Supabase (`hapdhoqlouxezgdpfvuu`) laid over them.

**Stack:** Vite 5, React 18, plain CSS tokens (`src/holo/holo.css`), d3-geo + us-atlas, Leaflet, Supabase (auth, RLS tables), vitest.

```bash
npm install
npm run dev              # http://localhost:5173
npm run test:blackswan   # the Black Swan Protocol — must be green before any merge
npm test                 # all tests
npm run build            # dist/ (CI sets BASE_PATH=/handsontaxliens/)
npm run build:artifact   # dist-artifact/artifact.html for the claude.ai artifact
```

## BOOT (start of every session)

1. Read `CLAUDE.md`, then `memory/MEMORY.md`, then `BOARD.md`.
2. Pick **one** card, mark it `now`, and state the plan in one sentence.
3. No off-board work. If nothing fits the request, add a card first.

## THE DATA LAWS

1. **Five evidence labels, never percentages:** Source-supported, Conflicting, Stale, Not checked, Unavailable (`src/holo/home/model.js` `LABEL`).
2. **Not on file:** a missing fact is declared as missing, never filled, estimated or guessed.
3. **`DEMO_DATA` stays `false`** in `src/legacy/ScoutingDept.jsx`.
4. **Black Swan green before every merge:** `npm run test:blackswan`. CI runs it before the build.
5. **Build corollary:** never claim a feature works unless you watched it work *this session*. An untested claim about our own code is a filled gap.

## BRANCH LAW

`main` is home and the Pages source. Each session works on a fresh `claude/*` branch and merges to `main` by PR once Black Swan is green; then the branch is deleted. A session branch never becomes the default.

## VERIFY BEFORE DONE

A card closes only with a **receipt** that names the surface and what was observed, for example `npm run test:blackswan -> 23 passed` or `drove Parcels screen at 390px, dossier opened, no console errors`. "It should work" is not a receipt.

## BOOTDOWN (last 5 minutes of every session)

1. Commit, push, open the PR.
2. Update `BOARD.md` with receipts.
3. Append **one** dated line to `LOG.md` (what happened, what's next), newest on top.
4. For a new durable fact, add one short file in `memory/` plus one index line in `memory/MEMORY.md`.
5. For an object added or removed, update its row in `OBJECTS.md`.

## Scope

One builder, one repo. No dispatch tooling, generated registries, worktrees or per-system logs. Do a step by hand ten times before automating it.
