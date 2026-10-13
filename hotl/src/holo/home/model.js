/* The home's read model: coverage for the map, and what each county and property card
 * shows. Everything is read from the evidence engine, so a label on a card is the
 * label on the evidence behind it. No percentages: coverage is counted, not scored. */
import { PROPERTY_DB, COUNTY_VERIFIED, NEXT_SALE_BUNDLED, REPORTED, STOP_ITEMS, OTC_EXTRA } from "../../legacy/ScoutingDept.jsx";
import { allCounties, allProperties } from "../data";
import { countyFacts, classifyCounty, parcelFacts } from "../../quantum/evidence";
import { stateOf, BRANCHES, itemById } from "../intel";
import { countyMarketLines } from "../countyMarket";
import { auctionLines } from "../countyAuction";
import { tigerLines } from "../tigerMaster";
import { buildPropertyIntelligence } from "../propertyRecord";

export const todayIso = () => new Date().toISOString().slice(0, 10);
export const ctxBase = (extra = {}) => ({ today: todayIso(), live: typeof window !== "undefined" && window.__hotlLive ? window.__hotlLive : null, ...extra });

/** The five labels the product uses. "Source-supported" means a source supports this claim, nothing more. */
export const LABEL = {
  VERIFIED: ["Source-supported", "ok"], CORROBORATED: ["Source-supported", "ok"], PROVISIONAL: ["Source-supported · confirm", "prov"],
  CONFLICT: ["Conflicting", "warn"], STALE: ["Stale", "warn"], MISSING: ["Not checked", "none"], FIELD: ["Not checked · field visit", "none"],
  PAID: ["Unavailable · paid source", "none"], RESTRICTED: ["Unavailable", "none"],
};
export const labelOf = (f) => (f ? LABEL[f.status] || LABEL.MISSING : LABEL.MISSING);
export const supported = (f) => f && ["VERIFIED", "CORROBORATED", "PROVISIONAL"].includes(f.status);

/* ---------------------------------- coverage ---------------------------------- */
const saleKeys = () => new Set([...Object.keys(NEXT_SALE_BUNDLED), ...Object.keys(REPORTED)]);
export const COVERAGE = {
  inventory: { label: "Source-backed inventory", note: "A parcel list from the county is on file", rank: 0 },
  verified: { label: "County terms read", note: "Official county pages opened and read", rank: 1 },
  sale: { label: "Sale date on file", note: "A sale date is recorded; the page behind it may not be", rank: 2 },
  statute: { label: "Statute verified", note: "State law verified; county not yet researched", rank: 3 },
  none: { label: "Not yet researched", note: "Nothing on file. Not evidence that no sale or inventory exists", rank: 4 },
};
let _cov = null;
/** Coverage class per county: what we hold, never what exists. */
export function coverageMap() {
  if (_cov) return _cov;
  const sales = saleKeys(); const m = new Map();
  for (const s of allCounties()) {
    const deck = PROPERTY_DB.counties[s.key];
    const cls = deck && deck.rows && deck.rows.length ? "inventory" : COUNTY_VERIFIED.counties[s.key] ? "verified" : sales.has(s.key) ? "sale" : s.statuteVerified ? "statute" : "none";
    m.set(s.fips, cls);
  }
  return (_cov = m);
}

/* ---------------------------------- counties ---------------------------------- */
const _cf = new Map();
export function facts(key, ctx) { const k = `${key}|${ctx.today}|${ctx.live ? ctx.live.size : 0}`; if (!_cf.has(k)) _cf.set(k, countyFacts(key, ctx)); return _cf.get(k); }
export const clearFacts = () => _cf.clear();

/** Research status is about our work, never about how good the county is. */
export function researchStatus(s, holo, C) {
  const u = holo.countyStatus[s.id];
  if (u === "captured") return ["Reviewed", "ok"];
  if (u === "review" || (C && Object.values(C.facts).some((f) => f && (f.status === "CONFLICT" || f.status === "STALE")))) return ["Review needed", "warn"];
  if (u === "investigating") return ["Researching", "cy"];
  if (u === "passed") return ["Passed", "none"];
  if (holo.viewed && holo.viewed[s.id]) return ["Discovered", "prov"];
  return ["Not started", "none"];
}
export function countyCard(s, ctx, holo) {
  const C = facts(s.key, ctx);
  const F = C.facts;
  const deck = C.deck;
  const inventory = deck && deck.rows && deck.rows.length
    ? { text: `${(deck.rowCount || deck.rows.length).toLocaleString()} parcels on file`, sub: `${deck.level.toLowerCase()} list${deck.scrapedAt ? ` · pulled ${String(deck.scrapedAt).slice(0, 10)}` : ""}`, f: F.delinquent_list }
    : { text: deck && /SYNTHETIC/.test(deck.level) ? "List quarantined" : "No list on file", sub: deck ? "withheld as suspected synthetic" : "not evidence that none exists", f: F.delinquent_list };
  const all = Object.values(F).filter(Boolean);
  const checks = all.map((f) => f.lastChecked).filter(Boolean).sort();
  return {
    s, C, F, inventory, sale: F.sale_date, otc: F.otc_status, saleType: F.sale_type,
    deed: F.sale_type.value === "deed", status: researchStatus(s, holo, C), classes: classifyCounty(C, ctx.today),
    supportedCount: all.filter(supported).length, total: all.length, lastCheck: checks.pop() || null,
    market: countyMarketLines(s.fips),
    auction: auctionLines(s.fips),
    tiger: tigerLines(s.fips),
  };
}

