/* QUANTUM SEARCH — the pipeline.
 * 1 query understanding · 2 source discovery · 3 retrieval · 4 parsing · 5 entity resolution ·
 * 6 normalization · 7 validation · 8 cross-source verification · 9 conflict detection ·
 * 10 provenance · 11 confidence · 12 answer. Every stage writes to the trace. */
import { NATIONAL, NAT_BY_NAME, STATE_RULES, rulesFor, COUNTY_VERIFIED, PROPERTY_DB, OTC_DB, STATE_NAMES, NEXT_SALE_BUNDLED, REPORTED } from "../legacy/ScoutingDept.jsx";
import { allProperties } from "../holo/data";
import { BRANCHES, itemById, stateOf, STOP_ITEM_IDS } from "./intelBridge";
import { STATUS, TIERS, fact, gap, source, worst, daysBetween, isoDay, RESOLVED_STATUS } from "./core";
import { countyFacts, classifyCounty, parcelFacts, normApn, normApnLoose, statuteSources, liveRows } from "./evidence";
import { parseQuery } from "./parse";

export const BRANCH_DEFS = [
  ["county", "County records"], ["assessor", "Assessor"], ["treasurer", "Treasurer"], ["gis", "GIS"], ["recorder", "Recorder"],
  ["courts", "Courts"], ["federal", "Federal data"], ["environmental", "Environmental"], ["provider", "Auction provider"],
];
const todayIso = () => new Date().toISOString().slice(0, 10);

/* ---------------------------------- indexes ---------------------------------- */
let _ix = null;
function parcelIndex(extra = []) {
  if (_ix && !extra.length) return _ix;
  const all = [...extra, ...allProperties()];
  const exact = new Map(), norm = new Map(), loose = new Map();
  const add = (m, k, p) => { if (!k) return; (m.get(k) || m.set(k, []).get(k)).push(p); };
  for (const p of all) { add(exact, String(p.apn || "").trim().toUpperCase(), p); add(norm, normApn(p.apn), p); add(loose, normApnLoose(p.apn), p); if (p.acct) add(norm, normApn(p.acct), p); }
  const ix = { all, exact, norm, loose };
  if (!extra.length) _ix = ix;
  return ix;
}
/** Entity resolution: exact, then normalized, then leading-zero loose. Different counties are never merged. */
export function resolveApn(raw, ctx, trace) {
  const ix = parcelIndex(ctx.extraParcels || []);
  const e = String(raw).trim().toUpperCase(), n = normApn(raw), l = normApnLoose(raw);
  let hits = ix.exact.get(e) || [], how = "exact", ident = 1;
  if (!hits.length) { hits = ix.norm.get(n) || []; how = "normalized"; ident = 0.7; }
  if (!hits.length) { hits = ix.loose.get(l) || []; how = "alias (leading zeros dropped)"; ident = 0.5; }
  const counties = [...new Set(hits.map((p) => p.key))];
  trace && trace("Entity resolution", `"${raw}" → exact "${e}", normalized "${n}". ${hits.length ? `${hits.length} record${hits.length > 1 ? "s" : ""} by ${how} match in ${counties.length} county list${counties.length > 1 ? "s" : ""}` : `No match in ${ix.all.length.toLocaleString()} parcels across ${Object.values(PROPERTY_DB.counties).filter((d) => d.rows && d.rows.length).length} lists`}.`);
  return { hits, how, ident: counties.length > 1 ? 0 : ident, ambiguous: counties.length > 1, counties };
}

/* ------------------------------ title and risk ------------------------------ */
const TITLE_CATS = [
  ["federal", "Federal tax liens", ["d9"], "MANUAL", "County recorder index (federal tax lien filings)"],
  ["state_tax", "State tax liens", [], "MANUAL", "County recorder index / state revenue department"],
  ["municipal", "Municipal liens", ["d10"], "UNAVAILABLE", "City or county code enforcement and utility billing"],
  ["mortgage", "Mortgages / deeds of trust", ["d15"], "MANUAL", "County recorder, or an O&E report"],
  ["judgment", "Judgments / lis pendens", ["d12"], "MANUAL", "Clerk of court and recorder"],
  ["hoa", "HOA / CDD / assessments", ["d11"], "UNAVAILABLE", "HOA estoppel letter or special district"],
  ["bk", "Bankruptcy", ["d13"], "PAID", "PACER (federal courts, paid per page)"],
  ["probate", "Probate", ["d14"], "MANUAL", "County probate court"],
  ["code", "Code enforcement / demolition", ["d10", "x3"], "UNAVAILABLE", "Code enforcement or building department"],
  ["utilities", "Utilities", ["d5"], "UNAVAILABLE", "Utility providers"],
  ["transfers", "Ownership transfers / chain", ["p1"], "PAID", "Title search or O&E report"],
];
const TITLE_STATE_TEXT = { FOUND: "VERIFIED RECORD FOUND", NONE: "NO RECORD FOUND IN SEARCHED SOURCES", UNAVAILABLE: "SOURCE UNAVAILABLE", PAID: "PAID SOURCE REQUIRED", MANUAL: "MANUAL TITLE SEARCH REQUIRED" };
const TIER_OF = { "Official record": 1, "County staff (call)": 2, "Auction platform": 2, "Commercial data": 3, "Imagery": 3, "Field observation": 1, "Other": 4 };
export function researchSource(rec, jurisdiction) {
  return source({ tier: TIER_OF[rec.sourceType] || (rec.source ? 3 : 4), agency: rec.source || "Unnamed source", type: rec.sourceType || "research note", label: rec.source || "Research note",
    url: rec.doc || rec.map, accessed: rec.date, jurisdiction, method: "manual research", human: true, recordMatch: 1, note: rec.note || null });
}
function titleFacts(p, ctx) {
  const recs = (ctx.dd || {})[p.id] || {};
  const ent = `parcel:${p.id}`;
  return TITLE_CATS.map(([k, label, items, fallback, where]) => {
    const rs = items.map((id) => ({ id, r: recs[id], s: stateOf(recs[id]).id })).filter((x) => x.r);
    const found = rs.filter((x) => (x.s === "failed" || x.s === "flagged") && (x.r.source || x.r.note));
    const cleared = rs.filter((x) => (x.s === "verified" || x.s === "passed") && x.r.source);
    let f;
    if (found.length) {
      f = fact({ key: `title_${k}`, label, entity: ent, fresh: "research", today: ctx.today }, found.map((x) => ({ value: TITLE_STATE_TEXT.FOUND, display: `${TITLE_STATE_TEXT.FOUND}: ${x.r.note || itemById(x.id).t}`, source: researchSource(x.r, `${p.county}, ${p.state}`) })));
      f.titleState = "FOUND";
    } else if (items.length && cleared.length === items.length) {
      // absence in the sources searched is never proof of absence
      f = fact({ key: `title_${k}`, label, entity: ent, fresh: "research", today: ctx.today, cap: "PROVISIONAL" }, cleared.map((x) => ({ value: TITLE_STATE_TEXT.NONE, display: `${TITLE_STATE_TEXT.NONE} (${x.r.source}). Not proof that none exists.`, source: researchSource(x.r, `${p.county}, ${p.state}`) })));
      f.titleState = "NONE";
    } else {
      const st = { MANUAL: "MISSING", UNAVAILABLE: "RESTRICTED", PAID: "PAID" }[fallback];
      f = gap(ent, `title_${k}`, label, where, ctx.today, st, `${TITLE_STATE_TEXT[fallback]} · ${where}`);
      f.titleState = fallback;
    }
    return f;
  });
}
const RISK_CATS = [
  ["flood", "Flood", ["s7", "d7"], "FEMA National Flood Hazard Layer", "https://msc.fema.gov/portal/home", "MISSING"],
  ["wildfire", "Wildfire", ["x1"], "USDA Forest Service · Wildfire Risk to Communities", "https://wildfirerisk.org", "MISSING"],
  ["contamination", "Contamination", ["d8", "p9"], "EPA Envirofacts and the state environmental agency", "https://enviro.epa.gov", "MISSING"],
  ["wetlands", "Wetlands", ["d7"], "USFWS National Wetlands Inventory", "https://www.fws.gov/program/national-wetlands-inventory", "MISSING"],
  ["access", "Legal access", ["s2", "d3", "d4"], "County GIS, recorded plats and easements, then a site visit", null, "FIELD"],
  ["zoning", "Zoning", ["s4"], "County or municipal zoning map", null, "MISSING"],
  ["structure", "Building / structure", ["s6", "p6", "p4", "x3"], "Assessor improvements, permits, and a site visit", null, "FIELD"],
];
function riskFacts(p, ctx) {
  const recs = (ctx.dd || {})[p.id] || {};
  const ent = `parcel:${p.id}`;
  return RISK_CATS.map(([k, label, items, where, url, empty]) => {
    const rs = items.map((id) => ({ id, r: recs[id], s: stateOf(recs[id]).id })).filter((x) => x.r && x.s !== "not_started");
    const f = rs.length ? fact({ key: `risk_${k}`, label, entity: ent, fresh: "research", today: ctx.today, compare: "text" }, rs.map((x) => ({
      value: x.s === "failed" || x.s === "flagged" ? "risk found" : x.s === "verified" || x.s === "passed" ? "checked, clear" : "in research",
      display: `${stateOf(x.r).label}: ${itemById(x.id).t}${x.r.note ? ` · ${x.r.note}` : ""}`, source: researchSource(x.r, `${p.county}, ${p.state}`) })))
      : gap(ent, `risk_${k}`, label, url ? `${where} · ${url}` : where, ctx.today, empty, empty === "FIELD" ? `Not determined · ${where}` : `No connected dataset · check ${where}`);
    f.whereUrl = url;
    return f;
  });
}

