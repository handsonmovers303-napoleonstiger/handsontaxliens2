import React, { useCallback, useEffect, useState } from "react";
import ScoutingDept from "./legacy/ScoutingDept.jsx";
import { StoreProvider, ToastProvider, useStore } from "./holo/store";
import { AccountSheet, HelpButton, Icon, ScreenLead, SyncPill, Tiger } from "./holo/ui";
import { resetCountyCache } from "./holo/data";
import Home from "./holo/home/Home";
import Search from "./holo/screens/Search";
import Grid from "./holo/screens/Grid";
import Counties from "./holo/screens/Counties";
import Parcels from "./holo/screens/Parcels";
import Title from "./holo/screens/Title";
import Board from "./holo/screens/Board";
import Field from "./holo/screens/Field";
import Route from "./holo/screens/Route";
import Auctions from "./holo/screens/Auctions";
import SaleCalendar, { SaleAlertWatcher } from "./holo/screens/SaleCalendar";
import Portfolio from "./holo/screens/Portfolio";
import Learning from "./holo/screens/Learning";
import Social from "./holo/screens/Social";
import Community from "./holo/screens/Community";
import Marketplace from "./holo/screens/Marketplace";
import ScoutPoints from "./holo/screens/ScoutPoints";
import { FeedbackButton } from "./holo/Feedback";
import "./holo/holo.css";
import { Button } from "./holo/ds";

