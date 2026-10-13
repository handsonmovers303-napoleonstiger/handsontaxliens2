import { describe, expect, it } from "vitest";
import { detailFor, layerInfo, nextTileStatus, parcelQuery, parcelSourceFor, usableParcelId, coverageOf, coverageCounts, COUNTY_PARCEL_SOURCES, LAYER_INFO } from "../src/holo/gis/registry.js";

describe("map layer status", () => {
  it("does not treat a failed service as a safe result", () => {
    let row = { loads: 0, errors: 0 };
    row = nextTileStatus(row, "error");
    row = nextTileStatus(row, "error");
    row = nextTileStatus(row, "error");
    expect(row.state).toBe("Unavailable");
    const text = detailFor("flood", "timeout", "Unavailable");
    expect(text.toLowerCase()).not.toMatch(/no flood risk|safe|clear title/);
    expect(text.toLowerCase()).toMatch(/did not return/);
  });

  it("keeps a partial tile response partial", () => {
    let row = nextTileStatus({ loads: 0, errors: 0 }, "load");
    row = nextTileStatus(row, "error");
    expect(row.state).toBe("Partial coverage");
  });

  it("leaves a wide flood view unchecked instead of empty of risk", () => {
    const row = nextTileStatus({ loads: 0, errors: 0 }, "gate");
    expect(row.state).toBe("Not checked");
    const detail = detailFor("flood", "gate", row.state).toLowerCase();
    expect(detail).toContain("no flood risk");
    expect(detail).toMatch(/\bnot\b/);
    expect(detailFor("flood", "empty", "Unavailable")).toMatch(/No GIS coverage found/);
  });

  it("uses the King County assessor service only for King County", () => {
    const king = parcelSourceFor({ state: "WA", name: "King" });
    expect(king.fields.apn).toBe("PIN");
    expect(king.kind).toBe("Official");
    const delta = parcelSourceFor({ state: "CO", name: "Delta" });
    expect(!delta || (delta.provider === "Colorado GIS" && delta.coverageClass === "verified-state")).toBe(true);
    const maricopa = parcelSourceFor({ state: "AZ", name: "Maricopa" });
    expect(maricopa.fields.apn).toBe("APN");
    expect(maricopa.outFields).toBe("APN");
    expect(maricopa.url).toMatch(/mcassessor\.maricopa\.gov/);
    expect(maricopa.note).toMatch(/not a title search/i);
    expect(parcelQuery(king, -122.33, 47.6)).toMatch(/outFields=PIN%2CMAJOR%2CMINOR/);
    expect(parcelQuery(king, -122.33, 47.6)).not.toMatch(/owner/i);
    expect(parcelQuery(maricopa, -112.07, 33.45)).toMatch(/outFields=APN/);
    expect(parcelQuery(maricopa, -112.07, 33.45)).not.toMatch(/OWNER/);
  });

  it("adds a county only when the adapter names a tested parcel id", () => {
    expect(parcelSourceFor({ state: "CA", name: "Orange" })).toBeNull();
    expect(parcelSourceFor({ state: "AZ", name: "Pinal" })).toBeNull();
    expect(parcelSourceFor({ state: "TX", name: "Collin" })).toBeNull();
    const clark = parcelSourceFor({ state: "WA", name: "Clark" });
    expect(clark.provider).toBe("Washington State Parcels Project");
    expect(clark.coverageClass).toBe("verified-state");
    expect(clark.outFields).toBe("PARCEL_ID_NR");
    const elPaso = parcelSourceFor({ state: "CO", name: "El Paso" });
    expect(elPaso.url).toMatch(/gis\.colorado\.gov/);
    expect(elPaso.where).toBe("countyName='El Paso'");
    expect(elPaso.outFields).toBe("parcel_id");
    expect(parcelSourceFor({ state: "TX", name: "El Paso" })).toBeNull();
    const ada = parcelSourceFor({ state: "ID", name: "Ada" });
    expect(ada.fields.apn).toBe("PARCEL");
    expect(ada.outFields).toBe("PARCEL");
    const travis = parcelSourceFor({ state: "TX", name: "Travis" });
    expect(travis.fields.apn).toBe("PROP_ID");
    const hills = parcelSourceFor({ state: "FL", name: "Hillsborough" });
    expect(hills.outFields).toBe("folio");
    const pima = parcelSourceFor({ state: "AZ", name: "Pima" });
    expect(pima.url).toMatch(/mapdata\.tucsonaz\.gov/);
    const denver = parcelSourceFor({ state: "CO", name: "Denver" });
    expect(denver.outFields).toBe("SCHEDNUM");
    expect(denver.outFields).not.toMatch(/OWNER/);
    for (const row of COUNTY_PARCEL_SOURCES) {
      expect(row.outFields.toLowerCase()).not.toMatch(/owner|mail|taxpayer/);
      expect(row.minZoom).toBe(14);
      expect(row.checked).toBe("2026-10-11");
      expect(row.note).toMatch(/not a title search/i);
    }
    expect(usableParcelId("  ")).toBe("");
    expect(usableParcelId("NAP")).toBe("");
    expect(usableParcelId("0000000000000")).toBe("");
    expect(usableParcelId("City of El Paso")).toBe("");
    expect(usableParcelId("4184005038")).toBe("4184005038");
    expect(COUNTY_PARCEL_SOURCES.length).toBeGreaterThan(2);
    expect(coverageOf({ state: "WA", name: "King", fips: "53033" }).status).toBe("verified-county");
    expect(coverageOf({ state: "CO", name: "El Paso", fips: "08041" }).status).toBe("verified-state");
    expect(coverageOf({ state: "AZ", name: "Pima", fips: "04019" }).status).toBe("partial");
    expect(coverageOf({ state: "CA", name: "Orange", fips: "06059" }).label).toBe("Unavailable / not tested");
    expect(coverageCounts().universe).toBe(3143);
    expect(coverageCounts()["not-tested"]).toBeGreaterThan(0);
    const sum = ["verified-county", "verified-state", "visual-only", "partial", "not-tested"].reduce((n, key) => n + coverageCounts()[key], 0);
    expect(sum).toBe(3143);
  });

  it("keeps fire potential separate from current incidents", () => {
    const ids = LAYER_INFO.map((row) => row.id);
    expect(ids).toEqual(["parcels", "terrain", "flood", "fires", "perimeters", "hazard"]);
    const hazard = LAYER_INFO.find((row) => row.id === "hazard");
    expect(hazard.vintage).toMatch(/2023/);
    expect(hazard.okDetail).toMatch(/not a current fire/);
    expect(hazard.okDetail).toMatch(/not a parcel determination/);
  });

  it("keeps roads as an overlay, not a basemap in the hazard list", () => {
    expect(LAYER_INFO.map((row) => row.id)).not.toContain("roads");
    const roads = layerInfo("roads");
    expect(roads.dataset).toMatch(/overlay/i);
    expect(roads.okDetail).toMatch(/not proof of legal access/i);
    expect(roads.failDetail).toMatch(/basemap was left/i);
  });
});