/* ------------------------------------ graph ------------------------------------ */
const nodeStatus = (facts) => { const fs = facts.filter(Boolean); if (!fs.length) return "n/a"; const w = worst(fs); return w; };
function buildGraph({ st, C, p, P, titles, risks, ctx }) {
  const recs = p ? (ctx.dd || {})[p.id] || {} : {};
  const photos = p ? ((ctx.photos || {})[p.id] || []) : [];
  const visit = p ? (ctx.holo && ctx.holo.visits && ctx.holo.visits[p.id]) : null;
  const bid = p ? (ctx.holo && ctx.holo.bids && ctx.holo.bids[p.id]) : null;
  const pos = p ? (ctx.positions || []).find((x) => x.parcelId === p.id) : null;
  return [
    { id: "state", label: "State", status: st ? (rulesFor(st).verified ? "VERIFIED" : "PROVISIONAL") : "n/a", detail: st ? `${STATE_NAMES[st]} · ${rulesFor(st).verified ? "statute verified" : "not in verified rulebook"}` : "" },
    { id: "county", label: "County", status: C ? nodeStatus([C.facts.sale_type, C.facts.platform, C.facts.otc_status]) : "n/a", detail: C ? `${C.name} County` : "" },
    { id: "auction", label: "Auction", status: C ? C.facts.sale_date.status : "n/a", detail: C ? C.facts.sale_date.display : "" },
    { id: "parcel", label: "Parcel", status: P ? nodeStatus([P.F.apn, P.F.address, P.F.acreage]) : "n/a", detail: p ? `APN ${p.apn}` : "" },
    { id: "owner", label: "Owner", status: P ? nodeStatus([P.F.owner]) : "n/a", detail: P ? P.F.owner.display : "" },
    { id: "tax", label: "Tax record", status: P ? nodeStatus([P.F.amount]) : "n/a", detail: P ? P.F.amount.display : "" },
    { id: "title", label: "Title record", status: titles ? (titles.some((t) => t.titleState === "FOUND") ? "CONFLICT" : titles.every((t) => t.titleState === "NONE") ? "PROVISIONAL" : "MISSING") : "n/a", detail: titles ? `${titles.filter((t) => t.titleState === "FOUND").length} found · ${titles.filter((t) => t.titleState === "NONE").length} none found · ${titles.filter((t) => !["FOUND", "NONE"].includes(t.titleState)).length} not searched` : "" },
    { id: "risk", label: "Risk data", status: risks ? nodeStatus(risks) : "n/a", detail: risks ? `${risks.filter((r) => r.status !== "MISSING" && r.status !== "FIELD").length} of ${risks.length} checked` : "" },
    { id: "field", label: "Field evidence", status: p ? (visit && visit.completed ? "VERIFIED" : photos.length ? "PROVISIONAL" : "FIELD") : "n/a", detail: p ? `${photos.length} photos${visit && visit.completed ? ` · visit ${visit.completed}` : ""}` : "" },
    { id: "result", label: "Auction result", status: bid && bid.result ? "VERIFIED" : p ? "MISSING" : "n/a", detail: bid && bid.result ? `${bid.result.won ? "Won" : "Lost"} · ${bid.result.date}` : "" },
    { id: "outcome", label: "Investment outcome", status: pos ? (pos.actual ? "VERIFIED" : "PROVISIONAL") : p ? "MISSING" : "n/a", detail: pos ? pos.actual || "position open" : "" },
  ];
}

/* -------------------------------- gap engine -------------------------------- */
const FIELD_ITEMS = ["p4", "x2", "s6", "p8", "s2"];
export function gapEngine(p, P, C, titles, risks, ctx) {
  const recs = (ctx.dd || {})[p.id] || {};
  const facts = [...Object.values(P.F), ...(C ? [C.facts.sale_date, C.facts.registration_deadline, C.facts.platform, C.facts.deposit, C.facts.otc_status] : []), ...titles, ...risks];
  const known = facts.filter((f) => f.value != null && f.status !== "CONFLICT" && f.status !== "MISSING" && !(f.titleState && f.titleState !== "FOUND" && f.titleState !== "NONE"));
  const unknown = facts.filter((f) => f.status === "MISSING" || f.status === "PAID" || f.status === "RESTRICTED");
  const conflicts = facts.filter((f) => f.status === "CONFLICT" || f.status === "STALE");
  const field = [...facts.filter((f) => f.status === "FIELD"),
    ...FIELD_ITEMS.filter((id) => !["verified", "passed", "failed"].includes(stateOf(recs[id]).id)).map((id) => gap(`parcel:${p.id}`, `dd_${id}`, itemById(id).t, itemById(id).where, ctx.today, "FIELD"))];
  const killers = STOP_ITEM_IDS.map((id) => ({ id, item: itemById(id), s: stateOf(recs[id]) })).filter((x) => x.s.id !== "verified" && x.s.id !== "passed")
    .map((x) => ({ id: x.id, label: x.item.t, kill: x.item.kill, state: x.s.id === "failed" ? "FOUND" : x.s.id === "flagged" ? "FLAGGED" : "OPEN" }));
  return { known, unknown, conflicts, field: field.filter((f, i, a) => a.findIndex((g) => g.label === f.label) === i), killers };
}

/* ---------------------------------- helpers ---------------------------------- */
const countyKeyFromParcel = (p) => p.key;
const findParcel = (id, ctx) => parcelIndex(ctx.extraParcels || []).all.find((p) => p.id === id);
const rowFor = (key) => { const [st, name] = key.split("|"); return NAT_BY_NAME[`${name}|${st}`]; };
const statusRank = (s) => ["VERIFIED", "CORROBORATED", "PROVISIONAL", "STALE", "CONFLICT", "FIELD", "PAID", "RESTRICTED", "MISSING"].indexOf(s);
const conf = (f) => (f && f.confidence ? f.confidence.score : null);

