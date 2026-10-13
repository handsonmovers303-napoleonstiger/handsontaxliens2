import React, { useEffect, useState } from "react";
import { Button } from "../ds";
import { ScreenLead, SecHead } from "../ui";
import { useStore } from "../store";
import { POINT_VALUES, REWARDS, RULES } from "../../points/rules";
import { createLedger } from "../../points/ledger";
import { adjustPoints, loadAccountPoints, redeemReward, reviewContribution, submitContribution, withdrawContribution } from "../../points/api";

const PREVIEW_KEY = "hotl:scout-points-preview";
const KINDS = [
  ["county_update", "County source update", `${POINT_VALUES.county_update} points after approval`],
  ["auction_update", "Auction source update", `${POINT_VALUES.auction_update} points after approval`],
  ["property_photo", "Property photo with context", `${POINT_VALUES.property_photo} points after approval`],
];

function readPreview() {
  try { return JSON.parse(sessionStorage.getItem(PREVIEW_KEY) || "null"); } catch { return null; }
}
function writePreview(snapshot) {
  try { sessionStorage.setItem(PREVIEW_KEY, JSON.stringify(snapshot)); } catch { /* the preview can stay in memory */ }
}

export default function ScoutPoints() {
  const { sync } = useStore();
  const signedIn = !!(sync?.signedIn && sync?.userId);
  const [remote, setRemote] = useState(null);
  const [preview, setPreview] = useState(() => createLedger(readPreview() || {}));
  const [tick, setTick] = useState(0);
  const [notice, setNotice] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const refresh = () => setTick((n) => n + 1);

  useEffect(() => {
    if (!signedIn) { setRemote(null); return undefined; }
    let stop = false;
    loadAccountPoints().then((row) => { if (!stop) setRemote(row); });
    return () => { stop = true; };
  }, [signedIn, tick]);

  const savePreview = () => { writePreview(preview.snapshot()); refresh(); };
  const memberId = signedIn ? sync.userId : "preview-member";
  const reviewer = signedIn ? !!remote?.reviewer : true;

  return (
    <div className="materialize">
      <SecHead ix="16" title="Scout Points" sub="Shared research rewards" />
      <ScreenLead does="Show points for research a member chose to share, after a person reviews it." leads="A platform benefit on this site. Not a tax lien, not cash, and not a transfer to another member." />
      <Rules />
      {signedIn && remote?.error && <p className="state-banner">{remote.error}</p>}
      {!signedIn && <p className="state-banner">You are not signed in. This is a preview of the rules on this device. These points are not saved to an account and they are not shared.</p>}
      {notice && <p className="state-banner">{notice}</p>}
      <Balance signedIn={signedIn} remote={remote} preview={preview} memberId={memberId} />
      <Contribute signedIn={signedIn} onSubmit={async (input) => {
        setNotice(null);
        try {
          if (signedIn) await submitContribution(input);
          else preview.submit(memberId, input);
          if (!signedIn) savePreview(); else refresh();
          setNotice("Submitted for review. No points are posted until a reviewer approves it.");
        } catch (error) { setNotice(error.message); }
      }} />
      <History signedIn={signedIn} remote={remote} preview={preview} memberId={memberId} onWithdraw={async (id) => {
        setNotice(null);
        try {
          if (signedIn) await withdrawContribution(id);
          else preview.withdraw(memberId, id);
          if (!signedIn) savePreview(); else refresh();
        } catch (error) { setNotice(error.message); }
      }} />
      <Rewards signedIn={signedIn} remote={remote} confirm={confirm} setConfirm={setConfirm} onRedeem={async (code) => {
        setNotice(null);
        const requestKey = crypto.randomUUID();
        try {
          if (signedIn) await redeemReward(code, requestKey);
          else preview.redeem(memberId, code, requestKey);
          if (!signedIn) savePreview(); else refresh();
          setConfirm(null);
          setNotice("Redemption recorded. This is a platform benefit, not cash and not a tax lien.");
        } catch (error) { setNotice(error.message); }
      }} />
      {reviewer && <Review signedIn={signedIn} remote={remote} preview={preview} onAct={async (id, decision, note) => {
        setNotice(null);
        try {
          if (signedIn) await reviewContribution(id, decision, note);
          else if (decision === "approve") preview.approve("preview-reviewer", id);
          else if (decision === "reject") preview.reject("preview-reviewer", id, note);
          else preview.requestChanges("preview-reviewer", id, note);
          if (!signedIn) savePreview(); else refresh();
        } catch (error) { setNotice(error.message); }
      }} onAdjust={async (target, amount, reason) => {
        setNotice(null);
        try {
          const requestKey = crypto.randomUUID();
          if (signedIn) await adjustPoints(target, amount, reason, requestKey);
          else preview.adjust("preview-reviewer", target || memberId, amount, reason, requestKey);
          if (!signedIn) savePreview(); else refresh();
          setNotice("Adjustment posted to the ledger.");
        } catch (error) { setNotice(error.message); }
      }} />}
    </div>
  );
}

