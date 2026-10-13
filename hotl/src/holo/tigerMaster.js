import raw from "./tigerMaster.json";

export const TIGER_BY = raw.by || "Tiger";
export const TIGER_PULLED = raw.pulled || "2026-09-24";
export const TIGER_SOURCE = raw.source || "ParcelIQ National Tax Sale Master";

const STATUS_LABEL = {
  SOURCE_READY: "Official page located",
  PLATFORM_READY: "Auction platform located",
  VERIFIED_EMPTY: "Sale list empty",
  TREASURER_OUTREACH: "County page not found",
  PUBLISHING_SOON: "List not published yet",
  INGESTED: "List ingested",
  PAID_DATA: "Paid list, not ingested",
  RESTRICTED: "Restricted source",
};

const EMPTY = {
  present: false,
  chip: null,
  status: null,
  statusLabel: null,
  url: null,
  kind: null,
  reason: null,
  next: null,
  shared: false,
  found: false,
  checked: null,
  note: null,
  stateSale: null,
  stateRedeem: null,
  stateInterest: null,
  stateRuleUrl: null,
  stateChecked: null,
  inventoryN: null,
  inventoryType: null,
  inventoryUrl: null,
};

function pad(fips) {
  return String(fips ?? "").replace(/\D/g, "").padStart(5, "0");
}

function patternOf(entry) {
  if (entry == null) return null;
  if (typeof entry === "number") return raw.patterns[entry] || null;
  return entry;
}

function httpUrl(url) {
  const s = String(url || "").trim();
  if (!/^https?:\/\//i.test(s)) return null;
  if (/[\s<>"']/.test(s)) return null;
  return s;
}

function humanNext(next) {
  if (!next) return null;
  const s = String(next).trim();
  if (!s) return null;
  if (/^[A-Z0-9_]+$/.test(s)) return s.replace(/_/g, " ").toLowerCase();
  return s;
}

function notFound(status, reason, listStatus) {
  if (status === "TREASURER_OUTREACH" || status === "BOOTSTRAP_LOCAL_SHAPEFILE") return true;
  if (/^NOT FOUND\b/i.test(reason || "")) return true;
  if (/not yet discovered/i.test(reason || "")) return true;
  if (listStatus && /NOT_FOUND|NO_CURRENT|INVENTORY_NOT_FOUND/.test(listStatus)) return true;
  return false;
}

/** Tiger's baseline from the ParcelIQ master. Not a fresh reading and not one of the seven checks. */
export function tigerLines(fips) {
  const id = pad(fips);
  const row = patternOf(raw.counties[id]);
  if (!row) return EMPTY;

  const status = row.status || "";
  const url = httpUrl(row.url);
  const reason = row.reason || "";
  const next = humanNext(row.next || "");
  const kind = row.kind || "";
  const shared = !!row.shared;
  const checked = row.checked || TIGER_PULLED;
  const fromEvidence = !!row.deep;
  const st = (raw.fipsState && raw.fipsState[id.slice(0, 2)]) || "";
  const rule = (raw.stateRules && st && raw.stateRules[st]) || null;
  const inv = (raw.inventory && raw.inventory[id]) || null;
  const missing = notFound(status, reason, row.listStatus);
  const emptyList = status === "VERIFIED_EMPTY";
  const found = !missing && !emptyList && !!url;

  let chip = "Baseline by Tiger";
  if (emptyList) chip = "List empty · Tiger";
  else if (missing) chip = "Not found · Tiger";
  else if (shared) chip = "State route by Tiger";
  else chip = "Done by Tiger";

  const statusLabel = STATUS_LABEL[status] || (status ? status.replace(/_/g, " ").toLowerCase() : "Baseline on file");
  const shareNote = shared ? "This link is a shared state page, not this county's own sale list. " : "";
  const note = fromEvidence
    ? `Rechecked by Tiger on ${checked}. ${shareNote}ParcelIQ master. Not a fresh reading in this app, and it does not complete the seven research checks.`
    : `Baseline by Tiger · ${TIGER_SOURCE}, ${checked}. ${shareNote}Not a fresh reading, and it does not complete the seven research checks.`;

  const invType = inv && inv.type ? String(inv.type).replace(/_/g, " ").toLowerCase() : "rows";
  return {
    present: true,
    chip,
    status,
    statusLabel,
    url,
    kind,
    reason: reason || null,
    next: next || null,
    shared,
    found,
    checked,
    note,
    stateSale: (rule && (rule.sale || rule.process)) || null,
    stateRedeem: (rule && rule.redeem) || null,
    stateInterest: (rule && rule.interest) || null,
    stateRuleUrl: httpUrl(rule && (rule.ruleUrl || rule.adminUrl)),
    stateChecked: (rule && rule.checked) || null,
    inventoryN: inv && inv.n ? inv.n : null,
    inventoryType: inv && inv.n ? invType : null,
    inventoryUrl: httpUrl(inv && inv.url),
  };
}

export function tigerBrief(reason, max = 180) {
  if (!reason) return "";
  const s = String(reason).replace(/\s+/g, " ").trim();
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}
