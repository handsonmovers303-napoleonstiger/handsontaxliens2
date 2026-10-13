import React, { useMemo, useState } from "react";
import { allCounties, countyDetail, daysUntil, fmtDate, money, OUTCOME_STATS, ddVerdict } from "../data";
import { fact } from "../intel";
import { countyProgress, titleStanding } from "../diligence";
import { useStore, useToast } from "../store";
import { useAllParcels } from "./Parcels";
import { Icon, SecHead, Src, Stat } from "../ui";
import { Button } from "../ds";

const today = () => new Date().toISOString().slice(0, 10);

export default function Auctions({ go }) {
  const { holo, patchHolo, stars, dd } = useStore();
  const all = useAllParcels();
  const counties = allCounties();
  const watched = useMemo(() => {
    const ids = new Set([...holo.mission, ...Object.keys(stars).filter((k) => k.startsWith("parcel:")).map((k) => k.slice(7)), ...Object.keys(holo.bids || {})]);
    return all.filter((p) => ids.has(p.id));
  }, [all, holo.mission, stars, holo.bids]);
  const auctions = useMemo(() => {
    const keys = new Set([...counties.filter((c) => c.nextSale && daysUntil(c.nextSale) >= 0).map((c) => c.key), ...watched.map((p) => p.key)]);
    return counties.filter((c) => keys.has(c.key)).map((c) => ({ c, d: daysUntil(c.nextSale), parcels: watched.filter((p) => p.key === c.key) }))
      .sort((a, b) => (b.parcels.length > 0) - (a.parcels.length > 0) || (a.d ?? 1e9) - (b.d ?? 1e9));
  }, [counties, watched]);
  const [sel, setSel] = useState(null);
  const cur = auctions.find((a) => a.c.key === sel) || auctions[0];

  return (
    <div className="materialize">
      <SecHead ix="07" title="Auction command center" sub="Sales on file, parcels you're watching" right={<span className="chip num">{auctions.length} auctions</span>} />
      <div className="split">
        <div className="tactical col scroll" style={{ padding: 14, gap: 6, maxHeight: "76vh" }}>
          {auctions.map(({ c, d, parcels }) => {
            const prog = countyProgress({ evidence: (holo.countyEvidence || {})[c.key], viewed: !!(holo.viewed && holo.viewed[c.id]) });
            return (
            <div key={c.key} className={`list-item ${cur && cur.c.key === c.key ? "on" : ""}`}>
              <Button type="button" onClick={() => setSel(c.key)} style={{ display: "flex", gap: 8, alignItems: "center", flex: 1, background: "transparent", border: "none", color: "inherit", textAlign: "left", padding: 0 }}>
                <div style={{ width: 52, textAlign: "center" }}><div className="num" style={{ fontSize: 18, fontWeight: 700, color: d != null && d <= 30 ? "var(--gold)" : "var(--cyan-2)" }}>{d != null ? d : "—"}</div><div className="faint" style={{ fontSize: 9, letterSpacing: ".1em" }}>{d != null ? "DAYS" : "NO DATE"}</div></div>
                <div style={{ flex: 1, minWidth: 0 }}><b style={{ fontSize: 13.5 }}>{c.name}, {c.state}</b><div className="faint" style={{ fontSize: 11 }}>{c.nextSale ? fmtDate(c.nextSale) : "Sale date not on file"} · {c.instrument}</div></div>
              </Button>
              <span className="chip">{prog.done}/7</span>
              <Button className="btn ghost sm" type="button" onClick={() => go("counties", { focus: c.id })}>Open this county's file</Button>
              {parcels.length > 0 && <span className="chip cy">{parcels.length} watched</span>}
            </div>);
          })}
          {!auctions.length && <div className="empty">No sales on file. <Button className="chip btn-chip cy" type="button" onClick={() => { const mesa = allCounties().find((c) => c.state === "CO" && c.name === "Mesa"); if (mesa) go("counties", { focus: mesa.id }); }}>Open the Mesa county file</Button></div>}
        </div>
        {cur ? <AuctionPanel key={cur.c.key} a={cur} go={go} /> : <div className="empty">Pick an auction.</div>}
      </div>
    </div>
  );
}

