import raw from "./countyAuction.json";

export const AUCTION_PULLED = raw.pulled || null;

function show(field) {
  if (!field || !field.value || !field.quote) return null;
  return field.value;
}

/** Display lines copied from a fetched county page. Null means the page did not say it. */
export function auctionLines(fips) {
  const id = String(fips ?? "").replace(/\D/g, "").padStart(5, "0");
  const row = raw.counties[id];
  const empty = {
    platform: null, cadence: null, deadline: null, saleDate: null, saleIso: null, deadlineIso: null, deposit: null,
    inventory: null, email: null, fetched: false, url: null, note: null,
  };
  if (!row || row.status !== "fetched") return empty;
  return {
    platform: show(row.platform),
    cadence: show(row.cadence),
    deadline: show(row.deadline),
    saleDate: show(row.saleDate),
    saleIso: row.saleDate && row.saleDate.iso ? row.saleDate.iso : null,
    deadlineIso: row.deadline && row.deadline.iso ? row.deadline.iso : null,
    deposit: show(row.deposit),
    inventory: show(row.inventory),
    email: show(row.email),
    fetched: true,
    url: row.url || null,
    note: `Fetched ${row.url} on ${row.pulled}. Words copied from that page. Not a reading, and not a verification.`,
  };
}
