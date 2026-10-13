import React, { useEffect, useMemo, useRef, useState } from "react";
import { search, BRANCH_DEFS } from "../../quantum/engine";
import { STATUS, TIERS } from "../../quantum/core";
import { runProtocol, CASES } from "../../quantum/blackswan";
import { supabase } from "../../lib/supabase";
import { ARTIFACT } from "../../lib/env";
import { useStore, useToast } from "../store";
import { useAllParcels } from "./Parcels";
import { Icon, ScreenLead, Src } from "../ui";
import { marketSearchIntent } from "./Marketplace";
import { Button } from "../ds";
import { linkChip } from "../linkCheck";

const QUICK = [
  ["Sales in 90 days", "Show upcoming tax sales in the next 90 days"],
  ["County-held liens", "Which counties have live OTC tax liens right now?"],
  ["How a state bids", "How does Arizona tax lien bidding work?"],
  ["Look up a parcel", null],
  ["Federal liens", "Does this parcel have federal tax liens?"],
  ["Needs a visit", "Show parcels that need field verification"],
  ["What is unknown", "What do we still not know?"],
];
const TONE = { gr: "var(--emerald)", cy: "var(--cyan)", am: "var(--amber)", rd: "var(--red)", in: "var(--indigo)", "": "var(--ink-3)" };
const stTone = (s) => (STATUS[s] ? STATUS[s].tone : "");
const HIST_KEY = "hotl:qs:history";
const readJSON = async (k, d) => { try { const r = await window.storage.get(k); return r ? JSON.parse(r.value) : d; } catch { return d; } };

/** Record what each fact said, when it changes: history instead of overwrite. */
async function recordHistory(res) {
  const h = await readJSON(HIST_KEY, {});
  let changed = false;
  for (const f of res.facts || []) {
    if (!f.id || f.id.startsWith("system")) continue;
    const list = h[f.id] || []; const last = list[list.length - 1];
    if (!last || last.v !== (f.value == null ? null : String(f.value)) || last.s !== f.status) {
      list.push({ v: f.value == null ? null : String(f.value), d: f.display, s: f.status, src: f.lead ? f.lead.agency : null, at: new Date().toISOString(), checked: f.lastChecked });
      h[f.id] = list.slice(-20); changed = true;
    }
  }
  const keys = Object.keys(h); if (keys.length > 500) for (const k of keys.slice(0, keys.length - 500)) delete h[k];
  if (changed) await window.storage.set(HIST_KEY, JSON.stringify(h));
  return h;
}
const LIVE_FIELD = { sale_date: "sale_date", registration_deadline: "registration_closes", platform: "platform", otc_status: "otc_status", phone: "phone", deposit: null };

