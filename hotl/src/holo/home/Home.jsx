import React, { useEffect, useMemo, useRef, useState } from "react";
import { allCounties, allProperties, daysUntil, saleBoard } from "../data";
import { search } from "../../quantum/engine";
import { parseQuery } from "../../quantum/parse";
import { normApn } from "../../quantum/evidence";
import { STATE_NAMES, PROPERTY_DB, NEXT_SALE_BUNDLED, REPORTED, COUNTY_VERIFIED, OTC_EXTRA, OTC_DB } from "../../legacy/ScoutingDept.jsx";
import { useStore, useToast } from "../store";
import { useAllParcels } from "../screens/Parcels";
import { EvidenceProvider, Label } from "./Evidence";
import { CountyCard, PropertyCard } from "./Cards";
import { IntelMap } from "./IntelMap";
import { CATEGORIES, categoryCounts, countyCard, ctxBase, propertyCard, todayIso } from "./model";
import { Icon, ScreenLead } from "../ui";
import { commandOrder, greeting } from "../diligence";

class MapBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) return <div className="empty">The map did not open. The search above still works. Refresh the page to try the map again.</div>;
    return this.props.children;
  }
}
import { MarketPulse } from "../screens/Marketplace";
import { SaleAlertStrip } from "../screens/SaleCalendar";
import { Button } from "../ds";
import { CommandCenter } from "./CommandCenter";
import { buildPropertyIntelligence } from "../propertyRecord";

const SCOPES = [["all", "All records"], ["state", "This state only"], ["county", "This county only"], ["parcel", "This parcel only"]];
const MODE_CAT = { county: "counties", rules: "counties", parcel: "properties", label: "properties", city: "properties", zip: "properties", parcels: "properties", owner: "properties", title: "properties", risk: "properties", gaps: "properties", reject: "properties", sources: "properties", field: "properties", auction: "auctions", otc: "otc" };
const QUESTION_MODES = new Set(["rules", "title", "risk", "gaps", "reject", "sources", "meta", "field", "discover"]);
const PAGE = 24;

