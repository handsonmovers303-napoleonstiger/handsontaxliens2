import { describe, expect, it } from "vitest";
import { alertCopy, presentAlerts, salePushPayload, upcomingAlerts } from "../src/holo/saleAlerts.js";

const sale = (extra) => ({ id: "1", kind: "sale", key: "CO|Mesa", name: "Mesa", state: "CO", iso: "2026-10-16", level: "ON_FILE", ...extra });

describe("sale alerts", () => {
  it("alerts only inside the lead window for watched counties", () => {
    const events = [
      sale({}),
      sale({ id: "2", key: "CO|Delta", name: "Delta", iso: "2026-11-05" }),
      sale({ id: "3", key: "AZ|Maricopa", name: "Maricopa", state: "AZ", iso: "2027-02-01" }),
    ];
    const got = upcomingAlerts(events, { today: "2026-10-10", leadDays: 7, watch: ["CO|Mesa"], allSales: false });
    expect(got.map((e) => e.key)).toEqual(["CO|Mesa"]);
    expect(got[0].days).toBe(6);
  });

  it("does not invent a date or alert a past sale", () => {
    const got = upcomingAlerts([sale({ iso: "2026-10-01" }), { kind: "sale", key: "XX|Nope", name: "Nope", state: "XX", iso: "" }], { today: "2026-10-10", leadDays: 30, watch: ["CO|Mesa", "XX|Nope"], allSales: true });
    expect(got).toHaveLength(0);
  });

  it("folds a derived same-day cycle into one alert", () => {
    const events = ["Adair", "Adams", "Allamakee", "Appanoose"].map((name, i) => sale({ id: String(i), key: `IA|${name}`, name, state: "IA", iso: "2027-06-21", level: "DERIVED" }));
    const shown = presentAlerts(upcomingAlerts(events, { today: "2027-06-01", leadDays: 30, watch: [], allSales: true }));
    expect(shown).toHaveLength(1);
    expect(shown[0].name).toMatch(/4 IA counties/);
    expect(alertCopy(shown[0]).body).toMatch(/Derived/);
    const payload = salePushPayload(shown[0], "/handsontaxliens/");
    expect(payload.type).toBe("SHOW");
    expect(payload.url).toBe("/handsontaxliens/#/calendar");
    expect(payload.tag).toBe(shown[0].id);
  });
});
