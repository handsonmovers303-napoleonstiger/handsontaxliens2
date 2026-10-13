import React from "react";
import { usGeometry, frame } from "../geo";
import { money } from "../data";
import { Label } from "./Evidence";
import { Icon } from "../ui";
import { Button, InteractiveCard } from "../ds";
import { tigerBrief } from "../tigerMaster";

/** The county's own outline, drawn from its boundary. */
export function Silhouette({ fips, size = 64, glow }) {
  const g = usGeometry().byFips.get(fips);
  if (!g) return <div style={{ width: size, height: size }} />;
  return (
    <svg viewBox={frame(g.b, 0.1, 1)} width={size} height={size} aria-hidden="true" style={{ flex: "0 0 auto" }}>
      <path d={g.d} fill="rgba(67,133,255,.16)" stroke={glow ? "#00DDF5" : "#4385FF"} strokeWidth={0.6} vectorEffect="non-scaling-stroke" style={glow ? { filter: "drop-shadow(0 0 4px #00DDF5)" } : null} />
    </svg>
  );
}

const TONE = { ok: "gr", warn: "am", cy: "cy", prov: "", none: "" };
const lead = (line) => (line ? line.split(" · ")[0] : null);

export function CountyCard({ d, selected, watched, onOpen, onWatch }) {
  const { s, sale, inventory, otc, status, lastCheck, saleType, market, auction, tiger } = d;
  const pop = lead(market && market.population);
  const metro = market && market.metro ? market.metro.split(" · ").slice(0, 2).join(" · ") : null;
  const median = lead(market && market.median);
  const vacancy = lead(market && market.vacancy);
  return (
    <InteractiveCard
      className="county"
      variant={selected ? "selected" : "default"}
      onClick={() => onOpen()}
      icon={<Silhouette fips={s.fips} glow={selected} />}
      title={`${s.name} County`}
      subtitle={<>{s.stateName} · <Button className="linkish" onClick={() => onOpen("sale_type")}>{saleType.value ? saleType.display : "Sale type not checked"}</Button></>}
      badge={<span className={`chip ${TONE[status[1]]}`} style={{ fontSize: 10 }}>{status[0]}</span>}
      actions={<>
        <Button variant="primary" size="sm" onClick={() => onOpen()}>Open this county file</Button>
        <Button variant="secondary" size="sm" pressed={watched} onClick={onWatch} aria-pressed={watched} iconLeft={<Icon n="star" s={13} fill={watched ? "currentColor" : "none"} />}>{watched ? "Stop watching this county" : "Watch this county"}</Button>
      </>}
    >
      <div className="icard-terrain" aria-hidden="true" />
      <dl className="icard-dl">
        <dt>Next documented sale</dt><dd>{sale.value ? <>{sale.value} <Label f={sale} /></> : auction && auction.saleDate ? <>{auction.saleDate} <span className="faint">· copied from the county page, not read</span></> : <>{sale.display.split(" · ")[0]} <Label f={sale} /></>}</dd>
        <dt>Inventory</dt><dd>{inventory.text} <span className="faint">· {inventory.sub}</span></dd>
        {auction && auction.inventory && inventory.text === "No list on file" && <><dt>Sale list link</dt><dd>{auction.inventory} <span className="faint">· on the fetched page, not downloaded</span></dd></>}
        {auction && auction.platform && <><dt>Platform</dt><dd>{auction.platform} <span className="faint">· named on the fetched page</span></dd></>}
        {auction && auction.cadence && <><dt>Auction frequency</dt><dd>{auction.cadence} <span className="faint">· copied from the county page</span></dd></>}
        {auction && auction.deadline && <><dt>Registration deadline</dt><dd>{auction.deadline} <span className="faint">· copied from the county page, not read</span></dd></>}
        {auction && auction.deposit && <><dt>Deposit</dt><dd>{auction.deposit} <span className="faint">· copied from the county page</span></dd></>}
        <dt>OTC</dt><dd>{otc.value === "available" ? "Documented" : otc.value === "likely" ? "Likely, not confirmed" : "Not checked"} <Label f={otc} /></dd>
        {pop && <><dt>Population</dt><dd className="num" title={market.population}>{pop} <span className="faint">· Census</span></dd></>}
        {metro && <><dt>Rural / metro</dt><dd title={market.metro}>{metro}</dd></>}
        {median && <><dt>Median value</dt><dd className="num" title={market.median}>{median} <span className="faint">· not a parcel value</span></dd></>}
        {vacancy && <><dt>Vacancy</dt><dd title={market.vacancy}>{vacancy}</dd></>}
        <dt>Last source check</dt><dd className="num">{lastCheck || (market && market.population ? "Census file on this county" : "Not yet checked")}</dd>
        {tiger && tiger.present && <><dt>Tiger</dt><dd>{tiger.chip}{tiger.reason ? <span className="faint"> · {tigerBrief(tiger.reason)}</span> : null}{tiger.inventoryN ? <span className="faint"> · {tiger.inventoryN.toLocaleString()} rows counted by Tiger, not loaded</span> : null}{tiger.stateInterest ? <span className="faint"> · {tigerBrief(tiger.stateInterest, 80)}</span> : null}</dd></>}
      </dl>
    </InteractiveCard>
  );
}