function contextParcel(Pq, ctx, trace) {
  if (Pq.apn) { const r = resolveApn(Pq.apn, ctx, trace); return { r, p: r.hits.length && !r.ambiguous ? r.hits.find((x) => String(x.apn).toUpperCase() === String(Pq.apn).trim().toUpperCase()) || r.hits[0] : null }; }
  const id = ctx.holo && ctx.holo.focusParcel;
  const p = id ? findParcel(id, ctx) : null;
  if (p) trace("Entity resolution", `No identifier in the question; using the parcel in focus: APN ${p.apn}, ${p.county} ${p.state}.`);
  return { r: p ? { ident: 1, how: "in focus", hits: [p] } : null, p };
}

/* ----------------------------------- modes ----------------------------------- */
const MODES = {};

MODES.meta = (Pq, ctx, T) => {
  T("Answer generation", "Question is about the system itself; answered from its architecture.");
  const f = fact({ key: "quantum", label: "Uses quantum computing?", entity: "system", today: ctx.today }, [{ value: "No", display: "No. Quantum Search runs on ordinary computers. The name describes searching many evidence branches at once; no quantum hardware or quantum algorithm is used.", source: source({ tier: 1, agency: "Hands On Tax Liens", type: "system architecture", label: "Quantum Search design (src/quantum)", accessed: ctx.today, method: "system documentation", human: true, recordMatch: 1 }) }]);
  return { answer: { text: f.display, fact: f }, cards: [f] };
};

MODES.county = (Pq, ctx, T, B) => {
  if (Pq.countyAmbiguous && !Pq.counties.length) {
    T("Entity resolution", `"${Pq.countyAmbiguous[0].name}" names ${Pq.countyAmbiguous.length} counties; records not merged.`);
    return { answer: { text: `Ambiguous: ${Pq.countyAmbiguous.length} counties are named ${Pq.countyAmbiguous[0].name}. Add the state.`, status: "MISSING" },
      rows: Pq.countyAmbiguous.map((c) => ({ title: `${c.name}, ${c.st}`, sub: STATE_NAMES[c.st], status: "MISSING", query: `${c.name} County, ${c.st}` })) };
  }
  const k = Pq.counties[0].key;
  T("Source discovery", `County ${k}: rulebook, national table${COUNTY_VERIFIED.counties[k] ? ", verified county terms" : ""}${PROPERTY_DB.counties[k] ? ", parcel list" : ""}, OTC tables, sale calendar${ctx.live ? ", live corrections" : ""}.`);
  const C = countyFacts(k, ctx);
  B("county", "found", C.cv ? "verified county terms" : "national table + statute"); B("treasurer", C.facts.sale_date.status !== "MISSING" || C.deck ? "found" : "none", C.deck ? "parcel list" : "sale calendar");
  B("provider", C.facts.platform.status !== "MISSING" ? "found" : "none", C.facts.platform.display); B("assessor", C.links.some((l) => l.kind === "assessor") ? "found" : "none", "links only");
  B("gis", C.links.some((l) => l.kind === "gis") ? "found" : "none", "links only"); B("recorder", C.links.some((l) => l.kind === "recorder") ? "found" : "none", "links only");
  const F = C.facts;
  T("Cross-source verification", `Compared ${Object.values(F).filter(Boolean).reduce((a, f) => a + f.evidenceCount, 0)} observations across ${Object.values(F).filter(Boolean).length} fields.`);
  const conflicts = Object.values(F).filter((f) => f && f.status === "CONFLICT");
  T("Conflict detection", conflicts.length ? `${conflicts.length} conflict${conflicts.length > 1 ? "s" : ""}: ${conflicts.map((f) => f.label).join(", ")}.` : "No conflicts among comparable sources.");
  const classes = classifyCounty(C, ctx.today);
  const head = Pq.focus && F[Pq.focus] ? F[Pq.focus] : null;
  const groups = [
    { title: "Sale rules", facts: [F.sale_type, F.statutory_rate, F.penalty, F.bid_method, F.redemption, F.foreclosure] },
    { title: "Auction", facts: [F.sale_date, F.last_sale, F.registration_deadline, F.registration, F.deposit, F.platform].filter(Boolean) },
    { title: "OTC", facts: [F.otc_status, F.otc_rate_advertised] },
    { title: "Inventory & history", facts: [F.delinquent_list, F.historical_sales] },
    { title: "Contacts", facts: [F.phone] },
  ];
  const text = head && head.status === "CONFLICT" ? `Conflict on the ${head.label.toLowerCase()}. ${head.conflictNote}` : head ? `${head.label}: ${head.display}` : `${C.name} County, ${C.st} · ${F.sale_type.display} · next sale ${F.sale_date.status === "MISSING" ? "not on file" : F.sale_date.display}`;
  return {
    answer: { text, fact: head, status: head ? head.status : worst([F.sale_type, F.sale_date, F.platform]), confidence: head ? conf(head) : null },
    classes, groups, links: C.links, county: C,
    cards: head ? [head] : [F.sale_date, F.sale_type, F.statutory_rate, F.platform],
    graph: buildGraph({ st: C.st, C, ctx }),
    next: nextSteps(Object.values(F).filter(Boolean)),
  };
};

function parcelDossier(p, ident, ctx, T, B) {
  const P = parcelFacts(p, { ...ctx }, ident);
  const C = countyFacts(countyKeyFromParcel(p), ctx);
  const titles = titleFacts(p, ctx), risks = riskFacts(p, ctx);
  B("assessor", "found", "list fields (assessor not connected)"); B("treasurer", "found", `${p.level.toLowerCase()} list`);
  B("county", "found", C.cv ? "verified county terms" : "national table"); B("provider", C.facts.platform.status !== "MISSING" ? "found" : "none", C.facts.platform.display);
  const rs = (ctx.dd || {})[p.id] || {};
  B("recorder", ["p1", "d9", "d12", "d15"].some((id) => rs[id]) ? "found" : "unconnected", "research records only");
  B("courts", ["d12", "d13", "d14"].some((id) => rs[id]) ? "found" : "unconnected", "PACER and state courts not connected");
  B("federal", ["s7", "d8"].some((id) => rs[id]) ? "found" : "unconnected", "FEMA / EPA not connected");
  B("environmental", ["d7", "x1", "p9"].some((id) => rs[id]) ? "found" : "unconnected", "state datasets not connected");
  B("gis", ctx.holo && ctx.holo.pins && ctx.holo.pins[p.id] ? "found" : "unconnected", "GPS pin only");
  T("Normalization", `Mapped ${Object.keys(P.F).length} parcel fields and ${Object.keys(C.facts).length} county fields to the national schema.`);
  const miss = Object.values(P.F).filter((f) => f.status === "MISSING").length;
  T("Validation", `${Object.keys(P.F).length - miss} parcel fields supported by a source; ${miss} missing from every source on file.`);
  const G = gapEngine(p, P, C, titles, risks, ctx);
  const F = P.F, CF = C.facts;
  const groups = [
    { title: "Property identity", facts: [F.apn, F.alt_apn, F.address, F.legal, F.acreage, F.property_type, F.assessed_land, F.assessed_impr, F.assessed_total, F.market_estimate] },
    { title: "Ownership", facts: [F.owner, F.owner_type, F.mailing, F.deed_ref, F.transfer, F.last_sale] },
    { title: "Tax status", facts: [F.amount, F.tax_year, F.penalties, F.interest, F.certificate, F.homestead] },
    { title: "Sale status", facts: [F.sale_status, CF.sale_date, CF.sale_type, CF.bid_method, CF.platform, CF.registration_deadline, CF.deposit, CF.redemption] },
    { title: "OTC status", facts: [CF.otc_status, CF.otc_rate_advertised] },
  ];
  return { P, C, titles, risks, G, groups, graph: buildGraph({ st: C.st, C, p, P, titles, risks, ctx }) };
}

