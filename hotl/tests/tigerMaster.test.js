import { describe, expect, it } from "vitest";
import { tigerLines } from "../src/holo/tigerMaster.js";

describe("Tiger baseline", () => {
  it("leaves an unknown county blank", () => {
    const line = tigerLines("99999");
    expect(line.present).toBe(false);
    expect(line.chip).toBeNull();
    expect(line.reason).toBeNull();
  });

  it("does not treat Tiger's baseline as the seven research checks", () => {
    const mesa = tigerLines("08077");
    expect(mesa.present).toBe(true);
    expect(mesa.chip).toBe("Done by Tiger");
    expect(mesa.url).toMatch(/^https:\/\/mcgis\.mesacounty\.us\//);
    expect(mesa.stateRuleUrl).toMatch(/^https:\/\//);
    expect(mesa.note).toMatch(/does not complete the seven research checks/);
    expect(mesa.note).not.toMatch(/verified/i);
    expect(mesa.stateInterest).toMatch(/13%/);
  });

  it("keeps an empty sale and a shared state page from being called done", () => {
    const teton = tigerLines("56039");
    expect(teton.chip).toBe("List empty · Tiger");
    expect(teton.found).toBe(false);
    expect(teton.reason).toMatch(/August 5, 2026/);
    const alaska = tigerLines("02013");
    expect(alaska.shared).toBe(true);
    expect(alaska.chip).toBe("State route by Tiger");
    expect(alaska.chip).not.toBe("Done by Tiger");
  });
});
