import { describe, expect, it } from "vitest";
import { createLedger } from "../src/marketplace/engine.js";
import { certificateKey } from "../src/marketplace/identity.js";
import { formatCents, indicativeBuyerCost } from "../src/marketplace/money.js";
import { publicCatalogToDraft } from "../src/marketplace/liveHandoff.js";
import { countyPolicy, proveOneCounty } from "./proveCounty.js";

const seller = { id: "seller" };
const buyer = { id: "buyer" };
const buyer2 = { id: "buyer2" };
const reviewer = { id: "reviewer" };
const reviewer2 = { id: "reviewer2" };
const provider = { id: "provider", role: "provider" };
const SECRET = "test-provider-secret-32";

function ledger() {
  const db = createLedger();
  db.setClock("2026-10-06T15:00:00.000Z");
  return db;
}

async function ok(db, actor, name, payload, opts) {
  const res = await db.command(actor, name, payload, opts);
  if (!res.ok) throw new Error(`${name} ${res.code}: ${res.message}`);
  return res;
}

async function enableFlags(db, proposer, confirmer, ref) {
  for (const key of ["listings", "solicitation", "negotiation", "transactions"]) {
    await ok(db, proposer, "proposeFlags", { legalReviewRef: ref, flags: { [key]: true } });
    await ok(db, confirmer, "confirmFlags", { key });
  }
}

async function arm(db) {
  await ok(db, reviewer, "bootstrapLocalOperator", {});
  await ok(db, reviewer2, "bootstrapLocalOperator", {});
  await enableFlags(db, reviewer, reviewer2, "LR-2026-10-06-pilot");
  await ok(db, reviewer, "savePolicy", { ...countyPolicy, enabled: true });
  await ok(db, reviewer2, "confirmPolicy", { countyFips: "04013" });
}

const buyerConfirm = { confirmCertificate: true, notTheProperty: true, confirmedNumber: "001234", confirmedYear: 2024 };
const approveChecks = { authority: true, identity: true, redemptionStatus: true, restrictions: true, encumbrance: true, countyRecord: true };
const countyRecord = (extra = {}) => ({
  sourceUrl: "https://treasurer.maricopa.gov/taxlien/001234",
  retrievedOn: "2026-10-06",
  result: "outstanding",
  certificateNumber: "001234",
  certificateYear: 2024,
  principalDollars: "1000.00",
  holder: "Ada Holder",
  ...extra,
});

const draftBody = (extra = {}) => ({
  countyFips: "04013",
  state: "AZ",
  countyName: "Maricopa",
  certificateNumber: "001234",
  certificateYear: 2024,
  instrumentType: "tax_lien_certificate",
  principalDollars: "1000.00",
  askingDollars: "900.00",
  acquiredHow: "county_sale",
  claimedHolder: "Ada Holder",
  publicNotes: "Whole certificate. Redemption status is whatever the county file says on the check date.",
  ...extra,
});

async function activeListing(db) {
  await arm(db);
  const saved = await ok(db, seller, "saveDraft", draftBody());
  const listing = saved.data.listing;
  await ok(db, seller, "uploadEvidence", { listingId: listing.id, expectedVersion: listing.version, filename: "proof.pdf", contentType: "application/pdf", byteLength: 12, bytes: "SECRETBYTES!!", note: "tax certificate" });
  const after = db.view(seller.id).listings[0];
  await ok(db, seller, "submitForReview", { listingId: listing.id, expectedVersion: after.version });
  await ok(db, reviewer, "reviewListing", {
    listingId: listing.id,
    expectedVersion: after.version,
    decision: "approve",
    checks: approveChecks,
    countyRecord: countyRecord(),
    statusCheckedOn: "2026-10-06",
    statusValidUntil: "2026-11-06",
    evidenceCoverage: "Ownership reviewed against the uploaded certificate copy.",
    notes: "Private review note: holder name matches.",
  });
  return db.view(seller.id).listings[0];
}

