/** Certificate identity. Leading zeros are significant and must be kept. */

export function requireFips(value) {
  const s = String(value ?? "").trim();
  if (!/^\d{5}$/.test(s)) {
    const err = new Error("County FIPS must be exactly 5 digits, including leading zeros.");
    err.code = "BAD_FIPS";
    throw err;
  }
  return s;
}

export function requireCertNumber(value) {
  const s = String(value ?? "").trim();
  if (!s || s.length > 64) {
    const err = new Error("Certificate number is required and is stored as text so leading zeros stay intact.");
    err.code = "BAD_CERTIFICATE";
    throw err;
  }
  if (/[<>]/.test(s)) {
    const err = new Error("Certificate number cannot include markup.");
    err.code = "BAD_CERTIFICATE";
    throw err;
  }
  return s;
}

export function requireYear(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1900 || n > 2100) {
    const err = new Error("Certificate year must be a four-digit year.");
    err.code = "BAD_YEAR";
    throw err;
  }
  return n;
}

export function certificateKey({ countyFips, certificateYear, certificateNumber }) {
  return `${requireFips(countyFips)}|${requireYear(certificateYear)}|${requireCertNumber(certificateNumber).toUpperCase()}`;
}

export const INSTRUMENT = "tax_lien_certificate";

export function requireInstrument(value) {
  if (value !== INSTRUMENT) {
    const err = new Error("This release lists only whole tax-lien certificates. Deeds, fractions, tokens, pools, and loans are out of scope.");
    err.code = "BAD_INSTRUMENT";
    throw err;
  }
  return value;
}
