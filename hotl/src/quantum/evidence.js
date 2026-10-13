/* Evidence builders: every table the app holds becomes a cited source, and every
 * county or parcel fact is assembled from those sources. Nothing here fills a gap. */
import {
  NAT_BY_NAME, NATIONAL, rulesFor, STATE_RULES, COUNTY_VERIFIED, OUTCOME_STATS, OUTCOME_ROWS, PROPERTY_DB, OTC_DB, OTC_EXTRA,
  REPORTED, NATIONAL_BUILT, SOURCE_DATES, SALE_WINDOW, SALE_HELD, STATE_NAMES, PHONE_QUARANTINE,
  NEXT_SALE_BUNDLED, SALE_DATE_LEVEL_BUNDLED, HARD_DEADLINES_BUNDLED, dbLinks,
} from "../legacy/ScoutingDept.jsx";
import { source, fact, gap, urlIn, isoDay, datesIn } from "./core";
import { presentLink } from "../holo/linkCheck";

const RULE_DATE = "2026-09-04";
const domainUrl = (host) => (/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(String(host || "").trim()) ? `https://${String(host).trim()}` : null);
const fipsOf = (st, name) => { const r = NAT_BY_NAME[`${name}|${st}`]; return r ? String(r[2]).padStart(5, "0") : null; };

