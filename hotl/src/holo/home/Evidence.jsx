import React, { createContext, useContext, useState } from "react";
import { TIERS } from "../../quantum/core";
import { labelOf } from "./model";
import { Icon } from "../ui";
import { Button } from "../ds";

export const Label = ({ f, status }) => { const [t, k] = labelOf(f || { status }); return <span className={`ev-label ev-${k}`}>{t}</span>; };

const EvCtx = createContext(() => {});
export const useEvidence = () => useContext(EvCtx);
/** One evidence panel for the whole home; any fact can open it. */
export function EvidenceProvider({ children }) {
  const [f, setF] = useState(null);
  return (
    <EvCtx.Provider value={setF}>
      {children}
      {f && <EvidenceSheet f={f} onClose={() => setF(null)} />}
    </EvCtx.Provider>
  );
}

/** A fact as a row: label, value, evidence label. The whole row opens its evidence. */
export function FactRow({ f, label, deedNote }) {
  const open = useEvidence();
  if (!f) return null;
  return (
    <Button className="fact-row" onClick={() => open(f)} aria-label={`${label || f.label}: evidence`}>
      <span className="fact-k">{label || f.label}</span>
      <span className="fact-v" style={f.value == null ? { color: "var(--ink-3)" } : null}>{f.display}{deedNote ? <span className="faint"> · {deedNote}</span> : null}</span>
      <span className="fact-s"><Label f={f} />{f.evidenceCount ? <span className="faint num">{f.evidenceCount} src</span> : null}</span>
    </Button>
  );
}

export function EvidenceSheet({ f, onClose }) {
  return (
    <div className="sheet" onClick={onClose} role="dialog" aria-modal="true" aria-label={`Evidence for ${f.label}`}>
      <div className="surface materialize" style={{ width: "min(680px, 100%)", padding: 18 }} onClick={(e) => e.stopPropagation()}>
        <div className="row between"><div className="micro cy">Evidence</div><Button className="btn quiet sm" onClick={onClose} aria-label="Close this evidence"><Icon n="x" s={14} /> Close this evidence</Button></div>
        <div className="h2" style={{ marginTop: 4 }}>{f.label}</div>
        <div style={{ fontSize: 16, marginTop: 6 }}>{f.display}</div>
        <div className="row wrap" style={{ gap: 6, marginTop: 8 }}><Label f={f} /><span className="chip">{f.evidenceCount} source{f.evidenceCount === 1 ? "" : "s"}</span>{f.lastChecked && <span className="chip">Last checked {f.lastChecked}</span>}</div>
        <div className="soft" style={{ fontSize: 12.5, marginTop: 8 }}>
          {f.status === "CONFLICT" ? f.conflictNote
            : f.value == null ? `No source on file supports a value. ${f.where ? `Where to look: ${f.where}.` : ""}`
            : "\"Source-supported\" means the source below supports this claim. It does not mean the property is safe, profitable or fully researched."}
        </div>
        <div className="col" style={{ gap: 8, marginTop: 12 }}>
          {(f.evidence || []).map((o, i) => { const s = o.source; return (
            <div key={i} className="surface-2" style={{ padding: 12 }}>
              <div className="row between wrap" style={{ gap: 6 }}><b style={{ fontSize: 13.5 }}>{s.agency}</b><span className="chip">{TIERS[s.tier].label}</span></div>
              <div className="ev-grid">
                <span>Source</span><span>{s.url ? <a href={s.url} target="_blank" rel="noreferrer">{s.label} ↗</a> : <>{s.label} <span className="faint">(no link on file)</span></>}</span>
                <span>Record</span><span>{s.recordId || "—"}</span>
                <span>Excerpt</span><span>“{o.display || String(o.value)}”</span>
                <span>Source date</span><span>{s.effective || "—"}</span>
                <span>Retrieved</span><span>{s.accessed || "Not recorded"}</span>
                <span>Method</span><span>{s.method}{s.human ? " · read by a person" : ""}{s.derived ? " · derived, not published" : ""}</span>
                {s.note && <><span>Note</span><span>{s.note}</span></>}
              </div>
            </div>); })}
          {!f.evidence || !f.evidence.length ? <div className="empty">Not checked. {f.where ? `Check: ${f.where}` : "No source identified yet."}</div> : null}
        </div>
      </div>
    </div>
  );
}
