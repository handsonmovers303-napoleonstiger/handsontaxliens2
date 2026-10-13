/* Query understanding: entity, jurisdiction, record type, time window, and whether
 * the question demands verified-only answers. Deterministic: the same words always
 * parse the same way, and the parse is shown in the trace. */
import { NATIONAL, STATE_NAMES } from "../legacy/ScoutingDept.jsx";

const WORDNUM = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, fourteen: 14, fifteen: 15, twenty: 20, thirty: 30, forty: 40, fortyfive: 45, sixty: 60, ninety: 90, hundred: 100 };
const num = (s) => { if (s == null) return null; const t = String(s).toLowerCase().replace(/[\s-]/g, ""); return WORDNUM[t] ?? (isNaN(parseFloat(t)) ? null : parseFloat(t)); };
const AMBIG_ABBR = new Set(["OR", "IN", "ME", "OK", "HI", "ID", "DE", "AL", "LA", "PA", "MA", "CO", "OH"]);
const NAME_TO_ABBR = Object.fromEntries(Object.entries(STATE_NAMES).map(([k, v]) => [v.toLowerCase(), k]));
export const PLATFORMS = ["realauction", "lienhub", "govease", "zeus", "sri", "bid4assets", "grant street", "publicsurplus"];

let _countyIndex = null;
const countyIndex = () => (_countyIndex ||= NATIONAL.map((r) => ({ name: r[0], st: r[1], key: `${r[1]}|${r[0]}`, lc: r[0].toLowerCase() })).sort((a, b) => b.lc.length - a.lc.length));