/* ----------------------------------- sources ----------------------------------- */
export function statuteSources(st) {
  const R = STATE_RULES[st];
  if (!R) return [];
  return (R.sources || []).map(([label, host, date]) => source({
    tier: R.verified ? 1 : 3, agency: `${STATE_NAMES[st] || st} statute`, type: "statute", label, url: urlIn(label) || domainUrl(host),
    accessed: date || RULE_DATE, jurisdiction: STATE_NAMES[st], recordId: (String(label).match(/^[^—–-]+/) || [label])[0].trim(), method: "opened and read",
    human: !!R.verified, recordMatch: 0.7, note: domainUrl(host) ? `Host on file: ${host} (section URL not recorded)` : `Cited via ${host}; no URL recorded`,
  }));
}
function rulebookSource(st) {
  const R = rulesFor(st);
  const first = (STATE_RULES[st] && STATE_RULES[st].sources && STATE_RULES[st].sources[0]) || null;
  return source({
    tier: R.verified ? 1 : 3, agency: `${STATE_NAMES[st] || st} statute (verified rulebook)`, type: "statute",
    label: R.verified ? `${STATE_NAMES[st]} rulebook · ${(STATE_RULES[st].sources || []).length} citations` : `${STATE_NAMES[st] || st} — not in the verified rulebook`,
    url: first ? (urlIn(first[0]) || domainUrl(first[1])) : null, accessed: first ? first[2] : RULE_DATE, jurisdiction: STATE_NAMES[st],
    recordId: first ? first[0] : null, method: R.verified ? "statute opened and read" : "workbook value, not verified", human: !!R.verified, recordMatch: 0.7,
  });
}
function workbookSource(row) {
  return source({ tier: 3, agency: "National county workbook", type: "researched workbook", label: `National county table · ${row[0]}, ${row[1]}`, url: null,
    accessed: NATIONAL_BUILT, jurisdiction: `${row[0]} County, ${row[1]}`, recordId: `FIPS ${String(row[2]).padStart(5, "0")}`, method: "compiled workbook", human: false, recordMatch: 0.85 });
}
function countyTermsSource(key, cv) {
  const [st, name] = key.split("|");
  const link = (cv.links || []).find((l) => l[3] === "OFFICIAL" && l[0] === "treasurer") || (cv.links || []).find((l) => l[3] === "OFFICIAL") || (cv.links || [])[0];
  return source({ tier: 1, agency: link ? link[1].split(/ — | - /)[0] : `${name} County`, type: "county page", label: link ? link[1] : `${name} County terms`, url: link && link[2],
    accessed: COUNTY_VERIFIED.checked, jurisdiction: `${name} County, ${st}`, recordId: null, method: "opened and read", human: true, recordMatch: 1 });
}
function calendarSource(key) {
  const [st, name] = key.split("|");
  const level = SALE_DATE_LEVEL_BUNDLED[key];
  if (level === "DERIVED" && st === "IA") return source({ tier: 1, agency: "Iowa Legislature", type: "statute", label: "Iowa Code 446.7: sale on the third Monday in June", url: "https://www.legis.iowa.gov/docs/code/446.7.pdf",
    accessed: SOURCE_DATES.statute, jurisdiction: `${name} County, IA`, recordId: "Iowa Code 446.7", method: "derived from statute", human: true, derived: true, recordMatch: 0.7,
    note: "Derived from statute; a treasurer may pick another June date for good cause. The county's own notice governs." });
  return source({ tier: 1, agency: `${name} County sale notice`, type: "county page", label: `${name} County sale date (recorded in the sale calendar)`, url: null, accessed: SOURCE_DATES.countyPages,
    jurisdiction: `${name} County, ${st}`, method: level === "DERIVED" ? "derived from county rule" : "recorded from the county's published notice", human: false, derived: level === "DERIVED", recordMatch: 1,
    note: "The bundle records the date but not the page it came from: open the county notice to confirm." });
}
export function liveSource(row, name, st) {
  const verified = row.confidence === "VERIFIED";
  const url = urlIn(row.source);
  return source({ tier: verified ? (url ? 1 : 2) : 3, agency: row.author_name ? `Team · ${row.author_name}` : "Team correction", type: "team correction", label: row.source || "Team correction",
    url, accessed: row.created_at, jurisdiction: `${name} County, ${st}`, recordId: `county_intel · ${row.fips}:${row.field}`, method: verified ? "team-verified correction" : "reported, awaiting review", human: true, recordMatch: 1 });
}
export function deckSource(deck, key) {
  const [st, name] = key.split("|");
  const curated = deck.level === "CURATED";
  return source({ tier: curated ? 4 : deck.level === "PROMOTED" ? 1 : 1, agency: curated ? "Hand-curated list (not a county record)" : `${name} County ${deck.instrument === "deed" ? "sale" : "tax sale"} list`,
    type: curated ? "curated list" : "county list", label: `${name} County, ${st} · ${deck.level.toLowerCase()} list`, url: deck.sourceUrl, accessed: deck.scrapedAt || PROPERTY_DB.built,
    jurisdiction: `${name} County, ${st}`, method: deck.level === "SCRAPED" ? "machine scrape of county list" : curated ? "hand-curated" : "county-published list, parsed", human: false, recordMatch: 1,
    note: deck.sourceUrl ? null : "List URL not recorded in the bundle" });
}
const OTC_MASTER = () => source({ tier: 3, agency: "OTC master workbook", type: "researched workbook", label: OTC_DB.source || "OTC master workbook", url: null, accessed: OTC_DB.built, method: "compiled workbook", human: false, recordMatch: 0.85 });
const FL_DOR = () => { const s = COUNTY_VERIFIED.fl_dor_2026.source; return source({ tier: 1, agency: "Florida Department of Revenue", type: "state agency", label: s[1], url: s[2], accessed: SOURCE_DATES.dorRoster, jurisdiction: "Florida", method: "PDF roster, opened and read", human: true, recordMatch: 0.85 }); };

/* ------------------------------------ live ------------------------------------ */
export const liveRows = (ctx, fips, field) => {
  const m = ctx.live; if (!m || !fips) return [];
  const r = m.get(`${fips}:${field}`);
  return r && r.value != null && r.value !== "" ? [r] : [];
};

/* ---------------------------------- counties ---------------------------------- */
const SYS = { L: "Tax lien", D: "Tax deed" };
const saleKind = (t) => { const s = String(t || "").toLowerCase(); return /certificate|lien/.test(s) ? "lien" : /deed/.test(s) ? "deed" : null; };
const cvFact = (cv, re) => { const f = cv && (cv.facts || []).find(([k]) => re.test(k)); return f ? f : null; };

