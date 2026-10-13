import { expect } from "vitest";

const seller = { id: "seller" };
const buyer = { id: "buyer" };
const reviewerA = { id: "reviewer" };
const reviewerB = { id: "reviewer2" };

export const countyPolicy = {
  countyFips: "04013",
  state: "AZ",
  countyName: "Maricopa",
  assignmentInstructions: "Fixture for the rule engine, not a live county approval. Assign the whole certificate on the treasurer's form and record it with the county.",
  buyerRegistration: "Buyer must be registered with the treasurer before assignment.",
  checkedOn: "2026-10-01",
  validUntil: "2027-04-01",
  legalReviewRef: "LR-2026-10-06-maricopa",
  officialHosts: ["treasurer.maricopa.gov"],
  limitations: "Whole certificates only.",
  forms: [{ name: "Assignment", url: "https://example.invalid/assignment" }],
};

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

const approve = {
  decision: "approve",
  checks: { authority: true, identity: true, redemptionStatus: true, restrictions: true, encumbrance: true, countyRecord: true },
  statusCheckedOn: "2026-10-06",
  statusValidUntil: "2026-11-06",
  evidenceCoverage: "Seller file is the certificate copy. The county page is the record.",
  notes: "Fixture review.",
};

async function ok(db, actor, name, payload) {
  const res = await db.command(actor, name, payload);
  if (!res.ok) throw new Error(`${name} ${res.code}: ${res.message}`);
  return res;
}

/** Step 2 walk. Reviewers must already be assigned. Listings is the only flag turned on. */
export async function proveOneCounty(db) {
  const saved = await ok(db, seller, "saveDraft", draftBody());
  const listing = saved.data.listing;
  await ok(db, seller, "uploadEvidence", {
    listingId: listing.id, expectedVersion: 1, filename: "proof.pdf", contentType: "application/pdf", byteLength: 12, bytes: "SECRETBYTES!!", note: "tax certificate",
  });
  await ok(db, reviewerA, "savePolicy", { ...countyPolicy, enabled: true });
  expect(db.view(reviewerA.id).policies.find((p) => p.countyFips === "04013").enabled).toBe(false);
  let res = await db.command(seller, "submitForReview", { listingId: listing.id, expectedVersion: 1 });
  expect(res.code).toBe("COUNTY_NOT_ENABLED");
  expect((await db.command(reviewerA, "confirmPolicy", { countyFips: "04013" })).code).toBe("SECOND_REVIEWER_REQUIRED");
  await ok(db, reviewerB, "confirmPolicy", { countyFips: "04013" });
  res = await db.command(seller, "submitForReview", { listingId: listing.id, expectedVersion: 1 });
  expect(res.code).toBe("FLAG_DISABLED");
  await ok(db, reviewerA, "proposeFlags", { legalReviewRef: "LR-listings", flags: { listings: true } });
  await ok(db, reviewerB, "confirmFlags", { key: "listings" });
  const submitted = await ok(db, seller, "submitForReview", { listingId: listing.id, expectedVersion: 1 });
  expect(submitted.data.listing.status).toBe("in_review");
  expect(db.view(buyer.id).catalog).toHaveLength(0);
  res = await db.command(reviewerB, "reviewListing", { ...approve, listingId: listing.id, expectedVersion: 1, countyRecord: countyRecord() });
  expect(res.code).toBe("POLICY_CONFIRMER");
  res = await db.command(reviewerA, "reviewListing", { ...approve, listingId: listing.id, expectedVersion: 1, countyRecord: countyRecord({ sourceUrl: "https://handsontaxliens.com/marketplace/" }) });
  expect(res.code).toBe("BAD_COUNTY_RECORD");
  const approved = await ok(db, reviewerA, "reviewListing", { ...approve, listingId: listing.id, expectedVersion: 1, countyRecord: countyRecord() });
  expect(approved.data.status).toBe("active");
  expect(db.view(buyer.id).catalog[0].countyRecord.sourceUrl).toBe("https://treasurer.maricopa.gov/taxlien/001234");
  res = await db.command(buyer, "makeOffer", {
    listingId: listing.id, listingVersion: 1, amountDollars: "800", expiresAt: "2026-10-20T00:00:00.000Z",
    confirmCertificate: true, notTheProperty: true, confirmedNumber: "001234", confirmedYear: 2024,
  });
  expect(res.code).toBe("FLAG_DISABLED");
  res = await db.command(seller, "saveDraft", draftBody({ instrumentType: "tax_deed", certificateNumber: "009999" }));
  expect(res.code).toBe("BAD_INSTRUMENT");
  const flags = db.view(reviewerA.id).flags;
  expect(flags.listings.enabled).toBe(true);
  expect(flags.solicitation.enabled).toBe(false);
  expect(flags.negotiation.enabled).toBe(false);
  expect(flags.transactions.enabled).toBe(false);
}
