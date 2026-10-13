/**
 * Later cutover from the public site.
 * handsontaxliens.com/marketplace/ is a research catalog of county open-data
 * lien records. Its own copy says each entry is not an offer of sale.
 * This mapper only prepares an unconfirmed draft. It does not save a listing,
 * and it drops estimated property value on purpose.
 */

function text(value, max) {
  if (value == null) return "";
  return String(value).replace(/\u0000/g, "").trim().slice(0, max);
}

function httpsUrl(value) {
  const s = text(value, 300);
  return /^https:\/\//.test(s) ? s : "";
}

function money(value) {
  if (value == null || value === "") return "";
  const s = String(value).trim().replace(/[$,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return "";
  const [d, c = ""] = s.split(".");
  return `${d}.${c.padEnd(2, "0").slice(0, 2)}`;
}

export function publicCatalogToDraft(row) {
  if (!row || typeof row !== "object") {
    return { ok: false, code: "BAD_RECORD", message: "The public catalog did not send a record." };
  }
  const state = text(row.state, 2).toUpperCase();
  const countyName = text(row.countyName || row.county, 80);
  if (!/^[A-Z]{2}$/.test(state) || !countyName) {
    return { ok: false, code: "BAD_RECORD", message: "A public catalog row needs a county and a two-letter state before a draft can open." };
  }
  const prefill = {
    source: "public-catalog",
    sourceUrl: httpsUrl(row.sourceUrl),
    sourceLabel: text(row.sourceLabel, 120) || "Public research catalog",
    state,
    countyName,
    countyFips: /^\d{5}$/.test(text(row.countyFips, 5)) ? text(row.countyFips, 5) : "",
    apn: text(row.apn || row.parcel, 64),
    address: text(row.address, 200),
    principalDollars: money(row.lienAmount ?? row.principal),
    askingDollars: "",
    certificateNumber: "",
    certificateYear: "",
    publicNotes: "",
    portfolioRef: null,
  };
  return {
    ok: true,
    prefill,
    dropped: ["estimatedValue", "discount", "photos"],
    notice: "Opened from the public research catalog. That row is a county lien record, not an offer of sale and not proof you hold a certificate. Estimated value was not copied. Certificate number and asking price stay blank until you enter them.",
  };
}