describe("marketplace rules", () => {
  it("keeps a private draft and hides it from the catalog", async () => {
    const db = ledger();
    const saved = await ok(db, seller, "saveDraft", draftBody());
    expect(saved.data.listing.status).toBe("draft");
    expect(saved.data.listing.certificateNumber).toBe("001234");
    const again = await ok(db, seller, "saveDraft", draftBody({ id: saved.data.listing.id, expectedVersion: 1, askingDollars: "910.00" }));
    expect(again.data.listing.askingPriceCents).toBe(91000);
    expect(db.view(buyer.id).catalog).toHaveLength(0);
    expect(db.view(buyer.id).listings).toHaveLength(0);
  });

  it("blocks self-approval, unsupported counties, missing proof, stale checks, and conflicts", async () => {
    const db = ledger();
    await ok(db, seller, "bootstrapLocalOperator", {});
    await ok(db, reviewer2, "bootstrapLocalOperator", {});
    const saved = await ok(db, seller, "saveDraft", draftBody());
    const id = saved.data.listing.id;
    let res = await db.command(seller, "submitForReview", { listingId: id, expectedVersion: 1 });
    expect(res.code).toBe("COUNTY_NOT_ENABLED");
    await ok(db, seller, "savePolicy", {
      countyFips: "04013", state: "AZ", countyName: "Maricopa",
      assignmentInstructions: "Fixture instructions for the engine test.",
      checkedOn: "2026-10-01", validUntil: "2027-01-01", legalReviewRef: "LR-1", officialHosts: ["treasurer.maricopa.gov"], enabled: true,
    });
    expect(db.view(seller.id).policies.find((p) => p.countyFips === "04013").enabled).toBe(false);
    await ok(db, reviewer2, "confirmPolicy", { countyFips: "04013" });
    res = await db.command(seller, "submitForReview", { listingId: id, expectedVersion: 1 });
    expect(res.code).toBe("FLAG_DISABLED");
    await enableFlags(db, seller, reviewer2, "LR-1");
    res = await db.command(seller, "submitForReview", { listingId: id, expectedVersion: 1 });
    expect(res.code).toBe("MISSING_PROOF");
    await ok(db, seller, "uploadEvidence", { listingId: id, expectedVersion: 1, filename: "a.pdf", contentType: "application/pdf", byteLength: 4, bytes: "abcd", note: "tax certificate" });
    await ok(db, seller, "submitForReview", { listingId: id, expectedVersion: 1 });
    res = await db.command(seller, "reviewListing", {
      listingId: id, expectedVersion: 1, decision: "approve",
      checks: { authority: true, identity: true, redemptionStatus: true, restrictions: true, encumbrance: true },
      statusCheckedOn: "2026-10-06", statusValidUntil: "2026-11-06", evidenceCoverage: "Reviewed.",
    });
    expect(res.code).toBe("SELF_APPROVAL");
    await ok(db, reviewer, "bootstrapLocalOperator", {});
    const stale = await db.command(reviewer, "reviewListing", {
      listingId: id, expectedVersion: 1, decision: "approve",
      checks: approveChecks,
      countyRecord: countyRecord(),
      statusCheckedOn: "2026-10-06", statusValidUntil: "2026-10-01", evidenceCoverage: "Reviewed.",
    });
    expect(stale.code).toBe("STALE_STATUS");
    await ok(db, reviewer, "reviewListing", {
      listingId: id, expectedVersion: 1, decision: "approve",
      checks: approveChecks,
      countyRecord: countyRecord(),
      statusCheckedOn: "2026-10-06", statusValidUntil: "2026-10-07", evidenceCoverage: "Reviewed.",
    });
    db.setClock("2026-10-08T15:00:00.000Z");
    res = await db.command(buyer, "makeOffer", { listingId: id, listingVersion: 1, amountDollars: "800", expiresAt: "2026-10-20T00:00:00.000Z" });
    expect(res.code).toBe("STALE_STATUS");
    const other = await db.command(buyer, "saveDraft", draftBody());
    expect(other.code).toBe("CONFLICTING_LISTING");
  });

  it("isolates evidence, offers, threads, and transfer cases", async () => {
    const db = ledger();
    const listing = await activeListing(db);
    const view = db.view(buyer.id);
    expect(JSON.stringify(view)).not.toContain("SECRETBYTES");
    expect(JSON.stringify(view)).not.toContain("holder name matches");
    expect(view.catalog[0].certificateNumber).toBe("001234");
    expect(view.catalog[0].ownerId).toBeUndefined();
    const thread = await ok(db, buyer, "requestInfo", { listingId: listing.id, text: "What is the redemption quote date on the county site?" });
    const peek = await db.command(buyer2, "postMessage", { threadId: thread.data.threadId, text: "I should not be here" });
    expect(peek.code).toBe("FORBIDDEN");
    expect(db.view(buyer2.id).threads).toHaveLength(0);
    expect(db.view(buyer2.id).offers).toHaveLength(0);
    expect(db.view(buyer2.id).transfers).toHaveLength(0);
  });

  it("expires buyer requests, matches real scope, and invalidates offers after edits", async () => {
    const db = ledger();
    const listing = await activeListing(db);
    const posted = await ok(db, buyer, "postRequest", {
      states: ["AZ"], countyFips: ["04013"], priceMinDollars: "100", priceMaxDollars: "1000",
      yearMin: 2024, yearMax: 2024, expiresAt: "2026-10-20T00:00:00.000Z", publicPreference: "Whole certificates only.",
    });
    expect(posted.data.matches).toHaveLength(1);
    expect(posted.data.matches[0].reasons.join(" ")).toMatch(/Maricopa/);
    const miss = await ok(db, buyer2, "postRequest", {
      states: ["FL"], priceMaxDollars: "10", yearMin: 1999, yearMax: 1999, expiresAt: "2026-10-20T00:00:00.000Z",
    });
    expect(miss.data.matches).toHaveLength(0);
    db.setClock("2026-10-21T00:00:00.000Z");
    expect(db.view(buyer.id).myRequests.find((r) => r.id === posted.data.request.id).status).toBe("expired");
    expect(db.view(buyer.id).requests.find((r) => r.id === posted.data.request.id)).toBeUndefined();
    db.setClock("2026-10-06T16:00:00.000Z");
    const offer = await ok(db, buyer, "makeOffer", { listingId: listing.id, listingVersion: listing.version, amountDollars: "850.00", expiresAt: "2026-10-18T00:00:00.000Z", ...buyerConfirm });
    await ok(db, seller, "saveDraft", draftBody({ id: listing.id, expectedVersion: listing.version, askingDollars: "950.00" }));
    const selected = await db.command(seller, "selectOffer", { offerId: offer.data.offer.id });
    expect(selected.code).toBe("OFFER_INELIGIBLE");
    expect(db.view(seller.id).offers.find((o) => o.id === offer.data.offer.id).status).toBe("outdated");
  });

  it("reserves one transfer when two buyers are selected together", async () => {
    const db = ledger();
    const listing = await activeListing(db);
    const a = await ok(db, buyer, "makeOffer", { listingId: listing.id, listingVersion: 1, amountDollars: "800", expiresAt: "2026-11-01T00:00:00.000Z", ...buyerConfirm });
    const b = await ok(db, buyer2, "makeOffer", { listingId: listing.id, listingVersion: 1, amountDollars: "810", expiresAt: "2026-11-01T00:00:00.000Z", ...buyerConfirm });
    const [r1, r2] = await Promise.all([
      db.command(seller, "selectOffer", { offerId: a.data.offer.id }),
      db.command(seller, "selectOffer", { offerId: b.data.offer.id }),
    ]);
    const wins = [r1, r2].filter((r) => r.ok);
    const losses = [r1, r2].filter((r) => !r.ok);
    expect(wins).toHaveLength(1);
    expect(losses[0].code).toBe("ALREADY_RESERVED");
    expect(db.view(reviewer.id).transfers).toHaveLength(1);
    const once = await db.command(buyer, "setPreference", { matchAlerts: true }, { idempotencyKey: "pref-1" });
    const twice = await db.command(buyer, "setPreference", { matchAlerts: false }, { idempotencyKey: "pref-1" });
    expect(once.ok).toBe(true);
    expect(twice.duplicate).toBe(true);
    expect(db.view(buyer.id).preferences.matchAlerts).toBe(true);
  });

  it("rejects forged reviewer and provider events and blocks completion without both proofs", async () => {
    const db = ledger();
    const listing = await activeListing(db);
    expect((await db.command(buyer, "reviewListing", { listingId: listing.id, decision: "approve" })).code).toBe("FORBIDDEN");
    expect((await db.command(buyer, "setFlags", { flags: { listings: false }, legalReviewRef: "nope" })).code).toBe("FORBIDDEN");
    expect((await db.command(seller, "providerEvent", { signature: "00", raw: "{}" })).code).toBe("FORBIDDEN");
    const offer = await ok(db, buyer, "makeOffer", { listingId: listing.id, listingVersion: 1, amountDollars: "875", expiresAt: "2026-11-01T00:00:00.000Z", ...buyerConfirm });
    const selected = await ok(db, seller, "selectOffer", { offerId: offer.data.offer.id });
    const transferId = selected.data.transferId;
    expect((await db.command(seller, "reviewerCheck", { transferId, check: "assignmentConfirmed", note: "I say so", officialRecordRef: "Book 1" })).code).toBe("FORBIDDEN");
    expect(db.view(seller.id).listings[0].status).toBe("transfer_pending");
    await ok(db, reviewer, "reviewerCheck", { transferId, check: "assignmentConfirmed", note: "Treasurer instrument 22 recorded.", officialRecordRef: "2026-00421" });
    expect(db.view(seller.id).listings[0].status).not.toBe("sold");
    expect(db.view(seller.id).provider.configured).toBe(false);
    expect(db.view(seller.id).transfers[0].settlementNote).toMatch(/pending/i);
  });

  it("completes only with assignment and signed settlement, and keeps redemption separate", async () => {
    const db = ledger();
    const listing = await activeListing(db);
    const offer = await ok(db, buyer, "makeOffer", { listingId: listing.id, listingVersion: 1, amountDollars: "875", expiresAt: "2026-11-01T00:00:00.000Z", ...buyerConfirm });
    const selected = await ok(db, seller, "selectOffer", { offerId: offer.data.offer.id });
    const transferId = selected.data.transferId;
    await ok(db, reviewer, "configureProvider", { name: "Test settlement desk", legalReviewRef: "LR-provider", secret: SECRET, keyId: "k1" });
    await ok(db, reviewer, "reviewerCheck", { transferId, check: "sellerAuthority", note: "Holder still of record on the treasurer site." });
    await ok(db, reviewer, "reviewerCheck", { transferId, check: "buyerEligibility", note: "Buyer registration on file with the treasurer." });
    await ok(db, reviewer, "reviewerCheck", { transferId, check: "certificateStatus", note: "Unredeemed on the treasurer site as of 2026-10-06." });
    await ok(db, reviewer, "reviewerCheck", { transferId, check: "assignmentInstructions", note: "County assignment form matches the saved policy." });
    await ok(db, reviewer, "reviewerCheck", { transferId, check: "assignmentSubmitted", note: "Package sent to the treasurer." });
    await ok(db, reviewer, "reviewerCheck", { transferId, check: "assignmentConfirmed", note: "Recorded assignment.", officialRecordRef: "2026-00421" });
    const body = { id: "evt_1", type: "funds_released", transferId, sellerId: seller.id, buyerId: buyer.id, note: "Released." };
    const signed = await db.signProvider(body);
    const applied = await ok(db, provider, "providerEvent", signed);
    expect(applied.data.duplicate).toBe(false);
    const replay = await ok(db, provider, "providerEvent", signed);
    expect(replay.data.duplicate).toBe(true);
    expect(db.view(reviewer.id).transfers).toHaveLength(1);
    expect(db.view(seller.id).listings[0].status).toBe("sold");
    expect(db.view(seller.id).transfers[0].state).toBe("reconciled");
    const stats = db.view(reviewer.id).analytics;
    expect(stats.completedSales).toBe(1);
    expect(stats.redemptions).toBe(0);
    expect(stats.priceGaps[0].differenceCents).toBe(87500 - 90000);

    const db2 = ledger();
    const listing2 = await activeListing(db2);
    const offer2 = await ok(db2, buyer, "makeOffer", { listingId: listing2.id, listingVersion: 1, amountDollars: "50", expiresAt: "2026-11-01T00:00:00.000Z", ...buyerConfirm });
    const sel2 = await ok(db2, seller, "selectOffer", { offerId: offer2.data.offer.id });
    const reported = await ok(db2, seller, "reportRedemption", { listingId: listing2.id, source: "County site payoff screen, 2026-10-06." });
    expect(reported.data.status).not.toBe("sold");
    const confirmed = await ok(db2, reviewer, "reportRedemption", { listingId: listing2.id, source: "Treasurer redemption receipt 88.", confirm: true });
    expect(confirmed.data.status).toBe("redeemed");
    expect(db2.view(reviewer.id).analytics.completedSales).toBe(0);
    expect(db2.view(reviewer.id).analytics.redemptions).toBe(1);
    expect(db2.view(seller.id).transfers.find((t) => t.id === sel2.data.transferId).state).toBe("frozen");
  });

  it("requires the buyer to confirm the certificate number before an offer", async () => {
    const db = ledger();
    const listing = await activeListing(db);
    const base = { listingId: listing.id, listingVersion: listing.version, amountDollars: "800", expiresAt: "2026-11-01T00:00:00.000Z" };
    expect((await db.command(buyer, "makeOffer", base)).code).toBe("BUYER_CONFIRMATION");
    expect((await db.command(buyer, "makeOffer", { ...base, ...buyerConfirm, confirmedNumber: "1234" })).code).toBe("BUYER_CONFIRMATION");
    const offer = await ok(db, buyer, "makeOffer", { ...base, ...buyerConfirm });
    expect(offer.data.offer.certificateNumber).toBe("001234");
  });

  it("does not treat unknown fees as zero and preserves certificate identity", () => {
    expect(certificateKey({ countyFips: "04013", certificateYear: 2024, certificateNumber: "001234" })).toBe("04013|2024|001234");
    expect(formatCents(null)).toBe("Not documented");
    const cost = indicativeBuyerCost({ askingPriceCents: 90000, countyFeeCents: null, settlementFeeCents: null, marketplaceFeeCents: null });
    expect(cost.incomplete).toBe(true);
    expect(cost.note).toMatch(/not zero/i);
    expect(cost.knownCents).toBe(90000);
  });

  it("starts with trading flags off and does not seed enabled counties", () => {
    const db = ledger();
    const view = db.view(seller.id);
    expect(view.flags.listings.enabled).toBe(false);
    expect(view.flags.solicitation.enabled).toBe(false);
    expect(view.flags.negotiation.enabled).toBe(false);
    expect(view.flags.transactions.enabled).toBe(false);
    expect(view.enabledCounties).toHaveLength(0);
    expect(view.catalog).toHaveLength(0);
    expect(view.sources.every((s) => s.note)).toBe(true);
  });

  it("turns a public catalog row into an unconfirmed draft and drops estimated value", () => {
    const mapped = publicCatalogToDraft({
      county: "Allegheny",
      state: "PA",
      apn: "0457D00065000000",
      address: "731 Greensburg Pike, North Versailles, PA",
      lienAmount: "$1,364.79",
      estimatedValue: 50600,
      sourceUrl: "https://dcr.alleghenycounty.us/",
    });
    expect(mapped.ok).toBe(true);
    expect(mapped.prefill.principalDollars).toBe("1364.79");
    expect(mapped.prefill.askingDollars).toBe("");
    expect(mapped.prefill.certificateNumber).toBe("");
    expect(JSON.stringify(mapped.prefill)).not.toContain("50600");
    expect(mapped.dropped).toContain("estimatedValue");
    expect(mapped.notice).toMatch(/not an offer of sale/i);
  });

  it("requires a matching county record from the official host", async () => {
    const db = ledger();
    await arm(db);
    const saved = await ok(db, seller, "saveDraft", draftBody());
    const listing = saved.data.listing;
    await ok(db, seller, "uploadEvidence", { listingId: listing.id, expectedVersion: listing.version, filename: "proof.pdf", contentType: "application/pdf", byteLength: 4, bytes: "abcd", note: "tax certificate" });
    await ok(db, seller, "submitForReview", { listingId: listing.id, expectedVersion: listing.version });
    const base = { listingId: listing.id, expectedVersion: listing.version, decision: "approve", checks: approveChecks, statusCheckedOn: "2026-10-06", statusValidUntil: "2026-11-06", evidenceCoverage: "Seller file compared with the county page." };
    expect((await db.command(reviewer, "reviewListing", base)).code).toBe("COUNTY_RECORD_REQUIRED");
    expect((await db.command(reviewer, "reviewListing", { ...base, countyRecord: countyRecord({ sourceUrl: "https://handsontaxliens.com/marketplace/" }) })).code).toBe("BAD_COUNTY_RECORD");
    expect((await db.command(reviewer, "reviewListing", { ...base, countyRecord: countyRecord({ sourceUrl: "https://evil.example/tax" }) })).code).toBe("BAD_COUNTY_RECORD");
    expect((await db.command(reviewer, "reviewListing", { ...base, countyRecord: countyRecord({ certificateNumber: "999999" }) })).code).toBe("COUNTY_MISMATCH");
    expect((await db.command(reviewer, "reviewListing", { ...base, countyRecord: countyRecord({ result: "not_found" }) })).code).toBe("COUNTY_RECORD_REJECTED");
    expect((await db.command(reviewer, "reviewListing", { ...base, countyRecord: countyRecord({ principalDollars: "50.00" }) })).code).toBe("COUNTY_MISMATCH");
    const approved = await ok(db, reviewer, "reviewListing", { ...base, countyRecord: countyRecord() });
    expect(approved.data.status).toBe("active");
    const buyerView = JSON.stringify(db.view(buyer.id));
    expect(buyerView).toContain("treasurer.maricopa.gov");
    expect(buyerView).toContain("not a guarantee");
    expect(buyerView).not.toContain("Ada Holder");
    expect(db.view(seller.id).listings.find((l) => l.id === listing.id).countyRecordHolder).toBe("Ada Holder");
    expect(JSON.stringify(db.view(buyer.id))).not.toContain("Ada Holder");
    const hidden = await ok(db, seller, "saveDraft", draftBody({ certificateNumber: "009999", acquiredHow: "", claimedHolder: "" }));
    const uploaded = await ok(db, seller, "uploadEvidence", { listingId: hidden.data.listing.id, expectedVersion: hidden.data.listing.version, filename: "proof.pdf", contentType: "application/pdf", byteLength: 4, bytes: "abcd", note: "tax certificate" });
    expect((await db.command(seller, "submitForReview", { listingId: hidden.data.listing.id, expectedVersion: uploaded.data.listingVersion })).code).toBe("MISSING_PROOF");
    const claimed = await ok(db, seller, "saveDraft", { id: hidden.data.listing.id, expectedVersion: uploaded.data.listingVersion, ...draftBody({ certificateNumber: "009999" }) });
    await ok(db, seller, "submitForReview", { listingId: claimed.data.listing.id, expectedVersion: claimed.data.listing.version });
    expect((await db.command(reviewer, "reviewListing", { ...base, listingId: claimed.data.listing.id, expectedVersion: claimed.data.listing.version, countyRecord: countyRecord({ certificateNumber: "009999", holder: "Not Ada" }) })).code).toBe("HOLDER_MISMATCH");
    expect(db.view(buyer.id).catalog.find((row) => row.certificateNumber === "009999")).toBeUndefined();
  });

  it("keeps a member account from approving a listing or turning trading on", async () => {
    const db = createLedger();
    db.setAudience("member");
    db.setClock("2026-10-06T15:00:00.000Z");
    const saved = await ok(db, seller, "saveDraft", draftBody());
    expect(saved.data.listing.status).toBe("draft");
    expect((await db.command(seller, "bootstrapLocalOperator", {})).code).toBe("MEMBER_COPY");
    expect((await db.command(seller, "setFlags", { legalReviewRef: "LR", flags: { listings: true } })).code).toBe("MEMBER_COPY");
    expect((await db.command(seller, "proposeFlags", { legalReviewRef: "LR", flags: { listings: true } })).code).toBe("MEMBER_COPY");
    expect((await db.command(seller, "confirmFlags", { key: "listings" })).code).toBe("MEMBER_COPY");
    expect((await db.command(seller, "savePolicy", { ...countyPolicy, enabled: true })).code).toBe("MEMBER_COPY");
    expect((await db.command(seller, "confirmPolicy", { countyFips: "04013" })).code).toBe("MEMBER_COPY");
    expect((await db.command(reviewer, "reviewListing", { listingId: saved.data.listing.id, expectedVersion: 1, decision: "approve", checks: approveChecks })).code).toBe("MEMBER_COPY");
    expect(db.view(seller.id).catalog).toHaveLength(0);
  });

  it("requires a second reviewer to turn on a flag or a county", async () => {
    const db = ledger();
    await ok(db, reviewer, "bootstrapLocalOperator", {});
    expect((await db.command(reviewer, "setFlags", { legalReviewRef: "LR", flags: { listings: true } })).code).toBe("SECOND_REVIEWER_REQUIRED");
    expect(db.view(reviewer.id).flags.listings.enabled).toBe(false);
    await ok(db, reviewer, "proposeFlags", { legalReviewRef: "LR", flags: { listings: true } });
    expect((await db.command(reviewer, "confirmFlags", { key: "listings" })).code).toBe("SECOND_REVIEWER_REQUIRED");
    expect((await db.command(seller, "confirmFlags", { key: "listings" })).code).toBe("FORBIDDEN");
    await ok(db, reviewer2, "bootstrapLocalOperator", {});
    await ok(db, reviewer2, "confirmFlags", { key: "listings" });
    const flags = db.view(reviewer.id).flags;
    expect(flags.listings.enabled).toBe(true);
    expect(flags.solicitation.enabled).toBe(false);
    expect(flags.negotiation.enabled).toBe(false);
    expect(flags.transactions.enabled).toBe(false);
    expect((await db.command(seller, "confirmPolicy", { countyFips: "04013" })).code).toBe("FORBIDDEN");
  });

  it("lists one fixture certificate only after the county and the listings flag are confirmed", async () => {
    const db = ledger();
    await ok(db, reviewer, "bootstrapLocalOperator", {});
    await ok(db, reviewer2, "bootstrapLocalOperator", {});
    await proveOneCounty(db);
  });
});
