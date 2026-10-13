import { createHmac, timingSafeEqual } from "node:crypto";

/** Stripe-Signature: t=unix,v1=hex. The body must be the raw request bytes. */
export function verifyStripeSignature(rawBody, header, secret, now = Date.now()) {
  if (!secret || !header || rawBody == null) return { ok: false, reason: "MISSING" };
  const parts = Object.fromEntries(String(header).split(",").map((part) => {
    const i = part.indexOf("=");
    return [part.slice(0, i), part.slice(i + 1)];
  }));
  const stamp = Number(parts.t);
  const given = parts.v1;
  if (!Number.isFinite(stamp) || !given) return { ok: false, reason: "MALFORMED" };
  if (Math.abs(now / 1000 - stamp) > 300) return { ok: false, reason: "STALE" };
  const expected = createHmac("sha256", secret).update(`${parts.t}.${rawBody}`).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(given);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false, reason: "BAD_SIGNATURE" };
  return { ok: true };
}
