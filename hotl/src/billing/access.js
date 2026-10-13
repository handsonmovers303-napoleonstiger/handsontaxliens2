/** Subscription access. A missing row is not a paid account. Checkout completion alone does not open access. */

export function accessFromSubscription(row, now = Date.now()) {
  if (!row) return { research: false, paid: false, reason: "NO_SUBSCRIPTION" };
  const status = row.status || "";
  const end = row.current_period_end ? Date.parse(row.current_period_end) : NaN;
  const open = status === "active" || status === "trialing";
  if (!open) return { research: false, paid: false, reason: status || "INACTIVE" };
  if (!Number.isFinite(end) || end <= now) return { research: false, paid: false, reason: "PERIOD_ENDED" };
  return { research: true, paid: true, reason: status };
}

function periodEnd(seconds) {
  return seconds ? new Date(seconds * 1000).toISOString() : null;
}

/** Apply one Stripe event. The same event id is a no-op. Members cannot call this. */
export function applyBillingEvent(state, event) {
  const events = state.events || [];
  if (!event?.id || !event.type) return { ...state, duplicate: false, rejected: "MALFORMED" };
  if (events.includes(event.id)) return { ...state, duplicate: true, rejected: null };
  const next = { subscription: state.subscription || null, events: [...events, event.id], duplicate: false, rejected: null };
  const obj = event.data?.object || {};
  if (event.type === "checkout.session.completed") {
    next.subscription = next.subscription;
    return next;
  }
  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const status = event.type === "customer.subscription.deleted" ? "canceled" : obj.status;
    next.subscription = {
      id: obj.id || next.subscription?.id || null,
      status: status || "incomplete",
      customer: obj.customer || next.subscription?.customer || null,
      current_period_end: periodEnd(obj.current_period_end) || next.subscription?.current_period_end || null,
    };
    return next;
  }
  return next;
}
