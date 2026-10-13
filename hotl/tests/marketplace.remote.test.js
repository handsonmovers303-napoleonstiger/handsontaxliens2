import { describe, expect, it } from "vitest";
import { createLedger } from "../src/marketplace/engine.js";
import { createRemoteMarket } from "../src/marketplace/remote.js";
import { countyPolicy, proveOneCounty } from "./proveCounty.js";

const seller = { id: "seller" };
const reviewer = { id: "reviewer" };
const reviewer2 = { id: "reviewer2" };

function localLedger() {
  const db = createLedger();
  db.setClock("2026-10-06T15:00:00.000Z");
  return db;
}

async function ok(db, actor, name, payload) {
  const res = await db.command(actor, name, payload);
  if (!res.ok) throw new Error(`${name} ${res.code}: ${res.message}`);
  return res;
}

describe("marketplace remote dispatch", () => {
  it("matches the local county walk and keeps governance off the member account", async () => {
    const local = localLedger();
    await ok(local, reviewer, "bootstrapLocalOperator", {});
    await ok(local, reviewer2, "bootstrapLocalOperator", {});
    await proveOneCounty(local);

    const remote = createRemoteMarket({ roles: { reviewer: ["reviewer"], reviewer2: ["reviewer"] } });
    expect((await remote.command(reviewer, "bootstrapLocalOperator", {})).code).toBe("FORBIDDEN");
    expect((await remote.command(seller, "proposeFlags", { legalReviewRef: "LR", flags: { listings: true } })).code).toBe("MEMBER_COPY");
    expect((await remote.command(seller, "confirmFlags", { key: "listings" })).code).toBe("MEMBER_COPY");
    expect((await remote.command(seller, "savePolicy", { ...countyPolicy, enabled: true })).code).toBe("MEMBER_COPY");
    expect((await remote.command(seller, "confirmPolicy", { countyFips: "04013" })).code).toBe("MEMBER_COPY");
    expect((await remote.command(seller, "reviewListing", { listingId: "missing", decision: "approve" })).code).toBe("MEMBER_COPY");
    await proveOneCounty(remote);

    const saved = remote.snapshot();
    const listed = saved.listings.find((row) => row.status === "active");
    expect(listed.ownerId).toBe("seller");
    expect(listed.countyRecord.sourceUrl).toBe("https://treasurer.maricopa.gov/taxlien/001234");
    expect(saved.mode).toBe("remote");
    expect(saved.flags.solicitation.enabled).toBe(false);
    expect(saved.flags.negotiation.enabled).toBe(false);
    expect(saved.flags.transactions.enabled).toBe(false);
    if (typeof localStorage !== "undefined") {
      expect(localStorage.getItem("hotl:market:ledger:v1")).toBeNull();
      expect(localStorage.getItem("hotl:market:member:seller")).toBeNull();
    }
  });
});