export default function Home({ go }) {
  const store = useStore();
  const { holo, patchHolo, dd, stars, toggleStar, photos, positions, sync } = store;
  const toast = useToast();
  const all = useAllParcels();
  const counties = allCounties();
  const nextMission = useMemo(() => commandOrder(
    counties.map((c) => ({ ...c, days: daysUntil(c.nextSale) })),
    (c) => (holo.countyEvidence || {})[c.key],
    (c) => holo.viewed && holo.viewed[c.id],
  )[0], [counties, holo.countyEvidence, holo.viewed]);
  const byFips = useMemo(() => new Map(counties.map((c) => [c.fips, c])), [counties]);
  const byKey = useMemo(() => new Map(counties.map((c) => [c.key, c])), [counties]);
  const ctx = useMemo(() => ctxBase(), []);

  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("counties");
  const [scope, setScope] = useState("all");
  const [view, setView] = useState("god");
  const [selFips, setSelFips] = useState(null);
  const [selState, setSelState] = useState(null);
  const [selParcel, setSelParcel] = useState(null);
  const [n, setN] = useState(PAGE);
  const [heroVisible, setHeroVisible] = useState(true);
  const heroRef = useRef(null), inputRef = useRef(null), stickyRef = useRef(null);

  // the sticky command bar takes over when the hero search scrolls away
  useEffect(() => {
    if (!heroRef.current || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setHeroVisible(e.isIntersecting), { rootMargin: "-60px 0px 0px 0px" });
    io.observe(heroRef.current); return () => io.disconnect();
  }, []);
  useEffect(() => { const f = () => { (heroVisible ? inputRef.current : stickyRef.current || inputRef.current)?.focus(); }; window.addEventListener("hotl:focus-search", f); return () => window.removeEventListener("hotl:focus-search", f); }, [heroVisible]);
  useEffect(() => {
    const f = (e) => { const q = typeof e.detail === "string" ? e.detail.trim() : ""; if (q) { setInput(q); setQuery(q); setN(PAGE); } };
    window.addEventListener("hotl:run-search", f);
    return () => window.removeEventListener("hotl:run-search", f);
  }, []);
  const setViewP = (v) => { setView(v); try { localStorage.setItem("hotl:home-view", v); } catch {} };
  useEffect(() => {
    if (view === "parcel") document.getElementById("parcel-line")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [view]);

  const selCounty = selFips ? byFips.get(selFips) : null;
  const research = useMemo(() => {
    if (!selCounty) return null;
    const d = countyCard(selCounty, ctx, holo);
    const quarantined = /quarantined/i.test(d.inventory.text);
    return {
      facts: [["Sale type", d.saleType], ["Next documented sale", d.sale], ["Over the counter", d.otc]],
      inventory: d.inventory.text,
      inventoryNote: d.inventory.sub,
      parcels: quarantined ? [] : all.filter((p) => p.key === selCounty.key).slice(0, 6),
    };
  }, [selCounty, ctx, holo, all]);
  const parcel = selParcel ? all.find((p) => p.id === selParcel) : null;
  const ctxState = parcel ? parcel.state : selCounty ? selCounty.state : selState;
  const ctxCounty = parcel ? byKey.get(parcel.key) : selCounty;

  /* --------------------------- run a search --------------------------- */
  const scoped = (q) => {
    const P = parseQuery(q);
    if (scope === "parcel" && parcel && !P.apn) return `${q} (APN ${parcel.apn} in ${parcel.county} County, ${parcel.state})`;
    if (scope === "county" && ctxCounty && !P.counties.length) return `${q} in ${ctxCounty.name} County, ${ctxCounty.state}`;
    if (scope === "state" && ctxState && !P.states.length && !P.counties.length) return `${q} in ${STATE_NAMES[ctxState]}`;
    return q;
  };
  const answer = useMemo(() => {
    if (!query) return null;
    return search(scoped(query), { ...ctx, dd, photos, positions, holo: { ...holo, focusParcel: scope === "parcel" && parcel ? parcel.id : holo.focusParcel }, extraParcels: all.filter((p) => p.level === "PROMOTED") });
  }, [query, scope, selParcel, selFips]);
  const P = answer ? answer.parsed : null;

  const run = (q) => {
    const t = (q ?? input).trim(); setInput(t); setQuery(t); setN(PAGE);
    if (!t) return;
    const R = search(scoped(t), { ...ctx, dd, photos, positions, holo, extraParcels: [] });
    const c = MODE_CAT[R.mode]; if (c) setCat(c);
    // a single, unambiguous entity opens straight into its card
    if (R.mode === "county" && R.parsed.counties.length === 1 && !R.parsed.countyAmbiguous) { const s = byKey.get(R.parsed.counties[0].key); if (s) pickCounty(s.fips, false); }
    if (R.parcel && (R.mode === "parcel" || R.mode === "label" || R.mode === "city" || R.mode === "zip")) pickParcel(R.parcel, false);
    else if (!["city", "zip", "label"].includes(R.mode) && R.parsed.states.length === 1 && !R.parsed.counties.length) { setSelState(R.parsed.states[0]); setSelFips(null); }
  };
  const pickCounty = (fips, clearParcel = true) => { const s = byFips.get(fips); if (!s) return; setSelFips(fips); setSelState(s.state); if (clearParcel) setSelParcel(null); patchHolo((h) => ({ focusCounty: s.id, viewed: { ...(h.viewed || {}), [s.id]: 1 } })); };
  const pickParcel = (p, keepCat = true) => { setSelParcel(p.id); const s = byKey.get(p.key); if (s) { setSelFips(s.fips); setSelState(s.state); } patchHolo(() => ({ focusParcel: p.id })); if (!keepCat) setCat("properties"); };
  const reset = () => { setSelFips(null); setSelState(null); setSelParcel(null); };
  const ask = (q) => { setInput(q); run(q); window.scrollTo({ top: 0, behavior: "smooth" }); };

  /* ------------------------ shared result set ------------------------ */
  const results = useMemo(() => {
    const today = todayIso();
    const states = P && P.states.length ? P.states : scope !== "all" && ctxState ? [ctxState] : null;
    const countyKey = P && P.counties.length === 1 ? P.counties[0].key : scope === "county" || scope === "parcel" ? ctxCounty && ctxCounty.key : null;
    const text = P && P.mode === "discover" ? P.lc : null;
    if (cat === "counties") {
      let list = counties.filter((c) => (!states || states.includes(c.state)) && (!countyKey || c.key === countyKey) && (!text || text.split(/\s+/).some((t) => t.length > 2 && c.name.toLowerCase() === t)));
      list = commandOrder(
        list.map((c) => ({ ...c, days: daysUntil(c.nextSale) })),
        (c) => (holo.countyEvidence || {})[c.key],
        (c) => holo.viewed && holo.viewed[c.id],
      );
      return { kind: "counties", items: list, note: states || countyKey ? null : "A sale in the next 60 days comes first, then how much of the county file is fresh. A higher queue score does not jump that line." };
    }
    if (cat === "properties") {
      let list = all;
      if (answer && answer.rows && (answer.mode === "city" || answer.mode === "zip" || answer.mode === "label" || answer.rows.some((r) => r.parcelId))) { const ids = new Set(answer.rows.map((r) => r.parcelId).filter(Boolean)); list = all.filter((p) => ids.has(p.id)); }
      else {
        if (countyKey) list = list.filter((p) => p.key === countyKey); else if (states) list = list.filter((p) => states.includes(p.state));
        if (P && P.apn) { const na = normApn(P.apn); list = list.filter((p) => normApn(p.apn).includes(na)); }
        if (P && P.minAcres != null) list = list.filter((p) => p.acres != null && p.acres > P.minAcres);
      }
      const note = countyKey && !PROPERTY_DB.counties[countyKey] ? `No parcel list is on file for ${countyKey.split("|").reverse().join(", ")}. That is not evidence that no delinquent parcels exist there.` : null;
      return { kind: "properties", items: list, note };
    }
    if (cat === "auctions") {
      const keys = new Set([...Object.keys(NEXT_SALE_BUNDLED), ...Object.keys(REPORTED)]);
      if (ctx.live) for (const [k, r] of ctx.live) if (/:sale_date$/.test(k)) { const c = counties.find((x) => x.fips === r.fips); if (c) keys.add(c.key); }
      let list = [...keys].map((k) => byKey.get(k)).filter(Boolean).filter((c) => (!states || states.includes(c.state)) && (!countyKey || c.key === countyKey));
      list = list.map((s) => ({ s, d: countyCard(s, ctx, holo) })).filter(({ d }) => d.sale.value && d.sale.value >= today && (!P || P.days == null || (new Date(d.sale.value) - new Date(today)) / 86400000 <= P.days))
        .sort((a, b) => a.d.sale.value.localeCompare(b.d.sale.value));
      return { kind: "auctions", items: list.map((x) => x.s), cards: new Map(list.map((x) => [x.s.id, x.d])), note: "Only sales with a date on file are shown. A county missing here may still hold a sale." };
    }
    // OTC: documented first; the workbook's "likely" list only once a state narrows it
    const documented = new Set([...Object.keys(COUNTY_VERIFIED.otc_county), ...Object.entries(OTC_EXTRA).filter(([, v]) => /confirm/i.test(v.status)).map(([k]) => k)]);
    const keys = new Set(documented);
    if (states) for (const r of OTC_DB.rows) if (states.includes(r[1])) keys.add(`${r[1]}|${r[0]}`);
    let list = [...keys].map((k) => byKey.get(k)).filter(Boolean).filter((c) => (!states || states.includes(c.state)) && (!countyKey || c.key === countyKey));
    list.sort((a, b) => (documented.has(b.key) - documented.has(a.key)) || a.state.localeCompare(b.state));
    return { kind: "otc", items: list, note: states ? null : `${OTC_DB.rows.length.toLocaleString()} more counties are only "likely" in the OTC workbook. Pick a state to include them.` };
  }, [cat, answer, scope, selFips, selParcel, selState, holo.countyStatus, holo.countyEvidence, holo.viewed]);

  // outline only a narrowed result set; the whole country "in results" says nothing
  const narrowed = !!query || scope !== "all" || results.kind !== "counties";
  const resultFips = useMemo(() => !narrowed ? new Set() : new Set(results.kind === "properties" ? [...new Set(results.items.slice(0, 400).map((p) => byKey.get(p.key)?.fips).filter(Boolean))] : results.items.map((c) => c.fips)), [results, narrowed]);
  const markers = useMemo(() => {
    if (!ctxCounty) return [];
    return all.filter((p) => p.key === ctxCounty.key).map((p) => { const pin = holo.pins[p.id]; return pin ? { id: p.id, lat: pin.lat, lon: pin.lon, kind: p.id === selParcel ? "parcel" : "other" } : p.lat != null ? { id: p.id, lat: p.lat, lon: p.lon, kind: p.id === selParcel ? "parcel" : "other" } : null; }).filter(Boolean);
  }, [ctxCounty, holo.pins, selParcel]);
  const parcelPoint = parcel
    ? (holo.pins[parcel.id] ? { lat: holo.pins[parcel.id].lat, lon: holo.pins[parcel.id].lon, kind: "pin" }
      : parcel.lat != null && parcel.lon != null ? { lat: parcel.lat, lon: parcel.lon, kind: "record" } : null)
    : null;
  const counts = useMemo(() => categoryCounts(), []);
  const record = useMemo(() => (parcel ? buildPropertyIntelligence({ parcel, checks: dd[parcel.id], visit: holo.visits?.[parcel.id], photos: photos[parcel.id], pin: holo.pins?.[parcel.id], today: todayIso() }) : null), [parcel, dd, holo.visits, holo.pins, photos]);
  const listed = useMemo(() => [...new Set(all.map((p) => p.key))].map((k) => byKey.get(k)).filter(Boolean).sort((a, b) => a.state.localeCompare(b.state) || a.name.localeCompare(b.name)), [all, byKey]);
  const missionParcels = useMemo(() => (holo.mission || []).map((id) => all.find((p) => p.id === id)).filter(Boolean).slice(0, 4), [holo.mission, all]);
  const sales = useMemo(() => saleBoard().filter((e) => e.kind === "sale" && e.days != null && e.days >= 0 && e.days <= 180).sort((a, b) => a.days - b.days).slice(0, 4), []);
  const stateOptions = useMemo(() => Object.entries(STATE_NAMES).sort((a, b) => a[1].localeCompare(b[1])), []);

  // a render function, not a component: a component defined here would remount and drop focus on every keystroke
  const bar = (compact) => (
    <form className={`qbar ${compact ? "compact" : ""}`} role="search" onSubmit={(e) => { e.preventDefault(); run(); }}
      onClick={(e) => { if (!e.target.closest("button")) e.currentTarget.querySelector("input")?.focus(); }}>
      <Icon n="search" s={compact ? 16 : 22} c="var(--cyan)" />
      <input ref={compact ? stickyRef : inputRef} id={compact ? "qbar-sticky" : "qbar-main"} value={input} onChange={(e) => setInput(e.target.value)}
        placeholder="Search a county, address, APN, auction, or research question…" aria-label="Quantum Search" autoComplete="off" />
      {input && <Button type="button" className="qbar-clear" onClick={() => { setInput(""); setQuery(""); reset(); }} aria-label="Clear search"><Icon n="x" s={14} /></Button>}
      <Button className="btn" type="submit" onClick={() => run()}>Search records</Button>
    </form>
  );

  return (
    <EvidenceProvider>
      <CommandCenter
        go={go}
        stage={(layers, onGis) => (
          <MapBoundary>
            <div className="stage atlas-stage">
              <div className="stage-main">
                <IntelMap god counties={counties} results={resultFips} selFips={selFips} selState={selState} parcel={parcel} point={parcelPoint} markers={markers} research={research} onParcel={pickParcel} onCounty={(f) => pickCounty(f)} onState={(ab) => { setSelState(ab); setSelFips(null); setSelParcel(null); }} onReset={reset} showCounties={layers.counties} showParcels gis={layers} onGis={onGis} parcelPool={all} basemap={layers.basemap || "aerial"} />
              </div>
            </div>
          </MapBoundary>
        )}
        parcel={parcel}
        record={record}
        county={selCounty}
        parcels={all}
        listed={listed}
        counties={counties}
        onCounty={(key) => { const c = byKey.get(key); if (c) pickCounty(c.fips); else reset(); }}
        onParcel={(p) => pickParcel(p)}
        mission={missionParcels}
        sales={sales}
        starred={!!(parcel && stars[`parcel:${parcel.id}`])}
        onWatch={() => parcel && toggleStar(`parcel:${parcel.id}`)}
        stateAbbr={selState}
        stateName={selState ? STATE_NAMES[selState] : null}
        stateOptions={stateOptions}
        onAtlas={reset}
        onState={(ab) => { setSelState(ab); setSelFips(null); setSelParcel(null); }}
        query={query}
        hits={query ? results : null}
        answerNote={answer?.answer?.text || ""}
        onHitCounty={(s) => pickCounty(s.fips)}
        onHitParcel={(p) => pickParcel(p, false)}
      />
    </EvidenceProvider>
  );
}

/* ------------------------------ answer strip ------------------------------ */
function AnswerStrip({ r, onEdit, onPick }) {
  const [open, setOpen] = useState(false);
  const P = r.parsed;
  const chips = [["Category", { county: "Counties", rules: "Rules", parcel: "Properties", label: "Street", city: "City", zip: "ZIP", parcels: "Properties", owner: "Owner", title: "Title risk", risk: "Property risk", gaps: "Research gaps", reject: "Deal-killers", sources: "Sources", field: "Field targets", auction: "Auctions", otc: "OTC", meta: "System", discover: "Unrecognized" }[r.mode]],
    P.states.length && ["State", P.states.map((s) => STATE_NAMES[s]).join(", ")], P.counties.length && ["County", P.counties.map((c) => `${c.name}, ${c.st}`).join("; ")], P.apn && ["APN", P.apn], P.street && ["Street", P.street], P.city && ["City", P.city], P.zip && ["ZIP", P.zip], P.owner && ["Owner", P.owner],
    P.days != null && ["Window", `${P.days} days`], P.regDays != null && ["Registration", `within ${P.regDays} days`], P.platform && ["Platform", P.platform], P.minRate != null && ["Rate", `> ${P.minRate}% (a ceiling, not a return)`], P.minAcres != null && ["Acreage", `> ${P.minAcres}`], P.verifiedOnly && ["Only", "source-supported"]].filter(Boolean);
  const ambiguous = (r.rows || []).some((x) => x.query) && /ambiguous|pick one/i.test(r.answer.text);
  const showAnswer = QUESTION_MODES.has(r.mode) || ambiguous || r.answer.status === "CONFLICT" || r.answer.status === "MISSING" || ["parcel", "county", "label", "city", "zip"].includes(r.mode);
  return (
    <section className="answer surface" aria-live="polite">
      <div className="row wrap" style={{ gap: 6, alignItems: "center" }}>
        <span className="micro">Interpreted as</span>
        {chips.map(([k, v]) => <span key={k} className="chip"><span className="faint">{k}:</span>&nbsp;{v}</span>)}
        <Button className="chip btn-chip" onClick={onEdit}>Edit this search</Button>
      </div>
      {showAnswer && <div className="answer-text">{r.answer.text}</div>}
      {!["city", "zip", "label"].includes(r.mode) && showAnswer && <>
        <div className="row wrap" style={{ gap: 6 }}>
          {(r.answer.fact || QUESTION_MODES.has(r.mode)) && <Label status={r.answer.status} />}
          <span className="chip">{r.sources.length} sources · {r.facts.filter((f) => f.evidenceCount).length} supported fields · {r.missing.length} gaps</span>
          {r.answer.lastChecked && <span className="chip">Last checked {r.answer.lastChecked}</span>}
          {r.disclaimer && <span className="chip am">{r.disclaimer}</span>}
          <Button className="chip btn-chip cy" onClick={() => setOpen(!open)}>{open ? "Hide" : "Show"} evidence & trace</Button>
        </div>
        {ambiguous && <div className="row wrap" style={{ gap: 6, marginTop: 8 }}><span className="micro">Choose one</span>{r.rows.filter((x) => x.query).slice(0, 8).map((x) => <Button key={x.title} className="chip btn-chip cy" onClick={() => onPick(x.query)}>{x.title}</Button>)}</div>}
      </>}
      {r.branches.some((b) => b.status !== "skipped") && <div className="branches">
        <span className="micro">Searched</span>
        {r.branches.filter((b) => b.status !== "skipped").map((b) => <span key={b.id} className={`br br-${b.status}`} title={b.detail}>{b.label}: {b.status === "found" ? "found" : b.status === "none" ? "nothing on file" : "not connected"}</span>)}
      </div>}
      {open && (
        <div className="grid g2" style={{ marginTop: 10 }}>
          <div><div className="micro cy">Sources</div>{r.sources.slice(0, 10).map((s) => <div key={s.id} className="src-line"><span className="chip" style={{ fontSize: 9.5 }}>T{s.tier}</span><span>{s.url ? <a href={s.url} target="_blank" rel="noreferrer">{s.label} ↗</a> : s.label}<span className="faint"> · {s.agency} · retrieved {s.accessed || "—"}</span></span></div>)}{!r.sources.length && <div className="faint">No source supports an answer.</div>}</div>
          <div>
            {r.conflicts.length > 0 && <><div className="micro" style={{ color: "var(--amber)" }}>Conflicts</div>{r.conflicts.map((f) => <div key={f.id} className="soft" style={{ fontSize: 12.5, marginBottom: 6 }}><b>{f.label}:</b> {f.conflictNote}</div>)}</>}
            <div className="micro">Not yet known</div><div className="row wrap" style={{ gap: 4, marginTop: 4 }}>{r.missing.slice(0, 12).map((f) => <span key={f.id} className="chip" title={f.where || ""}>{f.label}</span>)}{!r.missing.length && <span className="faint">Nothing missing for this question.</span>}</div>
            {(r.next || []).length > 0 && <><div className="micro" style={{ marginTop: 8 }}>Check next</div><ol style={{ margin: "4px 0 0", paddingLeft: 18, fontSize: 12.5 }} className="soft">{r.next.slice(0, 5).map((x, i) => <li key={i}>{x}</li>)}</ol></>}
            <details style={{ marginTop: 8 }}><summary className="micro" style={{ cursor: "pointer" }}>Search trace</summary><ol style={{ fontSize: 12, paddingLeft: 18 }} className="soft">{r.trace.map((t, i) => <li key={i}><b>{t.stage}.</b> {t.text}</li>)}</ol></details>
          </div>
        </div>)}
    </section>
  );
}

/* --------------------------------- results --------------------------------- */
function Cards({ results, n, setN, ctx, holo, dd, stars, photos, toggleStar, patchHolo, toast, selFips, selParcel, onCounty, onParcel, filtered, onClear }) {
  const items = results.items.slice(0, n);
  return (
    <section aria-label="Results">
      <div className="row between wrap" style={{ gap: 8, margin: "14px 0 8px" }}>
        <div className="micro cy">{results.items.length.toLocaleString()} {results.kind === "properties" ? "parcels" : results.kind === "auctions" ? "sale events" : results.kind === "otc" ? "counties with OTC evidence" : "counties"}</div>
        {results.note && <div className="faint" style={{ fontSize: 11.5, maxWidth: 640 }}>{results.note}</div>}
      </div>
      {!items.length && <div className="empty">
        {filtered ? `Nothing on file matches in the current ${filtered}. ` : ""}{results.note || "Nothing on file matches. Try another county, state or question."}
        {filtered && <div style={{ marginTop: 10 }}><Button className="btn quiet sm" onClick={onClear}>Clear search and scope</Button></div>}
      </div>}
      <div className="card-grid">
        {results.kind === "properties"
          ? items.map((p) => { const d = propertyCard(p, ctx, dd, { visit: holo.visits[p.id], pin: holo.pins[p.id], photos: photos[p.id] }); const ph = (photos[p.id] || []).slice(-1)[0];
            return <PropertyCard key={p.id} d={d} photo={ph} selected={selParcel === p.id} watched={!!stars[`parcel:${p.id}`]} inMission={holo.mission.includes(p.id)}
              onOpen={() => onParcel(p)} onWatch={() => { toggleStar(`parcel:${p.id}`); toast(stars[`parcel:${p.id}`] ? "Stopped watching" : "Watching parcel"); }}
              onMission={() => { patchHolo((h) => ({ mission: h.mission.includes(p.id) ? h.mission.filter((x) => x !== p.id) : [...h.mission, p.id] })); toast(holo.mission.includes(p.id) ? "Removed from mission" : "Added to mission"); }} />; })
          : items.map((s) => { const d = (results.cards && results.cards.get(s.id)) || countyCard(s, ctx, holo);
            return <CountyCard key={s.id} d={d} selected={selFips === s.fips} watched={!!stars[`county:${s.id}`]} onOpen={() => onCounty(s)} onWatch={() => { toggleStar(`county:${s.id}`); toast(stars[`county:${s.id}`] ? "Stopped watching" : "Watching county"); }} />; })}
      </div>
      {results.items.length > n && <div style={{ textAlign: "center", marginTop: 12 }}><Button className="btn quiet" onClick={() => setN(n + PAGE)}>Show {Math.min(PAGE, results.items.length - n)} more of {(results.items.length - n).toLocaleString()}</Button></div>}
    </section>
  );
}
function ResultList({ results, n, setN, ctx, holo, dd, onCounty, onParcel, selFips, selParcel }) {
  const items = results.items.slice(0, n);
  const money = (v) => v != null && v !== "" ? `$${Number(v).toLocaleString()}` : "Amount not on file";
  return (
    <div className="hit-list">
      {results.note && <div className="faint" style={{ fontSize: 12 }}>{results.note}</div>}
      {results.kind === "properties"
        ? items.map((p) => (
          <button key={p.id} type="button" className={`hit ${selParcel === p.id ? "on" : ""}`} onClick={() => onParcel(p)}>
            <span><b>{p.label || p.apn}</b><span className="hit-sub">APN {p.apn} · {p.county}, {p.state}{p.placeCity ? ` · ${p.placeCity}` : ""}</span></span>
            <span className="num">{money(p.amount)}</span>
          </button>
        ))
        : items.map((s) => {
          const d = (results.cards && results.cards.get(s.id)) || countyCard(s, ctx, holo);
          return (
            <button key={s.id} type="button" className={`hit ${selFips === s.fips ? "on" : ""}`} onClick={() => onCounty(s)}>
              <span><b>{s.name} County, {s.state}</b><span className="hit-sub">{d.saleType.value ? d.saleType.display : "Sale type not on file"} · {d.sale.value ? `Sale ${d.sale.value}` : "No sale date on file"}</span></span>
              <span className="hit-sub">{d.otc.value === "available" ? "OTC documented" : d.otc.value === "likely" ? "OTC likely" : ""}</span>
            </button>
          );
        })}
      {results.items.length > n && <Button className="btn quiet sm" type="button" onClick={() => setN(n + PAGE)}>Show {Math.min(PAGE, results.items.length - n)} more</Button>}
      {!items.length && <div className="empty">{results.note || "Nothing on file matches."}</div>}
    </div>
  );
}
