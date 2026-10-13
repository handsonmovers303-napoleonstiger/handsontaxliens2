import React, { useEffect, useMemo, useState } from "react";
import { fmtDate, saleBoard } from "../data";
import { useStore } from "../store";
import { Icon, ScreenLead, SecHead } from "../ui";
import { alertCopy, presentAlerts, upcomingAlerts } from "../saleAlerts";
import { enablePush, showSalePushes, syncPushPrefs } from "../../lib/push";
import { Button } from "../ds";

const WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const todayIso = () => new Date().toISOString().slice(0, 10);

function monthMatrix(year, month) {
  const first = new Date(year, month, 1);
  const start = first.getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < start; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(`${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  while (cells.length % 7) cells.push(null);
  return cells;
}

export function useSaleAlertFeed() {
  const { holo } = useStore();
  const events = useMemo(() => saleBoard(), [holo]);
  const today = todayIso();
  const alerts = useMemo(() => presentAlerts(upcomingAlerts(events, {
    today, leadDays: holo.alertLead, watch: holo.saleWatch || [], allSales: !!holo.alertAll,
  })), [events, today, holo.alertLead, holo.saleWatch, holo.alertAll]);
  return { events, alerts, today };
}

export function SaleAlertWatcher() {
  const { holo } = useStore();
  const { alerts } = useSaleAlertFeed();
  useEffect(() => {
    if (!holo.alertBrowser || !alerts.length || holo.pushSubscribed) return;
    const fresh = [];
    for (const a of alerts) {
      const key = `hotl:alerted:${a.id}`;
      try { if (sessionStorage.getItem(key)) continue; sessionStorage.setItem(key, "1"); } catch { continue; }
      fresh.push(a);
    }
    if (fresh.length) showSalePushes(fresh);
  }, [alerts, holo.alertBrowser, holo.pushSubscribed]);
  useEffect(() => {
    if (!holo.alertBrowser || !holo.pushSubscribed) return;
    syncPushPrefs({ watch: holo.saleWatch || [], leadDays: holo.alertLead || 7, allSales: !!holo.alertAll });
  }, [holo.alertBrowser, holo.pushSubscribed, holo.saleWatch, holo.alertLead, holo.alertAll]);
  return null;
}

export function SaleAlertStrip({ go }) {
  const { alerts } = useSaleAlertFeed();
  if (!alerts.length) return null;
  return (
    <div className="glass pad mkt-pulse" role="status">
      <div className="micro cy">Sale alerts</div>
      {alerts.slice(0, 3).map((a) => <div key={a.id} className="body">{alertCopy(a).title} · {a.name}, {a.state}</div>)}
      <Button className="btn ghost sm" onClick={() => go("calendar")}>Open sale calendar</Button>
    </div>
  );
}

export default function SaleCalendar({ go }) {
  const { holo, patchHolo } = useStore();
  const { events, alerts, today } = useSaleAlertFeed();
  const [cursor, setCursor] = useState(() => { const n = new Date(); return { y: n.getFullYear(), m: n.getMonth() }; });
  const [picked, setPicked] = useState(today);
  const [stateFilter, setStateFilter] = useState("");
  const watch = new Set(holo.saleWatch || []);
  const cells = monthMatrix(cursor.y, cursor.m);
  const label = new Date(cursor.y, cursor.m, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const inMonth = events.filter((e) => e.iso.startsWith(`${cursor.y}-${String(cursor.m + 1).padStart(2, "0")}`) && (!stateFilter || e.state === stateFilter));
  const byDay = new Map();
  for (const e of inMonth) {
    const list = byDay.get(e.iso) || [];
    list.push(e);
    byDay.set(e.iso, list);
  }
  const dayEvents = events.filter((e) => e.iso === picked && (!stateFilter || e.state === stateFilter));
  const states = [...new Set(events.map((e) => e.state))].sort();
  const toggleWatch = (key) => patchHolo((h) => {
    const cur = new Set(h.saleWatch || []);
    if (cur.has(key)) cur.delete(key); else cur.add(key);
    return { saleWatch: [...cur] };
  });
  const [pushNote, setPushNote] = useState(null);
  async function enableBrowser() {
    const res = await enablePush({ watch: holo.saleWatch || [], leadDays: holo.alertLead || 7, allSales: !!holo.alertAll });
    setPushNote(res.message);
    if (res.ok) patchHolo(() => ({ alertBrowser: true, pushSubscribed: !!res.subscribed }));
  }

  return (
    <div className="materialize">
      <SecHead ix="08" title="Calendar" sub="Sale dates on file" right={<span className="chip num">{events.length} dates</span>} />
      <ScreenLead does="List sale dates that are already on file, and the alerts you turned on." leads="That county's file. A derived date is labeled derived. An alert is not a listing." />
      <div className="mkt-banner" role="status">A day stays empty when no sale date is on file. Derived dates come from a state sale cycle, not a page opened for that county. Push is a system notification for those dates. It is sent only after you allow it. No email or text is sent.</div>
      <div className="row wrap" style={{ gap: 8 }}>
        <label className="micro">Alert lead
          <select className="input" aria-label="Alert lead time" style={{ marginLeft: 8, maxWidth: 160 }} value={holo.alertLead || 7} onChange={(e) => patchHolo(() => ({ alertLead: Number(e.target.value) }))}>
            <option value={1}>1 day</option>
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
          </select>
        </label>
        <label className="row"><input type="checkbox" checked={!!holo.alertAll} onChange={(e) => patchHolo(() => ({ alertAll: e.target.checked }))} /> Alert for every sale on file, not only watched counties</label>
        <Button className="btn ghost sm" type="button" onClick={enableBrowser}>{holo.alertBrowser ? (holo.pushSubscribed ? "Push subscribed" : "Notifications on") : "Turn on notifications"}</Button>
        {pushNote && <span className="faint">{pushNote}</span>}
        <label className="micro">State
          <select className="input" aria-label="Filter state" style={{ marginLeft: 8, maxWidth: 120 }} value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}>
            <option value="">All</option>
            {states.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
      </div>

      {!!alerts.length && (
        <div className="glass pad col">
          <div className="micro cy">Due inside your lead time</div>
          {alerts.map((a) => {
            const copy = alertCopy(a);
            return (
              <div key={a.id} className="row between wrap" style={{ gap: 8 }}>
                <div><b>{copy.title}</b><div className="faint">{copy.body}</div></div>
                <Button className="btn ghost sm" onClick={() => { setPicked(a.iso); const [y, m] = a.iso.split("-"); setCursor({ y: Number(y), m: Number(m) - 1 }); }}>Show on calendar</Button>
              </div>
            );
          })}
        </div>
      )}

      <div className="row between wrap">
        <Button className="btn ghost sm" onClick={() => setCursor((c) => c.m === 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m: c.m - 1 })} aria-label="Previous month">Previous month</Button>
        <div className="h3">{label}</div>
        <Button className="btn ghost sm" onClick={() => setCursor((c) => c.m === 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m: c.m + 1 })} aria-label="Next month">Next month</Button>
      </div>
      <div className="sale-cal" role="grid" aria-label={label}>
        {WEEK.map((d) => <div key={d} className="dow">{d}</div>)}
        {cells.map((iso, i) => {
          const list = iso ? (byDay.get(iso) || []) : [];
          const derived = list.filter((e) => e.level === "DERIVED" && e.kind === "sale");
          const rest = list.filter((e) => !(e.level === "DERIVED" && e.kind === "sale"));
          return (
            <Button key={iso || `b${i}`} type="button" className={`sale-day ${iso === today ? "today" : ""} ${iso === picked ? "on" : ""}`} disabled={!iso} onClick={() => iso && setPicked(iso)} aria-pressed={iso === picked} aria-label={iso ? `${fmtDate(iso)}, ${list.length} dates` : "Empty"}>
              {iso && <span className="num">{Number(iso.slice(8))}</span>}
              {derived.length > 0 && <span className="sale-pill am">{derived.length} derived</span>}
              {rest.slice(0, 2).map((e) => <span key={e.id} className={`sale-pill ${e.kind === "registration" ? "cy" : e.level === "LIVE" ? "gr" : ""}`}>{e.name}</span>)}
              {rest.length > 2 && <span className="faint">+{rest.length - 2}</span>}
            </Button>
          );
        })}
      </div>

      <div className="glass pad col">
        <div className="micro">{picked ? fmtDate(picked) : "Pick a day"}</div>
        {!dayEvents.length && <div className="empty">No sale date or registration deadline on file for this day.</div>}
        {dayEvents.map((e) => (
          <div key={e.id} className="row between wrap" style={{ gap: 8 }}>
            <div>
              <b>{e.name} County, {e.state}</b>
              <div className="faint">{e.kind === "registration" ? "Registration deadline" : `${e.instrument} sale`} · {e.level === "DERIVED" ? "Derived" : e.level === "LIVE" ? "Live correction" : "On file"}{e.days != null ? ` · ${e.days < 0 ? `${-e.days}d ago` : e.days === 0 ? "today" : `${e.days}d`}` : ""}</div>
              {e.note && <div className="faint">{e.note}</div>}
            </div>
            <div className="row wrap" style={{ gap: 6 }}>
              <Button className={`chip btn-chip ${watch.has(e.key) ? "cy" : ""}`} onClick={() => toggleWatch(e.key)} aria-pressed={watch.has(e.key)}>{watch.has(e.key) ? "Watching this date" : "Watch this date"}</Button>
              <Button className="btn ghost sm" onClick={() => go("counties", { focus: e.countyId })}>Open this county file</Button>
            </div>
          </div>
        ))}
      </div>
      <Button className="btn ghost sm" onClick={() => go("auction")}><Icon n="bolt" s={14} /> Open the sale screen</Button>
    </div>
  );
}
