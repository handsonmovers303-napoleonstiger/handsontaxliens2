# Hologram design system

The concept is **professional intelligence software that looks like a hologram.** It is a dark command table that projects counties, parcels, diligence work, routes and outcomes as lit glass objects. Light is used to signal meaning, not to decorate.

## 1. Philosophy

- **Evidence earns the glow.** A gold edge means a Tier A county with verified county terms. Cyan means a sale is live within 60 days. Teal means cleared. A county on workbook data only stays **sealed**, dim and locked, until you open it as an investigation.
- **The score ranks what to open. The gates decide what you bid.** A parcel with a 91 score and an open stop item still reads *Research incomplete*.
- **Gaps are shown as gaps.** "Not on file", "TBD" and "not pinned" appear where values would otherwise be invented.
- **Game-like, not a game.** Mission boards, captures and progress rings measure real underwriting work.

## 2. Color and material

| Token | Value | Meaning |
| --- | --- | --- |
| Deep black `--bg` | `#05070B` | Ground |
| Graphite `--graphite` | `#0D1118` | Tactical surfaces |
| Midnight navy `--navy` | `#101927` | Glass tint |
| Dark glass `--glass` | `rgba(15,23,34,.72)` | Intelligence glass |
| Electric cyan `--cyan` | `#00E5FF` | Action, live, selected |
| Spectral blue `--blue` | `#3278FF` | Data, tax lien |
| Deep azure `--azure` | `#145BFF` | Projection light |
| Signal teal `--teal` | `#13C8C2` | OTC, hybrid |
| Emerald `--emerald` | `#18D69B` | Verified, captured, redeemed, inspected |
| Ultraviolet `--indigo` | `#745CFF` | Tax deed, delinquent lists |
| Rare gold `--gold` | `#F3C45B` | Auction ≤30 days, Tier A verified, foreclosure eligible, your bid ceiling |
| Red `--red` | `#FF5D5D` | Failed stop item, broken bid discipline only |

The five materials:

| # | Material | Class | Used for |
| --- | --- | --- | --- |
| 1 | Intelligence glass | `.glass` | Default panels: blur, top-lit 1px edge |
| 2 | Tactical glass | `.tactical` | Near-opaque; Scout mode, checklists, card layers, sheets |
| 3 | Projection surface | `.projection` | Nearly transparent plane under the map, route and mission tree |
| 4 | Signal material | `.signal` | The active object |
| 5 | Rare intelligence | `.rare-intel` | Slow gold/cyan refraction, only on Tier A counties with verified terms |

Elevation: `.elev` / `.elev.up` lifts the selected card 16px, with a floor glow.

## 3. Typography

- **UI:** Inter, 700–800 for compact headings.
- **Numbers:** JetBrains Mono with tabular figures, for every amount, APN, score and distance.
- **Micro-labels:** 10.5px, uppercase, `letter-spacing: .16em`. Cyan for section heads, gray for field names.
- **Scale:** display `clamp(28px, 4.6vw, 46px)`, h2 20, h3 15, body 13.5, stat 18–22.

## 4. Spacing and layout

- **Spacing:** 4-point steps (4, 8, 12, 16, 24, 32). Radii are 14 for panels, 9–11 for controls, 999 for chips.
- **Screen pattern:** `.split` puts a list rail (280–380px) next to a focus card. Below 980px it stacks, and choosing an item scrolls the card into view.
- **Grids:** `.g2`, `.g3`, `.g4`. All tracks are `minmax(0, 1fr)`, so there is no horizontal scroll at 390px.
- **Header:** sticky glass bar. Below 760px the nav drops to its own scrolling row.

## 5. Components

| Component | Where | Notes |
| --- | --- | --- |
| `Tilt` | County and parcel cards | Pointer-driven tilt of up to 4° plus a specular highlight; off for touch and reduced motion |
| `Ring` | Priority, DD completion, sale-through | Animated fill; `null` renders an honest empty ring |
| `Stat` | Telemetry tiles | Value, label and provenance note |
| `.node` | Diligence objectives | Status edge, STOP tag, source, evidence, who checked, confidence |
| `.holo-media` | Card identity bands | Scan lines plus a moving scan sweep |
| `.visor` | Field capture | Corner brackets, live last shot, shutter |
| `.pin` | Route map | Priority colors, pulsing start marker, animated dashed route |
| `SyncPill` | Header | Offline, queued, synced, and live-row count |

## 6. Motion

| Name | Effect | Trigger |
| --- | --- | --- |
| Materialize | Blur, brighten, then settle over 550ms | Screen, tab and sheet entry |
| Stagger | 40ms cascade | List and grid children |
| Card lift / tilt | Small 3D movement | Hover on pointer devices |
| Scan sweep | 4.8s pass | Media bands and the visor |
| Active pulse | Ring pulse | Route start, live targets |
| Route materialization | Dashed polyline flowing at 1.4s | Route map |
| Confidence meter | 1.2s ring fill | Rings, bars |
| Particle confirmation | 14-particle burst plus toast | Capture county, clear objective, record outcome |
| Verdict transition | Re-keyed materialize | DD verdict change |

All motion stops under `prefers-reduced-motion`.

## 7. Screens

