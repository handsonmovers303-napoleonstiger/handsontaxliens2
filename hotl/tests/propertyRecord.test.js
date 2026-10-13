import { describe, expect, test } from "vitest";
import { fact, source } from "../src/quantum/core.js";
import { allProperties } from "../src/holo/data.js";
import { STOP_ITEMS } from "../src/legacy/ScoutingDept.jsx";
import {
  applyPromotion, buildPropertyIntelligence, conflictingFact, evidenceEntry, evidenceLabel, identityKey, leafletRing, matchKey, mergePromoted, normApn, normApnLoose, readLocation, researchGate, withCheck, withVisit,
} from "../src/holo/propertyRecord.js";

const today = "2026-10-11";
const parcel = { id: "prop:1", state: "CO", county: "Delta", apn: "12-34 00", label: "1 Main St", source: "https://county.example/list", level: "PUBLISHED", key: "CO|Delta" };

function listed(value, accessed = today) {
  return fact({ key: "acreage", label: "Acreage", entity: "parcel:test", compare: "number", fresh: "list", today }, [
    { value, source: source({ tier: 1, agency: "County assessor", type: "county_assessor", label: "Assessor card", url: "https://county.example/assessor", accessed, method: "opened and read", human: true, recordMatch: 1 }) },
  ]);
}

