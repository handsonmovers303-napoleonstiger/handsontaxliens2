import React, { useEffect, useMemo, useState } from "react";
import { countyDetail, fmtDate, money } from "../data";
import { Button } from "../ds";
import { evidenceLabel, leafletRing, researchGate } from "../propertyRecord";
import { COVERAGE_LABEL, LAYER_INFO, coverageCounts, coverageOf, parcelSourceFor } from "../gis/registry";
import { linkStatus } from "../linkCheck";

const STEPS = [
  ["discover", "Discover"],
  ["verify", "Verify"],
  ["analyze", "Analyze"],
  ["diligence", "Due diligence"],
];

const RESOURCE_ROWS = [
  ["assessor", "Assessor link", /assessor/i],
  ["gis", "Parcel viewer", /\bgis\b|parcel viewer/i],
  ["rules", "Auction rules", /rule|statute|bid/i],
  ["adjourned", "Adjourned list", /adjourn/i],
  ["otc", "Over-the-counter list", /otc|over the counter|surplus/i],
  ["list", "County auction list", /treasurer|auction|sale list|tax sale/i],
];

export function resourceRows(detail, today) {
  const links = detail?.links || [];
  const used = new Set();
  const take = (re) => {
    const i = links.findIndex((l, n) => !used.has(n) && re.test(`${l[0] || ""} ${l[1] || ""}`));
    if (i < 0) return null;
    used.add(i);
    return links[i];
  };
  const fromLink = (id, label, re) => {
    const link = take(re);
    if (!link || !link[2]) return { id, label, value: null, url: null, status: "Not checked", checked: null, note: "Not on file." };
    const official = link[3] === "OFFICIAL";
    const mark = linkStatus(link[2], official ? "OFFICIAL" : link[3]);
    return { id, label, value: link[1], url: link[2], status: mark.status, checked: mark.checked, note: mark.note };
  };
  const email = typeof detail?.email === "string" ? detail.email : null;
  const phone = typeof detail?.phone === "string" || typeof detail?.phone === "number" ? String(detail.phone) : null;
  const rows = RESOURCE_ROWS.map(([id, label, re]) => fromLink(id, label, re));
  rows.splice(1, 0, {
    id: "email", label: "Assessor email", value: email, url: email ? `mailto:${email}` : null,
    status: "Not checked", checked: null, note: email ? "Stored on the county row. Not opened in this session." : "Not on file.",
  });
  rows.splice(2, 0, {
    id: "phone", label: "Assessor phone", value: phone, url: null,
    status: "Not checked", checked: null, note: phone ? "Stored on the county row. Confirm it on the county site." : "Not on file.",
  });
  return rows;
}

function Chip({ status, note }) {
  const tone = status === "Source-supported" || status === "PROCEED" ? "gr" : status === "Checked" ? "cy" : status === "Conflicting" || status === "STOP" ? "rd" : status === "Stale" || status === "CAUTION" ? "am" : "";
  return <span className={`chip ${tone}`} title={note || undefined}>{status}</span>;
}

function groupLabel(checks, ids, today) {
  const labels = ids.map((id) => evidenceLabel(checks?.[id], today));
  if (labels.some((label) => label === "Stale")) return "Stale";
  if (labels.every((label) => label === "Source-supported")) return "Source-supported";
  if (labels.every((label) => label === "Unavailable")) return "Unavailable";
  return "Not checked";
}

function LayerSwitch({ label, status, on, disabled, onToggle, failed, onRetry }) {
  return (
    <li>
      <span>{label}</span>
      <em>{status}</em>
      {failed && <button type="button" className="atlas-retry" onClick={onRetry}>Retry</button>}
      <button type="button" className={`atlas-switch${on ? " on" : ""}`} disabled={disabled} aria-pressed={on} aria-label={`${label}: ${status}`} onClick={onToggle}><i /></button>
    </li>
  );
}

