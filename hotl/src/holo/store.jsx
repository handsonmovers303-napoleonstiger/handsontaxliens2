/* One state, two views. The hologram shell reads and writes the same record the
 * Scouting Department saves (hotl:scouting:v3): DD records, stars, verdicts, field
 * photos, positions. Holo-only choices (county status, mission list, pins, visit
 * notes, outcomes' lessons) live beside it in hotl:holo:v1. Both go through
 * window.storage, which syncs to Supabase. */
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { SCOUTING_KEY } from "../legacy/ScoutingDept.jsx";
import { onSyncStatus } from "../lib/storage";
import { withCheck } from "./propertyRecord";

const HOLO_KEY = "hotl:holo:v1";
const HOLO_DEFAULT = { countyStatus: {}, mission: [], priority: {}, pins: {}, visits: {}, parcelVerdict: {}, viewed: {}, bids: {}, registered: {}, watches: [], dossier: [], recentSearches: [], focusCounty: null, focusParcel: null, base: null };

const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);

async function readJSON(key) { try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : null; } catch { return null; } }

export function StoreProvider({ children }) {
  const [scout, setScout] = useState(null);   // the Scouting Department blob, untouched fields preserved
  const [holo, setHolo] = useState(HOLO_DEFAULT);
  const [sync, setSync] = useState(null);
  const [photos, setPhotos] = useState({});   // propId -> photo list (loaded on demand)
  const ready = scout !== null;

  const load = useCallback(async () => {
    const [s, h] = await Promise.all([readJSON(SCOUTING_KEY), readJSON(HOLO_KEY)]);
    setScout(s || {}); setHolo({ ...HOLO_DEFAULT, ...(h || {}) });
  }, []);
  useEffect(() => { load(); const f = () => load(); window.addEventListener("hotl:storage-pulled", f); return () => window.removeEventListener("hotl:storage-pulled", f); }, [load]);
  useEffect(() => onSyncStatus(setSync), []);

  // written straight through: window.storage is a local write, and the remote push is already debounced
  const persistScout = (next) => { window.storage.set(SCOUTING_KEY, JSON.stringify(next)); };
  const patchScout = useCallback((fn) => setScout((s) => { const next = fn(s || {}); persistScout(next); return next; }), []);
  const patchHolo = useCallback((fn) => setHolo((h) => { const next = { ...h, ...fn(h) }; window.storage.set(HOLO_KEY, JSON.stringify(next)); return next; }), []);

  const dd = (scout && scout.dd) || {};
  const setRec = useCallback((parcelId, itemId, rec) => patchScout((s) => ({ ...s, dd: withCheck(s.dd, parcelId, itemId, rec) })), [patchScout]);
  const stars = (scout && scout.stars) || {};
  const toggleStar = useCallback((k) => patchScout((s) => { const st = { ...(s.stars || {}) }; if (st[k]) delete st[k]; else st[k] = 3; return { ...s, stars: st }; }), [patchScout]);
  const positions = (scout && scout.positions) || [];
  const passes = (scout && scout.passes) || [];
  const setPositions = useCallback((fn) => patchScout((s) => ({ ...s, positions: fn(s.positions || []) })), [patchScout]);
  const addProperty = useCallback((p) => patchScout((s) => { const ps = s.properties || []; return ps.some((x) => x.id === p.id) ? s : { ...s, properties: [...ps, p] }; }), [patchScout]);

  const loadPhotosFor = useCallback(async (propId) => { const r = await readJSON(`hotl:photos:${propId}`); setPhotos((m) => ({ ...m, [propId]: r || [] })); return r || []; }, []);
  const savePhotosFor = useCallback(async (propId, list) => { setPhotos((m) => ({ ...m, [propId]: list })); await window.storage.set(`hotl:photos:${propId}`, JSON.stringify(list));
    patchScout((s) => ({ ...s, photoCounts: { ...(s.photoCounts || {}), [propId]: list.length } })); }, [patchScout]);
  const photoCount = (propId) => (photos[propId] ? photos[propId].length : ((scout && scout.photoCounts) || {})[propId] || 0);

  const value = { ready, scout, holo, patchHolo, patchScout, dd, setRec, stars, toggleStar, positions, passes, setPositions, addProperty,
    photos, loadPhotosFor, savePhotosFor, photoCount, sync, reload: load };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/* toast + particle confirmations */
const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);
export function ToastProvider({ children }) {
  const [t, setT] = useState(null);
  const [burst, setBurst] = useState(null);
  const show = useCallback((msg, at) => {
    setT(msg); setTimeout(() => setT(null), 2400);
    if (at) { setBurst({ x: at.x, y: at.y, k: Date.now() }); setTimeout(() => setBurst(null), 1000); }
  }, []);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {t && <div className="toast" role="status">{t}</div>}
      {burst && <div className="particles" key={burst.k} style={{ left: burst.x, top: burst.y }}>
        {Array.from({ length: 14 }, (_, i) => { const a = (i / 14) * Math.PI * 2, d = 26 + (i % 3) * 14;
          return <i key={i} style={{ "--dx": `${Math.cos(a) * d}px`, "--dy": `${Math.sin(a) * d}px` }} />; })}
      </div>}
    </ToastCtx.Provider>
  );
}
