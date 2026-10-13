import React, { useMemo, useState } from "react";
import { allCounties, allProperties, countyDbMeta, countyDetail, confidenceOf, daysUntil, fmtDate, money, STATE_NAMES, OUTCOME_ROWS } from "../data";
import { countyConfidence, fact, PARTS, stateOf, RESOLVED, BRANCHES } from "../intel";
import { commandOrder, countyProgress, draftFromTeam, REQUIREMENTS, saveEvidence } from "../diligence";
import { countyMarketLines, MARKET_PULLED, MARKET_SOURCES } from "../countyMarket";
import { auctionLines } from "../countyAuction";
import { tigerBrief, tigerLines } from "../tigerMaster";
import { useStore, useToast } from "../store";
import { ConfidencePanel, focusScroll, Halo, Icon, Ring, SecHead, Src, Stat } from "../ui";
import { Button, InteractiveCard } from "../ds";
import { linkChip } from "../linkCheck";

const LEVEL_TONE = { g: "var(--teal)", y: "var(--amber)", r: "var(--red)" };
const TITLE = BRANCHES.find((b) => b.id === "title").items;

/** The card's state, from what is verified and what you have done — in priority order. */
export function countyState(s, holo, missionKeys) {
  const u = holo.countyStatus[s.id];
  if (u === "passed") return ["passed", "Passed", ""];
  if (u === "captured") return ["captured", "Captured", "gr"];
  if (missionKeys.has(s.key)) return ["field", "Field active", "cy"];
  if (s.tier === "A" && s.countyVerified) return ["high", "High opportunity", "gd"];
  if (u === "investigating") return ["investigating", "Investigating", "cy"];
  if (s.countyVerified) return ["verified", "Verified", "cy"];
  if (s.statuteVerified || (holo.viewed && holo.viewed[s.id])) return ["discovered", "Discovered", "in"];
  return ["locked", "Locked", ""];
}
/** County keys ("ST|Name") that hold a parcel on the current mission. */
export function useMissionKeys() {
  const { holo } = useStore();
  return useMemo(() => { const byId = new Map(allProperties().map((p) => [p.id, p.key])); return new Set(holo.mission.map((id) => byId.get(id)).filter(Boolean)); }, [holo.mission]);
}

