import React, { useEffect, useMemo, useState } from "react";
import { allProperties, money } from "../data";
import { search } from "../../quantum/engine";
import { statuteSources } from "../../quantum/evidence";
import { TIERS } from "../../quantum/core";
import { rulesFor } from "../../legacy/ScoutingDept.jsx";
import { BRANCHES, itemById, stateOf, STATES } from "../intel";
import { useStore, useToast } from "../store";
import { FactRow, Label } from "./Evidence";
import { Silhouette } from "./Cards";
import { countyCard, propertyDossier, propertyCard, supported, ctxBase } from "./model";
import { Icon, Tabs, Src, Bar } from "../ui";
import { Button, InteractiveCard } from "../ds";
import { linkChip } from "../linkCheck";

const Section = ({ title, children, note }) => (
  <section className="dz-sec"><div className="micro cy">{title}</div>{note && <div className="faint" style={{ fontSize: 11.5, marginTop: 2 }}>{note}</div>}<div style={{ marginTop: 6 }}>{children}</div></section>
);
function SourceList({ facts, extra = [] }) {
  const srcs = []; for (const f of facts) for (const o of f.evidence || []) if (!srcs.some((s) => s.id === o.source.id)) srcs.push({ ...o.source, fields: facts.filter((g) => (g.evidence || []).some((x) => x.source.id === o.source.id)).map((g) => g.label) });
  for (const s of extra) if (!srcs.some((x) => x.id === s.id)) srcs.push({ ...s, fields: ["State rules"] });
  srcs.sort((a, b) => a.tier - b.tier);
  return (
    <div className="col" style={{ gap: 6 }}>
      {srcs.map((s) => (
        <div key={s.id} className="src-line">
          <span className="chip" style={{ fontSize: 9.5 }}>{TIERS[s.tier].short}</span>
          <div style={{ minWidth: 0 }}>
            {s.url ? <a href={s.url} target="_blank" rel="noreferrer">{s.label} ↗</a> : <span>{s.label} <span className="faint">(no link on file)</span></span>}
            <div className="faint" style={{ fontSize: 11 }}>{s.agency} · {s.method} · retrieved {s.accessed || "—"} · supports: {s.fields.slice(0, 4).join(", ")}</div>
          </div>
        </div>))}
      {!srcs.length && <div className="empty">No sources on file yet.</div>}
    </div>
  );
}

