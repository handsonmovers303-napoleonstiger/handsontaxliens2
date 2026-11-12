/**
 * Build src/data/catalog.json from the HOTL research archive plus
 * src/data/readings.json (pages opened by hand).
 *
 * Archive: artifacts/hotl-2026-10-13.zip → legacy/ScoutingDept.jsx
 * and holo/countyAuction.json (not copied into facts: the scrape
 * mis-labeled dates). Re-run after editing readings.json:
 *   node scripts/build-catalog.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const archive = process.env.HOTL_SRC || "/tmp/hotl-src/hotl";
const srcPath = path.join(archive, "src/legacy/ScoutingDept.jsx");
const src = fs.readFileSync(srcPath, "utf8");
const readings = JSON.parse(fs.readFileSync(path.join(root, "src/data/readings.json"), "utf8"));

const STATE_NAMES = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "District of Columbia",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois",
  IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana",
  ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota",
  MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York",
  NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon",
  PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota",
  TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia",
  WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

function sliceConst(name) {
  const token = `const ${name} = `;
  const start = src.indexOf(token);
  if (start < 0) throw new Error(`missing ${name}`);
  let i = start + token.length;
  while (src[i] === " " || src[i] === "\n") i += 1;
  const opener = src[i];
  if (opener === "`") {
    const end = src.indexOf("`;", i);
    return src.slice(i, end + 1);
  }
  if (opener !== "{" && opener !== "[") throw new Error(`bad opener for ${name}: ${opener}`);
  const close = opener === "{" ? "}" : "]";
  let depth = 0;
  let inStr = null;
  let esc = false;
  for (let j = i; j < src.length; j += 1) {
    const c = src[j];
    if (inStr) {
      if (esc) {
        esc = false;
        continue;
      }
      if (c === "\\") {
        esc = true;
        continue;
      }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      inStr = c;
      continue;
    }
    if (c === "/" && src[j + 1] === "/") {
      while (j < src.length && src[j] !== "\n") j += 1;
      continue;
    }
    if (c === opener) depth += 1;
    else if (c === close) {
      depth -= 1;
      if (depth === 0) return src.slice(i, j + 1);
    }
  }
  throw new Error(`unclosed ${name}`);
}

function evalExpr(code, locals = {}) {
  const keys = Object.keys(locals);
  const vals = Object.values(locals);
  return Function(...keys, `"use strict"; return (${code});`)(...vals);
}

const RULE_CHECKED = "Sep 4, 2026";
const STATE_RULES = evalExpr(sliceConst("STATE_RULES"), { RULE_CHECKED });
const SOURCED = evalExpr(sliceConst("SOURCED_COUNTIES"), { RULE_CHECKED });
const COUNTY_VERIFIED = evalExpr(sliceConst("COUNTY_VERIFIED"));
const NEXT_SALE = evalExpr(sliceConst("_bundled_NEXT_SALE"));
const SALE_LEVEL = evalExpr(sliceConst("_bundled_SALE_DATE_LEVEL"));
const HARD_DEADLINES = evalExpr(sliceConst("_bundled_HARD_DEADLINES"));
const SALE_WINDOW = evalExpr(sliceConst("SALE_WINDOW"));
const SALE_HELD = evalExpr(sliceConst("SALE_HELD"));
const natRaw = evalExpr(sliceConst("_NAT"));

const NUM = new Set([2, 4, 6, 7, 10, 14, 15, 20]);
const rows = natRaw.split("\n").filter(Boolean).map((line) => {
  const c = line.split("|");
  const row = c.map((v, i) => (v === "" ? (NUM.has(i) ? null : "") : NUM.has(i) ? Number(v) : v));
  row[22] = c[22]
    ? Object.fromEntries(
        c[22].split(",").map((p) => {
          const k = p.indexOf(":");
          const key = p.slice(0, k);
          const [u, lv] = p.slice(k + 1).split("~");
          return [key, [u === "" ? "" : u, lv || "D"]];
        }),
      )
    : {};
  return row;
});

function unpack(u) {
  if (!u || typeof u !== "string") return null;
  const s = u.trim();
  if (s.startsWith("https://") || s.startsWith("http://")) return s;
  if (s.startsWith("w:")) return `https://www.${s.slice(2)}`;
  if (s.startsWith("h:")) return `https://${s.slice(2)}`;
  if (s.startsWith("pw:")) return `http://www.${s.slice(3)}`;
  if (s.startsWith("p:")) return `http://${s.slice(2)}`;
  return null;
}

const LINK_KIND = {
  as: "Assessor",
  gi: "GIS parcel viewer",
  re: "Recorder",
  co: "Clerk / court records",
  pl: "Auction platform",
  ot: "County-held / OTC",
  tr: "Treasurer",
};

const FILE_NOTE = "file";
const sourcedByKey = new Map(SOURCED.map((c) => [`${c.state}|${c.name}`, c]));

function fact(label, value, level, source, caveat) {
  const row = { label, value, level };
  if (source) row.source = source;
  if (caveat) row.caveat = caveat;
  return row;
}

function gap(label) {
  return { label, value: "Not on file", level: "gap" };
}

function pushEvent(events, event) {
  if (!event?.iso || !/^\d{4}-\d{2}-\d{2}$/.test(event.iso)) return;
  if (events.some((e) => e.id === event.id)) return;
  events.push(event);
}

const states = {};
for (const [abbr, rule] of Object.entries(STATE_RULES)) {
  states[abbr] = {
    abbr,
    name: STATE_NAMES[abbr] || abbr,
    verified: !!rule.verified,
    mechanism: rule.mechanism || null,
    instrument: rule.instrument || "Unknown",
    headline: rule.headline || null,
    statutoryRate: rule.statutoryRate ?? null,
    redemption: rule.redemption || null,
    note: rule.note || null,
    stale: rule.stale || null,
    rules: Array.isArray(rule.rules) ? rule.rules : [],
    sources: (rule.sources || []).map(([title, host, checked]) => ({ title, host, checked })),
  };
}

const counties = rows.map((r) => {
  const name = r[0];
  const state = r[1];
  const fips = String(r[2]).padStart(5, "0");
  const sys = r[3] === "L" ? "lien" : r[3] === "D" ? "deed" : "unknown";
  const key = `${state}|${name}`;
  const rule = states[state] || null;
  const reading = readings.counties[fips] || null;
  const sourced = sourcedByKey.get(key) || null;
  const verified = COUNTY_VERIFIED.counties?.[key] || null;
  const flags = String(r[9] || "");
  const events = [];
  const links = [];
  const seenUrl = new Set();
  const addLink = (row) => {
    if (!row?.url || seenUrl.has(row.url)) return;
    seenUrl.add(row.url);
    links.push(row);
  };

  if (reading?.source?.url) {
    addLink({
      label: reading.source.title,
      url: reading.source.url,
      level: "OFFICIAL",
      kind: "Treasurer",
      note: "opened",
    });
  }
  for (const link of verified?.links || []) {
    const [kind, label, url, level] = link;
    addLink({
      label,
      url,
      level: level || "OFFICIAL",
      kind: kind || "Source",
      note: FILE_NOTE,
    });
  }
  for (const [k, pair] of Object.entries(r[22] || {})) {
    const url = unpack(pair[0]);
    if (!url) continue;
    addLink({
      label: `${name} County — ${LINK_KIND[k] || k}`,
      url,
      level: pair[1] === "O" ? "OFFICIAL" : "DIRECT",
      kind: LINK_KIND[k] || k,
      note: pair[1] === "O" ? FILE_NOTE : "direct",
    });
  }

  const facts = [];
  const sourceOf = reading
    ? { title: reading.source.title, url: reading.source.url, retrieved: reading.source.retrieved }
    : null;

  if (reading?.auctionType) facts.push(fact("Auction type", reading.auctionType, "opened", sourceOf));
  else if (rule?.verified && rule.instrument) {
    facts.push(fact("Auction type", rule.instrument, "statute", rule.sources[0] ? { title: rule.sources[0].title, retrieved: rule.sources[0].checked } : { title: "State rulebook", retrieved: "2026-09-04" }, "statute-county"));
  } else if (sys !== "unknown") {
    facts.push(fact("Auction type", sys === "lien" ? "Tax lien" : "Tax deed", "workbook", { title: "National county table", retrieved: "2026-09-04" }, "workbook-system"));
  } else facts.push(gap("Auction type"));

  if (reading?.interest) facts.push(fact("Interest or penalty", reading.interest, "opened", sourceOf, reading.supersedes || undefined));
  else if (rule?.verified && rule.headline) {
    facts.push(fact("Interest or penalty", rule.headline, "statute", rule.sources[0] ? { title: rule.sources[0].title, retrieved: rule.sources[0].checked } : undefined, rule.stale || undefined));
  } else if (r[4] != null) {
    facts.push(fact("Interest or penalty", `${r[4]}%`, "workbook", { title: "National county table", retrieved: "2026-09-04" }, "workbook-figure"));
  } else facts.push(gap("Interest or penalty"));

  if (reading?.redemption) facts.push(fact("Redemption period", reading.redemption, "opened", sourceOf));
  else if (rule?.verified && rule.redemption) {
    facts.push(fact("Redemption period", rule.redemption, "statute", rule.sources[0] ? { title: rule.sources[0].title, retrieved: rule.sources[0].checked } : undefined));
  } else if (r[6] != null) {
    facts.push(fact("Redemption period", `${r[6]} months`, "workbook", { title: "National county table", retrieved: "2026-09-04" }, "workbook-figure"));
  } else facts.push(gap("Redemption period"));

  if (reading?.format) facts.push(fact("Auction format", reading.format, "opened", sourceOf));
  else facts.push(gap("Auction format"));

  if (reading?.platform) facts.push(fact("Platform", reading.platform, "opened", sourceOf));
  else facts.push(gap("Platform"));

  if (reading?.sale) {
    facts.push(fact("Auction date", reading.sale.text, "opened", sourceOf, reading.supersedes || undefined));
    pushEvent(events, {
      id: `sale:${fips}:${reading.sale.iso}`,
      kind: "sale",
      iso: reading.sale.iso,
      title: `${name} County, ${state} tax sale`,
      details: `${reading.sale.text}\n\nSource: ${reading.source.title} (${reading.source.url}), read ${reading.source.retrieved}. Not financial, legal, or tax advice.`,
      location: reading.place || `${name} County, ${STATE_NAMES[state] || state}`,
      level: "opened",
      source: sourceOf,
    });
  } else if (NEXT_SALE[key]) {
    const derived = SALE_LEVEL[key] === "DERIVED" || state === "FL" || (state === "AZ" && !verified?.facts?.some((f) => String(f[0]).includes("2027")));
    const level = derived ? "derived" : "on_file";
    let text = NEXT_SALE[key];
    let caveat = FILE_NOTE;
    if (state === "IA" && derived) {
      text = NEXT_SALE[key];
      caveat = "derived-ia";
    } else if (state === "FL" && derived) {
      text = NEXT_SALE[key];
      caveat = "derived-fl";
    } else if (state === "AZ" && derived) {
      text = NEXT_SALE[key];
      caveat = "derived-az";
    } else if (SALE_LEVEL[key] === "DERIVED") {
      text = NEXT_SALE[key];
      caveat = "derived";
    }
    facts.push(fact("Auction date", text, level, { title: "HOTL research file", retrieved: "2026-09-04" }, caveat));
    pushEvent(events, {
      id: `sale:${fips}:${NEXT_SALE[key]}`,
      kind: "sale",
      iso: NEXT_SALE[key],
      title: `${name} County, ${state} tax sale${level === "derived" ? " (derived)" : ""}`,
      details: text,
      location: `${name} County, ${STATE_NAMES[state] || state}`,
      level,
      source: { title: "HOTL research file", retrieved: "2026-09-04" },
    });
  } else if (SALE_WINDOW[key]) {
    facts.push(fact("Auction date", `Window only: ${SALE_WINDOW[key].text} Outer date on file: ${SALE_WINDOW[key].by}.`, "on_file", { title: SALE_WINDOW[key].src || "Research file", retrieved: "2026-09-10" }, "This is not a single auction day."));
  } else facts.push(gap("Auction date"));

  if (reading?.registration) {
    facts.push(fact("Registration deadline", reading.registration.text, "opened", sourceOf));
    if (reading.registration.iso) {
      pushEvent(events, {
        id: `reg:${fips}:${reading.registration.iso}`,
        kind: "registration",
        iso: reading.registration.iso,
        title: `${name} County, ${state} registration deadline`,
        details: `${reading.registration.text}\n\nSource: ${reading.source.title} (${reading.source.url}), read ${reading.source.retrieved}.`,
        location: reading.place || undefined,
        level: "opened",
        source: sourceOf,
      });
    }
  } else if (HARD_DEADLINES[key]?.iso) {
    const hard = HARD_DEADLINES[key];
    facts.push(fact("Registration deadline", `${hard.iso}${hard.text ? ` — ${hard.text}` : ""}`, "on_file", { title: hard.src || "Research file", retrieved: "2026-09-14" }, FILE_NOTE));
    pushEvent(events, {
      id: `reg:${fips}:${hard.iso}`,
      kind: "registration",
      iso: hard.iso,
      title: `${name} County, ${state} registration deadline`,
      details: `${hard.text || "Registration deadline on file."}\nSource note: ${hard.src || "research file"}. ${FILE_NOTE}`,
      location: `${name} County, ${STATE_NAMES[state] || state}`,
      level: "on_file",
      source: { title: hard.src || "HOTL research file", retrieved: "2026-09-14" },
    });
  } else facts.push(gap("Registration deadline"));

  if (reading?.deposit) facts.push(fact("Deposit", reading.deposit, "opened", sourceOf));
  else facts.push(gap("Deposit"));

  if (reading?.payment?.iso) {
    facts.push(fact("Payment deadline", reading.payment.text, "opened", sourceOf));
    pushEvent(events, {
      id: `pay:${fips}:${reading.payment.iso}`,
      kind: "payment",
      iso: reading.payment.iso,
      title: `${name} County, ${state} — winning-bid payment deadline`,
      details: `${reading.payment.text}\n\nSource: ${reading.source.title} (${reading.source.url}), read ${reading.source.retrieved}.`,
      level: "opened",
      source: sourceOf,
    });
  }

  if (reading?.place) facts.push(fact("Where", reading.place, "opened", sourceOf));

  for (const line of reading?.extras || []) {
    facts.push(fact("From the county page", line, "opened", sourceOf));
  }

  if (verified?.conflict) {
    facts.push(fact("Conflict in the county file", verified.conflict, "on_file", { title: "HOTL county file", retrieved: "2026-09-04" }, reading ? "An older conflict note. Read it next to the page opened November 12, 2026." : FILE_NOTE));
  }
  if (sourced?.conflict && sourced.conflict !== verified?.conflict) {
    facts.push(fact("Conflict in the county file", sourced.conflict, "on_file", { title: sourced.sources?.[0]?.[0] || "County file", retrieved: "2026-09-04" }, reading ? "Recorded in September 2026. The page opened November 12, 2026 is the later reading." : FILE_NOTE));
  }
  if (sourced?.stale) {
    facts.push(fact("Freshness", sourced.stale, "on_file", { title: "County file", retrieved: "2026-09-04" }));
  }

  const skipLabels = new Set(["2026 sale date", "Registration deadline", "Stated rate", "2026 rate", "2025 rate", "2025 sale rate", "Rate mechanism", "Stated 2026 rate"]);
  for (const item of sourced?.facts || []) {
    const [label, value, tone] = item;
    if (reading && skipLabels.has(label)) continue;
    const caveat = tone === "r" ? "Marked caution or stale in the September 2026 county file." : tone === "y" ? "Marked as a caution in the September 2026 county file." : FILE_NOTE;
    facts.push(fact(label, value, "on_file", { title: sourced.sources?.[0]?.[0] || "County file", retrieved: "2026-09-04" }, caveat));
  }
  for (const item of verified?.facts || []) {
    const [label, value, level] = item;
    if (reading && /sale|registration|rate|platform|deposit/i.test(label) && facts.some((f) => f.level === "opened" && f.label !== "From the county page")) {
      if (skipLabels.has(label) || /2026 sale|Platform|Sale timing/.test(label)) continue;
    }
    facts.push(fact(label, value, level === "OFFICIAL" ? "on_file" : "on_file", { title: "County file", retrieved: COUNTY_VERIFIED.checked || "2026-09-04" }, `${level || "ON FILE"} · ${FILE_NOTE}`));
  }

  const dor = state === "FL" ? COUNTY_VERIFIED.fl_dor_2026?.rows?.[name] : null;
  if (dor) {
    const bits = [];
    if (dor.platform) bits.push(`Platform listed: ${dor.platform}.`);
    if (dor.start) bits.push(`2026 certificate sale start listed as ${dor.start}${dor.days ? ` for ${dor.days} bidding days` : ""}.`);
    if (dor.contact) bits.push(`Contact listed: ${dor.contact}.`);
    if (bits.length) {
      facts.push(fact("2026 Florida certificate sale", bits.join(" "), "on_file", { title: "Florida DOR — 2026 Tax Certificate Sale Information", url: "https://floridarevenue.com/property/Documents/2026TaxCertSale.pdf", retrieved: "2026-09-04" }, "That sheet describes the 2026 cycle, which has already started or finished. It is not a 2027 announcement."));
    }
    if (dor.url) {
      addLink({
        label: `${name} County certificate sale`,
        url: dor.url,
        level: "OFFICIAL",
        kind: "Auction platform",
        note: "dor",
      });
    }
  }

  if (SALE_HELD[key]) {
    facts.push(fact("Sale already held", `${SALE_HELD[key].iso} — ${SALE_HELD[key].text}`, "on_file", { title: SALE_HELD[key].src || "Research file", retrieved: "2026-09-10" }));
  }

  if (flags.includes("R")) {
    facts.push(fact("Row quality", "The national table flags this county's row as corrupt. Treat the workbook fields with extra skepticism.", "workbook", { title: "National county table", retrieved: "2026-09-04" }));
  }
  if (flags.includes("G")) {
    facts.push(fact("Row quality", "The national table flags a regime conflict on this row. Read the state note before using the workbook classification.", "workbook", { title: "National county table", retrieved: "2026-09-04" }));
  }

  const phone = reading?.phone || verified?.phone || (r[11] ? String(r[11]) : null);
  const phoneLevel = reading?.phone ? "opened" : "workbook";

  const headline = r[16] ? String(r[16]) : null;

  return {
    fips,
    name,
    state,
    stateName: STATE_NAMES[state] || state,
    system: sys,
    bidLead: r[5] || null,
    phone,
    phoneLevel,
    population: typeof r[20] === "number" ? r[20] : null,
    terrain: r[21] || null,
    workbookHeadline: headline || null,
    statuteVerified: !!(rule && rule.verified),
    links,
    facts,
    events,
    officialUrl: links.find((l) => l.level === "OFFICIAL")?.url || null,
  };
});

const catalog = {
  built: "2026-11-12",
  sourceArchive: "HOTL research archive dated 2026-10-13, county table built 2026-09-04",
  readingsRetrieved: readings.retrieved,
  countyCount: counties.length,
  states,
  counties,
};

const out = path.join(root, "src/data/catalog.json");
fs.writeFileSync(out, JSON.stringify(catalog));
const opened = counties.filter((c) => c.facts.some((f) => f.level === "opened")).length;
const dated = counties.filter((c) => c.events.some((e) => e.level !== "derived")).length;
const derived = counties.filter((c) => c.events.some((e) => e.level === "derived")).length;
console.log(`counties ${counties.length} opened ${opened} dated(non-derived) ${dated} derived ${derived} bytes ${fs.statSync(out).size}`);
