/**
 * Secondary-market rules for whole tax-lien certificates.
 * This module is the behavioral spec. Supabase functions in
 * supabase/migrations/20261006120000_marketplace.sql enforce the same
 * transitions on the server. The browser never grants roles.
 *
 * Trading flags start off. A statute citation is not a county approval.
 * Unknown money stays null. Reviewers cannot approve their own listings.
 * Members cannot confirm county records or provider funds.
 */
import { dollarsToCents, formatCents, indicativeBuyerCost, priceVersus } from "./money.js";
import { INSTRUMENT, certificateKey, requireCertNumber, requireFips, requireInstrument, requireYear } from "./identity.js";

const LIVE = new Set(["in_review", "active", "paused", "transfer_pending"]);
const FLAG_KEYS = ["listings", "solicitation", "negotiation", "transactions"];
const MAX_FILE = 1_500_000;
const ALLOWED_TYPES = new Set(["application/pdf", "image/png", "image/jpeg", "image/webp"]);

export const RESEARCH_SOURCES = [
  {
    id: "ars-42-18118",
    title: "Arizona A.R.S. 42-18118",
    url: "https://www.azleg.gov/ars/42/18118.htm",
    note: "Describes certificate assignment and county recording. A state statute is a research starting point, not an enabled county and not a HOTL trading approval.",
  },
  {
    id: "fl-197-462",
    title: "Florida section 197.462 (2026)",
    url: "https://www.flsenate.gov/Laws/Statutes/2026/0197.462",
    note: "Describes transfers before redemption or a tax deed, and tax-collector recording. Not an enabled county.",
  },
  {
    id: "arapahoe-assignment",
    title: "Arapahoe County, Colorado — tax lien sale information",
    url: "https://www.arapahoeco.gov/your_county/county_departments/treasurer/tax_lien_sale/tax_lien_sale_information.php",
    note: "Describes buyer registration before that county processes an assignment. One county page does not enable Colorado, and an auction deposit is not a secondary-transfer deposit.",
  },
  {
    id: "sec-broker-dealers",
    title: "SEC — Broker-dealers",
    url: "https://www.sec.gov/resources-small-businesses/capital-raising-building-blocks/broker-dealers",
    note: "Activities can require broker-dealer registration when securities are involved. Not a determination about any HOTL certificate or this membership.",
  },
  {
    id: "stripe-restricted",
    title: "Stripe restricted businesses",
    url: "https://stripe.com/legal/restricted-businesses",
    note: "Financial-service activities can require Stripe review. Subscription checkout is not asset settlement.",
  },
];

const offFlag = () => ({ enabled: false, legalReviewRef: null, updatedAt: null, updatedBy: null, pending: null, confirmedBy: null });

export function blankState() {
  return {
    mode: "local",
    audience: "review",
    clock: null,
    seq: 1,
    flags: { listings: offFlag(), solicitation: offFlag(), negotiation: offFlag(), transactions: offFlag() },
    provider: { configured: false, name: null, keyId: null },
    roles: {},
    policies: [],
    holdings: [],
    listings: [],
    evidence: [],
    reviews: [],
    requests: [],
    offers: [],
    transfers: [],
    events: [],
    watches: [],
    threads: [],
    messages: [],
    reports: [],
    notifications: [],
    preferences: {},
    countyRequests: [],
    idempotency: {},
    audit: [],
    rate: {},
  };
}

function clone(v) { return JSON.parse(JSON.stringify(v)); }

