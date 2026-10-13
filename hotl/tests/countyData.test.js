import { describe, expect, it } from "vitest";
import { getCountyData } from "../src/holo/home/countyData.js";

describe("map county card", () => {
  it("names the county and does not invent a lien count", () => {
    const mesa = getCountyData("08077", { name: "Mesa", state: "CO", stateName: "Colorado" });
    expect(mesa.name).toBe("Mesa");
    expect(mesa.state).toBe("Colorado");
    expect(mesa.stat).toBe("Liens available: —");
    expect(getCountyData("99999", null).name).toBe("Unknown");
  });
});
