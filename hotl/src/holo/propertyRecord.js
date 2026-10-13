/* One parcel, one record. The card, the map, the checklist, and scout notes
 * read this. A value with no source stays null. Unknown stays unknown. */
import { ALL_ITEMS, STOP_ITEMS, ddVerdict } from "../legacy/ScoutingDept.jsx";
import { fact, source } from "../quantum/core";
import { normApn, normApnLoose, parcelFacts } from "../quantum/evidence";
import { dueFlags } from "./dueFlags";

export { normApn, normApnLoose };

const STATUS = {
  VERIFIED: "source-supported",
  CORROBORATED: "source-supported",
  PROVISIONAL: "provisional",
  CONFLICT: "conflicting",
  STALE: "stale",
  MISSING: "not_checked",
  RESTRICTED: "unavailable",
  PAID: "unavailable",
  FIELD: "not_checked",
};

function num(v) {
  if (v == null || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Leaflet ring [lat, lon] from a stored polygon. Nothing is invented. */
export function leafletRing(row) {
  const g = row?.geom || row?.geometry || row?.polygon;
  const coords = Array.isArray(g) ? g : g?.type === "Polygon" ? g.coordinates?.[0] : null;
  if (!Array.isArray(coords) || coords.length < 3) return null;
  const ring = coords.map((pt) => [Number(pt[1]), Number(pt[0])]).filter((pt) => Number.isFinite(pt[0]) && Number.isFinite(pt[1]));
  return ring.length >= 3 ? ring : null;
}

export function readLocation(row) {
  const polygon = leafletRing(row);
  const latitude = num(row?.lat ?? row?.latitude);
  const longitude = num(row?.lon ?? row?.lng ?? row?.longitude);
  const geometryStatus = polygon ? "polygon" : latitude != null && longitude != null ? "point" : "not_on_file";
  return { latitude, longitude, polygon, geometryStatus };
}

export function matchKey(p) {
  return [p?.state || "", String(p?.county || "").toLowerCase(), normApnLoose(p?.apn || p?.pid)].join("|");
}

export function identityKey(p) {
  return [p?.state || "", String(p?.county || "").toLowerCase(), normApn(p?.apn || p?.pid), p?.source || p?.level || ""].join("|");
}

/** Keep a list row. Copy a coordinate or polygon from the promoted row only when that row actually has one. */
export function applyPromotion(listRow, promotedRow) {
  const base = readLocation(listRow);
  const extra = readLocation(promotedRow);
  const polygon = base.polygon || extra.polygon;
  const latitude = base.latitude ?? extra.latitude;
  const longitude = base.longitude ?? extra.longitude;
  const geometryStatus = polygon ? "polygon" : latitude != null && longitude != null ? "point" : "not_on_file";
  return {
    ...listRow,
    lat: latitude,
    lon: longitude,
    geom: base.polygon ? listRow.geom || listRow.geometry || listRow.polygon : promotedRow?.geom || promotedRow?.geometry || promotedRow?.polygon || null,
    geometryStatus,
  };
}

export function mergePromoted(list, promoted) {
  const pool = [...(promoted || [])];
  const used = new Set();
  const merged = (list || []).map((row) => {
    const hit = pool.find((q) => !used.has(q.id) && matchKey(q) === matchKey(row));
    if (!hit) return row;
    used.add(hit.id);
    return applyPromotion(row, hit);
  });
  for (const row of pool) if (!used.has(row.id)) merged.push(row);
  return merged;
}

/** A Quantum fact becomes one evidence row. No evidence means the value is null. */
export function evidenceEntry(f) {
  const backed = !!(f && f.evidenceCount > 0);
  return {
    key: f?.key || null,
    value: backed ? f.value : null,
    status: STATUS[f?.status] || "not_checked",
    quantumStatus: f?.status || "MISSING",
    source: backed && f.lead ? { type: f.lead.type || null, url: f.lead.url || null, retrievedAt: f.lead.accessed || null, agency: f.lead.agency || null } : null,
  };
}

export function withCheck(dd, propertyId, itemId, rec) {
  return { ...(dd || {}), [propertyId]: { ...((dd || {})[propertyId] || {}), [itemId]: rec } };
}

export function withVisit(visits, propertyId, patch) {
  const prev = (visits && visits[propertyId]) || { obs: {}, note: "" };
  return { ...(visits || {}), [propertyId]: { ...prev, ...patch } };
}

function diligenceOf(checks) {
  const recs = checks || {};
  let checked = 0;
  let unknown = 0;
  for (const item of ALL_ITEMS) {
    const status = recs[item.id]?.status;
    if (status && status !== "unchecked") checked += 1;
    else unknown += 1;
  }
  const stopUnresolved = STOP_ITEMS.filter((item) => !["clear", "na"].includes(recs[item.id]?.status)).length;
  return {
    checks: recs,
    stopItems: STOP_ITEMS.map((item) => ({ id: item.id, title: item.t, status: recs[item.id]?.status || "unchecked" })),
    verdict: ddVerdict(recs),
    summary: { checked, unknown, stopUnresolved, total: ALL_ITEMS.length },
    adapters: {},
  };
}

function backed(entries, key) {
  return entries.find((e) => e.key === key) || { key, value: null, status: "not_checked", quantumStatus: "MISSING", source: null };
}

function pinPoint(pin) {
  const latitude = num(pin?.lat);
  const longitude = num(pin?.lon);
  return latitude != null && longitude != null ? { lat: latitude, lon: longitude, kind: "pin" } : null;
}

/**
 * Build the one record for a parcel. `facts` may be passed in tests.
 * Otherwise the Quantum parcel facts are used, and a gap stays a gap.
 */
export function buildPropertyIntelligence({ parcel, checks, visit, photos, pin, facts, today }) {
  const p = parcel || {};
  const day = today || new Date().toISOString().slice(0, 10);
  const built = facts || (p.key ? parcelFacts(p, { today: day }).F : {});
  const entries = Object.values(built).map(evidenceEntry);
  const location = readLocation(p);
  const point = pinPoint(pin) || (location.latitude != null && location.longitude != null ? { lat: location.latitude, lon: location.longitude, kind: "record" } : null);
  const amount = backed(entries, "amount");
  const acreage = backed(entries, "acreage");
  const assessed = backed(entries, "assessed_total");
  const kind = backed(entries, "property_type");
  const address = backed(entries, "address");
  const legal = backed(entries, "legal");
  const stamps = [];
  for (const rec of Object.values(checks || {})) if (rec?.date) stamps.push(String(rec.date));
  if (visit?.completed) stamps.push(String(visit.completed));
  stamps.sort();
  return {
    id: p.id || identityKey(p),
    parcel: p,
    identity: {
      state: p.state || null,
      county: p.county || null,
      apn: p.apn || p.pid || null,
      apnNorm: normApn(p.apn || p.pid),
      matchKey: matchKey(p),
      identityKey: identityKey(p),
      address: address.value,
      legalDescription: legal.value,
      sourceId: p.source || p.level || null,
      sourceUrl: typeof p.source === "string" && /^https?:/.test(p.source) ? p.source : null,
      listDate: p.listDate || null,
    },
    location,
    auction: {
      saleType: p.instrument || null,
      auctionDate: null,
      auctionPlatform: null,
      startingBid: null,
      amountDue: amount.value,
      redemptionPeriod: null,
      registrationStatus: null,
      source: amount.source,
    },
    property: {
      acreage: acreage.value,
      assessedValue: assessed.value,
      landValue: null,
      improvementValue: null,
      propertyType: kind.value,
    },
    godsEye: {
      imageryProvider: "USGS The National Map",
      imageryDate: null,
      parcelBoundaryStatus: location.geometryStatus,
      flags: dueFlags({ p, point, ring: location.polygon, visit, photos }),
    },
    dueDiligence: diligenceOf(checks),
    scouting: {
      notes: visit?.note ? [visit.note] : [],
      photos: photos || [],
      observations: visit?.obs || {},
      visit: visit || null,
      pin: pinPoint(pin),
    },
    evidence: entries,
    metadata: {
      createdAt: p.listDate || null,
      updatedAt: stamps[stamps.length - 1] || null,
      lastVerifiedAt: null,
    },
  };
}

/** Two sources that disagree. Used by tests and by any caller that already has observations. */
export function conflictingFact(key, a, b, today) {
  return fact({ key, label: key, entity: "parcel:test", compare: "number", fresh: "list", today }, [
    { value: a, source: source({ tier: 1, agency: "County A", type: "county list", label: "List A", url: "https://county.example/a", accessed: today, method: "opened", human: true, recordMatch: 1 }) },
    { value: b, source: source({ tier: 1, agency: "County B", type: "county list", label: "List B", url: "https://county.example/b", accessed: today, method: "opened", human: true, recordMatch: 1 }) },
  ]);
}

/** STOP, CAUTION, or PROCEED only from the checklist verdict. Zero checks stay "Not checked". */
export function researchGate(verdict, summary) {
  if (!verdict || !summary || summary.checked === 0) {
    return { label: "Not checked", tone: "", why: "No checklist item is saved. A blank is unknown, not a clear title." };
  }
  if (verdict.label === "Do not bid") return { label: "STOP", tone: "rd", why: verdict.detail || "A stop item failed." };
  if (verdict.label === "CLEARED FOR AUCTION") return { label: "PROCEED", tone: "gr", why: "Every stop item is verified or ruled not applicable. That is not advice to bid." };
  return { label: "CAUTION", tone: "am", why: verdict.detail || "Stop items are still open." };
}

export function evidenceLabel(rec, today) {
  if (!rec || !rec.status || rec.status === "unchecked") return "Not checked";
  if (rec.status === "na") return "Unavailable";
  const day = rec.date && String(rec.date).slice(0, 10);
  if (day && today && (new Date(today) - new Date(day)) / 86400000 > 365) return "Stale";
  if (rec.source) return "Source-supported";
  return "Not checked";
}
