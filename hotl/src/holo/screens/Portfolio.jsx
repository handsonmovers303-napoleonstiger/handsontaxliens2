import React, { useMemo, useState } from "react";
import { trackFor } from "../../legacy/ScoutingDept.jsx";
import { money, moneyShort, fmtDate } from "../data";
import { useStore, useToast } from "../store";
import { Icon, ScreenLead, SecHead, Src, Stat } from "../ui";
import { Button, InteractiveCard } from "../ds";

export const OUT = {
  acquired: ["Active", "var(--cyan)", "cy"], redeemed: ["Redeemed", "var(--emerald)", "gr"], foreclosed: ["Foreclosed / deed", "var(--gold)", "gd"],
  passed: ["Passed", "var(--ink-3)", ""], missed: ["Missed", "var(--amber)", "am"],
};
export const kindOf = (pos) => { const a = String(pos.actual || "").toLowerCase(); return a.startsWith("redeem") ? "redeemed" : /deed|foreclos/.test(a) ? "foreclosed" : a.startsWith("pass") ? "passed" : a.startsWith("miss") ? "missed" : "acquired"; };
const today = () => new Date().toISOString().slice(0, 10);
const years = (a, b) => Math.max(0, (new Date(b + "T12:00:00") - new Date(a + "T12:00:00")) / (365.25 * 86400000));

/** Everything the timeline shows about one position, computed from what you entered and the verified statute. */
export function positionView(pos) {
  const kind = kindOf(pos);
  const t = trackFor(pos);
  const bid = Number(pos.bid) || 0, rate = Number(pos.rate) || 0;
  const end = pos.resolvedAt || today();
  const eligible = kind === "acquired" && t.ok && today() >= t.opens;
  return {
    kind, t, eligible, bid, rate,
    current: kind === "acquired" && rate && bid ? bid * rate / 100 * years(pos.date, today()) : null,
    projected: kind === "acquired" && rate && bid && t.ok ? bid * rate / 100 * years(pos.date, t.opens) : null,
    actual: pos.realized != null && pos.realized !== "" ? Number(pos.realized) : null,
    end,
  };
}

