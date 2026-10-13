import React, { useMemo, useState } from "react";
import { OUTCOME_STATS, moneyShort, stageOf, STAGES, ddVerdict } from "../data";
import { RISKS, riskState, stateOf, BRANCHES } from "../intel";
import { useStore } from "../store";
import { kindOf, positionView } from "./Portfolio";
import { Ring, ScreenLead, SecHead, Src, Stat, Tabs } from "../ui";

const INPUTS = [
  ["auction", "Auction results"], ["winning", "Winning bids"], ["redeem", "Redemptions"], ["deed", "Foreclosures"], ["condition", "Property condition"],
  ["field", "Field observations"], ["title", "Title flags"], ["county", "County behavior"], ["return", "Actual returns"],
];
const OUTPUTS = [
  ["confidence", "Confidence adjustment", ["redeem", "deed", "return", "field"]],
  ["county", "County score change", ["redeem", "deed", "return", "county"]],
  ["bid", "Bid-model adjustment", ["auction", "winning"]],
  ["risk", "Risk-weight adjustment", ["title", "condition", "field"]],
  ["pattern", "New pattern detected", ["title", "auction", "redeem"]],
];
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);

export default function Learning() {
  const { positions, passes, dd, holo, photoCount } = useStore();
  const [tab, setTab] = useState("learning");
  const L = useMemo(() => learn({ positions, dd, holo }), [positions, dd, holo]);
  return (
    <div className="materialize">
      <SecHead ix="09" title="Learning" sub="See what you recorded" />
      <ScreenLead does="Count outcomes you already recorded. It does not predict a return." leads="The portfolio entry that produced the number." />
      <Tabs tabs={[["learning", "Learning engine"], ["performance", "Performance"], ["market", "Market intel"]]} on={tab} set={setTab} />
      {tab === "learning" && <Engine L={L} />}
      {tab === "performance" && <Performance positions={positions} passes={passes} dd={dd} holo={holo} photoCount={photoCount} />}
      {tab === "market" && <Market />}
    </div>
  );
}

