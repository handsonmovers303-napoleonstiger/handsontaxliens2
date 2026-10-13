# Quantum Search

*Search every layer. Verify every answer. Show the evidence.*

"Quantum" is the product's name for searching many evidence branches at once: county records, assessor, treasurer, GIS, recorder, courts, federal data, environmental data and the auction provider. It runs on ordinary computers and uses no quantum hardware or quantum algorithms.

**Rule:** no source, no fact. A value only reaches an answer attached to the sources that support it. Its status and confidence are computed from those sources, never asserted.

## Code

| File | What it does |
| --- | --- |
| `src/quantum/core.js` | Source model, 4 authority tiers, 9 verification states, freshness thresholds, conflict detection, confidence |
| `src/quantum/evidence.js` | Turns every table on file into cited sources; builds county and parcel facts; classifies counties |
| `src/quantum/parse.js` | Query understanding: states, counties, APNs, owners, time windows, rates, acreage, platforms, mode |
| `src/quantum/engine.js` | The 12-stage pipeline and all search modes |
| `src/quantum/blackswan.js` | The Black Swan Protocol |
| `src/holo/screens/Search.jsx` | Search bar, branch view, answer view, result cards, watch engine, history |

## Search modes

- **Parcel:** by APN, account number, or alias.
- **County:** a full dossier and a classification (verified live inventory, free download, auction platform, OTC available, manual/restricted, unknown).
- **Owner:** exact and partial name matches; partial matches are marked ambiguous.
- **Auction:** state, time window, registration deadline, platform, list availability, verified-only.
- **OTC:** keeps these apart: advertised rate, maximum statutory rate, bid-down, penalty, actual certificate rate, effective return.
- **Rules:** each statement comes with its citation. Research information, not legal advice.
- **Title risk:** each category shows one of: verified record found, no record found in the searched sources, source unavailable, paid source required, or manual title search required.
- **Property risk:** each risk is shown on its own.
- **Research gaps:** what we know, what we don't know, what conflicts, what needs field verification, and what could kill the deal.
- **Also:** reject criteria, every source for a parcel, field targets.

## Verification states

| State | Meaning |
| --- | --- |
| VERIFIED | A Tier 1 source with a URL, or one a person read, and not derived |
| CORROBORATED | Two or more credible sources agree |
| PROVISIONAL | A credible source exists but needs more verification (including derived values and sources with no URL) |
| CONFLICT | Comparable sources disagree; both are shown |
| STALE | The source is past its freshness threshold |
| MISSING | No supporting record located |
| RESTRICTED | The data exists but can't be accessed here |
| PAID DATA | Official access requires payment |
| NEEDS FIELD VERIFY | Can't be resolved from records |

## Confidence

Confidence is computed from six parts:

| Part | Weight |
| --- | --- |
| Source authority | 30% |
| Freshness | 20% |
| Agreement | 20% |
| Record match | 15% |
| Identifier match | 10% |
| Manual verification | 5% |

A fact with no source has no confidence. An unresolved conflict is capped at 60%. Every score explains itself (tap "Why N%").

## The Black Swan Protocol

`npm run test:blackswan` runs the protocol, and so does every CI build. It is also in the app: tap **Black Swan Protocol** under the search bar.

Each case baits the engine into a rare, costly failure. A case passes only when the engine answers UNKNOWN, NOT VERIFIED, CONFLICT or SOURCE NEEDED instead. Every answer must also pass global invariants:

- No VERIFIED value without a primary source.
- No gap that carries a value or a confidence.
- No value without evidence and full provenance.
- No hidden conflict.
- Confidence weights sum to 100.
- No claim of quantum computing.

| ID | Case | Rule it guards |
| --- | --- | --- |
| BS01 | Phantom parcel | Never invent an APN |
| BS02 | Same parcel, different formatting | Resolve aliases, mark the weaker match |
| BS03 | Identifier collision across counties | Never silently merge identities |
| BS04 | Silence is not a clear title | Never call a title clear because nothing appeared |
| BS05 | Absence in searched sources | "No result" is never "no lien exists" |
| BS06 | An empty page is not a cancelled sale | Never infer "no sale" |
| BS07 | Two sources, two dates | Show conflicts, never merge them |
| BS08 | Rate is not return | Keep the six rate concepts apart |
| BS09 | Unverified law | Never invent a statutory rule |
| BS10 | Law cites its authority | Every statement carries its citation |
| BS11 | No quantum theater | Never claim quantum computing |
| BS12 | Missing list, not missing parcels | Missing data is not proof |
| BS13 | An estimate is not a value | Never invent a property value |
| BS14 | Quarantined data stays quarantined | Suspect data never becomes inventory |
| BS15 | Partial owner names | Never guess ownership relationships |
| BS16 | Time decay | Old sources go stale |
| BS17 | The user is not a source | Assertions in a question change nothing |
| BS18 | Legal access is never guessed | Access is a field question |
| BS19 | Name the unknowns | Surface missing intelligence |
| BS20 | Unverified state, unverified rate | Never invent a rate |
| BS21 | Verified means verified | Verified-only answers say what they left out |
| BS22 | No source, no fact (sweep) | Invariants hold across 10 queries |
| BS23 | Likely is not available | Inferred OTC availability is never "verified" |

The protocol was itself tested by breaking the engine on purpose. Six deliberate breaks were each caught:

1. Conflict detection turned off.
2. An empty title search read as clear.
3. Any source allowed to verify.
4. Freshness ignored.
5. Inferred OTC availability treated as county-confirmed.
6. The conflict confidence cap removed.

Running the protocol in the app also exposed one failure the first 22 cases missed: inferred OTC notes being shown as verified. It was fixed, and case BS23 now guards it.

## Not built yet

These are the parts of the recommended architecture that are not live. The search runs over the verified tables bundled with the app, the team's Supabase corrections, and your research.

- Crawlers, parsers and scheduled change detection.
- PostGIS and spatial queries.
- A vector index.
- Live connections to assessor, recorder, court (PACER), FEMA and EPA sources. The branch view marks each of these "not connected" rather than implying a search happened.
- AI query interpretation. Parsing is deterministic today.
