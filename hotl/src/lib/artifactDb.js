/* The artifact's own db store, as a window.storage backend (artifact build only).
 *
 *   data/users/<you>/<key>   your research: DD records, stars, mission, pins,
 *                            outcomes. Private to you, synced across your devices.
 *   team/<key>               field evidence every scout should see: parcel photos
 *                            (hotl:photos:*) and county call logs (hotl:calls:*).
 *
 * A value can outgrow one document (256 KiB), so it is split into parts that share
 * a timestamp. Parts after the first are written first and the head last; a reader
 * only accepts a value when every part carries the head's timestamp, so a
 * half-written value is never read. */

const TEAM = /^hotl:(photos|calls):/;
const PART = 100000;   // characters per document, well under 256 KiB serialized

/** Key -> document id: path segments allow letters, digits and _ - . ~ : @ + only. */
const seg = (key) => encodeURIComponent(key).replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase()).replace(/%/g, "+");
const partId = (key, i) => (i ? `${seg(key)}~~${i}` : seg(key));

function assemble(docs) {
  const byKey = new Map();
  for (const d of docs) {
    const b = d.data ? d.data() : d;
    if (!b || typeof b.k !== "string") continue;
    (byKey.get(b.k) || byKey.set(b.k, []).get(b.k)).push(b);
  }
  const rows = [], parts = new Map();
  for (const [key, list] of byKey) {
    parts.set(key, Math.max(...list.map((b) => (b.i || 0) + 1)));
    const head = list.find((b) => !b.i);
    if (!head) continue;
    const same = list.filter((b) => b.t === head.t).sort((a, b) => (a.i || 0) - (b.i || 0));
    if (same.length !== head.n) continue;   // mid-write: wait for the rest
    rows.push({ key, v: same.map((b) => b.v).join(""), t: head.t });
  }
  return { rows, parts };
}

export async function artifactBackend() {
  const c = typeof window !== "undefined" && window.claude;
  if (!c || typeof c.use !== "function") return null;
  const [db, user] = await Promise.all([c.use("db"), c.use("user")]);
  if (!db) return null;
  const uid = user ? await user.id() : null;
  const canWrite = user ? await user.can("data.write") : null;
  const mine = uid ? db.collection(`data/users/${uid}`) : null;
  const team = db.collection("team");
  const colFor = (key) => (TEAM.test(key) ? team : mine);
  const known = new Map();   // key -> parts currently stored, so shrinking values drop their tail

  const learn = (parts) => { for (const [k, n] of parts) known.set(k, Math.max(known.get(k) || 0, n)); };
  const fail = (e) => {
    const err = new Error(e && e.code === "invalid_argument" ? "You can view this research but not change it here." :
      e && e.code === "quota_exceeded" ? "Shared storage is full. Delete old photos to free space." : (e && e.message) || "Sync failed");
    err.readOnly = e && e.code === "invalid_argument";
    return err;
  };

  return {
    shared: true, private: !!mine, readOnly: canWrite === false,
    accepts: (key) => !!colFor(key),
    async push(entries) {
      const done = [];
      for (const { key, v, t } of entries) {
        const col = colFor(key); if (!col) continue;   // personal key with no private subtree: stays local
        const n = Math.max(1, Math.ceil(v.length / PART));
        try {
          for (let i = n - 1; i >= 0; i--) await col.doc(partId(key, i)).set({ k: key, t, n, i, v: v.slice(i * PART, (i + 1) * PART) });
          for (let i = n; i < (known.get(key) || 0); i++) await col.doc(partId(key, i)).delete();
        } catch (e) { throw fail(e); }
        known.set(key, n); done.push(key);
      }
      return done;
    },
    async pull() {
      const snaps = await Promise.all([team.limit(1000).get(), mine ? mine.limit(1000).get() : null]);
      const docs = snaps.filter(Boolean).flatMap((s) => s.docs.filter((d) => d.exists));
      const { rows, parts } = assemble(docs); learn(parts);
      return rows;
    },
    async remove(key) {
      const col = colFor(key); if (!col) return;
      for (let i = 0; i < Math.max(1, known.get(key) || 1); i++) await col.doc(partId(key, i)).delete();
      known.delete(key);
    },
    /** Live: other scouts' photos and call logs, and your other devices. Subscribed once. */
    subscribe(onRows) {
      const latest = { team: [], mine: [] };
      const deliver = () => { const { rows, parts } = assemble([...latest.team, ...latest.mine]); learn(parts); onRows(rows); };
      const unsubs = [team.limit(1000).onSnapshot((s) => { latest.team = s.docs; deliver(); }, () => {})];
      if (mine) unsubs.push(mine.limit(1000).onSnapshot((s) => { latest.mine = s.docs; deliver(); }, () => {}));
      return () => unsubs.forEach((u) => u());
    },
  };
}
