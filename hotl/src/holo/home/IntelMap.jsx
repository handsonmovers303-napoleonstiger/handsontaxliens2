import React, { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { geoAlbersUsa } from "d3-geo";
import { usGeometry, frame, countyGeo } from "../geo";
import { COVERAGE, coverageMap } from "./model";
import { getCountyData } from "./countyData";
import { SEATS } from "../../legacy/ScoutingDept.jsx";
import { useLocatedPoint } from "./GodsEye";
import { FactRow } from "./Evidence";
import { Button } from "../ds";
import { ARTIFACT } from "../../lib/env";
import { leafletRing } from "../propertyRecord";
import { mountGis } from "../gis/mountGis";

// us-atlas's pre-projected geometry uses exactly this projection, so points line up
const proj = geoAlbersUsa().scale(1300).translate([487.5, 305]);
const FILL = { inventory: "rgba(67,133,255,.58)", verified: "rgba(67,133,255,.42)", sale: "rgba(67,133,255,.28)", statute: "rgba(67,133,255,.13)", none: "url(#unresearched)" };

/**
 * Drill-down: United States → state → county → parcel. The view frames whatever is
 * selected; results are outlined; unresearched areas are hatched, never blank.
 */
export function IntelMap({ counties, results, selFips, selState, parcel, point, god, openParcel, research, onParcel, onCounty, onState, onReset, markers, showCounties = true, showParcels = true, basemap = "aerial", gis = null, onGis = null, parcelPool = [] }) {
  const geo = usGeometry();
  const cov = coverageMap();
  const tipRef = useRef(null);
  const mapRef = useRef(null);
  const byFips = useMemo(() => new Map(counties.map((c) => [c.fips, c])), [counties]);
  const sel = selFips ? geo.byFips.get(selFips) : null;
  const st = selState ? geo.stateByAbbr.get(selState) : null;
  const vb = sel ? frame(sel.b, parcel ? 0.35 : 1.4) : st ? frame(st.b, 0.08) : `0 0 ${geo.width} ${geo.height}`;
  const vw = Number(vb.split(" ")[2]);
  const k = vw / geo.width;             // 1 at national scale, small when zoomed
  const inState = (f) => !selState || (byFips.get(f) && byFips.get(f).state === selState);
  const pinPts = (markers || []).map((m) => ({ ...m, xy: proj([m.lon, m.lat]) })).filter((m) => m.xy);
  const seat = sel && byFips.get(selFips) && SEATS[byFips.get(selFips).key];
  const seatXy = seat ? proj([seat[1], seat[0]]) : null;
  const [layer, setLayer] = useState("all");
  const frameName = sel && byFips.get(selFips) ? `${byFips.get(selFips).name} County` : st ? st.name : "United States";
  const tally = useMemo(() => {
    const rows = sel ? [sel] : geo.counties.filter((c) => !selState || byFips.get(c.fips)?.state === selState);
    let onFile = 0, open = 0, hit = 0;
    for (const c of rows) {
      if ((cov.get(c.fips) || "none") === "none") open += 1;
      else onFile += 1;
      if (results.has(c.fips)) hit += 1;
    }
    return { n: rows.length, onFile, open, hit };
  }, [sel, selState, geo, byFips, cov, results]);
  const fadeFor = (fips) => {
    let fade = inState(fips) ? 1 : 0.35;
    const cls = cov.get(fips) || "none";
    if (layer === "results" && !results.has(fips)) fade = Math.min(fade, 0.22);
    if (layer === "open" && cls !== "none") fade = Math.min(fade, 0.22);
    return fade;
  };

  const placeTip = (e) => {
    const tip = tipRef.current;
    const map = mapRef.current;
    if (!tip || !map) return;
    const fips = e.target?.getAttribute?.("data-f");
    if (!fips) { tip.hidden = true; return; }
    const data = getCountyData(fips, byFips.get(fips));
    tip.hidden = false;
    tip.querySelector("[data-name]").textContent = `${data.name} County`;
    tip.querySelector("[data-state]").textContent = data.state;
    tip.querySelector("[data-stat]").textContent = data.stat;
    const box = map.getBoundingClientRect();
    const width = tip.offsetWidth;
    const height = tip.offsetHeight;
    let x = e.clientX - box.left + 16;
    let y = e.clientY - box.top + 18;
    if (x + width > box.width - 8) x = e.clientX - box.left - width - 14;
    if (y + height > box.height - 8) y = e.clientY - box.top - height - 14;
    tip.style.transform = `translate3d(${Math.max(8, x)}px, ${Math.max(8, y)}px, 0)`;
  };

  const look = (
    <ParcelLook parcel={parcel} point={point} god={god} openParcel={openParcel} byFips={byFips} selFips={selFips} onCounty={onCounty} cov={cov} research={research} onParcel={onParcel} atlas={!!god} selState={selState} stateFips={st ? st.id : null} showCounties={showCounties} showParcels={showParcels} basemap={basemap} gis={gis} onGis={onGis} parcelPool={parcelPool} markers={markers} place={selFips && byFips.get(selFips) ? { lat: seat ? seat[0] : null, lon: seat ? seat[1] : null, name: seat ? seat[2] : null, county: byFips.get(selFips).name, state: byFips.get(selFips).state } : null} />
  );
  if (god) return <div className="imap god">{look}</div>;

  return (
    <div className="imap">
      <div className="imap-canvas" ref={mapRef}>
      <svg viewBox={vb} role="img" aria-label="Coverage map of US counties" onMouseLeave={() => { if (tipRef.current) tipRef.current.hidden = true; }}
        onMouseMove={placeTip}
        onClick={(e) => { const f = e.target.getAttribute && e.target.getAttribute("data-f"); if (f) onCounty(f); }}>
        <defs>
          <pattern id="unresearched" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill="#0b1220" /><line x1="0" y1="0" x2="0" y2="5" stroke="rgba(67,133,255,.16)" strokeWidth="1" /></pattern>
        </defs>
        <rect x="-2000" y="-2000" width="6000" height="6000" fill="#05070B" />
        <g>{geo.counties.map((c) => (
          <path key={c.fips} data-f={c.fips} d={c.d} fill={FILL[cov.get(c.fips) || "none"]}
            stroke={results.has(c.fips) ? "#00DDF5" : "rgba(168,184,202,.12)"} strokeWidth={(results.has(c.fips) ? 1.1 : 0.3) * k}
            opacity={fadeFor(c.fips)} className="imap-county" />))}
        </g>
        <path d={geo.stateMesh} fill="none" stroke="rgba(168,184,202,.45)" strokeWidth={0.8 * k} pointerEvents="none" />
        <path d={geo.nation} fill="none" stroke="rgba(67,133,255,.7)" strokeWidth={1.2 * k} pointerEvents="none" />
        {sel && <path d={sel.d} fill="rgba(0,221,245,.22)" stroke="#00DDF5" strokeWidth={2 * k} pointerEvents="none" style={{ filter: "drop-shadow(0 0 5px #00DDF5)" }} />}
        {(markers || []).length === 0 && null}
        {pinPts.map((m, i) => <circle key={i} cx={m.xy[0]} cy={m.xy[1]} r={3.5 * k} fill={m.kind === "parcel" ? "#00DDF5" : "#F4F8FC"} stroke="#05070B" strokeWidth={0.8 * k} pointerEvents="none" />)}
        {seatXy && <g pointerEvents="none"><rect x={seatXy[0] - 2.2 * k} y={seatXy[1] - 2.2 * k} width={4.4 * k} height={4.4 * k} fill="#F4F8FC" /><text x={seatXy[0] + 5 * k} y={seatXy[1] + 3 * k} fontSize={9 * k} fill="#F4F8FC">{seat[2]} (county seat)</text></g>}
        {/* place names stay legible above the fills */}
        {!selState && geo.states.map((s) => s.abbr && <text key={s.id} x={s.c[0]} y={s.c[1]} className="imap-state" textAnchor="middle" onClick={(e) => { e.stopPropagation(); onState(s.abbr); }}>{s.abbr}</text>)}
        {selState && !sel && geo.counties.filter((c) => byFips.get(c.fips) && byFips.get(c.fips).state === selState && (results.has(c.fips) || cov.get(c.fips) !== "none" && cov.get(c.fips) !== "statute")).map((c) =>
          <text key={c.fips} x={c.c[0]} y={c.c[1]} textAnchor="middle" fontSize={8.5 * k} fill="#F4F8FC" pointerEvents="none" style={{ paintOrder: "stroke", stroke: "#05070B", strokeWidth: 2.5 * k }}>{byFips.get(c.fips).name}</text>)}
        {sel && <text x={sel.c[0]} y={sel.b[0][1] - 6 * k} textAnchor="middle" fontSize={12 * k} fontWeight="700" fill="#F4F8FC" pointerEvents="none" style={{ paintOrder: "stroke", stroke: "#05070B", strokeWidth: 3 * k }}>{byFips.get(selFips) ? `${byFips.get(selFips).name} County` : ""}</text>}
      </svg>
      <div className="imap-tip" ref={tipRef} hidden>
        <div className="imap-tip-name" data-name />
        <div className="imap-tip-state" data-state />
        <div className="imap-tip-stat" data-stat />
      </div>
      <nav className="imap-crumbs" aria-label="Map location">
        <Button onClick={onReset}>Show every state</Button>
        {selState && <><span>›</span><Button onClick={() => onState(selState)}>Show {geo.stateByAbbr.get(selState) ? geo.stateByAbbr.get(selState).name : selState}</Button></>}
        {sel && byFips.get(selFips) && <><span>›</span><span className="cur">{byFips.get(selFips).name} County</span></>}
        {parcel && <><span>›</span><span className="cur">APN {parcel.apn}</span><span>›</span><span className="cur">Evidence</span></>}
      </nav>
      {parcel && !pinPts.some((m) => m.kind === "parcel") && <div className="imap-note">Parcel geometry is not on file for APN {parcel.apn}. {seatXy ? "The square marks the county seat, not the parcel." : ""} Pin it on site in field mode.</div>}
      </div>
      <div className="imap-legend">
        {Object.entries(COVERAGE).map(([k2, v]) => <span key={k2} title={v.note}><i style={{ background: k2 === "none" ? "repeating-linear-gradient(45deg,#0b1220 0 3px,rgba(67,133,255,.25) 3px 4px)" : FILL[k2] }} />{v.label}</span>)}
        <span><i style={{ background: "transparent", border: "1.5px solid #00DDF5" }} />In results</span>
      </div>
      <div className="imap-foot">Shading shows what we hold, not what exists. A hatched or empty county is not evidence that no auction or delinquent property exists there.</div>
      <aside className="imap-hud" aria-label="National view">
        <div>
          <div className="micro cy">National view</div>
          <div className="imap-hud-frame">{frameName}</div>
        </div>
        <p>{tally.onFile.toLocaleString()} on file · {tally.open.toLocaleString()} nothing on file · {tally.hit.toLocaleString()} in results</p>
        <div className="imap-hud-layers" role="radiogroup" aria-label="Map layer">
          {[["all", "Everything"], ["results", "In results"], ["open", "Nothing on file"]].map(([k, label]) => (
            <Button key={k} role="radio" aria-checked={layer === k} className={layer === k ? "on" : ""} onClick={() => setLayer(k)}>{label}</Button>
          ))}
        </div>
        <p className="imap-hud-note">County coverage. The shading is what this file holds, not whether a sale exists. Click a county to open its file. This is not a live satellite.</p>
      </aside>
      {look}
    </div>
  );
}

function parcelRing(parcel) {
  return leafletRing(parcel);
}

function metersBetween(aLat, aLon, bLat, bLon) {
  const p = Math.PI / 180;
  const dLat = (bLat - aLat) * p;
  const dLon = (bLon - aLon) * p;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * p) * Math.cos(bLat * p) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * 6371000 * Math.asin(Math.min(1, Math.sqrt(x))));
}

