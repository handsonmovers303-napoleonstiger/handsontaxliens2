import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { allCounties, ddProgress, ddVerdict, money, stageOf, STAGES, STOP_ITEMS } from "../data";
import { BRANCHES, itemById, stateOf, STATES, RESOLVED, SOURCE_TYPES, parcelConfidence } from "../intel";
import { useStore, useToast } from "../store";
import { useAllParcels } from "./Parcels";
import { focusScroll, Halo, Ring, ScreenLead, SecHead, Src, Tabs } from "../ui";
import { Button, InteractiveCard } from "../ds";

const STOP = new Set(STOP_ITEMS.map((i) => i.id));
const today = () => new Date().toISOString().slice(0, 10);
const TONE_VAR = { gr: "var(--emerald)", am: "var(--amber)", rd: "var(--red)", cy: "var(--cyan)", in: "var(--indigo)", "": "var(--ink-4)" };

export default function Board({ go }) {
  const { holo, patchHolo, dd, stars, photoCount } = useStore();
  const all = useAllParcels();
  const byId = useMemo(() => new Map(all.map((p) => [p.id, p])), [all]);
  const ids = useMemo(() => [...new Set([...holo.mission, ...Object.keys(stars).filter((k) => k.startsWith("parcel:")).map((k) => k.slice(7)), ...Object.keys(dd)])].filter((id) => byId.has(id)), [holo.mission, stars, dd, byId]);
  const [tab, setTab] = useState("all");
  const rows = ids.map((id) => ({ p: byId.get(id), stage: stageOf(dd[id], photoCount(id)) }));
  const counts = Object.fromEntries(Object.keys(STAGES).map((k) => [k, rows.filter((r) => r.stage === k).length]));
  const shown = rows.filter((r) => tab === "all" || r.stage === tab);
  const focus = byId.get(holo.focusParcel) && ids.includes(holo.focusParcel) ? byId.get(holo.focusParcel) : shown[0] && shown[0].p;

  return (
    <div className="materialize">
      <SecHead ix="04" title="Missions" sub="Work the checklist" right={<span className="chip num">{ids.length} targets</span>} />
      <ScreenLead does="Walk the due-diligence steps for parcels you saved." leads="Scout, if a target needs a visit, or back to the property file." />
      <Tabs tabs={[["all", `All (${rows.length})`], ...Object.entries(STAGES).map(([k, [l]]) => [k, `${l} (${counts[k] || 0})`])]} on={tab} set={setTab} />
      <div className="split" style={{ marginTop: 12 }}>
        <div className="glass pad col scroll stagger" style={{ gap: 6, maxHeight: "72vh" }}>
          {shown.map(({ p, stage }) => {
            const prog = ddProgress(dd[p.id]);
            return (
              <InteractiveCard key={p.id} className={`list-item ${focus && focus.id === p.id ? "on" : ""}`} aria-label={`Show the checklist for APN ${p.apn}`} onClick={() => { patchHolo(() => ({ focusParcel: p.id })); focusScroll(); }}>
                <Ring value={prog.pct} size={40} color={stage === "ready" ? "var(--emerald)" : stage === "killed" ? "var(--red)" : "var(--cyan)"} label={`${prog.pct}`} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="num" style={{ fontSize: 13, fontWeight: 600 }}>{p.apn}</div>
                  <div className="dim" style={{ fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.label}</div>
                  <div className="faint" style={{ fontSize: 11 }}>{p.county}, {p.state} · {money(p.amount)}</div>
                </div>
                <span className={`chip ${STAGES[stage][1]}`} style={{ fontSize: 10 }}>{STAGES[stage][0]}</span>
              </InteractiveCard>);
          })}
          {!shown.length && <div className="empty">No parcels on a mission yet. <Button className="btn sm" type="button" onClick={() => { const mesa = allCounties().find((c) => c.state === "CO" && c.name === "Mesa"); if (mesa) patchHolo((h) => ({ focusCounty: mesa.id, viewed: { ...(h.viewed || {}), [mesa.id]: 1 } })); go("counties", mesa ? { focus: mesa.id } : null); }}>Open the Mesa county file</Button></div>}
        </div>
        {focus ? <MissionTree key={focus.id} p={focus} /> : <div className="empty">Pick a target.</div>}
      </div>
    </div>
  );
}

function MissionTree({ p }) {
  const { dd, setRec, sync, photoCount, photos, holo } = useStore();
  const toast = useToast();
  const recs = dd[p.id] || {};
  const v = ddVerdict(recs);
  const [open, setOpen] = useState(null);
  const [locked, setLocked] = useState(null);
  const county = useMemo(() => allCounties().find((c) => c.key === p.key), [p.key]);
  const conf = parcelConfidence(p, { recs, photos: photos[p.id], visit: holo.visits[p.id], pin: holo.pins[p.id], county });
  const tone = v.label === "CLEARED FOR AUCTION" ? "clear" : v.label === "Do not bid" ? "alert" : "";

  // connectors from the target down to each branch, measured from the laid-out cards
  const wrap = useRef(null); const root = useRef(null); const refs = useRef({});
  const [links, setLinks] = useState([]);
  useLayoutEffect(() => {
    const draw = () => {
      const w = wrap.current, r = root.current; if (!w || !r) return;
      const W = w.getBoundingClientRect(), R = r.getBoundingClientRect();
      const x0 = R.left + R.width / 2 - W.left, y0 = R.bottom - W.top + 14;
      // the target feeds the head of each column; each branch feeds the one below it
      const boxes = BRANCHES.map((b) => { const el = refs.current[b.id]; if (!el) return null; const B = el.getBoundingClientRect();
        return { id: b.id, x: Math.round(B.left + B.width / 2 - W.left), top: B.top - W.top, bottom: B.bottom - W.top }; }).filter(Boolean);
      const cols = new Map(); for (const bx of boxes) { const k = [...cols.keys()].find((x) => Math.abs(x - bx.x) < 8) ?? bx.x; (cols.get(k) || cols.set(k, []).get(k)).push(bx); }
      const out = [];
      for (const list of cols.values()) {
        list.sort((a, b) => a.top - b.top);
        list.forEach((bx, i) => {
          if (i === 0) { const my = (y0 + bx.top) / 2; out.push({ id: bx.id, d: `M${x0},${y0} C${x0},${my} ${bx.x},${my} ${bx.x},${bx.top}` }); }
          else out.push({ id: bx.id, d: `M${bx.x},${list[i - 1].bottom} L${bx.x},${bx.top}` });
        });
      }
      setLinks(out);
    };
    draw(); const ro = new ResizeObserver(draw); ro.observe(wrap.current); return () => ro.disconnect();
  }, [p.id]);

  const branchInfo = (b) => { const st = b.items.map((id) => stateOf(recs[id]).id);
    return { resolved: st.filter((s) => RESOLVED.has(s)).length, started: st.some((s) => s !== "not_started"), bad: st.includes("failed"), flagged: st.includes("flagged") }; };
  const item = open && itemById(open);

  return (
    <div id="focus-card" className="col" style={{ gap: 12, scrollMarginTop: 110 }}>
      <div ref={wrap} className="projection" style={{ padding: 14, position: "relative" }}>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} aria-hidden="true">
          {links.map((l) => { const b = BRANCHES.find((x) => x.id === l.id); const i = branchInfo(b); const done = i.resolved === b.items.length;
            return <path key={l.id + (i.resolved > 0) + done} d={l.d} className={`tree-link ${i.resolved > 0 ? "lit" : ""} ${done ? "gr" : ""}`} />; })}
        </svg>
        <Halo score={conf.score} className={`glass pad ${tone}`} style={{ position: "relative", maxWidth: 560, margin: "0 auto 36px" }}>
          <div ref={root} className="row between wrap" style={{ gap: 10 }}>
            <div style={{ minWidth: 0 }}><div className="micro cy">Target · APN {p.apn}</div><div className="h2" style={{ lineHeight: 1.2 }}>{p.label}</div><div className="dim num" style={{ fontSize: 12 }}>{p.county}, {p.state} · {money(p.amount)} · intel {conf.score}</div></div>
            <div className="materialize" key={v.label} style={{ textAlign: "right" }}>
              <div className="h3" style={{ color: tone === "clear" ? "var(--emerald)" : tone === "alert" ? "var(--red)" : "var(--amber)", letterSpacing: ".04em" }}>{v.label}</div>
              <div className="dim" style={{ fontSize: 12, maxWidth: 260 }}>{v.detail}</div>
            </div>
          </div>
        </Halo>
        <div className="grid g3" style={{ gap: 12, position: "relative" }}>
          {BRANCHES.map((b) => { const i = branchInfo(b); const done = i.resolved === b.items.length;
            return (
              <div key={b.id} ref={(el) => (refs.current[b.id] = el)} className={`branch ${done ? "done" : ""}`}>
                <div className="row between"><span className="micro" style={{ color: i.bad ? "var(--red)" : i.flagged ? "var(--amber)" : done ? "var(--emerald)" : i.started ? "var(--cyan-2)" : undefined }}>{b.label}</span><span className="num faint" style={{ fontSize: 11 }}>{i.resolved}/{b.items.length}</span></div>
                <div className="col" style={{ gap: 6, marginTop: 8 }}>
                  {b.items.map((id) => { const it = itemById(id); const s = stateOf(recs[id]); const photosN = id === "p4" ? photoCount(p.id) : 0; const blank = s.id === "not_started";
                    return (
                      <InteractiveCard key={id} className={`mnode ${locked === id ? "lock-pulse" : ""}`} onClick={() => setOpen(id)}>
                        <span className="dot" style={blank ? { color: "var(--ink-4)", background: "transparent", boxShadow: "none", border: "1px solid var(--ink-4)" } : { color: TONE_VAR[s.tone] }} />
                        <span style={{ flex: 1 }}><span style={{ color: RESOLVED.has(s.id) ? "var(--ink)" : undefined }}>{it.t}</span>{STOP.has(id) && <span style={{ color: "var(--red)", fontSize: 9, fontWeight: 800, letterSpacing: ".1em", marginLeft: 6 }}>STOP</span>}
                          <span className="act">Open this check</span>
                          <span className="faint" style={{ display: "block", fontSize: 11 }}>{s.label}{recs[id]?.source ? ` · ${recs[id].source.slice(0, 32)}` : ""}{photosN ? ` · ${photosN} photos` : ""}</span></span>
                      </InteractiveCard>); })}
                </div>
              </div>); })}
        </div>
      </div>
      {item && (
        <div className="sheet" onClick={() => setOpen(null)}>
          <div className="tactical materialize" style={{ width: "min(640px, 100%)", padding: 16 }} onClick={(e) => e.stopPropagation()}>
            <div className="row between"><div className="micro cy">Mission node {STOP.has(item.id) ? "· stop item" : ""}</div><Button className="btn sm" onClick={() => setOpen(null)}>Close this check</Button></div>
            <div className="h2" style={{ marginTop: 6 }}>{item.t}</div>
            <div className="col" style={{ marginTop: 10 }}>
              {[["How", item.how], ["Where the record lives", item.where], ["What kills it", item.kill]].map(([k, val]) => (
                <div key={k}><div className="micro">{k}</div><div className="body" style={{ color: k === "What kills it" ? "#ff9b9b" : undefined }}>{val}</div></div>))}
            </div>
            <ItemEditor rec={recs[item.id] || {}} who={sync && sync.email} onChange={(r, e) => {
              setRec(p.id, item.id, r);
              if (e && r.stage === "verified") { setLocked(item.id); setTimeout(() => setLocked(null), 500); toast("Evidence locked · node verified", { x: e.clientX, y: e.clientY }); }
            }} />
          </div>
        </div>)}
    </div>
  );
}

