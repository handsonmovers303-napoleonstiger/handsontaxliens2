import React, { useEffect, useMemo, useState } from "react";
import { allCounties, allProperties, fetchPromotedParcels, ddProgress, ddVerdict, money, fmtDate, stageOf, STAGES } from "../data";
import { itemById, parcelConfidence, PARTS, RISKS, riskState, stateOf } from "../intel";
import { ARTIFACT } from "../../lib/env";
import { useStore, useToast } from "../store";
import { ItemEditor } from "./Board";
import { ConfidencePanel, focusScroll, Halo, Icon, Ring, ScreenLead, SecHead, Stat, Src } from "../ui";
import { Button, InteractiveCard } from "../ds";
import { countyCard } from "../home/model";
import { GodsEyeView, PropertyCardMapPreview, useLocatedPoint } from "../home/GodsEye";
import { buildPropertyIntelligence, mergePromoted } from "../propertyRecord";

const LEVEL_TONE = { PUBLISHED: "gr", SCRAPED: "gr", CURATED: "am", PROMOTED: "cy" };

export function useAllParcels() {
  const { sync } = useStore();
  const [promoted, setPromoted] = useState([]);
  useEffect(() => { if (!ARTIFACT && sync && sync.signedIn) fetchPromotedParcels().then(setPromoted); }, [sync && sync.signedIn]);
  return useMemo(() => mergePromoted(allProperties(), promoted), [promoted]);
}
export const mapsUrl = (p) => p.lat != null ? `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lon}`
  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.label || ""} ${p.city || ""} ${p.county} County ${p.state}`)}`;