1. **National intelligence grid.** All 3,143 counties on a tilted, parallax projection (us-atlas geometry). Fill shows sale type (lien, deed, hybrid), and brightness shows queue score. Nodes: sales on file (gold at 30 days or less), fresh delinquent lists, OTC, Tier A, and field missions. A selected county extrudes from the map. The command strip shows counties tracked, live inventory, upcoming auctions, OTC opportunities, verified sources and active field missions. A telemetry ticker scrolls real facts.
2. **County hologram.** A front face (sale type, next sale, rate, redemption, OTC, priority, confidence) with three layers that unfold beneath it: auction, verification, and terrain & market. The eight states are locked, discovered, investigating (scan sweep), verified, field active (nav pulse), high opportunity (gold refraction), passed (graphite) and captured (emerald).
3. **Property dossier.** Plane 01 holds the full record, with every field the spec names; gaps read "Not on file". Plane 02 is a 12-node risk matrix whose nodes expand to their checks and evidence. Plane 03 is a peelable evidence stack: the list itself, each sourced finding, the photo set, the GPS pin and field visits.
4. **Mission tree.** Eleven branches hold all 44 Scouting Department checks, plus wildfire, occupancy and code cases. Eight states: not started, researching, evidence found, needs field verify, verified, flagged, failed, and passed / N/A. Verified nodes light their path; complete branches turn emerald.
5. **Scout mode.** Mission number, distance and bearing, GPS accuracy, compass, sync and offline state. Eight photo controls (front, rear, left, right, street, access, utilities, mail/notice) and four observations (occupancy, neighbor, structure, road). Distance, compass and reticle overlays. A daylight high-contrast mode for sunlight.
6. **Route commander.** Seven sequence orders: distance (2-opt, deadline-aware), auction date, priority, value, confidence, research gap and field need. The route draws in as a fiber. Emerald means inspected, gold means a sale within 30 days, red means a failed stop item.
7. **Auction command center.** Every sale on file with countdown, platform, deposit, registration status, watched parcels, bid limits, published competition and documents. **Bid discipline** shows your ceiling, the live price and the safety margin on one track that warms from emerald through gold to red as you near your number. Results feed the portfolio and the learning engine.
8. **Portfolio & redemption.** Positions on a time axis, each running to its statutory deadline. Active positions are cyan; redeemed ones settle to emerald; foreclosure-eligible ones gain a gold edge. Returns shown: current (simple interest at your rate), projected, and actual.
9. **System learning.** Nine recorded inputs feed five outputs: confidence adjustment (call accuracy), county score change, bid-model adjustment, risk-weight adjustment and new patterns. Each is counted from your outcomes, and a node stays dark until its data exists.

### Intelligence confidence

One score from 0 to 100, drawn as a thin ring traced around the card; its length is the score. It is the weighted mean of six parts:

| Part | Weight |
| --- | --- |
| Source quality | 20% |
| Title completeness | 20% |
| Data freshness | 15% |
| Field evidence | 15% |
| County rule confidence | 15% |
| Property match | 15% |

Tap **INTEL** on any card to see the breakdown and what each part counts.

### Motion timing

- Micro-interactions: 200ms
- Panels: 380ms
- Spatial transitions: 600ms
- Map movement: 900ms

The easing is `cubic-bezier(.2,.8,.2,1)`. All motion stops under reduced motion.

## 8. Why it feels advanced

The design uses depth, light and motion to rank information, not to decorate it. Glass layers separate context from focus. Glows follow data state. Mono numerals read like telemetry. The same objects (county, parcel, objective, stop) carry through all six screens, so the system feels like a single instrument.

## 9. Implementation

**Web (this repo):** React 18 with Vite, plain CSS tokens, Leaflet with CARTO dark tiles, and Supabase JS. There is no UI framework, so the whole visual system is in `holo.css` (about 250 lines).

**React Native / Expo, if you port it:**

- **Glass:** `expo-blur` `BlurView` (intensity 40, tint "dark"), with a 1px `LinearGradient` border from `expo-linear-gradient`.
- **Glows:** `shadowColor` set to the token plus `elevation` on Android; for bloom, use a blurred duplicate layer.
- **Motion:** `react-native-reanimated`. Use `withSpring` for tilt driven by `expo-sensors` DeviceMotion (small gesture parallax) and `withTiming` for ring fills.
- **Maps:** `react-native-maps` with a dark custom style, or `@rnmapbox/maps`.
- **Offline:** `expo-sqlite` or MMKV behind the same `get` and `set` interface as `src/lib/storage.js`, synced to `user_kv`.
- **Camera and GPS:** `expo-camera` and `expo-location` (`watchPositionAsync`, accuracy High).
- **Haptics:** `expo-haptics` `notificationAsync(Success)` on clear, capture and route start.
- **Shared code:** reuse `src/holo/data.js` and the Scouting Department tables unchanged.

## 10. Micro-interactions

**Built:**

- Particle burst and toast when you clear an objective, capture a county or record an outcome.
- The verdict re-materializes when it changes.
- The route line flows and the start marker pulses.
- Angle tiles turn teal with the latest shot as their background.
- Pointer tilt with a specular highlight on focus cards.

**Suggested next:**

- Haptics on the shutter, on clearing a STOP item and on route start (`navigator.vibrate` on web, `expo-haptics` on native).
- A flash of the visor corners on capture.
- A GPS accuracy countdown while "Pin parcel here" waits for a tighter fix.
- A gold edge sweep when a Tier A card with verified terms is captured.