export function CommandCenter({ go, stage, parcel, record, county, parcels = [], listed = [], counties = [], onCounty, onParcel, mission = [], sales = [], starred, onWatch, stateAbbr, stateName, stateOptions = [], onAtlas, onState, query, hits, answerNote, onHitCounty, onHitParcel }) {
  const [filter, setFilter] = useState("");
  const [saleType, setSaleType] = useState("");
  const [focus, setFocus] = useState("auto");
  const [layersOpen, setLayersOpen] = useState(false);
  const [cardOpen, setCardOpen] = useState(true);
  const [cover, setCover] = useState("");
  const [layers, setLayers] = useState({
    parcels: false, roads: false, terrain: false, flood: false, fires: false, perimeters: false, hazard: false, counties: true,
    basemap: "aerial",
    opacity: { parcels: 0.9, terrain: 0.55, flood: 0.62, fires: 0.9, perimeters: 0.75, hazard: 0.5, roads: 1 },
    retry: {},
  });
  const [gis, setGis] = useState({});
  const today = new Date().toISOString().slice(0, 10);
  const gate = record ? researchGate(record.dueDiligence.verdict, record.dueDiligence.summary) : null;
  const detail = county ? countyDetail(county) : null;
  const resources = detail ? resourceRows(detail, today) : [];
  const assessorPage = resources.find((row) => row.id === "assessor" && row.url);
  const viewerPage = resources.find((row) => row.id === "gis" && row.url);
  const inCounty = useMemo(() => (county ? parcels.filter((p) => p.key === county.key) : []), [parcels, county]);
  const saleTypes = useMemo(() => [...new Set(inCounty.map((p) => p.instrument).filter(Boolean))].sort(), [inCounty]);
  const shown = useMemo(() => {
    const q = filter.trim().toLowerCase();
    let list = county ? inCounty : parcels;
    if (saleType) list = list.filter((p) => p.instrument === saleType);
    if (!county && q.length < 2) return [];
    if (q) list = list.filter((p) => `${p.apn || ""} ${p.label || ""} ${p.city || ""}`.toLowerCase().includes(q));
    return list.slice(0, 8);
  }, [parcels, inCounty, filter, county, saleType]);
  const countyChoices = useMemo(() => {
    const pool = stateAbbr ? counties.filter((c) => c.state === stateAbbr) : (cover ? counties : listed);
    let base = cover ? pool.filter((c) => coverageOf(c).status === cover) : pool;
    if (cover === "not-tested" && !stateAbbr) base = [];
    const rows = county && !base.some((c) => c.key === county.key) && (!cover || coverageOf(county).status === cover) ? [county, ...base] : base;
    return [...rows].sort((a, b) => a.name.localeCompare(b.name) || a.state.localeCompare(b.state));
  }, [counties, listed, stateAbbr, county, cover]);
  const parcelSource = parcelSourceFor(county);
  const setOpacity = (key, value) => setLayers((prev) => ({ ...prev, opacity: { ...prev.opacity, [key]: Number(value) } }));
  useEffect(() => { setFocus("auto"); setSaleType(""); }, [parcel?.id, county?.key, stateAbbr]);
  const auto = parcel ? "analyze" : county ? "verify" : "discover";
  const active = focus === "auto" ? auto : focus;
  const amountStatus = record?.auction.amountDue != null && record.auction.source ? "Source-supported" : "Not checked";
  const checks = record?.dueDiligence.checks;
  const strip = [
    ["County rules", county?.countyVerified ? "Source-supported" : "Not checked"],
    ["Legal access", record ? groupLabel(checks, ["s2", "d3", "d4"], today) : "Not checked"],
    ["Title", record ? groupLabel(checks, ["p1"], today) : "Not checked"],
    ["Flood", gis.flood?.state || "Not checked"],
    ["Existing liens", record ? groupLabel(checks, ["d12", "d15"], today) : "Not checked"],
  ];
  const visibleSales = sales.filter((s) => (county ? s.key === county.key : stateAbbr ? s.state === stateAbbr : true));
  const listedHere = stateAbbr ? listed.filter((c) => c.state === stateAbbr) : listed;
  const setLayer = (key) => setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  const retryLayer = (key) => setLayers((prev) => ({ ...prev, [key]: true, retry: { ...prev.retry, [key]: (prev.retry?.[key] || 0) + 1 } }));
  const mapLayers = useMemo(() => ({
    ...layers,
    terrain: layers.basemap === "terrain",
    opacity: { ...layers.opacity, terrain: layers.basemap === "terrain" ? 1 : layers.opacity.terrain },
  }), [layers]);
  const goStep = (id) => {
    if (id === "discover") { setFocus("auto"); onAtlas(); return; }
    setFocus(id);
  };

  const parcelCard = record && (
    <>
      <p className="atlas-kicker">{record.identity.county} County, {record.identity.state}</p>
      <h2>APN {record.identity.apn}</h2>
      <p>{record.identity.address || "Address not on file"}</p>
      <p className="atlas-meta">{record.property.acreage != null ? `${record.property.acreage} ac on the list` : "Acreage not on file"} · {record.location.geometryStatus === "polygon" ? "Boundary on file" : record.location.geometryStatus === "point" ? "Point on file. Parcel boundary not on file." : "Location not on file"}</p>
      <div className="atlas-facts">
        <div><span>Auction date</span><b>{record.auction.auctionDate || "Not on file"}</b></div>
        <div><span>Sale type</span><b>{record.auction.saleType || "Not on file"}</b></div>
        <div><span>Research</span><b>{gate.label}</b></div>
        <div><span>Amount on the list</span><b>{record.auction.amountDue != null ? money(record.auction.amountDue) : "Not on file"}</b></div>
      </div>
      <p className="atlas-source">{record.auction.source ? <>Source {record.auction.source.agency}{record.auction.source.retrievedAt ? ` · retrieved ${record.auction.source.retrievedAt}` : ""}{record.auction.source.url ? <> · <a href={record.auction.source.url} target="_blank" rel="noreferrer">Open source</a></> : null}</> : "No source is attached to the amount."} <Chip status={amountStatus} /></p>
      <div className={`atlas-gate ${gate.tone}`}><b>{gate.label}</b><span>{gate.why}</span></div>
      <p className="atlas-note">{record.location.geometryStatus === "polygon" ? "The gold line is the stored boundary. It is not a new survey." : "The parcel boundary is not on file. The map is not drawing a guessed polygon."} A county sale date is not this parcel’s auction. The photo is not evidence of access, occupancy, or title.</p>
      <div className="atlas-actions">
        <Button className="btn atlas-go" type="button" onClick={() => go("parcels")}>Open research file</Button>
        <Button className="btn ghost" type="button" onClick={onWatch}>{starred ? "Stop watching" : "Add to watchlist"}</Button>
        <Button className="btn ghost" type="button" onClick={() => setFocus("diligence")}>Continue due diligence</Button>
      </div>
    </>
  );

  const countyCard = county && (
    <>
      <p className="atlas-kicker">{stateName || county.state}</p>
      <h2>{county.name} County</h2>
      <p>County research workspace. The line on the photo is the Census boundary. It is not a parcel, and it is not a listing.</p>
      <p>{inCounty.length ? `${inCounty.length} parcel${inCounty.length === 1 ? "" : "s"} on file in this county.` : "No parcel list is on file. That is not evidence that no sale exists."}</p>
      <ul className="atlas-resources">
        <li><span>Parcel geometry</span><em>{parcelSource ? `${parcelSource.coverage} · ${parcelSource.provider}` : inCounty.filter((row) => leafletRing(row)).length ? `${inCounty.filter((row) => leafletRing(row)).length} stored` : "Not on file"}</em></li>
        <li><span>Parcel attributes</span><em>{inCounty.length ? "List on file" : "Not on file"}</em></li>
        <li><span>Auction resources</span><em>{resources.some((row) => row.url) ? "Links on file" : "Not on file"}</em></li>
        <li><span>Flood</span><Chip status={gis.flood?.state || "Not checked"} note={gis.flood?.detail} /></li>
        <li><span>Current fires</span><Chip status={gis.fires?.state || "Not checked"} note={gis.fires?.detail} /></li>
        <li><span>Fire potential</span><Chip status={gis.hazard?.state || "Not checked"} note={gis.hazard?.detail} /></li>
      </ul>
      <p className="atlas-note">{parcelSource
        ? `${coverageOf(county).label}. ${parcelSource.sourceType === "state-composite" ? "State composite, not the county assessor layer." : parcelSource.sourceType === "county-assessor" ? "County assessor or appraisal layer." : parcelSource.sourceType === "other" ? "Public agency parcel layer, not an ownership record." : "County GIS parcel layer."} ${parcelSource.provider}. Checked ${parcelSource.checked}.${parcelSource.invalidId ? ` ${parcelSource.invalidId}` : ""}`
        : "No verified parcel-click adapter for this county. You stay on the map. Nationwide lines, when on, are a picture only, not a county parcel record."} Missing flood or fire coverage is not “no risk.”</p>
      <p className="atlas-source">{county.countyVerified ? "County terms were read 2026-09-04." : "County terms have not been read. A statute note is not this county’s auction notice."} <Chip status={county.countyVerified ? "Source-supported" : "Not checked"} /></p>
      <ul className="atlas-resources">
        {resources.map((row) => (
          <li key={row.id}><span>{row.label}</span>{row.url ? <a href={row.url} target="_blank" rel="noreferrer">Open</a> : <em>{row.value || "Not on file"}</em>}<Chip status={row.status} note={row.note} /></li>
        ))}
      </ul>
      <Button className="btn atlas-go" type="button" onClick={() => go("counties", { focus: county.id })}>Open county file</Button>
    </>
  );

  let card = null;
  if (active === "diligence" && record) {
    card = (
      <>
        <p className="atlas-kicker">Due diligence · {record.identity.county} County</p>
        <h2>APN {record.identity.apn}</h2>
        <div className={`atlas-gate ${gate.tone}`}><b>{gate.label}</b><span>{gate.why} That is not advice to bid.</span></div>
        <ul className="atlas-resources">
          {record.dueDiligence.stopItems.slice(0, 8).map((item) => (
            <li key={item.id}><span>{item.title}</span><Chip status={evidenceLabel(checks[item.id], today)} /></li>
          ))}
        </ul>
        <p className="atlas-note">{record.dueDiligence.summary.checked} checklist items saved · {record.dueDiligence.summary.unknown} not checked. Imagery does not prove access, occupancy, or title.</p>
        <Button className="btn atlas-go" type="button" onClick={() => go("board")}>Open the checklist</Button>
      </>
    );
  } else if (active === "analyze" && record) card = parcelCard;
  else if (active === "analyze") card = (<><p className="atlas-kicker">Analyze</p><h2>No parcel selected</h2><p>Choose a parcel that is already on a county list. A blank is not a property.</p></>);
  else if (active === "verify" && county) card = countyCard;
  else if (active === "verify") card = (<><p className="atlas-kicker">Verify</p><h2>No county selected</h2><p>Click a county on the map, or choose a state and then a county. The aerial photo is not a county record.</p></>);
  else if (county && !stateAbbr) card = countyCard;
  else if (stateAbbr && !county) {
    card = (
      <>
        <p className="atlas-kicker">State</p>
        <h2>{stateName || stateAbbr}</h2>
        <p>State workspace. Choose a county to open its map. {listedHere.length} {listedHere.length === 1 ? "county has" : "counties have"} a parcel list on file. A county that is missing is unknown, not empty.</p>
        {!!listedHere.length && <div className="atlas-block"><span className="atlas-label">Parcel lists on file</span>{listedHere.slice(0, 8).map((c) => <Button key={c.key} type="button" onClick={() => onCounty(c.key)}>{c.name} County</Button>)}</div>}
      </>
    );
  } else if (county) card = countyCard;
  else {
    card = (
      <>
        <p className="atlas-kicker">United States</p>
        <h2>Atlas</h2>
        <p>Select a state or a county. The photo is USGS imagery. The lines are Census county boundaries. Nothing on this map is a live listing.</p>
        <p>{listed.length} counties have a parcel list on file.</p>
      </>
    );
  }

  return (
    <section className={`atlas${layersOpen ? " layers-open" : ""}${cardOpen ? "" : " card-shut"}`} aria-label="Research command center">
      <div className="atlas-map">{typeof stage === "function" ? stage(mapLayers, setGis) : stage}</div>
      <nav className="atlas-crumbs" aria-label="Map location">
        <Button type="button" onClick={() => { setFocus("auto"); onAtlas(); }}>Atlas</Button>
        {stateAbbr && <><span aria-hidden="true">›</span><Button type="button" onClick={() => { setFocus("auto"); onState(stateAbbr); }}>{stateName || stateAbbr}</Button></>}
        {county && <><span aria-hidden="true">›</span><Button type="button" onClick={() => onCounty(county.key)}>{county.name} County</Button></>}
        {parcel && <><span aria-hidden="true">›</span><span>APN {parcel.apn}</span></>}
      </nav>
      <div className="atlas-nav">
        <Button type="button" onClick={() => { setFocus("auto"); if (parcel && county) onCounty(county.key); else if (county && stateAbbr) onState(stateAbbr); else onAtlas(); }}>Back</Button>
        <Button type="button" onClick={() => { setFocus("auto"); onAtlas(); }}>Reset to U.S.</Button>
      </div>
      {(() => {
        const waiting = [];
        if (layers.basemap === "terrain" && (!gis.terrain || gis.terrain.state === "Not checked")) waiting.push("Terrain");
        for (const info of LAYER_INFO) {
          if (info.id === "terrain" || !layers[info.id]) continue;
          if (gis[info.id]?.state === "Not checked") waiting.push(info.label);
        }
        if (!waiting.length) return null;
        return <p className="atlas-quiet">Zoom in to request {waiting.join(", ")}. A wider view did not load that layer. That is not a finding.</p>;
      })()}
      <div className="atlas-tools">
        <Button type="button" aria-expanded={layersOpen} onClick={() => setLayersOpen((open) => !open)}>{layersOpen ? "Close layers" : "Layers"}</Button>
        <Button type="button" aria-expanded={cardOpen} onClick={() => setCardOpen((open) => !open)}>{cardOpen ? "Hide card" : "Research"}</Button>
      </div>
      <aside className={`atlas-layers${layersOpen ? " open" : ""}`} aria-label="Map layers">
        <label htmlFor="cc-state">State</label>
        <select id="cc-state" className="input" value={stateAbbr || ""} onChange={(e) => { const ab = e.target.value; if (!ab) onAtlas(); else onState(ab); }}>
          <option value="">United States</option>
          {stateOptions.map(([ab, name]) => <option key={ab} value={ab}>{name}</option>)}
        </select>
        <label htmlFor="cc-cover">Parcel-click coverage</label>
        <select id="cc-cover" className="input" value={cover} onChange={(e) => setCover(e.target.value)}>
          <option value="">All coverage statuses</option>
          {Object.entries(COVERAGE_LABEL).map(([id, label]) => <option key={id} value={id}>{label} ({coverageCounts()[id] ?? 0})</option>)}
        </select>
        <label htmlFor="cc-county">County</label>
        <select id="cc-county" className="input" value={county?.key || ""} onChange={(e) => onCounty(e.target.value)}>
          <option value="">{stateAbbr ? "Choose a county" : cover === "not-tested" ? "Choose a state to list untested counties" : "Counties with a list"}</option>
          {countyChoices.map((c) => {
            const mark = coverageOf(c);
            const suffix = mark.status === "not-tested" ? "" : mark.status === "verified-state" ? " · state composite" : mark.status === "partial" ? " · partial click" : mark.status === "verified-county" ? " · county click" : "";
            return <option key={c.key} value={c.key}>{c.name}{suffix}{stateAbbr ? "" : `, ${c.state}`}</option>;
          })}
        </select>
        {!county && <p>{coverageCounts().universe} counties are in scope. {coverageCounts()["verified-county"]} verified county clicks, {coverageCounts()["verified-state"]} state-composite clicks, {coverageCounts().partial} partial, {coverageCounts()["not-tested"]} not tested. This is not full coverage. Visual parcel lines are not a county record.</p>}
        <label htmlFor="cc-parcel">Parcel on file</label>
        <input id="cc-parcel" className="input" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder={county ? "APN or address on file" : "Type two letters to search lists"} />
        {!!saleTypes.length && (
          <>
            <label htmlFor="cc-type">Sale type on the list</label>
            <select id="cc-type" className="input" value={saleType} onChange={(e) => setSaleType(e.target.value)}>
              <option value="">All types on file</option>
              {saleTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </>
        )}
        {(shown.length > 0 || (query && hits)) && (
          <div className="atlas-picks">
            {query && hits && <span className="atlas-label">Search</span>}
            {query && hits && answerNote && <p>{answerNote}</p>}
            {query && hits && (hits.items || []).slice(0, 6).map((item) => hits.kind === "properties"
              ? <Button key={item.id} type="button" onClick={() => onHitParcel(item)}><b>{item.apn}</b><span>{item.county}, {item.state}</span></Button>
              : <Button key={item.id} type="button" onClick={() => onHitCounty(item)}><b>{item.name} County</b><span>{item.state} · {coverageOf(item).label}</span></Button>)}
            {query && hits && !(hits.items || []).length && <p>{hits.note || "Nothing on file matches."}</p>}
            {!query && shown.map((p) => <Button key={p.id} type="button" className={parcel?.id === p.id ? "on" : ""} onClick={() => onParcel(p)}><b>{p.apn}</b><span>{p.label}</span></Button>)}
          </div>
        )}
        <h2>Basemap</h2>
        <div className="atlas-basemap" role="radiogroup" aria-label="Basemap">
          {[["aerial", "Aerial"], ["street", "Street"], ["terrain", "Terrain"]].map(([id, label]) => (
            <Button key={id} type="button" role="radio" aria-checked={layers.basemap === id} className={layers.basemap === id ? "on" : ""} onClick={() => setLayers((prev) => ({ ...prev, basemap: id }))}>{label}</Button>
          ))}
        </div>
        <p>{layers.basemap === "terrain" ? (gis.terrain?.detail || "Terrain uses USGS 3DEP hillshade. A wide view is not given a terrain reading.") : layers.basemap === "street" ? "Street basemap is Esri World Street Map. It replaces the aerial photo. Roads, below, do not." : "Aerial basemap is USGS imagery. Overlays draw on top of it."}</p>
        <h2>Overlays</h2>
        <ul>
          {LAYER_INFO.filter((info) => info.id !== "terrain").map((info) => {
            const live = gis[info.id];
            const asked = !!layers[info.id];
            const failed = asked && live?.state === "Unavailable";
            const waiting = asked && live?.state === "Not checked";
            const status = !asked ? "Not checked" : failed ? "Unavailable" : waiting ? "Zoom in" : (live?.state || "Loading");
            return <LayerSwitch key={info.id} label={info.label} status={status} on={asked && !failed} failed={failed} onRetry={() => retryLayer(info.id)} onToggle={() => failed ? retryLayer(info.id) : setLayer(info.id)} />;
          })}
          {(() => {
            const live = gis.roads;
            const asked = !!layers.roads;
            const failed = asked && live?.state === "Unavailable";
            const waiting = asked && live?.state === "Not checked";
            const status = !asked ? "Not checked" : failed ? "Unavailable" : waiting ? "Zoom in" : (live?.state || "Loading");
            return <LayerSwitch label="Roads" status={status} on={asked && !failed} failed={failed} onRetry={() => retryLayer("roads")} onToggle={() => failed ? retryLayer("roads") : setLayer("roads")} />;
          })()}
          <LayerSwitch label="County boundary" status={layers.counties ? "On" : "Not checked"} on={layers.counties} onToggle={() => setLayer("counties")} />
        </ul>
        <p>{parcelSource
          ? `${coverageOf(county).label}. ${parcelSource.provider} answers a click when parcel lines are on and the map is close. Checked ${parcelSource.checked}. A ${parcelSource.fields.apn} from that service is not a title search.${parcelSource.invalidId ? ` ${parcelSource.invalidId}` : ""}`
          : assessorPage || viewerPage
            ? "Parcel-click records are unavailable for this county. A stored assessor or parcel-viewer page is not a parcel read, and a map click does not invent an APN."
            : "Parcel-click records are unavailable for this county. You stay on the map. Nationwide lines, when zoomed in, are a picture only. An APN is not invented."}</p>
        {(assessorPage || viewerPage) && (
          <p>
            {assessorPage && <a href={assessorPage.url} target="_blank" rel="noreferrer">Assessor page</a>}
            {assessorPage && viewerPage ? " · " : ""}
            {viewerPage && <a href={viewerPage.url} target="_blank" rel="noreferrer">Parcel viewer</a>}
            {" "}{assessorPage?.status === "Checked" || viewerPage?.status === "Checked" ? "A checked link responded. The page was not read." : "Stored link. Not opened in this session."}
          </p>
        )}
        {(() => {
          const caveat = /no features|no current perimeter|No GIS coverage|not a complete history|not a finding/i;
          const lines = [];
          if (layers.basemap === "terrain" && gis.terrain?.state === "Not checked") lines.push(gis.terrain.detail || "Zoom in before terrain is requested.");
          for (const info of LAYER_INFO) {
            if (info.id === "terrain" || !layers[info.id]) continue;
            const live = gis[info.id];
            if (!live?.detail) continue;
            if (live.state === "Loading") continue;
            if (live.state === "Available" && !caveat.test(live.detail)) continue;
            lines.push(live.detail);
          }
          if (!lines.length) return <p>Flood, fire incidents, and long-term fire potential are separate. None of them means safe, clear, or no risk.</p>;
          return lines.map((line) => <p key={line}>{line}</p>);
        })()}
        <details className="atlas-sources">
          <summary>Sources, legend, and opacity</summary>
          <ul className="atlas-legend">
            <li><i className="swatch line" /> Parcel line, visual</li>
            <li><i className="swatch gold" /> Assessor or stored boundary</li>
            <li><i className="swatch road" /> Road overlay</li>
            <li><i className="swatch terrain" /> 3DEP hillshade</li>
            <li><i className="swatch flood" /> FEMA flood zone</li>
            <li><i className="swatch fire" /> Current incident</li>
            <li><i className="swatch perim" /> Current perimeter</li>
            <li><i className="swatch hist" /> Historic perimeter</li>
            <li><i className="swatch hazard" /> 2023 fire potential</li>
          </ul>
          {LAYER_INFO.filter((info) => layers.opacity[info.id] != null).map((info) => (
            <label key={info.id}>{info.label}
              <input type="range" min="0.25" max="1" step="0.05" value={layers.opacity[info.id]} onChange={(e) => setOpacity(info.id, e.target.value)} aria-label={`${info.label} opacity`} />
            </label>
          ))}
          {LAYER_INFO.map((info) => {
            const live = gis[info.id];
            return (
              <article key={info.id}>
                <h3>{info.label}</h3>
                <p>{info.provider}. {info.dataset}. {info.kind}.</p>
                <p>{info.vintage}</p>
                <p>{live?.detail || info.gateDetail}</p>
                <p>{live?.retrievedAt ? `Last response ${live.retrievedAt.slice(0, 16).replace("T", " ")} UTC.` : "No successful response yet."} <a href={info.url} target="_blank" rel="noreferrer">Service</a></p>
              </article>
            );
          })}
        </details>
      </aside>
      <aside className={`atlas-card${cardOpen ? "" : " shut"}`} aria-label="Selected research">
        {card}
        {active !== "analyze" && active !== "diligence" && !!visibleSales.length && (
          <div className="atlas-block"><span className="atlas-label">Sale dates on file</span>{visibleSales.map((s) => <Button key={s.id} type="button" onClick={() => go("counties", { focus: s.countyId })}>{s.name}, {s.state} · {fmtDate(s.iso)}{s.level === "DERIVED" ? " · derived" : ""}</Button>)}</div>
        )}
        {!!mission.length && <div className="atlas-block"><span className="atlas-label">Continue</span>{mission.map((p) => <Button key={p.id} type="button" onClick={() => onParcel(p)}>APN {p.apn} · {p.county}</Button>)}</div>}
      </aside>
      <footer className="atlas-strip" aria-label="Research workflow">
        <ol>
          {STEPS.map(([id, label], i) => (
            <li key={id} className={active === id ? "on" : ""}>
              <Button type="button" aria-current={active === id ? "step" : undefined} onClick={() => goStep(id)}><span>{i + 1}</span>{label}</Button>
            </li>
          ))}
        </ol>
        <ul>
          {strip.map(([label, status]) => <li key={label}>{label} <Chip status={status} /></li>)}
        </ul>
      </footer>
    </section>
  );
}
