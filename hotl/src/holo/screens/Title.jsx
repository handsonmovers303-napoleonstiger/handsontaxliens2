import React, { useMemo, useState } from "react";
import { useStore } from "../store";
import { ScreenLead, SecHead } from "../ui";
import { useAllParcels } from "./Parcels";
import { TITLE_RESULTS, TITLE_STEPS, titleConclusion } from "../titleSearch";
import { titleStanding } from "../diligence";
import { allCounties } from "../data";
import { Button } from "../ds";

const today = () => new Date().toISOString().slice(0, 10);

export default function Title({ go }) {
  const { holo, patchHolo } = useStore();
  const all = useAllParcels();
  const [q, setQ] = useState("");
  const [id, setId] = useState(holo.focusParcel || "");
  const parcel = all.find((p) => p.id === id) || null;
  const saved = (holo.titleSearches && holo.titleSearches[id]) || {};
  const standing = titleStanding(saved, !!(holo.titleSkip || {})[id]);
  const matches = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const rows = needle ? all.filter((p) => `${p.apn} ${p.label} ${p.county} ${p.state}`.toLowerCase().includes(needle)) : all.slice(0, 12);
    return rows.slice(0, 12);
  }, [all, q]);

  function save(stepId, patch) {
    if (!parcel) return;
    patchHolo((h) => {
      const book = h.titleSearches || {};
      const row = book[parcel.id] || {};
      return { titleSearches: { ...book, [parcel.id]: { ...row, [stepId]: { ...(row[stepId] || {}), date: (row[stepId] && row[stepId].date) || today(), ...patch } } } };
    });
  }

  return (
    <div className="materialize">
      <SecHead ix="03" title="Title search" sub="A record of what you searched" />
      <ScreenLead does="Save each title step you actually ran, with the names, the source, and the date." leads="Your notes on this parcel. It does not search a county, order a report, or insure the title." />
      <p className="research-note">{parcel ? titleConclusion(saved) : "Pick a parcel. An empty search is not a clear title."} {parcel ? `Title for this parcel is ${standing}.` : ""}</p>
      {!parcel && <Button className="btn ghost sm" type="button" onClick={() => { const mesa = allCounties().find((c) => c.state === "CO" && c.name === "Mesa"); if (mesa) patchHolo((h) => ({ focusCounty: mesa.id, viewed: { ...(h.viewed || {}), [mesa.id]: 1 } })); if (go) go("counties", mesa ? { focus: mesa.id } : null); }}>Open the Mesa county file first</Button>}
      <div className="row wrap" style={{ gap: 8, margin: "10px 0" }}>
        <input className="input" style={{ maxWidth: 360 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a parcel by APN, address, or county" aria-label="Find a parcel" />
      </div>
      {!parcel && (
        <div className="col" style={{ gap: 6 }}>
          {matches.map((p) => (
            <Button key={p.id} className="btn ghost sm" type="button" onClick={() => { setId(p.id); patchHolo(() => ({ focusParcel: p.id })); }}>{p.apn} · {p.label} · {p.county}, {p.state}</Button>
          ))}
          {!matches.length && <p className="faint">No parcel on file matches that.</p>}
        </div>
      )}
      {parcel && (
        <div className="col" style={{ gap: 10 }}>
          <div className="row between wrap">
            <strong>{parcel.apn} · {parcel.county}, {parcel.state}</strong>
            <span className="row" style={{ gap: 6 }}>
              <Button className="btn ghost sm" type="button" onClick={() => patchHolo((h) => ({ titleSkip: { ...(h.titleSkip || {}), [parcel.id]: true } }))}>Skip the title check on this parcel</Button>
              <Button className="btn ghost sm" type="button" onClick={() => setId("")}>Choose another parcel</Button>
            </span>
          </div>
          {TITLE_STEPS.map((step) => {
            const row = saved[step.id] || {};
            return (
              <fieldset key={step.id} className="title-step">
                <legend>{step.name}</legend>
                <p className="faint">{step.gets} {step.misses}</p>
                <label className="micro">Result
                  <select className="input" value={row.result || "open"} onChange={(e) => save(step.id, { result: e.target.value })} aria-label={`${step.name} result`}>
                    {TITLE_RESULTS.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                  </select>
                </label>
                <label className="micro">Names searched<input className="input" value={row.names || ""} onChange={(e) => save(step.id, { names: e.target.value })} /></label>
                <label className="micro">Source or office<input className="input" value={row.source || ""} onChange={(e) => save(step.id, { source: e.target.value })} /></label>
                <label className="micro">Date searched<input className="input" type="date" value={row.date || ""} onChange={(e) => save(step.id, { date: e.target.value })} /></label>
                <label className="micro">Note<input className="input" value={row.note || ""} onChange={(e) => save(step.id, { note: e.target.value })} /></label>
              </fieldset>
            );
          })}
        </div>
      )}
    </div>
  );
}
