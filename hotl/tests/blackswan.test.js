import { describe, expect, test } from "vitest";
import { CASES, invariants } from "../src/quantum/blackswan";

describe("Black Swan Protocol", () => {
  for (const c of CASES) {
    test(`${c.id} ${c.name} — ${c.rule}`, () => {
      const [pass, r, detail] = c.run();
      if (r) expect(invariants(r), detail).toEqual([]);
      expect(pass, detail).toBe(true);
    });
  }
});
