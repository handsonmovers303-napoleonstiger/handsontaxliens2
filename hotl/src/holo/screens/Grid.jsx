import React, { useMemo, useRef, useState } from "react";
import { allCounties, allProperties, daysUntil, fmtDate } from "../data";
import { COUNTY_VERIFIED, PROPERTY_DB } from "../../legacy/ScoutingDept.jsx";
import { usGeometry } from "../geo";
import { useStore } from "../store";
import { CountyHologram, useMissionKeys } from "./Counties";
import { Icon, ScreenLead, SecHead } from "../ui";
import { Button, InteractiveCard } from "../ds";

const LAYERS = [
  ["sale", "Sale type"], ["priority", "Priority"], ["auctions", "Auctions"], ["otc", "OTC"], ["lists", "Delinquent lists"], ["missions", "Field missions"], ["research", "Research"],
];
const SALE_FILL = { L: [50, 120, 255], D: [116, 92, 255], H: [19, 200, 194] };
const NEW_LIST_DAYS = 45;

export default function Grid({ go }) {
  const { holo, patchHolo, dd } = useStore();
  const geo = usGeometry();
  const counties = allCounties();
  const byFips = useMemo(() => new Map(counties.map((c) => [c.fips, c])), [counties]);
  const missionKeys = useMissionKeys();
  const [on, setOn] = useState({ sale: true, priority: true, auctions: true, otc: false, lists: true, missions: true, research: false });
  const [flat, setFlat] = useState(false);
  const [hover, setHover] = useState(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const stage = useRef(null);
  const sel = counties.find((c) => c.id === holo.focusCounty) || null;

  // everything the map shows is counted from the tables, once
  const signals = useMemo(() => {
    const auctions = [], otc = [], lists = [], priority = [];
    for (const c of counties) {
      const d = daysUntil(c.nextSale);
      if (d != null && d >= 0 && d <= 365) auctions.push({ c, d });
      if (c.otc) otc.push(c);
      if (c.tier === "A") priority.push(c);
    }
    for (const [key, deck] of Object.entries(PROPERTY_DB.counties)) {
      if (!deck.rows || !deck.rows.length) continue;
      const c = counties.find((x) => x.key === key); if (!c) continue;
      const age = deck.scrapedAt ? -daysUntil(String(deck.scrapedAt).slice(0, 10)) : null;
      lists.push({ c, n: deck.rowCount || deck.rows.length, fresh: age != null && age <= NEW_LIST_DAYS, level: deck.level });
    }
    return { auctions: auctions.sort((a, b) => a.d - b.d), otc, lists, priority };
  }, [counties]);
  const official = useMemo(() => Object.values(COUNTY_VERIFIED.counties).reduce((a, v) => a + (v.links || []).filter((l) => l[3] === "OFFICIAL").length, 0), []);
  const liveRows = (window.__hotlLive && window.__hotlLive.size) || 0;
  const missionFips = useMemo(() => new Set(counties.filter((c) => missionKeys.has(c.key)).map((c) => c.fips)), [counties, missionKeys]);
  const inventory = allProperties().length;
  const openMissions = holo.mission.filter((id) => !(["clear", "na"].includes(dd[id]?.p4?.status) || holo.visits[id]?.completed)).length;

  const fillOf = (fips) => {
    const c = byFips.get(fips); if (!c) return "rgba(40,50,70,.12)";
    if (on.research) {
      const st = holo.countyStatus[c.id];
      if (st === "captured") return "rgba(24,214,155,.55)"; if (st === "investigating") return "rgba(0,229,255,.45)"; if (st === "passed") return "rgba(70,80,95,.35)";
    }
    if (!on.sale) return "rgba(30,44,70,.18)";
    const rgb = SALE_FILL[c.instrument === "Hybrid" ? "H" : c.sys] || [70, 80, 100];
    const a = .06 + ((c.score || 0) / 100) * .38;
    return `rgba(${rgb.join(",")},${a.toFixed(3)})`;
  };
  const pick = (fips) => { const c = byFips.get(fips); if (c) patchHolo((h) => ({ focusCounty: c.id, viewed: { ...(h.viewed || {}), [c.id]: 1 } })); };
  const onMove = (e) => {
    const b = stage.current && stage.current.getBoundingClientRect(); if (!b || e.pointerType === "touch") return;
    setTilt({ x: ((e.clientX - b.left) / b.width - .5) * 2, y: ((e.clientY - b.top) / b.height - .5) * 2 });
  };
  const at = (c) => geo.byFips.get(c.fips);
  const selGeo = sel && geo.byFips.get(sel.fips);

  const tele = [
    ...signals.auctions.slice(0, 6).map(({ c, d }) => `SALE ${c.name.toUpperCase()} ${c.state} · T-${d}D · ${fmtDate(c.nextSale).toUpperCase()}`),
    ...signals.lists.slice(0, 5).map(({ c, n, level }) => `LIST ${c.name.toUpperCase()} ${c.state} · ${n.toLocaleString()} PARCELS · ${level}`),
    `STATUTE LAYER · ${counties.filter((c) => c.statuteVerified).length.toLocaleString()} COUNTIES UNDER A VERIFIED STATUTE`,
    liveRows ? `LIVE LAYER · ${liveRows} TEAM CORRECTIONS` : `COUNTY TERMS READ · ${COUNTY_VERIFIED.checked}`,
  ].join("     ◆     ");

  return (
    <div className="materialize">
      <SecHead ix="01" title="Map" sub="County names, not a live feed" right={<Button className="chip btn-chip" onClick={() => setFlat(!flat)}>{flat ? "Show the 3D map" : "Show the flat map"}</Button>} />
      <ScreenLead does="Show the county names in the national table. Terms have been read for 15 counties, not all of them." leads="That county's file. A name on the map is not verified intelligence." />
      <div className="grid g6" style={{ gap: 8 }}>
        {[
          ["Counties tracked", counties.length.toLocaleString(), "national table", "layers"],
          ["Live inventory", inventory.toLocaleString(), "real parcels on file", "cards"],
          ["Upcoming auctions", signals.auctions.length, signals.auctions[0] ? `next: ${signals.auctions[0].c.name}, ${signals.auctions[0].d}d` : "none on file", "bolt"],
          ["OTC opportunities", signals.otc.length, "counties with OTC on file", "target"],
          ["Verified sources", official, "official links opened and read", "check"],
          ["Active field missions", openMissions, `${holo.mission.length} targets on mission`, "nav"],
        ].map(([l, v, n, ic]) => (
          <div key={l} className="stat" style={{ background: "rgba(13,17,24,.75)" }}>
            <div className="row" style={{ gap: 6 }}><Icon n={ic} s={14} c="var(--cyan-2)" /><div className="v">{v}</div></div>
            <div className="l">{l}</div><div className="n">{n}</div>
          </div>))}
      </div>

      <div className="split wide" style={{ marginTop: 12 }}>
        <div className="projection" style={{ padding: 10 }}>
          <div className="row wrap" style={{ gap: 6, padding: "2px 4px 8px" }}>
            {LAYERS.map(([k, l]) => <Button key={k} className={`chip btn-chip ${on[k] ? "cy" : ""}`} onClick={() => setOn({ ...on, [k]: !on[k] })}>{on[k] ? "◉" : "○"} {l}</Button>)}
          </div>
          <div ref={stage} className="grid-stage" onPointerMove={onMove} onPointerLeave={() => setTilt({ x: 0, y: 0 })}>
            <div className={`grid-plane ${flat ? "flat" : ""}`} style={flat ? null : { transform: `rotateX(${34 - tilt.y * 3}deg) rotateZ(${tilt.x * -2.5}deg) scale(.98)` }}>
              <svg viewBox={`0 0 ${geo.width} ${geo.height}`} role="img" aria-label="Map of US counties by sale type, with auctions, OTC, parcel lists and field missions"
                onMouseMove={(e) => { const f = e.target.getAttribute && e.target.getAttribute("data-f"); setHover(f ? byFips.get(f) : null); }} onMouseLeave={() => setHover(null)}
                onClick={(e) => { const f = e.target.getAttribute && e.target.getAttribute("data-f"); if (f) pick(f); }}>
                <defs>
                  <radialGradient id="gridglow"><stop offset="0" stopColor="#145bff" stopOpacity=".18" /><stop offset="1" stopColor="#145bff" stopOpacity="0" /></radialGradient>
                  <pattern id="finegrid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="rgba(80,140,255,.07)" strokeWidth=".6" /></pattern>
                </defs>
                <rect width={geo.width} height={geo.height} fill="url(#finegrid)" />
                <ellipse cx={geo.width / 2} cy={geo.height / 2} rx={geo.width / 2} ry={geo.height / 2} fill="url(#gridglow)" />
                <g>{geo.counties.map((x) => <path key={x.fips} data-f={x.fips} className="cty" d={x.d} fill={fillOf(x.fips)} />)}</g>
                <path className="st-line" d={geo.stateMesh} />
                <path className="nation-line" d={geo.nation} />
                {on.priority && <g>{signals.priority.map((c) => { const g = at(c); return g ? <circle key={c.id} cx={g.c[0]} cy={g.c[1]} r="1.6" fill="#f3c45b" opacity=".9" style={{ pointerEvents: "none" }} /> : null; })}</g>}
                {on.otc && <g>{signals.otc.map((c) => { const g = at(c); return g ? <rect key={c.id} x={g.c[0] - 2} y={g.c[1] - 2} width="4" height="4" fill="none" stroke="#13c8c2" strokeWidth="1" style={{ pointerEvents: "none" }} /> : null; })}</g>}
                {on.lists && <g>{signals.lists.map(({ c, fresh }) => { const g = at(c); return g ? <g key={c.id} style={{ pointerEvents: "none" }}>
                  <path d={`M${g.c[0]} ${g.c[1] - 5}l5 5-5 5-5-5z`} fill="rgba(116,92,255,.35)" stroke="#9a88ff" strokeWidth="1" />
                  {fresh && <circle className="node-pulse" cx={g.c[0]} cy={g.c[1]} r="6" fill="none" stroke="#9a88ff" strokeWidth="1" />}</g> : null; })}</g>}
                {on.auctions && <g>{signals.auctions.map(({ c, d }) => { const g = at(c); if (!g) return null; const col = d <= 30 ? "#f3c45b" : "#00e5ff";
                  return <g key={c.id} style={{ pointerEvents: "none" }}><circle cx={g.c[0]} cy={g.c[1]} r="2.6" fill={col} />{d <= 90 && <circle className="node-pulse" cx={g.c[0]} cy={g.c[1]} r="5" fill="none" stroke={col} strokeWidth="1.2" />}</g>; })}</g>}
                {on.missions && <g>{[...missionFips].map((f) => { const g = geo.byFips.get(f); return g ? <g key={f} style={{ pointerEvents: "none" }}><circle cx={g.c[0]} cy={g.c[1]} r="3" fill="#18d69b" /><circle className="node-pulse" cx={g.c[0]} cy={g.c[1]} r="7" fill="none" stroke="#18d69b" strokeWidth="1.2" /></g> : null; })}</g>}
                {selGeo && (
                  <g key={sel.fips} style={{ pointerEvents: "none" }}>
                    {[1, 2, 3, 4, 5, 6, 7].map((k) => <path key={k} d={selGeo.d} transform={`translate(0 ${-k * 1.3})`} fill={`rgba(0,229,255,${.05 + k * .02})`} stroke="rgba(0,229,255,.25)" strokeWidth=".4" />)}
                    <path className="extrude" d={selGeo.d} fill="rgba(0,229,255,.35)" stroke="#5cf0ff" strokeWidth="1.2" style={{ filter: "drop-shadow(0 0 6px #00e5ff)" }} />
                  </g>)}
              </svg>
            </div>
            {hover && <div className="chip cy" style={{ position: "absolute", left: 12, top: 10, pointerEvents: "none" }}>{hover.name}, {hover.state} · {hover.instrument}{hover.nextSale && daysUntil(hover.nextSale) >= 0 ? ` · sale ${daysUntil(hover.nextSale)}d` : ""}</div>}
          </div>
          <div className="row wrap" style={{ gap: 12, padding: "8px 4px 2px", fontSize: 11 }}>
            <span className="row" style={{ gap: 5 }}><i style={{ width: 12, height: 8, background: "rgba(50,120,255,.5)", borderRadius: 2 }} /> Tax lien</span>
            <span className="row" style={{ gap: 5 }}><i style={{ width: 12, height: 8, background: "rgba(116,92,255,.5)", borderRadius: 2 }} /> Tax deed</span>
            <span className="row" style={{ gap: 5 }}><i style={{ width: 12, height: 8, background: "rgba(19,200,194,.5)", borderRadius: 2 }} /> Hybrid</span>
            <span className="faint">brighter = higher queue score</span>
            <span className="row" style={{ gap: 5 }}><span className="dot" style={{ color: "var(--gold)", width: 7, height: 7 }} /> Sale ≤30d</span>
            <span className="row" style={{ gap: 5 }}><span className="dot" style={{ color: "var(--cyan)", width: 7, height: 7 }} /> Sale on file</span>
            <span className="row" style={{ gap: 5 }}><span style={{ color: "#9a88ff" }}>◆</span> Delinquent list</span>
            <span className="row" style={{ gap: 5 }}><span style={{ color: "var(--teal)" }}>□</span> OTC</span>
            <span className="row" style={{ gap: 5 }}><span className="dot" style={{ color: "var(--emerald)", width: 7, height: 7 }} /> Field mission</span>
          </div>
          <div className="telemetry" style={{ marginTop: 6 }}><div>{tele}</div></div>
        </div>
        <div className="col" style={{ gap: 10 }}>
          {sel ? <CountyHologram key={sel.id} s={sel} go={go} compact /> : (
            <div className="glass pad col">
              <div className="micro cy">Select a county</div>
              <div className="body">Tap any county on the grid and it rises out of the map as a layered intelligence card. Pulsing nodes are real signals: sale dates, fresh delinquent lists, your field missions.</div>
              <div className="micro" style={{ marginTop: 6 }}>Next auctions on file</div>
              {signals.auctions.slice(0, 5).map(({ c, d }) => (
                <InteractiveCard key={c.id} className="list-item" onClick={() => pick(c.fips)}>
                  <span className="num" style={{ width: 44, color: d <= 30 ? "var(--gold)" : "var(--cyan-2)", fontWeight: 700 }}>{d}d</span>
                  <span style={{ flex: 1 }}><b>{c.name}, {c.state}</b><div className="faint" style={{ fontSize: 11 }}>{fmtDate(c.nextSale)} · {c.instrument}</div></span>
                </InteractiveCard>))}
            </div>)}
        </div>
      </div>
    </div>
  );
}
