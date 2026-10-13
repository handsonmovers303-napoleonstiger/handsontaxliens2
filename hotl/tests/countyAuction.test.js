import { describe, expect, it } from "vitest";
import { auctionLines } from "../src/holo/countyAuction.js";

describe("county auction page fetch", () => {
  it("leaves an unknown county blank", () => {
    const lines = auctionLines("99999");
    expect(lines.fetched).toBe(false);
    expect(lines.platform).toBeNull();
    expect(lines.deposit).toBeNull();
    expect(lines.note).toBeNull();
  });

  it("copies the Mesa sale date from the treasurer page and does not call it verified", () => {
    const lines = auctionLines("08077");
    expect(lines.fetched).toBe(true);
    expect(lines.saleDate).toMatch(/October 16, 2026/);
    expect(lines.saleIso).toBe("2026-10-16");
    expect(lines.note).toMatch(/Not a reading/);
    expect(lines.note).not.toMatch(/verified/i);
    expect(lines.url).toMatch(/mesacounty\.us/);
  });
});