export default function Counties({ go }) {
  const { holo, patchHolo, stars } = useStore();
  const all = allCounties();
  const [q, setQ] = useState("");
  const [st, setSt] = useState("");
  const [sys, setSys] = useState("all");
  const [only, setOnly] = useState("all");
  const [n, setN] = useState(60);
  const list = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return commandOrder(
      all.filter((c) => (!qq || `${c.name} ${c.state} ${c.stateName}`.toLowerCase().includes(qq)) && (!st || c.state === st)
        && (sys === "all" || c.sys === sys)
        && (only === "all" || (only === "verified" && (c.countyVerified || c.statuteVerified)) || (only === "sale" && c.nextSale && daysUntil(c.nextSale) >= 0)
          || (only === "parcels" && c.hasParcels) || (only === "otc" && c.otc) || (only === "mine" && (holo.countyStatus[c.id] || stars[`county:${c.id}`]))))
        .map((c) => ({ ...c, days: daysUntil(c.nextSale) })),
      (c) => (holo.countyEvidence || {})[c.key],
      (c) => holo.viewed && holo.viewed[c.id],
    );
  }, [all, q, st, sys, only, holo.countyStatus, holo.countyEvidence, holo.viewed, stars]);
  const states = useMemo(() => [...new Set(all.map((c) => c.state))].sort(), [all]);
  const focus = all.find((c) => c.id === holo.focusCounty) || list[0];

  return (
    <div className="materialize">
      <SecHead ix="02" title="County hologram" sub="Every county, layer by layer" right={<span className="chip num">{list.length.toLocaleString()} / {all.length.toLocaleString()}</span>} />
      <div className="split">
        <div className="glass pad col" style={{ gap: 10 }}>
          <div className="row" style={{ position: "relative" }}>
            <Icon n="search" s={16} c="var(--ink-3)" style={{ position: "absolute", left: 12, pointerEvents: "none" }} />
            <input id="county-q" className="input" style={{ paddingLeft: 36 }} placeholder="Search county or state" value={q} onChange={(e) => { setQ(e.target.value); setN(60); }} />
          </div>
          <div className="grid g2" style={{ gap: 8 }}>
            <select id="county-st" className="input" value={st} onChange={(e) => setSt(e.target.value)} aria-label="State"><option value="">All states</option>{states.map((s) => <option key={s} value={s}>{STATE_NAMES[s] || s}</option>)}</select>
            <select id="county-sys" className="input" value={sys} onChange={(e) => setSys(e.target.value)} aria-label="Sale system"><option value="all">Lien + deed</option><option value="L">Tax lien</option><option value="D">Tax deed</option></select>
          </div>
          <div className="row wrap" style={{ gap: 6 }}>
            {[["all", "Every county"], ["verified", "Terms already read"], ["sale", "Has a sale date"], ["parcels", "Has a parcel list"], ["otc", "County-held list"], ["mine", "Counties I marked"]].map(([k, l]) =>
              <Button key={k} className={`chip btn-chip ${only === k ? "cy" : ""}`} onClick={() => setOnly(k)}>{l}</Button>)}
          </div>
          <div className="col scroll stagger" style={{ maxHeight: "64vh", gap: 6 }}>
            {list.slice(0, n).map((c) => {
              const conf = confidenceOf(c);
              const d = c.days;
              const prog = countyProgress({ evidence: (holo.countyEvidence || {})[c.key], viewed: !!(holo.viewed && holo.viewed[c.id]) });
              const market = countyMarketLines(c.fips);
              const page = auctionLines(c.fips);
              const tiger = tigerLines(c.fips);
              const pop = market.population ? market.population.split(" · ")[0] : null;
              const metro = market.metro ? market.metro.split(" · ").slice(0, 2).join(" · ") : null;
              return (
                <InteractiveCard key={c.id} className={`list-item ${focus && c.id === focus.id ? "on" : ""}`} onClick={() => { patchHolo((h) => ({ focusCounty: c.id, viewed: { ...(h.viewed || {}), [c.id]: 1 } })); focusScroll(); }}>
                  <div style={{ width: 38, textAlign: "center" }}><div className="num" style={{ fontSize: 16, fontWeight: 700, color: c.tier === "A" ? "var(--teal)" : "var(--ink)" }}>{c.score != null ? Math.round(c.score) : "—"}</div><div className="faint" style={{ fontSize: 9, letterSpacing: ".1em" }}>TIER {c.tier || "?"}</div></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="row" style={{ gap: 6 }}><b style={{ fontSize: 14 }}>{c.name}</b><span className="dim" style={{ fontSize: 12 }}>{c.state}</span>{stars[`county:${c.id}`] && <Icon n="star" s={12} c="var(--gold)" fill="var(--gold)" />}</div>
                    <div className="faint" style={{ fontSize: 11, marginTop: 2 }}>{[pop && `${pop} people`, metro, page.saleDate && `Sale ${page.saleDate}`, tiger.present && tiger.chip].filter(Boolean).join(" · ") || "No Census figure on file"}</div>
                    <div className="row" style={{ gap: 6, marginTop: 3, flexWrap: "wrap" }}>
                      <span className={`chip ${conf.tone}`} style={{ fontSize: 10, padding: "1px 7px" }}>{conf.label}</span>
                      {d != null && d >= 0 && <span className={`chip ${d <= 30 ? "gd" : "cy"}`} style={{ fontSize: 10, padding: "1px 7px" }}>Sale {d}d</span>}
                      <span className="chip" style={{ fontSize: 10, padding: "1px 7px" }}>{prog.done}/7</span>
                      {tiger.present && <span className={`chip ${tiger.found ? "cy" : "am"}`} style={{ fontSize: 10, padding: "1px 7px" }}>{tiger.chip}</span>}
                    </div>
                  </div>
                </InteractiveCard>);
            })}
            {list.length > n && <Button className="btn quiet sm" onClick={() => setN(n + 120)}>Show more ({list.length - n})</Button>}
            {!list.length && <div className="empty">No county matches. Clear a filter.</div>}
          </div>
        </div>
        {focus ? <CountyHologram key={focus.id} s={focus} go={go} /> : <div className="empty">Pick a county.</div>}
      </div>
    </div>
  );
}

