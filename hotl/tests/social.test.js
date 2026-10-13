import { describe, expect, it } from "vitest";
import { SOCIAL_CHECKS, buildCaption } from "../src/holo/socialCopy.js";

describe("social checklist", () => {
  it("keeps a blank county out of the caption and does not promise a result", () => {
    const text = buildCaption({ county: "", year: "", listed: false });
    expect(text).not.toMatch(/Maricopa|guaranteed|buyer waiting/i);
    expect(text).toMatch(/Not listed until a county check/);
    expect(text).toMatch(/not the property/);
  });

  it("names a county only when one is typed, and only calls it listed when checked", () => {
    expect(buildCaption({ county: "Maricopa", year: "2024", listed: true })).toMatch(/Maricopa, 2024/);
    expect(buildCaption({ county: "Maricopa", year: "2024", listed: true })).toMatch(/after a county check/);
    expect(SOCIAL_CHECKS.some((item) => item[0] === "no-name")).toBe(true);
  });
});
