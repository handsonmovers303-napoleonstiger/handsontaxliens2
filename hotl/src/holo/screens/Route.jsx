import React, { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { planRoute, mapsLink, getFix, gc } from "../../legacy/ScoutingDept.jsx";
import { SEATS, money, allCounties, daysUntil, fmtDate, ddProgress, ddVerdict } from "../data";
import { parcelConfidence } from "../intel";
import { useStore } from "../store";
import { ARTIFACT } from "../../lib/env";
import { useAllParcels } from "./Parcels";
import { Bar, Icon, ScreenLead, SecHead, Src, Stat } from "../ui";
import { Button } from "../ds";

const PRI = { hi: ["High", 3, "rd"], md: ["Medium", 2, "gd"], lo: ["Low", 1, "cy"] };
const SORTS = [["distance", "Distance"], ["auction", "Auction date"], ["priority", "Priority"], ["value", "Value"], ["confidence", "Confidence"], ["gap", "Research gap"], ["field", "Field need"]];
const lsGet = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch {} };

export default function Route({ go }) {
  const { holo, patchHolo, dd, photos } = useStore();
  const all = useAllParcels();
  const byId = useMemo(() => new Map(all.map((p) => [p.id, p])), [all]);
  const countyByKey = useMemo(() => new Map(allCounties().map((c) => [c.key, c])), []);
  const [sort, setSortState] = useState(lsGet("hotl:route-sort") || "distance");
  const setSort = (s) => { setSortState(s); lsSet("hotl:route-sort", s); };
  const [locating, setLocating] = useState(false);

  const inspected = (id) => ["clear", "na"].includes(dd[id]?.p4?.status) || !!(holo.visits[id] && holo.visits[id].completed);
  const stops = holo.mission.map((id) => byId.get(id)).filter(Boolean).map((p) => {
    const pin = holo.pins[p.id]; const seat = SEATS[p.key]; const c = countyByKey.get(p.key);
    const at = pin ? { lat: pin.lat, lon: pin.lon, how: "pinned on site" } : p.lat != null ? { lat: p.lat, lon: p.lon, how: "record" } : seat ? { lat: seat[0], lon: seat[1], how: `county seat (${seat[2]})` } : null;
    const sale = c ? daysUntil(c.nextSale) : null;
    const conf = parcelConfidence(p, { recs: dd[p.id], photos: photos[p.id], visit: holo.visits[p.id], pin, county: c }).score;
    const v = ddVerdict(dd[p.id]);
    return { p, at, pri: holo.priority[p.id] || "md", sale: sale != null && sale >= 0 ? sale : null, saleIso: c && c.nextSale, conf, gap: 100 - ddProgress(dd[p.id]).pct, done: inspected(p.id), failed: v.label === "Do not bid" };
  });
  const routable = stops.filter((s) => s.at);
  const base = holo.base || (routable[0] ? { lat: routable[0].at.lat, lon: routable[0].at.lon, name: "First stop" } : null);
  const d0 = (s) => (base ? gc([base.lat, base.lon], [s.at.lat, s.at.lon]) : 0);
  const cmp = {
    auction: (a, b) => (a.sale ?? 1e9) - (b.sale ?? 1e9), priority: (a, b) => PRI[b.pri][1] - PRI[a.pri][1],
    value: (a, b) => (b.p.amount || 0) - (a.p.amount || 0), confidence: (a, b) => a.conf - b.conf, gap: (a, b) => b.gap - a.gap, field: (a, b) => (a.done - b.done) || (b.gap - a.gap),
  };
  const plan = useMemo(() => (base && routable.length ? planRoute(base, routable.map((s) => ({ lat: s.at.lat, lon: s.at.lon, name: `${s.p.apn} · ${s.p.county}`, kind: "parcel", id: s.p.id, county: s.p.key, deadline: s.saleIso || null })), "drive") : null),
    [JSON.stringify(base), JSON.stringify(routable.map((s) => [s.p.id, s.at, s.saleIso]))]);
  // sequence: the optimized drive for "distance", otherwise your chosen order
  const sequence = sort === "distance" && plan ? plan.legs.filter((l) => l.kind === "stop").map((l) => routable.find((s) => s.p.id === l.stop.id)).filter(Boolean)
    : [...routable].sort((a, b) => cmp[sort](a, b) || d0(a) - d0(b));
  const seqMiles = useMemo(() => { if (!base || !sequence.length) return 0; let m = 0, prev = [base.lat, base.lon]; for (const s of sequence) { m += gc(prev, [s.at.lat, s.at.lon]) * 1.25; prev = [s.at.lat, s.at.lon]; } return Math.round(m + gc(prev, [base.lat, base.lon]) * 1.25); }, [JSON.stringify(sequence.map((s) => s.p.id)), JSON.stringify(base)]);
  const hours = Math.round(((seqMiles / 50) + sequence.length * 25 / 60) * 10) / 10;
  const order = new Map(sequence.map((s, i) => [s.p.id, i + 1]));
  const listed = [...stops].sort((a, b) => (order.get(a.p.id) || 99) - (order.get(b.p.id) || 99));
  const done = stops.filter((s) => s.done).length;
  const useMyLocation = async () => { setLocating(true); const f = await getFix(); setLocating(false); if (f) patchHolo(() => ({ base: { lat: f.lat, lon: f.lon, name: "My location" } })); };

  return (
    <div className="materialize">
      <SecHead ix="06" title="Routes" sub="Plan the drive" right={<span className="chip num">{stops.length} stops</span>} />
      <ScreenLead does="Put the parcels you are going to visit in order." leads="Scout, one stop at a time." />
      <div className="row wrap" style={{ gap: 6, marginBottom: 12 }}>
        <span className="micro" style={{ marginRight: 4 }}>Sequence by</span>
        {SORTS.map(([k, l]) => <Button key={k} className={`chip btn-chip ${sort === k ? "cy" : ""}`} onClick={() => setSort(k)}>{l}</Button>)}
      </div>
      <div className="split">
        <div className="col" style={{ gap: 12 }}>
          <div className="tactical col" style={{ padding: 14 }}>
            <div className="row between"><div className="micro">Mission progress</div><span className="num dim" style={{ fontSize: 12 }}>{done}/{stops.length} inspected</span></div>
            <Bar pct={stops.length ? (done / stops.length) * 100 : 0} color="linear-gradient(90deg, var(--emerald), var(--cyan))" />
            <div className="grid g2" style={{ gap: 8, marginTop: 4 }}>
              <Stat v={sequence.length ? `${hours}h` : "—"} l="Estimated time" n="50 mph + 25 min per stop" />
              <Stat v={sequence.length ? `${seqMiles} mi` : "—"} l="Drive distance" n={plan && sort !== "distance" && plan.total.drive < seqMiles ? `${seqMiles - plan.total.drive} mi more than the distance order` : "straight line ×1.25"} />
              <Stat v={routable.length} l="Stops routed" n={stops.length - routable.length ? `${stops.length - routable.length} without coordinates` : "all located"} />
              <Stat v={stops.filter((s) => s.sale != null && s.sale <= 30).length} l="Auction ≤30d" n="gold stops" tone="var(--gold)" />
            </div>
            <div className="row wrap" style={{ gap: 8 }}>
              <Button className="btn quiet sm" onClick={useMyLocation} disabled={locating}><Icon n="gps" s={14} /> {locating ? "Locating…" : "Start from my location"}</Button>
              {holo.base && <Button className="btn quiet sm" onClick={() => patchHolo(() => ({ base: null }))}>Clear the start point</Button>}
              {base && sequence.length > 0 && <Button className="btn sm" href={mapsLink(base, sequence.map((s) => ({ lat: s.at.lat, lon: s.at.lon })))} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}><Icon n="nav" s={14} /> Open this drive in a map</Button>}
            </div>
          </div>
          <div className="tactical col scroll" style={{ padding: 14, gap: 6, maxHeight: "52vh" }}>
            <div className="micro">Mission sequence</div>
            {listed.map((s) => (
              <div key={s.p.id} className="list-item" style={{ cursor: "default" }}>
                <div className={`pin ${s.done ? "done" : s.failed ? "hi" : s.sale != null && s.sale <= 30 ? "md" : "lo"}`} style={{ width: 26, height: 26, flex: "0 0 auto" }}>{order.get(s.p.id) || "·"}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="num" style={{ fontSize: 12.5, fontWeight: 600 }}>{s.p.apn} <span className="faint" style={{ fontWeight: 400 }}>· intel {s.conf}</span></div>
                  <div className="dim" style={{ fontSize: 11.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.p.label}</div>
                  <div className="faint" style={{ fontSize: 10.5 }}>{s.at ? s.at.how : "no coordinates, pin it in Scout mode"} · {money(s.p.amount)}{s.sale != null ? ` · sale ${s.sale}d` : ""} · {s.done ? "inspected" : "not inspected"}</div>
                </div>
                <select className="input" style={{ width: 94, padding: "5px 26px 5px 8px", fontSize: 12 }} value={s.pri} onChange={(e) => patchHolo((h) => ({ priority: { ...h.priority, [s.p.id]: e.target.value } }))} aria-label="Field priority">
                  {Object.entries(PRI).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}
                </select>
              </div>))}
            {!stops.length && <div className="empty">No targets on the mission. <Button className="chip btn-chip cy" onClick={() => go("parcels")}>Open a property file</Button></div>}
          </div>
        </div>
        <div className="col" style={{ gap: 12 }}>
          <div className="projection" style={{ padding: 10 }}>
            <RouteMap base={base} sequence={sequence} />
            <div className="row wrap" style={{ gap: 10, marginTop: 10, fontSize: 11.5 }}>
              {[["lo", "Stop"], ["md", "Auction ≤30d"], ["hi", "Failed stop item"], ["done", "Inspected"], ["base", "Start"]].map(([k, l]) => <span key={k} className="row" style={{ gap: 6 }}><span className={`pin ${k}`} style={{ width: 12, height: 12, borderWidth: 1, animation: "none" }} /> {l}</span>)}
            </div>
            {ARTIFACT && <Src><b>Map:</b> street tiles are off in this view. Navigate opens the full route in Google Maps.</Src>}
          </div>
          {sequence.length > 0 && (
            <div className="tactical" style={{ padding: 14 }}>
              <div className="micro cy">Sequence · {SORTS.find((x) => x[0] === sort)[1].toLowerCase()}</div>
              <div className="col" style={{ marginTop: 8, gap: 2 }}>
                {sequence.map((s, i) => <div key={s.p.id} className="row" style={{ fontSize: 12.5, padding: "5px 0", borderBottom: "1px solid rgba(90,170,255,.06)" }}>
                  <span className="num" style={{ width: 26, color: "var(--cyan-2)" }}>{String(i + 1).padStart(2, "0")}</span><span style={{ flex: 1 }}>{s.p.apn} · {s.p.county}, {s.p.state}</span>
                  <span className="num dim">{s.saleIso ? fmtDate(s.saleIso) : "no sale date"}</span></div>)}
              </div>
              <Src>"Distance" runs the Scouting Department's planner: nearest neighbour with 2-opt, never reaching a county after its sale. Other orders follow your sort. Stops at a county seat are not the parcel; pin them on site.</Src>
            </div>)}
        </div>
      </div>
    </div>
  );
}

