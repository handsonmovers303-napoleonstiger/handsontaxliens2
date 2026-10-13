import { createHmac } from "node:crypto";
import { describe, expect, test } from "vitest";
import { accessFromSubscription, applyBillingEvent } from "../src/billing/access.js";
import { verifyStripeSignature } from "../src/billing/stripe.js";

const now = Date.parse("2026-10-06T12:00:00Z");
const later = Math.floor(Date.parse("2026-11-06T12:00:00Z") / 1000);

describe("subscription access", () => {
  test("no row is not a paid account", () => {
    expect(accessFromSubscription(null, now).research).toBe(false);
  });

  test("an active period opens research, and cancel closes it", () => {
    let state = { events: [], subscription: null };
    state = applyBillingEvent(state, { id: "evt_1", type: "checkout.session.completed", data: { object: { id: "cs_1", mode: "subscription" } } });
    expect(accessFromSubscription(state.subscription, now).research).toBe(false);
    state = applyBillingEvent(state, { id: "evt_2", type: "customer.subscription.updated", data: { object: { id: "sub_1", status: "active", customer: "cus_1", current_period_end: later } } });
    expect(accessFromSubscription(state.subscription, now)).toMatchObject({ research: true, paid: true });
    const again = applyBillingEvent(state, { id: "evt_2", type: "customer.subscription.updated", data: { object: { id: "sub_1", status: "canceled", current_period_end: later } } });
    expect(again.duplicate).toBe(true);
    expect(again.subscription.status).toBe("active");
    state = applyBillingEvent(state, { id: "evt_3", type: "customer.subscription.deleted", data: { object: { id: "sub_1", status: "canceled", customer: "cus_1", current_period_end: later } } });
    expect(accessFromSubscription(state.subscription, now).research).toBe(false);
  });

  test("a stale or forged webhook is rejected", () => {
    const secret = "whsec_test";
    const body = '{"id":"evt_9"}';
    const t = Math.floor(now / 1000);
    const v1 = createHmac("sha256", secret).update(`${t}.${body}`).digest("hex");
    expect(verifyStripeSignature(body, `t=${t},v1=${v1}`, secret, now).ok).toBe(true);
    expect(verifyStripeSignature(body, `t=${t},v1=${"0".repeat(v1.length)}`, secret, now).ok).toBe(false);
    expect(verifyStripeSignature(body, `t=${t - 600},v1=${v1}`, secret, now).reason).toBe("STALE");
  });
});