export default function Search({ go }) {
  const store = useStore();
  const { holo, patchHolo, dd, photos, positions, sync } = store;
  const toast = useToast();
  const all = useAllParcels();
  const extraParcels = useMemo(() => all.filter((p) => p.level === "PROMOTED"), [all]);
  const focus = holo.focusParcel ? all.find((p) => p.id === holo.focusParcel) : null;
  const [q, setQ] = useState("");
  const [res, setRes] = useState(null);
  const [lit, setLit] = useState(-1);
  const [hist, setHist] = useState({});
  const [bs, setBs] = useState(null);
  const inputRef = useRef(null);
  const ctx = { dd, photos, holo, positions, extraParcels };

  const run = (text) => {
    const t = (text ?? q).trim(); if (!t) return;
    setQ(t);
    const r = search(t, ctx);
    setRes(r); setLit(-1);
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) setLit(99); else BRANCH_DEFS.forEach((_, i) => setTimeout(() => setLit(i), 70 * (i + 1))), setTimeout(() => setLit(99), 70 * (BRANCH_DEFS.length + 2));
    recordHistory(r).then(setHist);
    patchHolo((h) => ({ recentSearches: [t, ...((h.recentSearches || []).filter((x) => x !== t))].slice(0, 8) }));
  };
  useEffect(() => { readJSON(HIST_KEY, {}).then(setHist); }, []);

  const watch = (f, query) => {
    if ((holo.watches || []).some((w) => w.id === f.id)) { patchHolo((h) => ({ watches: (h.watches || []).filter((w) => w.id !== f.id) })); toast("Stopped watching"); return; }
    patchHolo((h) => ({ watches: [...(h.watches || []), { id: f.id, label: f.label, entity: f.entity, query, v: f.value == null ? null : String(f.value), d: f.display, s: f.status, at: new Date().toISOString() }] }));
    toast(`Watching ${f.label.toLowerCase()}`);
  };
  const addToDossier = (f) => {
    const pid = f.entity && f.entity.startsWith("parcel:") ? f.entity.slice(7) : null;
    if (pid && !holo.mission.includes(pid)) patchHolo((h) => ({ mission: [...h.mission, pid] }));
    patchHolo((h) => ({ dossier: [...((h.dossier || []).filter((x) => x.id !== f.id)), { id: f.id, label: f.label, d: f.display, s: f.status, src: f.lead ? f.lead.agency : null, at: new Date().toISOString() }] }));
    toast(pid ? "Added to dossier and mission" : "Pinned to dossier");
  };
  const actions = { watch, addToDossier, hist, watching: new Set((holo.watches || []).map((w) => w.id)), run, go, patchHolo };

  return (
    <div className="materialize">
      <div className="qs-hero">
        <div className="micro cy" style={{ textAlign: "center" }}>Hands On Tax Liens</div>
        <h1 className="h1" style={{ textAlign: "center", marginTop: 6 }}>Search</h1>
        <div className="soft" style={{ textAlign: "center", marginTop: 6, fontSize: 14 }}>Ask one question. The answer shows which records were checked.</div>
        <ScreenLead does="Search the same records as Home, one question at a time, and show the evidence branches." leads="The county file, the property file, or Market if you asked to sell or buy a certificate." />
        <form className="qs-bar" onSubmit={(e) => { e.preventDefault(); run(); }} role="search"
          onClick={(e) => { if (!e.target.closest("button")) e.currentTarget.querySelector("input")?.focus(); }}>
          <Icon n="search" s={20} c="var(--cyan)" />
          <input id="qs-input" ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search any county, parcel, owner, auction, statute, lien, or question..." aria-label="Quantum Search" autoComplete="off" />
          <Button className="btn" type="submit" onClick={() => run()}>Search records</Button>
        </form>
        <div className="row wrap" style={{ gap: 6, justifyContent: "center", marginTop: 10 }}>
          {QUICK.map(([l, text]) => <Button key={l} className="chip btn-chip cy" onClick={() => run(text || (focus ? `APN ${focus.apn} in ${focus.county} County, ${focus.state}` : "APN R0620610"))}>{l.toUpperCase()}</Button>)}
          <Button className="chip btn-chip" type="button" onClick={() => go("market")}>Open the market</Button>
          <Button className="chip btn-chip" type="button" onClick={() => go("market", { tab: "sell" })}>Start a sale draft</Button>
          <Button className="chip btn-chip" type="button" onClick={() => go("market", { tab: "requests" })}>Say what you want to buy</Button>
          <Button className="chip btn-chip gd" onClick={() => { setBs("running"); setTimeout(() => setBs(runProtocol()), 30); }}>Run the stress check</Button>
        </div>
        {(holo.recentSearches || []).length > 0 && !res && <div className="row wrap" style={{ gap: 6, justifyContent: "center", marginTop: 8 }}>{holo.recentSearches.slice(0, 5).map((t) => <Button key={t} className="chip btn-chip" onClick={() => run(t)}>↺ {t.slice(0, 48)}</Button>)}</div>}
        {focus && <div className="faint" style={{ textAlign: "center", fontSize: 11.5, marginTop: 8 }}>Parcel in focus for "this parcel" questions: APN {focus.apn}, {focus.county} {focus.state}</div>}
      </div>

      {marketSearchIntent(q) && (
        <div className="glass pad" style={{ marginTop: 12 }}>
          <div className="micro cy">Marketplace</div>
          <p className="body">This opens the certificate marketplace. It does not search auction inventory into a listing, and it does not invent buyers.</p>
          <Button className="btn" type="button" onClick={() => go("market", { tab: marketSearchIntent(q) })}>Open {marketSearchIntent(q) === "browse" ? "marketplace" : marketSearchIntent(q) === "sell" ? "a sale draft" : "buyer requests"}</Button>
        </div>
      )}
      {bs && <BlackSwan bs={bs} onClose={() => setBs(null)} onRun={run} />}
      <Watches holo={holo} ctx={ctx} onRun={run} patchHolo={patchHolo} />

      {res && (
        <div className="col" style={{ gap: 12, marginTop: 14 }}>
          <Branches res={res} lit={lit} />
          {lit >= 99 && <Answer res={res} A={actions} sync={sync} />}
        </div>)}
      <Src>"Quantum" names the many evidence branches searched at once. Quantum Search runs on ordinary computers; it uses no quantum hardware or quantum algorithms. {ARTIFACT ? "In this view it searches the verified tables bundled with the app and your own research." : "It searches the verified tables, the team's live corrections in Supabase, and your own research."}</Src>
    </div>
  );
}

