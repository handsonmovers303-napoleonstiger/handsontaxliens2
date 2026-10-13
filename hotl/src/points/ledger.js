import { EXPIRE_MONTHS, POINT_VALUES, rewardByCode } from "./rules";

const PRIVATE = new Set(["watchlist", "note", "bid_limit", "saved_search"]);
const norm = (s) => String(s || "").trim().replace(/\s+/g, " ").toLowerCase();

export function balanceOf(entries, memberId) {
  return entries.filter((e) => e.memberId === memberId).reduce((sum, e) => sum + e.amount, 0);
}

export function createLedger(initial = {}, now = () => new Date().toISOString()) {
  const contributions = initial.contributions ? [...initial.contributions] : [];
  const entries = initial.entries ? [...initial.entries] : [];
  const redemptions = initial.redemptions ? [...initial.redemptions] : [];
  let n = initial.seq || 1;
  const nextId = (prefix) => `${prefix}-${n++}`;

  const fail = (message) => {
    const error = new Error(message);
    error.scout = true;
    throw error;
  };

  function fingerprint(input) {
    return [input.kind, norm(input.sourceUrl), norm(input.context), norm(input.parcelRef)].join("|");
  }

  function submit(memberId, input) {
    if (!memberId) fail("Sign in before submitting research for points.");
    if (PRIVATE.has(input.kind)) fail("Private research is not submitted and does not earn points.");
    if (!input.share) fail("Points are only for research you choose to share with paid members.");
    if (!input.rulesAccepted) fail("Read the earning and redemption rules before submitting.");
    if (!POINT_VALUES[input.kind]) fail("That contribution is not eligible for points.");
    const context = String(input.context || "").trim();
    if (context.length < 12) fail("Add enough context for a reviewer to check the contribution.");
    if (input.kind !== "property_photo" && !/^https?:\/\//i.test(String(input.sourceUrl || "").trim())) fail("A county or auction update needs a source link.");
    if (input.kind === "property_photo" && !String(input.parcelRef || "").trim()) fail("A property photo needs the parcel it belongs to.");
    const print = fingerprint(input);
    if (contributions.some((c) => c.memberId === memberId && c.fingerprint === print && !["withdrawn", "rejected"].includes(c.status))) {
      fail("That contribution is already on file. A duplicate is not rewarded.");
    }
    const row = {
      id: nextId("c"),
      memberId,
      kind: input.kind,
      share: true,
      title: String(input.title || "").trim() || defaultTitle(input.kind),
      context,
      sourceUrl: String(input.sourceUrl || "").trim() || null,
      county: String(input.county || "").trim() || null,
      state: String(input.state || "").trim() || null,
      parcelRef: String(input.parcelRef || "").trim() || null,
      status: "pending",
      reviewNote: null,
      reviewerId: null,
      reviewedAt: null,
      fingerprint: print,
      createdAt: now(),
    };
    contributions.push(row);
    return row;
  }

  function findOwn(memberId, id) {
    const row = contributions.find((c) => c.id === id);
    if (!row || row.memberId !== memberId) fail("That contribution is not on your account.");
    return row;
  }

  function earnEntry(contributionId) {
    return entries.find((e) => e.entryType === "earn" && e.contributionId === contributionId);
  }

  function approve(reviewerId, contributionId, requestKey = `earn:${contributionId}`) {
    const existing = entries.find((e) => e.requestKey === requestKey) || earnEntry(contributionId);
    if (existing) return { entry: existing, duplicate: true };
    const row = contributions.find((c) => c.id === contributionId);
    if (!row) fail("That contribution is not on file.");
    if (!row.share) fail("A private contribution cannot be rewarded.");
    if (row.status === "rejected" || row.status === "withdrawn") fail("A rejected or withdrawn contribution is not rewarded.");
    row.status = "approved";
    row.reviewerId = reviewerId;
    row.reviewedAt = now();
    row.reviewNote = null;
    const entry = post({
      memberId: row.memberId,
      amount: POINT_VALUES[row.kind],
      entryType: "earn",
      contributionId: row.id,
      redemptionId: null,
      reason: `Approved ${row.kind.replaceAll("_", " ")}`,
      actorId: reviewerId,
      requestKey,
    });
    return { entry, duplicate: false };
  }

  function reject(reviewerId, contributionId, note) {
    const reason = String(note || "").trim();
    if (reason.length < 3) fail("A rejection needs a reason.");
    const row = contributions.find((c) => c.id === contributionId);
    if (!row) fail("That contribution is not on file.");
    const prior = earnEntry(row.id);
    row.status = "rejected";
    row.reviewerId = reviewerId;
    row.reviewedAt = now();
    row.reviewNote = reason;
    if (!prior) return { entry: null };
    return { entry: reverseAward(reviewerId, row, `Rejected after approval: ${reason}`) };
  }

  function requestChanges(reviewerId, contributionId, note) {
    const reason = String(note || "").trim();
    if (reason.length < 3) fail("Say what needs to change.");
    const row = contributions.find((c) => c.id === contributionId);
    if (!row) fail("That contribution is not on file.");
    if (row.status === "approved") fail("An approved contribution is reversed or left in place. It is not sent back as a draft.");
    row.status = "changes";
    row.reviewerId = reviewerId;
    row.reviewedAt = now();
    row.reviewNote = reason;
    return row;
  }

  function withdraw(memberId, contributionId) {
    const row = findOwn(memberId, contributionId);
    if (row.status === "withdrawn") return { row, entry: entries.find((e) => e.requestKey === `reversal:${row.id}`) || null, duplicate: true };
    const prior = earnEntry(row.id);
    row.status = "withdrawn";
    row.reviewedAt = now();
    if (!prior) return { row, entry: null, duplicate: false };
    return { row, entry: reverseAward(memberId, row, "Withdrawn by the member"), duplicate: false };
  }

  function reverseAward(actorId, row, reason) {
    const requestKey = `reversal:${row.id}`;
    const existing = entries.find((e) => e.requestKey === requestKey);
    if (existing) return existing;
    const award = earnEntry(row.id);
    if (!award) return null;
    return post({
      memberId: row.memberId,
      amount: -award.amount,
      entryType: "reversal",
      contributionId: row.id,
      redemptionId: null,
      reason,
      actorId,
      requestKey,
    });
  }

  function redeem(memberId, rewardCode, requestKey) {
    if (!requestKey) fail("A redemption needs a request id.");
    const existing = entries.find((e) => e.requestKey === requestKey);
    if (existing) return { entry: existing, redemption: redemptions.find((r) => r.requestKey === requestKey) || null, duplicate: true };
    const reward = rewardByCode(rewardCode);
    if (!reward) fail("That reward is not offered.");
    const balance = balanceOf(entries, memberId);
    if (balance < reward.cost) fail("Redemption cannot reduce the balance below zero.");
    const redemption = { id: nextId("r"), memberId, rewardCode, requestKey, createdAt: now() };
    redemptions.push(redemption);
    const entry = post({
      memberId,
      amount: -reward.cost,
      entryType: "redeem",
      contributionId: null,
      redemptionId: redemption.id,
      reason: `Redeemed ${reward.label}`,
      actorId: memberId,
      requestKey,
    });
    return { entry, redemption, duplicate: false };
  }

  function adjust(actorId, memberId, amount, reason, requestKey) {
    if (!requestKey) fail("An adjustment needs a request id.");
    const existing = entries.find((e) => e.requestKey === requestKey);
    if (existing) return { entry: existing, duplicate: true };
    const why = String(reason || "").trim();
    if (why.length < 3) fail("An adjustment needs a reason.");
    const points = Number(amount);
    if (!Number.isInteger(points) || points === 0) fail("An adjustment needs a non-zero whole number of points.");
    if (!memberId) fail("Name the member account.");
    const entry = post({
      memberId,
      amount: points,
      entryType: "adjustment",
      contributionId: null,
      redemptionId: null,
      reason: why,
      actorId,
      requestKey,
    });
    return { entry, duplicate: false };
  }

  function expireDue(asOf = now()) {
    const posted = [];
    const cutoff = new Date(asOf);
    cutoff.setUTCMonth(cutoff.getUTCMonth() - EXPIRE_MONTHS);
    for (const award of entries.filter((e) => e.entryType === "earn")) {
      if (entries.some((e) => e.entryType === "expire" && e.contributionId === award.contributionId)) continue;
      if (entries.some((e) => e.entryType === "reversal" && e.contributionId === award.contributionId)) continue;
      if (new Date(award.createdAt) > cutoff) continue;
      posted.push(post({
        memberId: award.memberId,
        amount: -award.amount,
        entryType: "expire",
        contributionId: award.contributionId,
        redemptionId: null,
        reason: `Expired ${EXPIRE_MONTHS} months after the award`,
        actorId: null,
        requestKey: `expire:${award.id}`,
        createdAt: asOf,
      }));
    }
    return posted;
  }

  function post(row) {
    const entry = {
      id: nextId("e"),
      status: "posted",
      createdAt: row.createdAt || now(),
      ...row,
    };
    entries.push(entry);
    return entry;
  }

  return {
    submit,
    approve,
    reject,
    requestChanges,
    withdraw,
    redeem,
    adjust,
    expireDue,
    balance: (memberId) => balanceOf(entries, memberId),
    history: (memberId) => entries.filter((e) => e.memberId === memberId).slice().reverse(),
    contributionsFor: (memberId) => contributions.filter((c) => c.memberId === memberId).slice().reverse(),
    pending: () => contributions.filter((c) => c.status === "pending"),
    snapshot: () => ({ contributions, entries, redemptions, seq: n }),
  };
}

function defaultTitle(kind) {
  if (kind === "county_update") return "County source update";
  if (kind === "auction_update") return "Auction source update";
  return "Property photo";
}