const LINE = {
  inventory: "#00DDF5",
  verified: "#6AA4FF",
  sale: "#C9D7FF",
  statute: "rgba(244,248,252,.72)",
  none: "rgba(244,248,252,.4)",
};

function inLens(cls, hold) {
  if (hold === "desk") return cls === "inventory" || cls === "verified";
  if (hold === "sale") return cls === "sale";
  if (hold === "open") return cls === "none";
  return true;
}

function boundsFor(features, keep) {
  let minLon = 180, maxLon = -180, minLat = 90, maxLat = -90, n = 0;
  for (const f of features) {
    if (!keep(f.properties.fips)) continue;
    const polys = f.geometry?.type === "Polygon" ? [f.geometry.coordinates] : f.geometry?.type === "MultiPolygon" ? f.geometry.coordinates : [];
    for (const poly of polys) for (const ring of poly) for (const p of ring) {
      if (p[0] < minLon) minLon = p[0];
      if (p[0] > maxLon) maxLon = p[0];
      if (p[1] < minLat) minLat = p[1];
      if (p[1] > maxLat) maxLat = p[1];
    }
    n += 1;
  }
  return n ? L.latLngBounds([minLat, minLon], [maxLat, maxLon]) : null;
}

function countyLineStyle(fips, selected, cov, hold, ground, atlasOpts) {
  if (atlasOpts?.atlas) {
    if (atlasOpts.showCounties === false) return { color: "#f4f1e8", weight: 0, opacity: 0, fillOpacity: 0 };
    const on = fips === selected;
    const inState = !atlasOpts.stateFips || String(fips).startsWith(atlasOpts.stateFips);
    return {
      color: on ? "#e2b657" : inState ? "#f7f1e4" : "rgba(247,241,228,.4)",
      weight: on ? 2.6 : inState ? 1.15 : 0.4,
      opacity: inState ? 0.95 : 0.28,
      fillColor: "#e2b657",
      fillOpacity: on ? 0.16 : 0,
    };
  }
  const cls = cov?.get(fips) || "none";
  const on = fips === selected;
  const shown = selected ? on : inLens(cls, hold);
  return {
    color: shown ? "#00DDF5" : "rgba(244,248,252,.28)",
    weight: on ? 3 : shown ? 2.5 : 0.4,
    opacity: shown ? 1 : 0.15,
    fillColor: "#00DDF5",
    fillOpacity: on ? 0.12 : shown ? 0.22 : 0,
  };
}