/** Every number here is counted from what you recorded. Nothing is predicted. */
function learn({ positions, dd, holo }) {
  const bids = Object.values(holo.bids || {}).filter((b) => b.result);
  const lost = bids.filter((b) => !b.result.won && b.result.price != null && b.max);
  const views = positions.map((p) => ({ p, v: positionView(p) }));
  const resolved = views.filter((x) => x.v.kind === "redeemed" || x.v.kind === "foreclosed");
  const visits = Object.values(holo.visits || {}).filter((v) => v.completed || Object.values(v.obs || {}).some(Boolean));
  const titleItems = BRANCHES.find((b) => b.id === "title").items;
  const titleFlags = Object.values(dd).reduce((a, r) => a + titleItems.filter((id) => ["flagged", "failed"].includes(stateOf(r[id]).id)).length, 0);
  const liveRows = (window.__hotlLive && window.__hotlLive.size) || 0;
  const counts = {
    auction: bids.length, winning: lost.length, redeem: views.filter((x) => x.v.kind === "redeemed").length, deed: views.filter((x) => x.v.kind === "foreclosed").length,
    condition: visits.filter((v) => v.obs && v.obs.structure).length, field: visits.length, title: titleFlags, county: liveRows, return: views.filter((x) => x.v.actual != null).length,
  };

  const calls = positions.filter((p) => p.actual && p.snapshot && p.snapshot.expected);
  const hits = calls.filter((p) => (p.snapshot.expected === "redemption" && kindOf(p) === "redeemed") || (p.snapshot.expected === "deed process" && kindOf(p) === "foreclosed"));
  const out = {};
  out.confidence = calls.length ? { value: `${pct(hits.length, calls.length)}%`, text: `${hits.length} of ${calls.length} resolved positions went the way you called them at purchase.` } : null;

  const byCounty = {};
  for (const { p, v } of resolved) { const k = p.county; (byCounty[k] ||= { n: 0, red: 0, ret: 0, cost: 0 }); byCounty[k].n++; if (v.kind === "redeemed") byCounty[k].red++; if (v.actual != null) { byCounty[k].ret += v.actual; byCounty[k].cost += v.bid; } }
  const allRet = resolved.reduce((a, x) => a + (x.v.actual || 0), 0), allCost = resolved.filter((x) => x.v.actual != null).reduce((a, x) => a + x.v.bid, 0);
  const avg = allCost ? allRet / allCost : null;
  const cty = Object.entries(byCounty).filter(([, s]) => s.cost).map(([k, s]) => [k, s, s.ret / s.cost]);
  out.county = cty.length ? { value: `${cty.length}`, text: cty.map(([k, s, r]) => `${k}: ${(r * 100).toFixed(1)}% realized on ${s.n}${avg != null ? ` (${r >= avg ? "+" : ""}${((r - avg) * 100).toFixed(1)} pts vs your average)` : ""}`).join(" · ") } : null;

  if (lost.length) {
    const gaps = lost.map((b) => (b.unit === "%" ? Number(b.max) - Number(b.result.price) : (Number(b.result.price) - Number(b.max)) / Number(b.max) * 100));
    const g = gaps.reduce((a, x) => a + x, 0) / gaps.length;
    out.bid = { value: `${g > 0 ? "+" : ""}${g.toFixed(1)}${lost[0].unit === "%" ? " pts" : "%"}`, text: `In ${lost.length} lost auction${lost.length > 1 ? "s" : ""}, the winning ${lost[0].unit === "%" ? "rate cleared" : "price cleared"} ${Math.abs(g).toFixed(1)}${lost[0].unit === "%" ? " points" : "%"} ${g > 0 ? "beyond" : "inside"} your ceiling. ${g > 0 ? "Your discipline held; the market paid more than your underwriting." : "You lost below your own ceiling: bid to your number."}` };
  } else out.bid = bids.length ? { value: `${bids.filter((b) => b.result.won).length}/${bids.length}`, text: "Won / logged. Log winning prices on losses to measure how the market clears against your ceilings." } : null;

  const researched = Object.entries(dd).filter(([, r]) => r && Object.keys(r).length);
  const riskHits = RISKS.map((rk) => { const checked = researched.filter(([, r]) => riskState(rk, r).id !== "open"); const found = checked.filter(([, r]) => ["failed", "flagged"].includes(riskState(rk, r).id));
    return { rk, checked: checked.length, found: found.length, ids: found.map(([id]) => id) }; }).filter((x) => x.checked).sort((a, b) => b.found / b.checked - a.found / a.checked);
  out.risk = riskHits.length ? { value: riskHits[0].found ? `${pct(riskHits[0].found, riskHits[0].checked)}%` : "0%", text: riskHits.slice(0, 3).map((x) => `${x.rk.label}: found on ${x.found} of ${x.checked} checked`).join(" · ") } : null;

  const patterns = [];
  for (const x of riskHits) { if (x.found >= 2) { const killed = x.ids.filter((id) => ddVerdict(dd[id]).label === "Do not bid").length; if (killed / x.found >= .75) patterns.push(`${x.rk.label} findings ended ${killed} of ${x.found} parcels.`); } }
  const byState = {}; for (const { p, v } of resolved) { const st = (p.county || "").split(", ")[1]; if (!st) continue; (byState[st] ||= [0, 0]); byState[st][1]++; if (v.kind === "redeemed") byState[st][0]++; }
  for (const [st, [r, n]] of Object.entries(byState)) if (n >= 2 && (r === n || r === 0)) patterns.push(`${st}: ${r} of ${n} resolved positions redeemed.`);
  out.pattern = patterns.length ? { value: `${patterns.length}`, text: patterns.join(" ") } : null;
  return { counts, out };
}