/* ---------------------------------- properties ---------------------------------- */
const TITLE = BRANCHES.find((b) => b.id === "title").items;
const ALL_CHECKS = BRANCHES.flatMap((b) => b.items);
export const amountLabel = (p) => (p.level === "CURATED" ? "Owed (not on curated list)" : PROPERTY_DB.counties[p.key] && PROPERTY_DB.counties[p.key].saleHeld ? "Amount on held-sale list" : "Amount on county list");

/** The single most important open issue, shown on the card's face. */
export function topIssue(p, recs, sale) {
  const r = recs || {};
  const failed = STOP_ITEMS.find((i) => stateOf(r[i.id]).id === "failed");
  if (failed) return [`Stop item failed: ${failed.t}`, "bad"];
  const flagged = ALL_CHECKS.find((id) => stateOf(r[id]).id === "flagged");
  if (flagged) return [`Flagged: ${itemById(flagged).t}`, "warn"];
  if (sale && sale.status === "CONFLICT") return ["Sale date sources conflict", "warn"];
  if (!sale || !["VERIFIED", "CORROBORATED"].includes(sale.status)) return ["Sale date requires confirmation", "warn"];
  if (!["verified", "passed"].includes(stateOf(r.s2).id) && !["verified", "passed"].includes(stateOf(r.d3).id)) return ["Legal-access documentation missing", "warn"];
  if (!TITLE.every((id) => ["verified", "passed", "flagged", "failed"].includes(stateOf(r[id]).id))) return ["Title research incomplete", "warn"];
  if (!["verified", "passed"].includes(stateOf(r.p4).id)) return ["Physical inspection not done", "warn"];
  return null;
}
/** Task completion and findings are counted separately: finishing a check can reveal a problem. */
export function ddCounts(recs) {
  const r = recs || {};
  const states = ALL_CHECKS.map((id) => stateOf(r[id]).id);
  return { done: states.filter((s) => ["verified", "passed", "flagged", "failed"].includes(s)).length, total: ALL_CHECKS.length,
    failed: states.filter((s) => s === "failed").length, flagged: states.filter((s) => s === "flagged").length };
}
export function propertyCard(p, ctx, dd, research) {
  const C = facts(p.key, ctx);
  const record = buildPropertyIntelligence({ parcel: p, checks: dd[p.id], visit: research?.visit, photos: research?.photos, pin: research?.pin, today: ctx.today });
  return { p, sale: C.facts.sale_date, saleType: C.facts.sale_type, issue: topIssue(p, dd[p.id], C.facts.sale_date), dd: ddCounts(dd[p.id]), amountLabel: amountLabel(p), record };
}
export function propertyDossier(p, ctx) { return { P: parcelFacts(p, ctx), C: facts(p.key, ctx) }; }

/* --------------------------------- categories --------------------------------- */
export const CATEGORIES = [
  ["counties", "Counties", "Opens a county file"],
  ["properties", "Properties", "Opens a property file"],
  ["auctions", "Auctions", "Opens a sale that is on file"],
  ["otc", "OTC", "Opens county-held inventory that is on file"],
];
/** Counts from retrieved records only. */
export function categoryCounts() {
  const counties = allCounties();
  const today = todayIso();
  const sales = [...saleKeys()].filter((k) => { const d = NEXT_SALE_BUNDLED[k] || (REPORTED[k] && REPORTED[k].saleIso); return d && d >= today; }).length;
  const otcDocumented = new Set([...Object.keys(COUNTY_VERIFIED.otc_county), ...Object.entries(OTC_EXTRA).filter(([, v]) => /confirm/i.test(v.status)).map(([k]) => k)]).size;
  return {
    counties: { n: counties.length, note: `${counties.filter((c) => c.countyVerified).length} with county terms read` },
    properties: { n: allProperties().length, note: `from ${Object.values(PROPERTY_DB.counties).filter((d) => d.rows && d.rows.length).length} county lists` },
    auctions: { n: sales, note: "sale dates on file · limited coverage" },
    otc: { n: otcDocumented, note: "documented by the county · more are only likely" },
  };
}
