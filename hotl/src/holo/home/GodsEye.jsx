import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ARTIFACT } from "../../lib/env";
import { countyGeo } from "../geo";
import { money, fmtDate } from "../data";
import { Button } from "../ds";
import { leafletRing } from "../propertyRecord";
import { dueFlags } from "../dueFlags";

export { dueFlags };

const AERIAL = "https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}";
const STREETS = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";

export function parcelPoint(p, pin) {
  if (pin && Number.isFinite(Number(pin.lat)) && Number.isFinite(Number(pin.lon))) return { lat: Number(pin.lat), lon: Number(pin.lon), kind: "pin" };
  if (p && Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lon))) return { lat: Number(p.lat), lon: Number(p.lon), kind: "record" };
  return null;
}

export function parcelRing(parcel) {
  return leafletRing(parcel);
}

export function PropertyEvidenceBadge({ status }) {
  return <span className={`chip eye-badge eye-${status.toLowerCase().replace(/\s+/g, "-")}`}>{status}</span>;
}

const geoCache = new Map();

export function useLocatedPoint(p, pin) {
  const fixed = parcelPoint(p, pin);
  const fixedKey = fixed ? `${fixed.kind}:${fixed.lat},${fixed.lon}` : "";
  const [hit, setHit] = useState(() => (!fixed && geoCache.has(p.id) ? geoCache.get(p.id) : null));
  const [status, setStatus] = useState(() => (fixed ? fixed.kind : geoCache.has(p.id) ? (geoCache.get(p.id) ? "search" : "none") : "loading"));
  useEffect(() => {
    if (fixed) { setHit(null); setStatus(fixed.kind); return undefined; }
    if (geoCache.has(p.id)) { setHit(geoCache.get(p.id)); setStatus(geoCache.get(p.id) ? "search" : "none"); return undefined; }
    const countyName = String(p.county || "").replace(/\s+city$/i, "");
    const q = [p.label, p.city, countyName, p.state].filter(Boolean).join(", ");
    if (q.length < 8) { setStatus("none"); return undefined; }
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 9000);
    setStatus("loading");
    fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=us&q=${encodeURIComponent(q)}`, { signal: ctrl.signal, headers: { Accept: "application/json" } })
      .then((r) => r.json())
      .then((rows) => {
        const row = Array.isArray(rows) ? rows[0] : null;
        const next = row && Number.isFinite(Number(row.lat)) ? { lat: Number(row.lat), lon: Number(row.lon), kind: "search", label: String(row.display_name || q) } : null;
        geoCache.set(p.id, next);
        setHit(next);
        setStatus(next ? "search" : "none");
      })
      .catch((err) => { if (err.name !== "AbortError") setStatus("none"); });
    return () => { clearTimeout(timer); ctrl.abort(); };
  }, [p.id, p.label, p.city, p.county, p.state, fixedKey]);
  return { point: fixed || hit, status: fixed ? fixed.kind : status };
}

function useParcelMap(el, { point, ring, fips, ground, interactive }) {
  const lat = point ? point.lat : null;
  const lon = point ? point.lon : null;
  const ringKey = ring ? ring.length : 0;
  useEffect(() => {
    if (!el.current || ARTIFACT) return undefined;
    const feature = fips ? countyGeo().features.find((f) => f.properties.fips === fips) : null;
    const view = L.map(el.current, {
      zoomControl: interactive, attributionControl: true, dragging: interactive, scrollWheelZoom: interactive, doubleClickZoom: interactive,
    });
    const tiles = ground === "streets"
      ? L.tileLayer(STREETS, { maxZoom: 19, attribution: "Street map: Esri, HERE, Garmin, OpenStreetMap contributors" })
      : L.tileLayer(AERIAL, { maxZoom: 18, maxNativeZoom: 16, attribution: "Aerial photo: USGS The National Map. Capture date is not on the tile." });
    tiles.addTo(view);
    if (feature) {
      const countyLayer = L.geoJSON(feature, { style: { color: "#00DDF5", weight: 3, fillColor: "#00DDF5", fillOpacity: 0.12 } }).addTo(view);
      if (lat == null) view.fitBounds(countyLayer.getBounds(), { padding: [16, 16], maxZoom: 11 });
    }
    let drawn = null;
    if (ring) drawn = L.polygon(ring, { color: "#00DDF5", weight: 3, fillColor: "#00DDF5", fillOpacity: 0.25 }).addTo(view);
    if (lat != null) {
      view.setView([lat, lon], ground === "streets" ? 16 : 17);
      L.circleMarker([lat, lon], { radius: 8, color: "#fff", weight: 2, fillColor: "#00DDF5", fillOpacity: 0.95 }).addTo(view);
    } else if (drawn) view.fitBounds(drawn.getBounds(), { padding: [16, 16], maxZoom: 17 });
    else if (!feature) view.setView([39.8, -98.6], 4);
    const timer = setTimeout(() => view.invalidateSize(), 60);
    return () => { clearTimeout(timer); view.remove(); };
  }, [el, lat, lon, ringKey, fips, ground, interactive]);
}

function FactLine({ label, value, status }) {
  return (
    <p className="eye-fact"><b>{label}.</b> {value} <PropertyEvidenceBadge status={status} /></p>
  );
}

export function DueDiligenceFlags({ flags }) {
  return (
    <section className="eye-sec">
      <h3>Due-diligence flags</h3>
      <p>Each flag is a gap or a note on file. An uncertain item is not stated as a fact.</p>
      {flags.map((f) => (
        <article key={f.title} className="eye-flag">
          <div className="row between wrap" style={{ gap: 6 }}>
            <b>{f.title}</b>
            <PropertyEvidenceBadge status={f.status} />
          </div>
          <p><b>Reason.</b> {f.reason}</p>
          <p><b>Evidence.</b> {f.evidence}</p>
          <p><b>Source.</b> {f.source} · <b>Confidence.</b> {f.confidence}</p>
          <p><b>Check.</b> {f.action}</p>
        </article>
      ))}
    </section>
  );
}

export function PropertyCardMapPreview({ p, point, status, ring, fips, flags, countyLine, saleLine, geometryStatus, onOpen }) {
  const el = useRef(null);
  const [ground, setGround] = useState("aerial");
  useParcelMap(el, { point, ring, fips, ground, interactive: true });
  const where = geometryStatus === "polygon" ? "The parcel line on file is drawn. It is not a new survey."
    : geometryStatus === "point" ? "Coordinate from the record. Parcel boundary not on file."
    : status === "search" ? "Location not on file. The dot is a geocoder match for the address, not the parcel."
    : status === "pin" ? "Location not on file. The dot is a site pin, not a surveyed boundary."
    : status === "loading" ? "Location not on file. Looking up the address so the picture can move."
    : "Location not on file. The cyan line is the county, not the parcel.";
  return (
    <div className="eye-block">
      <div className="row wrap" style={{ gap: 6 }}>
        <span className="micro cy">God’s Eye View</span>
        <div className="imap-hud-layers" role="radiogroup" aria-label="Picture">
          <Button role="radio" aria-checked={ground === "aerial"} className={ground === "aerial" ? "on" : ""} type="button" onClick={() => setGround("aerial")}>Aerial photo</Button>
          <Button role="radio" aria-checked={ground === "streets"} className={ground === "streets" ? "on" : ""} type="button" onClick={() => setGround("streets")}>Street map</Button>
        </div>
        <Button className="btn sm" type="button" onClick={onOpen}>Open this parcel</Button>
      </div>
      <div className="eye-preview">
        {!ARTIFACT ? <div ref={el} className="eye-map" /> : <div className="eye-empty"><b>Picture tiles are off in this view.</b></div>}
      </div>
      <p className="eye-fact"><b>{p.label}.</b> APN {p.apn} · {countyLine}{p.acres ? ` · ${p.acres} ac` : ""}</p>
      <p className="eye-fact">{saleLine}. {where} The county line is the Census boundary. Imagery date is not on the tile. {flags.length} due-diligence {flags.length === 1 ? "flag" : "flags"}.</p>
    </div>
  );
}

export function GodsEyeView({ record, p, point, status, ring, fips, flags, card, photos, visit, conf, parts, note, onNote, onSnapshot, snapshots, onClose, onScout }) {
  const parcel = record?.parcel || p;
  const line = record ? record.location.polygon : ring;
  const shownFlags = record ? record.godsEye.flags : flags;
  const field = record?.scouting?.visit || visit;
  const shots = record ? record.scouting.photos : photos;
  const el = useRef(null);
  const [ground, setGround] = useState("streets");
  const [elev, setElev] = useState(null);
  useParcelMap(el, { point, ring: line, fips, ground, interactive: true });
  useEffect(() => {
    if (!point) return undefined;
    const ctrl = new AbortController();
    fetch(`https://epqs.nationalmap.gov/v1/json?x=${point.lon}&y=${point.lat}&units=Feet&wkid=4326`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data) => {
        const v = Number(data?.value);
        setElev(Number.isFinite(v) && v > -1000 ? v : null);
      })
      .catch(() => setElev(null));
    return () => ctrl.abort();
  }, [point]);
  const sale = card?.sale?.display || "No county sale date on file";
  const saleType = card?.saleType?.display || "Sale type not checked";
  return (
    <div className="sheet eye-workspace" onClick={onClose}>
      <div className="eye-work" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="God's Eye View">
        <div className="row between wrap" style={{ gap: 8 }}>
          <div>
            <div className="micro cy">God’s Eye View · this parcel</div>
            <h2>{parcel.label}</h2>
            <p className="faint">APN {parcel.apn} · {parcel.county} County, {parcel.state}. The picture stayed on this property. It is not a live satellite.</p>
          </div>
          <Button className="btn quiet sm" type="button" onClick={onClose}>Close</Button>
        </div>
        <div className="imap-hud-layers" role="radiogroup" aria-label="Picture">
          <Button role="radio" aria-checked={ground === "aerial"} className={ground === "aerial" ? "on" : ""} type="button" onClick={() => setGround("aerial")}>Aerial photo</Button>
          <Button role="radio" aria-checked={ground === "streets"} className={ground === "streets" ? "on" : ""} type="button" onClick={() => setGround("streets")}>Street map</Button>
        </div>
        {!ARTIFACT ? <div ref={el} className="eye-map tall" /> : <p>Picture tiles are off in this view.</p>}
        <p className="faint">{status === "search" ? "The dot is a geocoder match for the address, not the parcel corner." : status === "loading" ? "Looking up the address." : "The cyan line is the county. A parcel line is drawn only when one is stored."} Aerial source: USGS. Imagery date is not on the tile. <PropertyEvidenceBadge status="UNKNOWN" /></p>
        {line ? <p>The cyan line is the polygon stored on this parcel. It is not a new survey. <PropertyEvidenceBadge status="SOURCE-BACKED" /></p> : <p>Parcel boundary not on file. No line is drawn. <PropertyEvidenceBadge status="NEEDS VERIFICATION" /></p>}

        <section className="eye-sec">
          <h3>Parcel</h3>
          <FactLine label="Address" value={parcel.label || "Not on file"} status={parcel.label ? "SOURCE-BACKED" : "UNKNOWN"} />
          <FactLine label="Acreage" value={parcel.acres ? `${parcel.acres} acres` : "Not on file"} status={parcel.acres ? "SOURCE-BACKED" : "UNKNOWN"} />
          <FactLine label="Amount on the list" value={parcel.amount != null ? money(parcel.amount) : "Not on file"} status={parcel.amount != null ? "SOURCE-BACKED" : "UNKNOWN"} />
          <FactLine label="Assessed value" value={parcel.value != null ? money(parcel.value) : "Not on file"} status={parcel.value != null ? "SOURCE-BACKED" : "UNKNOWN"} />
          <FactLine label="Zoning" value={(parcel.raw && parcel.raw.zone) || "Not on file"} status={parcel.raw && parcel.raw.zone ? "SOURCE-BACKED" : "UNKNOWN"} />
          <FactLine label="Owner" value={parcel.owner || "Not on file"} status={parcel.owner ? "SOURCE-BACKED" : "UNKNOWN"} />
        </section>

        <section className="eye-sec">
          <h3>Access</h3>
          <p>Public roads, driveways, and easements are not a layer in this file. {field?.obs?.road ? `Scout observation: “${field.obs.road}”. That is not an easement.` : "Nothing was recorded on site."}</p>
          <PropertyEvidenceBadge status={field?.obs?.road ? "USER-OBSERVED" : "NEEDS VERIFICATION"} />
        </section>

        <section className="eye-sec">
          <h3>Terrain</h3>
          {point && elev != null ? <p>One elevation point at this coordinate: {Math.round(elev).toLocaleString()} ft, from USGS. This is not a slope or a survey. <PropertyEvidenceBadge status="SOURCE-BACKED" /></p>
            : <p>Slope and terrain profile are not on file.{point ? " The elevation service did not return a number." : ""} <PropertyEvidenceBadge status="UNKNOWN" /></p>}
        </section>

        <section className="eye-sec">
          <h3>Structures</h3>
          <p>Assessor structure count is not on this row. The aerial photo was not read by a model. {field?.obs?.structure ? `Scout observation: “${field.obs.structure}”.` : "No structure observation is saved."}</p>
          <PropertyEvidenceBadge status={field?.obs?.structure ? "USER-OBSERVED" : "NEEDS VERIFICATION"} />
        </section>

        <section className="eye-sec">
          <h3>Environmental layers</h3>
          <p>Flood zone, wetlands, wildfire, and protected land are not on file. Nothing here means those constraints are absent. <PropertyEvidenceBadge status="UNKNOWN" /></p>
        </section>

        <section className="eye-sec">
          <h3>County</h3>
          <FactLine label="Sale type" value={saleType} status={card?.saleType?.value ? "SOURCE-BACKED" : "UNKNOWN"} />
          <FactLine label="County sale date" value={sale} status={card?.sale?.value ? "SOURCE-BACKED" : "UNKNOWN"} />
          <p className="faint">A county date is not this parcel’s sale, and it is not a bid. Last county check on file: {card?.lastCheck ? fmtDate(card.lastCheck) : "not recorded"}.</p>
        </section>

        <section className="eye-sec">
          <h3>Scout</h3>
          {shots && shots.length ? shots.map((ph, i) => (
            <figure key={ph.id || i} className="eye-photo">
              {ph.thumb ? <img src={ph.thumb} alt={ph.cat || "Field photo"} /> : null}
              <figcaption>{ph.cat || "Photo"} · {ph.time ? String(ph.time).slice(0, 10) : "date not stated"} · <PropertyEvidenceBadge status="USER-OBSERVED" /></figcaption>
            </figure>
          )) : <p>No field photo is saved. Private notes stay on this account. <PropertyEvidenceBadge status="UNKNOWN" /></p>}
          {field?.note && <p>Note. {field.note} <PropertyEvidenceBadge status="USER-OBSERVED" /></p>}
        </section>

        <DueDiligenceFlags flags={shownFlags} />

        <section className="eye-sec">
          <h3>Research confidence {conf.score}%</h3>
          <p>This is how complete the file is. It is not a score for buying.</p>
          {parts.map(([key, label, help]) => (
            <p key={key}><b>{label}.</b> {conf.parts[key]}%. {help}</p>
          ))}
        </section>

        <section className="eye-sec">
          <h3>Notes</h3>
          <textarea className="input" rows={3} value={note} onChange={(e) => onNote(e.target.value)} placeholder="What you still need to check" />
          <div className="row wrap" style={{ gap: 8 }}>
            <Button className="btn sm" type="button" onClick={onSnapshot}>Save a research snapshot</Button>
            {onScout && <Button className="btn ghost sm" type="button" onClick={onScout}>Record a site visit</Button>}
          </div>
          {snapshots.map((s) => (
            <p key={s.at}><b>Research snapshot · {fmtDate(s.at.slice(0, 10))}.</b> {s.summary}</p>
          ))}
        </section>
      </div>
    </div>
  );
}