/** State, evidence and provenance for one check. Shared by the tree and the dossier. */
export function ItemEditor({ rec, onChange, who }) {
  const st = stateOf(rec);
  const set = (patch, e) => onChange({ ...rec, ...patch, by: who || rec.by || "this device" }, e);
  return (
    <div className="col" style={{ marginTop: 12 }}>
      <div className="micro">State</div>
      <div className="row wrap" style={{ gap: 6 }}>
        {STATES.map((s) => <Button key={s.id} className={`chip btn-chip act-chip ${st.id === s.id ? s.tone || "cy" : ""}`} onClick={(e) => set({ stage: s.id, status: s.status, date: s.id === "not_started" ? null : today() }, e)}>{{ not_started: "Mark not started", researching: "Mark researching", evidence: "Mark evidence found", field: "Mark needs a field visit", verified: "Mark this check verified", flagged: "Mark this check flagged", failed: "Mark this check failed", passed: "Mark not applicable" }[s.id]}</Button>)}
      </div>
      <div className="grid g2" style={{ gap: 8, marginTop: 6 }}>
        <div><div className="micro">Source</div><input className="input" value={rec.source || ""} onChange={(e) => set({ source: e.target.value })} placeholder="Where you looked, who you talked to" /></div>
        <div><div className="micro">Source type</div><select className="input" value={rec.sourceType || ""} onChange={(e) => set({ sourceType: e.target.value || null })}><option value="">Choose…</option>{SOURCE_TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
      </div>
      <div className="micro" style={{ marginTop: 6 }}>Evidence · field note</div>
      <textarea className="input" rows={3} value={rec.note || ""} onChange={(e) => set({ note: e.target.value })} placeholder="What you found: record numbers, document IDs, what the person said" />
      <div className="grid g2" style={{ gap: 8 }}>
        <div><div className="micro">Document link</div><input className="input" value={rec.doc || ""} onChange={(e) => set({ doc: e.target.value })} placeholder="https://… recorder, PACER, report" /></div>
        <div><div className="micro">Map link</div><input className="input" value={rec.map || ""} onChange={(e) => set({ map: e.target.value })} placeholder="https://… GIS, FEMA, imagery" /></div>
      </div>
      <div className="micro" style={{ marginTop: 6 }}>Confidence in this finding</div>
      <div className="row wrap" style={{ gap: 6 }}>
        {[["high", "High", "gr"], ["medium", "Medium", "am"], ["low", "Low", "rd"]].map(([k, l, t]) => <Button key={k} className={`chip btn-chip act-chip ${rec.confidence === k ? t : ""}`} onClick={() => set({ confidence: rec.confidence === k ? null : k })}>{rec.confidence === k ? `Clear ${l.toLowerCase()} confidence` : `Mark confidence ${l.toLowerCase()}`}</Button>)}
      </div>
      <Src>Saved as you type · checked by <b>{who || rec.by || "this device"}</b>{rec.date ? ` · ${rec.date}` : ""}.</Src>
    </div>
  );
}
