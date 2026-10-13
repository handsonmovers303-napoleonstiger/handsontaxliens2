/* Read models for the hologram screens. Every value comes from the Scouting
 * Department's verified tables (and the live Supabase overlay they read through).
 * Nothing here scores, estimates or fills a gap: an unknown stays "Not on file". */
import {
  NATIONAL, NAT_BY_NAME, STATE_NAMES, nationalCounty, fipsOf, NEXT_SALE, SALE_DATE_LEVEL, SALE_WINDOW, SALE_HELD,
  HARD_DEADLINES, rulesFor, COUNTY_VERIFIED, OUTCOME_STATS, OUTCOME_ROWS, otcFor, phoneFor, primarySite, dbLinks,
  PROPERTY_DB, decodeProps, PROP_LEVEL, listTraits, ALL_ITEMS, STOP_ITEMS, ddVerdict, FINDINGS, findingState, SEATS,
} from "../legacy/ScoutingDept.jsx";
import { supabase } from "../lib/supabase";
import { readLocation, normApn } from "./propertyRecord";
import { presentLink } from "./linkCheck";

export const NOW = () => new Date();
export const daysUntil = (iso) => (iso ? Math.round((new Date(iso + "T12:00:00") - NOW()) / 86400000) : null);
export const fmtDate = (iso) => (iso ? new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Not on file");
export const money = (n) => (n == null || n === "" || isNaN(n) ? "Not on file" : `$${Number(n).toLocaleString(undefined, { maximumFractionDigits: n < 100 ? 2 : 0 })}`);
export const moneyShort = (n) => (n == null || isNaN(n) ? "—" : n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `$${(n / 1e3).toFixed(1)}K` : `$${Math.round(n)}`);
export { STATE_NAMES, OUTCOME_STATS, OUTCOME_ROWS, ALL_ITEMS, STOP_ITEMS, ddVerdict, FINDINGS, findingState, SEATS, fipsOf };

/* ---------------------------------- counties ---------------------------------- */
const SYS = { L: "Tax lien", D: "Tax deed", "?": "Unknown" };
/** One row of the 3,000-county national table, as a compact summary. */
export function countySummary(r) {
  const [name, state, geoid, sys, rate, bid, redeem, score, tier, flags, verified, , , , nOfficial] = r;
  const key = `${state}|${name}`;
  const R = rulesFor(state);
  const hybrid = /deed/i.test(R.instrument || "") && /certificate|lien/i.test(R.instrument || "") && sys !== "D";
  const deep = !!COUNTY_VERIFIED.counties[key];
  const otc = !!COUNTY_VERIFIED.otc_county[key] || !!otcFor({ name, state, geoid });
  return {
    id: `nat-${geoid}`, key, name, state, stateName: STATE_NAMES[state] || state, geoid, fips: String(geoid).padStart(5, "0"),
    sys, instrument: hybrid ? "Hybrid" : SYS[sys] || "Unknown", rate, bid, redeem, score, tier, flags: flags || "",
    statuteVerified: !!verified || !!R.verified, countyVerified: deep, nOfficial: nOfficial || 0, otc,
    nextSale: NEXT_SALE[key] || null, hasParcels: !!PROPERTY_DB.counties[key] && (PROPERTY_DB.counties[key].rows || []).length > 0,
  };
}
let _all = null;
export const allCounties = () => (_all ||= NATIONAL.map(countySummary));
export const resetCountyCache = () => { _all = null; };

/** Population and terrain already stored on the national county row. Not inferred. */
export function countyDbMeta(name, state) {
  const row = NAT_BY_NAME[`${name}|${state}`];
  if (!row) return { population: null, terrain: null };
  return { population: row[20] || null, terrain: row[21] || null };
}

/** Data confidence, from what is actually on file — never a guess. */
export function confidenceOf(s) {
  if (s.countyVerified) return { label: "County verified", tone: "gr", level: 3, note: `County terms opened and read against official sources (${COUNTY_VERIFIED.checked})` };
  if (s.statuteVerified && s.nOfficial > 0) return { label: "Statute + sources", tone: "cy", level: 2, note: `State statute verified; ${s.nOfficial} official county source${s.nOfficial === 1 ? "" : "s"} on file` };
  if (s.statuteVerified) return { label: "Statute verified", tone: "cy", level: 2, note: "State statute verified against primary sources; county terms not yet opened" };
  return { label: "Workbook lead", tone: "am", level: 1, note: "Researched workbook value — not verified against primary sources" };
}

/** Everything the county card shows, joined from the verified tables. */
function usableLink(link) {
  if (!Array.isArray(link) || typeof link[2] !== "string") return null;
  const url = presentLink(link[2]);
  if (!url) return null;
  return url === link[2] ? link : [link[0], link[1], url, link[3]];
}

export function countyDetail(s) {
  const row = NAT_BY_NAME[`${s.name}|${s.state}`];
  const c = row ? nationalCounty(row) : { name: s.name, state: s.state, geoid: s.geoid, facts: [], links: [] };
  const R = rulesFor(s.state);
  const saleIso = NEXT_SALE[s.key] || null;
  const saleLevel = SALE_DATE_LEVEL[s.key] || (saleIso ? "VERIFIED" : null);
  const deadline = HARD_DEADLINES[s.key] || null;
  const otc = otcFor(c);
  const rawSite = primarySite(c);
  const siteUrl = rawSite && presentLink(rawSite.url);
  const site = siteUrl ? { ...rawSite, url: siteUrl } : null;
  const outcome = OUTCOME_STATS[s.key] || null;
  const deck = PROPERTY_DB.counties[s.key] || null;
  const links = [];
  const seen = new Set();
  for (const link of [...(c.links || []), ...dbLinks(c)]) {
    const clean = usableLink(link);
    if (!clean) continue;
    const key = `${clean[0]}|${clean[2]}`;
    if (seen.has(key)) continue;
    seen.add(key);
    links.push(clean);
  }
  return {
    c, R, saleIso, saleLevel, saleWindow: SALE_WINDOW[s.key] || null, saleHeld: SALE_HELD[s.key] || null, deadline, otc, site,
    phone: phoneFor(c), email: c.email || (row && row[12]) || null, outcome, deck: deck && deck.rows && deck.rows.length ? deck : null,
    facts: c.facts || [], links, conflict: c.conflict || null,
    headline: R.verified ? R.headline : s.rate ? `${s.rate}% (workbook)` : "Not on file",
    redemption: R.verified ? R.redemption : s.redeem ? `${s.redeem} months (workbook)` : "Not on file",
    seat: SEATS[s.key] ? { lat: SEATS[s.key][0], lon: SEATS[s.key][1], name: SEATS[s.key][2] } : null,
  };
}

const ISO = /^\d{4}-\d{2}-\d{2}$/;
function liveHit(fips, field) {
  if (typeof window === "undefined" || !window.__hotlLive || !fips) return null;
  const row = window.__hotlLive.get(`${fips}:${field}`);
  return row && row.value ? row : null;
}

/** Sales and registration deadlines that are actually on file. No date is invented. */
export function saleBoard() {
  const counties = allCounties();
  const byKey = new Map(counties.map((c) => [c.key, c]));
  const events = [];
  for (const c of counties) {
    if (!ISO.test(c.nextSale || "")) continue;
    const live = liveHit(c.fips, "sale_date");
    const level = live ? "LIVE" : (SALE_DATE_LEVEL[c.key] || "ON_FILE");
    events.push({
      id: `sale:${c.key}:${c.nextSale}`, kind: "sale", key: c.key, name: c.name, state: c.state, fips: c.fips, countyId: c.id,
      iso: c.nextSale, days: daysUntil(c.nextSale), level, instrument: c.instrument,
      note: level === "DERIVED" ? "Derived from the state sale cycle, not a separate page for this county." : (live?.source ? `Live correction${live.source ? `: ${live.source}` : ""}` : null),
    });
  }
  const seenReg = new Set();
  const pushReg = (key, iso, note, level) => {
    if (!ISO.test(iso || "") || seenReg.has(`${key}:${iso}`)) return;
    const c = byKey.get(key); if (!c) return;
    seenReg.add(`${key}:${iso}`);
    events.push({ id: `reg:${key}:${iso}`, kind: "registration", key, name: c.name, state: c.state, fips: c.fips, countyId: c.id, iso, days: daysUntil(iso), level, instrument: c.instrument, note: note || null });
  };
  for (const [key, row] of Object.entries(HARD_DEADLINES)) {
    if (row && typeof row === "object") pushReg(key, row.iso, row.text, row.live ? "LIVE" : "ON_FILE");
  }
  if (typeof window !== "undefined" && window.__hotlLive) {
    for (const [id, row] of window.__hotlLive) {
      if (!String(id).endsWith(":registration_closes") || !row?.value) continue;
      const fips = String(id).slice(0, 5);
      const c = counties.find((x) => x.fips === fips);
      if (c) pushReg(c.key, String(row.value).slice(0, 10), row.source || null, "LIVE");
    }
  }
  return events.sort((a, b) => a.iso.localeCompare(b.iso) || a.name.localeCompare(b.name));
}

/* ---------------------------------- parcels ----------------------------------- */
let _props = null;
/** Every real parcel on file: county-published, scraped with a source, or hand-curated (flagged). */
export function allProperties() {
  if (_props) return _props;
  const out = [];
  for (const [key, deck] of Object.entries(PROPERTY_DB.counties)) {
    if (!deck.rows || !deck.rows.length) continue;
    for (const p of decodeProps(deck)) {
      out.push(shapeProp(p, deck, key));
    }
  }
  return (_props = out);
}
function derivedPlace(label, city) {
  const lab = String(label || "");
  const legal = /\b(lot|lots|blk|block|plat)\b/i.test(lab);
  const streetLike = /^\d{1,6}\s+\S+/.test(lab) && !legal;
  const street = streetLike ? lab.split(",")[0].trim() : null;
  let placeCity = city || null;
  if (!placeCity && street && lab.includes(",")) {
    placeCity = lab.split(",").slice(1).join(" ").replace(/\b[A-Z]{2}\b/g, "").replace(/\b\d{5}(?:-\d{4})?\b/g, "").trim() || null;
  }
  return { street, placeCity };
}
function shapeProp(p, deck, key) {
  const [state, county] = key.split("|");
  const lvl = PROP_LEVEL[deck.level] || ["⚪", "", deck.level];
  const label = p.label || p.legal || p.pid;
  const place = derivedPlace(label, p.city || null);
  const location = readLocation(p);
  return {
    id: `prop:${p.id}`, raw: p, key, state, county, apn: p.pid, acct: p.acct || null,
    label, legal: p.legal || null, city: p.city || null, street: place.street, placeCity: place.placeCity,
    zip: p.zip || p.postal || null,
    amount: p.amount != null ? p.amount : null, acres: p.acres || null, ownerType: p.ownerType || null, owner: p.owner || null,
    homestead: p.homestead === true ? "Yes" : p.homestead === false ? "No" : null, taxYear: p.taxYear || null,
    kind: p.kind || null, value: p.value || null, estLow: p.estLow || null, estHigh: p.estHigh || null, business: p.business || null, note: p.note || null,
    level: deck.level, levelNote: lvl[2], instrument: deck.instrument, source: deck.sourceUrl || PROPERTY_DB.source, listDate: deck.scrapedAt || PROPERTY_DB.built,
    lat: location.latitude, lon: location.longitude, geom: p.geom || p.geometry || p.polygon || null, geometryStatus: location.geometryStatus,
    apnNorm: normApn(p.pid),
    traits: listTraits(p, deck),
  };
}
/** Parcels the team has promoted into Supabase (public.parcels) — signed in only. */
export async function fetchPromotedParcels() {
  const { data, error } = await supabase.from("parcels").select("*").limit(2000);
  if (error || !data) return [];
  const byFips = new Map(NATIONAL.map((r) => [String(r[2]).padStart(5, "0"), r]));
  return data.map((r) => {
    const n = byFips.get(r.fips) || [];
    const row = { id: `db:${r.id}`, key: `${n[1]}|${n[0]}`, state: n[1] || "", county: n[0] || r.fips, apn: r.pid, label: r.situs || r.legal || r.pid, legal: r.legal,
      city: r.city, amount: r.amount, acres: r.acres, ownerType: null, owner: r.owner, homestead: null, taxYear: null, kind: r.kind, value: r.assessed,
      level: "PROMOTED", levelNote: "promoted by the team from a vetted intake batch", instrument: null, source: r.source, listDate: r.created_at && r.created_at.slice(0, 10),
      lat: r.lat, lon: r.lon, geom: r.geom || r.geometry || r.polygon || null, locQuality: r.loc_quality, traits: [] };
    return { ...row, geometryStatus: readLocation(row).geometryStatus, apnNorm: normApn(r.pid) };
  });
}

/** Due-diligence completion for one parcel's records. */
export function ddProgress(recs) {
  const r = recs || {};
  const done = ALL_ITEMS.filter((i) => r[i.id] && r[i.id].status && r[i.id].status !== "unchecked").length;
  const stopDone = STOP_ITEMS.filter((i) => ["clear", "na"].includes(r[i.id]?.status)).length;
  return { done, total: ALL_ITEMS.length, pct: Math.round((done / ALL_ITEMS.length) * 100), stopDone, stopTotal: STOP_ITEMS.length };
}

/** Pipeline stage, derived from work actually recorded. */
export function stageOf(recs, photos) {
  const r = recs || {};
  const v = ddVerdict(r);
  if (v.label === "CLEARED FOR AUCTION") return "ready";
  if (v.label === "Do not bid") return "killed";
  const any = Object.values(r).some((x) => x && x.status && x.status !== "unchecked");
  if (!any) return "research";
  const inspected = ["clear", "na"].includes(r.p4?.status) || (photos || 0) >= 4;
  if (!inspected) return "field";
  return "analysis";
}
export const STAGES = {
  research: ["To Research", "cy"], field: ["Field Verify", "in"], analysis: ["Analysis", "am"], ready: ["Ready", "gr"], killed: ["Do not bid", "rd"],
};