function findLabelParcels(raw) {
  const n = (s) => String(s || "").toLowerCase().replace(/[.,#]/g, " ").replace(/\s+/g, " ").trim();
  const nq = n(raw);
  const all = allProperties();
  const exact = all.filter((p) => n(p.label) === nq || n(p.legal) === nq);
  if (exact.length) return exact;
  const prefix = all.filter((p) => {
    const label = n(p.label);
    return label.length > 12 && /^\d+\s+[a-z]/.test(label) && nq.startsWith(label);
  });
  if (prefix.length) return prefix;
  const addr = nq.match(/^(\d{1,6})\s+([a-z][a-z0-9]{2,})/);
  if (!addr) return [];
  return all.filter((p) => {
    const label = n(p.label);
    return label.startsWith(`${addr[1]} `) && label.includes(addr[2]);
  });
}

function parcelRows(list) {
  return list.slice(0, 80).map((p) => ({ title: `${p.label} · ${p.county}, ${p.state}`, sub: `APN ${p.apn}`, status: "PROVISIONAL", parcelId: p.id, query: `APN ${p.apn}` }));
}

MODES.label = (Pq, ctx, T, B) => {
  const hits = findLabelParcels(Pq.raw).filter((p) => !Pq.states.length || Pq.states.includes(p.state));
  T("Entity resolution", hits.length ? `${hits.length} parcel${hits.length === 1 ? "" : "s"} match the street or the text on the list.` : "No list row matches that street or legal text.");
  if (!hits.length) {
    if (Pq.street) return { answer: { text: "No list row starts with that street. The city or county in the same line was not used instead.", status: "MISSING" }, rows: [] };
    if (Pq.counties.length || Pq.countyAmbiguous) return MODES.county(Pq, ctx, T, B);
    return MODES.discover(Pq, ctx, T, B);
  }
  if (hits.length > 1) {
    return { answer: { text: `${hits.length} parcels on file match that street. They are not the same property. Street on the list.`, status: "PROVISIONAL" }, rows: parcelRows(hits) };
  }
  const p = hits[0];
  const D = parcelDossier(p, 0.8, ctx, T, B);
  const F = D.P.F;
  const where = Pq.street ? "Street on the list." : "The match is the text on the list.";
  return {
    answer: { text: `APN ${p.apn} · ${p.label}, ${/city$/i.test(p.county) ? p.county : `${p.county} County`} ${p.state}. Delinquent ${F.amount.display}. Next sale: ${D.C.facts.sale_date.display}. ${where} Not a survey.`, fact: F.apn, status: "PROVISIONAL", confidence: conf(F.apn) },
    cards: [F.apn, F.amount, D.C.facts.sale_date, F.owner], groups: D.groups, parcel: p,
    rows: parcelRows([p]),
  };
};

MODES.zip = (Pq, ctx, T, B) => {
  const hits = allProperties().filter((p) => p.zip && String(p.zip).replace(/\D/g, "").startsWith(Pq.zip));
  T("Entity resolution", hits.length ? `${hits.length} parcels have ZIP ${Pq.zip} on the row.` : `ZIP ${Pq.zip} is not stored on any list.`);
  if (!hits.length) return { answer: { text: `ZIP ${Pq.zip} is not on file.`, status: "MISSING" }, rows: [] };
  if (hits.length === 1) {
    const p = hits[0];
    return { answer: { text: `ZIP on the list: ${Pq.zip}. APN ${p.apn} · ${p.label}, ${p.county}, ${p.state}.`, status: "PROVISIONAL" }, parcel: p, rows: parcelRows(hits) };
  }
  return { answer: { text: `${hits.length} parcels on file have ZIP ${Pq.zip}. ZIP on the list.`, status: "PROVISIONAL" }, rows: parcelRows(hits) };
};

MODES.city = (Pq, ctx, T, B) => {
  const want = String(Pq.city || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const hits = allProperties().filter((p) => {
    if (Pq.states.length && !Pq.states.includes(p.state)) return false;
    const city = String(p.placeCity || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    return city === want;
  });
  T("Entity resolution", hits.length ? `${hits.length} parcels have the city ${Pq.city} on the list.` : `No city field or street label names ${Pq.city}.`);
  if (!hits.length) return { answer: { text: `City is not on this list. ${Pq.city}${Pq.states[0] ? `, ${Pq.states[0]}` : ""} is not a city stored on a parcel row.`, status: "MISSING" }, rows: [] };
  if (hits.length === 1) {
    const p = hits[0];
    return { answer: { text: `City on the list: ${p.placeCity}. APN ${p.apn} · ${p.label}, ${p.county}, ${p.state}.`, status: "PROVISIONAL" }, parcel: p, rows: parcelRows([p]) };
  }
  return { answer: { text: `${hits.length} parcels on file are in ${hits[0].placeCity}. City on the list. Not a county.`, status: "PROVISIONAL" }, rows: parcelRows(hits) };
};

MODES.parcel = (Pq, ctx, T, B) => {
  const r = resolveApn(Pq.apn, ctx, T);
  if (!r.hits.length) {
    const lists = Object.entries(PROPERTY_DB.counties).filter(([, d]) => d.rows && d.rows.length).map(([k]) => k.split("|").reverse().join(", "));
    B("treasurer", "none", `searched ${lists.length} lists`); B("assessor", "unconnected", "no assessor feed");
    return { answer: { text: `No parcel with identifier "${Pq.apn}" is in the ${lists.length} county lists on file. That does not mean the parcel doesn't exist: the county assessor is the authority.`, status: "MISSING" },
      next: [`Search the county assessor for "${Pq.apn}"`, "If you know the county, name it so the search can say whether that county's list is on file"], notes: [`Lists searched: ${lists.join(" · ")}`] };
  }
  if (r.ambiguous) {
    T("Entity resolution", `Identifier matches parcels in ${r.counties.length} counties. Not merged: add the county.`);
    return { answer: { text: `Ambiguous: "${Pq.apn}" matches parcels in ${r.counties.length} different counties. They are not merged. Name the county.`, status: "MISSING" },
      rows: r.hits.map((p) => ({ title: `APN ${p.apn} · ${p.county}, ${p.state}`, sub: p.label, status: "PROVISIONAL", parcelId: p.id, query: `APN ${p.apn} in ${p.county} County, ${p.state}` })) };
  }
  const p = r.hits.find((x) => (Pq.counties[0] ? x.key === Pq.counties[0].key : true)) || r.hits[0];
  const D = parcelDossier(p, r.ident, ctx, T, B);
  const F = D.P.F;
  return {
    answer: { text: `APN ${p.apn} · ${p.label}, ${p.county} County ${p.state}. Delinquent ${F.amount.display}. Next sale: ${D.C.facts.sale_date.display}.`, fact: F.apn, status: F.apn.status, confidence: conf(F.apn) },
    cards: [F.apn, F.amount, D.C.facts.sale_date, F.owner], groups: [...D.groups, { title: "Title risk", facts: D.titles, banner: "Not a title examination. \"No record found\" means none in the sources searched, never that no lien exists." }, { title: "Property risk", facts: D.risks }],
    gaps: D.G, graph: D.graph, parcel: p, identity: { how: r.how, ident: r.ident }, next: nextSteps([...Object.values(F), ...D.risks, ...D.titles]),
  };
};

const needParcel = (T) => { T("Entity resolution", "No parcel identifier and no parcel in focus."); return { answer: { text: "Name a parcel (APN) or open one in a dossier first. This question is answered per parcel.", status: "MISSING" } }; };

MODES.title = (Pq, ctx, T, B) => {
  const { p, r } = contextParcel(Pq, ctx, T);
  if (!p) return r && r.ambiguous ? MODES.parcel(Pq, ctx, T, B) : needParcel(T);
  const titles = titleFacts(p, ctx);
  B("recorder", titles.some((t) => t.titleState === "FOUND" || t.titleState === "NONE") ? "found" : "unconnected", "research records only");
  B("courts", "unconnected", "PACER and state courts not connected"); B("treasurer", "found", "list record");
  const topic = TITLE_CATS.find(([k, label]) => new RegExp(label.split(/[ /]/)[0], "i").test(Pq.lc) || (k === "federal" && /irs|federal/.test(Pq.lc)) || (k === "bk" && /bankrupt/.test(Pq.lc)) || (k === "judgment" && /lis pendens/.test(Pq.lc)));
  const head = topic ? titles.find((t) => t.key === `title_${topic[0]}`) : null;
  T("Validation", `${titles.filter((t) => t.titleState === "FOUND").length} records found, ${titles.filter((t) => t.titleState === "NONE").length} categories searched with none found, ${titles.filter((t) => !["FOUND", "NONE"].includes(t.titleState)).length} not searchable from here.`);
  return {
    answer: { text: head ? `${head.label} on APN ${p.apn}: ${head.display}` : `Title research on APN ${p.apn}: ${titles.filter((t) => t.titleState === "FOUND").length} records found, ${titles.filter((t) => t.titleState === "NONE").length} categories searched with none found, ${titles.filter((t) => !["FOUND", "NONE"].includes(t.titleState)).length} not searched.`, fact: head, status: head ? head.status : worst(titles), confidence: head ? conf(head) : null },
    cards: head ? [head] : [], groups: [{ title: `Title risk · APN ${p.apn}`, facts: titles, banner: "Not a title examination. \"No record found\" means none in the sources searched, never that no lien exists." }],
    parcel: p, next: titles.filter((t) => !["FOUND", "NONE"].includes(t.titleState)).slice(0, 5).map((t) => `${t.label}: ${t.where}`),
  };
};

MODES.risk = (Pq, ctx, T, B) => {
  const { p, r } = contextParcel(Pq, ctx, T);
  if (!p) return r && r.ambiguous ? MODES.parcel(Pq, ctx, T, B) : needParcel(T);
  const risks = riskFacts(p, ctx);
  B("federal", risks.some((f) => ["risk_flood", "risk_contamination", "risk_wetlands"].includes(f.key) && f.evidenceCount) ? "found" : "unconnected", "FEMA / EPA / USFWS not connected");
  B("environmental", risks.some((f) => f.key === "risk_wildfire" && f.evidenceCount) ? "found" : "unconnected", "state datasets not connected");
  B("gis", "unconnected", "parcel GIS not connected"); B("assessor", "unconnected", "improvements not connected");
  const topic = RISK_CATS.find(([k, label]) => Pq.lc.includes(k) || Pq.lc.includes(label.toLowerCase()) || (k === "wildfire" && /\bfire\b/.test(Pq.lc)) || (k === "contamination" && /\bepa\b|contamina/.test(Pq.lc)) || (k === "structure" && /structure|building/.test(Pq.lc)));
  const head = topic ? risks.find((f) => f.key === `risk_${topic[0]}`) : null;
  return {
    answer: { text: head ? `${head.label} for APN ${p.apn}: ${head.display}` : `Property risk for APN ${p.apn}: ${risks.filter((f) => f.evidenceCount).length} of ${risks.length} risks have evidence on file.`, fact: head, status: head ? head.status : worst(risks), confidence: head ? conf(head) : null },
    cards: head ? [head] : [], groups: [{ title: `Property risk · APN ${p.apn}`, facts: risks, banner: "Each risk stands alone. A risk with no evidence is unknown, not absent." }], parcel: p,
    next: risks.filter((f) => !f.evidenceCount).map((f) => `${f.label}: ${f.where}`),
  };
};

MODES.gaps = (Pq, ctx, T, B) => {
  const { p, r } = contextParcel(Pq, ctx, T);
  if (!p) {
    if (Pq.counties[0]) { const out = MODES.county(Pq, ctx, T, B); const miss = out.groups.flatMap((g) => g.facts).filter((f) => f && ["MISSING", "PAID", "RESTRICTED", "FIELD"].includes(f.status)); return { ...out, answer: { text: `${miss.length} county fields have no supporting source on file.`, status: "MISSING" }, cards: [] }; }
    return r && r.ambiguous ? MODES.parcel(Pq, ctx, T, B) : needParcel(T);
  }
  const D = parcelDossier(p, r ? r.ident : 1, ctx, T, B);
  T("Research gap engine", `Known ${D.G.known.length} · unknown ${D.G.unknown.length} · conflicts ${D.G.conflicts.length} · field ${D.G.field.length} · deal killers open ${D.G.killers.length}.`);
  return { answer: { text: `APN ${p.apn}: ${D.G.unknown.length} facts unknown, ${D.G.conflicts.length} in conflict or stale, ${D.G.field.length} need a field visit, and ${D.G.killers.filter((k) => k.state !== "OPEN").length} deal-killers found (${D.G.killers.filter((k) => k.state === "OPEN").length} still open).`, status: "MISSING" },
    gaps: D.G, graph: D.graph, parcel: p, next: D.G.killers.filter((k) => k.state === "OPEN").slice(0, 6).map((k) => `${k.label}: ${itemById(k.id).where}`) };
};

MODES.reject = (Pq, ctx, T, B) => {
  const { p, r } = contextParcel(Pq, ctx, T);
  if (!p) return r && r.ambiguous ? MODES.parcel(Pq, ctx, T, B) : needParcel(T);
  const D = parcelDossier(p, r ? r.ident : 1, ctx, T, B);
  return { answer: { text: `Evidence that would reject APN ${p.apn}: ${D.G.killers.length} stop items not yet cleared${D.G.killers.some((k) => k.state === "FOUND") ? `, ${D.G.killers.filter((k) => k.state === "FOUND").length} already failed` : ""}.`, status: D.G.killers.some((k) => k.state === "FOUND") ? "CONFLICT" : "MISSING" },
    gaps: { ...D.G, onlyKillers: true }, parcel: p, graph: D.graph, next: D.G.killers.filter((k) => k.state === "OPEN").slice(0, 6).map((k) => `${k.label}: ${itemById(k.id).where}`) };
};

MODES.sources = (Pq, ctx, T, B) => {
  const { p, r } = contextParcel(Pq, ctx, T);
  if (!p && !Pq.counties[0]) return r && r.ambiguous ? MODES.parcel(Pq, ctx, T, B) : needParcel(T);
  let facts;
  if (p) { const D = parcelDossier(p, r ? r.ident : 1, ctx, T, B); facts = [...D.groups.flatMap((g) => g.facts), ...D.titles, ...D.risks]; }
  else { const C = countyFacts(Pq.counties[0].key, ctx); facts = Object.values(C.facts).filter(Boolean); }
  const src = new Map();
  for (const f of facts) for (const o of f.evidence || []) { const s = o.source; const e = src.get(s.id) || { s, fields: [] }; e.fields.push(f.label); src.set(s.id, e); }
  if (!p) for (const x of statuteSources(Pq.counties[0].st)) if (!src.has(x.id)) src.set(x.id, { s: x, fields: ["State rules"] });
  const rows = [...src.values()].sort((a, b) => a.s.tier - b.s.tier).map(({ s, fields }) => ({ title: s.label, sub: `${TIERS[s.tier].label} · ${s.agency} · ${s.method}${s.accessed ? ` · accessed ${s.accessed}` : ""}`, url: s.url, status: s.url ? "VERIFIED" : "PROVISIONAL", fields: [...new Set(fields)], source: s }));
  T("Provenance", `${rows.length} distinct sources support ${facts.filter((f) => f.evidenceCount).length} fields.`);
  return { answer: { text: `${rows.length} sources on file for ${p ? `APN ${p.apn}` : `${Pq.counties[0].name} County`}. ${rows.filter((x) => !x.url).length} have no URL recorded.`, status: rows.length ? "PROVISIONAL" : "MISSING" }, rows, parcel: p };
};

function countiesWithSales(ctx) {
  const keys = new Set([...Object.keys(NEXT_SALE_BUNDLED), ...Object.keys(REPORTED)]);
  if (ctx.live) for (const [k, r] of ctx.live) if (/:sale_date$/.test(k) || /:registration_closes$/.test(k)) { const row = NATIONAL.find((x) => String(x[2]).padStart(5, "0") === r.fips); if (row) keys.add(`${row[1]}|${row[0]}`); }
  return [...keys];
}
MODES.auction = (Pq, ctx, T, B) => {
  const wantDate = Pq.days != null || /upcoming|next|scheduled|live auctions/.test(Pq.lc) || !Pq.platform;
  let keys = Pq.platform ? Object.keys(COUNTY_VERIFIED.counties).concat(Pq.states.includes("FL") || !Pq.states.length ? Object.keys(COUNTY_VERIFIED.fl_dor_2026.rows).map((n) => `FL|${n}`) : [], countiesWithSales(ctx)) : countiesWithSales(ctx);
  keys = [...new Set(keys)].filter((k) => rowFor(k) && (!Pq.states.length || Pq.states.includes(k.split("|")[0])));
  T("Source discovery", `${keys.length} counties with a sale date, deadline or provider on file${Pq.states.length ? ` in ${Pq.states.join(", ")}` : ""}.`);
  let rows = keys.map((k) => ({ k, C: countyFacts(k, ctx) }));
  B("treasurer", "found", "sale calendar"); B("provider", "found", "platforms, FL DOR roster"); B("county", "found", "national table");
  const excluded = { verified: 0, noDate: 0 };
  rows = rows.filter(({ C }) => {
    const d = C.facts.sale_date.value ? daysBetween(ctx.today, isoDay(C.facts.sale_date.value)) : null;
    if (Pq.days != null && (d == null || d < 0 || d > Pq.days)) { if (d == null) excluded.noDate++; return false; }
    if (wantDate && Pq.days == null && !Pq.platform && (d == null || d < 0)) { if (d == null) excluded.noDate++; return false; }
    if (Pq.regDays != null) { const r = C.facts.registration_deadline.value ? daysBetween(ctx.today, isoDay(C.facts.registration_deadline.value)) : null; if (r == null || r < 0 || r > Pq.regDays) return false; }
    if (Pq.platform && !String(C.facts.platform.display || "").toLowerCase().includes(Pq.platform)) return false;
    if (Pq.saleKind && C.facts.sale_type.value && C.facts.sale_type.value !== Pq.saleKind) return false;
    if ((Pq.lists || Pq.downloadable) && !(C.deck && C.deck.rows && C.deck.rows.length && (!Pq.downloadable || C.deck.sourceUrl))) return false;
    if (Pq.verifiedOnly && !RESOLVED_STATUS.has(C.facts.sale_date.status)) { excluded.verified++; (excluded.names ||= []).push(`${C.name} ${C.st} (${STATUS[C.facts.sale_date.status].label.toLowerCase()})`); return false; }
    return true;
  }).sort((a, b) => String(a.C.facts.sale_date.value || "9").localeCompare(String(b.C.facts.sale_date.value || "9")));
  T("Validation", `${rows.length} match${excluded.verified ? `; ${excluded.verified} more on file are not verified` : ""}${excluded.noDate ? `; ${excluded.noDate} have no date on file` : ""}.`);
  const out = rows.map(({ k, C }) => ({ title: `${C.name}, ${C.st}`, sub: `${C.facts.sale_date.display} · ${C.facts.sale_type.display}`, status: C.facts.sale_date.status, conf: conf(C.facts.sale_date), county: k,
    facts: [C.facts.sale_date, C.facts.registration_deadline, C.facts.deposit, C.facts.platform, C.facts.delinquent_list, C.facts.sale_type], query: `${C.name} County, ${C.st}` }));
  return { answer: { text: `${out.length} sale${out.length === 1 ? "" : "s"} on file match${excluded.verified ? `. ${excluded.verified} more are on file but not verified, so they are left out: ${excluded.names.join(", ")}` : ""}. Counties with no date on file are not shown; that is not proof they have no sale.`, status: !out.length ? "MISSING" : out.every((r) => r.facts[0].status === "VERIFIED") ? "VERIFIED" : "PROVISIONAL" }, rows: out };
};

MODES.otc = (Pq, ctx, T, B) => {
  const keys = new Set([...Object.keys(COUNTY_VERIFIED.otc_county), ...(OTC_DB.rows || []).map((r) => `${r[1]}|${r[0]}`)]);
  let list = [...keys].filter((k) => rowFor(k) && (!Pq.states.length || Pq.states.includes(k.split("|")[0])) && (!Pq.counties.length || Pq.counties.some((c) => c.key === k)));
  B("treasurer", "found", "OTC tables"); B("county", "found", "verified county OTC links");
  T("Source discovery", `${list.length} counties with OTC evidence on file.`);
  let rows = list.map((k) => { const C = countyFacts(k, ctx); const R = rulesFor(k.split("|")[0]); return { k, C, R }; });
  const before = rows.length; let unverified = 0;
  if (Pq.verifiedOnly) rows = rows.filter((x) => { const f = x.C.facts.otc_status; const ok = RESOLVED_STATUS.has(f.status) && f.value === "available"; if (!ok) unverified++; return ok; });
  if (Pq.minRate != null) rows = rows.filter((x) => x.R.verified && x.R.statutoryRate != null && x.R.statutoryRate > Pq.minRate);
  rows.sort((a, b) => statusRank(a.C.facts.otc_status.status) - statusRank(b.C.facts.otc_status.status));
  T("Normalization", "Rates kept separate: advertised, maximum statutory, bid-down, penalty, actual certificate rate, effective return.");
  const out = rows.map(({ k, C, R }) => {
    const e = `county:${k}`;
    const statRate = C.facts.statutory_rate;
    const facts = [C.facts.otc_status, C.facts.otc_rate_advertised, statRate,
      fact({ key: "bid_down", label: "Bid-down applies", entity: e, today: ctx.today, fresh: "statute" }, R.verified ? [{ value: R.mechanism === "bid-down" ? "Yes at auction; OTC certificates usually carry the rate set at sale" : `No (${R.mechanism})`, source: statuteSources(k.split("|")[0])[0] || source({ tier: 1, agency: "State statute", label: "Rulebook", human: true }) }] : []),
      C.facts.penalty,
      gap(e, "cert_rate", "Actual certificate rate", "The certificate itself (per certificate, from the county)", ctx.today),
      gap(e, "effective_return", "Effective return", "Depends on purchase price, hold time and redemption: computed per certificate, never assumed", ctx.today, "MISSING", "Unknown: depends on price, hold and redemption")];
    return { title: `${C.name}, ${C.st}`, sub: C.facts.otc_status.display, status: C.facts.otc_status.status, conf: conf(C.facts.otc_status), county: k, facts, query: `${C.name} County, ${C.st} OTC` };
  });
  const rateNote = Pq.minRate != null ? ` Filtered on the maximum statutory rate above ${Pq.minRate}%: that is a ceiling, not a return. Effective return is unknown for every row.` : "";
  return { answer: { text: `${out.length} count${out.length === 1 ? "y" : "ies"} with OTC evidence${Pq.verifiedOnly ? ` verified (${unverified} more are only "likely")` : ""}.${rateNote}`, status: out.length ? (Pq.verifiedOnly ? "VERIFIED" : "PROVISIONAL") : "MISSING" }, rows: out.slice(0, 80), total: out.length, before };
};

MODES.rules = (Pq, ctx, T, B) => {
  const st = Pq.states[0] || (Pq.counties[0] && Pq.counties[0].st);
  const R = rulesFor(st);
  const src = statuteSources(st);
  B("county", Object.keys(COUNTY_VERIFIED.counties).some((k) => k.startsWith(st + "|")) ? "found" : "none", "county variations");
  T("Source discovery", `${STATE_NAMES[st]}: ${R.verified ? `verified rulebook with ${src.length} statute citations` : "not in the verified rulebook"}.`);
  const e = `state:${st}`;
  const rb = src[0] || source({ tier: 3, agency: `${STATE_NAMES[st]} workbook`, label: "Workbook value, not verified", accessed: "2026-09-04" });
  const cap = R.verified ? undefined : "PROVISIONAL";
  const one = (key, label, v) => (v ? fact({ key, label, entity: e, fresh: "statute", today: ctx.today, cap }, [{ value: v, source: rb }]) : gap(e, key, label, "State statute", ctx.today));
  const foreclosure = (R.rules || []).filter((t) => /deed|foreclos/i.test(t)).join(" ");
  const facts = [one("sale_type", "Sale type", R.instrument), one("interest", "Interest / penalty", R.headline + (R.penaltyPct != null ? ` · penalty ${R.penaltyPct}%` : "")), one("bidding", "Bidding method", R.mechanism),
    one("redemption", "Redemption period", R.redemption !== "Not verified" ? R.redemption : null), one("foreclosure", "Foreclosure process", foreclosure || null)];
  const statements = (R.rules || []).map((t) => { const cite = (t.match(/\(([^)]*\d[^)]*)\)/) || [])[1] || null; return { text: t, cite, source: cite ? src.find((s) => cite.split(/[,;]/)[0].trim().split(" ").slice(-1)[0] && s.label.includes(cite.split(/[,;]/)[0].trim().split(" ").slice(-1)[0])) || rb : rb }; });
  const variations = Object.entries(COUNTY_VERIFIED.counties).filter(([k]) => k.startsWith(st + "|")).map(([k, cv]) => ({ title: k.split("|")[1] + " County", sub: (cv.facts.find(([f]) => /bid method|platform/i.test(f)) || ["", "terms on file"])[1], query: `${k.split("|")[1]} County, ${st}` }));
  return {
    answer: { text: R.verified ? `${STATE_NAMES[st]}: ${R.instrument}; ${R.headline}; redemption ${R.redemption}.` : `${STATE_NAMES[st]} is not in the verified rulebook. What follows is a workbook lead, not verified law.`, status: R.verified ? "VERIFIED" : "PROVISIONAL", confidence: facts[0].confidence ? facts[0].confidence.score : null },
    cards: facts, rules: { st, statements, refs: src, variations, lastVerified: src.map((s) => s.accessed).filter(Boolean).sort().pop() || null }, disclaimer: "Research information, not legal advice.",
  };
};

MODES.owner = (Pq, ctx, T, B) => {
  const q = (Pq.owner || Pq.raw.replace(/.*owned by|owner/i, "")).toUpperCase().replace(/[^A-Z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  const ix = parcelIndex(ctx.extraParcels || []);
  const withOwner = ix.all.filter((p) => p.owner);
  const noOwnerLists = Object.entries(PROPERTY_DB.counties).filter(([, d]) => d.rows && d.rows.length && !d.cols.includes("owner")).map(([k]) => k.split("|").reverse().join(", "));
  const norm = (s) => String(s).toUpperCase().replace(/[^A-Z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  const toks = q.split(" ").filter((t) => t.length > 1 && !["LLC", "INC", "TRUST", "CORP", "THE", "OF", "AND"].includes(t));
  const hits = withOwner.map((p) => { const o = norm(p.owner); return { p, exact: o === q, partial: toks.length && toks.every((t) => o.includes(t)) }; }).filter((x) => x.exact || x.partial);
  B("assessor", "unconnected", "assessor owner index not connected"); B("treasurer", hits.length ? "found" : "none", `${withOwner.length.toLocaleString()} list rows carry owner names`); B("recorder", "unconnected", "grantor/grantee index not connected");
  T("Entity resolution", `Owner "${q}": ${hits.filter((h) => h.exact).length} exact, ${hits.filter((h) => !h.exact).length} partial (ambiguous) matches. Relationships between entities are not inferred.`);
  return {
    answer: { text: hits.length ? `${hits.length} parcel${hits.length === 1 ? "" : "s"} list an owner matching "${q}" (${hits.filter((h) => !h.exact).length} partial, marked ambiguous). Related entities: not supported by records on file, not guessed.` : `No owner matching "${q}" in the ${withOwner.length.toLocaleString()} list rows that carry owner names. ${noOwnerLists.length} lists carry no owner names at all, so they can't be searched this way.`, status: hits.some((h) => h.exact) ? "PROVISIONAL" : "MISSING" },
    rows: hits.slice(0, 80).map(({ p, exact }) => ({ title: `${p.owner}${exact ? "" : " · ambiguous"}`, sub: `APN ${p.apn} · ${p.county}, ${p.state} · owed ${p.amount != null ? `$${Number(p.amount).toLocaleString()}` : "not on list"}`, status: exact ? "PROVISIONAL" : "CONFLICT", parcelId: p.id, query: `APN ${p.apn} in ${p.county} County, ${p.state}` })),
    notes: noOwnerLists.length ? [`Lists without owner names: ${noOwnerLists.join(" · ")}`] : [],
  };
};

MODES.parcels = (Pq, ctx, T, B) => {
  const ix = parcelIndex(ctx.extraParcels || []);
  let scope = ix.all;
  if (Pq.counties.length) {
    const k = Pq.counties[0].key;
    const deck = PROPERTY_DB.counties[k];
    if (!deck || !deck.rows || !deck.rows.length) {
      B("treasurer", "none", "no list on file"); T("Retrieval", `No parcel list on file for ${k}.`);
      return { answer: { text: `No parcel list is on file for ${Pq.counties[0].name} County, ${Pq.counties[0].st}. That is not evidence that no delinquent parcels exist there: the county treasurer's delinquent list is the source.`, status: "MISSING" },
        next: [`Request or download ${Pq.counties[0].name} County's delinquent list from the treasurer`, "Load it through the intake pipeline so it can be searched"] };
    }
    scope = scope.filter((p) => p.key === k);
  } else if (Pq.states.length) scope = scope.filter((p) => Pq.states.includes(p.state));
  const notes = [];
  if (Pq.days != null) {
    const soon = new Set(countiesWithSales(ctx).filter((k) => { const C = countyFacts(k, ctx); const d = C.facts.sale_date.value ? daysBetween(ctx.today, isoDay(C.facts.sale_date.value)) : null; return d != null && d >= 0 && d <= Pq.days; }));
    const withLists = [...soon].filter((k) => PROPERTY_DB.counties[k] && PROPERTY_DB.counties[k].rows && PROPERTY_DB.counties[k].rows.length);
    notes.push(`${soon.size} counties have a sale within ${Pq.days} days; ${withLists.length} of them have a parcel list on file${soon.size > withLists.length ? ` (none for ${[...soon].filter((k) => !withLists.includes(k)).map((k) => k.split("|").reverse().join(", ")).slice(0, 8).join("; ")})` : ""}.`);
    scope = scope.filter((p) => soon.has(p.key));
  }
  let noAcres = 0;
  if (Pq.minAcres != null) scope = scope.filter((p) => { if (p.acres == null) { noAcres++; return false; } return p.acres > Pq.minAcres; });
  if (noAcres) notes.push(`${noAcres.toLocaleString()} parcels have no acreage on their list and were not evaluated.`);
  if (Pq.incompleteTitle) { const T_ = BRANCHES.find((b) => b.id === "title").items; scope = scope.filter((p) => { const r = (ctx.dd || {})[p.id] || {}; return !T_.every((id) => ["verified", "passed", "failed", "flagged"].includes(stateOf(r[id]).id)); }); notes.push("Incomplete title = any title check not yet resolved in your research."); }
  if (Pq.delinquent) notes.push("\"Delinquent\" = on the county's list as of its list date. Lists from sales already held can't say whether a parcel has since redeemed.");
  B("treasurer", scope.length ? "found" : "none", "parcel lists"); B("assessor", "unconnected", "list fields only");
  T("Validation", `${scope.length.toLocaleString()} parcels pass every filter.`);
  const rows = scope.slice(0, 80).map((p) => ({ title: `APN ${p.apn} · ${p.county}, ${p.state}`, sub: `${p.label}${p.acres ? ` · ${p.acres} ac` : ""} · owed ${p.amount != null ? `$${Number(p.amount).toLocaleString()}` : "not on list"}`, status: p.level === "CURATED" ? "PROVISIONAL" : p.level === "PUBLISHED" && PROPERTY_DB.counties[p.key] && PROPERTY_DB.counties[p.key].sourceUrl ? "VERIFIED" : "PROVISIONAL", parcelId: p.id, query: `APN ${p.apn} in ${p.county} County, ${p.state}` }));
  return { answer: { text: `${scope.length.toLocaleString()} parcel${scope.length === 1 ? "" : "s"} on file match.${scope.length > 80 ? " Showing the first 80." : ""}`, status: scope.length ? "PROVISIONAL" : "MISSING" }, rows, notes, total: scope.length };
};

MODES.field = (Pq, ctx, T, B) => {
  const ids = [...new Set([...((ctx.holo && ctx.holo.mission) || []), ...Object.keys(ctx.dd || {})])];
  const ps = ids.map((id) => findParcel(id, ctx)).filter(Boolean);
  const rows = ps.map((p) => { const r = (ctx.dd || {})[p.id] || {}; const open = FIELD_ITEMS.filter((id) => !["verified", "passed", "failed"].includes(stateOf(r[id]).id)); return { p, open }; }).filter((x) => x.open.length)
    .map(({ p, open }) => ({ title: `APN ${p.apn} · ${p.county}, ${p.state}`, sub: `Needs: ${open.map((id) => itemById(id).t).join(" · ")}`, status: "FIELD", parcelId: p.id, query: `APN ${p.apn} in ${p.county} County, ${p.state}` }));
  B("gis", "found", "pins and seats"); T("Validation", `${rows.length} of ${ps.length} researched parcels still need a field visit.`);
  return { answer: { text: rows.length ? `${rows.length} parcel${rows.length === 1 ? "" : "s"} need field verification.` : ps.length ? "Every researched parcel has its field checks resolved." : "No parcels on your mission or in research yet.", status: rows.length ? "FIELD" : "MISSING" }, rows };
};

MODES.discover = (Pq, ctx, T, B) => {
  const toks = Pq.lc.split(/[^a-z0-9]+/).filter((t) => t.length > 2 && !["the", "and", "for", "show", "find", "with", "what", "which", "county", "counties", "all", "any", "are", "there"].includes(t));
  const cs = toks.length ? NATIONAL.filter((r) => toks.some((t) => r[0].toLowerCase() === t)).slice(0, 12) : [];
  T("Query understanding", `No mode matched; looked for county names among [${toks.join(", ")}].`);
  if (!cs.length) return { answer: { text: "Nothing on file matches that question. Try a county (\"Polk County, IA\"), an APN, an owner, a state's rules, or one of the quick searches.", status: "MISSING" } };
  return { answer: { text: `${cs.length} count${cs.length === 1 ? "y" : "ies"} share a name in your question. Pick one.`, status: "MISSING" }, rows: cs.map((r) => ({ title: `${r[0]}, ${r[1]}`, sub: STATE_NAMES[r[1]], status: "MISSING", query: `${r[0]} County, ${r[1]}` })) };
};

function nextSteps(facts) {
  const seen = new Set(), out = [];
  for (const f of facts) { if (!f || seen.has(f.label)) continue;
    if (f.status === "CONFLICT") out.push(`Resolve ${f.label.toLowerCase()}: open both sources and confirm with the county`);
    else if (f.status === "STALE") out.push(`Re-check ${f.label.toLowerCase()}: last checked ${f.lastChecked}`);
    else if (["MISSING", "PAID", "RESTRICTED", "FIELD"].includes(f.status) && f.where) out.push(`${f.label}: ${f.where}`);
    else if (f.status === "PROVISIONAL" && f.lead && !f.lead.url) out.push(`Find the page behind ${f.label.toLowerCase()} (no URL on file)`);
    seen.add(f.label); if (out.length >= 8) break; }
  return out;
}

/* ------------------------------------ run ------------------------------------ */
export function search(q, ctx0 = {}) {
  const ctx = { today: todayIso(), dd: {}, photos: {}, holo: { mission: [], pins: {}, visits: {}, bids: {} }, positions: [], live: typeof window !== "undefined" && window.__hotlLive ? window.__hotlLive : null, ...ctx0 };
  const trace = [];
  const T = (stage, text) => trace.push({ stage, text });
  const branches = Object.fromEntries(BRANCH_DEFS.map(([id, label]) => [id, { id, label, status: "skipped", detail: "" }]));
  const B = (id, status, detail) => { branches[id] = { ...branches[id], status, detail }; };
  const Pq = parseQuery(q);
  T("Query understanding", `Mode: ${Pq.mode}. ${[Pq.states.length && `States ${Pq.states.join(", ")}`, Pq.counties.length && `County ${Pq.counties.map((c) => c.key).join(", ")}`, Pq.apn && `Identifier "${Pq.apn}"`, Pq.owner && `Owner "${Pq.owner}"`, Pq.days != null && `Window ${Pq.days} days`, Pq.regDays != null && `Registration within ${Pq.regDays} days`, Pq.platform && `Platform ${Pq.platform}`, Pq.minRate != null && `Rate > ${Pq.minRate}%`, Pq.minAcres != null && `Acreage > ${Pq.minAcres}`, Pq.verifiedOnly && "verified only"].filter(Boolean).join(" · ") || "No entity recognized"}.`);
  const res = (MODES[Pq.mode] || MODES.discover)(Pq, ctx, T, B);
  const G = res.gaps ? [...res.gaps.known, ...res.gaps.unknown, ...res.gaps.conflicts, ...res.gaps.field] : [];
  const all = [...(res.cards || []), ...((res.groups || []).flatMap((g) => g.facts)), ...((res.rows || []).flatMap((r) => r.facts || [])), ...G].filter(Boolean);
  const uniq = all.filter((f, i, a) => a.findIndex((g) => g.id === f.id) === i);
  const conflicts = uniq.filter((f) => f.status === "CONFLICT");
  const missing = uniq.filter((f) => ["MISSING", "PAID", "RESTRICTED", "FIELD"].includes(f.status));
  const sources = []; for (const f of uniq) for (const o of f.evidence || []) if (!sources.some((s) => s.id === o.source.id)) sources.push(o.source);
  T("Provenance", `${sources.length} sources attached to ${uniq.filter((f) => f.evidenceCount).length} supported fields.`);
  T("Confidence", `Computed per field from source authority, freshness, agreement, record match, identifier match and manual verification.`);
  T("Answer generation", `Answer written last, from the fields above. ${missing.length} gaps and ${conflicts.length} conflicts are shown, not hidden.`);
  const answer = { status: res.answer.status || (res.answer.fact ? res.answer.fact.status : "MISSING"), confidence: res.answer.confidence ?? (res.answer.fact && res.answer.fact.confidence ? res.answer.fact.confidence.score : null), lastChecked: res.answer.fact ? res.answer.fact.lastChecked : sources.map((s) => s.accessed).filter(Boolean).sort().pop() || null, ...res.answer };
  return { question: q, parsed: Pq, mode: Pq.mode, ...res, answer, facts: uniq, conflicts, missing, sources: sources.sort((a, b) => a.tier - b.tier), branches: Object.values(branches), trace };
}
export { STATUS, TIERS };
