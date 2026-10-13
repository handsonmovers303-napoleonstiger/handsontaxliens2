/* QUANTUM SEARCH — evidence core.
 *
 * One rule: NO SOURCE = NO FACT. A value only reaches the answer attached to the
 * sources that support it, and its status and confidence are computed from those
 * sources, never asserted. "Quantum" names the many evidence branches searched at
 * once; no quantum hardware or quantum algorithm is involved. */

export const TIERS = {
  1: { label: "Tier 1 · Primary government", short: "T1", authority: 1 },
  2: { label: "Tier 2 · Officially designated provider", short: "T2", authority: 0.8 },
  3: { label: "Tier 3 · Verified secondary", short: "T3", authority: 0.5 },
  4: { label: "Tier 4 · Discovery only", short: "T4", authority: 0.15 },
};

export const STATUS = {
  VERIFIED: { label: "Verified", tone: "gr", means: "A primary authoritative source supports the value." },
  CORROBORATED: { label: "Corroborated", tone: "cy", means: "Two or more credible sources agree." },
  PROVISIONAL: { label: "Provisional", tone: "am", means: "A credible source exists but needs further verification." },
  CONFLICT: { label: "Conflict", tone: "rd", means: "Reliable sources disagree." },
  STALE: { label: "Stale", tone: "am", means: "A source exists but is past its freshness threshold." },
  MISSING: { label: "Missing", tone: "", means: "No supporting record located." },
  RESTRICTED: { label: "Restricted", tone: "in", means: "The data exists but cannot be accessed here." },
  PAID: { label: "Paid data", tone: "in", means: "Official access requires payment." },
  FIELD: { label: "Needs field verify", tone: "in", means: "Cannot be resolved reliably from records." },
};
export const RESOLVED_STATUS = new Set(["VERIFIED", "CORROBORATED"]);

/** Days a value stays fresh, by kind of fact. */
export const FRESH = { sale_date: 45, deadline: 45, statute: 365, county_terms: 180, list: 60, amount: 60, otc: 120, contact: 180, results: 400, research: 180, field: 365, default: 120 };

export const WEIGHTS = [
  ["authority", "Source authority", 30],
  ["freshness", "Source freshness", 20],
  ["agreement", "Source agreement", 20],
  ["record", "Record match", 15],
  ["identifier", "Identifier match", 10],
  ["manual", "Manual verification", 5],
];

