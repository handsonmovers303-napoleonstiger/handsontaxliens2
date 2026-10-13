import { describe, expect, it } from "vitest";
import { allCounties, countyDbMeta } from "../src/holo/data.js";
import { countyMarketLines, marketFor } from "../src/holo/countyMarket.js";

describe("county market scrape", () => {
  it("reads Mesa from Census and FEMA and does not call it a parcel fact", () => {
    const m = marketFor("08077");
    expect(m.pop).toBeGreaterThan(140000);
    expect(m.pop).toBeLessThan(200000);
    expect(m.metro).toBe("metro");
    expect(m.metroName).toMatch(/Grand Junction/);
    expect(m.medianValue).toBeGreaterThan(100000);
    expect(m.coastalFlood).toBe("Not Applicable");
    const lines = countyMarketLines("8077");
    expect(lines.population).toMatch(/Census Bureau population estimates/);
    expect(lines.growth).toMatch(/April 1, 2020/);
    expect(lines.metro).toMatch(/Grand Junction/);
    expect(lines.flood).toMatch(/not a parcel flood zone/);
    expect(lines.wildfire).toMatch(/not a parcel/);
    expect(lines.median).toMatch(/Not a parcel value/);
    expect(lines.vacancy).toMatch(/Not a parcel occupancy check/);
  });

  it("covers every county in the national table", () => {
    const missing = allCounties().filter((c) => !countyMarketLines(c.fips).population);
    expect(missing.map((c) => `${c.fips} ${c.name}`)).toEqual([]);
  });

  it("keeps the retired Connecticut counties on the 2020 base and does not borrow a planning region", () => {
    const lines = countyMarketLines("09001");
    expect(lines.population).toMatch(/April 1, 2020/);
    expect(lines.population).not.toMatch(/July 1, 2024/);
    expect(lines.note).toMatch(/retired this county code/);
    expect(lines.growth).toBeNull();
    expect(lines.median).toBeNull();
    expect(lines.flood).toBeNull();
    expect(countyDbMeta("Mesa", "CO").terrain).toBe("mountain");
  });

  it("does not invent a median the ACS table did not publish", () => {
    const lines = countyMarketLines("15005");
    expect(lines.median).toBeNull();
    expect(lines.note).toMatch(/did not publish a median/);
  });

  it("leaves an unknown county empty", () => {
    expect(marketFor("00000")).toBeNull();
    expect(countyMarketLines("99999").median).toBeNull();
  });
});
