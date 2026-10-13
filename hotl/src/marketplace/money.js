/** Integer cents only. Null means unknown — never coerce unknown to zero. */

export function dollarsToCents(input, { allowZero = false } = {}) {
  if (input == null || input === "") return null;
  const s = String(input).trim().replace(/[$,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(s)) {
    const err = new Error("Enter a positive dollar amount with at most two decimal places.");
    err.code = "BAD_AMOUNT";
    throw err;
  }
  const [d, c = ""] = s.split(".");
  const cents = Number(d) * 100 + Number(c.padEnd(2, "0"));
  if (!Number.isSafeInteger(cents) || cents > 100_000_000_00) {
    const err = new Error("Amount is outside the supported range.");
    err.code = "BAD_AMOUNT";
    throw err;
  }
  if (cents === 0 && !allowZero) {
    const err = new Error("Amount must be greater than zero.");
    err.code = "BAD_AMOUNT";
    throw err;
  }
  if (cents < 0) {
    const err = new Error("Amount must be greater than zero.");
    err.code = "BAD_AMOUNT";
    throw err;
  }
  return cents;
}

export function formatCents(cents) {
  if (cents == null || Number.isNaN(Number(cents))) return "Not documented";
  const n = Number(cents);
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  const d = Math.floor(abs / 100);
  const c = String(abs % 100).padStart(2, "0");
  return `${sign}$${d.toLocaleString("en-US")}.${c}`;
}

/** Sum only known components. Unknown fees stay unknown — they are not zero. */
export function indicativeBuyerCost({ askingPriceCents, countyFeeCents, settlementFeeCents, marketplaceFeeCents }) {
  const parts = [
    ["Asking price", askingPriceCents],
    ["County assignment fee", countyFeeCents],
    ["Settlement fee", settlementFeeCents],
    ["Marketplace fee", marketplaceFeeCents],
  ];
  const known = parts.filter(([, v]) => v != null);
  const unknown = parts.filter(([, v]) => v == null).map(([k]) => k);
  const sum = known.reduce((a, [, v]) => a + v, 0);
  return {
    knownCents: known.length ? sum : null,
    incomplete: unknown.length > 0,
    unknown,
    note: unknown.length
      ? `Incomplete. Not included because they are not documented: ${unknown.join(", ")}. Missing fees are not zero.`
      : "All listed components are documented. This is not a redemption payoff and not a return.",
  };
}

/** Asking vs a named basis. Not a yield. */
export function priceVersus(askingPriceCents, basisCents, basisLabel) {
  if (askingPriceCents == null || basisCents == null) return null;
  const diff = askingPriceCents - basisCents;
  const gap = formatCents(Math.abs(diff));
  const note = diff === 0
    ? `Asking price equals ${basisLabel}.`
    : diff > 0
      ? `Asking price is ${gap} above ${basisLabel}.`
      : `Asking price is ${gap} below ${basisLabel}.`;
  return { basisLabel, differenceCents: diff, note: `${note} This comparison is not a return.` };
}