const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12 };
const pad = (n) => String(n).padStart(2, "0");
/** Every calendar date written in a sentence ("October 30, 2026", "Oct 2", "2026-10-30"), in order. */
export function datesIn(text, defYear) {
  const out = [];
  for (const m of String(text || "").matchAll(/\b(\d{4})-(\d{2})-(\d{2})\b|\b(jan|feb|mar|apr|may|jun|jul|aug|sept?|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(\d{4}))?/gi)) {
    if (m[1]) out.push(`${m[1]}-${m[2]}-${m[3]}`);
    else { const y = m[6] || defYear; if (y) out.push(`${y}-${pad(MONTHS[m[4].toLowerCase().slice(0, 4)] || MONTHS[m[4].toLowerCase().slice(0, 3)])}-${pad(m[5])}`); }
  }
  return out;
}
export const isoDay = (v) => {
  if (!v) return null;
  const m = String(v).match(/\d{4}-\d{2}-\d{2}/);
  if (m) return m[0];
  const d = datesIn(v)[0];
  return d || null;
};
export const daysBetween = (a, b) => Math.round((new Date(b + "T12:00:00Z") - new Date(a + "T12:00:00Z")) / 86400000);
const clamp01 = (n) => Math.max(0, Math.min(1, n));
const isUrl = (u) => typeof u === "string" && /^https?:\/\/[^\s]+\.[^\s]+/.test(u);
export const urlIn = (text) => { const m = String(text || "").match(/https?:\/\/[^\s)"'>]+/); return m ? m[0].replace(/[.,;]+$/, "") : null; };

/** A source, normalized. Every field the spec requires is present, null when unknown. */
export function source(o) {
  return {
    id: o.id || `${o.agency}|${o.label}|${o.url || ""}`,
    tier: o.tier || 4,
    agency: o.agency || "Unknown agency",
    type: o.type || "record",
    label: o.label || o.agency || "Source",
    url: isUrl(o.url) ? o.url : null,
    accessed: isoDay(o.accessed),
    effective: isoDay(o.effective),
    jurisdiction: o.jurisdiction || null,
    recordId: o.recordId || null,
    method: o.method || "unspecified",
    human: !!o.human,
    derived: !!o.derived,
    recordMatch: o.recordMatch ?? 0.6,
    note: o.note || null,
  };
}

const norms = {
  date: (v) => isoDay(v),
  number: (v) => { const n = typeof v === "number" ? v : parseFloat(String(v).replace(/[^0-9.\-]/g, "")); return isNaN(n) ? null : String(Math.round(n * 100) / 100); },
  text: (v) => String(v).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(),
  keyword: (v) => { const t = String(v).toLowerCase(); for (const k of ["realauction", "lienhub", "govease", "zeus", "sri", "bid4assets", "grant street", "publicsurplus", "in person", "online"]) if (t.includes(k)) return k; return t.trim(); },
};

/**
 * Build one fact from observations. obs: [{ value, display?, source }].
 * opts: { key, label, entity, compare: "date"|"number"|"text"|"keyword"|"none", fresh, today,
 *         identifier (0..1), empty: status when no evidence, where, note, explain }
 */
export function fact(opts, obs) {
  const today = opts.today;
  const list = (obs || []).filter((o) => o && o.value != null && o.value !== "" && !(typeof o.value === "number" && isNaN(o.value)))
    .map((o) => ({ ...o, source: o.source.tier ? o.source : source(o.source) }));
  const base = { id: `${opts.entity}:${opts.key}`, key: opts.key, label: opts.label, entity: opts.entity, where: opts.where || null, note: opts.note || null, evidence: list, evidenceCount: list.length };
  if (!list.length) {
    const st = opts.empty || "MISSING";
    return { ...base, value: null, display: opts.emptyText || { MISSING: "Unknown · source needed", RESTRICTED: "Restricted", PAID: "Paid source required", FIELD: "Needs field verification" }[st] || "Unknown", status: st, confidence: null, conflicts: [], lead: null, lastChecked: null };
  }
  const cmp = opts.compare || "none";
  // an observation may set norm: null to say "not comparable" (a weaker claim, not a contradiction)
  const norm = (o) => (cmp === "none" ? "_" : "norm" in o ? o.norm : norms[cmp] ? norms[cmp](o.value) : String(o.value));
  // lead: highest authority, then human-verified, then most recent
  const ranked = [...list].sort((a, b) => a.source.tier - b.source.tier || (b.source.human - a.source.human) || String(b.source.accessed || "").localeCompare(String(a.source.accessed || "")));
  const lead = ranked[0];
  const groups = new Map();
  for (const o of list) { if (o.source.tier > 3) continue; const k = norm(o); if (k == null) continue; (groups.get(k) || groups.set(k, []).get(k)).push(o); }
  const conflict = cmp !== "none" && groups.size > 1;
  const agreeing = cmp === "none" ? 1 : norm(lead) == null ? 1 : (groups.get(norm(lead)) || [lead]).length;
  const th = FRESH[opts.fresh] || FRESH.default;
  const age = lead.source.accessed && today ? daysBetween(lead.source.accessed, today) : null;
  const stale = age != null && age > th;
  let status;
  if (conflict) status = "CONFLICT";
  else if (stale) status = "STALE";
  // VERIFIED needs a primary source someone can open (a URL) or that a person read; derived values never qualify
  else if (lead.source.tier === 1 && !lead.source.derived && (lead.source.url || lead.source.human)) status = "VERIFIED";
  else if (agreeing >= 2) status = "CORROBORATED";
  else status = "PROVISIONAL";
  if (opts.cap && status !== "CONFLICT" && status !== "STALE") status = opts.cap;

  const ident = opts.identifier ?? 1;
  const parts = {
    authority: TIERS[lead.source.tier].authority,
    freshness: age == null ? 0.3 : clamp01(1 - Math.max(0, age - th / 2) / (th * 1.5)),
    agreement: conflict ? 0 : agreeing >= 2 ? 1 : 0.5,
    record: clamp01(lead.source.recordMatch),
    identifier: clamp01(ident),
    manual: lead.source.human ? 1 : 0,
  };
  const why = {
    authority: `${TIERS[lead.source.tier].label}: ${lead.source.agency}`,
    freshness: age == null ? "Access date not recorded" : `Checked ${age} day${age === 1 ? "" : "s"} ago; fresh for ${th} days`,
    agreement: conflict ? `${groups.size} different values across sources` : agreeing >= 2 ? `${agreeing} sources agree` : list.length > 1 ? "Other sources not comparable" : "Single source",
    record: lead.source.recordMatch >= 0.95 ? "Source is the record for this exact entity" : lead.source.recordMatch >= 0.75 ? "Source covers this entity in a wider table" : "Source is a state-level or general rule applied here",
    identifier: ident >= 0.95 ? "Exact identifier match" : ident >= 0.65 ? "Normalized identifier match (formatting differs)" : ident > 0 ? "Weak identifier match: verify before relying" : "Ambiguous identifier: records not merged",
    manual: lead.source.human ? "A person opened and read the source" : "Machine-collected; not manually verified",
  };
  // an unresolved conflict never reads as confident: capped until someone resolves it
  const score = Math.min(conflict ? 60 : 100, Math.round(WEIGHTS.reduce((a, [k, , w]) => a + parts[k] * w, 0)));
  const conflicts = conflict ? [...groups.entries()].map(([k, os]) => ({ value: String(os[0].value), sources: os.map((o) => o.source) })) : [];
  return {
    ...base, value: lead.value, display: lead.display || String(lead.value), status, lead: lead.source,
    confidence: { score, parts: WEIGHTS.map(([k, l, w]) => ({ k, label: l, weight: w, value: Math.round(parts[k] * 100), why: why[k] })) },
    conflicts, conflictNote: conflict ? `${conflicts.map((c) => `${c.value}: ${c.sources.map((s) => `${s.agency} (${TIERS[s.tier].short})`).join(", ")}`).join(" · ")}. ${opts.explain || "Possible causes: a rescheduled or adjourned sale, a later correction, or a typo. The highest-authority value is shown first; open each source before relying on either."}` : null,
    lastChecked: lead.source.accessed, age,
  };
}

/** A known gap: something the schema asks for that no source on file supplies. */
export const gap = (entity, key, label, where, today, empty = "MISSING", emptyText) => fact({ key, label, entity, where, today, empty, emptyText }, []);

/** Worst status in a set, for rolling facts up into one answer. */
const ORDER = ["CONFLICT", "STALE", "MISSING", "PAID", "RESTRICTED", "FIELD", "PROVISIONAL", "CORROBORATED", "VERIFIED"];
export const worst = (facts) => facts.reduce((w, f) => (ORDER.indexOf(f.status) < ORDER.indexOf(w) ? f.status : w), "VERIFIED");
