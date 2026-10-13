/* The intelligence model shared by every screen: mission branches, risk nodes, the
 * eight research states, and INTELLIGENCE CONFIDENCE.
 *
 * Confidence is arithmetic over what is on file, never a prediction. Each of the six
 * parts says what it counts, and the master score is their weighted mean. */
import { ALL_ITEMS, COUNTY_VERIFIED } from "../legacy/ScoutingDept.jsx";

/* Extra checks the spec calls for that the Scouting Department's gates don't carry.
 * They live in the same dd records; the Scouting Department ignores ids it doesn't know. */
export const EXTRA_ITEMS = [
  { id: "x1", t: "Wildfire exposure", how: "Check the state wildfire risk map and the county's wildland-urban interface layer for the parcel.", where: "State forestry / wildfire risk viewer", kill: "Very high hazard with no defensible access — insurance and resale both suffer." },
  { id: "x2", t: "Occupancy status", how: "Determine whether anyone lives on or uses the property: utilities, mail, vehicles, neighbor account, posted notices.", where: "Field visit, utility shutoff records, USPS vacancy", kill: "Occupied property you have no possession plan or budget for." },
  { id: "x3", t: "Demolition orders and open code cases", how: "Search the city or county code enforcement portal for open cases, condemnation or demolition orders on the parcel.", where: "Code enforcement / building department", kill: "An open demolition order whose cost exceeds the property's value." },
];
const ITEM = new Map([...ALL_ITEMS, ...EXTRA_ITEMS].map((i) => [i.id, i]));
export const itemById = (id) => ITEM.get(id);

/** The mission tree. Every Scouting Department check sits on exactly one branch. */
export const BRANCHES = [
  { id: "identity", label: "Property identity", items: ["s1", "s3", "s9", "p5"] },
  { id: "title", label: "Title", items: ["p1", "d9", "d10", "d11", "d15", "d12", "d13", "d14", "p2", "p3"] },
  { id: "access", label: "Access", items: ["s2", "d3", "d4"] },
  { id: "env", label: "Environmental", items: ["s7", "d7", "x1", "d8", "p9", "s8"] },
  { id: "structure", label: "Structure", items: ["s6", "p6", "x3", "d5", "d6", "d17"] },
  { id: "occupancy", label: "Occupancy", items: ["x2", "b6"] },
  { id: "tax", label: "Tax history", items: ["d1", "d2"] },
  { id: "rules", label: "County rules", items: ["d18", "s4", "b4", "b5"] },
  { id: "value", label: "Market value", items: ["s5", "p7", "d16", "b1", "b2"] },
  { id: "exit", label: "Exit path", items: ["b3", "b7", "b8"] },
  { id: "field", label: "Field verification", items: ["p4", "p8"] },
];

/** The dossier's risk matrix: each node reads the checks that answer it. */
export const RISKS = [
  { id: "title", label: "Title risk", items: ["p1", "d12", "d14", "d15"] },
  { id: "access", label: "Legal access", items: ["s2", "d3", "d4"] },
  { id: "flood", label: "Flood", items: ["s7", "d7"] },
  { id: "fire", label: "Fire", items: ["x1"] },
  { id: "contam", label: "Contamination", items: ["d8", "p9"] },
  { id: "structure", label: "Structure", items: ["s6", "p6", "p4"] },
  { id: "occupancy", label: "Occupancy", items: ["x2", "b6"] },
  { id: "bk", label: "Bankruptcy", items: ["d13"] },
  { id: "fed", label: "Federal liens", items: ["d9"] },
  { id: "muni", label: "Municipal liens", items: ["d10"] },
  { id: "hoa", label: "HOA / CDD", items: ["d11"] },
  { id: "code", label: "Demolition / code", items: ["x3", "d10"] },
];

/** The eight research states. `status` is what the Scouting Department's gates read. */
export const STATES = [
  { id: "not_started", label: "Not started", status: "unchecked", tone: "" },
  { id: "researching", label: "Researching", status: "unchecked", tone: "cy" },
  { id: "evidence", label: "Evidence found", status: "unchecked", tone: "in" },
  { id: "field", label: "Needs field verify", status: "unchecked", tone: "in" },
  { id: "verified", label: "Verified", status: "clear", tone: "gr" },
  { id: "flagged", label: "Flagged", status: "flag", tone: "am" },
  { id: "failed", label: "Failed", status: "fail", tone: "rd" },
  { id: "passed", label: "Passed · N/A", status: "na", tone: "" },
];
const FROM_STATUS = { clear: "verified", flag: "flagged", fail: "failed", na: "passed", unchecked: "not_started" };
export const stateOf = (rec) => STATES.find((s) => s.id === ((rec && rec.stage) || FROM_STATUS[(rec && rec.status) || "unchecked"])) || STATES[0];
export const RESOLVED = new Set(["verified", "flagged", "failed", "passed"]);