/** Every county-level fact, each with its sources. */
export function countyFacts(key, ctx) {
  const [st, name] = key.split("|");
  const today = ctx.today;
  const row = NAT_BY_NAME[`${name}|${st}`];
  const fips = row ? String(row[2]).padStart(5, "0") : null;
  const ent = `county:${key}`;
  const cv = COUNTY_VERIFIED.counties[key];
  const cvs = cv ? countyTermsSource(key, cv) : null;
  const R = rulesFor(st);
  const rb = rulebookSource(st);
  const wb = row ? workbookSource(row) : null;
  const dor = st === "FL" ? COUNTY_VERIFIED.fl_dor_2026.rows[name] : null;
  const live = (f) => liveRows(ctx, fips, f).map((r) => ({ value: r.value, source: liveSource(r, name, st) }));
  const rep = REPORTED[key];
  const repSrc = rep ? source({ tier: 3, agency: `Scout report · ${rep.by}`, type: "team report", label: rep.note, url: null, accessed: rep.on, jurisdiction: `${name} County, ${st}`, method: "team report", human: true, recordMatch: 1 }) : null;
  const F = {};

  F.sale_type = fact({ key: "sale_type", label: "Sale type", entity: ent, compare: "text", fresh: "statute", today,
    explain: "The county row and the state statute disagree on lien versus deed. The statute governs until a county source says otherwise." }, [
    { value: saleKind(R.instrument) || null, display: R.instrument, norm: saleKind(R.instrument), source: rb },
    row && row[3] !== "?" ? { value: saleKind(SYS[row[3]]), display: SYS[row[3]], norm: saleKind(SYS[row[3]]), source: wb } : null,
  ].filter(Boolean));
  F.statutory_rate = fact({ key: "statutory_rate", label: "Maximum statutory rate", entity: ent, compare: "number", fresh: "statute", today,
    explain: "The workbook rate differs from the verified statute. Rates in some states reset yearly; the statute (Tier 1) leads, the workbook is shown for comparison." }, [
    R.statutoryRate != null ? { value: R.statutoryRate, display: `${R.statutoryRate}%${R.headline ? ` · ${R.headline}` : ""}`, source: rb } : null,
    row && row[4] ? { value: row[4], display: `${row[4]}%`, source: wb } : null,
  ].filter(Boolean));
  F.penalty = R.penaltyPct != null ? fact({ key: "penalty", label: "Penalty", entity: ent, fresh: "statute", today }, [{ value: `${R.penaltyPct}%`, source: rb }])
    : gap(ent, "penalty", "Penalty", "State statute", today, "MISSING", R.verified ? "None stated in the verified rulebook" : undefined);
  F.bid_method = fact({ key: "bid_method", label: "Bidding method", entity: ent, fresh: "statute", today }, [
    cvFact(cv, /bid method/i) ? { value: cvFact(cv, /bid method/i)[1], source: cvs } : null,
    R.mechanism ? { value: R.mechanism, display: `${R.mechanism} (state rule)`, source: rb } : null,
    row && row[5] ? { value: row[5], source: wb } : null,
  ].filter(Boolean));
  F.redemption = fact({ key: "redemption", label: "Redemption period", entity: ent, fresh: "statute", today }, [
    R.redemption && R.redemption !== "Not verified" ? { value: R.redemption, source: rb } : null,
    row && row[6] ? { value: `${row[6]} months`, source: wb } : null,
  ].filter(Boolean));
  // dates written on the county's own pages, read by a person: the strongest evidence on file
  const cvSale = cv && (cv.facts || []).find(([k]) => /\b20\d\d sale\b|last published sale/i.test(k));
  const cvDates = cvSale ? datesIn(cvSale[1].split(";")[0]) : [];
  const cvYear = cvDates[0] ? cvDates[0].slice(0, 4) : null;
  const cvReg = cvSale ? (cvSale[1].split(";").find((c) => /registration/i.test(c)) || "") : "";
  const cvRegDate = cvReg ? datesIn(cvReg, cvYear).pop() : null;
  const saleObs = [];
  if (cvDates[0] && cvDates[0] >= today) saleObs.push({ value: cvDates[0], display: `${cvDates[0]} · ${cvSale[1]}`, source: cvs });
  if (NEXT_SALE_BUNDLED[key]) saleObs.push({ value: NEXT_SALE_BUNDLED[key], source: calendarSource(key) });
  if (rep && rep.saleIso) saleObs.push({ value: rep.saleIso, source: repSrc });
  saleObs.push(...live("sale_date"));
  const held = SALE_HELD[key], win = SALE_WINDOW[key];
  F.sale_date = fact({ key: "sale_date", label: "Next auction date", entity: ent, compare: "date", fresh: "sale_date", today,
    where: cv ? "County treasurer sale notice (see official links)" : "County treasurer or tax collector sale notice",
    emptyText: held ? `No next date on file · last sale held ${held.iso}` : win ? `Window only: ${win.text}` : "Unknown · no source states a date" }, saleObs);
  const pastCv = cvDates[0] && cvDates[0] < today ? cvDates[0] : null;
  F.last_sale = !held && pastCv ? fact({ key: "last_sale", label: "Last sale held", entity: ent, compare: "date", fresh: "results", today }, [{ value: pastCv, display: `${pastCv} · ${cvSale[1]}`, source: cvs }]) : held ? fact({ key: "last_sale", label: "Last sale held", entity: ent, compare: "date", fresh: "results", today }, [{ value: held.iso, display: `${held.iso} · ${held.text}`, source: source({ tier: 1, agency: `${name} County`, type: "county page", label: held.src, url: urlIn(held.src), accessed: isoDay(held.src) || SOURCE_DATES.countyPages, method: "opened and read", human: true, recordMatch: 1 }) }]) : null;
  const dl = HARD_DEADLINES_BUNDLED[key];
  F.registration_deadline = fact({ key: "registration_deadline", label: "Registration deadline", entity: ent, compare: "date", fresh: "deadline", today, where: "County auction terms or the auction platform" }, [
    cvRegDate && cvRegDate >= today ? { value: cvRegDate, display: `${cvRegDate} · ${cvReg.trim()}`, source: cvs } : null,
    dl ? { value: dl.iso, display: `${dl.iso}${dl.text ? ` · ${dl.text}` : ""}`, source: source({ tier: 1, agency: `${name} County`, type: "county page", label: dl.src || "County sale terms", url: urlIn(dl.src), accessed: SOURCE_DATES.countyPages, method: "recorded from county terms", human: false, recordMatch: 1 }) } : null,
    rep && rep.regClosesIso ? { value: rep.regClosesIso, source: repSrc } : null,
    ...live("registration_closes"),
  ].filter(Boolean));
  F.platform = fact({ key: "platform", label: "Auction provider", entity: ent, compare: "keyword", fresh: "county_terms", today, where: "County treasurer page naming the designated provider" }, [
    cvFact(cv, /platform/i) ? { value: cvFact(cv, /platform/i)[1], source: cvs } : null,
    dor ? { value: dor.platform, display: `${dor.platform}${dor.url ? ` · ${dor.url}` : ""}`, source: FL_DOR() } : null,
    ...live("platform"),
  ].filter(Boolean));
  F.deposit = fact({ key: "deposit", label: "Deposit requirement", entity: ent, fresh: "county_terms", today, where: "County auction terms" }, [
    cvFact(cv, /deposit/i) ? { value: cvFact(cv, /deposit/i)[1], source: cvs } : null,
  ].filter(Boolean));
  F.registration = fact({ key: "registration", label: "Registration process", entity: ent, fresh: "county_terms", today, where: "County auction terms" }, [
    cvFact(cv, /registration/i) ? { value: cvFact(cv, /registration/i)[1], source: cvs } : null, ...live("registration_terms"),
  ].filter(Boolean));
  F.foreclosure = fact({ key: "foreclosure", label: "Foreclosure / deed process", entity: ent, fresh: "statute", today, where: "State statute" }, [
    ...((R.rules || []).filter((t) => /deed|foreclos/i.test(t)).slice(0, 1).map((t) => ({ value: t, source: rb }))), ...live("deed_process"),
  ]);
  // OTC: official county link, a county's own reply, the master workbook, and team corrections
  const oc = COUNTY_VERIFIED.otc_county[key], ex = OTC_EXTRA[key];
  const om = (OTC_DB.rows || []).find((r) => r[1] === st && r[0] === name);
  const otcObs = [];
  if (oc) otcObs.push({ value: "available", display: `${oc[2]}`, source: source({ tier: 1, agency: `${name} County`, type: "county page", label: oc[2], url: oc[0], accessed: COUNTY_VERIFIED.checked, method: "opened and read", human: oc[1] === "OFFICIAL", recordMatch: 1 }) });
  // a county's own reply confirms availability; a note reasoning from state law only suggests it
  if (ex && /confirm/i.test(ex.status)) otcObs.push({ value: "available", display: `${ex.status}: ${ex.process || ""}`.trim(), source: source({ tier: 1, agency: ex.contact || `${name} County treasurer`, type: "county staff", label: ex.src || `${name} County reply`, url: ex.site, accessed: isoDay(ex.src) || OTC_DB.built, method: ex.siteKind === "emailed" ? "list emailed by the county" : "county contact", human: true, recordMatch: 1 }) });
  else if (ex) otcObs.push({ value: "likely", display: `${ex.status}: ${ex.process || ""}`.trim(), source: source({ tier: 3, agency: "Research note (inferred from state law)", type: "research note", label: ex.src || `${name} County note`, url: ex.site, accessed: isoDay(ex.src) || OTC_DB.built, method: "inferred from state law; the county has not confirmed availability", human: true, derived: true, recordMatch: 1 }) });
  if (om) otcObs.push({ value: om[2] === "CONFIRMED" ? "available" : "likely", display: `${om[2]}${om[4] ? ` · ${om[4]}` : ""}`, source: OTC_MASTER() });
  otcObs.push(...live("otc_status").map((o) => ({ ...o, norm: /avail|yes|confirm/i.test(o.value) ? "available" : /no|none/i.test(o.value) ? "none" : "likely" })));
  F.otc_status = fact({ key: "otc_status", label: "OTC / county-held", entity: ent, compare: "text", fresh: "otc", today, where: "County treasurer or tax collector: ask for struck-off or county-held inventory",
    cap: otcObs.every((o) => o.source.tier >= 3) && otcObs.length ? "PROVISIONAL" : undefined },
    // "likely" is a weaker claim, not a contradiction: only "available" against "none" is a conflict
    otcObs.map((o) => { const n = o.norm || o.value; return { ...o, norm: n === "likely" ? null : n }; }));
  F.otc_rate_advertised = om && om[3] ? fact({ key: "otc_rate_advertised", label: "OTC advertised rate", entity: ent, fresh: "otc", today }, [{ value: om[3], source: OTC_MASTER() }]) : gap(ent, "otc_rate_advertised", "OTC advertised rate", "County OTC page or treasurer", today);
  // delinquent list
  const deck = PROPERTY_DB.counties[key];
  F.delinquent_list = deck && deck.rows && deck.rows.length
    ? fact({ key: "delinquent_list", label: "Delinquent / sale list", entity: ent, fresh: "list", today, cap: deck.level === "CURATED" ? "PROVISIONAL" : undefined }, [{ value: deck.rowCount || deck.rows.length, display: `${(deck.rowCount || deck.rows.length).toLocaleString()} parcels · ${deck.level.toLowerCase()}${deck.saleHeld ? ` · sale held ${deck.saleHeld}` : ""}`, source: deckSource(deck, key) }])
    : gap(ent, "delinquent_list", "Delinquent / sale list", "County treasurer delinquent list or auction list", today, "MISSING",
      deck && /SYNTHETIC/.test(deck.level) ? "Quarantined: the list on file looked synthetic and was withheld" : "No list on file");
  // contacts
  const phoneObs = [];
  phoneObs.push(...live("phone"));
  if (cv && cv.phone) phoneObs.push({ value: cv.phone, source: cvs });
  if (row && row[11] && !PHONE_QUARANTINE.has(`${name}|${st}`)) phoneObs.push({ value: row[11], source: source({ tier: 4, agency: "Web scrape", type: "scrape", label: "National contact scrape", url: null, accessed: SOURCE_DATES.scrape, method: "machine scrape, not verified", human: false, recordMatch: 0.85 }) });
  F.phone = fact({ key: "phone", label: "Treasurer phone", entity: ent, compare: "number", fresh: "contact", today, where: "County website",
    emptyText: PHONE_QUARANTINE.has(`${name}|${st}`) ? "Withheld: the scraped number was shared by another county" : undefined }, phoneObs.map((o) => ({ ...o, norm: String(o.value).replace(/\D/g, "").slice(-10) })));
  // historical sales
  const res = OUTCOME_ROWS.filter((r) => r.state === st && r.county === name);
  const stats = OUTCOME_STATS[key];
  F.historical_sales = res.length ? fact({ key: "historical_sales", label: "Historical sales", entity: ent, fresh: "results", today }, [{ value: res.map((r) => `${r.sale_year}: ${r.sold ?? "—"}/${r.offered ?? "—"} sold`).join(" · "), source: source({ tier: 1, agency: `${name} County`, type: "county results", label: stats ? `Sale summary (${stats.years.join(", ")})` : "Published results", url: stats && stats.source_url, accessed: stats ? isoDay(stats.retrieved_at) : null, method: "published results, parsed", human: false, recordMatch: 1 }) }])
    : gap(ent, "historical_sales", "Historical sales", "County sale results page", today, "MISSING", "Not published or not on file");
  // offices and datasets
  const links = [...((cv && cv.links) || []).map((l) => ({ kind: l[0], label: l[1], url: presentLink(l[2]), level: l[3] })), ...(row ? dbLinks({ name, state: st }).map((l) => ({ kind: l[0], label: l[1], url: presentLink(l[2]), level: l[3] })) : [])]
    .filter((l) => l.url)
    .filter((l, i, a) => a.findIndex((x) => x.url === l.url) === i);
  return { key, st, name, fips, row, facts: F, links, rules: R, cv, deck, stats };
}