function Rules() {
  return (
    <section className="surface" style={{ padding: 16, margin: "12px 0", textAlign: "left" }}>
      <h2 className="home-h2">Rules</h2>
      <ul className="points-rules">{RULES.map((rule) => <li key={rule}>{rule}</li>)}</ul>
    </section>
  );
}

function Balance({ signedIn, remote, preview, memberId }) {
  const balance = signedIn ? (remote?.balance ?? "—") : preview.balance(memberId);
  return (
    <section className="surface" style={{ padding: 16, margin: "12px 0", textAlign: "left" }}>
      <div className="micro cy">Balance</div>
      <div className="num" style={{ fontSize: 32 }}>{balance}</div>
      <p className="faint" style={{ margin: "6px 0 0" }}>Points can be used only for the platform benefits listed below. They cannot be transferred, cashed out, or used to buy a property or a tax lien.</p>
    </section>
  );
}

function Contribute({ onSubmit }) {
  const [form, setForm] = useState({ kind: "county_update", title: "", county: "", state: "", parcelRef: "", sourceUrl: "", context: "", share: false, rulesAccepted: false });
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  return (
    <form className="surface" style={{ padding: 16, margin: "12px 0", textAlign: "left" }} onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}>
      <h2 className="home-h2">Submit shared research</h2>
      <p className="faint">What you type here is sent to the paid-member research layer for review. A private note, watchlist, bid limit, or saved search is not accepted.</p>
      <label className="points-field">Contribution<select value={form.kind} onChange={set("kind")}>{KINDS.map(([k, label, note]) => <option key={k} value={k}>{label} · {note}</option>)}</select></label>
      <label className="points-field">Title<input value={form.title} onChange={set("title")} maxLength={80} /></label>
      <div className="row wrap" style={{ gap: 8 }}>
        <label className="points-field">County<input value={form.county} onChange={set("county")} /></label>
        <label className="points-field">State<input value={form.state} onChange={set("state")} maxLength={2} /></label>
        <label className="points-field">Parcel, if this is a photo<input value={form.parcelRef} onChange={set("parcelRef")} /></label>
      </div>
      <label className="points-field">Source link<input value={form.sourceUrl} onChange={set("sourceUrl")} placeholder="https://" /></label>
      <label className="points-field">What paid members will see<textarea value={form.context} onChange={set("context")} rows={4} /></label>
      <label className="points-check"><input type="checkbox" checked={form.rulesAccepted} onChange={set("rulesAccepted")} /> I have read the earning, expiration, reversal, and redemption rules.</label>
      <label className="points-check"><input type="checkbox" checked={form.share} onChange={set("share")} /> Share this with paid members. It will not stay private.</label>
      <Button className="btn" type="submit">Submit for review</Button>
    </form>
  );
}

function History({ signedIn, remote, preview, memberId, onWithdraw }) {
  const contributions = signedIn ? (remote?.contributions || []) : preview.contributionsFor(memberId);
  const ledger = signedIn ? (remote?.ledger || []) : preview.history(memberId);
  return (
    <section className="surface" style={{ padding: 16, margin: "12px 0", textAlign: "left" }}>
      <h2 className="home-h2">Your contributions</h2>
      {!contributions.length && <p className="faint">No shared contribution yet.</p>}
      {contributions.map((row) => <ContributionRow key={row.id} row={row} remote={signedIn} onWithdraw={onWithdraw} />)}
      <h2 className="home-h2" style={{ marginTop: 16 }}>Activity</h2>
      {!ledger.length && <p className="faint">No ledger entries. An unapproved submission does not appear here as points.</p>}
      {ledger.map((row) => <LedgerRow key={row.id || row.request_key} row={row} remote={signedIn} />)}
    </section>
  );
}

