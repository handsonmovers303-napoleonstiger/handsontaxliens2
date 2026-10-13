import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { ARTIFACT } from "../lib/env";
import { Icon } from "./ui";
import { Button } from "./ds";

// Beta feedback. The web build writes to public.feedback (insert-only for testers;
// the owner reads it in the Supabase dashboard). The artifact build can't reach
// Supabase, so it writes to the artifact's own db under feedback/.
const KINDS = [["bug", "Something's broken"], ["data", "Data looks wrong"], ["idea", "Idea"], ["praise", "Works well"]];

async function send(row) {
  if (ARTIFACT) {
    const db = window.claude && typeof window.claude.use === "function" ? await window.claude.use("db") : null;
    if (!db) throw new Error("Feedback can't be saved in this view.");
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    await db.collection("feedback").doc(id).set({ ...row, created_at: new Date().toISOString() });
    return;
  }
  const { error } = await supabase.from("feedback").insert(row);
  if (error) throw new Error(error.message);
}

export function FeedbackButton({ screen }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button className="fb-fab" onClick={() => setOpen(true)} aria-label="Send feedback"><Icon n="doc" s={15} />Send feedback</Button>
      {open && <FeedbackSheet screen={screen} onClose={() => setOpen(false)} />}
    </>
  );
}

function FeedbackSheet({ screen, onClose }) {
  const [kind, setKind] = useState("bug");
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [state, setState] = useState(null);   // null | "sending" | "sent" | {error}
  const submit = async () => {
    setState("sending");
    try {
      await send({
        kind, message: message.trim().slice(0, 4000), contact: contact.trim().slice(0, 200) || null,
        screen: String(screen || "").slice(0, 60), url: window.location.href.slice(0, 500),
        user_agent: navigator.userAgent.slice(0, 400), viewport: `${window.innerWidth}x${window.innerHeight}`,
      });
      setState("sent");
    } catch (e) { setState({ error: /fetch|network/i.test(e.message || "") ? "Couldn't reach the server. Check your connection and try again." : e.message || "Couldn't send. Try again." }); }
  };
  return (
    <div className="sheet" onClick={onClose}>
      <div className="glass pad materialize" style={{ width: "min(480px, 100%)" }} onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Beta feedback">
        <div className="row between"><div className="micro cy">Beta feedback</div><Button className="btn quiet sm" onClick={onClose} aria-label="Close"><Icon n="x" s={14} /></Button></div>
        {state === "sent" ? (
          <div className="col" style={{ marginTop: 10 }}>
            <div className="h3">Thanks — it's in.</div>
            <div className="body">Your note went straight to the team, along with the screen you were on.</div>
            <div className="row" style={{ gap: 8, marginTop: 8 }}>
              <Button className="btn" onClick={() => { setMessage(""); setState(null); }}>Send another</Button>
              <Button className="btn quiet" onClick={onClose}>Done</Button>
            </div>
          </div>
        ) : (
          <div className="col" style={{ marginTop: 10, gap: 10 }}>
            <div className="h3">What should we know?</div>
            <div className="seg" role="radiogroup" aria-label="Feedback type" style={{ flexWrap: "wrap" }}>
              {KINDS.map(([k, l]) => <Button key={k} role="radio" aria-checked={kind === k} className={kind === k ? "on" : ""} onClick={() => setKind(k)}>{l}</Button>)}
            </div>
            <textarea className="input" rows={5} maxLength={4000} value={message} onChange={(e) => setMessage(e.target.value)} autoFocus
              placeholder={kind === "data" ? "Which county or parcel, and what's wrong? A source link helps." : "What happened, and what did you expect?"} />
            <input className="input" value={contact} maxLength={200} onChange={(e) => setContact(e.target.value)} placeholder="Email or name (optional, if you want a reply)" />
            <div className="micro" style={{ color: "var(--ink-3)" }}>We also record the screen ({screen}), page link, browser and window size.</div>
            {state && state.error && <div className="chip rd" style={{ whiteSpace: "normal" }}>{state.error}</div>}
            <div className="row" style={{ gap: 8 }}>
              <Button className="btn" disabled={!message.trim() || state === "sending"} onClick={submit}>{state === "sending" ? "Sending…" : "Send feedback"}</Button>
              <Button className="btn quiet" onClick={onClose}>Cancel</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