/** How the county's data can be reached. Never infers "no sale" from missing data. */
export function classifyCounty(C, today) {
  const out = [];
  const d = C.deck;
  if (d && d.rows && d.rows.length && d.level !== "CURATED") {
    const age = d.scrapedAt ? Math.round((new Date(today) - new Date(isoDay(d.scrapedAt))) / 86400000) : null;
    if (d.sourceUrl && age != null && age <= 60) out.push(["VERIFIED LIVE INVENTORY", "gr", `${d.rowCount || d.rows.length} parcels, pulled ${isoDay(d.scrapedAt)}`]);
    if (d.sourceUrl) out.push(["FREE DOWNLOAD", "cy", "List retrieved from a public county page"]);
  }
  if (C.facts.platform.status !== "MISSING") out.push(["AUCTION PLATFORM", "cy", C.facts.platform.display]);
  if (C.facts.otc_status.value === "available" && C.facts.otc_status.status !== "CONFLICT") out.push(["OTC AVAILABLE", "gr", C.facts.otc_status.display]);
  else if (C.facts.otc_status.value === "likely") out.push(["MANUAL / RESTRICTED", "am", "OTC likely; the county must be contacted"]);
  if (!out.length) out.push(["UNKNOWN", "", "No source on file establishes how this county sells or publishes. Missing data is not proof that no sale exists."]);
  return out;
}