function Engine({ L }) {
  const W = 700, H = 360, ys = (n, i) => 30 + i * ((H - 60) / (n - 1));
  return (
    <div className="col materialize" style={{ gap: 12, marginTop: 12 }}>
      <div className="projection" style={{ padding: 12, overflowX: "auto" }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", minWidth: 560, height: "auto" }} role="img" aria-label="Recorded outcomes flowing into the adjustments they drive">
          {OUTPUTS.map(([ok, , ins], oi) => ins.map((ik) => { const ii = INPUTS.findIndex((x) => x[0] === ik); const live = L.counts[ik] > 0 && L.out[ok];
            const x0 = 190, y0 = ys(INPUTS.length, ii), x1 = 480, y1 = ys(OUTPUTS.length, oi);
            return <path key={ok + ik} className={`nm-link ${live ? "on" : ""}`} d={`M${x0},${y0} C${(x0 + x1) / 2},${y0} ${(x0 + x1) / 2},${y1} ${x1},${y1}`} />; }))}
          {INPUTS.map(([k, l], i) => { const n = L.counts[k]; const y = ys(INPUTS.length, i);
            return <g key={k}><text x="176" y={y + 4} textAnchor="end" fontSize="12" fill={n ? "var(--ink)" : "var(--ink-4)"}>{l}</text>
              <text x="176" y={y + 17} textAnchor="end" fontSize="9.5" fill="var(--ink-3)" fontFamily="JetBrains Mono, monospace">{n}</text>
              <circle cx="190" cy={y} r="5" fill={n ? "#00e5ff" : "#1a2536"} stroke={n ? "#5cf0ff" : "#2a3a55"} style={n ? { filter: "drop-shadow(0 0 4px #00e5ff)" } : null} /></g>; })}
          {OUTPUTS.map(([k, l], i) => { const o = L.out[k]; const y = ys(OUTPUTS.length, i);
            return <g key={k}><circle cx="480" cy={y} r="7" fill={o ? "#18d69b" : "#1a2536"} stroke={o ? "#5ff0c4" : "#2a3a55"} style={o ? { filter: "drop-shadow(0 0 5px #18d69b)" } : null} />
              <text x="496" y={y + 4} fontSize="12.5" fill={o ? "var(--ink)" : "var(--ink-4)"} fontWeight="700">{l}</text>
              <text x="496" y={y + 18} fontSize="10" fill={o ? "var(--emerald)" : "var(--ink-4)"} fontFamily="JetBrains Mono, monospace">{o ? o.value : "waiting on data"}</text></g>; })}
        </svg>
      </div>
      <div className="grid g2">
        {OUTPUTS.map(([k, l, ins]) => { const o = L.out[k];
          return <div key={k} className={`tactical ${o ? "cs-captured" : ""}`} style={{ padding: 14 }}>
            <div className="row between"><div className="micro" style={{ color: o ? "var(--emerald)" : undefined }}>{l}</div>{o && <span className="num" style={{ color: "var(--emerald)", fontWeight: 700 }}>{o.value}</span>}</div>
            <div className="body" style={{ fontSize: 13, marginTop: 4 }}>{o ? o.text : `Waiting on ${ins.map((i) => INPUTS.find((x) => x[0] === i)[1].toLowerCase()).join(", ")}.`}</div>
          </div>; })}
        <div className="tactical" style={{ padding: 14 }}>
          <div className="micro">How it learns</div>
          <div className="body" style={{ fontSize: 13, marginTop: 4 }}>Each adjustment is counted from outcomes you recorded: auction results, redemptions, field visits, title findings. Nothing is estimated or modeled. An empty node means the records it needs don't exist yet.</div>
        </div>
      </div>
    </div>
  );
}

function Performance({ positions, passes, dd, holo, photoCount }) {
  const views = positions.map((p) => positionView(p));
  const deployed = views.filter((v) => v.kind === "acquired").reduce((a, v) => a + v.bid, 0);
  const res = views.filter((v) => v.actual != null);
  const realized = res.reduce((a, v) => a + v.actual, 0), resCost = res.reduce((a, v) => a + v.bid, 0);
  const pipe = Object.fromEntries(Object.keys(STAGES).map((k) => [k, 0]));
  for (const id of new Set([...holo.mission, ...Object.keys(dd)])) pipe[stageOf(dd[id], photoCount(id))]++;
  const total = Object.values(pipe).reduce((a, b) => a + b, 0);
  return (
    <div className="col materialize" style={{ gap: 12, marginTop: 12 }}>
      <div className="grid g4">
        <Stat icon="bolt" v={moneyShort(deployed)} l="Active capital" n={`${views.filter((v) => v.kind === "acquired").length} active`} />
        <Stat icon="trend" v={res.length ? moneyShort(realized) : "—"} l="Realized return" n={res.length ? `${((realized / Math.max(1, resCost)) * 100).toFixed(1)}% on ${res.length}` : "none recorded"} tone={realized ? "var(--emerald)" : undefined} />
        <Stat icon="check" v={views.filter((v) => v.kind === "redeemed").length} l="Redeemed" n={`${views.filter((v) => v.kind === "foreclosed").length} to deed`} />
        <Stat icon="x" v={passes.length + views.filter((v) => v.kind === "passed" || v.kind === "missed").length} l="Passed / missed" />
      </div>
      <div className="glass pad">
        <div className="micro">Deal pipeline</div>
        <div className="row wrap" style={{ gap: 18, marginTop: 8 }}>
          <Ring value={total ? (pipe.ready / total) * 100 : null} size={96} color="var(--emerald)" label={`${pipe.ready}/${total}`} sub="READY" />
          <div className="col" style={{ gap: 6 }}>{Object.entries(STAGES).map(([k, [l, t]]) => <div key={k} className="row" style={{ gap: 8, fontSize: 13 }}><span className={`chip ${t}`} style={{ minWidth: 30, justifyContent: "center" }}>{pipe[k]}</span>{l}</div>)}</div>
        </div>
      </div>
    </div>
  );
}

function Market() {
  return (
    <div className="grid g2 materialize" style={{ marginTop: 12 }}>
      {Object.entries(OUTCOME_STATS).map(([k, s]) => (
        <div key={k} className="glass pad col">
          <div className="row between"><div><div className="micro cy">Published sale results</div><div className="h2">{k.split("|")[1]} County, {k.split("|")[0]}</div></div><Ring value={s.sale_through_pct} size={60} color="var(--emerald)" label={`${Math.round(s.sale_through_pct)}%`} sub="SOLD" /></div>
          <div className="grid g3" style={{ gap: 8 }}>
            <Stat v={s.bidders ?? "—"} l="Bidders" n={s.bidders_yoy != null ? `${s.bidders_yoy > 0 ? "+" : ""}${s.bidders_yoy} yoy` : null} />
            <Stat v={s.weighted_rate != null ? `${s.weighted_rate}%` : "—"} l="Weighted rate" n={`${s.latest_year}`} />
            <Stat v={s.floor_share_pct != null ? `${s.floor_share_pct}%` : "—"} l="At the floor" />
          </div>
          {s.trend_weighted_rate && <Spark vals={s.trend_weighted_rate} years={s.years} label="Weighted winning rate" />}
          <Src><b>{s.competition_read}</b>{s.play_read ? ` · ${s.play_read}` : ""}<br />Source: {s.source_url ? <a href={s.source_url} target="_blank" rel="noreferrer">{s.source_url.replace(/^https?:\/\//, "").slice(0, 50)}</a> : "county"} · {s.years.join(", ")}</Src>
        </div>))}
      <div className="empty" style={{ alignSelf: "center" }}>Only counties that publish their sale results appear here. No competition read is made for the others.</div>
    </div>
  );
}
function Spark({ vals, years, label }) {
  const max = Math.max(...vals), min = Math.min(...vals), w = 240, h = 46;
  const pts = vals.map((v, i) => [14 + (i / Math.max(1, vals.length - 1)) * (w - 28), h - 8 - ((v - min) / Math.max(.001, max - min)) * (h - 20)]);
  return (
    <div><div className="micro" style={{ fontSize: 9.5 }}>{label}</div>
      <svg viewBox={`0 0 ${w} ${h + 12}`} style={{ width: "100%", height: 64 }} role="img" aria-label={`${label}: ${vals.join(", ")}`}>
        <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke="#00e5ff" strokeWidth="2" style={{ filter: "drop-shadow(0 0 4px #00e5ff)" }} />
        {pts.map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r="3" fill="#00e5ff" /><text x={x} y={y - 7} textAnchor="middle" fill="var(--ink-2)" fontSize="9">{vals[i]}%</text><text x={x} y={h + 10} textAnchor="middle" fill="var(--ink-4)" fontSize="8.5">{years[i]}</text></g>)}
      </svg></div>
  );
}
