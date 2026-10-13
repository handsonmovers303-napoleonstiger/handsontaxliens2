import React, { useEffect, useMemo, useRef, useState } from "react";
import { shrinkImage, getFix, gc } from "../../legacy/ScoutingDept.jsx";
import { money } from "../data";
import { useStore, useToast } from "../store";
import { useAllParcels } from "./Parcels";
import { ARTIFACT } from "../../lib/env";
import { Icon, ScreenLead, SecHead, Src } from "../ui";
import { Button } from "../ds";
import { withVisit } from "../propertyRecord";

export const SCOUT_PHOTOS = ["Front", "Rear", "Left side", "Right side", "Street", "Access", "Utilities", "Mail / notice"];
const OBS = [
  ["occupancy", "Occupancy", ["Occupied", "Vacant", "Unclear"]],
  ["neighbors", "Neighbor observation", ["Talked to one", "None home", "Not tried"]],
  ["structure", "Structure condition", ["None", "Sound", "Damaged", "Unclear"]],
  ["road", "Road condition", ["Paved", "Gravel / dirt", "None / blocked"]],
];
const today = () => new Date().toISOString().slice(0, 10);
async function sha256(s) { const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)); return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join(""); }
const bearing = (a, b) => { const r = Math.PI / 180, y = Math.sin((b[1] - a[1]) * r) * Math.cos(b[0] * r), x = Math.cos(a[0] * r) * Math.sin(b[0] * r) - Math.sin(a[0] * r) * Math.cos(b[0] * r) * Math.cos((b[1] - a[1]) * r); return (Math.atan2(y, x) / r + 360) % 360; };
const lsGet = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch {} };

function useGps() {
  const [g, setG] = useState({ state: "searching" });
  useEffect(() => {
    if (!navigator.geolocation) { setG({ state: "unavailable" }); return; }
    const id = navigator.geolocation.watchPosition((p) => setG({ state: "locked", lat: p.coords.latitude, lon: p.coords.longitude, acc: Math.round(p.coords.accuracy), heading: p.coords.heading }),
      (e) => setG({ state: e.code === 1 ? "denied" : "searching" }), { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 });
    return () => navigator.geolocation.clearWatch(id);
  }, []);
  return g;
}
function useCompass() {
  const [h, setH] = useState(null);
  useEffect(() => {
    const f = (e) => { const v = e.webkitCompassHeading != null ? e.webkitCompassHeading : e.absolute && e.alpha != null ? 360 - e.alpha : null; if (v != null) setH(Math.round(v)); };
    window.addEventListener("deviceorientationabsolute", f); window.addEventListener("deviceorientation", f);
    return () => { window.removeEventListener("deviceorientationabsolute", f); window.removeEventListener("deviceorientation", f); };
  }, []);
  return h;
}

export default function Field({ go }) {
  const { holo, patchHolo } = useStore();
  const all = useAllParcels();
  const byId = useMemo(() => new Map(all.map((p) => [p.id, p])), [all]);
  const options = [...new Set([...holo.mission, holo.focusParcel].filter(Boolean))].map((id) => byId.get(id)).filter(Boolean);
  const p = byId.get(holo.focusParcel) || options[0];
  const gps = useGps();
  const [day, setDay] = useState(lsGet("hotl:daylight") === "1");
  if (!p) return (
    <div className="materialize scout"><SecHead ix="05" title="Scout" sub="Record a site visit" />
      <ScreenLead does="Record what you saw at a property. There is no target selected yet." leads="A property file. Pick one, then come back here." />
      <div className="empty">No target. Open a property file and tap <b>Scout</b>, or add parcels to your mission.<br /><Button className="chip btn-chip cy" style={{ marginTop: 8 }} onClick={() => go("parcels")}>Open a property file</Button></div></div>);
  return <div className={day ? "daylight" : ""}><ScoutTarget key={p.id} p={p} options={options} gps={gps} day={day} setDay={(v) => { setDay(v); lsSet("hotl:daylight", v ? "1" : "0"); }} onPick={(id) => patchHolo(() => ({ focusParcel: id }))} /></div>;
}

