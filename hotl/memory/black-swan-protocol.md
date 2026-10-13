# Black Swan Protocol

An adversarial test of Quantum Search. It throws hostile and edge-case queries at the engine and checks that it never states a fact without a source.

- **Cases:** `src/quantum/blackswan.js` — 23 cases (BS01–BS23) plus invariants checked on every answer (no fact without a source, labels only, conflicts capped, and so on).
- **Test file:** `tests/blackswan.test.js`.
- **Run:** `npm run test:blackswan` (verbose) or `npm test`.
- **CI gate:** `.github/workflows/deploy.yml` runs it after `npm ci` and before `npm run build`. A red protocol stops the Pages deploy.
- **Proven:** 6 injected faults were all caught (mutation test, 2026-09). Last green: 23 passed locally and in CI run 36374588131 on 2026-09-28.
- **Add a case** whenever a search bug is fixed, so the fix stays proven (BS23 came from inferred OTC notes that had been shown as VERIFIED).
- Engine docs: `docs/QUANTUM_SEARCH.md`.