describe("property intelligence record", () => {
  test("normalizes an APN and matches formatting, not the street", () => {
    expect(normApn("12-34 00")).toBe("123400");
    expect(normApnLoose("001234")).toBe("1234");
    expect(matchKey({ state: "CO", county: "Delta", apn: "12-34" })).toBe(matchKey({ state: "CO", county: "delta", apn: "1234" }));
    expect(identityKey({ ...parcel, source: "https://a.example" })).not.toBe(identityKey({ ...parcel, source: "https://b.example" }));
    expect(matchKey(parcel)).not.toContain("Main");
  });

  test("missing coordinates and a missing polygon stay unknown", () => {
    const rec = buildPropertyIntelligence({ parcel, today });
    expect(rec.location).toEqual({ latitude: null, longitude: null, polygon: null, geometryStatus: "not_on_file" });
    expect(rec.godsEye.parcelBoundaryStatus).toBe("not_on_file");
    expect(rec.godsEye.flags.some((f) => f.title === "Parcel location is not on file")).toBe(true);
    expect(rec.godsEye.flags.some((f) => f.title === "Parcel boundary not on file")).toBe(true);
    expect(rec.auction.auctionDate).toBeNull();
    expect(rec.property.landValue).toBeNull();
    expect(rec.property.improvementValue).toBeNull();
  });

  test("a point is not turned into a boundary", () => {
    const rec = buildPropertyIntelligence({ parcel: { ...parcel, lat: 38.8, lon: -107.6 }, today });
    expect(rec.location.geometryStatus).toBe("point");
    expect(rec.location.polygon).toBeNull();
    expect(leafletRing(rec.parcel)).toBeNull();
  });

  test("a stored polygon is kept and a guessed one is not", () => {
    const geom = { type: "Polygon", coordinates: [[[-107.6, 38.8], [-107.5, 38.8], [-107.5, 38.9], [-107.6, 38.8]]] };
    const rec = buildPropertyIntelligence({ parcel: { ...parcel, geom }, today });
    expect(rec.location.geometryStatus).toBe("polygon");
    expect(rec.location.latitude).toBeNull();
    expect(rec.location.polygon.length).toBeGreaterThanOrEqual(3);
    expect(rec.godsEye.flags.some((f) => f.title === "Parcel boundary not on file")).toBe(false);
    expect(readLocation({ label: "1 Main St, Delta, CO" }).polygon).toBeNull();
  });

  test("a source-backed fact keeps its source, and an unsupported value is not asserted", () => {
    const backed = evidenceEntry(listed(4.72));
    expect(backed.status).toBe("source-supported");
    expect(backed.value).toBe(4.72);
    expect(backed.source).toMatchObject({ type: "county_assessor", url: "https://county.example/assessor", retrievedAt: today });
    const loose = evidenceEntry({ key: "acreage", value: 4.72, evidenceCount: 0, status: "MISSING" });
    expect(loose.value).toBeNull();
    expect(loose.status).toBe("not_checked");
    expect(loose.source).toBeNull();
  });

  test("a conflict and a stale source are not called source-supported", () => {
    const conflict = evidenceEntry(conflictingFact("amount", 100, 250, today));
    expect(conflict.status).toBe("conflicting");
    expect(conflict.status).not.toBe("source-supported");
    const stale = evidenceEntry(listed(4.72, "2024-01-01"));
    expect(stale.status).toBe("stale");
    expect(stale.value).toBe(4.72);
  });

  test("checklist state survives a reload and changes the existing verdict", () => {
    const before = buildPropertyIntelligence({ parcel, today });
    expect(before.dueDiligence.verdict.label).toBe("Research incomplete");
    expect(before.dueDiligence.summary.checked).toBe(0);
    expect(before.dueDiligence.summary.unknown).toBeGreaterThan(0);
    const saved = JSON.parse(JSON.stringify(withCheck({}, parcel.id, STOP_ITEMS[0].id, { status: "fail", date: today })));
    const after = buildPropertyIntelligence({ parcel, checks: saved[parcel.id], today });
    expect(after.id).toBe(parcel.id);
    expect(after.dueDiligence.verdict.label).toBe("Do not bid");
    expect(after.dueDiligence.stopItems.find((item) => item.id === STOP_ITEMS[0].id).status).toBe("fail");
  });

  test("a scout note stays on the same property and is labeled as a scout observation", () => {
    const visits = withVisit({}, parcel.id, { obs: { road: "None / blocked" }, note: "gate locked" });
    const again = JSON.parse(JSON.stringify(visits));
    const rec = buildPropertyIntelligence({ parcel, visit: again[parcel.id], photos: [{ id: "ph1" }], today });
    expect(rec.scouting.notes).toEqual(["gate locked"]);
    expect(rec.scouting.observations.road).toBe("None / blocked");
    expect(rec.godsEye.flags.some((f) => f.status === "USER-OBSERVED" && f.source === "Scout observation")).toBe(true);
    expect(rec.evidence.every((e) => e.value == null || e.source)).toBe(true);
  });

  test("promotion copies a real coordinate and does not invent one", () => {
    const promoted = { id: "db:9", state: "CO", county: "Delta", apn: "00123400", lat: 38.8, lon: -107.6, source: "promoted" };
    const rows = mergePromoted([parcel], [promoted]);
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe("prop:1");
    expect(rows[0].apn).toBe("12-34 00");
    expect(readLocation(rows[0]).geometryStatus).toBe("point");
    const bare = applyPromotion(parcel, { id: "db:8", state: "CO", county: "Delta", apn: "123400" });
    expect(readLocation(bare).geometryStatus).toBe("not_on_file");
  });

  test("the gate stays unchecked until a saved checklist item exists", () => {
    expect(researchGate({ label: "Research incomplete" }, { checked: 0 }).label).toBe("Not checked");
    expect(researchGate({ label: "Do not bid", detail: "1 stop item failed." }, { checked: 1 }).label).toBe("STOP");
    expect(researchGate({ label: "CLEARED FOR AUCTION" }, { checked: 8 }).label).toBe("PROCEED");
    expect(researchGate({ label: "Research incomplete", detail: "3 stop items still open." }, { checked: 2 }).label).toBe("CAUTION");
    expect(evidenceLabel({ status: "clear", source: "https://county.example/a", date: "2026-10-01" }, "2026-10-11")).toBe("Source-supported");
    expect(evidenceLabel({ status: "clear", date: "2024-01-01" }, "2026-10-11")).toBe("Stale");
    expect(evidenceLabel({ status: "clear" }, "2026-10-11")).toBe("Not checked");
    expect(evidenceLabel(null, "2026-10-11")).toBe("Not checked");
  });

  test("a real list row keeps its identity and does not gain a boundary", () => {
    const row = allProperties()[0];
    const rec = buildPropertyIntelligence({ parcel: row, today });
    expect(rec.id).toBe(row.id);
    expect(rec.identity.apn).toBe(row.apn);
    expect(rec.identity.county).toBe(row.county);
    expect(rec.identity.state).toBe(row.state);
    expect(rec.location.geometryStatus).toBe(row.geometryStatus);
    if (row.geometryStatus !== "polygon") expect(rec.location.polygon).toBeNull();
    for (const entry of rec.evidence) if (entry.value != null) expect(entry.source && entry.source.agency).toBeTruthy();
  });
});