export function PropertyCard({ d, selected, watched, onMission, inMission, onOpen, onWatch, photo }) {
  const { p, sale, issue, dd, amountLabel } = d;
  return (
    <InteractiveCard
      className="property"
      variant={selected ? "selected" : issue && issue[1] === "bad" ? "warning" : "default"}
      onClick={onOpen}
      image={<div className="pcard-anchor">{photo ? <><img src={photo.thumb} alt={`${photo.cat} photo`} /><span className="pcard-cap">{photo.cat} · {photo.time.slice(0, 10)} · field photo{photo.fix ? ` · ±${photo.fix.acc}m` : ""}</span></> : <span className="faint" style={{ fontSize: 11 }}><Icon n="pin" s={13} /> {d.record?.location.geometryStatus === "not_on_file" ? "Location not on file" : "No field photo on file"}</span>}</div>}
      title={<span style={{ fontSize: 15 }}>{p.label}</span>}
      subtitle={<span className="num">APN {p.apn} · {p.county}, {p.state}</span>}
      actions={<>
        <Button variant="primary" size="sm" onClick={onOpen}>Open this property file</Button>
        <Button variant="secondary" size="sm" pressed={watched} onClick={onWatch} aria-pressed={watched} iconLeft={<Icon n="star" s={13} fill={watched ? "currentColor" : "none"} />}>{watched ? "Stop watching this parcel" : "Watch this parcel"}</Button>
        <Button variant="secondary" size="sm" pressed={inMission} onClick={onMission} aria-pressed={inMission} iconLeft={<Icon n={inMission ? "check" : "plus"} s={13} />}>{inMission ? "Remove from the mission" : "Save to a mission"}</Button>
      </>}
    >
      <dl className="icard-dl">
        <dt>{amountLabel}</dt><dd className="num">{p.amount != null ? money(p.amount) : "Not on list"}</dd>
        <dt>Acreage · type</dt><dd>{p.acres ? `${p.acres} ac` : "—"} · {p.kind || p.traits[0] || "—"}</dd>
        <dt>Sale status</dt><dd>{sale.value ? `Next sale ${sale.value}` : "No documented date"} <Label f={sale} /></dd>
        <dt>Due diligence</dt><dd className="num">{d.record ? `${d.record.dueDiligence.summary.checked} checked · ${d.record.dueDiligence.summary.unknown} unknown${d.record.dueDiligence.summary.stopUnresolved ? ` · ${d.record.dueDiligence.summary.stopUnresolved} STOP unresolved` : ""}` : `${dd.done}/${dd.total} checks done`}</dd>
      </dl>
      {issue && <div className={`issue issue-${issue[1]}`}><Icon n="flag" s={13} /> {issue[0]}</div>}
    </InteractiveCard>
  );
}