const SCREENS = [
  ["home", "search", "Home", Home, "Search records on file"],
  ["search", "learn", "Search", Search, "Ask one question"],
  ["grid", "layers", "Map", Grid, "See county names"],
  ["counties", "target", "Counties", Counties, "Open one county file"],
  ["parcels", "doc", "Parcels", Parcels, "Open one property file"],
  ["title", "doc", "Title", Title, "Save a title note"],
  ["board", "board", "Missions", Board, "Check saved parcels"],
  ["field", "cam", "Scout", Field, "Record a site visit"],
  ["route", "route", "Routes", Route, "Order the drive"],
  ["auction", "bolt", "Auctions", Auctions, "Follow a tax sale"],
  ["calendar", "cal", "Calendar", SaleCalendar, "See dates on file"],
  ["portfolio", "trend", "Portfolio", Portfolio, "Track what you hold"],
  ["learning", "learn", "Learning", Learning, "See what you logged"],
  ["community", "user", "Community", Community, "Read and write with members"],
  ["social", "mail", "Social", Social, "Draft a public post"],
  ["market", "cards", "Market", Marketplace, "Sell or buy a certificate"],
  ["points", "star", "Points", ScoutPoints, "Scout points for shared research"],
  ["deck", "cards", "Research deck", null, "Open the county deck"],
];
const MARKET_TABS = new Set(["browse", "sell", "requests", "offers", "transfers", "operator"]);
const fromHash = () => {
  const raw = (window.location.hash || "").replace(/^#\/?/, "");
  const [head, rest] = raw.split(/[/?]/);
  const screen = SCREENS.some((s) => s[0] === head) ? head : "home";
  const tab = screen === "market" && MARKET_TABS.has(rest) ? rest : null;
  return { screen, tab };
};

function Shell() {
  const { sync, patchHolo, reload, ready } = useStore();
  const [screen, setScreen] = useState(() => fromHash().screen);
  const [params, setParams] = useState(() => { const r = fromHash(); return r.tab ? { tab: r.tab } : null; });
  const [account, setAccount] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [q, setQ] = useState("");
  const [liveTick, setLiveTick] = useState(0);
  const [depart, setDepart] = useState(null);
  useEffect(() => { const f = () => { const r = fromHash(); setScreen(r.screen); if (r.tab) setParams((p) => ({ ...(p || {}), tab: r.tab })); }; window.addEventListener("hashchange", f); return () => window.removeEventListener("hashchange", f); }, []);
  useEffect(() => { const f = () => setAccount(true); window.addEventListener("hotl:open-account", f); return () => window.removeEventListener("hotl:open-account", f); }, []);
  useEffect(() => {
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest?.("a[href]");
      if (!a) return;
      const href = a.getAttribute("href") || "";
      if (!/^https?:\/\//i.test(href)) return;
      let host = "";
      try { host = new URL(href, window.location.href).host.replace(/^www\./, ""); } catch { return; }
      if (!host || host === window.location.host) return;
      setDepart({ host, n: Date.now() });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  useEffect(() => {
    if (!depart) return undefined;
    const t = setTimeout(() => setDepart(null), 900);
    return () => clearTimeout(t);
  }, [depart]);
  // live corrections change sale dates, OTC and phones: rebuild the county summaries
  useEffect(() => { const f = () => { resetCountyCache(); setLiveTick((t) => t + 1); }; window.addEventListener("hotl:live", f); return () => window.removeEventListener("hotl:live", f); }, []);
  const go = useCallback((k, p) => {
    if (screen === "deck" && k !== "deck") reload();   // pick up what the full deck saved
    if (p && p.focus) patchHolo(() => ({ focusCounty: p.focus }));
    setParams(p || null); setScreen(k);
    const tab = k === "market" && p?.tab && MARKET_TABS.has(p.tab) ? `/${p.tab}` : "";
    window.location.hash = `${k}${tab}`; window.scrollTo({ top: 0, behavior: "smooth" });
  }, [screen, reload, patchHolo]);
  const Cur = (SCREENS.find((s) => s[0] === screen) || SCREENS[0])[3];
  const primary = [["home", "Atlas"], ["counties", "Counties"], ["parcels", "Research"], ["portfolio", "Portfolio"], ["learning", "Academy"]];
  const more = SCREENS.filter((s) => !primary.some((p) => p[0] === s[0]));
  // "/" or ⌘K / Ctrl+K reopens Quantum Search from anywhere
  useEffect(() => {
    const k = (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName);
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        if (screen !== "home") go("home");
        setTimeout(() => document.getElementById("nav-search")?.focus(), 60);
      }
    };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [screen, go]);

  return (
    <div className="holo-root">
      <header className="topbar">
        <div className="topbar-in">
          <Button className="brand" onClick={() => go("home")} style={{ background: "none", border: 0, cursor: "pointer", padding: 0, color: "var(--ink)" }} aria-label="Hands On Tax Liens home"><Tiger /><span>Hands On Tax Liens</span><span className="beta-tag">BETA</span></Button>
          <nav className="nav nav-primary" aria-label="Screens">
            {primary.map(([k, l]) => (
              <Button key={k} className={screen === k ? "on" : ""} onClick={() => go(k)} aria-current={screen === k ? "page" : undefined}>{l}</Button>
            ))}
            <div className="nav-more">
              <Button className={more.some((s) => s[0] === screen) ? "on" : ""} aria-expanded={moreOpen} onClick={() => setMoreOpen((v) => !v)}>More</Button>
              {moreOpen && (
                <div className="nav-more-menu" role="menu">
                  {more.map(([k, , l, , lead]) => (
                    <Button key={k} role="menuitem" className={screen === k ? "on" : ""} onClick={() => { setMoreOpen(false); go(k); }}>{l}<span>{lead}</span></Button>
                  ))}
                </div>
              )}
            </div>
          </nav>
          <form className="nav-search" role="search" onSubmit={(e) => { e.preventDefault(); const text = q.trim(); if (!text) return; go("home"); setTimeout(() => window.dispatchEvent(new CustomEvent("hotl:run-search", { detail: text })), 40); }}>
            <input id="nav-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by APN, address, or county" aria-label="Search records" />
            <Button type="submit">Search</Button>
          </form>
          <HelpButton />
          <SyncPill sync={sync} onOpen={() => setAccount(true)} />
        </div>
      </header>
      <p className="research-disclaimer" role="note">This is a research tool. It shows records on file so you can study a county or a parcel. It does not place a bid, list a certificate, confirm title, or tell you to buy or sell. Not financial, legal, or tax advice.</p>
      {screen === "deck" ? (
        <div className="screen-in" key="deck">
          <div key={liveTick}>
            <div className="main" style={{ paddingBottom: 0 }}>
              <ScreenLead does="Open the full county research deck, the older tables behind the newer screens." leads="The same county and parcel files. This deck is not the certificate marketplace, and a row here is not a listing." />
            </div>
            <ScoutingDept />
          </div>
        </div>
      ) : (
        <main className={screen === "home" ? "main bleed screen-in" : "main screen-in"} key={screen}>{ready ? <Cur key={liveTick} go={go} params={params} /> : <div className="empty">Loading your research…</div>}</main>
      )}
      <FeedbackButton screen={screen} />
      <SaleAlertWatcher />
      {depart && (
        <div key={depart.n}>
          <div className="leave-fade" aria-hidden="true" />
          <div className="depart" role="status">Opening <b>{depart.host}</b></div>
        </div>
      )}
      {account && <AccountSheet sync={sync} onClose={() => setAccount(false)} />}
    </div>
  );
}

export default function App() {
  return <StoreProvider><ToastProvider><Shell /></ToastProvider></StoreProvider>;
}