export default function Parcels({ go, params }) {
  const { holo, patchHolo, dd, stars, photoCount } = useStore();
  const all = useAllParcels();
  const counties = useMemo(() => { const m = new Map(); for (const p of all) m.set(p.key, (m.get(p.key) || 0) + 1); return [...m.entries()].sort((a, b) => b[1] - a[1]); }, [all]);
  const [county, setCounty] = useState(params && params.county ? params.county : "");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("amount");
  const [n, setN] = useState(60);
  useEffect(() => { if (params && params.county) setCounty(params.county); }, [params && params.county]);
  const list = useMemo(() => {
    const qq = q.trim().toLowerCase();
    const l = all.filter((p) => (!county || p.key === county) && (!qq || `${p.apn} ${p.label} ${p.city || ""} ${p.owner || ""}`.toLowerCase().includes(qq)));
    const by = { amount: (a, b) => (b.amount || 0) - (a.amount || 0), low: (a, b) => (a.amount ?? 1e12) - (b.amount ?? 1e12),
      dd: (a, b) => ddProgress(dd[b.id]).done - ddProgress(dd[a.id]).done, star: (a, b) => (stars[`parcel:${b.id}`] ? 1 : 0) - (stars[`parcel:${a.id}`] ? 1 : 0) };
    return l.sort(by[sort]);
  }, [all, county, q, sort, dd, stars]);
  const focus = all.find((p) => p.id === holo.focusParcel) || list[0];
  const focusAt = focus ? list.findIndex((p) => p.id === focus.id) : -1;

  return (
    <div className="materialize">
      <SecHead ix="03" title="Parcels" sub="Open one property file" right={<span className="chip num">{list.length.toLocaleString()} parcels</span>} />
      <ScreenLead does="Show the facts recorded for one parcel." leads="A mission, if you save it, or back to the county file. A parcel is not a certificate you can sell." />
      <div className="split">
        <div className="glass pad col" style={{ gap: 10 }}>
          <select className="input" value={county} onChange={(e) => { setCounty(e.target.value); setN(60); }} aria-label="County list">
            <option value="">All parcel lists ({all.length.toLocaleString()})</option>
            {counties.map(([k, c]) => <option key={k} value={k}>{k.split("|").reverse().join(", ")} · {c.toLocaleString()}</option>)}
          </select>
          <input className="input" placeholder="Search APN, legal, owner" value={q} onChange={(e) => { setQ(e.target.value); setN(60); }} />
          <div className="row wrap" style={{ gap: 6 }}>
            {[["amount", "Owed ↓"], ["low", "Owed ↑"], ["dd", "Most researched"], ["star", "Watchlist"]].map(([k, l]) => <Button key={k} className={`chip btn-chip ${sort === k ? "cy" : ""}`} onClick={() => setSort(k)}>{l}</Button>)}
          </div>
          <div className="col scroll" style={{ maxHeight: "62vh", gap: 6 }}>
            {list.slice(0, n).map((p) => {
              const stage = STAGES[stageOf(dd[p.id], photoCount(p.id))];
              return (
                <InteractiveCard key={p.id} className={`list-item ${focus && p.id === focus.id ? "on" : ""}`} onClick={() => { patchHolo(() => ({ focusParcel: p.id })); focusScroll(); }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="row" style={{ gap: 6 }}><b className="num" style={{ fontSize: 13 }}>{p.apn}</b>{stars[`parcel:${p.id}`] && <Icon n="star" s={12} c="var(--gold)" fill="var(--gold)" />}</div>
                    <div className="dim" style={{ fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.label}</div>
                    <div className="row" style={{ gap: 6, marginTop: 3 }}><span className="faint" style={{ fontSize: 11 }}>{p.county}, {p.state}</span><span className={`chip ${stage[1]}`} style={{ fontSize: 9.5, padding: "0 6px" }}>{stage[0]}</span></div>
                  </div>
                  <div className="num" style={{ fontSize: 14, fontWeight: 600, color: p.amount != null ? "var(--ink)" : "var(--ink-4)" }}>{p.amount != null ? money(p.amount) : "TBD"}</div>
                </InteractiveCard>);
            })}
            {list.length > n && <Button className="btn quiet sm" onClick={() => setN(n + 150)}>Show more ({(list.length - n).toLocaleString()})</Button>}
            {!list.length && <div className="empty">{county === "CO|Mesa" ? "Mesa has no parcel list on file. Start with the county file." : "No parcel matches."} {county === "CO|Mesa" && go && <Button className="chip btn-chip cy" type="button" onClick={() => { const mesa = allCounties().find((c) => c.key === "CO|Mesa"); go("counties", mesa ? { focus: mesa.id } : null); }}>Open the Mesa county file</Button>}</div>}
          </div>
        </div>
        {focus ? <ParcelCard key={focus.id} p={focus} go={go} onPrev={focusAt > 0 ? () => patchHolo(() => ({ focusParcel: list[focusAt - 1].id })) : null} onNext={focusAt >= 0 && focusAt < list.length - 1 ? () => patchHolo(() => ({ focusParcel: list[focusAt + 1].id })) : null} /> : <div className="empty">Pick a parcel.</div>}
      </div>
    </div>
  );
}


/** Every piece of evidence behind a parcel, as sheets you can peel through. */
function evidenceSheets(p, recs, photos, pin, visit) {
  const out = [{ kind: "list", title: "Tax sale list", source: p.source && /^https?:/.test(p.source) ? p.source.replace(/^https?:\/\//, "").slice(0, 60) : p.source,
    doc: p.source && /^https?:/.test(p.source) ? p.source : null, sourceType: p.level === "CURATED" ? "Other" : "Official record", date: p.listDate ? String(p.listDate).slice(0, 10) : null,
    by: "County list", confidence: p.level === "CURATED" ? "low" : "high", note: p.levelNote }];
  for (const [id, r] of Object.entries(recs || {})) {
    if (!r || !(r.source || r.note || r.doc || r.map)) continue;
    const it = itemById(id); if (!it) continue;
    out.push({ kind: "finding", title: it.t, state: stateOf(r), source: r.source, sourceType: r.sourceType, date: r.date, by: r.by, confidence: r.confidence, doc: r.doc, map: r.map, note: r.note });
  }
  if (photos && photos.length) out.push({ kind: "photos", title: `Field photo set · ${photos.length}`, photos, sourceType: "Field observation", date: photos[photos.length - 1].time.slice(0, 10),
    confidence: photos.some((x) => x.fix) ? "high" : "medium", note: `${new Set(photos.map((x) => x.cat)).size} angles · ${photos.filter((x) => x.fix).length} GPS-stamped` });
  if (pin && pin.src === "gps") out.push({ kind: "map", title: "Parcel pinned on site", sourceType: "Field observation", date: pin.t && pin.t.slice(0, 10), confidence: pin.acc <= 15 ? "high" : "medium",
    map: `https://www.google.com/maps/search/?api=1&query=${pin.lat},${pin.lon}`, note: `${pin.lat.toFixed(5)}, ${pin.lon.toFixed(5)} · ±${pin.acc}m` });
  if (visit && (visit.completed || visit.note || Object.values(visit.obs || {}).some(Boolean))) out.push({ kind: "field", title: "Field visit", sourceType: "Field observation", date: visit.completed, by: visit.by,
    note: [Object.entries(visit.obs || {}).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(" · "), visit.note].filter(Boolean).join(" — ") });
  return out;
}

function EvidenceStack({ sheets }) {
  const [i, setI] = useState(0);
  const cur = Math.min(i, sheets.length - 1);
  const peel = (d) => setI((x) => Math.max(0, Math.min(sheets.length - 1, x + d)));
  const shown = sheets.slice(cur, cur + 4);
  return (
    <div>
      <div className="row between"><div className="micro cy">Evidence · {cur + 1} of {sheets.length}</div>
        <div className="row" style={{ gap: 6 }}><Button className="btn quiet sm" disabled={cur === 0} onClick={() => peel(-1)}>Previous sheet</Button><Button className="btn ghost sm" disabled={cur >= sheets.length - 1} onClick={() => peel(1)}>Next sheet</Button></div></div>
      <div className="ev-stack" tabIndex={0} onKeyDown={(e) => { if (e.key === "ArrowRight") peel(1); if (e.key === "ArrowLeft") peel(-1); }} style={{ marginTop: 8, paddingBottom: 12 + Math.min(3, shown.length - 1) * 12, outline: "none" }}>
        {shown.map((s, k) => (
          <div key={cur + k} className="ev-sheet" style={k === 0 ? { position: "relative", zIndex: 5 } : { position: "absolute", inset: 0, zIndex: 5 - k, transform: `translateY(${k * 12}px) scale(${1 - k * .035})`, opacity: 1 - k * .28, filter: `blur(${k * .6}px)`, pointerEvents: "none" }}>
            <div className="tactical" style={{ padding: 14, height: k ? "100%" : undefined, overflow: "hidden" }}>
              <div className="row between wrap" style={{ gap: 6 }}><b style={{ fontSize: 14 }}>{s.title}</b>{s.state && <span className={`chip ${s.state.tone}`}>{s.state.label}</span>}</div>
              <div className="kv" style={{ marginTop: 6, fontSize: 12.5 }}>
                <div>Source</div><div>{s.source || "—"}</div>
                <div>Source type</div><div>{s.sourceType || "—"}</div>
                <div>Verified date</div><div className="num">{s.date || "—"}</div>
                <div>Checked by</div><div>{s.by || "—"}</div>
                <div>Confidence</div><div>{s.confidence || "—"}</div>
                <div>Document</div><div>{s.doc ? <a href={s.doc} target="_blank" rel="noreferrer">Open this document</a> : "—"}</div>
                <div>Map</div><div>{s.map ? <a href={s.map} target="_blank" rel="noreferrer">Open this pin on a map</a> : "—"}</div>
                <div>Field note</div><div>{s.note || "—"}</div>
              </div>
              {s.photos && <div className="row wrap" style={{ gap: 6, marginTop: 8 }}>{s.photos.slice(-6).map((ph) => <img key={ph.id} src={ph.thumb} alt={ph.cat} title={ph.cat} style={{ width: 64, height: 48, objectFit: "cover", borderRadius: 6, border: "1px solid rgba(0,229,255,.3)" }} />)}</div>}
            </div>
          </div>))}
      </div>
    </div>
  );
}

export function ParcelCard({ p, go, onPrev, onNext }) {
  const { dd, setRec, sync, stars, toggleStar, holo, patchHolo, photos, photoCount, loadPhotosFor, addProperty } = useStore();
  const toast = useToast();
  const recs = dd[p.id] || {};
  const prog = ddProgress(recs);
  const v = ddVerdict(recs);
  const [risk, setRisk] = useState(null);
  const [edit, setEdit] = useState(null);
  const [showConf, setShowConf] = useState(false);
  const [eye, setEye] = useState(false);
  useEffect(() => { loadPhotosFor(p.id); }, [p.id, loadPhotosFor]);
  const county = useMemo(() => allCounties().find((c) => c.key === p.key), [p.key]);
  const pin = holo.pins[p.id];
  const visit = holo.visits[p.id];
  const shots = photos[p.id] || [];
  const record = useMemo(() => buildPropertyIntelligence({ parcel: p, checks: recs, visit, photos: shots, pin, today: new Date().toISOString().slice(0, 10) }), [p, recs, visit, shots, pin]);
  const located = useLocatedPoint(p, pin);
  const point = located.point;
  const ring = record.location.polygon;
  const flags = record.godsEye.flags;
  const card = useMemo(() => (county ? countyCard(county, { today: new Date().toISOString().slice(0, 10) }, holo) : null), [county, holo]);
  const saved = (holo.eye || {})[p.id] || {};
  const saveEye = (patch) => patchHolo((h) => ({ eye: { ...(h.eye || {}), [p.id]: { ...((h.eye || {})[p.id] || {}), ...patch } } }));
  const conf = parcelConfidence(p, { recs, photos: photos[p.id], visit, pin, county });
  const sheets = evidenceSheets(p, recs, photos[p.id], pin, visit);
  const inMission = holo.mission.includes(p.id);
  const starred = !!stars[`parcel:${p.id}`];
  const verdictTone = v.label === "CLEARED FOR AUCTION" ? "gr" : v.label === "Do not bid" ? "rd" : "am";
  const occupancy = (visit && visit.obs && visit.obs.occupancy) || (recs.x2 && recs.x2.note) || null;
  const addMission = (e) => {
    patchHolo((h) => ({ mission: h.mission.includes(p.id) ? h.mission.filter((x) => x !== p.id) : [...h.mission, p.id], focusParcel: p.id }));
    addProperty({ id: p.id, county: p.county, state: p.state, apn: p.apn, label: p.label, instrument: p.instrument || "lien" });
    toast(inMission ? "Removed from mission" : "Added to mission", { x: e.clientX, y: e.clientY });
  };
  const selRisk = risk && RISKS.find((r) => r.id === risk);
  const editItem = edit && itemById(edit);

  return (
    <Halo score={conf.score} id="focus-card" style={{ scrollMarginTop: 110 }} className={`glass pad elev up materialize ${verdictTone === "gr" ? "clear" : verdictTone === "rd" ? "alert" : starred ? "rare" : ""}`}>
      <PropertyCardMapPreview
        p={p}
        point={point}
        status={located.status}
        ring={ring}
        fips={county?.fips || ""}
        flags={flags}
        countyLine={`${p.county} County, ${p.state}${p.city ? ` · ${p.city}` : ""}`}
        saleLine={card?.sale?.value ? `County sale date ${card.sale.display}` : "No county sale date on file"}
        geometryStatus={record.location.geometryStatus}
        onOpen={() => setEye(true)}
      />
      <div className="row wrap" style={{ gap: 8, marginTop: 8 }}>
        {onPrev && <Button className="btn ghost sm" type="button" onClick={onPrev}>Previous property</Button>}
        {onNext && <Button className="btn ghost sm" type="button" onClick={onNext}>Next property</Button>}
        <Button className="btn sm" type="button" onClick={() => setEye(true)}>Open God’s Eye View</Button>
        <Button className="btn ghost sm" type="button" onClick={() => setShowConf(!showConf)}>{showConf ? "Hide research confidence" : `Research confidence ${conf.score}%`}</Button>
        <Button className={`btn ghost sm ${starred ? "gold" : ""}`} type="button" onClick={() => toggleStar(`parcel:${p.id}`)}>{starred ? "Stop watching" : "Watch"}</Button>
        <span className="faint">{record.identity.apn} · {record.identity.county}, {record.identity.state} · {record.dueDiligence.summary.checked} checked · {record.dueDiligence.summary.unknown} unknown{record.dueDiligence.summary.stopUnresolved ? ` · ${record.dueDiligence.summary.stopUnresolved} STOP items unresolved` : ""}</span>
      </div>
      {showConf && <div className="tactical materialize" style={{ padding: 14, marginTop: 10 }}><ConfidencePanel conf={conf} parts={PARTS} /></div>}

      <div className="grid g4" style={{ marginTop: 12, gap: 8 }}>
        <Stat icon="bolt" v={p.amount != null ? money(p.amount) : "TBD"} l="Amount owed" n={p.amount != null ? "county list" : "not on the list"} />
        <Stat icon="layers" v={p.acres ? `${p.acres} ac` : "—"} l="Acreage" />
        <Stat icon="user" v={p.ownerType || "—"} l="Owner type" n={p.homestead ? `Homestead: ${p.homestead}` : null} />
        <div className="stat row" style={{ gap: 10 }}><Ring value={prog.pct} size={50} color={verdictTone === "gr" ? "var(--emerald)" : "var(--cyan)"} label={`${prog.pct}%`} /><div><div className="l" style={{ marginTop: 0 }}>Diligence</div><div className="n">{prog.stopDone}/{prog.stopTotal} stop items</div></div></div>
      </div>

      <div className="layers" style={{ marginTop: 12 }}>
        <div className="layer tactical" style={{ padding: 14 }}>
          <div className="layer-tag">PLANE 01 · RECORD</div>
          <div className="grid g2" style={{ gap: 0, columnGap: 18, marginTop: 6 }}>
            <div className="kv">
              <div>Property address</div><div>{p.label}</div>
              <div>APN</div><div className="num">{p.apn}{p.acct ? ` · acct ${p.acct}` : ""}</div>
              <div>County</div><div>{p.county}, {p.state}</div>
              <div>Owner</div><div>{p.owner || "Not on file"}</div>
              <div>Owner type</div><div>{p.ownerType || "Not on file"}</div>
              <div>Tax year</div><div>{p.taxYear || "Not on file"}</div>
              <div>Amount owed</div><div className="num">{money(p.amount)}</div>
              <div>Assessed value</div><div className={p.value != null ? "num" : ""}>{p.value != null ? `${money(p.value)} (on list)` : "Not on file"}</div>
              <div>Est. market value</div><div className={p.estLow ? "num" : ""} style={p.estLow ? { color: "var(--amber)" } : null}>{p.estLow ? `${money(p.estLow)}–${money(p.estHigh)} · author estimate` : "Not on file"}</div>
            </div>
            <div className="kv">
              <div>Acreage</div><div>{p.acres ? `${p.acres} acres` : "Not on file"}</div>
              <div>Land value</div><div className="faint">Not on file</div>
              <div>Improvement value</div><div className="faint">Not on file</div>
              <div>Zoning</div><div>{(p.raw && p.raw.zone) || (recs.s4 && recs.s4.note) || "Not on file"}</div>
              <div>Property type</div><div>{p.kind || (p.traits[0] || "Not on file")}</div>
              <div>Homestead</div><div>{p.homestead || "Not on file"}</div>
              <div>Occupancy</div><div>{occupancy || "Not on file"}</div>
              <div>Legal description</div><div style={{ fontSize: 12 }}>{p.legal || "Not on file"}</div>
            </div>
          </div>
        </div>

        <div className="layer tactical" style={{ padding: 14 }}>
          <div className="row between"><div className="layer-tag">PLANE 02 · RISK MATRIX</div><span className={`chip ${verdictTone}`}>{v.label}</span></div>
          <div className="risk-grid" style={{ marginTop: 8 }}>
            {RISKS.map((r) => { const s = riskState(r, recs);
              return <Button key={r.id} className={`risk t-${s.tone} ${risk === r.id ? "on" : ""}`} onClick={() => setRisk(risk === r.id ? null : r.id)}>
                <div className="row" style={{ gap: 6 }}><span className="dot" style={{ color: s.tone ? `var(--${{ gr: "emerald", am: "amber", rd: "red", cy: "cyan" }[s.tone]})` : "var(--ink-4)", width: 7, height: 7 }} /><span style={{ fontSize: 12, fontWeight: 700 }}>{r.label}</span></div>
                <div className="faint" style={{ fontSize: 10.5, marginTop: 3 }}>{s.label}</div></Button>; })}
          </div>
          {selRisk && (
            <div className="col materialize" style={{ gap: 6, marginTop: 10 }}>
              {selRisk.items.map((id) => { const it = itemById(id); const r = recs[id] || {}; const s = stateOf(r);
                return (
                  <div key={id} className="list-item" style={{ cursor: "default", alignItems: "flex-start" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="row" style={{ gap: 6, flexWrap: "wrap" }}><b style={{ fontSize: 13 }}>{it.t}</b><span className={`chip ${s.tone}`} style={{ fontSize: 10 }}>{s.label}</span></div>
                      <div className="src" style={{ marginTop: 3 }}>{r.source ? <>Source <b>{r.source}</b>{r.sourceType ? ` (${r.sourceType})` : ""} · </> : null}{r.note || (r.source ? "" : it.where)}{r.by ? ` · ${r.by}` : ""}{r.date ? ` · ${r.date}` : ""}</div>
                    </div>
                    <Button className="btn ghost sm" onClick={() => setEdit(id)}>Enter evidence for this check</Button>
                  </div>); })}
            </div>)}
        </div>

        <div className="layer tactical" style={{ padding: 14 }}>
          <EvidenceStack key={p.id} sheets={sheets} />
        </div>
      </div>

      <div className="row wrap" style={{ gap: 8, marginTop: 14 }}>
        <Button className="btn quiet" href={mapsUrl(p)} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}><Icon n="pin" s={16} /> Open this parcel on a map</Button>
        <Button className={`btn ${inMission ? "ghost" : ""}`} onClick={addMission}><Icon n={inMission ? "check" : "plus"} s={16} /> {inMission ? "Remove from the mission" : "Save this parcel to a mission"}</Button>
        {go && <Button className="btn ghost" onClick={() => { patchHolo(() => ({ focusParcel: p.id })); go("board"); }}><Icon n="board" s={16} /> Open the checklist</Button>}
        {go && <Button className="btn ghost" onClick={() => { patchHolo(() => ({ focusParcel: p.id })); go("field"); }}><Icon n="cam" s={16} /> Record a site visit</Button>}
        {go && <Button className="btn ghost" onClick={() => { patchHolo(() => ({ focusParcel: p.id })); go("auction"); }}><Icon n="bolt" s={16} /> Open this parcel's sale</Button>}
        {go && <Button className="btn ghost" onClick={() => { patchHolo(() => ({ focusParcel: p.id })); go("title"); }}><Icon n="doc" s={16} /> Save title notes for this parcel</Button>}
      </div>
      <Src>{p.levelNote}. List date {p.listDate ? fmtDate(String(p.listDate).slice(0, 10)) : "unknown"}. {photoCount(p.id)} photos on file.</Src>
      {eye && (
        <GodsEyeView
          p={p}
          point={point}
          status={located.status}
          ring={ring}
          fips={county?.fips || ""}
          record={record}
          card={card}
          photos={shots}
          visit={visit}
          conf={conf}
          parts={PARTS}
          note={saved.note || ""}
          snapshots={saved.snapshots || []}
          onNote={(note) => saveEye({ note })}
          onSnapshot={() => {
            const at = new Date().toISOString();
            const summary = `${flags.length} flags on file. Research confidence ${conf.score}%. Aerial date not on the tile. County sale: ${card?.sale?.display || "not on file"}.`;
            saveEye({ snapshots: [...(saved.snapshots || []), { at, summary }] });
          }}
          onClose={() => setEye(false)}
          onScout={go ? () => { setEye(false); go("field"); } : null}
        />
      )}
      {editItem && (
        <div className="sheet" onClick={() => setEdit(null)}>
          <div className="tactical materialize" style={{ width: "min(640px, 100%)", padding: 16 }} onClick={(e) => e.stopPropagation()}>
            <div className="row between"><div className="micro cy">Evidence · {selRisk ? selRisk.label : ""}</div><Button className="btn quiet sm" onClick={() => setEdit(null)}>Close this evidence</Button></div>
            <div className="h2" style={{ marginTop: 6 }}>{editItem.t}</div>
            <div className="body" style={{ marginTop: 4 }}>{editItem.how}</div>
            <ItemEditor rec={recs[editItem.id] || {}} who={sync && sync.email} onChange={(r, e) => { setRec(p.id, editItem.id, r); if (e && r.stage === "verified") toast("Evidence locked", { x: e.clientX, y: e.clientY }); }} />
          </div>
        </div>)}
    </Halo>
  );
}