function ContributionRow({ row, remote, onWithdraw }) {
  const status = remote ? row.status : row.status;
  const note = remote ? row.review_note : row.reviewNote;
  const title = remote ? row.title : row.title;
  const when = (remote ? row.created_at : row.createdAt || "").slice(0, 10);
  return (
    <div className="hit" style={{ cursor: "default" }}>
      <span><b>{title}</b><span className="hit-sub">{when} · {String(row.kind).replaceAll("_", " ")} · {status}{note ? ` · ${note}` : ""}</span></span>
      {status !== "withdrawn" && <Button className="btn quiet sm" type="button" onClick={() => onWithdraw(row.id)}>Withdraw</Button>}
    </div>
  );
}

function LedgerRow({ row, remote }) {
  const when = (remote ? row.created_at : row.createdAt || "").slice(0, 16).replace("T", " ");
  const amount = remote ? row.amount : row.amount;
  const type = remote ? row.entry_type : row.entryType;
  const reason = remote ? row.reason : row.reason;
  const status = remote ? row.status : row.status;
  return (
    <div className="hit" style={{ cursor: "default" }}>
      <span><b>{reason}</b><span className="hit-sub">{when} · {type} · {status}</span></span>
      <span className="num">{amount > 0 ? `+${amount}` : amount}</span>
    </div>
  );
}

function Rewards({ confirm, setConfirm, onRedeem }) {
  return (
    <section className="surface" style={{ padding: 16, margin: "12px 0", textAlign: "left" }}>
      <h2 className="home-h2">Rewards</h2>
      {REWARDS.map((reward) => (
        <div key={reward.code} className="hit" style={{ cursor: "default" }}>
          <span><b>{reward.label}</b><span className="hit-sub">{reward.cost} points. {reward.detail}</span></span>
          {confirm === reward.code
            ? <span className="row" style={{ gap: 6 }}><Button className="btn sm" type="button" onClick={() => onRedeem(reward.code)}>Confirm</Button><Button className="btn quiet sm" type="button" onClick={() => setConfirm(null)}>Cancel</Button></span>
            : <Button className="btn quiet sm" type="button" onClick={() => setConfirm(reward.code)}>Redeem</Button>}
        </div>
      ))}
    </section>
  );
}

function Review({ signedIn, remote, preview, onAct, onAdjust }) {
  const queue = signedIn ? (remote?.pending || []) : preview.pending();
  const [note, setNote] = useState("");
  const [adjust, setAdjust] = useState({ memberId: "", amount: "", reason: "" });
  return (
    <section className="surface" style={{ padding: 16, margin: "12px 0", textAlign: "left" }}>
      <h2 className="home-h2">Review queue</h2>
      <p className="faint">{signedIn ? "You are a reviewer on this account. Actions are written to the ledger with your user id and the time." : "Preview review. This is not a live admin account."}</p>
      {!queue.length && <p className="faint">Nothing is waiting.</p>}
      {queue.map((row) => (
        <article key={row.id} className="points-review">
          <b>{row.title}</b>
          <p>{signedIn ? row.context : row.context}</p>
          <p className="faint">{row.kind}{row.source_url || row.sourceUrl ? ` · ${row.source_url || row.sourceUrl}` : ""}{row.parcel_ref || row.parcelRef ? ` · parcel ${row.parcel_ref || row.parcelRef}` : ""}</p>
          <label className="points-field">Reason for a rejection or a change request<textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} /></label>
          <div className="row wrap" style={{ gap: 6 }}>
            <Button className="btn sm" type="button" onClick={() => onAct(row.id, "approve", note)}>Approve</Button>
            <Button className="btn quiet sm" type="button" onClick={() => onAct(row.id, "reject", note)}>Reject</Button>
            <Button className="btn quiet sm" type="button" onClick={() => onAct(row.id, "changes", note)}>Request changes</Button>
          </div>
        </article>
      ))}
      <h3 className="home-h2" style={{ marginTop: 16 }}>Adjustment</h3>
      <div className="row wrap" style={{ gap: 8 }}>
        <label className="points-field">Member id<input value={adjust.memberId} onChange={(e) => setAdjust({ ...adjust, memberId: e.target.value })} placeholder={signedIn ? "" : "preview-member"} /></label>
        <label className="points-field">Points<input value={adjust.amount} onChange={(e) => setAdjust({ ...adjust, amount: e.target.value })} /></label>
      </div>
      <label className="points-field">Reason<input value={adjust.reason} onChange={(e) => setAdjust({ ...adjust, reason: e.target.value })} /></label>
      <Button className="btn quiet sm" type="button" onClick={() => onAdjust(adjust.memberId.trim(), Number(adjust.amount), adjust.reason)}>Post adjustment</Button>
    </section>
  );
}