export default function Portfolio({ go }) {
  const { positions, setPositions } = useStore();
  const toast = useToast();
  const [sel, setSel] = useState(null);
  const [edit, setEdit] = useState(null);
  const rows = useMemo(() => positions.map((p, i) => ({ p, i, v: positionView(p) })), [positions]);
  const dated = rows.filter((r) => r.p.date);
  const t0 = dated.length ? dated.reduce((m, r) => (r.p.date < m ? r.p.date : m), dated[0].p.date) : today();
  const t1 = dated.reduce((m, r) => { const e = r.v.t.ok ? r.v.t.opens : r.p.date; return e > m ? e : m; }, today());
  const span = Math.max(1, new Date(t1) - new Date(t0));
  const x = (iso) => 3 + ((new Date(iso) - new Date(t0)) / span) * 94;
  const active = rows.filter((r) => r.v.kind === "acquired");
  const deployed = active.reduce((a, r) => a + r.v.bid, 0);
  const accrued = active.reduce((a, r) => a + (r.v.current || 0), 0);
  const projected = active.reduce((a, r) => a + (r.v.projected || 0), 0);
  const realized = rows.reduce((a, r) => a + (r.v.actual || 0), 0);
  const cur = sel != null ? rows.find((r) => r.i === sel) : null;
  const ticks = useMemo(() => { const out = []; const d = new Date(t0); d.setMonth(0, 1); while (d <= new Date(t1)) { if (d >= new Date(t0)) out.push(d.toISOString().slice(0, 10)); d.setFullYear(d.getFullYear() + 1); } return out; }, [t0, t1]);

  return (
    <div className="materialize">
      <SecHead ix="08" title="Portfolio" sub="Track what you hold" right={<Button className="btn sm" onClick={() => setEdit({ new: true, address: "", county: "", state: "", bid: "", face: "", rate: "", date: today(), actual: "" })}><Icon n="plus" s={14} /> Add a certificate I hold</Button>} />
      <ScreenLead does="Track bids and certificates you entered, and the redemption clock you calculated." leads="Sell this holding, which opens a certificate draft. The position is not proof you can sell it." />
      <div className="grid g4">
        <Stat icon="bolt" v={moneyShort(deployed)} l="Active capital" n={`${active.length} active positions`} />
        <Stat icon="trend" v={accrued ? moneyShort(accrued) : "—"} l="Current return" n="accrued at your stated rates" tone={accrued ? "var(--cyan-2)" : undefined} />
        <Stat icon="target" v={projected ? moneyShort(projected) : "—"} l="Projected return" n="if held to the redemption deadline" />
        <Stat icon="check" v={realized ? moneyShort(realized) : "—"} l="Actual return" n="realized, recorded" tone={realized ? "var(--emerald)" : undefined} />
      </div>

      <div className="projection" style={{ padding: 16, marginTop: 12 }}>
        <div className="row between"><div className="micro cy">Redemption timeline</div><div className="row wrap" style={{ gap: 10, fontSize: 11 }}>
          <span className="row" style={{ gap: 5 }}><i className="tl-obj active" style={{ position: "static", transform: "none", width: 10, height: 10 }} /> Active</span>
          <span className="row" style={{ gap: 5 }}><i className="tl-obj redeemed" style={{ position: "static", transform: "none", width: 10, height: 10, animation: "none" }} /> Redeemed</span>
          <span className="row" style={{ gap: 5 }}><i className="tl-obj eligible" style={{ position: "static", transform: "none", width: 10, height: 10 }} /> Foreclosure eligible</span>
        </div></div>
        {rows.length ? (
          <div style={{ overflowX: "auto" }}>
            <div className="tl" style={{ minWidth: 560, height: Math.max(170, 40 + rows.length * 26) }}>
              <div className="tl-axis" style={{ top: "auto", bottom: 22 }} />
              {ticks.map((d) => <div key={d} style={{ position: "absolute", left: `${x(d)}%`, bottom: 4, fontSize: 10, color: "var(--ink-4)", transform: "translateX(-50%)" }} className="num">{d.slice(0, 4)}</div>)}
              <div style={{ position: "absolute", left: `${x(today())}%`, top: 0, bottom: 22, width: 1, background: "rgba(243,196,91,.5)" }} title="Today" />
              {rows.map((r, k) => { const y = 16 + k * 26; const cls = r.v.kind === "redeemed" ? "redeemed" : r.v.eligible ? "eligible" : r.v.kind === "acquired" ? "active" : "closed";
                const endIso = r.v.kind === "acquired" ? (r.v.t.ok ? r.v.t.opens : today()) : r.v.end;
                return <React.Fragment key={r.i}>
                  {r.p.date && <div style={{ position: "absolute", left: `${x(r.p.date)}%`, width: `${Math.max(.5, x(endIso) - x(r.p.date))}%`, top: y - 1, height: 2, background: `linear-gradient(90deg, ${OUT[r.v.kind][1]}, transparent)`, opacity: .7 }} />}
                  {r.p.date && <Button className={`tl-obj ${cls} ${sel === r.i ? "on" : ""}`} style={{ left: `${x(r.p.date)}%`, top: y }} onClick={() => setSel(r.i)} aria-label={r.p.address} title={r.p.address} />}
                  {r.v.t.ok && r.v.kind === "acquired" && <div style={{ position: "absolute", left: `${x(r.v.t.opens)}%`, top: y - 6, width: 2, height: 12, background: "var(--gold)", boxShadow: "0 0 8px var(--gold)" }} title={`Deadline ${r.v.t.opens}`} />}
                </React.Fragment>; })}
            </div>
          </div>) : <div className="empty" style={{ marginTop: 10 }}>No positions yet. Win one from the auction center, or add one here.</div>}
      </div>

      <div className="grid g2" style={{ marginTop: 12 }}>
        {cur ? (
          <div className={`glass pad materialize ${cur.v.eligible ? "cs-high" : cur.v.kind === "redeemed" ? "cs-captured" : cur.v.kind === "acquired" ? "cs-verified" : ""}`} key={cur.i}>
            <div className="row between wrap" style={{ gap: 6 }}><div><div className="micro cy">Position</div><div className="h3">{cur.p.address}</div><div className="faint" style={{ fontSize: 12 }}>{cur.p.county}</div></div>
              <span className={`chip ${cur.v.eligible ? "gd" : OUT[cur.v.kind][2]}`}>{cur.v.eligible ? "Foreclosure eligible" : OUT[cur.v.kind][0]}</span></div>
            <div className="kv" style={{ marginTop: 8 }}>
              <div>Purchase date</div><div className="num">{cur.p.date ? fmtDate(cur.p.date) : "—"}</div>
              <div>Purchase price</div><div className="num">{money(cur.v.bid || null)}</div>
              <div>Certificate value</div><div className="num">{cur.p.face ? money(Number(cur.p.face)) : "Not recorded"}</div>
              <div>Interest rate</div><div className="num">{cur.v.rate ? `${cur.v.rate}%` : "Not recorded"}</div>
              <div>Redemption deadline</div><div>{cur.v.t.ok ? `${fmtDate(cur.v.t.opens)} · ${cur.v.t.wording}` : cur.v.t.why}</div>
              <div>Foreclosure eligibility</div><div>{cur.v.t.ok ? (cur.v.eligible ? "Window open now" : cur.v.kind === "acquired" ? `Opens in ${cur.v.t.daysLeft} days` : "—") : "Unknown"}</div>
              <div>Status</div><div>{OUT[cur.v.kind][0]}</div>
              <div>Current return</div><div className="num">{cur.v.current != null ? money(cur.v.current) : "—"}</div>
              <div>Projected return</div><div className="num">{cur.v.projected != null ? money(cur.v.projected) : "—"}</div>
              <div>Actual return</div><div className="num">{cur.v.actual != null ? money(cur.v.actual) : "—"}</div>
            </div>
            <div className="row wrap" style={{ gap: 8, marginTop: 10 }}>
              <Button className="btn ghost sm" onClick={() => setEdit({ ...cur.p, _i: cur.i })}>Record what happened</Button>
              <Button className="btn ghost sm" disabled={cur.v.kind !== "acquired"} onClick={() => go?.("market", { tab: "sell", prefill: prefillFromPosition(cur) })}>Start a sale draft for this</Button>
            </div>
            <Src>Sell this holding opens a certificate draft. The position itself is not proof of ownership or that the certificate can be assigned. Returns are simple interest at the rate you entered; state penalties, subsequent taxes and fees are not included. Deadlines come from the verified statute for that state. Not financial, legal, or tax advice.</Src>
          </div>) : <div className="empty">Select a position on the timeline.</div>}
        <div className="tactical col scroll" style={{ padding: 14, gap: 6, maxHeight: 420 }}>
          <div className="micro">Ledger</div>
          {rows.map((r) => (
            <InteractiveCard key={r.i} className={`list-item ${sel === r.i ? "on" : ""}`} onClick={() => setSel(r.i)}>
              <span className={`chip ${r.v.eligible ? "gd" : OUT[r.v.kind][2]}`} style={{ minWidth: 84, justifyContent: "center" }}>{r.v.eligible ? "Eligible" : OUT[r.v.kind][0]}</span>
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.p.address}</div><div className="faint" style={{ fontSize: 11 }}>{r.p.county} · {r.p.date}</div></div>
              <span className="num">{money(r.v.bid || null)}</span>
            </InteractiveCard>))}
          {!rows.length && <div className="faint" style={{ fontSize: 12 }}>Empty.</div>}
        </div>
      </div>

      {edit && <PositionEditor rec={edit} onClose={() => setEdit(null)} onSave={(r, e) => {
        setPositions((ps) => {
          const clean = { address: r.address, county: r.new ? `${r.county || r.state}, ${String(r.state || "").toUpperCase()}` : r.county, bid: Number(r.bid) || 0, face: r.face === "" ? null : Number(r.face), rate: r.rate === "" ? null : Number(r.rate),
            date: r.date, snapshot: r.snapshot || { edge: null, research: null, unknowns: null, expected: "redemption" }, actual: r.actual || null,
            realized: r.realized === "" || r.realized == null ? null : Number(r.realized), lesson: r.lesson || null, resolvedAt: r.actual ? (r.resolvedAt || today()) : null, parcelId: r.parcelId || null };
          if (r.new) return [clean, ...ps];
          const next = [...ps]; next[r._i] = { ...ps[r._i], ...clean }; return next;
        });
        setEdit(null); toast(r.actual === "redeemed" ? "Redeemed · outcome recorded" : "Saved", { x: e.clientX, y: e.clientY });
      }} />}
    </div>
  );
}