function paintCountyNames(map, group, centers, byFips, selected, cov, hold) {
  group.clearLayers();
  const bounds = map.getBounds().pad(0.08);
  const zoom = map.getZoom();
  const labelSet = hold === "desk" || hold === "sale";
  const add = (fips, center, marked) => {
    const county = byFips.get(fips);
    if (!county || !center) return;
    if (marked) L.circleMarker(center, { radius: 5, color: "#fff", weight: 2, fillColor: "#00DDF5", fillOpacity: 1, interactive: false }).addTo(group);
    const icon = L.divIcon({
      className: "god-county-name",
      html: county.name.replace(/[&<>]/g, (ch) => ({ "&": "&", "<": "<", ">": ">" }[ch])),
      iconSize: [120, 16],
      iconAnchor: [60, marked ? 16 : 8],
    });
    L.marker(center, { icon, interactive: false, keyboard: false }).addTo(group);
  };
  if (labelSet) {
    for (const [fips, center] of centers) {
      if (!inLens(cov.get(fips) || "none", hold)) continue;
      add(fips, center, true);
    }
    return;
  }
  if (selected) add(selected, centers.get(selected), true);
  if (zoom < 6) return;
  let n = 0;
  for (const [fips, center] of centers) {
    if (fips === selected || !bounds.contains(center) || !byFips.get(fips)) continue;
    add(fips, center, false);
    if (++n >= 70) break;
  }
}