/** A county as a physical object: a front face and three layers that unfold beneath it. */
function extraLinks(links, pulled, tiger) {
  const out = links.slice();
  const has = (url) => out.some((l) => l[2] === url);
  if (pulled.url && !has(pulled.url)) out.push(["treasurer", "Fetched county page, not read", pulled.url, "UNVERIFIED"]);
  if (tiger.url && !has(tiger.url)) out.push(["tiger", `${tiger.chip || "Tiger baseline"}, not read`, tiger.url, "UNVERIFIED"]);
  if (tiger.stateRuleUrl && !has(tiger.stateRuleUrl)) out.push(["tiger", "State rule noted by Tiger, not read", tiger.stateRuleUrl, "UNVERIFIED"]);
  if (tiger.inventoryUrl && !has(tiger.inventoryUrl)) out.push(["tiger", "Inventory file counted by Tiger, not loaded", tiger.inventoryUrl, "UNVERIFIED"]);
  return out;
}

export function CountyHologram({ s, go, compact }) {
  const { holo, patchHolo, stars, toggleStar, dd, photoCount } = useStore();
  const toast = useToast();
  const D = useMemo(() => countyDetail(s), [s]);
  const parcels = useMemo(() => allProperties().filter((p) => p.key === s.key), [s.key]);
  const missionKeys = useMissionKeys();
  const [state, stateLabel, stateTone] = countyState(s, holo, missionKeys);
  const liveAt = useMemo(() => { const m = window.__hotlLive; if (!m) return null; let at = null; for (const [k, r] of m) if (k.startsWith(s.fips + ":") && (!at || r.created_at > at)) at = r.created_at; return at; }, [s.fips]);
  const conf = countyConfidence(s, { parcels, dd, photoCount, liveAt });
  const [open, setOpen] = useState(compact ? 0 : 3);
  const [showConf, setShowConf] = useState(false);
  const status = holo.countyStatus[s.id];
  const setStatus = (v) => patchHolo((h) => ({ countyStatus: { ...h.countyStatus, [s.id]: v } }));
  const pulled = auctionLines(s.fips);
  const tiger = tigerLines(s.fips);
  const days = daysUntil(D.saleIso);
  const pageDays = D.saleIso ? null : daysUntil(pulled.saleIso);
  const saleDays = days != null ? days : pageDays;
  const starred = !!stars[`county:${s.id}`];
  const results = OUTCOME_ROWS.filter((r) => r.state === s.state && r.county === s.name).sort((a, b) => a.sale_year - b.sale_year);
  const amounts = parcels.map((p) => p.amount).filter((x) => x != null);
  const researched = parcels.filter((p) => dd[p.id] && Object.keys(dd[p.id]).length);
  const titled = researched.filter((p) => TITLE.some((id) => RESOLVED.has(stateOf(dd[p.id][id]).id)));
  const officialLinks = D.links.filter((l) => l[3] === "OFFICIAL");
  const platform = fact(D.facts, /platform/i) || pulled.platform;
  const deposit = fact(D.facts, /deposit/i) || pulled.deposit;
  const cadence = fact(D.facts, /cadence|timing|frequen/i) || pulled.cadence;
  const deadlineText = D.deadline ? `${fmtDate(D.deadline.iso)}${D.deadline.text ? ` · ${D.deadline.text}` : ""}` : pulled.deadline;
  const lines = countyMarketLines(s.fips);
  const db = countyDbMeta(s.name, s.state);
  const popText = lines.population || (db.population ? `${Number(db.population).toLocaleString()} (county database)` : null);

  if (state === "locked") return (
    <Halo score={conf.score} className="glass pad cs-locked materialize" id={compact ? undefined : "focus-card"} style={{ scrollMarginTop: 110 }}>
      <div className="row between"><span className="chip">LOCKED</span><span className="micro">{s.stateName}</span></div>
      <div style={{ fontSize: 26, fontWeight: 800, marginTop: 10 }}>{s.name} County</div>
      <div className="body" style={{ maxWidth: 460, marginTop: 6 }}>Workbook data only: the statute for {s.stateName} has not been verified and no county terms are on file. What sits behind this card is a lead, not a fact.</div>
      {tiger.present && <div className="faint" style={{ marginTop: 8 }}>{tiger.chip}. {tigerBrief(tiger.reason)} {tiger.note}</div>}
      <div className="grid g3" style={{ gap: 8, marginTop: 12 }}>
        <Stat v={s.instrument} l="Sale type" /><Stat v={s.score != null ? Math.round(s.score) : "—"} l="Queue score" /><Stat v={conf.score} l="Confidence" />
      </div>
      <Button className="btn ghost" style={{ marginTop: 12 }} onClick={() => { setStatus("investigating"); patchHolo((h) => ({ viewed: { ...(h.viewed || {}), [s.id]: 1 } })); }}><Icon n="lock" s={15} /> Open this county and start research</Button>
    </Halo>
  );

  return (
    <Halo score={conf.score} id={compact ? undefined : "focus-card"} className={`glass pad elev up cs-${state} ${state === "high" ? "rare-intel" : ""}`} style={{ scrollMarginTop: 110 }}>
      {state === "investigating" && <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 14, pointerEvents: "none" }}><div className="scan" /></div>}
      {/* FRONT LAYER */}
      <div className="row between wrap" style={{ gap: 8 }}>
        <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
          <span className={`chip ${stateTone}`}>{state === "field" && <span className="dot pulse-dot" style={{ width: 6, height: 6 }} />}{stateLabel.toUpperCase()}</span>
          <span className="chip">{s.instrument.toUpperCase()}</span>
          <span className={`chip ${s.tier === "A" ? "gd" : ""}`}>TIER {s.tier || "?"}</span>
        </div>
        <div className="row" style={{ gap: 6 }}>
          <Button className="chip btn-chip cy" onClick={() => setShowConf(!showConf)} title="Show how this confidence number was counted">{showConf ? "Hide confidence" : "Show confidence"}</Button>
          <Button className={`chip btn-chip ${starred ? "gd" : ""}`} onClick={() => toggleStar(`county:${s.id}`)}>{starred ? "Remove the star" : "Star this county"}</Button>
        </div>
      </div>
      <div style={{ marginTop: 10 }}>
        <div style={{ fontSize: compact ? 24 : 30, fontWeight: 800, letterSpacing: "-.02em", textShadow: "0 0 22px rgba(0,229,255,.3)" }}>{s.name} County</div>
        <div className="micro cy">{s.stateName} · FIPS {s.fips}{D.seat ? ` · seat ${D.seat.name}` : ""}</div>
      </div>
      {showConf && <div className="tactical materialize" style={{ padding: 14, marginTop: 10 }}><ConfidencePanel conf={conf} parts={PARTS.map(([k, l, n]) => [k, l, k === "title" || k === "field" || k === "match" ? `${n}, across the ${researched.length} parcel${researched.length === 1 ? "" : "s"} you have researched here` : n])} /></div>}
      <div className={`grid ${compact ? "g2" : "g4"}`} style={{ marginTop: 12, gap: 8 }}>
        <div className="stat row" style={{ gap: 10 }}><Ring value={s.score} size={50} color={s.tier === "A" ? "var(--gold)" : "var(--cyan)"} /><div><div className="l" style={{ marginTop: 0 }}>Priority</div><div className="n">queue score</div></div></div>
        <Stat icon="bolt" v={saleDays == null ? "Not on file" : saleDays < 0 ? "Held" : `${saleDays}d`} l="Next sale" n={D.saleIso ? `${fmtDate(D.saleIso)}${D.saleLevel ? ` · ${String(D.saleLevel).toLowerCase()}` : ""}` : pulled.saleDate ? `${pulled.saleDate} · copied from the county page, not read` : "no date verified"} tone={saleDays != null && saleDays >= 0 && saleDays <= 30 ? "var(--gold)" : undefined} />
        <Stat icon="trend" v={D.R.verified && D.R.statutoryRate != null ? `${D.R.statutoryRate}%` : s.rate ? `${s.rate}%` : "—"} l="Headline rate" n={D.headline} />
        <Stat icon="layers" v={s.redeem ? `${s.redeem} mo` : "—"} l="Redemption" n={D.redemption} />
      </div>
      <div className="row wrap" style={{ gap: 6, marginTop: 10 }}>
        <span className={`chip ${D.otc ? "cy" : ""}`}>OTC · {D.otc ? String(D.otc.status || "on file").toLowerCase() : "not on file"}</span>
        <span className={`chip ${s.countyVerified ? "gr" : s.statuteVerified ? "cy" : "am"}`}>Data · {confidenceOf(s).label}</span>
        {tiger.present && <span className={`chip ${tiger.found ? "cy" : "am"}`}>{tiger.chip}</span>}
        {D.conflict && <span className="chip rd">Source conflict</span>}
      </div>
      <CountyEvidence s={s} links={extraLinks(D.links, pulled, tiger)} />

      <div className="row wrap" style={{ gap: 6, marginTop: 12 }}>
        {["Auction", "Verification", "Terrain & market"].map((l, i) => <Button key={l} className={`chip btn-chip ${open > i ? "cy" : ""}`} onClick={() => setOpen(open > i ? i : i + 1)}>{open > i ? "▾" : "▸"} Layer {i + 2} · {l}</Button>)}
      </div>

      <div className="layers" style={{ marginTop: 10 }}>
        {open >= 1 && (
          <div className="layer tactical" style={{ padding: 14 }}>
            <div className="layer-tag">LAYER 02 · AUCTION</div>
            <div className="kv" style={{ marginTop: 6 }}>
              <div>Auction frequency</div><div>{cadence || "Not on file"}</div>
              <div>Historical inventory</div><div className="num">{results.length ? results.map((r) => `${r.sale_year}: ${r.offered != null ? r.offered.toLocaleString() : "—"}`).join(" · ") : "Not published"}</div>
              <div>Delinquent parcels on file</div><div className="num">{D.deck ? `${(D.deck.rowCount || D.deck.rows.length).toLocaleString()} (${D.deck.level.toLowerCase()})` : pulled.inventory ? `${pulled.inventory} · link on the county page, not downloaded` : "No list on file"}</div>
              <div>Platform</div><div>{platform || "Not on file"}</div>
              <div>Registration deadline</div><div>{deadlineText || "Not on file"}</div>
              <div>Deposit</div><div>{deposit || "Not on file"}</div>
              <div>Average amount owed</div><div className="num">{amounts.length ? `${money(amounts.reduce((a, b) => a + b, 0) / amounts.length)} across ${amounts.length.toLocaleString()} listed` : "Not on file"}</div>
              <div>Bid method</div><div>{s.bid || "Not on file"}</div>
              <div>County contact</div><div>{D.phone ? <a href={`tel:${D.phone}`}>{D.phone}</a> : "Phone withheld / not on file"}{(D.email || pulled.email) ? <> · <span className="num">{D.email || pulled.email}</span></> : null}</div>
              {tiger.reason && <><div>Tiger's auction note</div><div>{tiger.reason}</div></>}
              {tiger.stateSale && <><div>State sale method</div><div>{tiger.stateSale} <span className="faint">· state rule by Tiger, not this county's own page</span></div></>}
              {tiger.stateInterest && <><div>State interest</div><div>{tiger.stateInterest} <span className="faint">· state rule by Tiger</span></div></>}
              {tiger.stateRedeem && <><div>State redemption</div><div>{tiger.stateRedeem} <span className="faint">· state rule by Tiger, confirm on the parcel</span></div></>}
              {tiger.inventoryN ? <><div>Tiger's inventory count</div><div className="num">{tiger.inventoryN.toLocaleString()} {tiger.inventoryType} · counted in the master, not loaded here</div></> : null}
            </div>
            {pulled.note && <Src>{pulled.note}</Src>}
          </div>)}
        {open >= 2 && (
          <div className="layer tactical" style={{ padding: 14 }}>
            <div className="layer-tag">LAYER 03 · VERIFICATION</div>
            <div className="kv" style={{ marginTop: 6 }}>
              <div>Statute</div><div>{D.R.verified ? "Verified against primary sources" : "Not in the verified rulebook"}</div>
              <div>Official sources</div><div>{officialLinks.length ? `${officialLinks.length} opened and read` : pulled.fetched ? "Page fetched, not opened and read" : "None opened yet"}{D.links.length > officialLinks.length ? ` · ${D.links.length - officialLinks.length} other` : ""}</div>
              <div>Data freshness</div><div>{s.countyVerified ? `County terms read ${fmtDate("2026-09-04")}` : "Statute layer, Sep 2026"}{liveAt ? ` · live correction ${fmtDate(liveAt.slice(0, 10))}` : ""}</div>
              <div>Parcel list</div><div>{D.deck ? `${D.deck.level} · ${D.deck.scrapedAt ? `pulled ${fmtDate(String(D.deck.scrapedAt).slice(0, 10))}` : "date not recorded"}` : pulled.inventory ? "Link located, not downloaded" : "Not downloaded"}</div>
              <div>Parcel coverage</div><div className="num">{parcels.length ? `${researched.length} of ${parcels.length.toLocaleString()} researched` : "—"}</div>
              <div>Title coverage</div><div className="num">{researched.length ? `${titled.length} of ${researched.length} with title work` : "—"}</div>
              {tiger.present && <><div>Tiger's baseline</div><div>{tiger.statusLabel}{tiger.shared ? " · shared state page" : ""} · {tiger.checked}</div></>}
              {tiger.url && <><div>Tiger's link</div><div><a href={tiger.url} target="_blank" rel="noreferrer">{tiger.url}</a></div></>}
              {tiger.next && <><div>Still open</div><div>{tiger.next}</div></>}
              {tiger.stateRuleUrl && tiger.stateRuleUrl !== tiger.url && <><div>State rule</div><div><a href={tiger.stateRuleUrl} target="_blank" rel="noreferrer">{tiger.stateRuleUrl}</a>{tiger.stateChecked ? ` · Tiger ${tiger.stateChecked}` : ""}</div></>}
            </div>
            {tiger.note && <Src>{tiger.note}</Src>}
            <div className="col" style={{ gap: 4, marginTop: 8 }}>
              {D.links.map(([kind, label, url, lvl], i) => {
                const mark = linkChip(url, lvl);
                return (
                  <a key={i} href={url} target="_blank" rel="noreferrer" className="row" style={{ gap: 8, fontSize: 12.5, textDecoration: "none" }} title={mark.note}>
                    <span className={`chip ${mark.tone}`} style={{ fontSize: 9.5 }}>{mark.word}</span><span style={{ color: "var(--ink)" }}>{label}</span><span className="faint">{kind}</span></a>
                );
              })}
            </div>
          </div>)}
        {open >= 3 && (
          <div className="layer tactical" style={{ padding: 14 }}>
            <div className="layer-tag">LAYER 04 · TERRAIN & MARKET</div>
            <div className="kv" style={{ marginTop: 6 }}>
              <div>Terrain</div><div>{db.terrain ? `${db.terrain.charAt(0).toUpperCase()}${db.terrain.slice(1)} (county database)` : "Not on file"}</div>
              <div>Population</div><div className="num">{popText || "Not on file"}</div>
              <div>Rural / metro</div><div>{lines.metro || "Not on file"}</div>
              <div>Population growth</div><div>{lines.growth || "Not on file"}</div>
              <div>Flood exposure</div><div>{lines.flood || "Not on file · check FEMA NFHL per parcel"}</div>
              <div>Wildfire exposure</div><div>{lines.wildfire || "Not on file · check the state risk map per parcel"}</div>
              <div>Median value</div><div>{lines.median || "Not on file"}</div>
              <div>Vacancy</div><div>{lines.vacancy || "Not on file"}</div>
            </div>
            <Src>{lines.note ? `${lines.note} ` : `${MARKET_SOURCES.terrain} `}Last checked {MARKET_PULLED}. Not a county verification, and not a fact about one parcel.</Src>
            {!compact && D.facts.length > 0 && (
              <details style={{ marginTop: 8 }}><summary className="micro" style={{ cursor: "pointer" }}>All facts on file ({D.facts.length})</summary>
                <div className="col" style={{ gap: 0, marginTop: 6 }}>
                  {D.facts.map(([k, v, lv], i) => (
                    <div key={i} className="row" style={{ alignItems: "flex-start", padding: "6px 0", borderBottom: "1px solid rgba(90,170,255,.08)", gap: 8 }}>
                      <span className="dot" style={{ color: LEVEL_TONE[lv] || "var(--ink-3)", marginTop: 5 }} /><div style={{ fontSize: 12.5 }}><span className="dim">{k}</span><div style={{ color: "var(--ink)" }}>{v}</div></div></div>))}
                </div></details>)}
          </div>)}
      </div>

      <div className="row wrap" style={{ gap: 8, marginTop: 14 }}>
        <Button className="btn" onClick={(e) => { setStatus(status === "captured" ? "investigating" : "captured"); toast(status === "captured" ? "Back to investigating" : `${s.name} captured`, { x: e.clientX, y: e.clientY }); }}>
          <Icon n="check" s={16} /> {status === "captured" ? "Reviewed · tap to undo" : "Mark this county reviewed"}</Button>
        {status !== "investigating" && status !== "captured" && <Button className="btn ghost" onClick={() => setStatus("investigating")}>Mark this county in research</Button>}
        {D.deck && go && <Button className="btn ghost" onClick={() => go("parcels", { county: s.key })}><Icon n="cards" s={16} /> Open the {D.deck.rows.length.toLocaleString()} parcels</Button>}
        <Button className="btn quiet" onClick={() => setStatus(status === "passed" ? null : "passed")}>{status === "passed" ? "Put this county back" : "Set this county aside"}</Button>
      </div>
      <Src>Queue score from the national build ranks what to open; it does not say what to bid.{s.flags.includes("G") ? " Lien-or-deed conflict in the source row; the state layer governs." : ""}</Src>
    </Halo>
  );
}

const STATE_LABEL = { UNEXPLORED: "Unexplored", DISCOVERED: "Discovered", RESEARCHING: "Researching", VERIFIED: "Verified", AUCTION_READY: "Auction ready" };

function CountyEvidence({ s, links }) {
  const { holo, patchHolo } = useStore();
  const evidence = (holo.countyEvidence || {})[s.key] || {};
  const viewed = !!(holo.viewed && holo.viewed[s.id]);
  const prog = countyProgress({ evidence, viewed });
  const [open, setOpen] = useState(null);
  const [draft, setDraft] = useState({ url: "", seen: "", date: "", note: "" });
  const [err, setErr] = useState(null);
  const team = (links || []).map(([kind, label, url]) => ({ kind, note: label, url })).filter((row) => row.url);
  const openReq = REQUIREMENTS.find((r) => r.code === open);

  const save = () => {
    const result = saveEvidence(evidence, open, draft);
    if (!result.ok) {
      setErr(result.reason === "URL" ? "Add the link you read." : result.reason === "STATED_DATE" ? "Enter the date the source states." : "Enter the date you saw it.");
      return;
    }
    patchHolo((h) => ({
      countyEvidence: { ...(h.countyEvidence || {}), [s.key]: result.evidence },
      viewed: { ...(h.viewed || {}), [s.id]: 1 },
    }));
    setErr(null);
    setOpen(null);
  };

  return (
    <div className="tactical" style={{ padding: 14, marginTop: 12 }}>
      <div className="row between wrap" style={{ gap: 8 }}>
        <div className="micro cy">{STATE_LABEL[prog.state] || prog.state} · county {prog.done}/7 · auction {prog.gatesDone}/2</div>
        <span className="faint" style={{ fontSize: 12 }}>Saved on this device. It does not sync.</span>
      </div>
      <p className="faint" style={{ margin: "6px 0 0" }}>A team link does not count until you save it. Expired evidence drops this county out of Verified and Auction ready.</p>
      <div className="col" style={{ gap: 6, marginTop: 8 }}>
        {team.map((row) => {
          const copy = draftFromTeam(row);
          return (
            <div key={row.url} className="row between wrap" style={{ gap: 8 }}>
              <a href={row.url} target="_blank" rel="noreferrer" style={{ fontSize: 12.5 }}>{row.note}</a>
              <Button className="btn ghost sm" type="button" disabled={!copy.ok} onClick={() => {
                const code = prog.missing[0] || REQUIREMENTS[0].code;
                setOpen(code);
                setDraft({ url: copy.ok ? copy.draft.url : "", seen: "", date: "", note: copy.ok ? copy.draft.note : "" });
                setErr(null);
              }}>Copy this link into the form</Button>
            </div>
          );
        })}
        {!team.length && <div className="faint">No team source link on file. Record evidence from a page you opened.</div>}
      </div>
      <div className="col" style={{ gap: 6, marginTop: 10 }}>
        {REQUIREMENTS.map((req) => (
          <div key={req.code}>
            <div className="row between wrap" style={{ gap: 8 }}>
              <span style={{ fontSize: 13 }}>{req.label}</span>
              <Button className="btn ghost sm" type="button" onClick={() => { setOpen(req.code); setDraft({ url: "", seen: "", date: "", note: "" }); setErr(null); }}>Enter a source you read</Button>
            </div>
            {openReq && openReq.code === req.code && (
              <div className="col" style={{ gap: 6, marginTop: 6 }}>
                <input className="input" placeholder="Source URL" aria-label="Source URL" value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} />
                <input className="input" type="date" aria-label="Date seen" value={draft.seen} onChange={(e) => setDraft({ ...draft, seen: e.target.value })} />
                {req.kind === "date" && <input className="input" type="date" aria-label="Date stated in the source" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />}
                <input className="input" placeholder="Note, optional" aria-label="Note" value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} />
                {err && <div className="chip rd" style={{ whiteSpace: "normal" }}>{err}</div>}
                <Button className="btn sm" type="button" onClick={save}>Save this source on this device</Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
