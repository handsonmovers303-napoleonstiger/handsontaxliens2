import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { planPushes } from "../server/dispatch.js";
import { saleEventsFromSource } from "../server/sales.js";

const text = fs.readFileSync(new URL("../src/legacy/ScoutingDept.jsx", import.meta.url), "utf8");
const events = saleEventsFromSource(text);
const sub = { endpoint: "https://push.example/device", keys: { p256dh: "k", auth: "a" } };

describe("push server dates", () => {
  it("reads bundled sale dates and does not invent one", () => {
    expect(events.find((e) => e.key === "CO|Mesa")).toMatchObject({ iso: "2026-10-16", level: "ON_FILE" });
    expect(events.find((e) => e.key === "IA|Polk").level).toBe("DERIVED");
    expect(events.find((e) => e.key === "CO|Routt" && e.kind === "registration").iso).toBe("2026-10-29");
    expect(events.some((e) => !e.iso)).toBe(false);
  });

  it("sends one grouped alert for a watched county and does not repeat it", () => {
    const subs = [{ subscription: sub, watch: ["CO|Mesa"], leadDays: 7, allSales: false }];
    const first = planPushes(subs, events, "2026-10-10", new Set());
    expect(first.map((j) => j.payload.title)).toEqual(["Tax sale in 6 days"]);
    expect(first[0].payload.body).toContain("Mesa");
    const again = planPushes(subs, events, "2026-10-10", new Set(first.map((j) => j.dedupe)));
    expect(again).toHaveLength(0);
  });

  it("refuses a subscription with no endpoint", () => {
    const jobs = planPushes([{ subscription: { endpoint: "http://nope" }, watch: ["CO|Mesa"], leadDays: 30, allSales: true }], events, "2026-10-10", new Set());
    expect(jobs).toHaveLength(0);
  });
});