/* ----------------------------------- parcels ----------------------------------- */
export const normApn = (s) => String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
export const normApnLoose = (s) => normApn(s).replace(/^0+/, "");

/** Every parcel-level fact from the list row, plus the research logged against it. */
export function parcelFacts(p, ctx, identifier = 1) {
  const today = ctx.today;
  const ent = `parcel:${p.id}`;
  const deck = PROPERTY_DB.counties[p.key] || { level: p.level, sourceUrl: p.source && /^https?:/.test(p.source) ? p.source : null, scrapedAt: p.listDate, instrument: p.instrument };
  const src = p.level === "PROMOTED" ? source({ tier: 1, agency: `${p.county} County (team-promoted intake)`, type: "county list", label: p.source || "Promoted parcel", url: urlIn(p.source), accessed: p.listDate, method: "team-vetted intake", human: true, recordMatch: 1 }) : deckSource(deck, p.key);
  const one = (key, label, v, o = {}) => (v == null || v === "" ? gap(ent, key, label, o.where, today, o.empty, o.emptyText) : fact({ key, label, entity: ent, fresh: o.fresh || "list", today, identifier, cap: o.cap }, [{ value: v, display: o.display, source: o.source || src }]));
  const est = p.estLow != null ? source({ tier: 4, agency: "List author's estimate", type: "estimate", label: "Curated list estimate", url: null, accessed: deck.scrapedAt || PROPERTY_DB.built, method: "hand estimate, not a valuation", human: false, recordMatch: 1 }) : null;
  const F = {
    apn: one("apn", "APN / parcel number", p.apn),
    alt_apn: one("alt_apn", "Alternate APN / account", p.acct, { where: "Assessor or treasurer account record" }),
    address: one("address", "Address / label", p.label),
    legal: one("legal", "Legal description", p.legal, { where: "Assessor or recorded deed" }),
    acreage: one("acreage", "Acreage", p.acres, { display: p.acres ? `${p.acres} acres` : null, where: "Assessor or GIS" }),
    property_type: one("property_type", "Property type", p.kind, { where: "Assessor land use code" }),
    assessed_land: gap(ent, "assessed_land", "Assessed land value", "County assessor", today),
    assessed_impr: gap(ent, "assessed_impr", "Assessed improvement value", "County assessor", today),
    assessed_total: one("assessed_total", "Total value on list", p.value, { display: p.value != null ? `$${Number(p.value).toLocaleString()}` : null, where: "County assessor" }),
    market_estimate: est ? fact({ key: "market_estimate", label: "Market value", entity: ent, today, cap: "PROVISIONAL" }, [{ value: p.estLow, display: `$${p.estLow.toLocaleString()}–$${(p.estHigh || p.estLow).toLocaleString()} (estimate, not a valuation)`, source: est }]) : gap(ent, "market_estimate", "Market value", "Comparable sales or broker opinion", today),
    owner: one("owner", "Owner", p.owner, { where: "Assessor or recorder (vesting deed)" }),
    owner_type: one("owner_type", "Ownership type", p.ownerType, { where: "Assessor" }),
    mailing: gap(ent, "mailing", "Mailing address", "Assessor or treasurer billing record", today),
    deed_ref: gap(ent, "deed_ref", "Deed reference", "County recorder", today),
    transfer: gap(ent, "transfer", "Recorded transfer date", "County recorder", today),
    last_sale: gap(ent, "last_sale", "Last known sale", "Recorder or assessor sales file", today),
    amount: one("amount", "Delinquent amount", p.amount, { display: p.amount != null ? `$${Number(p.amount).toLocaleString()}` : null, fresh: "amount", where: "County treasurer account", emptyText: p.level === "CURATED" ? "TBD on the curated list · check the treasurer" : undefined }),
    tax_year: one("tax_year", "Tax year", p.taxYear, { where: "Treasurer account" }),
    penalties: gap(ent, "penalties", "Penalties", "Treasurer account", today),
    interest: gap(ent, "interest", "Interest accrued", "Treasurer account", today),
    certificate: one("certificate", "Certificate / item number", p.raw && (p.raw.cert || p.raw.item), { where: "Sale list or certificate record" }),
    homestead: one("homestead", "Homestead", p.homestead, { where: "Assessor exemptions" }),
    sale_status: deck.saleHeld ? fact({ key: "sale_status", label: "Current sale status", entity: ent, today, cap: "PROVISIONAL" }, [{ value: `Sale held ${deck.saleHeld}; whether this parcel sold, redeemed or went to the county is not on file`, source: src }])
      : gap(ent, "sale_status", "Current sale status", "Treasurer: confirm the parcel is still in the sale", today),
  };
  return { ent, F, src };
}