function ParcelLook({ parcel, point, god, openParcel, place, byFips, selFips, onCounty, cov, research, onParcel, atlas = false, stateFips = null, showCounties = true, showParcels = true, basemap = "aerial", gis = null, onGis = null, parcelPool = [], markers = [] }) {
  const el = useRef(null);
  const map = useRef(null);
  const mark = useRef(null);
  const tiles = useRef(null);
  const line = useRef(null);
  const countiesLayer = useRef(null);
  const nameLayer = useRef(null);
  const onCountyRef = useRef(onCounty);
  const selRef = useRef(selFips);
  const showCountiesRef = useRef(showCounties);
  const identifyRef = useRef(null);
  const gisCtl = useRef(null);
  const onGisRef = useRef(onGis);
  const poolRef = useRef(parcelPool);
  const onParcelRef = useRef(onParcel);
  const framed = useRef("");
  const pinLayer = useRef(null);
  const [mapReady, setMapReady] = useState(0);
  onCountyRef.current = onCounty;
  selRef.current = selFips;
  showCountiesRef.current = showCounties;
  onGisRef.current = onGis;
  poolRef.current = parcelPool;
  onParcelRef.current = onParcel;
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState([]);
  const [searchState, setSearchState] = useState("idle");
  const [picked, setPicked] = useState(null);
  const [ground, setGround] = useState(openParcel ? "parcel" : "aerial");
  const [hold, setHold] = useState("desk");
  const holdRef = useRef(hold);
  const atlasRef = useRef(atlas);
  holdRef.current = hold;
  atlasRef.current = atlas;
  useEffect(() => { if (openParcel) setGround("parcel"); }, [openParcel]);
  const [frames, setFrames] = useState([]);
  const [frame, setFrame] = useState(0);
  const [photoState, setPhotoState] = useState("idle");
  const located = useLocatedPoint(parcel || { id: "_none", label: "", city: "", county: "", state: "" }, point && point.kind === "pin" ? point : null);
  const focus = picked
    ? { lat: picked.lat, lon: picked.lon, kind: "search" }
    : parcel && located.point
      ? { lat: located.point.lat, lon: located.point.lon, kind: located.status }
      : null;
  const lat = focus ? focus.lat : null;
  const lon = focus ? focus.lon : null;
  const picture = atlas ? (basemap === "street" || basemap === "streets" ? "streets" : basemap === "terrain" ? "terrain" : "aerial") : ground;
  const lookUp = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (q.length < 3) return;
    setSearchState("loading");
    setHits([]);
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=us&q=${encodeURIComponent(q)}`;
    fetch(url, { headers: { Accept: "application/json" } })
      .then((r) => r.json())
      .then((rows) => {
        const next = (Array.isArray(rows) ? rows : []).map((row) => ({
          lat: Number(row.lat), lon: Number(row.lon), label: String(row.display_name || q), query: q,
        })).filter((row) => Number.isFinite(row.lat) && Number.isFinite(row.lon));
        setHits(next);
        setPicked(next[0] || null);
        setSearchState(next.length ? "ready" : "none");
      })
      .catch(() => setSearchState("error"));
  };
  useEffect(() => {
    if ((!atlas && ground === "street" && lat != null) || !el.current) {
      if (map.current) { map.current.remove(); map.current = null; mark.current = null; tiles.current = null; line.current = null; countiesLayer.current = null; nameLayer.current = null; }
      return;
    }
    const y = lat ?? 39.8;
    const x = lon ?? -98.6;
    const pointZoom = picture === "streets" ? 16 : 16;
    if (!map.current) {
      map.current = L.map(el.current, { zoomControl: true, attributionControl: !ARTIFACT, minZoom: 3, fadeAnimation: false }).setView([y, x], 4);
      setMapReady(1);
    }
    const features = countyGeo().features;
    const placed = focus && (focus.kind === "search" || focus.kind === "pin" || focus.kind === "record");
    const ring = showParcels !== false ? parcelRing(parcel) : null;
    const pad = atlas
      ? { paddingTopLeft: [300, 72], paddingBottomRight: [400, 108], maxZoom: picture === "streets" ? 12 : 10, animate: true }
      : { padding: [28, 28], maxZoom: picture === "streets" ? 12 : 10, animate: true };
    const viewKey = `${stateFips || ""}|${selFips || ""}|${parcel?.id || ""}|${focus?.kind || ""}|${lat ?? ""}|${lon ?? ""}`;
    const moveCamera = framed.current !== viewKey;
    framed.current = viewKey;
    if (moveCamera) {
      if (ring) {
        /* The polygon effect frames a stored boundary. Do not also jump to the county. */
      } else if (placed) map.current.setView([lat, lon], pointZoom);
      else if (selFips) {
        const b = boundsFor(features, (id) => id === selFips);
        if (b) map.current.fitBounds(b, pad);
      } else if (stateFips) {
        const b = boundsFor(features, (id) => String(id).startsWith(stateFips));
        if (b) map.current.fitBounds(b, { ...pad, maxZoom: 7 });
      } else if (!atlas && (hold === "desk" || hold === "sale")) {
        const b = boundsFor(features, (id) => inLens(cov.get(id) || "none", hold));
        if (b) map.current.fitBounds(b, { padding: [28, 28], maxZoom: 7 });
      } else map.current.setView([39.8, -98.6], 4);
    }
    if (mark.current) { mark.current.remove(); mark.current = null; }
    if (lat != null && !ring) mark.current = L.circleMarker([lat, lon], { radius: 8, color: "#fff", weight: 2, fillColor: atlas ? "#e2b657" : "#00DDF5", fillOpacity: 0.9 }).addTo(map.current);
    map.current.invalidateSize();
    const timer = setTimeout(() => map.current && map.current.invalidateSize(), 200);
    return () => clearTimeout(timer);
  }, [lat, lon, ground, picture, focus?.kind, hold, selFips, stateFips, cov, atlas, showParcels, parcel, basemap]);
  useEffect(() => {
    if (!map.current || ARTIFACT) return;
    if (!countiesLayer.current) {
      const { features, centers } = countyGeo();
      countiesLayer.current = L.geoJSON({ type: "FeatureCollection", features }, {
        style: (f) => countyLineStyle(f.properties.fips, selFips, cov, hold, picture, { atlas, showCounties, stateFips }),
        onEachFeature: (f, layer) => {
          const id = f.properties.fips;
          const county = byFips.get(id);
          const held = COVERAGE[cov.get(id) || "none"];
          const tip = county ? `${county.name} County, ${county.state}. ${held.label}.` : `${f.properties.name} County`;
          layer.bindTooltip(tip, { sticky: true, className: "god-tip", direction: "top" });
          layer.on("click", (e) => {
            L.DomEvent.stopPropagation(e);
            if (!showCountiesRef.current) return;
            if (map.current && map.current.getZoom() >= 13 && identifyRef.current && identifyRef.current(e.latlng)) return;
            if (byFips.get(id)) onCountyRef.current(id);
          });
        },
      }).addTo(map.current);
      nameLayer.current = L.layerGroup().addTo(map.current);
      map.current.on("moveend", () => {
        if (map.current && nameLayer.current) paintCountyNames(map.current, nameLayer.current, centers, byFips, selRef.current, cov, atlasRef.current ? "all" : holdRef.current);
      });
      paintCountyNames(map.current, nameLayer.current, centers, byFips, selFips, cov, atlas ? "all" : hold);
    } else {
      countiesLayer.current.setStyle((f) => countyLineStyle(f.properties.fips, selFips, cov, hold, picture, { atlas, showCounties, stateFips }));
      const centers = countyGeo().centers;
      paintCountyNames(map.current, nameLayer.current, centers, byFips, selFips, cov, atlas ? "all" : hold);
    }
  }, [ground, picture, lat, lon, selFips, byFips, cov, hold, atlas, showCounties, stateFips]);
  useEffect(() => {
    if (!map.current || ARTIFACT) return;
    if (tiles.current) { map.current.removeLayer(tiles.current); tiles.current = null; }
    if (picture !== "terrain") {
      tiles.current = (picture === "streets"
        ? L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
            maxZoom: 19,
            attribution: 'Street map: Esri, HERE, Garmin, USGS, Intermap, INCREMENT P, NRCan, Esri Japan, METI, Esri China (Hong Kong), NOSTRA, OpenStreetMap contributors',
          })
        : L.tileLayer("https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}", {
            maxZoom: 18, maxNativeZoom: 16,
            attribution: 'Aerial photo: <a href="https://www.usgs.gov/programs/national-geospatial-program/national-map">USGS The National Map</a>',
          })).addTo(map.current);
      tiles.current.bringToBack();
    }
  }, [ground, picture, lat, lon]);
  useEffect(() => {
    if (!atlas || !map.current || ARTIFACT) return undefined;
    const ctl = mountGis(map.current, { onStatus: (row) => onGisRef.current && onGisRef.current(row) });
    gisCtl.current = ctl;
    identifyRef.current = (latlng) => ctl.identify(latlng);
    const county = selFips ? byFips.get(selFips) : null;
    ctl.update({ show: gis || {}, opacity: gis?.opacity || {}, county, parcelPool: poolRef.current, retry: gis?.retry || {}, onParcel: (p) => onParcelRef.current && onParcelRef.current(p) });
    return () => { ctl.destroy(); gisCtl.current = null; identifyRef.current = null; };
  }, [atlas, picture]);
  useEffect(() => {
    if (!gisCtl.current) return;
    gisCtl.current.update({
      show: gis || {},
      opacity: gis?.opacity || {},
      retry: gis?.retry || {},
      county: selFips ? byFips.get(selFips) : null,
      parcelPool: poolRef.current,
      onParcel: (p) => onParcelRef.current && onParcelRef.current(p),
    });
  }, [gis, selFips, byFips, picture]);
  useEffect(() => {
    const node = el.current;
    if (!node || typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(() => { if (map.current) map.current.invalidateSize(); });
    ro.observe(node);
    return () => ro.disconnect();
  }, [picture, ground, lat]);
  useEffect(() => {
    if (!map.current) return;
    if (line.current) { line.current.remove(); line.current = null; }
    if (showParcels === false) return;
    const county = selFips ? byFips.get(selFips) : null;
    const pool = atlas && county ? (parcelPool || []).filter((p) => p.key === county.key) : [];
    const group = L.layerGroup();
    const draw = (row, on) => {
      const ring = parcelRing(row);
      if (!ring) return null;
      const poly = L.polygon(ring, { color: "#e2b657", weight: on ? 3.5 : 2, fillColor: "#e2b657", fillOpacity: on ? 0.28 : 0.12 });
      poly.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        if (onParcelRef.current) onParcelRef.current(row);
      });
      poly.addTo(group);
      return poly;
    };
    let selected = null;
    if (atlas) {
      for (const row of pool) {
        const poly = draw(row, row.id === parcel?.id);
        if (row.id === parcel?.id) selected = poly;
      }
      if (parcel && !pool.some((row) => row.id === parcel.id)) selected = draw(parcel, true);
    } else selected = draw(parcel, true);
    if (!group.getLayers().length) return;
    group.addTo(map.current);
    line.current = group;
    if (selected) {
      map.current.fitBounds(selected.getBounds(), atlas
        ? { paddingTopLeft: [300, 72], paddingBottomRight: [400, 108], maxZoom: 16, animate: true }
        : { padding: [24, 24], maxZoom: 16, animate: true });
    }
  }, [parcel, showParcels, atlas, selFips, byFips, parcelPool, mapReady]);
  useEffect(() => {
    if (!map.current || !atlas) return;
    if (pinLayer.current) { pinLayer.current.remove(); pinLayer.current = null; }
    const group = L.layerGroup().addTo(map.current);
    pinLayer.current = group;
    for (const mark of markers || []) {
      if (mark.lat == null || mark.lon == null) continue;
      const dot = L.circleMarker([mark.lat, mark.lon], {
        radius: mark.kind === "parcel" ? 7 : 5,
        color: "#1a1408",
        weight: 1,
        fillColor: mark.kind === "parcel" ? "#e2b657" : "#7eb6ff",
        fillOpacity: 0.95,
      });
      dot.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        const hit = (poolRef.current || []).find((row) => row.id === mark.id);
        if (hit && onParcelRef.current) onParcelRef.current(hit);
      });
      dot.addTo(group);
    }
    return () => { if (pinLayer.current) { pinLayer.current.remove(); pinLayer.current = null; } };
  }, [markers, atlas, mapReady]);
  useEffect(() => () => { if (map.current) { map.current.remove(); map.current = null; } }, []);
  useEffect(() => {
    if (lat == null) { setFrames([]); setPhotoState("idle"); return; }
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12000);
    setPhotoState("loading");
    setFrames([]);
    setFrame(0);
    const body = new URLSearchParams({ lat: String(lat), lng: String(lon), radius: "150" });
    fetch("https://api.openstreetcam.org/1.0/list/nearby-photos/", { method: "POST", body, signal: ctrl.signal })
      .then((r) => r.json())
      .then((data) => {
        const rows = Array.isArray(data?.currentPageItems) ? data.currentPageItems : [];
        const next = rows.map((row) => {
          const path = row.lth_name || row.name;
          const y = Number(row.lat);
          const x = Number(row.lng);
          if (!path || !Number.isFinite(y) || !Number.isFinite(x)) return null;
          return { url: `https://api.openstreetcam.org/${path}`, meters: metersBetween(lat, lon, y, x), shot: row.shot_date || row.date_added || "date not stated" };
        }).filter(Boolean).sort((a, b) => a.meters - b.meters).slice(0, 12);
        setFrames(next);
        setPhotoState(next.length ? "ready" : "none");
      })
      .catch((err) => { if (err.name !== "AbortError") setPhotoState("error"); else setPhotoState((s) => s === "loading" ? "error" : s); });
    return () => { clearTimeout(timer); ctrl.abort(); };
  }, [lat, lon]);
  const photo = frames[frame];
  const frameLabel = focus?.kind === "search" ? picked.label
    : focus?.kind === "pin" || focus?.kind === "record" ? (parcel?.label || parcel?.apn || "Parcel on file")
    : place ? `${place.county} County, ${place.state}`
    : "United States";
  const frameTitle = place || parcel || focus ? frameLabel : hold === "desk" ? "Research desk" : hold === "sale" ? "Sale dates on file" : hold === "open" ? "Not yet researched" : frameLabel;
  const frameNote = focus?.kind === "search" && picked ? "Geocoder match for the address you typed. Not a survey, and it may not be the house."
    : parcel && located.status === "search" ? "Geocoder match for the address. Not a survey, and it may not be the house."
    : parcel && located.status === "loading" ? "Looking up the address so the picture can move."
    : parcel && located.status === "pin" ? "Pinned on a site visit. Not a surveyed boundary."
    : parcel && located.status === "record" ? "Coordinate from the record. Not a surveyed boundary."
    : parcel ? "No street address on this row. The cyan line is the county, not the parcel."
    : place ? "The cyan line is this county. No parcel is selected, so there is no property dot."
    : "Research desk. These counties have a parcel list or terms that were read. A dim county is still there. This is not a map of every tax sale.";
  return (
    <div className="parcel-look" id="parcel-line">
      <div className="micro cy">God view</div>
      <p>Look at the ground and open a county file. The picture is not a survey, and it is not a sale.</p>
      <div className="micro cy">Place</div>
      <div className="imap-hud-frame">{frameTitle}</div>
      <p>{frameNote}</p>
      {selFips && <p>{COVERAGE[cov.get(selFips) || "none"].label}. {COVERAGE[cov.get(selFips) || "none"].note}.</p>}
      {research && (
        <div className="god-brief">
          <div className="micro cy">County facts</div>
          <p>What the file says for this county. Click a fact to see its source.</p>
          {research.facts.map(([label, f]) => f ? <FactRow key={label} f={f} label={label} /> : <p key={label}>{label}: not checked.</p>)}
          <p>{research.inventory}{research.inventoryNote ? ` · ${research.inventoryNote}` : ""}</p>
          {research.parcels.length > 0 && (
            <>
              <div className="micro cy">Parcels on this list</div>
              <div className="row wrap" style={{ gap: 6 }}>
                {research.parcels.map((p) => <Button key={p.id} className="btn ghost sm" type="button" onClick={() => onParcel(p)}>{p.label || p.apn}</Button>)}
              </div>
            </>
          )}
        </div>
      )}
      <form className="parcel-search" onSubmit={lookUp}>
        <div className="micro cy">Find a place</div>
        <input className="input" aria-label="Address to move the picture" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="US address or place" />
        <Button className="btn sm" type="submit">Look up</Button>
        {picked && <Button className="btn ghost sm" type="button" onClick={() => { setPicked(null); setHits([]); setSearchState("idle"); }}>Clear search</Button>}
      </form>
      <div className="micro cy">Picture</div>
      <div className="imap-hud-layers" role="radiogroup" aria-label="Picture">
        <Button role="radio" aria-checked={ground === "aerial"} className={ground === "aerial" ? "on" : ""} type="button" onClick={() => setGround("aerial")}>Aerial photo</Button>
        <Button role="radio" aria-checked={ground === "streets"} className={ground === "streets" ? "on" : ""} type="button" onClick={() => setGround("streets")}>Street map</Button>
        <Button role="radio" aria-checked={ground === "street"} className={ground === "street" ? "on" : ""} type="button" onClick={() => setGround("street")}>Street view</Button>
        <Button role="radio" aria-checked={ground === "parcel"} className={ground === "parcel" ? "on" : ""} type="button" onClick={() => setGround("parcel")}>Parcel line</Button>
      </div>
      <p>Aerial photo and street map show the place. Street view is a photo from the ground, if one is within 150 meters. Parcel line draws a boundary only when one is stored.</p>
      <div className="micro cy">What to work</div>
      <div className="imap-hud-layers" role="radiogroup" aria-label="What to work">
        <Button role="radio" aria-checked={hold === "desk"} className={hold === "desk" ? "on" : ""} type="button" onClick={() => setHold("desk")}>Lists and terms</Button>
        <Button role="radio" aria-checked={hold === "sale"} className={hold === "sale" ? "on" : ""} type="button" onClick={() => setHold("sale")}>Sale date only</Button>
        <Button role="radio" aria-checked={hold === "open"} className={hold === "open" ? "on" : ""} type="button" onClick={() => setHold("open")}>Not started</Button>
        <Button role="radio" aria-checked={hold === "all"} className={hold === "all" ? "on" : ""} type="button" onClick={() => setHold("all")}>Whole country</Button>
      </div>
      <p>{hold === "desk" ? "A parcel list is on file, or the county’s terms were read. Open one to see the facts." : hold === "sale" ? "A sale date is recorded. The county page behind it may not have been read. This is not every sale." : hold === "open" ? "Nothing is on file for the bright counties. That is not evidence that no sale exists." : "Every county. The color is still only what this file holds."}</p>
      {(hold === "desk" || hold === "sale") && (
        <div className="god-queue" aria-label="Counties in this set">
          {[...byFips.values()].filter((c) => inLens(cov.get(c.fips) || "none", hold)).sort((a, b) => a.state.localeCompare(b.state) || a.name.localeCompare(b.name)).map((c) => (
            <Button key={c.fips} className={`btn ghost sm ${selFips === c.fips ? "on" : ""}`} type="button" onClick={() => onCounty(c.fips)}>{c.name}, {c.state}</Button>
          ))}
        </div>
      )}
      {searchState === "loading" && <p>Looking up that address.</p>}
      {searchState === "none" && <p>No US match for that address. Street view was not moved.</p>}
      {searchState === "error" && <p>The address search did not answer. Street view was not moved.</p>}
      {hits.length > 1 && (
        <div className="col" style={{ gap: 6 }}>
          {hits.map((hit) => (
            <Button key={`${hit.lat},${hit.lon}`} className={`btn ghost sm ${picked === hit ? "on" : ""}`} type="button" onClick={() => setPicked(hit)}>{hit.label}</Button>
          ))}
        </div>
      )}
      {picked && <p>{picked.label}</p>}
      {parcel && !picked && lat == null && focus?.kind !== "seat" && <div className="imap-hud-frame">{parcel.label || parcel.apn}</div>}
      {ground === "street" && lat != null ? (
        <>
          {photoState === "loading" && <p className="parcel-wait">Loading the street-level photo…</p>}
          {photoState === "none" && <p>No street-level photo within 150 meters of this point. Street view cannot show the house from here.</p>}
          {photoState === "error" && <p>The street-level photo did not load.</p>}
          {photo && (
            <figure className="parcel-street">
              <img src={photo.url} alt="Street-level photo near the searched point" />
              <figcaption>Shot {photo.shot}. About {photo.meters.toLocaleString()} m from the point. Not a photo of a parcel boundary, and it may not show the house. Source: KartaView / OpenStreetCam.</figcaption>
              <div className="row wrap" style={{ gap: 8 }}>
                <Button className="btn ghost sm" type="button" disabled={frame === 0} onClick={() => setFrame(frame - 1)}>Previous frame</Button>
                <Button className="btn ghost sm" type="button" disabled={frame >= frames.length - 1} onClick={() => setFrame(frame + 1)}>Next frame</Button>
              </div>
            </figure>
          )}
          <a className="btn ghost sm" href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lon}`} target="_blank" rel="noreferrer">Open another street-level view at this point</a>
        </>
      ) : (
        <>
          {ground === "street" && lat == null && <p>Look up an address to open a street-level photo. The map below stays the aerial photo until then.</p>}
          <div ref={el} className="parcel-look-map" />
          {ARTIFACT && <p>Picture tiles are off in this view.</p>}
          <div className="imap-legend" aria-label="What the line color means">
            {Object.entries(COVERAGE).map(([k, v]) => <span key={k} title={v.note}><i style={{ background: k === "none" ? "transparent" : LINE[k], border: "1px solid rgba(244,248,252,.7)" }} />{v.label}</span>)}
          </div>
          <p className="imap-hud-note">{parcelRing(parcel) ? "The line is the polygon stored on this parcel. It is not a new survey." : place || parcel ? "The cyan line is the county. A parcel line is drawn only when one is stored. A searched address is not a parcel boundary." : "Line color is what this file holds, not whether a sale exists. A dim county is still there. Nothing on file is not a county with no sale."}</p>
        </>
      )}
    </div>
  );
}
