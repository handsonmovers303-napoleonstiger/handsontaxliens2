import React, { useState } from "react";
import { useStore } from "../store";
import { ScreenLead, SecHead } from "../ui";
import { SOCIAL_CHECKS, SOCIAL_GROUPS, buildCaption } from "../socialCopy";
import { Button } from "../ds";

export default function Social() {
  const { holo, patchHolo } = useStore();
  const done = holo.socialChecks || {};
  const [county, setCounty] = useState("");
  const [year, setYear] = useState("");
  const [listed, setListed] = useState(false);
  const [copied, setCopied] = useState(false);
  const caption = buildCaption({ county, year, listed });
  const finished = SOCIAL_CHECKS.filter(([id]) => done[id]).length;
  const toggle = (id) => patchHolo((h) => ({ socialChecks: { ...(h.socialChecks || {}), [id]: !h.socialChecks?.[id] } }));

  return (
    <div className="materialize">
      <SecHead ix="11" title="Social" sub="Check a public post" right={<span className="chip num">{finished} / {SOCIAL_CHECKS.length}</span>} />
      <ScreenLead does="Check what you can say in public about a certificate you own." leads="A caption you copy yourself. It does not post anywhere, and it does not list the certificate." />
      <div className="mkt-banner" role="status">A post is not a listing, and a like is not a buyer. Do not post a certificate that has not been checked against the county. Not financial, legal, or tax advice.</div>
      {SOCIAL_GROUPS.map(([key, title]) => (
        <div key={key} className="glass pad col">
          <div className="micro cy">{title}</div>
          {SOCIAL_CHECKS.filter((item) => item[1] === key).map(([id, , text]) => (
            <label key={id} className="row" style={{ alignItems: "flex-start", gap: 10 }}>
              <input type="checkbox" checked={!!done[id]} onChange={() => toggle(id)} aria-label={text} />
              <span className="body">{text}</span>
            </label>
          ))}
        </div>
      ))}
      <form className="glass pad col" onSubmit={async (e) => {
        e.preventDefault();
        try { await navigator.clipboard.writeText(caption); setCopied(true); } catch { setCopied(false); }
      }}>
        <div className="micro cy">Caption</div>
        <p className="body">Type only what you are willing to show the public. Leave a field blank and it stays out of the caption.</p>
        <input className="input" aria-label="County for the caption" value={county} onChange={(e) => setCounty(e.target.value)} placeholder="County, if you want it public" />
        <input className="input" aria-label="Year for the caption" value={year} onChange={(e) => setYear(e.target.value)} placeholder="Certificate year, if you want it public" />
        <label className="row"><input type="checkbox" checked={listed} onChange={(e) => setListed(e.target.checked)} /> This listing is active after a county check</label>
        <p className="body">{caption}</p>
        <Button className="btn" type="submit">{copied ? "Copied" : "Copy caption"}</Button>
      </form>
    </div>
  );
}