/** A risk node's reading: FOUND if any check failed or was flagged, CLEAR if all resolved clean. */
export function riskState(risk, recs) {
  const st = risk.items.map((id) => stateOf(recs && recs[id]).id);
  if (st.includes("failed")) return { id: "failed", label: "Failed", tone: "rd" };
  if (st.includes("flagged")) return { id: "flagged", label: "Flagged", tone: "am" };
  if (st.every((s) => s === "verified" || s === "passed")) return { id: "clear", label: "Clear", tone: "gr" };
  if (st.some((s) => s !== "not_started")) return { id: "working", label: "In research", tone: "cy" };
  return { id: "open", label: "Not checked", tone: "" };
}

export const SOURCE_TYPES = ["Official record", "County staff (call)", "Auction platform", "Commercial data", "Imagery", "Field observation", "Other"];

/* ----------------------------- INTELLIGENCE CONFIDENCE ----------------------------- */
const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));
const LEVEL = { PUBLISHED: 85, SCRAPED: 75, PROMOTED: 90, CURATED: 35 };
const WEIGHTS = { source: .2, fresh: .15, title: .2, field: .15, rules: .15, match: .15 };
export const PARTS = [
  ["source", "Source quality", "How the record reached us, plus sourced findings"],
  ["fresh", "Data freshness", "Days since the list or last finding"],
  ["title", "Title completeness", "Title checks resolved"],
  ["field", "Field evidence", "Photo angles covered and visit logged"],
  ["rules", "County rule confidence", "Statute and county terms verified"],
  ["match", "Property match", "Parcel identity confirmed"],
];
export const countyRuleScore = (s) => (s.countyVerified ? 100 : s.statuteVerified && s.nOfficial ? 80 : s.statuteVerified ? 65 : 30);
const TITLE = BRANCHES.find((b) => b.id === "title").items;
const daysSince = (iso) => (iso ? (Date.now() - new Date(String(iso).slice(0, 10) + "T12:00:00")) / 86400000 : null);

/** Confidence for one parcel, from its list record and the research logged against it. */
export function parcelConfidence(p, { recs, photos, visit, pin, county }) {
  const r = recs || {};
  const sourced = Object.values(r).filter((x) => x && x.source).length;
  const official = Object.values(r).filter((x) => x && x.sourceType === "Official record").length;
  const lastFinding = Object.values(r).map((x) => x && x.date).filter(Boolean).sort().pop();
  const age = daysSince(lastFinding || p.listDate);
  const angles = new Set((photos || []).map((x) => x.cat)).size;
  const idState = stateOf(r.s1).id;
  const parts = {
    source: clamp((LEVEL[p.level] ?? 50) + Math.min(15, sourced * 2 + official * 3)),
    fresh: age == null ? 30 : clamp(100 - age / 3),
    title: clamp((TITLE.filter((id) => RESOLVED.has(stateOf(r[id]).id)).length / TITLE.length) * 100),
    field: clamp((angles / 8) * 70 + (visit && visit.completed ? 30 : 0)),
    rules: county ? countyRuleScore(county) : 30,
    match: idState === "verified" ? 100 : pin && pin.src === "gps" ? 85 : p.lat != null ? 70 : p.apn ? (p.level === "CURATED" ? 35 : 50) : 10,
  };
  return { score: clamp(Object.entries(WEIGHTS).reduce((a, [k, w]) => a + parts[k] * w, 0)), parts };
}

/** Confidence for a county: its verification plus the research done across its parcels. */
export function countyConfidence(s, { parcels = [], dd = {}, photoCount = () => 0, liveAt }) {
  const researched = parcels.filter((p) => dd[p.id] && Object.keys(dd[p.id]).length);
  const titleAvg = researched.length ? researched.reduce((a, p) => a + TITLE.filter((id) => RESOLVED.has(stateOf(dd[p.id][id]).id)).length / TITLE.length, 0) / researched.length : 0;
  // field and match are measured over the parcels you have opened research on, not the whole list
  const withPhotos = researched.filter((p) => photoCount(p.id) > 0).length;
  const matched = researched.filter((p) => stateOf(dd[p.id].s1).id === "verified").length;
  const age = daysSince(liveAt || (s.countyVerified ? COUNTY_VERIFIED.checked : "2026-09-04"));
  const parts = {
    source: clamp(s.countyVerified ? 90 : s.nOfficial ? 55 + Math.min(30, s.nOfficial * 10) : s.statuteVerified ? 45 : 25),
    fresh: clamp(100 - (age || 0) / 3),
    title: clamp(titleAvg * 100),
    field: researched.length ? clamp((withPhotos / researched.length) * 100) : 0,
    rules: countyRuleScore(s),
    match: researched.length ? clamp((matched / researched.length) * 100) : 0,
  };
  return { score: clamp(Object.entries(WEIGHTS).reduce((a, [k, w]) => a + parts[k] * w, 0)), parts };
}

/** First fact on a county card whose label matches. */
export const fact = (facts, re) => { const f = (facts || []).find(([k]) => re.test(k)); return f ? f[1] : null; };