export function createLedger(initial) {
  const state = blankState();
  if (initial) Object.assign(state, clone(initial), { flags: { ...blankState().flags, ...(initial.flags || {}) } });
  const secrets = new Map();
  let chain = Promise.resolve();

  const tx = (fn) => {
    const run = chain.then(() => fn());
    chain = run.then(() => {}, () => {});
    return run;
  };

  function now() { return state.clock ? new Date(state.clock) : new Date(); }
  function today() { return now().toISOString().slice(0, 10); }
  function nid(prefix) { state.seq += 1; return `${prefix}_${state.seq}`; }
  function reviewer(id) { return (state.roles[id] || []).includes("reviewer"); }
  function audit(actorId, action, detail) {
    state.audit.push({ id: nid("aud"), at: now().toISOString(), actorId, action, detail });
  }
  function notify(userId, kind, text, ref) {
    state.notifications.push({ id: nid("nt"), userId, kind, text, ref: ref || null, at: now().toISOString(), readAt: null });
  }
  function policyFor(fips) { return state.policies.find((p) => p.countyFips === fips) || null; }
  function listingById(id) { return state.listings.find((l) => l.id === id) || null; }
  const BLOCKED_HOSTS = new Set(["handsontaxliens.com", "www.handsontaxliens.com", "members.handsontaxliens.com"]);
  function hostOf(url) {
    let parsed;
    try { parsed = new URL(String(url || "").trim()); } catch { fail("BAD_COUNTY_RECORD", "County record URL must be a full https link on the county's own site."); }
    if (parsed.protocol !== "https:") fail("BAD_COUNTY_RECORD", "County record URL must use https.");
    const host = parsed.hostname.toLowerCase().replace(/\.$/, "");
    if (!host || host === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(host)) fail("BAD_COUNTY_RECORD", "That host is not a county site.");
    if (BLOCKED_HOSTS.has(host) || host.endsWith(".handsontaxliens.com")) fail("BAD_COUNTY_RECORD", "The HOTL site is not a county record. Open the county's own site.");
    return host;
  }
  function normalizeHosts(value) {
    const list = Array.isArray(value) ? value : String(value || "").split(/[\s,]+/);
    const hosts = [];
    for (const raw of list) {
      const s = String(raw || "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/\.$/, "");
      if (!s) continue;
      if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(s)) fail("POLICY_INCOMPLETE", "Official county host must be a domain, not a path or a label.");
      if (BLOCKED_HOSTS.has(s) || s.endsWith(".handsontaxliens.com")) fail("POLICY_INCOMPLETE", "handsontaxliens.com cannot be the official county host.");
      hosts.push(s);
    }
    return Array.from(new Set(hosts)).slice(0, 4);
  }
  function looseName(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  }
  function claimHow(value, previous) {
    if (value == null || value === "") return previous || null;
    if (value !== "county_sale" && value !== "later_assignment") fail("MISSING_PROOF", "Say whether you bought this at the county sale or from a later holder.");
    return value;
  }
  function claimHolder(value, previous) {
    if (value == null) return previous || null;
    if (value === "") return null;
    return cleanText(value, 160, "Holder name");
  }
  function hostAllowed(host, allowed) {
    return allowed.some((a) => host === a || host.endsWith(`.${a}`));
  }
  function publicCountyRecord(record) {
    if (!record) return null;
    const resultLabel = { outstanding: "outstanding", redeemed: "redeemed", assigned: "already assigned", not_found: "not found" }[record.result] || record.result;
    return {
      host: record.host,
      sourceUrl: record.sourceUrl,
      retrievedOn: record.retrievedOn,
      result: record.result,
      note: `Retrieved from ${record.host} on ${record.retrievedOn}. County result: ${resultLabel}. This is not a guarantee the lien is still outstanding.`,
    };
  }
  function acceptCountyRecord(listing, input) {
    if (!input || typeof input !== "object") fail("COUNTY_RECORD_REQUIRED", "Approval requires a county record retrieved from the county's official host. The seller's file does not satisfy this.");
    const allowed = policyFor(listing.countyFips)?.officialHosts || [];
    if (!allowed.length) fail("POLICY_INCOMPLETE", "This county has no official host on file. Add it before review.");
    const sourceUrl = String(input.sourceUrl || "").trim();
    const host = hostOf(sourceUrl);
    if (!hostAllowed(host, allowed)) fail("BAD_COUNTY_RECORD", `That host is not the official host for this county. Use ${allowed.join(" or ")}.`);
    const retrievedOn = requireDate(input.retrievedOn, "County retrieval date");
    if (retrievedOn > today()) fail("BAD_DATE", "County retrieval date cannot be in the future.");
    const result = String(input.result || "");
    if (!["outstanding", "redeemed", "assigned", "not_found"].includes(result)) fail("BAD_COUNTY_RECORD", "County result must be outstanding, redeemed, assigned, or not found.");
    if (result !== "outstanding") fail("COUNTY_RECORD_REJECTED", "The county record is not an outstanding certificate. Do not approve it.");
    const certificateNumber = requireCertNumber(input.certificateNumber);
    if (certificateNumber !== listing.certificateNumber) fail("COUNTY_MISMATCH", "Certificate number on the county record does not match the listing. Leading zeros count.");
    const certificateYear = requireYear(input.certificateYear);
    if (certificateYear !== listing.certificateYear) fail("COUNTY_MISMATCH", "Certificate year on the county record does not match the listing.");
    const apnShown = !(input.apnShown === false || String(input.apn || "").trim() === "");
    const apn = apnShown ? cleanText(input.apn, 64, "County APN") : "";
    if (apnShown && listing.apn && apn !== listing.apn) fail("COUNTY_MISMATCH", "Parcel on the county record does not match the listing.");
    let principalCents = null;
    const amountShown = !(input.amountShown === false || input.principalDollars == null || input.principalDollars === "");
    if (amountShown) {
      principalCents = dollarsToCents(input.principalDollars);
      if (principalCents !== listing.principalCents) fail("COUNTY_MISMATCH", "Amount on the county record does not match the documented principal.");
    }
    const holderShown = !(input.holderShown === false || String(input.holder || "").trim() === "");
    const holder = holderShown ? cleanText(input.holder, 160, "Holder shown on the county record") : "";
    if (holderShown && listing.claimedHolder && looseName(holder) !== looseName(listing.claimedHolder)) {
      fail("HOLDER_MISMATCH", "The holder on the county page does not match the name the seller says is on the certificate. Do not approve.");
    }
    return { host, sourceUrl, retrievedOn, result, certificateNumber, certificateYear, apn: apn || null, apnShown, principalCents, amountShown, holder: holder || null, holderShown };
  }
  function expiredCheck(listing) {
    return !!(listing && listing.statusValidUntil && today() > listing.statusValidUntil);
  }
  function flagOn(key) { return !!state.flags[key]?.enabled; }

  function bumpRate(actorId) {
    const t = now().getTime();
    const bucket = (state.rate[actorId] || []).filter((x) => t - x < 60_000);
    if (bucket.length >= 120) {
      const err = new Error("Too many marketplace actions in a short time. Wait a minute and try again.");
      err.code = "RATE_LIMIT";
      throw err;
    }
    bucket.push(t);
    state.rate[actorId] = bucket;
  }

  function publicListing(listing) {
    const policy = policyFor(listing.countyFips);
    const countyFee = policy && policy.fees ? policy.fees.assignmentCents : null;
    const settlement = state.provider.configured ? listing.settlementFeeCents ?? null : null;
    return {
      id: listing.id,
      countyFips: listing.countyFips,
      state: listing.state,
      countyName: listing.countyName,
      certificateNumber: listing.certificateNumber,
      certificateYear: listing.certificateYear,
      instrumentType: listing.instrumentType,
      askingPriceCents: listing.askingPriceCents,
      principalCents: listing.principalCents,
      originalPremiumCents: listing.originalPremiumCents,
      apn: listing.apn,
      address: listing.address,
      publicNotes: listing.publicNotes,
      statutoryTerms: listing.statutoryTerms,
      redemptionQuoteCents: listing.redemptionQuoteCents,
      redemptionQuoteDate: listing.redemptionQuoteDate,
      statusCheckedOn: listing.statusCheckedOn,
      statusValidUntil: listing.statusValidUntil,
      statusCheckExpired: expiredCheck(listing),
      ownershipReviewed: listing.ownershipReview === "approved",
      ownershipReviewedOn: listing.ownershipReviewedOn,
      evidenceCoverage: listing.evidenceCoverage,
      countyRecord: publicCountyRecord(listing.countyRecord),
      transferRequirements: policy ? policy.assignmentInstructions : null,
      buyerRegistration: policy ? policy.buyerRegistration : null,
      limitations: policy ? policy.limitations : null,
      forms: policy ? policy.forms : [],
      policyCheckedOn: policy ? policy.checkedOn : null,
      policyValidUntil: policy ? policy.validUntil : null,
      countyFeeCents: countyFee,
      settlementFeeCents: settlement,
      marketplaceFeeCents: null,
      marketplaceFeeNote: "No marketplace fee is enabled. A percentage of the price needs its own reviewed model before it can be charged.",
      sample: !!listing.sample,
      version: listing.version,
      status: listing.status,
      versusPrincipal: priceVersus(listing.askingPriceCents, listing.principalCents, "documented certificate principal"),
      versusPremium: priceVersus(listing.askingPriceCents, listing.originalPremiumCents, "original auction premium"),
      versusQuote: priceVersus(listing.askingPriceCents, listing.redemptionQuoteCents, `redemption quote dated ${listing.redemptionQuoteDate || "unknown"}`),
      buyerCost: indicativeBuyerCost({
        askingPriceCents: listing.askingPriceCents,
        countyFeeCents: countyFee,
        settlementFeeCents: settlement,
        marketplaceFeeCents: null,
      }),
      interestIsNotYield: "A statutory interest rate is not the buyer's annualized return. A dated redemption quote is not guaranteed future proceeds. Owning a lien is not ownership of the property.",
    };
  }

  function fail(code, message) {
    const err = new Error(message);
    err.code = code;
    throw err;
  }

  function requireDate(value, label) {
    const s = String(value || "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) fail("BAD_DATE", `${label} must be a calendar date (YYYY-MM-DD).`);
    return s;
  }

  function cleanText(value, max, label) {
    if (value == null || value === "") return null;
    const s = String(value).replace(/\u0000/g, "").trim();
    if (s.length > max) fail("BAD_TEXT", `${label} is limited to ${max} characters.`);
    return s;
  }

  function identityOf(input) {
    const countyFips = requireFips(input.countyFips);
    const certificateNumber = requireCertNumber(input.certificateNumber);
    const certificateYear = requireYear(input.certificateYear);
    const instrumentType = requireInstrument(input.instrumentType || INSTRUMENT);
    const state = String(input.state || "").trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(state)) fail("BAD_STATE", "State must be a two-letter code.");
    const countyName = cleanText(input.countyName, 80, "County name");
    if (!countyName) fail("BAD_COUNTY", "County name is required.");
    return { countyFips, certificateNumber, certificateYear, instrumentType, state, countyName, key: certificateKey({ countyFips, certificateYear, certificateNumber }) };
  }

  function conflict(key, exceptId) {
    return state.listings.find((l) => l.identityKey === key && l.id !== exceptId && LIVE.has(l.status));
  }

  function invalidateOffers(listing, reason) {
    for (const o of state.offers) {
      if (o.listingId === listing.id && o.status === "open") {
        o.status = "outdated";
        o.outdatedReason = reason;
      }
    }
  }

  function openTransfer(listingId) {
    return state.transfers.find((t) => t.listingId === listingId && (t.state === "open" || t.state === "frozen" || t.state === "cancelled_pending_provider"));
  }

  function sweep() {
    const t = now().toISOString();
    for (const o of state.offers) {
      if (o.status === "open" && o.expiresAt && o.expiresAt <= t) o.status = "expired";
    }
    for (const r of state.requests) {
      if (r.status === "open" && r.expiresAt && r.expiresAt <= t) r.status = "expired";
    }
  }

  function matchOne(listing, request) {
    if (listing.sample || listing.status !== "active") return null;
    if (request.status !== "open") return null;
    if (request.expiresAt && request.expiresAt <= now().toISOString()) return null;
    if (request.buyerId === listing.ownerId) return null;
    if (request.instrumentType !== listing.instrumentType) return null;
    if (request.states?.length && !request.states.includes(listing.state)) return null;
    if (request.countyFips?.length && !request.countyFips.includes(listing.countyFips)) return null;
    if (request.yearMin != null && listing.certificateYear < request.yearMin) return null;
    if (request.yearMax != null && listing.certificateYear > request.yearMax) return null;
    if (request.priceMinCents != null && listing.askingPriceCents < request.priceMinCents) return null;
    if (request.priceMaxCents != null && listing.askingPriceCents > request.priceMaxCents) return null;
    const reasons = [];
    reasons.push(`${listing.countyName}, ${listing.state} is inside the requested geography.`);
    reasons.push("Instrument is a whole tax-lien certificate.");
    if (request.yearMin != null || request.yearMax != null) reasons.push(`Certificate year ${listing.certificateYear} is inside the requested years.`);
    reasons.push(`Asking price ${formatCents(listing.askingPriceCents)} is inside the requested price range.`);
    return { listingId: listing.id, requestId: request.id, reasons };
  }

  function notifyMatches(listing) {
    for (const request of state.requests) {
      const m = matchOne(listing, request);
      if (!m) continue;
      if (state.preferences[request.buyerId]?.matchAlerts) {
        notify(request.buyerId, "match", `A listing matches your buyer request: ${listing.countyName}, ${listing.state} certificate ${listing.certificateNumber}.`, { listingId: listing.id, requestId: request.id });
      }
    }
  }

  function denyMemberOps() {
    if (state.audience === "member") fail("MEMBER_COPY", "A signed-in member can prepare a draft. Turning on trading, approving a county, or approving a listing is not available from the member account.");
  }

  function assertTradingCounty(fips) {
    const policy = policyFor(fips);
    if (!policy || !policy.enabled) fail("COUNTY_NOT_ENABLED", "This county is not enabled for secondary certificate sales. Request a county review. That request stays internal and does not contact the county.");
    if (!policy.legalReviewRef) fail("COUNTY_NOT_ENABLED", "This county has no legal-review reference. It cannot trade.");
    if (policy.instrument !== INSTRUMENT) fail("COUNTY_NOT_ENABLED", "This county policy is not for whole tax-lien certificates.");
    if (policy.validUntil && today() > policy.validUntil) fail("COUNTY_NOT_ENABLED", "This county's procedure check has passed its valid-until date.");
    return policy;
  }

  const commands = {
    bootstrapLocalOperator(_actor, _payload) {
      denyMemberOps();
      if (state.mode !== "local") fail("FORBIDDEN", "Operator assignment is not a client action on the production database.");
      const id = _actor.id;
      state.roles[id] = Array.from(new Set([...(state.roles[id] || []), "reviewer"]));
      audit(id, "bootstrap_local_operator", { note: "Local review copy only. This is not a legal approval and does not enable trading." });
      return { reviewer: true };
    },
    setFlags(actor, payload) {
      denyMemberOps();
      if (!reviewer(actor.id)) fail("FORBIDDEN", "Only an assigned reviewer can change trading flags.");
      const entries = FLAG_KEYS.filter((key) => key in (payload.flags || {}));
      if (entries.some((key) => payload.flags[key])) fail("SECOND_REVIEWER_REQUIRED", "Turning a trading flag on takes a second reviewer. Propose it, then have someone else confirm it.");
      for (const key of entries) {
        state.flags[key] = { ...(state.flags[key] || offFlag()), enabled: false, pending: null, updatedAt: now().toISOString(), updatedBy: actor.id };
      }
      audit(actor.id, "set_flags", { flags: state.flags });
      return { flags: clone(state.flags) };
    },
    proposeFlags(actor, payload) {
      denyMemberOps();
      if (!reviewer(actor.id)) fail("FORBIDDEN", "Only an assigned reviewer can propose a trading flag.");
      const keys = FLAG_KEYS.filter((key) => payload.flags && payload.flags[key]);
      if (keys.length !== 1) fail("BAD_STATE", "Propose one trading flag at a time.");
      const ref = cleanText(payload.legalReviewRef, 200, "Legal review reference");
      if (!ref) fail("LEGAL_REVIEW_REQUIRED", "Turning a trading flag on requires a legal-review reference. A membership fee or a nonbinding label is not that reference.");
      const key = keys[0];
      state.flags[key] = {
        ...(state.flags[key] || offFlag()),
        pending: { enabled: true, legalReviewRef: ref, proposedBy: actor.id, proposedAt: now().toISOString() },
      };
      audit(actor.id, "propose_flags", { key, legalReviewRef: ref });
      return { flags: clone(state.flags) };
    },
    confirmFlags(actor, payload) {
      denyMemberOps();
      if (!reviewer(actor.id)) fail("FORBIDDEN", "Only an assigned reviewer can confirm a trading flag.");
      const key = String(payload.key || "");
      if (!FLAG_KEYS.includes(key)) fail("BAD_STATE", "Unknown trading flag.");
      const pending = state.flags[key]?.pending;
      if (!pending?.enabled) fail("BAD_STATE", "That flag has no proposal to confirm.");
      if (pending.proposedBy === actor.id) fail("SECOND_REVIEWER_REQUIRED", "The reviewer who proposed this flag cannot confirm it.");
      state.flags[key] = {
        enabled: true,
        legalReviewRef: pending.legalReviewRef,
        updatedAt: now().toISOString(),
        updatedBy: actor.id,
        pending: null,
        confirmedBy: actor.id,
      };
      audit(actor.id, "confirm_flags", { key, legalReviewRef: pending.legalReviewRef });
      return { flags: clone(state.flags) };
    },
    savePolicy(actor, payload) {
      denyMemberOps();
      if (!reviewer(actor.id)) fail("FORBIDDEN", "Only an assigned reviewer can edit the county registry.");
      const idn = identityOf({ ...payload, certificateNumber: "POLICY", certificateYear: 2000, instrumentType: payload.instrument || INSTRUMENT });
      const assignmentInstructions = cleanText(payload.assignmentInstructions, 4000, "Assignment instructions");
      if (!assignmentInstructions) fail("POLICY_INCOMPLETE", "Official assignment instructions are required before a county can be saved.");
      const checkedOn = requireDate(payload.checkedOn, "Checked date");
      const validUntil = requireDate(payload.validUntil, "Valid-until date");
      const legalReviewRef = cleanText(payload.legalReviewRef, 200, "Legal review reference");
      const officialHosts = normalizeHosts(payload.officialHosts);
      const enable = !!payload.enabled;
      if (enable) {
        if (!legalReviewRef) fail("LEGAL_REVIEW_REQUIRED", "Enabling a county requires its procedure and the marketplace operating model to be approved, with a legal-review reference.");
        if (!officialHosts.length) fail("POLICY_INCOMPLETE", "Enabling a county requires the official host a reviewer must open. The seller does not choose that host.");
        if (validUntil < today()) fail("POLICY_INCOMPLETE", "Valid-until date is already past.");
        if (!flagOn("listings") && !payload.allowEnableBeforeGlobal) {
          /* county can be marked enabled only as eligibility; global flags still gate trading */
        }
      }
      const feesCents = payload.assignmentFeeDollars === "" || payload.assignmentFeeDollars == null
        ? (payload.assignmentFeeCents === undefined ? null : payload.assignmentFeeCents)
        : dollarsToCents(payload.assignmentFeeDollars, { allowZero: true });
      const forms = Array.isArray(payload.forms) ? payload.forms.slice(0, 8).map((f) => ({
        name: cleanText(f.name, 120, "Form name") || "Form",
        url: /^https:\/\//.test(String(f.url || "")) ? String(f.url) : null,
      })).filter((f) => f.url) : [];
      const row = {
        id: payload.id || nid("pol"),
        countyFips: idn.countyFips,
        state: idn.state,
        countyName: idn.countyName,
        instrument: INSTRUMENT,
        assignmentInstructions,
        forms,
        buyerRegistration: cleanText(payload.buyerRegistration, 2000, "Buyer registration") ,
        fees: { assignmentCents: feesCents, notes: cleanText(payload.feeNotes, 500, "Fee notes") },
        limitations: cleanText(payload.limitations, 2000, "Limitations"),
        officialHosts,
        checkedOn,
        validUntil,
        legalReviewRef: legalReviewRef || null,
        enabled: false,
        pendingEnable: enable ? { proposedBy: actor.id, legalReviewRef, proposedAt: now().toISOString() } : null,
        confirmedBy: null,
        updatedAt: now().toISOString(),
        updatedBy: actor.id,
      };
      const idx = state.policies.findIndex((p) => p.countyFips === row.countyFips && p.instrument === INSTRUMENT);
      if (idx >= 0) state.policies[idx] = { ...state.policies[idx], ...row, id: state.policies[idx].id };
      else state.policies.push(row);
      audit(actor.id, "save_policy", { countyFips: row.countyFips, enabled: false, proposed: enable, legalReviewRef: row.legalReviewRef });
      return { policy: state.policies.find((p) => p.countyFips === row.countyFips) };
    },
    confirmPolicy(actor, payload) {
      denyMemberOps();
      if (!reviewer(actor.id)) fail("FORBIDDEN", "Only an assigned reviewer can confirm a county.");
      const countyFips = requireFips(payload.countyFips);
      const policy = policyFor(countyFips);
      if (!policy || policy.instrument !== INSTRUMENT) fail("NOT_FOUND", "That county has no certificate policy to confirm.");
      if (!policy.pendingEnable) fail("BAD_STATE", "That county has no enable proposal to confirm.");
      if (policy.pendingEnable.proposedBy === actor.id) fail("SECOND_REVIEWER_REQUIRED", "The reviewer who proposed this county cannot confirm it.");
      if (!policy.pendingEnable.legalReviewRef) fail("LEGAL_REVIEW_REQUIRED", "Enabling a county requires a legal-review reference.");
      if (!policy.officialHosts?.length) fail("POLICY_INCOMPLETE", "Enabling a county requires the official host a reviewer must open.");
      if (policy.validUntil < today()) fail("POLICY_INCOMPLETE", "Valid-until date is already past.");
      policy.enabled = true;
      policy.confirmedBy = actor.id;
      policy.legalReviewRef = policy.pendingEnable.legalReviewRef;
      policy.pendingEnable = null;
      policy.updatedAt = now().toISOString();
      policy.updatedBy = actor.id;
      audit(actor.id, "confirm_policy", { countyFips, legalReviewRef: policy.legalReviewRef });
      return { policy };
    },
    configureProvider(actor, payload) {
      denyMemberOps();
      if (!reviewer(actor.id)) fail("FORBIDDEN", "Only an assigned reviewer can record a provider.");
      const name = cleanText(payload.name, 120, "Provider name");
      const legalReviewRef = cleanText(payload.legalReviewRef, 200, "Legal review reference");
      if (!name || !legalReviewRef) fail("PROVIDER_NOT_CONFIGURED", "An approved provider needs a name and a legal-review reference for this asset class.");
      if (!payload.secret || String(payload.secret).length < 16) fail("PROVIDER_NOT_CONFIGURED", "The provider signing secret is missing. Do not confirm funds without it.");
      secrets.set("provider", String(payload.secret));
      state.provider = { configured: true, name, keyId: payload.keyId || "primary", legalReviewRef };
      audit(actor.id, "configure_provider", { name, keyId: state.provider.keyId });
      return { provider: { configured: true, name, keyId: state.provider.keyId } };
    },
    addHolding(actor, payload) {
      const idn = identityOf(payload);
      const principalCents = dollarsToCents(payload.principalDollars ?? payload.principalCents);
      const holding = {
        id: nid("hld"),
        ownerId: actor.id,
        portfolioRef: payload.portfolioRef == null ? null : String(payload.portfolioRef),
        ...idn,
        identityKey: idn.key,
        principalCents,
        originalPremiumCents: payload.premiumDollars === "" || payload.premiumDollars == null ? null : dollarsToCents(payload.premiumDollars, { allowZero: true }),
        acquisitionDate: payload.acquisitionDate ? requireDate(payload.acquisitionDate, "Acquisition date") : null,
        apn: cleanText(payload.apn, 64, "APN"),
        address: cleanText(payload.address, 200, "Address"),
        createdAt: now().toISOString(),
        note: "A portfolio row, auction card, or watch is not proof that this certificate is owned or transferable.",
      };
      state.holdings.push(holding);
      audit(actor.id, "add_holding", { id: holding.id, identityKey: holding.identityKey });
      return { holding };
    },
    saveDraft(actor, payload) {
      const idn = identityOf(payload);
      const principalCents = dollarsToCents(payload.principalDollars ?? payload.principalCents);
      const askingPriceCents = dollarsToCents(payload.askingDollars ?? payload.askingPriceCents);
      let listing = payload.id ? listingById(payload.id) : null;
      if (listing && listing.ownerId !== actor.id) fail("FORBIDDEN", "You cannot edit another member's listing.");
      if (listing && listing.version !== payload.expectedVersion) fail("STALE", "This draft changed since you opened it. Reload before saving. Your unsaved text is still on screen.");
      if (listing && (listing.status === "transfer_pending" || listing.status === "sold" || listing.status === "redeemed")) {
        fail("LOCKED", "This certificate is in a transfer, sold, or redeemed. Edit it through reconciliation, not the draft.");
      }
      const other = conflict(idn.key, listing ? listing.id : null);
      if (other) fail("CONFLICTING_LISTING", "A live listing already exists for this whole certificate. One certificate cannot have two live listings.");
      const next = {
        ...(listing || {}),
        id: listing ? listing.id : nid("lst"),
        ownerId: actor.id,
        holdingId: payload.holdingId || listing?.holdingId || null,
        ...idn,
        identityKey: idn.key,
        principalCents,
        askingPriceCents,
        originalPremiumCents: payload.premiumDollars === "" || payload.premiumDollars == null
          ? (payload.premiumDollars === "" ? null : listing?.originalPremiumCents ?? null)
          : dollarsToCents(payload.premiumDollars, { allowZero: true }),
        acquisitionDate: payload.acquisitionDate ? requireDate(payload.acquisitionDate, "Acquisition date") : null,
        apn: cleanText(payload.apn, 64, "APN"),
        address: cleanText(payload.address, 200, "Address"),
        statutoryTerms: cleanText(payload.statutoryTerms, 1000, "Statutory terms"),
        redemptionQuoteCents: payload.redemptionDollars === "" || payload.redemptionDollars == null ? null : dollarsToCents(payload.redemptionDollars, { allowZero: true }),
        redemptionQuoteDate: payload.redemptionQuoteDate ? requireDate(payload.redemptionQuoteDate, "Redemption quote date") : null,
        publicNotes: cleanText(payload.publicNotes, 1000, "Public notes"),
        acquiredHow: claimHow(payload.acquiredHow, listing?.acquiredHow),
        claimedHolder: claimHolder(payload.claimedHolder, listing?.claimedHolder),
        sample: false,
        updatedAt: now().toISOString(),
      };
      if (next.redemptionQuoteCents != null && !next.redemptionQuoteDate) fail("BAD_DATE", "A redemption quote needs the date it was issued. Without a date it stays unknown.");
      const materialKeys = ["identityKey", "principalCents", "askingPriceCents", "originalPremiumCents", "statutoryTerms", "redemptionQuoteCents", "redemptionQuoteDate", "publicNotes", "apn", "address", "acquiredHow", "claimedHolder"];
      const material = listing && materialKeys.some((k) => JSON.stringify(listing[k] ?? null) !== JSON.stringify(next[k] ?? null));
      if (!listing) {
        next.status = "draft";
        next.version = 1;
        next.ownershipReview = "pending";
        next.ownershipReviewedOn = null;
        next.ownershipReviewedBy = null;
        next.evidenceCoverage = null;
        next.statusCheckedOn = null;
        next.statusValidUntil = null;
        next.countyRecord = null;
        next.reviewFailureReason = null;
        next.pauseReason = null;
        next.createdAt = now().toISOString();
        next.settlementFeeCents = null;
        state.listings.push(next);
        listing = next;
      } else if (material && listing.status !== "draft") {
        invalidateOffers(listing, "The seller changed identity, price, terms, or public facts.");
        Object.assign(listing, next, {
          version: listing.version + 1,
          status: "in_review",
          ownershipReview: "pending",
          ownershipReviewedOn: null,
          ownershipReviewedBy: null,
          evidenceCoverage: null,
          countyRecord: null,
          reviewFailureReason: "Material changes must be reviewed again before the listing can stay active.",
        });
      } else {
        Object.assign(listing, next, { status: listing.status === "draft" ? "draft" : listing.status, version: listing.version });
      }
      audit(actor.id, "save_draft", { id: listing.id, version: listing.version, status: listing.status });
      return { listing: ownerListing(actor.id, listing), publicPreview: publicListing(listing) };
    },
    uploadEvidence(actor, payload) {
      const listing = listingById(payload.listingId);
      if (!listing || listing.ownerId !== actor.id) fail("FORBIDDEN", "Evidence can be attached only by the listing owner.");
      if (listing.version !== payload.expectedVersion) fail("STALE", "Reload this listing before uploading. The file was not discarded from the picker if your browser still has it.");
      const type = String(payload.contentType || "");
      if (!ALLOWED_TYPES.has(type)) fail("BAD_FILE", "Upload a PDF, PNG, JPEG, or WebP. Scripts and HTML are rejected.");
      const bytes = payload.byteLength ?? (payload.bytes ? payload.bytes.length : 0);
      if (!bytes || bytes > MAX_FILE) fail("BAD_FILE", "File is empty or larger than 1.5 MB in this copy.");
      const name = cleanText(payload.filename, 180, "Filename") || "evidence";
      if (/\.(html?|svg|js|exe)$/i.test(name)) fail("BAD_FILE", "That file type is not accepted.");
      const row = {
        id: nid("ev"),
        listingId: listing.id,
        ownerId: actor.id,
        filename: name,
        contentType: type,
        byteLength: bytes,
        bytes: payload.bytes || null,
        note: cleanText(payload.note, 300, "Evidence note"),
        uploadedAt: now().toISOString(),
        releasedTo: [],
      };
      state.evidence.push(row);
      if (listing.status !== "draft") {
        invalidateOffers(listing, "Ownership evidence changed.");
        listing.version += 1;
        listing.status = "in_review";
        listing.ownershipReview = "pending";
        listing.ownershipReviewedOn = null;
        listing.evidenceCoverage = null;
        listing.countyRecord = null;
        listing.reviewFailureReason = "New evidence must be reviewed. An upload alone is not an ownership approval.";
      }
      audit(actor.id, "upload_evidence", { listingId: listing.id, evidenceId: row.id });
      return { evidence: { ...row, bytes: undefined }, listingVersion: listing.version };
    },
    submitForReview(actor, payload) {
      const listing = listingById(payload.listingId);
      if (!listing || listing.ownerId !== actor.id) fail("FORBIDDEN", "Only the owner can submit this draft.");
      if (listing.version !== payload.expectedVersion) fail("STALE", "Reload before submitting.");
      if (listing.status !== "draft" && listing.status !== "in_review") fail("BAD_STATE", `This listing is ${listing.status} and cannot be submitted from here.`);
      assertTradingCounty(listing.countyFips);
      if (!flagOn("listings")) fail("FLAG_DISABLED", "Listing submission is off until legal review approves that scope. Your draft is saved.");
      const files = state.evidence.filter((e) => e.listingId === listing.id);
      if (!files.some((e) => e.note === "tax certificate")) fail("MISSING_PROOF", "Upload the tax certificate before review. Another file does not replace it, and the upload is not an approval.");
      if (!["county_sale", "later_assignment"].includes(listing.acquiredHow)) fail("MISSING_PROOF", "Say whether you bought this at the county sale or from a later holder.");
      if (!listing.claimedHolder) fail("MISSING_PROOF", "Enter the holder name on your certificate. Buyers do not see it. It is compared with the county record.");
      if (listing.askingPriceCents == null) fail("BAD_AMOUNT", "Enter the price you are asking before you submit.");
      if (conflict(listing.identityKey, listing.id)) fail("CONFLICTING_LISTING", "Another live listing already uses this certificate identity.");
      listing.status = "in_review";
      listing.ownershipReview = "pending";
      listing.submittedAt = now().toISOString();
      listing.reviewFailureReason = null;
      audit(actor.id, "submit_for_review", { listingId: listing.id, version: listing.version });
      for (const id of Object.keys(state.roles)) {
        if (reviewer(id)) notify(id, "review", `Listing ${listing.certificateNumber} in ${listing.countyName} is waiting for review.`, { listingId: listing.id });
      }
      return { listing: ownerListing(actor.id, listing) };
    },
    reviewListing(actor, payload) {
      denyMemberOps();
      if (!reviewer(actor.id)) fail("FORBIDDEN", "Reviewer permission is assigned by administration, not by the client.");
      const listing = listingById(payload.listingId);
      if (!listing) fail("NOT_FOUND", "Listing not found.");
      if (listing.ownerId === actor.id) fail("SELF_APPROVAL", "Reviewers cannot approve or reject their own listings.");
      if (listing.version !== payload.expectedVersion) fail("STALE", "This listing changed. Review the current version.");
      if (listing.status !== "in_review") fail("BAD_STATE", "Only a listing that is in review can be decided.");
      const decision = payload.decision === "approve" ? "approve" : payload.decision === "reject" ? "reject" : null;
      if (!decision) fail("BAD_STATE", "Decision must be approve or reject.");
      const notes = cleanText(payload.notes, 2000, "Review notes");
      if (decision === "approve") {
        const policy = policyFor(listing.countyFips);
        if (policy?.confirmedBy === actor.id) fail("POLICY_CONFIRMER", "The reviewer who confirmed this county cannot approve a listing in it.");
        assertTradingCounty(listing.countyFips);
        if (!state.evidence.some((e) => e.listingId === listing.id)) fail("MISSING_PROOF", "Cannot approve without evidence on file.");
        const checks = payload.checks || {};
        for (const k of ["authority", "identity", "redemptionStatus", "restrictions", "encumbrance", "countyRecord"]) {
          if (checks[k] !== true) fail("REVIEW_INCOMPLETE", "Approval requires an explicit check of authority, certificate identity, the county record, redemption or assignment status, transfer restrictions, and encumbrance or dispute.");
        }
        const statusCheckedOn = requireDate(payload.statusCheckedOn, "Status check date");
        const statusValidUntil = requireDate(payload.statusValidUntil, "Status valid-until");
        if (statusValidUntil < today()) fail("STALE_STATUS", "The status check is already expired, so the listing cannot go active.");
        const coverage = cleanText(payload.evidenceCoverage, 300, "Evidence coverage");
        if (!coverage) fail("REVIEW_INCOMPLETE", "Describe what the evidence covers. Do not use a single verified-investment badge.");
        const countyRecord = acceptCountyRecord(listing, payload.countyRecord);
        countyRecord.retrievedBy = actor.id;
        listing.countyRecord = countyRecord;
        listing.status = "active";
        listing.ownershipReview = "approved";
        listing.ownershipReviewedOn = statusCheckedOn;
        listing.ownershipReviewedBy = actor.id;
        listing.statusCheckedOn = statusCheckedOn;
        listing.statusValidUntil = statusValidUntil;
        listing.evidenceCoverage = coverage;
        listing.activatedAt = now().toISOString();
        listing.pauseReason = null;
        listing.reviewFailureReason = null;
        notifyMatches(listing);
        notify(listing.ownerId, "listing", "Your listing passed independent review and is active. That is not a promise of a buyer or a price.", { listingId: listing.id });
      } else {
        listing.status = "draft";
        listing.ownershipReview = "rejected";
        listing.reviewFailureReason = notes || "Rejected. The reviewer did not record a reason.";
        listing.ownershipReviewedBy = actor.id;
        listing.ownershipReviewedOn = today();
        notify(listing.ownerId, "listing", `Review did not pass: ${listing.reviewFailureReason}`, { listingId: listing.id });
      }
      state.reviews.push({ id: nid("rev"), listingId: listing.id, version: listing.version, reviewerId: actor.id, decision, notes, at: now().toISOString() });
      audit(actor.id, "review_listing", { listingId: listing.id, decision, version: listing.version });
      return { listingId: listing.id, status: listing.status };
    },
    pauseListing(actor, payload) {
      const listing = listingById(payload.listingId);
      if (!listing) fail("NOT_FOUND", "Listing not found.");
      const isOwner = listing.ownerId === actor.id;
      if (!isOwner && !reviewer(actor.id)) fail("FORBIDDEN", "Only the owner or a reviewer can pause a listing.");
      if (listing.status !== "active" && listing.status !== "in_review") fail("BAD_STATE", "Only an active or in-review listing can be paused.");
      const reason = cleanText(payload.reason, 500, "Pause reason");
      if (!reason) fail("BAD_TEXT", "A pause needs a reason members can read.");
      listing.status = "paused";
      listing.pauseReason = reason;
      audit(actor.id, "pause_listing", { listingId: listing.id, reason });
      return { status: listing.status, pauseReason: reason };
    },
    withdrawListing(actor, payload) {
      const listing = listingById(payload.listingId);
      if (!listing || listing.ownerId !== actor.id) fail("FORBIDDEN", "Only the owner can withdraw.");
      if (openTransfer(listing.id)) fail("USE_TRANSFER", "A buyer is already reserved. Use transfer reconciliation. Do not mark the listing withdrawn or sold yourself.");
      if (!["draft", "in_review", "active", "paused"].includes(listing.status)) fail("BAD_STATE", "This listing cannot be withdrawn from its current state.");
      listing.status = "withdrawn";
      for (const o of state.offers) if (o.listingId === listing.id && o.status === "open") o.status = "ineligible";
      audit(actor.id, "withdraw_listing", { listingId: listing.id });
      return { status: "withdrawn" };
    },
    requestCountyReview(actor, payload) {
      const countyFips = payload.countyFips ? requireFips(payload.countyFips) : null;
      const stateCode = String(payload.state || "").trim().toUpperCase();
      const countyName = cleanText(payload.countyName, 80, "County name");
      if (!countyName || !/^[A-Z]{2}$/.test(stateCode)) fail("BAD_COUNTY", "Name the county and state you want reviewed.");
      const row = { id: nid("cr"), actorId: actor.id, countyFips, state: stateCode, countyName, note: cleanText(payload.note, 500, "Note"), status: "open", at: now().toISOString() };
      state.countyRequests.push(row);
      audit(actor.id, "request_county_review", { id: row.id, countyName, state: stateCode });
      return { request: row, message: "Recorded internally. This does not approve the county and does not contact the treasurer." };
    },
    postRequest(actor, payload) {
      if (!flagOn("solicitation")) fail("FLAG_DISABLED", "Buyer requests are off until solicitation is approved for this model.");
      const states = (payload.states || []).map((s) => String(s).trim().toUpperCase()).filter((s) => /^[A-Z]{2}$/.test(s));
      const fips = (payload.countyFips || []).map((f) => requireFips(f));
      if (!states.length && !fips.length) fail("BAD_COUNTY", "Name at least one state or county.");
      for (const f of fips) assertTradingCounty(f);
      const priceMinCents = payload.priceMinDollars === "" || payload.priceMinDollars == null ? null : dollarsToCents(payload.priceMinDollars, { allowZero: true });
      const priceMaxCents = payload.priceMaxDollars === "" || payload.priceMaxDollars == null ? null : dollarsToCents(payload.priceMaxDollars);
      if (priceMinCents != null && priceMaxCents != null && priceMinCents > priceMaxCents) fail("BAD_AMOUNT", "Minimum price is above the maximum.");
      const expiresAt = payload.expiresAt;
      if (!expiresAt || Number.isNaN(Date.parse(expiresAt)) || Date.parse(expiresAt) <= now().getTime()) fail("BAD_DATE", "Request expiry must be a future date and time.");
      const row = {
        id: nid("req"),
        buyerId: actor.id,
        states, countyFips: fips,
        instrumentType: INSTRUMENT,
        yearMin: payload.yearMin ? requireYear(payload.yearMin) : null,
        yearMax: payload.yearMax ? requireYear(payload.yearMax) : null,
        priceMinCents, priceMaxCents,
        expiresAt: new Date(expiresAt).toISOString(),
        publicPreference: cleanText(payload.publicPreference, 400, "Public preference"),
        status: "open",
        createdAt: now().toISOString(),
      };
      state.requests.push(row);
      audit(actor.id, "post_request", { id: row.id });
      const matches = state.listings.map((l) => matchOne(l, row)).filter(Boolean);
      if (state.preferences[actor.id]?.matchAlerts) {
        for (const m of matches) notify(actor.id, "match", "An active listing matches the buyer request you just posted.", m);
      }
      return { request: publicRequest(row), matches };
    },
    withdrawRequest(actor, payload) {
      const row = state.requests.find((r) => r.id === payload.requestId);
      if (!row || row.buyerId !== actor.id) fail("FORBIDDEN", "You can withdraw only your own request.");
      if (row.status !== "open") fail("BAD_STATE", "This request is not open.");
      row.status = "withdrawn";
      audit(actor.id, "withdraw_request", { id: row.id });
      return { status: "withdrawn" };
    },
    setPreference(actor, payload) {
      state.preferences[actor.id] = { matchAlerts: !!payload.matchAlerts };
      audit(actor.id, "set_preference", state.preferences[actor.id]);
      return { preferences: state.preferences[actor.id] };
    },
    watchListing(actor, payload) {
      const listing = listingById(payload.listingId);
      if (!listing || listing.status !== "active") fail("NOT_FOUND", "Only an active catalog listing can be watched. A watch is not ownership and not a research mission.");
      const existing = state.watches.find((w) => w.listingId === listing.id && w.userId === actor.id);
      if (existing) {
        state.watches = state.watches.filter((w) => w !== existing);
        return { watching: false };
      }
      state.watches.push({ id: nid("wat"), listingId: listing.id, userId: actor.id, at: now().toISOString() });
      return { watching: true };
    },
    makeOffer(actor, payload) {
      if (!flagOn("negotiation")) fail("FLAG_DISABLED", "Offers are off until negotiation is approved for this model.");
      const listing = listingById(payload.listingId);
      if (!listing || listing.status !== "active") fail("NOT_FOUND", "Offers can be made only on an active listing.");
      if (listing.sample) fail("SAMPLE", "Sample listings are not for sale.");
      if (listing.ownerId === actor.id) fail("SELF_DEALING", "You cannot offer on your own certificate.");
      if (expiredCheck(listing)) fail("STALE_STATUS", "The certificate status check has expired. New offers are blocked until it is rechecked.");
      assertTradingCounty(listing.countyFips);
      if (listing.version !== payload.listingVersion) fail("STALE", "This listing changed. Your offer was not sent. Review the current terms.");
      const amountCents = dollarsToCents(payload.amountDollars ?? payload.amountCents);
      if (!payload.expiresAt || Date.parse(payload.expiresAt) <= now().getTime()) fail("BAD_DATE", "Offer expiry must be in the future.");
      if (payload.confirmCertificate !== true || payload.notTheProperty !== true) fail("BUYER_CONFIRMATION", "Confirm the certificate, and that you are buying the certificate rather than the property, before sending an offer.");
      const confirmedNumber = requireCertNumber(payload.confirmedNumber);
      if (confirmedNumber !== listing.certificateNumber) fail("BUYER_CONFIRMATION", "The certificate number you typed does not match this listing. Leading zeros count.");
      const confirmedYear = requireYear(payload.confirmedYear);
      if (confirmedYear !== listing.certificateYear) fail("BUYER_CONFIRMATION", "The certificate year you typed does not match this listing.");
      const offer = {
        id: nid("off"),
        listingId: listing.id,
        listingVersion: listing.version,
        buyerId: actor.id,
        sellerId: listing.ownerId,
        amountCents,
        expiresAt: new Date(payload.expiresAt).toISOString(),
        status: "open",
        buyerConfirmation: { certificateNumber: confirmedNumber, certificateYear: confirmedYear, notTheProperty: true, at: now().toISOString() },
        termsSnapshot: publicListing(listing),
        createdAt: now().toISOString(),
      };
      state.offers.push(offer);
      if (!listing.firstOfferAt) listing.firstOfferAt = offer.createdAt;
      notify(listing.ownerId, "offer", `An offer of ${formatCents(amountCents)} was made on certificate ${listing.certificateNumber}. It is not a sale.`, { listingId: listing.id, offerId: offer.id });
      audit(actor.id, "make_offer", { offerId: offer.id, listingId: listing.id, amountCents });
      return { offer: memberOffer(actor.id, offer) };
    },
    withdrawOffer(actor, payload) {
      const offer = state.offers.find((o) => o.id === payload.offerId);
      if (!offer || offer.buyerId !== actor.id) fail("FORBIDDEN", "You can withdraw only your own open offer.");
      if (offer.status !== "open") fail("BAD_STATE", "This offer is not open.");
      offer.status = "withdrawn";
      audit(actor.id, "withdraw_offer", { offerId: offer.id });
      return { status: "withdrawn" };
    },
    declineOffer(actor, payload) {
      const offer = state.offers.find((o) => o.id === payload.offerId);
      if (!offer) fail("NOT_FOUND", "Offer not found.");
      const listing = listingById(offer.listingId);
      if (!listing || listing.ownerId !== actor.id) fail("FORBIDDEN", "Only the seller can decline this offer.");
      if (offer.status !== "open") fail("BAD_STATE", "This offer is not open.");
      offer.status = "declined";
      notify(offer.buyerId, "offer", "The seller declined your offer. The certificate was not transferred.", { offerId: offer.id });
      audit(actor.id, "decline_offer", { offerId: offer.id });
      return { status: "declined" };
    },
    selectOffer(actor, payload) {
      if (!flagOn("transactions")) fail("FLAG_DISABLED", "Selecting an offer is off until transaction handling is approved. Selection would start a transfer review, not a payment.");
      const offer = state.offers.find((o) => o.id === payload.offerId);
      if (!offer) fail("NOT_FOUND", "Offer not found.");
      const listing = listingById(offer.listingId);
      if (!listing || listing.ownerId !== actor.id) fail("FORBIDDEN", "Only the seller can select an offer.");
      sweep();
      if (offer.status !== "open") fail("OFFER_INELIGIBLE", `This offer is ${offer.status} and cannot be selected.`);
      if (offer.listingVersion !== listing.version) {
        offer.status = "outdated";
        fail("OFFER_INELIGIBLE", "The listing changed after this offer. It is outdated and cannot be selected.");
      }
      if (offer.buyerId === listing.ownerId) fail("SELF_DEALING", "Self-dealing offers cannot be selected.");
      if (openTransfer(listing.id) || listing.status === "transfer_pending") fail("ALREADY_RESERVED", "A transfer is already reserved for this whole certificate.");
      if (listing.status !== "active") fail("BAD_STATE", "The listing is not active.");
      if (expiredCheck(listing)) fail("STALE_STATUS", "Status check expired. Selection is blocked.");
      assertTradingCounty(listing.countyFips);
      const transfer = {
        id: nid("xfer"),
        listingId: listing.id,
        offerId: offer.id,
        sellerId: listing.ownerId,
        buyerId: offer.buyerId,
        amountCents: offer.amountCents,
        listingVersion: listing.version,
        state: "open",
        freeze: null,
        checks: {
          sellerAuthority: null,
          buyerEligibility: null,
          certificateStatus: null,
          assignmentInstructions: null,
          settlementOpened: null,
          fundsConfirmed: null,
          assignmentSubmitted: null,
          assignmentConfirmed: null,
          fundsReleased: null,
        },
        createdAt: now().toISOString(),
        reconciledAt: null,
      };
      state.transfers.push(transfer);
      offer.status = "selected";
      listing.status = "transfer_pending";
      state.events.push({ id: nid("tev"), transferId: transfer.id, type: "terms_selected", actorId: actor.id, at: now().toISOString(), detail: "Provisional terms selected. This does not transfer the certificate or move funds." });
      notify(offer.buyerId, "transfer", "The seller selected your offer for transfer review. Nothing has been assigned and no funds have moved inside HOTL.", { transferId: transfer.id });
      audit(actor.id, "select_offer", { offerId: offer.id, transferId: transfer.id });
      return { transferId: transfer.id, state: transfer.state };
    },
    requestInfo(actor, payload) {
      const listing = listingById(payload.listingId);
      if (!listing || listing.status !== "active") fail("NOT_FOUND", "Information requests are open only on active listings.");
      if (listing.ownerId === actor.id) fail("SELF_DEALING", "Use your draft to change public facts. An information thread is for a buyer.");
      let thread = state.threads.find((t) => t.listingId === listing.id && t.buyerId === actor.id);
      if (!thread) {
        thread = { id: nid("th"), listingId: listing.id, buyerId: actor.id, sellerId: listing.ownerId, createdAt: now().toISOString() };
        state.threads.push(thread);
      }
      const text = cleanText(payload.text, 2000, "Message");
      if (!text) fail("BAD_TEXT", "Write the question you want the seller to see.");
      state.messages.push({ id: nid("msg"), threadId: thread.id, authorId: actor.id, text, at: now().toISOString() });
      notify(listing.ownerId, "info", "A buyer requested information. Your private evidence was not attached.", { threadId: thread.id });
      return { threadId: thread.id };
    },
    postMessage(actor, payload) {
      const thread = state.threads.find((t) => t.id === payload.threadId);
      if (!thread) fail("NOT_FOUND", "Thread not found.");
      const allowed = thread.buyerId === actor.id || thread.sellerId === actor.id || reviewer(actor.id);
      if (!allowed) fail("FORBIDDEN", "This thread is private to the buyer, the seller, and reviewers.");
      const text = cleanText(payload.text, 2000, "Message");
      if (!text) fail("BAD_TEXT", "Message is empty.");
      const msg = { id: nid("msg"), threadId: thread.id, authorId: actor.id, text, at: now().toISOString() };
      state.messages.push(msg);
      const other = actor.id === thread.buyerId ? thread.sellerId : thread.buyerId;
      if (actor.id !== other) notify(other, "info", "New message on a listing thread.", { threadId: thread.id });
      return { id: msg.id };
    },
    reportListing(actor, payload) {
      const listing = listingById(payload.listingId);
      if (!listing) fail("NOT_FOUND", "Listing not found.");
      const reason = cleanText(payload.reason, 1000, "Report");
      if (!reason) fail("BAD_TEXT", "Describe the problem.");
      const row = { id: nid("rpt"), listingId: listing.id, reporterId: actor.id, reason, status: "open", at: now().toISOString() };
      state.reports.push(row);
      audit(actor.id, "report_listing", { id: row.id, listingId: listing.id });
      return { id: row.id };
    },
    reviewerCheck(actor, payload) {
      if (!reviewer(actor.id)) fail("FORBIDDEN", "Only a reviewer can confirm a county or eligibility check.");
      const transfer = state.transfers.find((t) => t.id === payload.transferId);
      if (!transfer || transfer.state === "reconciled") fail("NOT_FOUND", "Open transfer not found.");
      const allowed = ["sellerAuthority", "buyerEligibility", "certificateStatus", "assignmentInstructions", "assignmentSubmitted", "assignmentConfirmed"];
      if (!allowed.includes(payload.check)) fail("BAD_STATE", "That check is not a reviewer step. Financial events come from the provider.");
      if (payload.check === "fundsConfirmed" || payload.check === "fundsReleased") fail("FORBIDDEN", "Members and reviewers cannot confirm funds.");
      const note = cleanText(payload.note, 1000, "Check note");
      if (!note) fail("BAD_TEXT", "Record what you checked and the source.");
      if (payload.check === "assignmentConfirmed" && !cleanText(payload.officialRecordRef, 200, "Official record")) {
        fail("BAD_TEXT", "County assignment confirmation needs an official record reference.");
      }
      transfer.checks[payload.check] = {
        at: now().toISOString(),
        by: actor.id,
        note,
        officialRecordRef: payload.check === "assignmentConfirmed" ? cleanText(payload.officialRecordRef, 200, "Official record") : null,
      };
      state.events.push({ id: nid("tev"), transferId: transfer.id, type: payload.check, actorId: actor.id, role: "reviewer", at: now().toISOString(), detail: note });
      audit(actor.id, "reviewer_check", { transferId: transfer.id, check: payload.check });
      maybeReconcile(transfer);
      return { transfer: memberTransfer(actor.id, transfer) };
    },
    memberAck(actor, payload) {
      const transfer = state.transfers.find((t) => t.id === payload.transferId);
      if (!transfer) fail("NOT_FOUND", "Transfer not found.");
      if (actor.id !== transfer.sellerId && actor.id !== transfer.buyerId) fail("FORBIDDEN", "Only a party to this transfer can acknowledge a task.");
      const note = cleanText(payload.note, 1000, "Acknowledgement");
      if (!note) fail("BAD_TEXT", "Describe what you uploaded or acknowledged.");
      state.events.push({ id: nid("tev"), transferId: transfer.id, type: "member_ack", actorId: actor.id, role: "member", at: now().toISOString(), detail: note });
      audit(actor.id, "member_ack", { transferId: transfer.id });
      return { ok: true };
    },
    reportRedemption(actor, payload) {
      const listing = listingById(payload.listingId);
      if (!listing) fail("NOT_FOUND", "Listing not found.");
      const party = listing.ownerId === actor.id || reviewer(actor.id) || state.transfers.some((t) => t.listingId === listing.id && t.buyerId === actor.id && t.state !== "reconciled");
      if (!party) fail("FORBIDDEN", "Only a party or a reviewer can report redemption.");
      const source = cleanText(payload.source, 500, "Source");
      if (!source) fail("BAD_TEXT", "Name the official source for the redemption report.");
      const transfer = openTransfer(listing.id);
      if (transfer) {
        transfer.state = "frozen";
        transfer.freeze = { reason: "redemption_reported", at: now().toISOString(), by: actor.id, source };
        state.events.push({ id: nid("tev"), transferId: transfer.id, type: "frozen", actorId: actor.id, at: now().toISOString(), detail: `Redemption reported: ${source}` });
      }
      if (reviewer(actor.id) && payload.confirm === true) {
        listing.status = "redeemed";
        listing.pauseReason = null;
        listing.reviewFailureReason = `Redeemed. Source: ${source}`;
        audit(actor.id, "confirm_redemption", { listingId: listing.id, source });
        return { status: "redeemed", message: "Recorded as redeemed, not as a marketplace sale. It was not relisted and funds were not refunded from here." };
      }
      listing.pauseReason = `Redemption reported and waiting for reviewer confirmation. Source: ${source}`;
      if (listing.status === "active") listing.status = "paused";
      audit(actor.id, "report_redemption", { listingId: listing.id });
      return { status: listing.status, message: "Redemption is reported, not confirmed. The case is frozen if a transfer was open. Nothing was refunded automatically." };
    },
    openDispute(actor, payload) {
      const transfer = state.transfers.find((t) => t.id === payload.transferId);
      if (!transfer) fail("NOT_FOUND", "Transfer not found.");
      if (![transfer.sellerId, transfer.buyerId].includes(actor.id) && !reviewer(actor.id)) fail("FORBIDDEN", "Only a party or reviewer can open a dispute.");
      const reason = cleanText(payload.reason, 1000, "Dispute");
      if (!reason) fail("BAD_TEXT", "Describe the dispute.");
      transfer.state = "frozen";
      transfer.freeze = { reason: "dispute", at: now().toISOString(), by: actor.id, source: reason };
      state.events.push({ id: nid("tev"), transferId: transfer.id, type: "frozen", actorId: actor.id, at: now().toISOString(), detail: reason });
      audit(actor.id, "dispute", { transferId: transfer.id });
      return { state: "frozen", message: "The transfer is frozen. It will not be silently cancelled, refunded, or relisted." };
    },
    cancelTransfer(actor, payload) {
      if (!reviewer(actor.id)) fail("FORBIDDEN", "Cancellation after a reservation is a reconciliation step for a reviewer, not a seller toggle.");
      const transfer = state.transfers.find((t) => t.id === payload.transferId);
      if (!transfer || transfer.state === "reconciled") fail("NOT_FOUND", "Open transfer not found.");
      const listing = listingById(transfer.listingId);
      const held = !!(transfer.checks.fundsConfirmed || transfer.checks.assignmentSubmitted || transfer.checks.assignmentConfirmed || transfer.checks.fundsReleased);
      const reason = cleanText(payload.reason, 500, "Cancel reason") || "Cancelled during reconciliation.";
      if (held) {
        transfer.state = "cancelled_pending_provider";
        transfer.freeze = { reason: "cancel_pending_provider", at: now().toISOString(), by: actor.id, source: reason };
        state.events.push({ id: nid("tev"), transferId: transfer.id, type: "cancel_pending_provider", actorId: actor.id, at: now().toISOString(), detail: reason });
        audit(actor.id, "cancel_pending_provider", { transferId: transfer.id });
        return { state: transfer.state, message: "Funds or an assignment are in progress. HOTL did not refund, release, or relist. Follow the provider's confirmed process." };
      }
      transfer.state = "cancelled";
      if (listing && listing.status === "transfer_pending") {
        listing.status = "paused";
        listing.pauseReason = `Transfer cancelled before funds or assignment. ${reason} It was not returned to the catalog automatically.`;
      }
      const offer = state.offers.find((o) => o.id === transfer.offerId);
      if (offer && offer.status === "selected") offer.status = "ineligible";
      state.events.push({ id: nid("tev"), transferId: transfer.id, type: "cancelled", actorId: actor.id, at: now().toISOString(), detail: reason });
      audit(actor.id, "cancel_transfer", { transferId: transfer.id });
      return { state: "cancelled" };
    },
    async providerEvent(actor, payload) {
      if (!actor || actor.role !== "provider") fail("FORBIDDEN", "Members and reviewers cannot post settlement events. Only a signed provider integration can confirm funds.");
      if (!state.provider.configured || !secrets.get("provider")) fail("PROVIDER_NOT_CONFIGURED", "External settlement integration pending. Live completion stays blocked.");
      const secret = secrets.get("provider");
      const raw = typeof payload.raw === "string" ? payload.raw : JSON.stringify(payload.body || {});
      const expect = await hmacHex(secret, raw);
      const got = String(payload.signature || "");
      if (!safeEqual(expect, got)) fail("BAD_SIGNATURE", "Provider signature did not verify.");
      let body;
      try { body = JSON.parse(raw); } catch { fail("BAD_EVENT", "Provider body was not JSON."); }
      const eventId = String(body.id || "");
      if (!eventId) fail("BAD_EVENT", "Provider event id is required.");
      const idem = `provider:${eventId}`;
      if (state.idempotency[idem]) return { duplicate: true, result: state.idempotency[idem] };
      const transfer = state.transfers.find((t) => t.id === body.transferId);
      if (!transfer) fail("NOT_FOUND", "Provider event does not match a transfer.");
      if (body.sellerId && body.sellerId !== transfer.sellerId) fail("BAD_EVENT", "Provider event is bound to a different seller.");
      if (body.buyerId && body.buyerId !== transfer.buyerId) fail("BAD_EVENT", "Provider event is bound to a different buyer.");
      const type = body.type;
      if (type !== "settlement_opened" && type !== "funds_confirmed" && type !== "funds_released" && type !== "provider_failed") {
        fail("BAD_EVENT", "Unsupported provider event.");
      }
      if (type === "provider_failed") {
        transfer.state = "frozen";
        transfer.freeze = { reason: "provider_failure", at: now().toISOString(), by: "provider", source: body.note || "Provider reported a failure." };
      } else if (type === "settlement_opened") {
        transfer.checks.settlementOpened = { at: now().toISOString(), providerCaseId: body.providerCaseId || null, note: body.note || null };
      } else if (type === "funds_confirmed") {
        transfer.checks.fundsConfirmed = { at: now().toISOString(), providerCaseId: body.providerCaseId || null, note: body.note || "Provider confirmed funds." };
      } else if (type === "funds_released") {
        transfer.checks.fundsReleased = { at: now().toISOString(), providerCaseId: body.providerCaseId || null, note: body.note || "Provider released funds." };
      }
      state.events.push({ id: nid("tev"), transferId: transfer.id, type, actorId: "provider", role: "provider", at: now().toISOString(), detail: body.note || type, providerEventId: eventId });
      audit("provider", "provider_event", { transferId: transfer.id, type, eventId });
      maybeReconcile(transfer);
      const result = { duplicate: false, transferId: transfer.id, state: transfer.state, type };
      state.idempotency[idem] = result;
      return result;
    },
  };

  function maybeReconcile(transfer) {
    if (transfer.state === "frozen" || transfer.state === "cancelled" || transfer.state === "cancelled_pending_provider") return;
    const done = transfer.checks.assignmentConfirmed && transfer.checks.fundsReleased;
    if (!done) return;
    transfer.state = "reconciled";
    transfer.reconciledAt = now().toISOString();
    const listing = listingById(transfer.listingId);
    if (listing) {
      listing.status = "sold";
      listing.soldAt = transfer.reconciledAt;
      listing.completedPriceCents = transfer.amountCents;
    }
    state.events.push({ id: nid("tev"), transferId: transfer.id, type: "sale_reconciled", actorId: "system", at: transfer.reconciledAt, detail: "Both official assignment confirmation and provider funds release are on file. This is a marketplace sale, not a redemption." });
    notify(transfer.sellerId, "transfer", "Transfer reconciled. County assignment and provider funds release are separate records. Portfolio ownership is not changed automatically.", { transferId: transfer.id });
    notify(transfer.buyerId, "transfer", "Transfer reconciled. Confirm the county's recorded holder before you treat the certificate as yours.", { transferId: transfer.id });
    audit("system", "reconcile", { transferId: transfer.id });
  }

  function ownerListing(actorId, listing) {
    return {
      ...publicListing(listing),
      ownerId: listing.ownerId,
      holdingId: listing.holdingId,
      status: listing.status,
      pauseReason: listing.pauseReason,
      reviewFailureReason: listing.reviewFailureReason,
      ownershipReview: listing.ownershipReview,
      version: listing.version,
      mine: listing.ownerId === actorId,
      evidence: state.evidence.filter((e) => e.listingId === listing.id).map(({ bytes, ...rest }) => rest),
      countyRecordHolder: reviewer(actorId) || listing.ownerId === actorId ? (listing.countyRecord?.holder || null) : null,
      acquiredHow: listing.ownerId === actorId ? listing.acquiredHow || null : null,
      claimedHolder: listing.ownerId === actorId ? listing.claimedHolder || null : null,
    };
  }

  function publicRequest(row) {
    return {
      id: row.id,
      states: row.states,
      countyFips: row.countyFips,
      instrumentType: row.instrumentType,
      yearMin: row.yearMin,
      yearMax: row.yearMax,
      priceMinCents: row.priceMinCents,
      priceMaxCents: row.priceMaxCents,
      expiresAt: row.expiresAt,
      publicPreference: row.publicPreference,
      status: row.status,
      createdAt: row.createdAt,
      fundingNote: "A member's budget or self-reported cash is not verified funding. Contact details are not on this board.",
    };
  }

  function memberOffer(actorId, offer) {
    const listing = listingById(offer.listingId);
    return {
      id: offer.id,
      listingId: offer.listingId,
      listingVersion: offer.listingVersion,
      amountCents: offer.amountCents,
      expiresAt: offer.expiresAt,
      status: offer.status,
      outdatedReason: offer.outdatedReason || null,
      createdAt: offer.createdAt,
      currentListingVersion: listing ? listing.version : null,
      role: offer.buyerId === actorId ? "buyer" : offer.sellerId === actorId ? "seller" : "reviewer",
      countyName: listing?.countyName || null,
      state: listing?.state || null,
      certificateNumber: listing?.certificateNumber || null,
    };
  }

  function memberTransfer(actorId, transfer) {
    const listing = listingById(transfer.listingId);
    return {
      id: transfer.id,
      listingId: transfer.listingId,
      offerId: transfer.offerId,
      amountCents: transfer.amountCents,
      state: transfer.state,
      freeze: transfer.freeze,
      checks: transfer.checks,
      createdAt: transfer.createdAt,
      reconciledAt: transfer.reconciledAt,
      providerConfigured: state.provider.configured,
      providerName: state.provider.configured ? state.provider.name : null,
      settlementNote: state.provider.configured
        ? "Financial steps update only from signed provider events."
        : "External settlement integration pending. Live completion is blocked. HOTL does not take purchase funds in the subscription checkout.",
      certificateNumber: listing?.certificateNumber || null,
      countyName: listing?.countyName || null,
      listingStatus: listing?.status || null,
      completedPriceCents: listing?.completedPriceCents || null,
      askingPriceCents: listing?.askingPriceCents || null,
      role: transfer.sellerId === actorId ? "seller" : transfer.buyerId === actorId ? "buyer" : reviewer(actorId) ? "reviewer" : "none",
      events: state.events.filter((e) => e.transferId === transfer.id).map((e) => ({ id: e.id, type: e.type, at: e.at, detail: e.detail, role: e.role || null })),
    };
  }

  function analytics() {
    const activated = state.listings.filter((l) => l.activatedAt);
    const withOffer = activated.filter((l) => l.firstOfferAt);
    const eligibleOffers = state.offers.filter((o) => o.status !== "ineligible");
    const selected = state.offers.filter((o) => o.status === "selected" || state.transfers.some((t) => t.offerId === o.id));
    const opened = state.transfers.length;
    const sold = state.transfers.filter((t) => t.state === "reconciled");
    const redeemed = state.listings.filter((l) => l.status === "redeemed");
    const gaps = sold.map((t) => {
      const listing = listingById(t.listingId);
      if (!listing || listing.askingPriceCents == null) return null;
      return { transferId: t.id, askCents: listing.askingPriceCents, completedCents: t.amountCents, differenceCents: t.amountCents - listing.askingPriceCents };
    }).filter(Boolean);
    const failures = {};
    for (const t of state.transfers) {
      if (t.freeze?.reason) failures[t.freeze.reason] = (failures[t.freeze.reason] || 0) + 1;
      if (t.state === "cancelled" || t.state === "cancelled_pending_provider") failures[t.state] = (failures[t.state] || 0) + 1;
    }
    return {
      definitions: {
        timeToFirstOffer: "Among listings that reached active status, hours from activation to the first offer that was accepted into the book. Denominator is listings that became active. Listings with no offer are excluded from the average and counted in withoutOffer.",
        proportionWithOffers: "Listings that became active and received at least one offer, divided by listings that became active. Redeemed or withdrawn listings stay in the denominator.",
        offerToTransfer: "Offers that were selected into a transfer, divided by offers that were recorded. Withdrawn and outdated offers stay in the denominator.",
        completedTransfers: "Transfers reconciled only after both assignment confirmation and provider funds release, divided by transfers opened. Redemptions are not completions.",
        redemptions: "Listings marked redeemed. Counted separately from sales.",
        priceGap: "Completed price minus asking price, only on reconciled sales. Not a return.",
      },
      activated: activated.length,
      withOffer: withOffer.length,
      withoutOffer: activated.length - withOffer.length,
      proportionWithOffers: activated.length ? withOffer.length / activated.length : null,
      meanHoursToFirstOffer: withOffer.length ? withOffer.reduce((a, l) => a + (Date.parse(l.firstOfferAt) - Date.parse(l.activatedAt)) / 36e5, 0) / withOffer.length : null,
      offers: state.offers.length,
      offerToTransfer: state.offers.length ? selected.length / state.offers.length : null,
      transfersOpened: opened,
      completedSales: sold.length,
      completionRatio: opened ? sold.length / opened : null,
      meanHoursToComplete: sold.length ? sold.reduce((a, t) => a + (Date.parse(t.reconciledAt) - Date.parse(t.createdAt)) / 36e5, 0) / sold.length : null,
      priceGaps: gaps,
      redemptions: redeemed.length,
      failures,
      eligibleOffers: eligibleOffers.length,
    };
  }

  function buildView(actorId) {
    sweep();
    const isReviewer = reviewer(actorId);
    const catalog = state.listings.filter((l) => l.status === "active").map(publicListing);
    const mine = state.listings.filter((l) => l.ownerId === actorId).map((l) => ownerListing(actorId, l));
    const holdingRows = state.holdings.filter((h) => h.ownerId === actorId);
    const offerRows = state.offers.filter((o) => o.buyerId === actorId || o.sellerId === actorId || isReviewer).map((o) => memberOffer(actorId, o));
    const transferRows = state.transfers.filter((t) => t.sellerId === actorId || t.buyerId === actorId || isReviewer).map((t) => memberTransfer(actorId, t));
    const board = state.requests.filter((r) => r.status === "open" && (!r.expiresAt || r.expiresAt > now().toISOString())).map(publicRequest);
    const myRequests = state.requests.filter((r) => r.buyerId === actorId).map(publicRequest);
    const threads = state.threads.filter((t) => t.buyerId === actorId || t.sellerId === actorId || isReviewer).map((t) => ({
      ...t,
      messages: state.messages.filter((m) => m.threadId === t.id).map((m) => ({ id: m.id, authorId: m.authorId, text: m.text, at: m.at, mine: m.authorId === actorId })),
    }));
    const matches = [];
    for (const request of state.requests) {
      if (request.buyerId !== actorId && !isReviewer) continue;
      for (const listing of state.listings) {
        const m = matchOne(listing, request);
        if (m) matches.push({ ...m, askingPriceCents: listing.askingPriceCents, countyName: listing.countyName, state: listing.state, certificateNumber: listing.certificateNumber });
      }
    }
    const tasks = [];
    for (const o of state.offers) {
      if (o.sellerId === actorId && o.status === "open") tasks.push({ kind: "offer", text: "An offer needs a response.", ref: o.id });
    }
    for (const l of state.listings) {
      if (l.ownerId === actorId && l.status === "in_review") tasks.push({ kind: "review", text: "A listing is in review.", ref: l.id });
      if (l.ownerId === actorId && l.reviewFailureReason && l.status === "draft") tasks.push({ kind: "evidence", text: l.reviewFailureReason, ref: l.id });
      if (l.ownerId === actorId && l.status === "active" && expiredCheck(l)) tasks.push({ kind: "stale", text: "Status check expired. New offers are blocked.", ref: l.id });
    }
    for (const t of state.transfers) {
      if ((t.sellerId === actorId || t.buyerId === actorId || isReviewer) && t.state === "open") tasks.push({ kind: "transfer", text: "A transfer has steps still open.", ref: t.id });
      if ((t.sellerId === actorId || t.buyerId === actorId) && t.state === "frozen") tasks.push({ kind: "frozen", text: `Transfer frozen: ${t.freeze?.reason || "see the case"}.`, ref: t.id });
    }
    return {
      actorId,
      reviewer: isReviewer,
      mode: state.mode,
      flags: clone(state.flags),
      provider: { configured: state.provider.configured, name: state.provider.configured ? state.provider.name : null },
      enabledCounties: state.policies.filter((p) => p.enabled).map((p) => ({ countyFips: p.countyFips, state: p.state, countyName: p.countyName, validUntil: p.validUntil, legalReviewRef: p.legalReviewRef })),
      policies: isReviewer ? clone(state.policies) : state.policies.filter((p) => p.enabled).map((p) => ({ countyFips: p.countyFips, state: p.state, countyName: p.countyName, instrument: p.instrument, enabled: p.enabled, validUntil: p.validUntil })),
      catalog,
      listings: mine,
      holdings: holdingRows,
      offers: offerRows,
      transfers: transferRows,
      requests: board,
      myRequests,
      threads,
      matches,
      watches: state.watches.filter((w) => w.userId === actorId),
      notifications: state.notifications.filter((n) => n.userId === actorId),
      preferences: state.preferences[actorId] || { matchAlerts: false },
      tasks,
      reports: isReviewer ? state.reports : [],
      countyRequests: isReviewer ? state.countyRequests : state.countyRequests.filter((c) => c.actorId === actorId),
      reviewQueue: isReviewer ? state.listings.filter((l) => l.status === "in_review" && l.ownerId !== actorId).map((l) => ownerListing(actorId, l)) : [],
      analytics: isReviewer ? analytics() : null,
      sources: RESEARCH_SOURCES,
    };
  }

  async function command(actor, name, payload = {}, opts = {}) {
    if (!actor?.id) return { ok: false, code: "FORBIDDEN", message: "Sign in is required." };
    const idem = opts.idempotencyKey ? `${actor.id}:${name}:${opts.idempotencyKey}` : null;
    return tx(async () => {
      if (idem && state.idempotency[idem]) return { ok: true, duplicate: true, data: state.idempotency[idem] };
      let rated = false;
      if (name !== "providerEvent") {
        try { bumpRate(actor.id); rated = true; } catch (err) {
          return { ok: false, code: err.code || "ERROR", message: err.message };
        }
      }
      const backup = clone(state);
      try {
        sweep();
        const fn = commands[name];
        if (!fn) return { ok: false, code: "BAD_COMMAND", message: "Unknown marketplace command." };
        const data = await fn(actor, payload || {});
        if (idem) state.idempotency[idem] = data;
        return { ok: true, data };
      } catch (err) {
        const rate = state.rate;
        const clock = state.clock;
        for (const key of Object.keys(state)) delete state[key];
        Object.assign(state, backup);
        if (rated) state.rate = rate;
        state.clock = clock;
        return { ok: false, code: err.code || "ERROR", message: err.message || "The marketplace could not save that." };
      }
    });
  }

  return {
    command,
    view(actorId) { return buildView(actorId); },
    setClock(iso) { state.clock = iso; },
    snapshot() {
      const copy = clone(state);
      delete copy.rate;
      for (const ev of copy.evidence) delete ev.bytes;
      return copy;
    },
    setAudience(audience) {
      state.audience = audience === "member" ? "member" : "review";
    },
    async signProvider(body) {
      const secret = secrets.get("provider");
      if (!secret) return null;
      const raw = JSON.stringify(body);
      return { raw, signature: await hmacHex(secret, raw) };
    },
  };
}

async function hmacHex(secret, message) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

export function catalogQuery(rows, q) {
  const text = String(q.q || "").trim().toLowerCase();
  return rows.filter((row) => {
    if (q.state && row.state !== String(q.state).toUpperCase()) return false;
    if (q.countyFips && row.countyFips !== q.countyFips) return false;
    if (q.year && Number(row.certificateYear) !== Number(q.year)) return false;
    if (q.priceMinCents != null && row.askingPriceCents < q.priceMinCents) return false;
    if (q.priceMaxCents != null && row.askingPriceCents > q.priceMaxCents) return false;
    if (q.availableOnly && row.statusCheckExpired) return false;
    if (q.freshDays && row.statusCheckedOn) {
      const age = (Date.parse(q.today || new Date().toISOString().slice(0, 10)) - Date.parse(row.statusCheckedOn)) / 86400000;
      if (age > Number(q.freshDays)) return false;
    }
    if (!text) return true;
    const hay = [row.countyName, row.state, row.certificateNumber, row.apn, row.address, row.countyFips].filter(Boolean).join(" ").toLowerCase();
    return text.split(/\s+/).every((part) => hay.includes(part));
  });
}
