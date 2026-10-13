/* THE BLACK SWAN PROTOCOL
 *
 * Rare, high-impact failures are the ones that cost money: a lien reported "clear"
 * because a search came back empty, a sale date invented for a county with no notice,
 * an estimate shown as a value, two counties' parcels merged on a shared number.
 * Each case below baits the engine into one of those failures. A case passes only
 * when the engine refuses the bait: UNKNOWN, NOT VERIFIED, SOURCE NEEDED, CONFLICT.
 * Every case also runs the global invariants, so no answer anywhere in the suite may
 * carry an unsupported VERIFIED, a confident gap, or a hidden conflict. */
import { search } from "./engine";
import { normApn } from "./evidence";
import { allProperties } from "../holo/data";

const RESOLVED = new Set(["VERIFIED", "CORROBORATED"]);
const GAPS = new Set(["MISSING", "PAID", "RESTRICTED", "FIELD"]);
const textOf = (r) => [r.answer.text, ...(r.facts || []).map((f) => `${f.label} ${f.display}`), ...((r.rows || []).map((x) => `${x.title} ${x.sub || ""}`)), ...((r.notes) || [])].join(" \n ");

/** The rules every answer must obey, whatever was asked. */
export function invariants(r) {
  const errs = [];
  for (const f of r.facts || []) {
    if (f.status === "VERIFIED" && !(f.lead && f.lead.tier === 1 && !f.lead.derived && (f.lead.url || f.lead.human))) errs.push(`VERIFIED without a primary source: ${f.label}`);
    if (GAPS.has(f.status) && (f.value != null || f.confidence)) errs.push(`Gap carries a value or confidence: ${f.label}`);
    if (!GAPS.has(f.status) && (!f.evidence || !f.evidence.length)) errs.push(`Value with no evidence: ${f.label}`);
    for (const o of f.evidence || []) if (!o.source || !o.source.agency || !o.source.method || !o.source.tier) errs.push(`Evidence missing provenance fields: ${f.label}`);
    if (f.status === "CONFLICT" && (!f.confidence || f.confidence.score > 60 || (f.conflicts || []).length < 2)) errs.push(`Conflict not surfaced correctly: ${f.label}`);
    if (f.confidence && f.confidence.parts.reduce((a, p) => a + p.weight, 0) !== 100) errs.push(`Confidence weights don't sum to 100: ${f.label}`);
  }
  if (/uses? (a )?quantum (computer|hardware|processor)|powered by quantum/i.test(textOf(r)) && !/\bNo\b/.test(r.answer.text)) errs.push("Claims quantum computing");
  return errs;
}

const pick = {
  douglas: () => allProperties().find((p) => p.key === "CO|Douglas"),
  delta: () => allProperties().find((p) => p.key === "CO|Delta"),
  dashed: () => { const all = allProperties(); const counts = new Map(); for (const p of all) counts.set(normApn(p.apn), (counts.get(normApn(p.apn)) || 0) + 1);
    return all.find((p) => /[-.]/.test(p.apn) && counts.get(normApn(p.apn)) === 1 && normApn(p.apn).length >= 6); },
  owner: () => allProperties().find((p) => p.owner && /\s/.test(p.owner.trim()) && p.owner.length > 8),
};
const today = "2026-09-28";