function RouteMap({ base, sequence }) {
  const el = useRef(null); const map = useRef(null); const layer = useRef(null);
  useEffect(() => {
    if (!el.current || map.current) return;
    map.current = L.map(el.current, { zoomControl: true, attributionControl: !ARTIFACT }).setView([39.5, -98.35], 4);
    // the artifact sandbox blocks tile images: stops and the route draw on a plain grid there
    if (!ARTIFACT) L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19,
      attribution: "Street map: Esri, HERE, Garmin, OpenStreetMap contributors" }).addTo(map.current);
    layer.current = L.layerGroup().addTo(map.current);
    return () => { map.current && map.current.remove(); map.current = null; };
  }, []);
  const sig = JSON.stringify([base, sequence.map((s) => [s.p.id, s.at, s.done, s.failed, s.sale])]);
  useEffect(() => {
    if (!map.current) return;
    layer.current.clearLayers();
    const pts = [];
    if (base) { L.marker([base.lat, base.lon], { icon: L.divIcon({ className: "", html: `<div class="pin base">◎</div>`, iconSize: [28, 28], iconAnchor: [14, 14] }) }).bindTooltip(base.name).addTo(layer.current); pts.push([base.lat, base.lon]); }
    sequence.forEach((s, i) => {
      const cls = s.done ? "done" : s.failed ? "hi" : s.sale != null && s.sale <= 30 ? "md" : "lo";
      L.marker([s.at.lat, s.at.lon], { icon: L.divIcon({ className: "", html: `<div class="pin ${cls}">${i + 1}</div>`, iconSize: [28, 28], iconAnchor: [14, 14] }) }).bindTooltip(`${s.p.apn} · ${s.at.how}`).addTo(layer.current);
      pts.push([s.at.lat, s.at.lon]);
    });
    if (base && sequence.length) {
      const line = L.polyline([[base.lat, base.lon], ...sequence.map((s) => [s.at.lat, s.at.lon]), [base.lat, base.lon]], { color: "#00e5ff", weight: 3, opacity: .95, className: "route-fiber" }).addTo(layer.current);
      const path = line.getElement && line.getElement(); if (path) path.setAttribute("pathLength", "100");
    }
    if (pts.length) map.current.fitBounds(L.latLngBounds(pts).pad(0.25), { maxZoom: 13 });
  }, [sig]);
  return <div ref={el} className={`map ${ARTIFACT ? "map-grid" : ""}`} />;
}
