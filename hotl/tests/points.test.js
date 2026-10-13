import { describe, expect, it } from "vitest";
import { createLedger } from "../src/points/ledger";

const member = "member-1";
const reviewer = "reviewer-1";
const shared = {
  kind: "county_update",
  share: true,
  rulesAccepted: true,
  title: "Delta sale page",
  context: "The treasurer page lists the November sale date.",
  sourceUrl: "https://example.gov/delta",
  county: "Delta",
  state: "CO",
};

describe("Scout Points ledger", () => {
  it("does not award points for a private or unapproved submission", () => {
    const book = createLedger();
    expect(() => book.submit(member, { ...shared, share: false })).toThrow(/share/);
    expect(() => book.submit(member, { kind: "watchlist", share: true, rulesAccepted: true, context: "private watchlist item" })).toThrow(/Private/);
    const row = book.submit(member, shared);
    expect(row.status).toBe("pending");
    expect(book.balance(member)).toBe(0);
    expect(book.history(member)).toHaveLength(0);
  });

  it("rewards an eligible contribution only once", () => {
    const book = createLedger();
    const row = book.submit(member, shared);
    const first = book.approve(reviewer, row.id);
    const second = book.approve(reviewer, row.id);
    expect(first.duplicate).toBe(false);
    expect(second.duplicate).toBe(true);
    expect(second.entry.id).toBe(first.entry.id);
    expect(book.balance(member)).toBe(25);
  });

  it("refuses a redemption that would drop the balance below zero", () => {
    const book = createLedger();
    const row = book.submit(member, shared);
    book.approve(reviewer, row.id);
    expect(() => book.redeem(member, "subscription_credit", "req-1")).toThrow(/below zero/);
    expect(book.balance(member)).toBe(25);
    expect(book.history(member)).toHaveLength(1);
    book.adjust(reviewer, member, 175, "Points added so a listed reward can be tested", "seed-1");
    const spent = book.redeem(member, "research_desk", "req-2");
    expect(spent.duplicate).toBe(false);
    expect(book.balance(member)).toBe(0);
    expect(book.redeem(member, "research_desk", "req-2").duplicate).toBe(true);
    expect(book.balance(member)).toBe(0);
  });

  it("reverses an approved contribution once and leaves a rejected draft at zero", () => {
    const book = createLedger();
    const pending = book.submit(member, shared);
    book.reject(reviewer, pending.id, "No source on the page.");
    expect(book.balance(member)).toBe(0);
    const approved = book.submit(member, { ...shared, sourceUrl: "https://example.gov/other", context: "A second official sale notice for the same county." });
    book.approve(reviewer, approved.id);
    book.withdraw(member, approved.id);
    book.withdraw(member, approved.id);
    expect(book.balance(member)).toBe(0);
    expect(book.history(member).filter((e) => e.entryType === "reversal")).toHaveLength(1);
  });

  it("keeps a member on their own history and records who adjusted points", () => {
    const book = createLedger();
    const row = book.submit(member, shared);
    book.approve(reviewer, row.id);
    book.adjust(reviewer, member, -5, "Duplicate context removed", "adj-1");
    book.adjust(reviewer, member, -5, "Duplicate context removed", "adj-1");
    expect(book.balance(member)).toBe(20);
    expect(book.history(member).map((e) => e.actorId)).toContain(reviewer);
    expect(book.history("someone-else")).toHaveLength(0);
    expect(book.pending()).toHaveLength(0);
  });
});