/* ----------------------------------- county ----------------------------------- */
export function CountyDossier({ s, onClose, onPickParcel, onQuery }) {
  const { holo, patchHolo, stars, toggleStar } = useStore();
  const toast = useToast();
  const ctx = useMemo(() => ctxBase(), []);
  const d = countyCard(s, ctx, holo);
  const { F, C } = d;
  const [tab, setTab] = useState("overview");
  const parcels = useMemo(() => allProperties().filter((p) => p.key === s.key), [s.key]);
  const R = rulesFor(s.state);
  const setStatus = (v, msg) => { patchHolo((h) => ({ countyStatus: { ...h.countyStatus, [s.id]: v } })); toast(msg); };
  const watched = !!stars[`county:${s.id}`];
  const watchedParcels = parcels.filter((p) => holo.mission.includes(p.id) || stars[`parcel:${p.id}`]);
  const allF = Object.values(F).filter(Boolean);

  return (
    <div className="dossier">
      <header className="dz-head">
        <Silhouette fips={s.fips} size={56} glow />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="micro cy">County dossier</div>
          <div className="h2" style={{ lineHeight: 1.15 }}>{s.name} County, {s.state}</div>
          <div className="row wrap" style={{ gap: 6, marginTop: 6 }}>
            <span className={`chip ${d.status[1] === "ok" ? "gr" : d.status[1] === "warn" ? "am" : d.status[1] === "cy" ? "cy" : ""}`}>{d.status[0]}</span>
            <span className="chip num">{d.supportedCount} of {d.total} fields source-supported</span>
          </div>
        </div>
        <Button className="btn quiet sm" onClick={onClose} aria-label="Close this file"><Icon n="x" s={14} /> Close this file</Button>
      </header>
      <div className="faint" style={{ fontSize: 11.5, margin: "6px 0 10px" }}>Research progress measures what has been checked. It is not a rating of the county as an investment.</div>
      <Tabs tabs={[["overview", "Overview"], ["rules", "Rules"], ["inventory", "Inventory"], ["auctions", "Auctions"], ["sources", "Sources"]]} on={tab} set={setTab} />
      <div className="dz-body materialize" key={tab}>
        {tab === "overview" && <>
          <Section title="At a glance">
            <FactRow f={F.sale_type} label="Sale type" />
            <FactRow f={F.sale_date} label="Next documented sale" />
            <FactRow f={F.delinquent_list} label="Inventory" />
            <FactRow f={F.otc_status} label="OTC" />
            <FactRow f={F.platform} label="Auction provider" />
          </Section>
          <Section title="How the data reaches us">
            <div className="row wrap" style={{ gap: 6 }}>{d.classes.map(([c, t, why]) => <span key={c} className={`chip ${t}`} title={why}>{c}</span>)}</div>
          </Section>
          <Section title="Research status" note="Set by you; separate from any finding.">
            <div className="row wrap" style={{ gap: 6 }}>
              <Button className="btn quiet sm" onClick={() => setStatus("investigating", "Marked researching")}>Mark this county researching</Button>
              <Button className="btn quiet sm" onClick={() => setStatus("review", "Marked for review")}>Mark this county for review</Button>
              <Button className="btn quiet sm" onClick={() => setStatus("captured", "Marked reviewed")}>Mark this county reviewed</Button>
              <Button className={`btn quiet sm ${watched ? "on" : ""}`} onClick={() => { toggleStar(`county:${s.id}`); toast(watched ? "Stopped watching" : "Watching county"); }}><Icon n="star" s={13} fill={watched ? "currentColor" : "none"} /> {watched ? "Stop watching this county" : "Watch this county"}</Button>
            </div>
          </Section>
          <Section title="Ask about this county">
            <div className="row wrap" style={{ gap: 6 }}>
              {[`Explain the documented sale process in ${s.name} County, ${s.state}`, `Show every source we have for ${s.name} County, ${s.state}`, `When is the ${s.name} County, ${s.state} tax sale?`].map((q) => <Button key={q} className="chip btn-chip cy" onClick={() => onQuery(q)}>{q.replace(` in ${s.name} County, ${s.state}`, "").replace(` for ${s.name} County, ${s.state}`, "").replace(`${s.name} County, ${s.state} `, "")}</Button>)}
            </div>
          </Section>
        </>}
        {tab === "rules" && <>
          {d.deed ? (
            <Section title="Tax-deed rules" note="A deed county sells the property, not a lien: there is no statutory interest rate. Return comes from resale.">
              <FactRow f={F.sale_type} label="Sale type" />
              <FactRow f={F.bid_method} label="Bidding" />
              <FactRow f={F.redemption} label="Redemption" />
              <FactRow f={F.foreclosure} label="Deed process" />
            </Section>
          ) : (
            <Section title="Tax-lien rules">
              <FactRow f={F.sale_type} label="Sale type" />
              <FactRow f={F.statutory_rate} label="Interest (maximum)" />
              <FactRow f={F.penalty} label="Penalty" />
              <FactRow f={F.bid_method} label="Bidding" />
              <FactRow f={F.redemption} label="Redemption" />
              <FactRow f={F.foreclosure} label="Foreclosure / deed" />
            </Section>)}
          <Section title="Statutory references" note={R.verified ? "Research information, not legal advice." : `${s.stateName} is not in the verified rulebook. Treat the rules above as leads.`}>
            <SourceList facts={[]} extra={statuteSources(s.state)} />
          </Section>
        </>}
        {tab === "inventory" && <>
          <Section title="Parcel inventory"><FactRow f={F.delinquent_list} label="Delinquent / sale list" /><FactRow f={F.historical_sales} label="Historical sales" /></Section>
          <Section title="OTC"><FactRow f={F.otc_status} label="OTC status" /><FactRow f={F.otc_rate_advertised} label="Advertised OTC rate" />
            <div className="faint" style={{ fontSize: 11.5, marginTop: 4 }}>An advertised rate is not a return. Actual certificate rate and effective return are set per certificate.</div></Section>
          <Section title={`Parcels on file · ${parcels.length.toLocaleString()}`} note={parcels.length ? "Select one to open its dossier." : "No parcel list is on file for this county."}>
            <div className="col" style={{ gap: 4 }}>
              {parcels.slice(0, 40).map((p) => (
                <InteractiveCard key={p.id} className="list-item" onClick={() => onPickParcel(p)}>
                  <div style={{ flex: 1, minWidth: 0 }}><div className="num" style={{ fontSize: 12.5, fontWeight: 700 }}>{p.apn}</div><div className="faint" style={{ fontSize: 11.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.label}</div></div>
                  <span className="num" style={{ fontSize: 12.5 }}>{p.amount != null ? money(p.amount) : "—"}</span>
                </InteractiveCard>))}
              {parcels.length > 40 && <Button className="btn quiet sm" onClick={() => onQuery(`parcels in ${s.name} County, ${s.state}`)}>See all {parcels.length.toLocaleString()} in results</Button>}
            </div>
          </Section>
        </>}
        {tab === "auctions" && <>
          <Section title="Sale events">
            <FactRow f={F.sale_date} label="Next documented sale" />
            {F.last_sale && <FactRow f={F.last_sale} label="Last sale held" />}
            <FactRow f={F.registration_deadline} label="Registration deadline" />
            <FactRow f={F.registration} label="Registration process" />
            <FactRow f={F.deposit} label="Deposit" />
            <FactRow f={F.platform} label="Designated provider" />
          </Section>
          <Section title={`Watched parcels · ${watchedParcels.length}`}>
            {watchedParcels.map((p) => <InteractiveCard key={p.id} className="list-item" onClick={() => onPickParcel(p)}><span className="num" style={{ fontWeight: 700 }}>{p.apn}</span><span className="faint" style={{ flex: 1, fontSize: 11.5 }}>{p.label}</span></InteractiveCard>)}
            {!watchedParcels.length && <div className="faint" style={{ fontSize: 12 }}>None yet. Watch or add parcels to your mission from their dossiers.</div>}
          </Section>
        </>}
        {tab === "sources" && <>
          <Section title="Official pages and datasets on file">
            <div className="col" style={{ gap: 4 }}>{C.links.map((l, i) => {
              const mark = linkChip(l.url, l.level);
              return <a key={i} href={l.url} target="_blank" rel="noreferrer" className="src-line" style={{ textDecoration: "none" }} title={mark.note}><span className={`chip ${mark.tone}`} style={{ fontSize: 9.5 }}>{mark.word}</span><span style={{ color: "var(--ink)" }}>{l.label}</span><span className="faint">{l.kind}</span></a>;
            })}
              {!C.links.length && <div className="faint" style={{ fontSize: 12 }}>No official links on file.</div>}</div>
          </Section>
          <Section title="Every source behind this dossier"><SourceList facts={allF} /></Section>
          <Section title="Contacts"><FactRow f={F.phone} label="Treasurer phone" /></Section>
        </>}
      </div>
    </div>
  );
}

/* ---------------------------------- property ---------------------------------- */
export function PropertyDossier({ p, onClose, onCounty, onQuery, go }) {
  const store = useStore();
  const { holo, patchHolo, dd, stars, toggleStar, photos, loadPhotosFor, addProperty, positions } = store;
  const toast = useToast();
  const [tab, setTab] = useState("overview");
  useEffect(() => { loadPhotosFor(p.id); }, [p.id, loadPhotosFor]);
  const ctx = useMemo(() => ctxBase(), []);
  const { P, C } = propertyDossier(p, ctx);
  const card = propertyCard(p, ctx, dd);
  const full = { ...ctx, dd, photos, holo: { ...holo, focusParcel: p.id }, positions };
  const where = `APN ${p.apn} in ${p.county} County, ${p.state}`;
  const title = useMemo(() => (search(`title risk for ${where}`, full).groups || [])[0], [p.id, JSON.stringify(dd[p.id] || {})]);
  const risk = useMemo(() => (search(`flood wildfire contamination wetlands legal access zoning structure risk for ${where}`, full).groups || [])[0], [p.id, JSON.stringify(dd[p.id] || {})]);
  const gaps = useMemo(() => search("What do we still not know?", full).gaps, [p.id, JSON.stringify(dd[p.id] || {}), JSON.stringify(holo.visits[p.id] || {})]);
  const F = P.F, CF = C.facts;
  const list = photos[p.id] || [];
  const visit = holo.visits[p.id];
  const pin = holo.pins[p.id];
  const inMission = holo.mission.includes(p.id);
  const watched = !!stars[`parcel:${p.id}`];
  const recs = dd[p.id] || {};
  const facts = [...Object.values(F), CF.sale_date, CF.sale_type, CF.registration_deadline, CF.platform, CF.deposit, CF.redemption, ...(title ? title.facts : []), ...(risk ? risk.facts : [])];
  const documented = facts.filter((f) => supported(f));
  const conflicts = facts.filter((f) => f.status === "CONFLICT" || f.status === "STALE");
  const unknown = facts.filter((f) => !supported(f) && f.status !== "CONFLICT" && f.status !== "STALE");
  const findings = BRANCHES.flatMap((b) => b.items).filter((id) => ["failed", "flagged"].includes(stateOf(recs[id]).id));

  return (
    <div className="dossier">
      <header className="dz-head">
        <div className="pcard-anchor" style={{ width: 88, height: 66, flex: "0 0 auto", margin: 0 }}>
          {list.length ? <img src={list[list.length - 1].thumb} alt={`${list[list.length - 1].cat} field photo, ${list[list.length - 1].time.slice(0, 10)}`} /> : <Icon n="pin" s={16} c="var(--ink-3)" />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="micro cy">Property dossier</div>
          <div className="h3" style={{ lineHeight: 1.25 }}>{p.label}</div>
          <div className="faint num" style={{ fontSize: 12 }}>APN {p.apn} · <Button className="linkish" onClick={onCounty}>Open the {p.county} County file</Button></div>
        </div>
        <Button className="btn quiet sm" onClick={onClose} aria-label="Close this file"><Icon n="x" s={14} /> Close this file</Button>
      </header>
      {card.issue && <div className={`issue issue-${card.issue[1]}`} style={{ marginTop: 8 }}><Icon n="flag" s={13} /> {card.issue[0]}</div>}
      <div className="row wrap" style={{ gap: 6, margin: "10px 0" }}>
        <Button className={`btn quiet sm ${watched ? "on" : ""}`} onClick={() => { toggleStar(`parcel:${p.id}`); toast(watched ? "Stopped watching" : "Watching parcel"); }}><Icon n="star" s={13} fill={watched ? "currentColor" : "none"} /> {watched ? "Stop watching this parcel" : "Watch this parcel"}</Button>
        <Button className={`btn quiet sm ${inMission ? "on" : ""}`} onClick={() => { patchHolo((h) => ({ mission: inMission ? h.mission.filter((x) => x !== p.id) : [...h.mission, p.id], focusParcel: p.id })); addProperty({ id: p.id, county: p.county, state: p.state, apn: p.apn, label: p.label, instrument: p.instrument || "lien" }); toast(inMission ? "Removed from mission" : "Added to mission"); }}><Icon n={inMission ? "check" : "plus"} s={13} /> {inMission ? "Remove from the mission" : "Save this parcel to a mission"}</Button>
      </div>
      <Tabs tabs={[["overview", "Overview"], ["tax", "Tax & Sale"], ["dd", "Due Diligence"], ["field", "Field Evidence"], ["sources", "Sources & History"]]} on={tab} set={setTab} />
      <div className="dz-body materialize" key={tab}>
        {tab === "overview" && <>
          <Section title={`What is documented · ${documented.length}`}>{documented.slice(0, 10).map((f) => <FactRow key={f.id} f={f} />)}{documented.length > 10 && <div className="faint" style={{ fontSize: 11.5 }}>+{documented.length - 10} more in the other tabs</div>}</Section>
          <Section title={`What conflicts · ${conflicts.length}`}>{conflicts.map((f) => <FactRow key={f.id} f={f} />)}{!conflicts.length && <div className="faint" style={{ fontSize: 12 }}>No comparable sources disagree.</div>}</Section>
          <Section title={`What remains unknown · ${unknown.length}`}><div className="row wrap" style={{ gap: 4 }}>{unknown.slice(0, 18).map((f) => <span key={f.id} className="chip" title={f.where || ""}>{f.label}</span>)}{unknown.length > 18 && <span className="faint">+{unknown.length - 18}</span>}</div></Section>
          <Section title="What to check next">
            <ol className="body" style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>{(gaps ? gaps.killers.filter((k) => k.state === "OPEN") : []).slice(0, 5).map((k) => <li key={k.id}><b>{k.label}</b> <span className="faint">· {itemById(k.id).where}</span></li>)}</ol>
          </Section>
          <Section title="Ask about this parcel">
            <div className="row wrap" style={{ gap: 6 }}>
              {[["What evidence is missing?", `What do we still not know about ${where}?`], ["Explain the documented sale process.", `How does the sale work in ${p.county} County, ${p.state}?`], ["Show conflicting records.", `Show every source we have for ${where}`], ["What should I verify during a field visit?", "Show parcels that need field verification"]].map(([l, q]) =>
                <Button key={l} className="chip btn-chip cy" onClick={() => { patchHolo(() => ({ focusParcel: p.id })); onQuery(q); }}>{l}</Button>)}
            </div>
          </Section>
        </>}
        {tab === "tax" && <>
          <Section title="Tax record"><FactRow f={F.amount} label={card.amountLabel} /><FactRow f={F.tax_year} /><FactRow f={F.penalties} /><FactRow f={F.interest} /><FactRow f={F.certificate} /><FactRow f={F.homestead} /></Section>
          <Section title="Ownership & values" note="Assessed values come from the list; an estimate is never a value.">
            <FactRow f={F.owner} /><FactRow f={F.owner_type} /><FactRow f={F.assessed_total} /><FactRow f={F.assessed_land} /><FactRow f={F.assessed_impr} /><FactRow f={F.market_estimate} />
          </Section>
          <Section title="Sale"><FactRow f={F.sale_status} /><FactRow f={CF.sale_date} label="Next documented sale" /><FactRow f={CF.sale_type} label="Sale type" /><FactRow f={CF.registration_deadline} label="Registration deadline" /><FactRow f={CF.deposit} label="Deposit" /><FactRow f={CF.platform} label="Provider" /><FactRow f={CF.redemption} label="Redemption" /></Section>
          <Section title="Location"><FactRow f={F.legal} /><FactRow f={F.acreage} /><FactRow f={F.property_type} /></Section>
        </>}
        {tab === "dd" && <>
          <Section title="Task completion" note="How much has been checked. A finished check can still reveal a serious problem.">
            {BRANCHES.map((b) => { const done = b.items.filter((id) => !["not_started", "researching", "evidence", "field"].includes(stateOf(recs[id]).id)).length;
              return <div key={b.id} className="row" style={{ gap: 8, fontSize: 12.5, padding: "3px 0" }}><span style={{ width: 130 }}>{b.label}</span><div style={{ flex: 1 }}><Bar pct={(done / b.items.length) * 100} color="linear-gradient(90deg, #4385FF, #00DDF5)" /></div><span className="num faint" style={{ width: 40, textAlign: "right" }}>{done}/{b.items.length}</span></div>; })}
          </Section>
          <Section title={`Findings · ${findings.length}`} note="Severity, separate from completion.">
            {findings.map((id) => { const s = stateOf(recs[id]); return <div key={id} className={`issue issue-${s.id === "failed" ? "bad" : "warn"}`} style={{ marginBottom: 6 }}><b>{s.label}</b>: {itemById(id).t}{recs[id].note ? ` · ${recs[id].note}` : ""}</div>; })}
            {!findings.length && <div className="faint" style={{ fontSize: 12 }}>No findings recorded yet.</div>}
          </Section>
          {title && <Section title="Title research" note="Not a title examination. “No record found” means none in the sources searched, never a clear title.">{title.facts.map((f) => <FactRow key={f.id} f={f} />)}</Section>}
          {risk && <Section title="Property risk" note="Mapped road frontage is not verified legal access.">{risk.facts.map((f) => <FactRow key={f.id} f={f} />)}</Section>}
          {go && <Button className="btn ghost sm" onClick={() => { patchHolo(() => ({ focusParcel: p.id })); go("board"); }}><Icon n="board" s={13} /> Open the checklist</Button>}
        </>}
        {tab === "field" && <>
          <Section title={`Photos · ${list.length}`}>
            <div className="row wrap" style={{ gap: 6 }}>{list.slice(-12).map((ph) => <figure key={ph.id} style={{ margin: 0 }}><img src={ph.thumb} alt={ph.cat} style={{ width: 96, height: 72, objectFit: "cover", borderRadius: 8, border: "1px solid rgba(67,133,255,.35)" }} /><figcaption className="faint" style={{ fontSize: 10 }}>{ph.cat} · {ph.time.slice(0, 10)}{ph.fix ? ` · ±${ph.fix.acc}m` : " · no GPS"}</figcaption></figure>)}</div>
            {!list.length && <div className="faint" style={{ fontSize: 12 }}>No field photos yet.</div>}
          </Section>
          <Section title="Visit & location">
            <div className="fact-row static"><span className="fact-k">Visit</span><span className="fact-v">{visit && visit.completed ? `Completed ${visit.completed}` : "Not visited"}</span><span className="fact-s" /></div>
            {visit && Object.entries(visit.obs || {}).filter(([, v]) => v).map(([k, v]) => <div key={k} className="fact-row static"><span className="fact-k">{k}</span><span className="fact-v">{v}</span><span className="fact-s"><span className="ev-label ev-ok">Field observation</span></span></div>)}
            <div className="fact-row static"><span className="fact-k">Location</span><span className="fact-v">{pin ? `${pin.lat.toFixed(5)}, ${pin.lon.toFixed(5)} ±${pin.acc}m` : "Not pinned"}</span><span className="fact-s" /></div>
          </Section>
          {go && <Button className="btn sm" onClick={() => { patchHolo(() => ({ focusParcel: p.id })); go("field"); }}><Icon n="cam" s={13} /> Record a site visit</Button>}
        </>}
        {tab === "sources" && <>
          <Section title="Every source behind this dossier"><SourceList facts={facts} /></Section>
          <Section title="Research log" note="Each check's state, who set it and when.">
            {Object.entries(recs).filter(([, r]) => r && r.date).sort((a, b) => String(b[1].date).localeCompare(String(a[1].date))).slice(0, 20).map(([id, r]) => { const it = itemById(id); return it ? <div key={id} className="fact-row static"><span className="fact-k num">{r.date}</span><span className="fact-v">{it.t}: {stateOf(r).label}{r.source ? ` · ${r.source}` : ""}</span><span className="fact-s faint">{r.by || ""}</span></div> : null; })}
            {!Object.values(recs).some((r) => r && r.date) && <div className="faint" style={{ fontSize: 12 }}>No research recorded yet.</div>}
          </Section>
        </>}
      </div>
    </div>
  );
}