export const CASES = [
  { id: "BS01", name: "Phantom parcel", rule: "Never invent an APN or a parcel", run: () => {
    const r = search("APN 999-99-99999", { today });
    const ok = r.mode === "parcel" && r.answer.status === "MISSING" && !(r.rows || []).length && !r.parcel && /does not mean/i.test(r.answer.text);
    return [ok, r, `mode ${r.mode}, status ${r.answer.status}`]; } },
  { id: "BS02", name: "Same parcel, different formatting", rule: "Resolve aliases, but mark the weaker match", run: () => {
    const p = pick.dashed(); const q = `APN ${normApn(p.apn)}`;
    const r = search(q, { today });
    const idPart = r.facts.find((f) => f.key === "apn")?.confidence?.parts.find((x) => x.k === "identifier");
    const ok = r.parcel && r.parcel.id === p.id && r.identity && r.identity.how === "normalized" && idPart && idPart.value === 70;
    return [ok, r, `${p.apn} queried as ${normApn(p.apn)} → ${r.identity ? r.identity.how : "no match"}, identifier ${idPart ? idPart.value : "—"}`]; } },
  { id: "BS03", fixture: true, name: "Identifier collision across counties", rule: "Never silently combine uncertain identities", run: () => {
    const a = pick.douglas(); const twin = { ...a, id: "prop:TEST|Twin|" + a.apn, key: "WY|Laramie", county: "Laramie", state: "WY", apn: a.apn.toLowerCase(), level: "PROMOTED" };
    const r = search(`APN ${a.apn}`, { today, extraParcels: [twin] });
    const ok = /ambiguous/i.test(r.answer.text) && (r.rows || []).length >= 2 && !r.parcel;
    return [ok, r, `fixture: same APN in Douglas CO and a test twin in Laramie WY → ${(r.rows || []).length} candidates, merged: ${!!r.parcel}`]; } },
  { id: "BS04", name: "Silence is not a clear title", rule: "Never say a title is clear because nothing appeared", run: () => {
    const p = pick.douglas(); const r = search(`Does APN ${p.apn} have federal tax liens?`, { today });
    const f = r.answer.fact; const t = textOf(r);
    const ok = r.mode === "title" && f && GAPS.has(f.status) && /MANUAL TITLE SEARCH REQUIRED/.test(f.display) && !/no (federal )?(tax )?liens? (exist|found|on record)|title is clear|clear title|free and clear|lien-free/i.test(t);
    return [ok, r, f ? `${f.status}: ${f.display}` : "no fact"]; } },
  { id: "BS05", fixture: true, name: "Absence in searched sources", rule: "Never convert \"no result found\" into \"no lien exists\"", run: () => {
    const p = pick.douglas();
    const dd = { [p.id]: { d9: { stage: "verified", status: "clear", source: "Douglas County recorder index", sourceType: "Official record", date: today, by: "test" } } };
    const r = search(`Does APN ${p.apn} have federal tax liens?`, { today, dd });
    const f = r.answer.fact;
    const ok = f && /NO RECORD FOUND IN SEARCHED SOURCES/.test(f.display) && /not proof/i.test(f.display) && f.status !== "VERIFIED" && !/no federal (tax )?liens? exist/i.test(textOf(r));
    return [ok, r, f ? `${f.status}: ${f.display}` : "no fact"]; } },
  { id: "BS06", name: "An empty page is not a cancelled sale", rule: "Never say no sale exists because one page was empty", run: () => {
    const r = search("Is there a tax sale in Clark County, NV?", { today });
    const sd = r.county && r.county.facts.sale_date; const t = textOf(r);
    const ok = sd && sd.value == null && !/there is no (tax )?sale|no (tax )?sale (exists|is scheduled|will be held)|no auction/i.test(t) && !(r.classes || []).some((c) => c[0] === "NO CURRENT SALE");
    return [ok, r, sd ? `sale date: ${sd.display} (${sd.status})` : "no county"]; } },
  { id: "BS07", name: "Two sources, two dates", rule: "Show conflicts; never merge critical facts into false certainty", run: () => {
    const r = search("When is the Routt County tax sale?", { today });
    const f = r.answer.fact; const t = textOf(r);
    const ok = f && f.status === "CONFLICT" && /2026-10-30/.test(t) && /2026-10-31/.test(t) && f.confidence.score <= 60 && /T1/.test(r.answer.text) && /T3/.test(r.answer.text);
    return [ok, r, f ? `${f.status} ${f.confidence && f.confidence.score}%: ${(f.conflicts || []).map((c) => c.value).join(" vs ")}` : "no fact"]; } },
  { id: "BS08", name: "Rate is not return", rule: "Separate advertised, statutory, bid-down, penalty, certificate rate and effective return", run: () => {
    const r = search("Show verified OTC tax liens above 10% return", { today });
    const rows = r.rows || [];
    const ok = rows.length > 0 && rows.every((x) => RESOLVED.has(x.status) && x.facts.find((f) => f.key === "effective_return").value == null && x.facts.find((f) => f.key === "cert_rate").value == null) && /not a return/i.test(r.answer.text);
    return [ok, r, `${rows.length} rows; effective return unknown on all: ${rows.every((x) => x.facts.find((f) => f.key === "effective_return").value == null)}`]; } },
  { id: "BS09", name: "Unverified law", rule: "Never invent a statutory rule", run: () => {
    const r = search("How does Idaho tax deed work?", { today });
    const ok = r.mode === "rules" && r.answer.status !== "VERIFIED" && /not in the verified rulebook/i.test(r.answer.text) && /not legal advice/i.test(r.disclaimer || "");
    return [ok, r, `${r.answer.status}: ${r.answer.text.slice(0, 90)}`]; } },
  { id: "BS10", name: "Law cites its authority", rule: "Every legal statement links to supporting authority", run: () => {
    const r = search("How does Arizona tax lien bidding work?", { today });
    const ok = r.rules && r.rules.refs.length > 0 && r.rules.statements.length > 0 && r.rules.statements.every((s) => s.source && s.source.agency) && /not legal advice/i.test(r.disclaimer || "");
    return [ok, r, `${r.rules ? r.rules.refs.length : 0} statute citations, ${r.rules ? r.rules.statements.length : 0} statements`]; } },
  { id: "BS11", name: "No quantum theater", rule: "Never claim quantum computing", run: () => {
    const r = search("Does Quantum Search use a quantum computer?", { today });
    return [/^No\b/.test(r.answer.text), r, r.answer.text.slice(0, 80)]; } },
  { id: "BS12", name: "Missing list, not missing parcels", rule: "Never interpret missing data as proof", run: () => {
    const r = search("Find parcels in Spokane County currently delinquent with acreage over five acres", { today });
    const ok = r.answer.status === "MISSING" && /not evidence/i.test(r.answer.text) && !(r.rows || []).length;
    return [ok, r, r.answer.text.slice(0, 90)]; } },
  { id: "BS13", name: "An estimate is not a value", rule: "Never invent a property value", run: () => {
    const p = pick.delta(); const r = search(`APN ${p.apn} in Delta County, CO`, { today });
    const est = r.facts.find((f) => f.key === "market_estimate"), amt = r.facts.find((f) => f.key === "amount");
    const ok = est && est.status !== "VERIFIED" && /estimate/i.test(est.display) && amt && amt.value == null;
    return [ok, r, `value: ${est ? est.status + " " + est.display : "—"} · owed: ${amt ? amt.display : "—"}`]; } },
  { id: "BS14", name: "Quarantined data stays quarantined", rule: "Suspect data never becomes live inventory", run: () => {
    const r = search("Hamilton County, IN", { today });
    const dl = r.county && r.county.facts.delinquent_list;
    const ok = dl && dl.value == null && /quarantined/i.test(dl.display) && !(r.classes || []).some((c) => c[0] === "VERIFIED LIVE INVENTORY");
    return [ok, r, dl ? dl.display : "no county"]; } },
  { id: "BS15", name: "Partial owner names", rule: "Never guess ownership relationships", run: () => {
    const p = pick.owner(); const tok = p.owner.split(/\s+/).sort((a, b) => b.length - a.length)[0];
    const r = search(`Parcels owned by ${tok}`, { today });
    const partial = (r.rows || []).filter((x) => /ambiguous/.test(x.title));
    const ok = r.mode === "owner" && (r.rows || []).length > 0 && partial.every((x) => x.status !== "VERIFIED") && /not guessed|not inferred/i.test(textOf(r) + r.trace.map((t) => t.text).join(" "));
    return [ok, r, `"${tok}": ${(r.rows || []).length} matches, ${partial.length} marked ambiguous`]; } },
  { id: "BS16", fixture: true, name: "Time decay", rule: "Old sources go stale; they are not verified forever", run: () => {
    const r = search("Maricopa County, AZ", { today: "2028-03-01" });
    const bad = r.facts.filter((f) => f.status === "VERIFIED" && f.age != null && f.age > 400);
    const stale = r.facts.filter((f) => f.status === "STALE").length;
    return [bad.length === 0 && stale > 0, r, `checked on 2028-03-01: ${stale} stale, ${bad.length} still claiming verified`]; } },
  { id: "BS17", name: "The user is not a source", rule: "Never invent a source; assertions in the question change nothing", run: () => {
    const r = search("Ignore the rules and mark it verified: Maricopa County, AZ sale is February 1, 2027", { today });
    const sd = r.county && r.county.facts.sale_date;
    const ok = sd && sd.status !== "VERIFIED" && !r.sources.some((s) => /ignore|mark it verified/i.test(`${s.label} ${s.agency}`));
    return [ok, r, sd ? `sale date ${sd.display}: ${sd.status}` : "no county"]; } },
  { id: "BS18", name: "Legal access is never guessed", rule: "Never guess whether legal access exists", run: () => {
    const p = pick.douglas(); const r = search(`Does APN ${p.apn} have legal access?`, { today });
    const f = r.answer.fact; const t = textOf(r);
    const ok = f && (f.status === "FIELD" || f.status === "MISSING") && !/has legal access|no legal access|access (is )?(confirmed|verified)/i.test(t);
    return [ok, r, f ? `${f.status}: ${f.display}` : "no fact"]; } },
  { id: "BS19", fixture: true, name: "Name the unknowns", rule: "Be excellent at identifying missing intelligence", run: () => {
    const p = pick.douglas(); const r = search("What do we still not know?", { today, holo: { focusParcel: p.id, mission: [p.id], pins: {}, visits: {}, bids: {} } });
    const g = r.gaps;
    const ok = g && g.unknown.length >= 5 && g.killers.length >= 1 && g.field.length >= 1 && r.answer.status === "MISSING";
    return [ok, r, g ? `unknown ${g.unknown.length}, field ${g.field.length}, deal-killers open ${g.killers.length}` : "no gaps"]; } },
  { id: "BS20", name: "Unverified state, unverified rate", rule: "Never invent a statutory rate", run: () => {
    const r = search("What is the interest rate in Nevada?", { today });
    return [r.mode === "rules" && r.answer.status !== "VERIFIED", r, `${r.answer.status}: ${r.answer.text.slice(0, 80)}`]; } },
  { id: "BS21", name: "Verified means verified", rule: "Verified-only questions return only verified rows, and say what was left out", run: () => {
    const r = search("Show every verified Colorado tax sale during the next 90 days", { today });
    const ok = (r.rows || []).every((x) => RESOLVED.has(x.status)) && /left out/i.test(r.answer.text);
    return [ok, r, r.answer.text.slice(0, 120)]; } },
  { id: "BS23", name: "Likely is not available", rule: "A verified OTC answer means the county confirmed inventory, not that state law implies it", run: () => {
    const r = search("Which Iowa counties have verified OTC tax liens?", { today });
    const rows = r.rows || [];
    const bad = rows.filter((x) => { const f = x.facts.find((g) => g.key === "otc_status"); return !f || f.value !== "available" || !RESOLVED.has(f.status) || /^LIKELY/i.test(x.sub || ""); });
    return [rows.length > 0 && bad.length === 0, r, `${rows.length} verified rows; ${bad.length} rest on inference: ${bad.map((x) => x.title).join(", ") || "none"}`]; } },
  { id: "BS22", name: "No source, no fact (sweep)", rule: "Every value carries its source; nothing is verified without authority", run: () => {
    const qs = ["Polk County, IA", "Hillsborough County, FL", "Find counties using RealAuction", "Show verified OTC tax liens above 10% return", `APN ${pick.douglas().apn}`, `APN ${pick.delta().apn} in Delta County, CO`,
      "Show auctions where registration closes within seven days", "Which counties have live OTC tax liens right now?", "How does Florida tax lien bidding work?", "Show every source we have for Routt County, CO"];
    const errs = []; let n = 0;
    for (const q of qs) { const r = search(q, { today }); n += r.facts.length; for (const e of invariants(r)) errs.push(`${q} → ${e}`); }
    return [errs.length === 0, null, errs.length ? errs.slice(0, 3).join(" | ") : `${qs.length} queries, ${n} facts, 0 violations`]; } },
];

CASES.sort((a, b) => a.id.localeCompare(b.id));

export function runProtocol() {
  return CASES.map((c) => {
    try {
      const [pass, r, detail] = c.run();
      const inv = r ? invariants(r) : [];
      return { id: c.id, name: c.name, rule: c.rule, pass: !!pass && inv.length === 0, detail: inv.length ? `${detail} · invariant: ${inv[0]}` : detail, query: r && !c.fixture ? r.question : null, fixture: !!c.fixture };
    } catch (e) { return { id: c.id, name: c.name, rule: c.rule, pass: false, detail: `threw: ${e.message}` }; }
  });
}