function prefillFromPosition(cur) {
  const raw = String(cur.p.county || "");
  const match = raw.match(/^(.*),\s*([A-Za-z]{2})$/);
  return {
    portfolioRef: String(cur.i),
    state: (match ? match[2] : "").toUpperCase(),
    countyName: match ? match[1] : raw,
    address: cur.p.address || "",
    principalDollars: cur.p.face ? String(cur.p.face) : "",
    acquisitionDate: cur.p.date || "",
  };
}

function PositionEditor({ rec, onSave, onClose }) {
  const [r, setR] = useState({ ...rec, face: rec.face ?? "", rate: rec.rate ?? "", realized: rec.realized ?? "" });
  const set = (k) => (e) => setR({ ...r, [k]: e.target.value });
  return (
    <div className="sheet" onClick={onClose}>
      <div className="tactical materialize col" style={{ width: "min(540px, 100%)", padding: 16 }} onClick={(e) => e.stopPropagation()}>
        <div className="row between"><div className="micro cy">{rec.new ? "New position" : "Position"}</div><Button className="btn quiet sm" onClick={onClose} aria-label="Close"><Icon n="x" s={14} /></Button></div>
        <input id="pos-address" className="input" placeholder="Property / certificate" value={r.address} onChange={set("address")} />
        {rec.new ? <div className="grid g2" style={{ gap: 8 }}><input id="pos-county" className="input" placeholder="County" value={r.county} onChange={set("county")} /><input id="pos-state" className="input" placeholder="State (e.g. FL)" maxLength={2} value={r.state} onChange={set("state")} /></div>
          : <div className="dim" style={{ fontSize: 12.5 }}>{rec.county}</div>}
        <div className="grid g2" style={{ gap: 8 }}>
          <label className="col" style={{ gap: 4 }}><span className="micro">Purchase price $</span><input id="pos-bid" className="input" type="number" value={r.bid} onChange={set("bid")} /></label>
          <label className="col" style={{ gap: 4 }}><span className="micro">Purchase date</span><input id="pos-date" className="input" type="date" value={r.date} onChange={set("date")} /></label>
          <label className="col" style={{ gap: 4 }}><span className="micro">Certificate value $</span><input id="pos-face" className="input" type="number" value={r.face} onChange={set("face")} /></label>
          <label className="col" style={{ gap: 4 }}><span className="micro">Interest rate %</span><input id="pos-rate" className="input" type="number" value={r.rate} onChange={set("rate")} /></label>
        </div>
        <div className="micro">Status</div>
        <div className="row wrap" style={{ gap: 6 }}>
          {[["", "Active"], ["redeemed", "Redeemed"], ["foreclosed", "Foreclosed / deed"], ["passed", "Passed"], ["missed", "Missed"]].map(([k, l]) =>
            <Button key={k} className={`chip btn-chip ${(r.actual || "") === k ? "cy" : ""}`} onClick={() => setR({ ...r, actual: k })}>{l}</Button>)}
        </div>
        <label className="col" style={{ gap: 4 }}><span className="micro">Actual return $ (interest, penalty or resale net)</span><input id="pos-real" className="input" type="number" value={r.realized} onChange={set("realized")} /></label>
        <textarea id="pos-lesson" className="input" rows={3} placeholder="Lesson learned: what would you do differently?" value={r.lesson || ""} onChange={set("lesson")} />
        <Button className="btn" disabled={!r.address || (rec.new && !r.state)} onClick={(e) => onSave(r, e)}><Icon n="check" s={16} /> Save this certificate</Button>
        <Src>Saved into the same positions ledger the Scouting Department's long board reads.</Src>
      </div>
    </div>
  );
}