/* --------------------------- parallel branch view --------------------------- */
function Branches({ res, lit }) {
  const n = res.branches.length, W = 900, H = 180, cx = W / 2, cy = H - 26;
  const lines = (l) => (l.length > 9 && l.includes(" ") ? l.toUpperCase().split(" ") : [l.toUpperCase()]);
  return (
    <div className="projection" style={{ padding: "10px 8px 4px", overflowX: "auto" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", minWidth: 620, height: "auto", display: "block" }} role="img" aria-label="Evidence branches searched in parallel">
        {res.branches.map((b, i) => { const x = 60 + (i * (W - 120)) / (n - 1), y = 44; const on = lit >= i;
          const col = b.status === "found" ? "#18d69b" : b.status === "unconnected" ? "#745cff" : b.status === "none" ? "#6f819b" : "#2a3a55";
          return <g key={b.id}>
            <path d={`M${x},${y + 10} C${x},${(y + cy) / 2} ${cx},${(y + cy) / 2} ${cx},${cy - 12}`} fill="none" stroke={on && b.status === "found" ? "rgba(0,229,255,.7)" : "rgba(80,140,255,.14)"} strokeWidth={on && b.status === "found" ? 1.6 : 1} strokeDasharray={b.status === "unconnected" ? "3 5" : undefined} style={{ transition: "stroke .4s" }} />
            <circle cx={x} cy={y} r="9" fill={on ? col : "#101927"} stroke={on ? col : "#2a3a55"} style={{ transition: "fill .3s", filter: on && b.status === "found" ? `drop-shadow(0 0 6px ${col})` : "none" }} />
            <text x={x} y={y - (lines(b.label).length > 1 ? 28 : 16)} textAnchor="middle" fontSize="10.5" fontWeight="700" fill={on ? "var(--ink)" : "var(--ink-4)"} letterSpacing=".06em">{lines(b.label).map((w, k) => <tspan key={k} x={x} dy={k ? 12 : 0}>{w}</tspan>)}</text>
            <text x={x} y={y + 26} textAnchor="middle" fontSize="9.5" fill={col} fontFamily="JetBrains Mono, monospace">{on ? ({ found: "found", none: "nothing on file", unconnected: "not connected", skipped: "not queried" }[b.status]) : "…"}</text>
          </g>; })}
        <circle cx={cx} cy={cy} r="12" fill={lit >= 99 ? "#00e5ff" : "#101927"} stroke="#5cf0ff" style={{ filter: lit >= 99 ? "drop-shadow(0 0 10px #00e5ff)" : "none", transition: "fill .4s" }} />
        <text x={cx + 20} y={cy + 4} fontSize="11.5" fontWeight="800" fill={lit >= 99 ? "var(--cyan-2)" : "var(--ink-4)"} letterSpacing=".14em">VERIFIED INTELLIGENCE</text>
      </svg>
      <div className="row wrap" style={{ gap: 10, fontSize: 10.5, padding: "0 8px 6px" }} >
        {res.branches.filter((b) => b.detail && lit >= 99).map((b) => <span key={b.id} className="faint"><b className="soft">{b.label}</b>: {b.detail}</span>)}
      </div>
    </div>
  );
}

/* --------------------------------- answer --------------------------------- */
function Answer({ res, A, sync }) {
  const a = res.answer;
  const [confOpen, setConfOpen] = useState(false);
  return (
    <div className="col materialize" style={{ gap: 12 }}>
      <div className={`glass pad ${a.status === "CONFLICT" ? "alert" : RESOLVED(a.status) ? "clear" : ""}`}>
        <div className="micro">Question</div>
        <div className="soft" style={{ fontSize: 15, marginTop: 2 }}>{res.question}</div>
        <div className="micro cy" style={{ marginTop: 12 }}>Direct answer</div>
        <div style={{ fontSize: 19, fontWeight: 700, lineHeight: 1.4, marginTop: 4 }}>{a.text}</div>
        <div className="row wrap" style={{ gap: 8, marginTop: 12 }}>
          <span className={`chip ${stTone(a.status)}`}>{(STATUS[a.status] || STATUS.MISSING).label.toUpperCase()}</span>
          {a.confidence != null ? <Button className="chip btn-chip cy" onClick={() => setConfOpen(!confOpen)}>CONFIDENCE {a.confidence}% {confOpen ? "▴" : "▾"}</Button> : <span className="chip">CONFIDENCE —</span>}
          <span className="chip">LAST CHECKED {a.lastChecked || "—"}</span>
          <span className="chip">{res.sources.length} SOURCES · {res.facts.filter((f) => f.evidenceCount).length} SUPPORTED FIELDS</span>
          {res.classes && res.classes.map(([c, t, why]) => <span key={c} className={`chip ${t}`} title={why}>{c}</span>)}
        </div>
        {confOpen && a.fact && a.fact.confidence && <ConfBreakdown f={a.fact} />}
        {res.disclaimer && <div className="chip am" style={{ marginTop: 10 }}>{res.disclaimer}</div>}
      </div>

      {res.graph && <Graph nodes={res.graph} />}
      {res.cards && res.cards.length > 0 && <div className="grid g2">{res.cards.map((f) => <FactCard key={f.id} f={f} A={A} query={res.question} />)}</div>}
      {res.rules && <Rules R={res.rules} />}
      {res.gaps && <Gaps G={res.gaps} />}
      {res.rows && res.rows.length > 0 && <Rows res={res} A={A} />}
      {res.groups && res.groups.map((g) => (
        <div key={g.title} className="tactical" style={{ padding: 14 }}>
          <div className="micro cy">{g.title}</div>
          {g.banner && <div className="chip am" style={{ whiteSpace: "normal", marginTop: 6 }}>{g.banner}</div>}
          <div className="grid g2" style={{ gap: 8, marginTop: 8 }}>{g.facts.filter(Boolean).map((f) => <FactCard key={f.id} f={f} A={A} query={res.question} compact />)}</div>
        </div>))}
      {res.links && res.links.length > 0 && (
        <div className="tactical" style={{ padding: 14 }}><div className="micro cy">Offices, portals & datasets on file</div>
          <div className="col" style={{ gap: 4, marginTop: 8 }}>{res.links.map((l, i) => {
            const mark = linkChip(l.url, l.level);
            return <a key={i} href={l.url} target="_blank" rel="noreferrer" className="row" style={{ gap: 8, fontSize: 12.5, textDecoration: "none" }} title={mark.note}><span className={`chip ${mark.tone}`} style={{ fontSize: 9.5 }}>{mark.word}</span><span style={{ color: "var(--ink)" }}>{l.label}</span><span className="faint">{l.kind}</span></a>;
          })}</div></div>)}

      <div className="grid g2">
        <div className="tactical" style={{ padding: 14 }}>
          <div className="micro cy">Primary sources</div>
          <div className="col" style={{ gap: 6, marginTop: 8 }}>
            {res.sources.slice(0, 12).map((s) => <SourceLine key={s.id} s={s} />)}
            {!res.sources.length && <div className="faint" style={{ fontSize: 12.5 }}>No source supports an answer to this question.</div>}
            {res.sources.length > 12 && <div className="faint" style={{ fontSize: 11.5 }}>+{res.sources.length - 12} more</div>}
          </div>
        </div>
        <div className="tactical" style={{ padding: 14 }}>
          <div className="micro" style={{ color: res.conflicts.length ? "var(--red)" : undefined }}>Conflicts · {res.conflicts.length}</div>
          {res.conflicts.map((f) => <ConflictCard key={f.id} f={f} />)}
          {!res.conflicts.length && <div className="faint" style={{ fontSize: 12.5, marginTop: 6 }}>No comparable sources disagree.</div>}
        </div>
        <div className="tactical" style={{ padding: 14 }}>
          <div className="micro">Missing intelligence · {res.missing.length}</div>
          <div className="col" style={{ gap: 4, marginTop: 8 }}>
            {res.missing.slice(0, 14).map((f) => <div key={f.id} className="row" style={{ gap: 8, fontSize: 12.5, alignItems: "flex-start" }}><span className={`chip ${stTone(f.status)}`} style={{ fontSize: 9.5, minWidth: 74, justifyContent: "center" }}>{STATUS[f.status].label.toUpperCase()}</span><span><b>{f.label}</b>{f.entity && !/^(state|system)/.test(f.entity) && res.rows ? <span className="soft"> · {f.entity.replace(/^county:/, "").split("|").reverse().join(", ").replace(/^parcel:prop:/, "")}</span> : null}{f.where ? <span className="faint"> · {f.where}</span> : null}</span></div>)}
            {!res.missing.length && <div className="faint" style={{ fontSize: 12.5 }}>Nothing the schema asks for is missing here.</div>}
          </div>
        </div>
        <div className="tactical" style={{ padding: 14 }}>
          <div className="micro">Recommended next research</div>
          <ol className="body" style={{ paddingLeft: 18, margin: "8px 0 0", fontSize: 13 }}>{(res.next || []).map((n, i) => <li key={i} style={{ marginBottom: 4 }}>{n}</li>)}</ol>
          {!(res.next || []).length && <div className="faint" style={{ fontSize: 12.5, marginTop: 6 }}>Nothing pending from this answer.</div>}
          {(res.notes || []).map((n, i) => <Src key={i}>{n}</Src>)}
        </div>
      </div>

      <details className="tactical" style={{ padding: 14 }} open>
        <summary className="micro cy" style={{ cursor: "pointer" }}>Search trace · reproducible</summary>
        <ol style={{ margin: "8px 0 0", paddingLeft: 20, fontSize: 12.5 }} className="soft">{res.trace.map((t, i) => <li key={i} style={{ marginBottom: 4 }}><b style={{ color: "var(--ink)" }}>{t.stage}.</b> {t.text}</li>)}</ol>
      </details>
    </div>
  );
}
const RESOLVED = (s) => s === "VERIFIED" || s === "CORROBORATED";

function ConfBreakdown({ f }) {
  return (
    <div className="tactical materialize" style={{ padding: 12, marginTop: 10 }}>
      <div className="micro">Why {f.confidence.score}%</div>
      {f.confidence.parts.map((p) => (
        <div key={p.k} className="row" style={{ gap: 10, fontSize: 12.5, padding: "4px 0", borderBottom: "1px solid rgba(90,170,255,.06)" }}>
          <span style={{ width: 150 }} className="soft">{p.label} <span className="faint num">{p.weight}%</span></span>
          <span className="num" style={{ width: 40, color: p.value >= 70 ? "var(--emerald)" : p.value >= 40 ? "var(--cyan-2)" : "var(--amber)" }}>{p.value}</span>
          <span className="faint" style={{ flex: 1 }}>{p.why}</span>
        </div>))}
      {f.status === "CONFLICT" && <Src>Unresolved conflicts are capped at 60% until someone resolves them.</Src>}
    </div>
  );
}

function SourceLine({ s }) {
  return (
    <div className="row" style={{ gap: 8, fontSize: 12.5, alignItems: "flex-start" }}>
      <span className={`chip ${s.tier === 1 ? "gr" : s.tier === 2 ? "cy" : s.tier === 3 ? "am" : ""}`} style={{ fontSize: 9.5 }}>{TIERS[s.tier].short}</span>
      <div style={{ minWidth: 0 }}>
        {s.url ? <a href={s.url} target="_blank" rel="noreferrer">{s.label}</a> : <span>{s.label}</span>}
        <div className="faint" style={{ fontSize: 11 }}>{s.agency} · {s.type} · {s.method}{s.accessed ? ` · accessed ${s.accessed}` : " · access date not recorded"}{s.url ? "" : " · no URL on file"}</div>
      </div>
    </div>
  );
}

function ConflictCard({ f }) {
  return (
    <div className="glass alert" style={{ padding: 12, marginTop: 8 }}>
      <div className="micro" style={{ color: "var(--red)" }}>Source conflict · {f.label}</div>
      <div className="grid g2" style={{ gap: 8, marginTop: 6 }}>
        {f.conflicts.map((c, i) => (
          <div key={i} className="stat"><div className="v" style={{ fontSize: 15 }}>{c.value}</div>
            {c.sources.map((s) => <div key={s.id} className="n">{TIERS[s.tier].short} · {s.agency}{s.accessed ? ` · accessed ${s.accessed}` : ""}{s.effective ? ` · published ${s.effective}` : ""}</div>)}</div>))}
      </div>
      <Src>{f.conflictNote}</Src>
      <div className="chip rd" style={{ marginTop: 6 }}>VERIFICATION REQUIRED</div>
    </div>
  );
}

/* ------------------------------ result card ------------------------------ */
function FactCard({ f, A, query, compact }) {
  const [open, setOpen] = useState(null);
  const [live, setLive] = useState(null);
  const tone = stTone(f.status);
  const history = A.hist[f.id] || [];
  const loadLive = async () => {
    const field = LIVE_FIELD[f.key]; const fips = f.lead && f.lead.recordId && /county_intel/.test(f.lead.recordId) ? f.lead.recordId.split("· ")[1].split(":")[0] : null;
    if (ARTIFACT || !field || !fips) return;
    const { data } = await supabase.from("county_intel").select("value,source,confidence,created_at,author_name").eq("fips", fips).eq("field", field).order("created_at");
    setLive(data || []);
  };
  const toggle = (k) => { setOpen(open === k ? null : k); if (k === "history") loadLive(); };
  return (
    <div className={`node st-${f.status === "CONFLICT" ? "fail" : RESOLVED(f.status) ? "clear" : f.status === "PROVISIONAL" || f.status === "STALE" ? "flag" : ""}`} style={{ cursor: "default" }}>
      <div className="row between" style={{ gap: 6 }}>
        <span className="micro" style={{ fontSize: 9.5 }}>{f.label}</span>
        <span className={`chip ${tone}`} style={{ fontSize: 9.5 }}>{STATUS[f.status].label.toUpperCase()}</span>
      </div>
      <div style={{ fontSize: compact ? 13.5 : 15.5, fontWeight: 700, marginTop: 6, lineHeight: 1.35, color: f.value == null ? "var(--ink-3)" : "var(--ink)" }}>{f.display}</div>
      <div className="src" style={{ marginTop: 6 }}>
        {f.lead ? <>Source <b>{f.lead.agency}</b> ({TIERS[f.lead.tier].short}) · checked {f.lastChecked || "—"} · {f.evidenceCount} evidence</> : <>No source · {f.where || "source needed"}</>}
        {f.confidence ? <> · confidence <b style={{ color: TONE[tone] }}>{f.confidence.score}%</b></> : null}
      </div>
      <div className="row wrap" style={{ gap: 4, marginTop: 8 }}>
        {f.lead && f.lead.url && <a className="chip btn-chip" href={f.lead.url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>Open source ↗</a>}
        {f.evidenceCount > 0 && <Button className={`chip btn-chip ${open === "evidence" ? "cy" : ""}`} onClick={() => toggle("evidence")}>{open === "evidence" ? "Hide the evidence" : "Show the evidence"}</Button>}
        <Button className={`chip btn-chip ${open === "history" ? "cy" : ""}`} onClick={() => toggle("history")}>{open === "history" ? "Hide the history" : `Show the history${history.length > 1 ? ` · ${history.length}` : ""}`}</Button>
        {f.evidenceCount > 1 && <Button className={`chip btn-chip ${open === "compare" ? "cy" : ""}`} onClick={() => toggle("compare")}>{open === "compare" ? "Hide the comparison" : "Compare the sources"}</Button>}
        {f.confidence && <Button className={`chip btn-chip ${open === "why" ? "cy" : ""}`} onClick={() => toggle("why")}>{open === "why" ? "Hide the score math" : `Show why ${f.confidence.score}%`}</Button>}
        <Button className="chip btn-chip" onClick={() => A.addToDossier(f)}>Pin this answer</Button>
        <Button className={`chip btn-chip ${A.watching.has(f.id) ? "gd" : ""}`} onClick={() => A.watch(f, query)}>{A.watching.has(f.id) ? "Watching this answer" : "Watch this answer"}</Button>
      </div>
      {open === "evidence" && <div className="col materialize" style={{ gap: 6, marginTop: 8 }}>{f.evidence.map((o, i) => <EvidenceRow key={i} o={o} />)}</div>}
      {open === "compare" && (
        <div style={{ overflowX: "auto", marginTop: 8 }}><table className="qs-table"><thead><tr><th>Value</th><th>Source</th><th>Tier</th><th>Accessed</th><th>Method</th></tr></thead>
          <tbody>{f.evidence.map((o, i) => <tr key={i}><td>{o.display || String(o.value)}</td><td>{o.source.url ? <a href={o.source.url} target="_blank" rel="noreferrer">{o.source.agency}</a> : o.source.agency}</td><td>{TIERS[o.source.tier].short}</td><td>{o.source.accessed || "—"}</td><td>{o.source.method}</td></tr>)}</tbody></table></div>)}
      {open === "why" && <ConfBreakdown f={f} />}
      {open === "history" && (
        <div className="col materialize" style={{ gap: 4, marginTop: 8, fontSize: 12 }}>
          {history.map((h, i) => <div key={i} className="row" style={{ gap: 8 }}><span className="num faint" style={{ width: 118 }}>{h.at.slice(0, 16).replace("T", " ")}</span><span style={{ flex: 1 }}>{i > 0 ? <><s className="faint">{history[i - 1].v ?? "—"}</s> → </> : null}<b>{h.v ?? "—"}</b> <span className="faint">{STATUS[h.s] ? STATUS[h.s].label : h.s}{h.src ? ` · ${h.src}` : ""}</span></span></div>)}
          {live && live.map((r, i) => <div key={"l" + i} className="row" style={{ gap: 8 }}><span className="num faint" style={{ width: 118 }}>{r.created_at.slice(0, 16).replace("T", " ")}</span><span style={{ flex: 1 }}><b>{r.value}</b> <span className="faint">{r.confidence} · {r.author_name || "team"} · {r.source}</span></span></div>)}
          <Src>History records each value this search has seen, with its source and time{ARTIFACT ? "" : ", plus every team correction in Supabase"}. Values are never overwritten.</Src>
        </div>)}
    </div>
  );
}
function EvidenceRow({ o }) {
  const s = o.source;
  return (
    <div className="tactical" style={{ padding: 10, fontSize: 12 }}>
      <div className="row between"><b>{o.display || String(o.value)}</b><span className={`chip ${s.tier === 1 ? "gr" : s.tier === 2 ? "cy" : s.tier === 3 ? "am" : ""}`} style={{ fontSize: 9.5 }}>{TIERS[s.tier].label}</span></div>
      <div className="kv" style={{ marginTop: 4, fontSize: 11.5 }}>
        <div>Source</div><div>{s.label}</div>
        <div>Agency</div><div>{s.agency}</div>
        <div>Type</div><div>{s.type}</div>
        <div>URL</div><div>{s.url ? <a href={s.url} target="_blank" rel="noreferrer">{s.url}</a> : "Not recorded"}</div>
        <div>Accessed</div><div>{s.accessed || "Not recorded"}</div>
        <div>Effective</div><div>{s.effective || "—"}</div>
        <div>Jurisdiction</div><div>{s.jurisdiction || "—"}</div>
        <div>Record ID</div><div>{s.recordId || "—"}</div>
        <div>Extraction</div><div>{s.method}{s.human ? " · read by a person" : ""}{s.derived ? " · derived" : ""}</div>
        {s.note && <><div>Note</div><div>{s.note}</div></>}
      </div>
    </div>
  );
}

/* ------------------------------ graph, rows, gaps ------------------------------ */
function Graph({ nodes }) {
  return (
    <div className="projection" style={{ padding: 12, overflowX: "auto" }}>
      <div className="micro cy" style={{ marginBottom: 8 }}>Evidence graph</div>
      <div className="qs-graph">
        {nodes.map((n, i) => { const t = n.status === "n/a" ? "" : stTone(n.status);
          return <React.Fragment key={n.id}>
            {i > 0 && <span className={`qs-edge ${nodes[i - 1].status !== "n/a" && n.status !== "n/a" && n.status !== "MISSING" ? "on" : ""}`} />}
            <div className={`qs-node ${n.status === "n/a" ? "na" : ""}`} style={{ borderColor: n.status === "n/a" ? undefined : TONE[t] }} title={n.detail}>
              <div className="micro" style={{ fontSize: 9, color: n.status === "n/a" ? "var(--ink-4)" : TONE[t] }}>{n.label}</div>
              <div style={{ fontSize: 11, color: "var(--ink-2)", marginTop: 2 }}>{n.status === "n/a" ? "not in scope" : STATUS[n.status] ? STATUS[n.status].label : n.status}</div>
              {n.detail && <div className="faint" style={{ fontSize: 10, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 130 }}>{n.detail}</div>}
            </div></React.Fragment>; })}
      </div>
    </div>
  );
}
function Rows({ res, A }) {
  const [openRow, setOpenRow] = useState(null);
  return (
    <div className="tactical" style={{ padding: 14 }}>
      <div className="row between"><div className="micro cy">Results · {res.total ?? res.rows.length}</div>{res.total > res.rows.length && <span className="faint" style={{ fontSize: 11 }}>showing {res.rows.length}</span>}</div>
      <div className="col" style={{ gap: 6, marginTop: 8 }}>
        {res.rows.map((r, i) => (
          <div key={i} className="list-item" style={{ cursor: "default", flexDirection: "column", alignItems: "stretch" }}>
            <div className="row" style={{ gap: 10 }}>
              <span className={`chip ${stTone(r.status)}`} style={{ fontSize: 9.5, minWidth: 90, justifyContent: "center" }}>{(STATUS[r.status] || STATUS.MISSING).label.toUpperCase()}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                {r.url ? <a href={r.url} target="_blank" rel="noreferrer" style={{ fontWeight: 700, fontSize: 13.5 }}>{r.title}</a> : <b style={{ fontSize: 13.5 }}>{r.title}</b>}
                <div className="faint" style={{ fontSize: 11.5 }}>{r.sub}{r.fields ? ` · supports: ${r.fields.slice(0, 4).join(", ")}` : ""}</div>
              </div>
              {r.conf != null && <span className="num" style={{ fontSize: 12, color: "var(--cyan-2)" }}>{r.conf}%</span>}
              {r.facts && <Button className="chip btn-chip" onClick={() => setOpenRow(openRow === i ? null : i)}>{openRow === i ? "Hide this row" : "Show this row"}</Button>}
              {r.query && <Button className="chip btn-chip cy" onClick={() => A.run(r.query)}>Run this search</Button>}
              {r.parcelId && <Button className="chip btn-chip" onClick={() => { A.patchHolo(() => ({ focusParcel: r.parcelId })); A.go("parcels"); }}>Open this property file</Button>}
            </div>
            {openRow === i && r.facts && <div className="grid g3 materialize" style={{ gap: 8, marginTop: 8 }}>{r.facts.map((f) => <FactCard key={f.id} f={f} A={A} query={r.query || res.question} compact />)}</div>}
          </div>))}
      </div>
    </div>
  );
}
function Gaps({ G }) {
  const Col = ({ title, tone, items, render }) => (
    <div className="tactical" style={{ padding: 12 }}>
      <div className="micro" style={{ color: TONE[tone] }}>{title} · {items.length}</div>
      <div className="col" style={{ gap: 3, marginTop: 6, fontSize: 12.5 }}>{items.slice(0, 16).map(render)}{items.length > 16 && <span className="faint">+{items.length - 16} more</span>}{!items.length && <span className="faint">None</span>}</div>
    </div>);
  return (
    <div className="grid g3">
      {!G.onlyKillers && <Col title="What we know" tone="gr" items={G.known} render={(f) => <div key={f.id}><b>{f.label}</b> <span className="faint">· {STATUS[f.status].label.toLowerCase()}</span></div>} />}
      {!G.onlyKillers && <Col title="What we don't know" tone="" items={G.unknown} render={(f) => <div key={f.id}><b>{f.label}</b>{f.where ? <span className="faint"> · {f.where}</span> : null}</div>} />}
      {!G.onlyKillers && <Col title="What conflicts" tone="rd" items={G.conflicts} render={(f) => <div key={f.id}><b>{f.label}</b> <span className="faint">· {STATUS[f.status].label.toLowerCase()}</span></div>} />}
      {!G.onlyKillers && <Col title="Needs field verification" tone="in" items={G.field} render={(f) => <div key={f.id}>{f.label}</div>} />}
      <Col title="What could kill the deal" tone="am" items={G.killers} render={(k) => <div key={k.id}><span className={`chip ${k.state === "FOUND" ? "rd" : k.state === "FLAGGED" ? "am" : ""}`} style={{ fontSize: 9 }}>{k.state}</span> <b>{k.label}</b><div className="faint" style={{ fontSize: 11 }}>{k.kill}</div></div>} />
    </div>
  );
}
function Rules({ R }) {
  return (
    <div className="tactical" style={{ padding: 14 }}>
      <div className="row between wrap"><div className="micro cy">Rule statements · each with its authority</div><span className="faint" style={{ fontSize: 11 }}>last verified {R.lastVerified || "—"}</span></div>
      <ol style={{ paddingLeft: 18, margin: "8px 0 0" }}>
        {R.statements.map((s, i) => <li key={i} className="body" style={{ fontSize: 13, marginBottom: 8 }}>{s.text}<div className="faint" style={{ fontSize: 11 }}>Authority: {s.cite || s.source.recordId || s.source.label}{s.source.url ? <> · <a href={s.source.url} target="_blank" rel="noreferrer">{s.source.url.replace(/^https?:\/\//, "")}</a></> : " · no URL on file"}</div></li>)}
      </ol>
      <div className="micro" style={{ marginTop: 8 }}>Statutory references</div>
      <div className="col" style={{ gap: 4, marginTop: 6 }}>{R.refs.map((s) => <SourceLine key={s.id} s={s} />)}{!R.refs.length && <span className="faint" style={{ fontSize: 12.5 }}>None on file: this state is not in the verified rulebook.</span>}</div>
      {R.variations.length > 0 && <><div className="micro" style={{ marginTop: 10 }}>County variations</div>
        <div className="col" style={{ gap: 4, marginTop: 6 }}>{R.variations.map((v) => <div key={v.title} style={{ fontSize: 12.5 }}><b>{v.title}</b> <span className="faint">· {v.sub}</span></div>)}</div></>}
    </div>
  );
}

/* ------------------------------- watch engine ------------------------------- */
function Watches({ holo, ctx, onRun, patchHolo }) {
  const ws = holo.watches || [];
  const [open, setOpen] = useState(false);
  const checked = useMemo(() => ws.map((w) => {
    let f = null; try { f = search(w.query, ctx).facts.find((x) => x.id === w.id); } catch { /* query no longer resolves */ }
    const now = f ? { v: f.value == null ? null : String(f.value), s: f.status, d: f.display } : null;
    // meaningful = the value changed, or it moved into a verified or conflicting state
    const changed = now && (now.v !== w.v || (now.s !== w.s && ["VERIFIED", "CORROBORATED", "CONFLICT"].includes(now.s)));
    return { w, now, changed };
  }), [JSON.stringify(ws), ctx.dd, ctx.holo.pins]);
  if (!ws.length) return null;
  const n = checked.filter((c) => c.changed).length;
  return (
    <div className={`glass pad ${n ? "rare" : ""}`} style={{ marginTop: 12 }}>
      <div className="row between"><div className="micro cy">Watch engine · {ws.length} watched{n ? ` · ${n} verified change${n > 1 ? "s" : ""}` : " · no changes"}</div><Button className="chip btn-chip" onClick={() => setOpen(!open)}>{open ? "Hide watched answers" : "Show watched answers"}</Button></div>
      {(open || n > 0) && <div className="col" style={{ gap: 6, marginTop: 8 }}>
        {checked.filter((c) => open || c.changed).map(({ w, now, changed }) => (
          <div key={w.id} className="list-item" style={{ cursor: "default" }}>
            <span className={`chip ${changed ? "gd" : ""}`} style={{ fontSize: 9.5 }}>{changed ? "CHANGED" : "STEADY"}</span>
            <div style={{ flex: 1, minWidth: 0, fontSize: 12.5 }}><b>{w.label}</b> <span className="faint">· {w.entity.replace(/^(county|parcel):/, "")}</span>
              <div className="faint">{changed ? <>{w.d} → <b style={{ color: "var(--ink)" }}>{now.d}</b> ({STATUS[now.s].label})</> : now ? `${now.d} · ${STATUS[now.s].label}` : "No longer resolves"}</div></div>
            <Button className="chip btn-chip cy" onClick={() => onRun(w.query)}>Run this search</Button>
            {changed && <Button className="chip btn-chip" onClick={() => patchHolo((h) => ({ watches: (h.watches || []).map((x) => (x.id === w.id ? { ...x, v: now.v, s: now.s, d: now.d, at: new Date().toISOString() } : x)) }))}>Mark this change as seen</Button>}
            <Button className="chip btn-chip" onClick={() => patchHolo((h) => ({ watches: (h.watches || []).filter((x) => x.id !== w.id) }))}>Stop watching</Button>
          </div>))}
      </div>}
    </div>
  );
}

/* ---------------------------- black swan protocol ---------------------------- */
function BlackSwan({ bs, onClose, onRun }) {
  if (bs === "running") return <div className="glass pad" style={{ marginTop: 12 }}><div className="micro gd">Black Swan Protocol · running {CASES.length} adversarial cases…</div></div>;
  const pass = bs.filter((r) => r.pass).length;
  return (
    <div className={`glass pad materialize ${pass === bs.length ? "clear" : "alert"}`} style={{ marginTop: 12 }}>
      <div className="row between wrap" style={{ gap: 8 }}>
        <div><div className="micro gd">Black Swan Protocol</div><div className="h2">{pass} of {bs.length} held</div>
          <div className="soft" style={{ fontSize: 12.5, maxWidth: 640 }}>Each case baits the engine into a rare, costly failure: a phantom parcel, an empty search read as a clear title, a guessed sale date, an estimate shown as a value. A case holds only if the engine answers UNKNOWN, NOT VERIFIED, CONFLICT or SOURCE NEEDED instead, and every answer also passes the global invariants.</div></div>
        <Button className="btn quiet sm" onClick={onClose}>Close this check</Button>
      </div>
      <div className="col" style={{ gap: 6, marginTop: 10 }}>
        {bs.map((r) => (
          <div key={r.id} className="list-item" style={{ cursor: "default", alignItems: "flex-start" }}>
            <span className={`chip ${r.pass ? "gr" : "rd"}`} style={{ fontSize: 9.5, minWidth: 54, justifyContent: "center" }}>{r.pass ? "HELD" : "BROKE"}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13 }}><b className="num">{r.id}</b> <b>{r.name}</b> <span className="faint">· {r.rule}</span></div>
              <div className="faint" style={{ fontSize: 11.5 }}>{r.detail}</div>
            </div>
            {r.query && <Button className="chip btn-chip cy" onClick={() => onRun(r.query)}>Run this search again</Button>}
          </div>))}
      </div>
    </div>
  );
}