export function parseQuery(raw) {
  const q = String(raw || "").trim();
  const lc = q.toLowerCase();
  const P = { raw: q, lc, states: [], counties: [], countyAmbiguous: null, apn: null, owner: null, platform: null, days: null, regDays: null, minRate: null, minAcres: null,
    verifiedOnly: /\bverified\b/.test(lc), lists: /\blists?\b|parcel list|published list/.test(lc), downloadable: /download|spreadsheet|csv|xlsx|excel/.test(lc),
    saleKind: /certificate|\blien/.test(lc) && !/\bdeed/.test(lc) ? "lien" : /\bdeed/.test(lc) && !/lien/.test(lc) ? "deed" : null, focus: null, mode: null, notes: [] };

  // states: full names, then ", XX" or bare uppercase abbreviations that aren't common words
  for (const [name, ab] of Object.entries(NAME_TO_ABBR)) if (new RegExp(`\\b${name}\\b`).test(lc) && !(name === "washington" && /washington county/.test(lc))) P.states.push(ab);
  for (const m of q.matchAll(/,\s*([A-Za-z]{2})\b/g)) { const ab = m[1].toUpperCase(); if (STATE_NAMES[ab]) P.states.push(ab); }
  for (const m of q.matchAll(/\b([A-Z]{2})\b/g)) if (STATE_NAMES[m[1]] && !AMBIG_ABBR.has(m[1])) P.states.push(m[1]);
  const tail = q.trim().match(/(?:^|\s)([A-Za-z]{2})$/);
  if (tail) {
    const ab = tail[1].toUpperCase();
    if (STATE_NAMES[ab] && (q.trim().length === 2 || !AMBIG_ABBR.has(ab) || /\b(county|parish|borough)\b/i.test(q))) P.states.push(ab);
  }
  P.states = [...new Set(P.states)];

  // counties: "<Name> County / Parish / city" or "<Name>, ST"
  const found = [];
  for (const c of countyIndex()) {
    const re = new RegExp(`\\b${c.lc.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\s+(county|parish|borough)\\b|\\s*,\\s*${c.st.toLowerCase()}\\b)`);
    if (c.lc.endsWith(" city") ? lc.includes(c.lc) : re.test(lc)) found.push(c);
  }
  const names = [...new Set(found.map((c) => c.lc))].filter((n, i, a) => !a.some((m) => m !== n && m.includes(n)));
  const cands = found.filter((c) => names.includes(c.lc));
  const inState = P.states.length ? cands.filter((c) => P.states.includes(c.st)) : cands;
  if (inState.length) {
    const byName = new Map(); for (const c of inState) (byName.get(c.lc) || byName.set(c.lc, []).get(c.lc)).push(c);
    for (const [, list] of byName) { if (list.length === 1) P.counties.push(list[0]); else P.countyAmbiguous = list; }
  }
  if (P.counties.length && !P.states.length) P.states = [...new Set(P.counties.map((c) => c.st))];
  if (!P.counties.length && !P.countyAmbiguous) {
    const squash = (s) => s.toLowerCase().replace(/\./g, "").replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
    const nq = squash(lc);
    const bare = countyIndex().filter((c) => squash(c.lc).length >= 5 && new RegExp(`\\b${squash(c.lc).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(nq));
    const kept = bare.filter((c, _i, a) => !a.some((o) => o !== c && squash(o.lc).includes(squash(c.lc)) && squash(o.lc).length > squash(c.lc).length));
    const pool = P.states.length ? kept.filter((c) => P.states.includes(c.st)) : kept;
    const byName = new Map();
    for (const c of pool) (byName.get(squash(c.lc)) || byName.set(squash(c.lc), []).get(squash(c.lc))).push(c);
    for (const [, list] of byName) { if (list.length === 1) P.counties.push(list[0]); else P.countyAmbiguous = list; }
    if (P.counties.length && !P.states.length) P.states = [...new Set(P.counties.map((c) => c.st))];
  }

  // identifiers
  const kw = q.match(/\b(?:apn|parcel(?:\s*(?:number|no\.?|#))?|pid|account(?:\s*(?:number|no\.?|#))?|acct)\s*[:#]?\s*([A-Z0-9][A-Z0-9\-. /]{2,28}[A-Z0-9])/i);
  if (kw && /\d/.test(kw[1])) P.apn = kw[1].replace(/\s+(?:in|on|at|for|with|have|has|owned)\b.*$/i, "").trim();
  if (!P.apn) for (const m of q.matchAll(/\b([A-Z]{0,4}\d[\dA-Z]*(?:[-.][\dA-Z]+)+|[A-Z]{0,2}\d{6,}[A-Z]?)\b/gi)) {
    const t = m[1], digits = t.replace(/\D/g, "").length, after = q.slice(m.index + t.length, m.index + t.length + 8).toLowerCase();
    if (digits >= 5 && !/^\s*(days?|%|acres?|months?)/.test(after) && !/^\d{4}-\d{2}-\d{2}$/.test(t)) { P.apn = t; break; }
  }

  // owner
  const om = q.match(/owned by\s+(.+?)(?:\?|$|\s+in\s+[A-Z])/i) || q.match(/\bowner(?:\s+name)?\s*(?:is|=|:)?\s+(?!type)(["']?[A-Z0-9][^?]*?)(?:\?|$)/i) || q.match(/([A-Z0-9][A-Z0-9&.'\- ]{2,}\s(?:LLC|INC|TRUST|CORP|LP|LTD|COMPANY)\.?)/i);
  if (om && !/parcels?|propert/i.test(om[1])) P.owner = om[1].replace(/^["']|["']$/g, "").trim();

  // windows, thresholds, platform
  const nx = lc.match(/next\s+([\w-]+)\s+days?/) || lc.match(/within\s+(?:the\s+next\s+)?([\w-]+)\s+days?/) || lc.match(/in\s+([\w-]+)\s+days?/);
  if (nx) { const n = num(nx[1]); if (/registration|register/.test(lc) && /(close|deadline)/.test(lc)) P.regDays = n; else P.days = n; }
  if (/this month/.test(lc)) P.days = 31;
  const rt = lc.match(/(?:above|over|more than|greater than|at least|>)\s*(\d+(?:\.\d+)?)\s*%/); if (rt) P.minRate = parseFloat(rt[1]);
  const ac = lc.match(/(?:over|above|more than|greater than|at least|>)\s*([\w.-]+)\s*acres?/); if (ac) P.minAcres = num(ac[1]);
  P.platform = PLATFORMS.find((p) => lc.includes(p)) || null;
  const head = q.split(",")[0].trim();
  P.street = /^\d{1,6}\s+\S+/.test(head) && !/^\d{5}(?:-\d{4})?$/.test(head) ? head : null;
  const onlyZip = q.match(/^(\d{5})(?:-\d{4})?$/);
  const tailZip = q.match(/\b[A-Za-z]{2}\s+(\d{5})(?:-\d{4})?\s*$/);
  P.zip = onlyZip ? onlyZip[1] : tailZip ? tailZip[1] : null;
  P.city = null;
  if (!P.street && !onlyZip && !P.apn && !P.counties.length && !P.countyAmbiguous && !/\b(county|parish|borough)\b/i.test(q)) {
    const comma = q.match(/^([A-Za-z][A-Za-z .'-]{2,40})\s*,\s*([A-Za-z]{2})\b/);
    const bare = q.match(/^([A-Za-z][A-Za-z .'-]{2,40})\s+([A-Za-z]{2})$/);
    const hit = comma || bare;
    if (hit && STATE_NAMES[hit[2].toUpperCase()]) P.city = hit[1].trim();
  }
  P.address = P.street;
  P.lookupText = P.street || (q.length >= 12 && /\b(lot|lots|blk|block|plat|unit)\b/i.test(lc) ? q : null);
  P.delinquent = /delinquent/.test(lc);
  P.incompleteTitle = /incomplete title|title (research|work) (is )?(incomplete|missing|open)|without title/.test(lc);

  // focus fact for a county question
  if (/\bwhen\b|sale date|auction date|next (sale|auction)/.test(lc)) P.focus = "sale_date";
  else if (/platform|provider|which site|where.*bid/.test(lc)) P.focus = "platform";
  else if (/deposit/.test(lc)) P.focus = "deposit";
  else if (/registration|register/.test(lc)) P.focus = "registration_deadline";
  else if (/phone|contact|call/.test(lc)) P.focus = "phone";

  // mode, most specific first
  const m = (re) => re.test(lc);
  P.mode =
    m(/quantum (computer|hardware|comput|processor|algorithm)|qubit/) ? "meta"
    : m(/(don'?t|do not|still not|not yet) know|research gaps?|data gaps?|what(?:'s| is) missing|what are (the|our) unknowns|\bunknowns?\b/) ? "gaps"
    : m(/\breject\b|kill (the|this) deal|deal.?killers?|walk away|what could kill/) ? "reject"
    : m(/every source|all (the |of the )?sources|what sources|sources? (do )?we have/) ? "sources"
    : m(/field targets?|needs? field|field verif|need(s)? (a )?visit/) ? "field"
    : m(/federal (tax )?liens?|irs lien|state tax liens?|municipal liens?|judgments?|mortgages?|deeds? of trust|bankrupt|lis pendens|probate|\bhoa\b|\bcdd\b|code (enforcement|violations?)|demolition|title (risk|search|issues?|problems?)|encumbrances?|other liens/) ? "title"
    : m(/flood|wildfire|\bfire\b|contaminat|\bepa\b|environmental|wetlands?|zoning|legal access|road access|\baccess\b|building permits?|structure condition/) && (P.apn || m(/this (parcel|property)|parcel|property/)) ? "risk"
    : m(/\botc\b|over[- ]the[- ]counter|county[- ]held|struck[- ]off|assignments?|buy now|unsold (liens|certificates|tax)/) ? "otc"
    : m(/how (does|do|is)|statutes?|\brules? (for|in|of|on|govern)|what are the rules|sale rules|redemption period|bidding (work|method)|interest rate|penalt|what(?:'s| is) the rate|foreclosure process|legal requirements?/) && (P.states.length || P.counties.length) && !P.apn ? "rules"
    : P.apn ? "parcel"
    : P.lookupText ? "label"
    : P.zip && !P.city ? "zip"
    : P.city ? "city"
    : m(/\bparcels?\b|\bpropert(y|ies)\b/) && (P.counties.length || P.days != null || P.minAcres != null || P.delinquent || P.incompleteTitle || P.states.length) ? "parcels"
    : P.owner || m(/owned by|\bowner\b/) ? "owner"
    : P.counties.length && !m(/\bcounties\b/) ? "county"
    : P.countyAmbiguous ? "county"
    : m(/auction|tax sales?|\bsales?\b|certificate sale|registration|upcoming|platform|using/) || P.platform || P.days != null || P.regDays != null ? "auction"
    : P.states.length ? "auction"
    : "discover";
  return P;
}
