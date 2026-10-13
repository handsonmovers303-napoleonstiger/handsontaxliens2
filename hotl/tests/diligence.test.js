import { describe, expect, test } from "vitest";
import { commandOrder, countyProgress, draftFromTeam, greeting, saveEvidence, titleStanding } from "../src/holo/diligence.js";

const now = Date.parse("2026-10-07T16:00:00Z");
const at = "2026-10-07T16:00:00.000Z";

function book(codes, extra = {}) {
  const evidence = {};
  for (const code of codes) evidence[code] = [{ url: "https://www.mesacounty.us/sale", seen: "2026-10-07", date: code.includes("date") || code.includes("deadline") ? "2026-10-16" : null, at }];
  return { ...evidence, ...extra };
}
const SEVEN = ["official_source", "sale_type", "auction_rules", "registration_rules", "redemption_rules", "auction_date", "inventory_source"];

describe("county evidence", () => {
  test("opening a county only discovers it", () => {
    expect(countyProgress({ now }).state).toBe("UNEXPLORED");
    expect(countyProgress({ viewed: true, now }).state).toBe("DISCOVERED");
  });

  test("one save is researching, 1 of 7, and a team link is not a save", () => {
    expect(draftFromTeam({ url: "https://www.mesacounty.us/departments-and-services/treasurer/bidding-information", note: "Treasurer" }).ok).toBe(true);
    expect(draftFromTeam({ url: "" }).ok).toBe(false);
    const saved = saveEvidence({}, "official_source", { url: "https://www.mesacounty.us/departments-and-services/treasurer/bidding-information", seen: "2026-10-07", note: "Treasurer" }, new Date(at));
    const p = countyProgress({ evidence: saved.evidence, viewed: true, now, today: "2026-10-07" });
    expect(p.state).toBe("RESEARCHING");
    expect(p.done).toBe(1);
    expect(p.total).toBe(7);
  });

  test("stale evidence drops verified and auction ready", () => {
    const fresh = countyProgress({ evidence: book(SEVEN), now, today: "2026-10-07" });
    expect(fresh.state).toBe("VERIFIED");
    expect(fresh.ready).toBe(false);
    const old = book(SEVEN);
    old.official_source = [{ url: "https://www.mesacounty.us/sale", seen: "2025-01-01", at: "2025-01-01T00:00:00.000Z" }];
    expect(countyProgress({ evidence: old, now, today: "2026-10-07" }).state).toBe("RESEARCHING");
  });

  test("auction ready needs the deadline and the current list", () => {
    const evidence = book(SEVEN);
    evidence.registration_deadline = [{ url: "https://www.mesacounty.us/sale", seen: "2026-10-07", date: "2026-10-10", at }];
    evidence.current_inventory = [{ url: "https://www.mesacounty.us/list", seen: "2026-10-07", date: null, at }];
    const p = countyProgress({ evidence, now, today: "2026-10-07" });
    expect(p.gatesDone).toBe(2);
    expect(p.state).toBe("AUCTION_READY");
  });

  test("a nearer sale outranks a higher score", () => {
    const rows = commandOrder(
      [{ name: "Woodbury", days: 200, score: 76.5, key: "IA|Woodbury" }, { name: "Mesa", days: 9, score: 65.8, key: "CO|Mesa" }],
      () => ({}),
      () => false,
      now,
    );
    expect(rows.map((r) => r.name)).toEqual(["Mesa", "Woodbury"]);
  });

  test("the greeting uses the viewer's hour", () => {
    expect(greeting(new Date(2026, 9, 7, 9, 38))).toBe("Good morning");
    expect(greeting(new Date(2026, 9, 7, 16, 38))).toBe("Good afternoon");
  });

  test("auction mode accepts checked or skipped, not untouched", () => {
    expect(titleStanding({}, false)).toBe("untouched");
    expect(titleStanding({}, true)).toBe("skipped");
    expect(titleStanding({ recorder: { result: "none" } }, false)).toBe("checked");
  });
});