function ScoutTarget({ p, options, gps, day, setDay, onPick }) {
  const { holo, patchHolo, photos, loadPhotosFor, savePhotosFor, setRec, dd, sync } = useStore();
  const toast = useToast();
  const heading = useCompass();
  const [busy, setBusy] = useState(false);
  const [aim, setAim] = useState(SCOUT_PHOTOS[0]);
  const [ov, setOv] = useState({ distance: true, heading: true, reticle: true });
  const camRef = useRef(null);
  const aimRef = useRef(aim);
  useEffect(() => { loadPhotosFor(p.id); }, [p.id, loadPhotosFor]);
  const list = photos[p.id] || [];
  const covered = new Set(list.map((x) => x.cat));
  const visit = holo.visits[p.id] || { obs: {}, note: "" };
  const setVisit = (patch) => patchHolo((h) => ({ visits: withVisit(h.visits, p.id, patch) }));
  const pin = holo.pins[p.id] || (p.lat != null ? { lat: p.lat, lon: p.lon, acc: null, src: "record" } : null);
  const here = gps.state === "locked" ? [gps.lat, gps.lon] : null;
  const distMi = pin && here ? gc(here, [pin.lat, pin.lon]) : null;
  const distTxt = distMi == null ? "—" : distMi < 0.1 ? `${Math.round(distMi * 5280)} ft` : `${distMi.toFixed(distMi < 10 ? 2 : 0)} mi`;
  const brg = pin && here ? Math.round(bearing(here, [pin.lat, pin.lon])) : null;
  const missionNo = holo.mission.indexOf(p.id);
  const latest = list[list.length - 1];

  const ingest = async (files) => {
    const cat = aimRef.current;
    if (!files || !files.length) return; setBusy(true);
    const fix = await getFix(); const added = [];
    for (const f of [...files].slice(0, 12)) {
      try { const thumb = await shrinkImage(f, 640); const hash = await sha256(thumb);
        if (list.some((x) => x.hash === hash) || added.some((x) => x.hash === hash)) continue;
        added.push({ id: `${p.id}:${hash}`, hash, thumb, cat, caption: "", time: new Date().toISOString(), fix, apn: p.apn, county: `${p.county}, ${p.state}`, name: f.name, bytes: thumb.length });
      } catch { /* unreadable file */ }
    }
    if (added.length) { await savePhotosFor(p.id, [...list, ...added]); toast(`${cat} captured${fix ? ` · ±${fix.acc}m` : ""}`); }
    setBusy(false);
  };
  const shoot = (cat) => { setAim(cat); aimRef.current = cat; if (camRef.current) camRef.current.click(); };
  const pinHere = () => { if (!here) return; patchHolo((h) => ({ pins: { ...h.pins, [p.id]: { lat: gps.lat, lon: gps.lon, acc: gps.acc, t: new Date().toISOString(), src: "gps" } } })); toast(`Pinned ±${gps.acc}m`); };
  const complete = (e) => {
    const full = list.length >= 4 && covered.size >= 3;
    setVisit({ completed: today(), by: sync && sync.email });
    const summary = [OBS.map(([k, l]) => (visit.obs[k] ? `${l}: ${visit.obs[k]}` : null)).filter(Boolean).join("; "), visit.note].filter(Boolean).join(" — ");
    if (full) setRec(p.id, "p4", { ...(dd[p.id] || {}).p4, stage: "verified", status: "clear", date: today(), source: `${list.length} field photos, ${covered.size} angles${list.some((x) => x.fix) ? ", GPS-stamped" : ""}`, sourceType: "Field observation", note: summary || "field photo set on file", by: sync && sync.email, confidence: "high" });
    if (visit.obs.occupancy) setRec(p.id, "x2", { ...(dd[p.id] || {}).x2, stage: visit.obs.occupancy === "Unclear" ? "field" : "evidence", status: "unchecked", date: today(), source: "Field visit", sourceType: "Field observation", note: `Observed: ${visit.obs.occupancy}`, by: sync && sync.email });
    toast(full ? "Visit complete · inspection verified" : "Visit logged · 4 photos across 3 angles verify the inspection", { x: e.clientX, y: e.clientY });
  };

  return (
    <div className="materialize scout">
      <SecHead ix="05" title="Scout" sub="Record a site visit" right={<Button className={`chip btn-chip ${day ? "gd" : ""}`} onClick={() => setDay(!day)}>{day ? "Turn daylight off" : "Turn daylight on"}</Button>} />
      <ScreenLead does="Save notes and photos from this visit onto the property file." leads="The property file and the mission you came from. A visit does not prove you own a certificate." />
      <div className="tactical" style={{ padding: 14 }}>
        {options.length > 1 && <select className="input" value={p.id} onChange={(e) => onPick(e.target.value)} style={{ marginBottom: 10 }} aria-label="Target">{options.map((o) => <option key={o.id} value={o.id}>{o.apn} · {o.label.slice(0, 50)}</option>)}</select>}
        <div className="micro cy">Target property{missionNo >= 0 ? ` · mission ${String(missionNo + 1).padStart(2, "0")} of ${String(holo.mission.length).padStart(2, "0")}` : " · not on mission"}</div>
        <div className="h2" style={{ lineHeight: 1.2, marginTop: 2 }}>{p.label}</div>
        <div className="dim num" style={{ fontSize: 12.5 }}>APN {p.apn} · {p.county}, {p.state} · {money(p.amount)}</div>
        <div className="grid g4" style={{ gap: 8, marginTop: 10 }}>
          <div className="stat"><div className="v">{distTxt}</div><div className="l">Distance</div></div>
          <div className="stat"><div className="v" style={{ color: gps.state === "locked" ? (gps.acc <= 15 ? "var(--emerald)" : "var(--cyan-2)") : "var(--amber)" }}>{gps.state === "locked" ? `±${gps.acc}m` : gps.state === "denied" || ARTIFACT ? "Off" : "…"}</div><div className="l">GPS accuracy</div></div>
          <div className="stat"><div className="v" style={{ fontSize: 14 }}>{holo.mission.length ? "Mission route" : "—"}</div><div className="l">Current route</div><div className="n">{holo.mission.length ? `${holo.mission.length} stops` : "no route"}</div></div>
          <div className="stat"><div className="v" style={{ fontSize: 14, color: sync && !sync.online ? "var(--amber)" : "var(--emerald)" }}>{sync && sync.local ? "Saved on device" : sync && !sync.online ? "Saved on device" : sync && sync.pending ? "Pending upload" : "Synced"}</div><div className="l">Sync</div><div className="n">{sync && !sync.online ? "offline · uploads on reconnect" : sync && sync.pending ? `${sync.pending} change${sync.pending > 1 ? "s" : ""} waiting` : "all changes stored"}</div></div>
        </div>

        <div className="visor holo-media" style={{ marginTop: 12, height: 250 }}>
          {latest ? <img src={latest.thumb} alt={latest.cat} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", opacity: .8 }} />
            : <div style={{ height: "100%", display: "grid", placeItems: "center", color: "var(--ink-3)", fontSize: 13 }}>Aim at {aim.toLowerCase()} and capture</div>}
          <div className="scan" /><span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
          {ov.reticle && <svg className="ar" viewBox="0 0 400 250" preserveAspectRatio="none" aria-hidden="true"><g stroke="rgba(0,229,255,.55)" strokeWidth="1" fill="none"><circle cx="200" cy="125" r="26" /><path d="M200 84v22M200 144v22M159 125h22M219 125h22" /></g></svg>}
          <div style={{ position: "absolute", top: 12, left: 14, right: 14, display: "flex", justifyContent: "space-between", gap: 6, flexWrap: "wrap" }}>
            {ov.distance && <span className="chip cy">{distMi == null ? (pin ? "No GPS fix" : "Parcel not pinned") : `${distTxt}${brg != null ? ` · bearing ${brg}°` : ""}`}</span>}
            {ov.heading && <span className="chip cy">{heading != null ? `Heading ${heading}°` : gps.heading != null ? `Course ${Math.round(gps.heading)}°` : "No compass"}</span>}
          </div>
          <div style={{ position: "absolute", left: 14, bottom: 12, right: 14, display: "flex", justifyContent: "space-between", alignItems: "end" }}>
            <span className="chip cy">{aim.toUpperCase()}{latest ? ` · last ${latest.time.slice(11, 16)}` : ""}</span>
            <Button className="btn" disabled={busy} onClick={() => camRef.current && camRef.current.click()} style={{ borderRadius: "50%", width: 60, height: 60, padding: 0 }} aria-label={`Capture ${aim}`}><Icon n="cam" s={24} /></Button>
          </div>
          <input ref={camRef} type="file" accept="image/*" capture="environment" multiple style={{ display: "none" }} onChange={(e) => { ingest(e.target.files); e.target.value = ""; }} />
        </div>
        <div className="row wrap" style={{ gap: 6, marginTop: 8 }}>
          {[["distance", "distance"], ["heading", "compass"], ["reticle", "reticle"]].map(([k, l]) => <Button key={k} className={`chip btn-chip ${ov[k] ? "cy" : ""}`} onClick={() => setOv({ ...ov, [k]: !ov[k] })}>{ov[k] ? `Hide ${l}` : `Show ${l}`}</Button>)}
          <span className="chip" style={{ whiteSpace: "normal" }}>Boundary, easement, flood and slope overlays need a parcel GIS layer, which is not on file</span>
        </div>
      </div>

      <div className="tactical" style={{ padding: 14, marginTop: 12 }}>
        <div className="row between"><div className="micro">Photos · {SCOUT_PHOTOS.filter((k) => covered.has(k)).length}/{SCOUT_PHOTOS.length} angles</div><span className="faint" style={{ fontSize: 11 }}>{list.length} on file · {list.filter((x) => x.fix).length} GPS-stamped</span></div>
        <div className="grid g2" style={{ gap: 8, marginTop: 8 }}>
          {SCOUT_PHOTOS.map((k) => { const last = [...list].reverse().find((x) => x.cat === k); const n = list.filter((x) => x.cat === k).length;
            return <Button key={k} className={`big-cap ${n ? "done" : ""}`} onClick={() => shoot(k)} disabled={busy}>
              {last && <img src={last.thumb} alt="" />}<Icon n={n ? "check" : "cam"} s={20} /><span style={{ flex: 1 }}>{n ? `Add another ${k.toLowerCase()} photo` : `Take the ${k.toLowerCase()} photo`}</span>{n > 0 && <span className="num" style={{ fontSize: 12 }}>{n}</span>}</Button>; })}
        </div>
        <div className="micro" style={{ marginTop: 14 }}>Observations</div>
        <div className="col" style={{ gap: 10, marginTop: 8 }}>
          {OBS.map(([k, l, opts]) => (
            <div key={k}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 5 }}>{l}</div>
              <div className="row wrap" style={{ gap: 6 }}>{opts.map((o) => <Button key={o} className={`chip btn-chip ${visit.obs[k] === o ? "cy" : ""}`} style={{ padding: "7px 12px", fontSize: 12.5 }} onClick={() => setVisit({ obs: { ...visit.obs, [k]: visit.obs[k] === o ? undefined : o } })}>{o}</Button>)}</div>
            </div>))}
        </div>
        <textarea id="scout-note" className="input" rows={3} style={{ marginTop: 10 }} placeholder="Field note…" value={visit.note || ""} onChange={(e) => setVisit({ note: e.target.value })} />
        <div className="row wrap" style={{ gap: 8, marginTop: 12 }}>
          <Button className="btn quiet" disabled={!here} onClick={pinHere}><Icon n="pin" s={16} /> {holo.pins[p.id] ? "Re-pin here" : "Pin parcel here"}</Button>
          <span className="sp" />
          <Button className="btn" onClick={complete}><Icon n="check" s={16} /> {visit.completed ? `Visit saved ${visit.completed} · update it` : "Save this visit"}</Button>
        </div>
        {ARTIFACT && <Src><b>In this view</b> GPS and compass are off, so photos carry no location. The deployed app on your phone stamps GPS.</Src>}
        <Src>Four photos across three angles verify the physical inspection on the mission tree. An occupancy call becomes evidence on the occupancy branch.</Src>
      </div>
    </div>
  );
}