function AuctionPanel({ a, go }) {
  const { holo, patchHolo, dd } = useStore();
  const { c, d, parcels } = a;
  const D = useMemo(() => countyDetail(c), [c]);
  const platform = fact(D.facts, /platform/i) || (window.__hotlLive && window.__hotlLive.get(`${c.fips}:platform`)?.value) || null;
  const deposit = fact(D.facts, /deposit/i);
  const out = OUTCOME_STATS[c.key];
  const regDays = D.deadline ? daysUntil(D.deadline.iso) : null;
  const registered = !!(holo.registered || {})[c.key];
  const regStatus = registered ? ["Registered", "gr"] : regDays == null ? ["Deadline not on file", ""] : regDays < 0 ? ["Registration closed", "rd"] : regDays <= 7 ? [`Closes in ${regDays}d`, "gd"] : [`Open · closes ${fmtDate(D.deadline.iso)}`, "cy"];
  const bids = holo.bids || {};
  const limits = parcels.reduce((s, p) => s + (Number(bids[p.id]?.max) || 0), 0);
  const [pick, setPick] = useState(parcels[0] ? parcels[0].id : null);
  const target = parcels.find((p) => p.id === pick);
  const docs = D.links.filter((l) => l[3] === "OFFICIAL" || l[0] === "platform").slice(0, 5);

  return (
    <div className="col" style={{ gap: 12 }}>
      <div className={`glass pad elev up ${d != null && d <= 30 ? "cs-high" : "cs-verified"}`}>
        <div className="row between wrap" style={{ gap: 8 }}>
          <div><div className="micro cy">Auction · {c.instrument}</div><div className="h2">{c.name} County, {c.state}</div></div>
          <div style={{ textAlign: "right" }}><div className="num" style={{ fontSize: 30, fontWeight: 700, color: d != null && d <= 30 ? "var(--gold)" : "var(--cyan-2)", lineHeight: 1 }}>{d != null ? `T-${d}d` : "—"}</div><div className="faint" style={{ fontSize: 11 }}>{c.nextSale ? fmtDate(c.nextSale) : "no sale date on file"}</div></div>
        </div>
        <div className="grid g4" style={{ gap: 8, marginTop: 12 }}>
          <Stat v={platform ? platform.split(/[—–-]/)[0].trim().slice(0, 18) : "—"} l="Platform" n={platform || "not on file"} />
          <Stat v={deposit ? "On file" : "—"} l="Deposit" n={deposit || "not on file"} />
          <Stat v={parcels.length} l="Properties watched" n={limits ? `${money(limits)} in bid limits` : "no limits set"} />
          <Stat v={out ? `${out.bidders}` : "—"} l="Competition" n={out ? `bidders in ${out.latest_year}` : "no published results"} />
        </div>
        <div className="row wrap" style={{ gap: 6, marginTop: 10 }}>
          <span className={`chip ${regStatus[1]}`}>{regStatus[0]}</span>
          <Button className={`chip btn-chip ${registered ? "gr" : ""}`} onClick={() => patchHolo((h) => ({ registered: { ...(h.registered || {}), [c.key]: !registered } }))}>{registered ? "Noted · I registered" : "Note that I registered"}</Button>
          {out && <span className="chip am" style={{ whiteSpace: "normal" }}>{out.competition_read}</span>}
        </div>
        {docs.length > 0 && <div className="row wrap" style={{ gap: 6, marginTop: 10 }}>{docs.map(([k, l, u], i) => <a key={i} className="chip btn-chip" href={u} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}><Icon n="doc" s={12} /> {l.slice(0, 40)}</a>)}</div>}
      </div>

      <div className="tactical" style={{ padding: 14 }}>
        <div className="micro">Watched parcels</div>
        {parcels.length ? (
          <div className="grid g3" style={{ gap: 8, marginTop: 8 }}>
            {parcels.map((p) => { const b = bids[p.id] || {}; const v = ddVerdict(dd[p.id]);
              return <Button key={p.id} className={`node ${pick === p.id ? "signal" : ""}`} onClick={() => setPick(p.id)} style={{ padding: 10 }}>
                <div className="num" style={{ fontSize: 12.5, fontWeight: 700 }}>{p.apn}</div>
                <div className="faint" style={{ fontSize: 11, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.label}</div>
                <div className="row between" style={{ marginTop: 6, fontSize: 11.5 }}><span className="dim">owed</span><span className="num">{money(p.amount)}</span></div>
                <div className="row between" style={{ fontSize: 11.5 }}><span className="dim">max</span><span className="num">{b.max ? `${b.unit === "%" ? `${b.max}%` : money(Number(b.max))}` : "—"}</span></div>
                <div className={`chip ${v.label === "CLEARED FOR AUCTION" ? "gr" : v.label === "Do not bid" ? "rd" : "am"}`} style={{ marginTop: 6, fontSize: 9.5 }}>{v.label === "CLEARED FOR AUCTION" ? "Cleared" : v.label}</div>
              </Button>; })}
          </div>) : <div className="empty" style={{ marginTop: 8 }}>No watched parcels in this county. <Button className="chip btn-chip cy" onClick={() => go("parcels", { county: c.key })}>Open this county's property list</Button></div>}
      </div>
      {target && <BidDiscipline key={target.id} p={target} county={c} statRate={D.R.verified ? D.R.statutoryRate : c.rate} />}
    </div>
  );
}

/** Three numbers and one track: your underwritten ceiling, the live price, and the room between. */
function BidDiscipline({ p, county, statRate }) {
  const { holo, patchHolo, setPositions, dd } = useStore();
  const toast = useToast();
  const b = (holo.bids || {})[p.id] || {};
  const unit = b.unit || (county.bid && /rate|interest|bid.?down/i.test(county.bid) ? "%" : "$");
  const set = (patch) => patchHolo((h) => ({ bids: { ...(h.bids || {}), [p.id]: { ...((h.bids || {})[p.id] || {}), unit, ...patch } } }));
  const max = Number(b.max), cur = Number(b.current);
  const has = b.max !== undefined && b.max !== "" && !isNaN(max) && max > 0;
  const hasCur = b.current !== undefined && b.current !== "" && !isNaN(cur);
  // price: higher is worse, ceiling = max. rate bid-down: lower is worse, floor = your minimum rate.
  const use = has && hasCur ? (unit === "$" ? cur / max : max / Math.max(cur, .0001)) : null;
  const margin = has && hasCur ? (unit === "$" ? max - cur : cur - max) : null;
  const tone = use == null ? "var(--ink-3)" : use < .8 ? "var(--emerald)" : use < .95 ? "var(--gold)" : use <= 1 ? "#ff9b6b" : "var(--red)";
  const msg = use == null ? "Set your ceiling before the sale, then track the live price." : use < .8 ? "Inside discipline." : use < .95 ? "Approaching your ceiling. Slow down." : use <= 1 ? "At your ceiling. Next bid breaks discipline." : "Past your ceiling. Walk away.";
  const pos = use == null ? 0 : Math.min(1.1, use);
  const walkaway = dd[p.id]?.b2;
  const step = unit === "$" ? Math.max(10, Math.round((max || p.amount || 1000) * .02 / 10) * 10) : .25;

  const standing = titleStanding((holo.titleSearches || {})[p.id], !!(holo.titleSkip || {})[p.id]);
  const record = (won) => {
    if (standing === "untouched" || !has) return;
    set({ result: { won, price: hasCur ? cur : null, date: today() } });
    if (won) setPositions((ps) => [{ address: `${p.label} (APN ${p.apn})`, county: `${p.county}, ${p.state}`, bid: unit === "$" ? cur : Number(p.amount) || 0, rate: unit === "%" ? cur : statRate || null,
      face: Number(p.amount) || null, date: today(), parcelId: p.id, snapshot: { edge: null, research: null, unknowns: null, expected: /deed/i.test(county.instrument) ? "deed process" : "redemption" }, actual: null }, ...ps]);
    toast(won ? "Won · added to portfolio" : "Result logged · the learning engine will use it");
  };

  return (
    <div className="glass pad" style={{ borderColor: use != null && use > .95 ? "rgba(255,93,93,.45)" : undefined, transition: "border-color var(--t-panel)" }}>
      <div className="row between wrap" style={{ gap: 8 }}>
        <div><div className="micro cy">Bid discipline</div><div className="h3">{p.label}</div><div className="faint num" style={{ fontSize: 11.5 }}>APN {p.apn} · owed {money(p.amount)}</div></div>
        <div className="tabs" style={{ padding: 3 }}>{[["$", "Price / premium"], ["%", "Rate bid-down"]].map(([k, l]) => <Button key={k} className={unit === k ? "on" : ""} onClick={() => set({ unit: k })}>{l}</Button>)}</div>
      </div>
      <div className="grid g3" style={{ gap: 8, marginTop: 12 }}>
        <div className="stat"><div className="l" style={{ marginTop: 0 }}>{unit === "$" ? "Maximum underwritten bid" : "Minimum acceptable rate"}</div>
          <input id={`max-${p.id}`} className="input num" type="number" inputMode="decimal" value={b.max ?? ""} onChange={(e) => set({ max: e.target.value })} placeholder={unit === "$" ? "$" : "%"} style={{ marginTop: 6, fontSize: 18 }} />
          {walkaway && walkaway.note && <div className="n">Walk-away on file: {walkaway.note.slice(0, 60)}</div>}</div>
        <div className="stat"><div className="l" style={{ marginTop: 0 }}>Current auction {unit === "$" ? "price" : "rate"}</div>
          <div className="row" style={{ gap: 6, marginTop: 6 }}>
            <Button className="btn quiet sm" onClick={() => set({ current: Math.max(0, Math.round(((hasCur ? cur : 0) - step) * 100) / 100) })} aria-label="Lower">−</Button>
            <input id={`cur-${p.id}`} className="input num" type="number" inputMode="decimal" value={b.current ?? ""} onChange={(e) => set({ current: e.target.value })} style={{ fontSize: 18, textAlign: "center" }} />
            <Button className="btn quiet sm" onClick={() => set({ current: Math.round(((hasCur ? cur : 0) + step) * 100) / 100 })} aria-label="Raise">+</Button>
          </div></div>
        <div className="stat"><div className="v" style={{ color: tone, fontSize: 24, transition: "color var(--t-panel)" }}>{margin == null ? "—" : unit === "$" ? money(margin) : `${margin.toFixed(2)} pts`}</div><div className="l">Safety margin</div><div className="n">{use == null ? "" : `${Math.round(use * 100)}% of discipline used`}</div></div>
      </div>
      <div style={{ marginTop: 18, padding: "0 4px" }}>
        <div className="disc-track">
          <div className="disc-ceiling" style={{ left: `${(1 / 1.1) * 100}%` }} title="Your ceiling" />
          {use != null && <div className="disc-mark" style={{ left: `calc(${(pos / 1.1) * 100}% - 1px)`, background: tone, boxShadow: `0 0 12px ${tone}` }} />}
        </div>
        <div className="row between" style={{ marginTop: 8 }}><span className="h3" style={{ color: tone, transition: "color var(--t-panel)" }}>{msg}</span><span className="faint" style={{ fontSize: 11 }}>gold line = your {unit === "$" ? "ceiling" : "floor"}</span></div>
      </div>
      <div className="row wrap" style={{ gap: 8, marginTop: 12 }}>
        <Button className="btn" disabled={!hasCur || !has || standing === "untouched"} onClick={() => record(true)}><Icon n="check" s={15} /> Log a win at this price</Button>
        <Button className="btn quiet" disabled={!hasCur || !has || standing === "untouched"} onClick={() => record(false)}>Log a loss and the winning {unit === "$" ? "price" : "rate"}</Button>
        {standing === "untouched" && <div className="chip am" style={{ whiteSpace: "normal" }}>Title is untouched. Check it or skip it before auction mode.</div>}
        {b.result && <span className={`chip ${b.result.won ? "gr" : ""}`}>{b.result.won ? "Won" : "Lost"} at {b.result.price != null ? (unit === "$" ? money(b.result.price) : `${b.result.price}%`) : "—"} · {b.result.date}</span>}
      </div>
      <Src>Your ceiling comes from your own underwriting, never from the app. Results feed the learning engine's bid-model check.</Src>
    </div>
  );
}
