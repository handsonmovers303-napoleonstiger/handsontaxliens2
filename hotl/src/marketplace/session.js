/** Member drafts stay on this browser under the signed-in account. The review ledger is a separate device copy. Neither one publishes to other members. */
import { createLedger } from "./engine.js";
import { syncStatus } from "../lib/storage.js";

const REVIEW_KEY = "hotl:market:ledger:v1";
const ACTORS_KEY = "hotl:market:actors:v1";
const CURRENT_KEY = "hotl:market:actor:v1";

let ledgers = new Map();
const listeners = new Set();

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function marketScope() {
  const status = syncStatus();
  return status.signedIn && status.userId ? status.userId : "review";
}

function storageKey(scope) {
  return scope === "review" ? REVIEW_KEY : `hotl:market:member:${scope}`;
}

function ledgerInstance(scope = marketScope()) {
  if (!ledgers.has(scope)) {
    const ledger = createLedger(readJSON(storageKey(scope), null) || undefined);
    if (scope !== "review") ledger.setAudience("member");
    ledgers.set(scope, ledger);
  }
  return ledgers.get(scope);
}

function persist(scope = marketScope()) {
  const ledger = ledgers.get(scope);
  if (!ledger) return;
  try { localStorage.setItem(storageKey(scope), JSON.stringify(ledger.snapshot())); } catch { /* quota stays visible via the failed command */ }
}

export function subscribeMarket(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
function emit() { listeners.forEach((fn) => fn()); }

if (typeof window !== "undefined") {
  window.addEventListener("hotl:account-switch", () => emit());
}

export function localActors() {
  const rows = readJSON(ACTORS_KEY, null);
  if (rows?.length) return rows;
  const id = crypto.randomUUID();
  const created = [{ id, label: "Local identity 1" }];
  localStorage.setItem(ACTORS_KEY, JSON.stringify(created));
  localStorage.setItem(CURRENT_KEY, id);
  return created;
}

export function currentActorId() {
  const rows = localActors();
  let id = localStorage.getItem(CURRENT_KEY);
  if (!rows.some((r) => r.id === id)) id = rows[0].id;
  localStorage.setItem(CURRENT_KEY, id);
  return id;
}

export function switchActor(id) {
  const rows = localActors();
  if (!rows.some((r) => r.id === id)) return currentActorId();
  localStorage.setItem(CURRENT_KEY, id);
  emit();
  return id;
}

export function addLocalActor() {
  const rows = localActors();
  if (rows.length >= 3) return rows;
  const row = { id: crypto.randomUUID(), label: `Local identity ${rows.length + 1}` };
  const next = [...rows, row];
  localStorage.setItem(ACTORS_KEY, JSON.stringify(next));
  localStorage.setItem(CURRENT_KEY, row.id);
  emit();
  return next;
}

export function marketView(actorId) {
  const scope = marketScope();
  const id = scope === "review" ? actorId : scope;
  return { ...ledgerInstance(scope).view(id), remote: scope !== "review", memberCopy: scope !== "review" };
}

export async function marketCommand(actor, name, payload, opts) {
  const scope = marketScope();
  const id = scope === "review" ? actor?.id : scope;
  const res = await ledgerInstance(scope).command({ id }, name, payload, opts);
  if (res.ok) persist(scope);
  emit();
  return res;
}

export function marketTasks(actorId) {
  const scope = marketScope();
  const id = scope === "review" ? actorId : scope;
  return ledgerInstance(scope).view(id).tasks;
}
