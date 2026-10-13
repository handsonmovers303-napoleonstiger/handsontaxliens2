# Data discipline laws: where each is enforced

| Law | Enforced in |
| --- | --- |
| Five labels, never percentages (Source-supported, Conflicting, Stale, Not checked, Unavailable) | `src/holo/home/model.js` `LABEL`; rendered by `Label` in `src/holo/home/Evidence.jsx`. **Known gap:** the older Console screen (`src/holo/screens/Search.jsx`) still shows percentage confidence. |
| NO SOURCE = NO FACT; a missing fact is declared, never filled | `src/quantum/core.js` statuses (MISSING, RESTRICTED…) and tiers; the gap engine in `src/quantum/engine.js`; UI shows "Not on file" / "Not checked". Black Swan invariants test it. |
| Inferred data never shown as verified | `src/quantum/evidence.js`: inferred OTC notes are tier 3 and derived; `norm: null` marks non-comparable values. Case BS23. |
| DEMO_DATA = false | `src/legacy/ScoutingDept.jsx` constant; the demo counties and parcels are compiled out. |
| "Last checked", not "Live" | Home copy (`src/holo/home/`). |
| Black Swan green before merge | CI step in `.github/workflows/deploy.yml`. |
