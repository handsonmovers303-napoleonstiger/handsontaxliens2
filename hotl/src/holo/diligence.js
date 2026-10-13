/** County research is seven requirements. Auction ready is those seven, plus two fresh gates.
 * Nothing here is verified because a team link exists. A save is the user's own record. */

export const RESEARCH = [
  { code: "official_source", label: "Official tax-sale source located", kind: "url", fresh: 365 },
  { code: "sale_type", label: "Sale type confirmed", kind: "url", fresh: 365 },
  { code: "auction_rules", label: "Auction rules reviewed", kind: "url", fresh: 365 },
  { code: "registration_rules", label: "Registration requirements reviewed", kind: "url", fresh: 365 },
  { code: "redemption_rules", label: "Redemption rules reviewed", kind: "url", fresh: 730 },
  { code: "auction_date", label: "Auction date verified", kind: "date", fresh: 45 },
  { code: "inventory_source", label: "Inventory source located", kind: "url", fresh: 180 },
];
export const GATES = [
  { code: "registration_deadline", label: "Registration deadline for the next sale", kind: "date", fresh: 45 },
  { code: "current_inventory", label: "Current sale list located", kind: "url", fresh: 30 },
];
export const REQUIREMENTS = [...RESEARCH, ...GATES];
const BY_CODE = Object.fromEntries(REQUIREMENTS.map((r) => [r.code, r]));

const DAY = 86400000;
export const latest = (rows) => (rows && rows.length ? rows[rows.length - 1] : null);
export const ageDays = (at, now) => (at ? (now - Date.parse(at)) / DAY : Infinity);

export function localDay(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Local clock. A UTC hour would say afternoon at 9:38 AM Pacific. */
export function greeting(now = new Date()) {
  const h = now.getHours();
  if (h < 5) return "Working late";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function countyProgress({ evidence = {}, viewed = false, now = Date.now(), today = localDay(new Date(now)) } = {}) {
  const fresh = [];
  const stale = [];
  const missing = [];
  for (const req of RESEARCH) {
    const row = latest(evidence[req.code]);
    if (!row) missing.push(req.code);
    else if (ageDays(row.at, now) > req.fresh) stale.push(req.code);
    else fresh.push(req.code);
  }
  const researchDone = fresh.length === RESEARCH.length;
  const gate = (code, days) => {
    const row = latest(evidence[code]);
    return !!(row && row.date && row.date >= today && ageDays(row.at, now) <= days);
  };
  const gates = {
    registration_deadline: gate("registration_deadline", 45),
    current_inventory: !!(latest(evidence.current_inventory) && ageDays(latest(evidence.current_inventory).at, now) <= 30),
  };
  const gatesDone = Object.values(gates).filter(Boolean).length;
  const started = fresh.length > 0 || stale.length > 0;
  const ready = researchDone && gate("auction_date", 45) && gates.registration_deadline && gates.current_inventory;
  const state = ready ? "AUCTION_READY" : researchDone ? "VERIFIED" : started ? "RESEARCHING" : viewed ? "DISCOVERED" : "UNEXPLORED";
  return {
    state, done: fresh.length, total: RESEARCH.length, gatesDone, gatesTotal: GATES.length,
    stale, missing, ready, researchDone,
  };
}

const URL_OK = /^https?:\/\/\S+\.\S+/i;
const DAY_OK = /^\d{4}-\d{2}-\d{2}$/;

/** A team link can fill the form. It is not evidence until saveEvidence. */
export function draftFromTeam(link) {
  const url = String(link?.url || "").trim();
  if (!URL_OK.test(url)) return { ok: false, reason: "NO_LINK" };
  return { ok: true, draft: { url, note: String(link.note || "").slice(0, 2000), seen: "" } };
}

export function saveEvidence(evidence, code, input, now = new Date()) {
  const req = BY_CODE[code];
  if (!req) return { ok: false, reason: "UNKNOWN" };
  const url = String(input.url || "").trim();
  const seen = String(input.seen || "").trim();
  if (!URL_OK.test(url)) return { ok: false, reason: "URL" };
  if (!DAY_OK.test(seen)) return { ok: false, reason: "SEEN" };
  if (req.kind === "date" && !DAY_OK.test(input.date || "")) return { ok: false, reason: "STATED_DATE" };
  const row = {
    url, seen, date: req.kind === "date" ? input.date : null,
    note: String(input.note || "").slice(0, 2000),
    at: now.toISOString(),
  };
  const book = { ...(evidence || {}) };
  book[code] = [...(book[code] || []), row].slice(-12);
  return { ok: true, evidence: book };
}

/** Sale inside 60 days, then how much of the seven is fresh. A high score does not jump the line. */
export function commandOrder(counties, evidenceOf, viewedOf, now = Date.now()) {
  const rank = (c) => {
    const p = countyProgress({ evidence: evidenceOf(c) || {}, viewed: !!viewedOf(c), now });
    const d = c.days;
    const soon = d != null && d >= 0 && d <= 60 ? d : 10000;
    return [soon, -p.done, -(c.score || 0), c.name];
  };
  return [...counties].sort((a, b) => {
    const ra = rank(a);
    const rb = rank(b);
    for (let i = 0; i < ra.length; i++) if (ra[i] !== rb[i]) return ra[i] < rb[i] ? -1 : 1;
    return 0;
  });
}

export function titleStanding(saved, skipped) {
  const checked = Object.values(saved || {}).some((row) => row && row.result && row.result !== "open");
  if (checked) return "checked";
  if (skipped) return "skipped";
  return "untouched";
}
