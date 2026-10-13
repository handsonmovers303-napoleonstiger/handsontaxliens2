/* window.storage — the key/value surface the Scouting Department already writes to
 * (DD records, checks, verdicts, stars, photos, call logs, positions).
 *
 * Offline first: every write lands in memory and localStorage immediately, marked
 * dirty, then a remote backend picks it up:
 *   - web build: Supabase public.user_kv (row-level security, per scout), after sign-in
 *   - artifact build: the artifact's own `db` store (src/lib/artifactDb.js) — the
 *     scout's research in their private subtree, field evidence shared with the team
 * On first sync the newer write wins, in both directions. */
import { supabase } from "./supabase";
import { ARTIFACT } from "./env";
import { artifactBackend } from "./artifactDb";

const LS = "kv:";
const mem = new Map(); // key -> { v, t, dirty }
const listeners = new Set();
let backend = null;     // { push(entries), pull(), remove(key), subscribe(onRows) }
let flushTimer = null;
let flushing = false;
let status = { online: typeof navigator === "undefined" ? true : navigator.onLine, signedIn: false, userId: null, pending: 0, lastSync: null, error: null, syncing: false, email: null, mode: ARTIFACT ? "artifact" : "supabase", readOnly: false, local: false };

const emit = () => { status = { ...status, pending: [...mem.values()].filter((r) => r.dirty).length }; listeners.forEach((f) => f(status)); };
const setStatus = (patch) => { status = { ...status, ...patch }; emit(); };
export const onSyncStatus = (f) => { listeners.add(f); f(status); return () => listeners.delete(f); };
export const syncStatus = () => status;

function readLocal(key) {
  if (mem.has(key)) return mem.get(key);
  try { const raw = localStorage.getItem(LS + key); if (raw) { const r = JSON.parse(raw); mem.set(key, r); return r; } } catch {}
  return null;
}
function writeLocal(key, rec) {
  mem.set(key, rec);
  try { localStorage.setItem(LS + key, JSON.stringify(rec)); }
  catch { /* quota: photos can outgrow localStorage; memory + the backend still hold it */ }
}
// hydrate memory from localStorage so pending writes survive a reload
try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith(LS)) readLocal(k.slice(LS.length)); } } catch {}

async function flush() {
  flushTimer = null;
  if (!backend || !status.online || status.readOnly) return emit();
  if (flushing) return scheduleFlush();
  const dirty = [...mem.entries()].filter(([, r]) => r.dirty);
  if (!dirty.length) return emit();
  flushing = true; setStatus({ syncing: true });
  try {
    const done = await backend.push(dirty.map(([key, r]) => ({ key, v: r.v, t: r.t })));
    for (const key of done) { const cur = mem.get(key); const sent = dirty.find(([k]) => k === key); if (cur && sent && cur.t === sent[1].t) writeLocal(key, { ...cur, dirty: false }); }
    setStatus({ syncing: false, error: null, lastSync: new Date().toISOString() });
  } catch (e) {
    setStatus({ syncing: false, error: e.message || String(e), readOnly: !!e.readOnly });
  } finally { flushing = false; }
  if ([...mem.values()].some((r) => r.dirty) && !status.readOnly && !status.error) scheduleFlush();
}
const scheduleFlush = () => { if (!flushTimer) flushTimer = setTimeout(flush, 900); };

/** Merge rows from the backend; newer wins. Returns true when anything changed locally. */
function applyRemote(rows) {
  let changed = false;
  for (const { key, v, t } of rows) {
    const cur = readLocal(key);
    if (!cur || t > cur.t) { writeLocal(key, { v, t, dirty: false }); changed = true; }
  }
  if (changed) window.dispatchEvent(new CustomEvent("hotl:storage-pulled"));
  return changed;
}

async function pull() {
  if (!backend) return;
  try {
    const rows = await backend.pull();
    applyRemote(rows);
    // anything local and newer than the backend goes up
    const remote = new Map(rows.map((r) => [r.key, r.t]));
    for (const [key, r] of mem) if (backend.accepts(key) && (!remote.has(key) || remote.get(key) < r.t)) mem.set(key, { ...r, dirty: true });
    setStatus({ lastSync: new Date().toISOString(), error: null });
    await flush();
  } catch (e) { setStatus({ error: e.message || String(e) }); }
}

export const storage = {
  async get(key) { const r = readLocal(key); return r ? { key, value: r.v } : null; },
  async set(key, value) { writeLocal(key, { v: String(value), t: Date.now(), dirty: true }); emit(); scheduleFlush(); return { key, value }; },
  async delete(key) { mem.delete(key); try { localStorage.removeItem(LS + key); } catch {} if (backend) await backend.remove(key).catch(() => {}); return { key, deleted: true }; },
  async list(prefix = "") { return { keys: [...mem.keys()].filter((k) => k.startsWith(prefix)) }; },
};

/* ------------------------------- Supabase backend ------------------------------ */
function supabaseBackend(user) {
  return {
    accepts: () => true,
    async push(entries) {
      const rows = entries.map((e) => ({ user_id: user.id, key: e.key, value: e.v, updated_at: new Date(e.t).toISOString() }));
      const { error } = await supabase.from("user_kv").upsert(rows, { onConflict: "user_id,key" });
      if (error) throw error;
      return entries.map((e) => e.key);
    },
    async pull() {
      const { data, error } = await supabase.from("user_kv").select("key,value,updated_at");
      if (error) throw error;
      return (data || []).map((r) => ({ key: r.key, v: r.value, t: Date.parse(r.updated_at) }));
    },
    async remove(key) { await supabase.from("user_kv").delete().eq("key", key); },
  };
}

export function installStorage() {
  if (typeof window === "undefined") return;
  window.storage = storage;
  window.addEventListener("online", () => { setStatus({ online: true }); flush(); });
  window.addEventListener("offline", () => setStatus({ online: false }));
  if (ARTIFACT) {
    // the sandbox cannot reach Supabase; the artifact's own db takes its place
    setStatus({ local: true });
    artifactBackend().then((b) => {
      if (!b) return;   // no db in this view: stays on this device
      backend = b;
      setStatus({ local: false, signedIn: true, readOnly: b.readOnly, shared: b.shared, private: b.private });
      pull().then(() => b.subscribe((rows) => applyRemote(rows)));
    });
    return;
  }
  const onSession = (session) => {
    const was = backend && backend.uid;
    const user = session ? session.user : null;
    backend = user ? { ...supabaseBackend(user), uid: user.id } : null;
    setStatus({ signedIn: !!user, userId: user ? user.id : null, email: user ? user.email : null });
    if (user && user.id !== was) {
      try { sessionStorage.removeItem("hotl:market:ui"); } catch { /* private UI cache is per session */ }
      window.dispatchEvent(new CustomEvent("hotl:account-switch", { detail: { userId: user.id } }));
      pull();
    }
  };
  supabase.auth.getSession().then(({ data }) => onSession(data.session));
  supabase.auth.onAuthStateChange((_e, session) => onSession(session));
}
