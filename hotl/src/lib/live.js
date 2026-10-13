/* THE LIVE LAYER — corrections the team has verified, laid over the bundled tables.
 *
 * Fills window.__hotlLive (Map "<fips>:<field>" -> row) from the county_intel_current
 * view, and window.__hotlOutreach (Map fips -> latest outreach) from outreach_latest.
 * Every NEXT_SALE / HARD_DEADLINES / otcFor lookup in the Scouting Department reads
 * through these maps, so a verified correction shows everywhere the moment it lands.
 * Reads need a signed-in scout (RLS); signed out, the bundled verified data stands.
 *
 * A saved row in county_intel reloads that view at once when Realtime is on for
 * the table. The view itself is not a Realtime source. The 10-minute refresh
 * stays, because a closed socket or a table left out of the publication would
 * otherwise go stale. This does not fetch county websites. */
import { supabase } from "./supabase";

let state = { loaded: false, rows: 0, at: null, error: null, listen: "off" };
const subs = new Set();
export const onLive = (f) => { subs.add(f); f(state); return () => subs.delete(f); };
const emit = () => { subs.forEach((f) => f(state)); window.dispatchEvent(new CustomEvent("hotl:live", { detail: state })); };

async function pageAll(table, cols) {
  const out = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase.from(table).select(cols).range(from, from + 999);
    if (error) throw error;
    out.push(...data);
    if (data.length < 1000) return out;
  }
}

export async function loadLive() {
  try {
    const rows = await pageAll("county_intel_current", "fips,field,value,source,confidence,author_name,created_at");
    const m = new Map();
    for (const r of rows) m.set(`${r.fips}:${r.field}`, r);
    window.__hotlLive = m;
    try {
      const mail = await pageAll("outreach_latest", "*");
      window.__hotlOutreach = new Map(mail.map((r) => [r.fips, r]));
    } catch { /* outreach is optional */ }
    state = { ...state, loaded: true, rows: rows.length, at: new Date().toISOString(), error: null };
  } catch (e) {
    state = { ...state, error: e.message || String(e) };
  }
  emit();
  return state;
}

let channel = null;
let reloadTimer = null;
function scheduleReload() {
  clearTimeout(reloadTimer);
  reloadTimer = setTimeout(() => { loadLive(); }, 400);
}

function listen() {
  if (channel) return;
  // Private so Realtime applies the table's SELECT policy. A public channel
  // does not. The payload is ignored on purpose: the view is reloaded instead,
  // and a client filter would not be a security check.
  channel = supabase.channel("county-intel-live", {
    config: { private: true, postgres_changes_options: { wait: true } },
  })
    .on("postgres_changes", { event: "*", schema: "public", table: "county_intel" }, () => scheduleReload())
    .subscribe((status) => {
      const listen = status === "SUBSCRIBED" ? "realtime" : status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED" ? "poll" : "connecting";
      state = { ...state, listen };
      emit();
    });
}

function stopListening() {
  clearTimeout(reloadTimer);
  if (channel) supabase.removeChannel(channel);
  channel = null;
  state = { ...state, listen: "off" };
  emit();
}

export function installLive() {
  const go = (session) => {
    if (!session) { stopListening(); return; }
    loadLive();
    listen();
  };
  supabase.auth.getSession().then(({ data }) => go(data.session));
  supabase.auth.onAuthStateChange((evt, session) => {
    if (evt === "SIGNED_IN" || evt === "TOKEN_REFRESHED") go(session);
    if (evt === "SIGNED_OUT") stopListening();
  });
  // Fallback when Realtime is off, the socket drops, or the table is not in the publication.
  setInterval(() => supabase.auth.getSession().then(({ data }) => { if (data.session) loadLive(); }), 10 * 60 * 1000);
}

/** Team-submitted correction: goes to county_intel as REPORTED; review promotes it. */
export async function reportIntel({ fips, field, value, source, authorName }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in to submit intel");
  const { error } = await supabase.from("county_intel").insert({ fips, field, value, source, confidence: "REPORTED", author: user.id, author_name: authorName || user.email });
  if (error) throw error;
  await loadLive();
}
