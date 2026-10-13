import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { onLive } from "../lib/live";
import { ARTIFACT } from "../lib/env";
import { Button } from "./ds";

/* ----------------------------------- icons ----------------------------------- */
const P = {
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm10 17-4.3-4.3",
  chart: "M4 20V10m6 10V4m6 16v-7m4 7H2",
  phone: "M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm3 17h2",
  route: "M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm12-10a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM6 15V9a3 3 0 0 1 3-3h7M18 9v6a3 3 0 0 1-3 3H8",
  target: "M12 2v4m0 12v4M2 12h4m12 0h4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  learn: "M12 3 2 8l10 5 10-5-10-5zm-6 7.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-5.5",
  board: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  cards: "M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm3 6h4m-4 4h4",
  star: "m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z",
  pin: "M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11zm0-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  cam: "M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1zm8 3a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z",
  check: "m5 12 5 5 9-10", x: "M6 6l12 12M18 6 6 18", lock: "M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z",
  gps: "M12 2v3m0 14v3M2 12h3m14 0h3M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z", cloud: "M7 18a5 5 0 0 1-.5-10A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9z",
  wifiOff: "M2 2l20 20M8.5 16.5a5 5 0 0 1 7 0M5 12.5a10 10 0 0 1 5-2.6M19 12.5a10 10 0 0 0-2.3-1.6M12 20h.01", link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-8 9a8 8 0 0 1 16 0", nav: "M3 11 21 3l-8 18-2-8z", doc: "M6 2h9l5 5v15H6zM14 2v6h6M9 13h8M9 17h8",
  home: "M3 11 12 4l9 7v9h-6v-6H9v6H3z", mail: "M3 6h18v12H3zm0 0 9 7 9-7", bolt: "M13 2 4 14h7l-1 8 9-12h-7z", flag: "M5 21V4h11l-2 4 2 4H5", cal: "M5 4h14v16H5zm0 5h14M9 2v4M15 2v4",
  plus: "M12 5v14M5 12h14", trend: "M3 17l6-6 4 4 8-8M15 7h6v6", layers: "M12 3 2 8l10 5 10-5zm-10 9 10 5 10-5M2 16l10 5 10-5",
};
export function Icon({ n, s = 18, c = "currentColor", w = 1.8, fill = "none", style }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill={fill} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" style={{ flex: "0 0 auto", ...style }} aria-hidden="true"><path d={P[n] || ""} /></svg>;
}
export const Mark = () => (
  <svg className="brand-mark" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 2 29 9v14L16 30 3 23V9z" fill="rgba(0,229,255,.08)" stroke="#00E5FF" strokeWidth="1.8" />
    <path d="M16 9 22.5 12.5v7L16 23l-6.5-3.5v-7z" fill="none" stroke="#7FB2FF" strokeWidth="1.2" /><circle cx="16" cy="16" r="2.6" fill="#00E5FF" /></svg>
);

/** The brand emblem: a small geometric tiger head, faceted, with a cyan edge. */
export const Tiger = () => (
  <svg className="brand-tiger" viewBox="0 0 32 32" aria-hidden="true">
    <path d="M6 4 11 9h10l5-5 1 9-2 8-9 7-9-7-2-8z" fill="#101927" stroke="#00DDF5" strokeWidth="1.3" strokeLinejoin="round" />
    <path d="M16 9v4M12.5 10l1.5 3.5M19.5 10 18 13.5M9 15l3 1M23 15l-3 1M9.5 19l2.5-.5M22.5 19l-2.5-.5" stroke="#4385FF" strokeWidth="1.1" strokeLinecap="round" />
    <path d="M12 16.5h2.2M17.8 16.5H20" stroke="#F4F8FC" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M14.5 21.5 16 23l1.5-1.5z" fill="#00DDF5" />
  </svg>
);

/* ----------------------------------- atoms ----------------------------------- */
/** On a phone the list sits above the card: bring the card into view after a pick. */
export const focusScroll = () => { if (window.innerWidth < 980) requestAnimationFrame(() => { const el = document.getElementById("focus-card"); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }); };
export function SecHead({ ix, title, sub, right }) {
  return (
    <div className="sec-head">
      {ix && <span className="ix">{ix}</span>}
      <div><div className="micro cy">{title}</div>{sub && <div className="h2" style={{ marginTop: 2 }}>{sub}</div>}</div>
      <span className="rule" />
      {right}
    </div>
  );
}
/** One line for what this screen does, and one line for where it sends you. */
export function ScreenLead({ does, leads }) {
  return (
    <div className="screen-lead">
      <p><span>Does</span> {does}</p>
      <p><span>Leads to</span> {leads}</p>
    </div>
  );
}

const HELP = [
  ["On the map", [
    ["God view", "Look at the ground and open a county file. The picture is not a survey and not a sale."],
    ["Place", "The county or address the picture is on. A county seat is not the parcel."],
    ["County facts", "The sale type, the next documented sale, and the over-the-counter note from the file. Click a fact to see its source."],
    ["Parcels on this list", "Properties from a list on file. Opens that property. No list is not evidence that none exists."],
    ["Find a place", "Moves the picture to a US address. The match is the geocoder’s reading, not a survey."],
    ["Picture", "Aerial photo, street map, a photo from the ground within 150 meters, or a parcel line only when one is stored."],
    ["Counties to show", "Lists and terms are the counties you can research now. Sale date only means a date is recorded. Not started means nothing is on file, which is not evidence that no sale exists."],
    ["County or property file", "The panel beside the map. It fills in when you click a county or a parcel."],
  ]],
  ["Other ways to look", [
    ["Coverage map", "The same counties, shaded by what the file holds."],
    ["County list", "The counties as rows you can open."],
    ["Parcel line", "Switches the picture to a boundary. A line is drawn only when a polygon is stored."],
  ]],
  ["The rest of the site", [
    ["Home", "Search records on file. A result opens that file. It does not put a certificate up for sale."],
    ["Search", "Ask one question about the records."],
    ["Map", "See county names."],
    ["Counties", "Open one county file."],
    ["Parcels", "Open one property file."],
    ["Title", "Save a title note. A note is not a title opinion."],
    ["Missions", "Check parcels you saved."],
    ["Scout", "Record a site visit. A visit does not prove ownership."],
    ["Routes", "Put the stops in driving order."],
    ["Auctions", "Follow a tax sale that is on file."],
    ["Calendar", "See sale dates on file."],
    ["Portfolio", "Track a certificate you entered yourself."],
    ["Learning", "See what you logged."],
    ["Community", "Posts and chat for signed-in members. A post is not a listing."],
    ["Social", "Draft a public post. A draft is not published here."],
    ["Market", "A certificate you already hold. Nothing is a sale until the county assignment and the payment are both recorded."],
    ["Research deck", "The older county tables. A row is not a listing."],
  ]],
];

export function HelpButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button className="btn ghost sm help-btn" type="button" onClick={() => setOpen(true)} aria-label="Explain each section">Help</Button>
      {open && (
        <div className="sheet" onClick={() => setOpen(false)}>
          <div className="glass pad materialize help-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="What each section does">
            <div className="row between">
              <div className="micro cy">What each section does</div>
              <Button className="btn quiet sm" type="button" onClick={() => setOpen(false)} aria-label="Close help"><Icon n="x" s={14} /> Close</Button>
            </div>
            <p className="help-note">This is a research tool. It does not place a bid, confirm title, or tell you to buy or sell.</p>
            {HELP.map(([group, rows]) => (
              <section key={group} className="help-group">
                <h2>{group}</h2>
                {rows.map(([name, text]) => (
                  <p key={name}><b>{name}.</b> {text}</p>
                ))}
              </section>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
export function Stat({ v, l, n, tone, icon }) {
  return (
    <div className="stat">
      <div className="row" style={{ gap: 6 }}>{icon && <Icon n={icon} s={14} c={tone || "var(--cyan-2)"} />}<div className="v" style={tone ? { color: tone } : null}>{v}</div></div>
      <div className="l">{l}</div>{n && <div className="n">{n}</div>}
    </div>
  );
}
/** Ring meter. `value` null renders an honest empty ring with a dash. */
export function Ring({ value, max = 100, size = 64, color = "var(--cyan)", label, sub }) {
  const r = (size - 8) / 2, C = 2 * Math.PI * r;
  const [shown, setShown] = useState(0);
  useEffect(() => { const t = requestAnimationFrame(() => setShown(value == null ? 0 : Math.max(0, Math.min(1, value / max)))); return () => cancelAnimationFrame(t); }, [value, max]);
  return (
    <div className="ring" style={{ width: size, height: size, color }}>
      <svg width={size} height={size}><circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,.07)" strokeWidth="5" fill="none" />
        <circle className="fg" cx={size / 2} cy={size / 2} r={r} stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - shown)} /></svg>
      <div className="rv"><div className="num" style={{ fontSize: size > 70 ? 20 : 15, fontWeight: 700, color: "var(--ink)" }}>{value == null ? "—" : label ?? Math.round(value)}</div>
        {sub && <div style={{ fontSize: 8.5, letterSpacing: ".12em", color: "var(--ink-3)", fontWeight: 700 }}>{sub}</div>}</div>
    </div>
  );
}
export const Bar = ({ pct, color }) => <div className="bar"><i style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: color }} /></div>;

/** Card with pointer-driven depth: a few degrees of tilt and a specular highlight. */
export function Tilt({ children, className = "", style, max = 4, ...rest }) {
  const ref = useRef(null);
  const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const move = (e) => {
    if (reduce || e.pointerType === "touch") return;
    const el = ref.current; if (!el) return; const b = el.getBoundingClientRect();
    const x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height;
    el.style.transform = `perspective(1100px) rotateX(${(0.5 - y) * max}deg) rotateY(${(x - 0.5) * max}deg) translateY(-2px)`;
    el.style.setProperty("--mx", `${x * 100}%`); el.style.setProperty("--my", `${y * 100}%`);
  };
  const leave = () => { if (ref.current) ref.current.style.transform = ""; };
  return <div ref={ref} className={`tilt ${className}`} style={style} onPointerMove={move} onPointerLeave={leave} {...rest}><span className="spec" />{children}</div>;
}
export const Src = ({ children }) => <div className="src">{children}</div>;
export const Tabs = ({ tabs, on, set }) => (
  <div className="tabs" role="tablist">{tabs.map(([k, l]) => <Button key={k} role="tab" aria-selected={on === k} className={on === k ? "on" : ""} onClick={() => set(k)}>{l}</Button>)}</div>
);

/* ------------------------------ sync + sign in ------------------------------- */
export function SyncPill({ sync, onOpen }) {
  const [live, setLive] = useState(null);
  useEffect(() => onLive(setLive), []);
  if (!sync) return null;
  if (ARTIFACT) {
    const [tone, text] = sync.local ? ["", "Saved on this device"] : sync.readOnly ? ["am", "View only"] : sync.error ? ["rd", "Sync paused"]
      : !sync.online ? ["am", `Offline · ${sync.pending} queued`] : sync.pending || sync.syncing ? ["cy", `Syncing ${sync.pending || ""}`.trim()] : ["gr", "Synced"];
    return <Button className={`chip btn-chip ${tone}`} onClick={onOpen} aria-label={`${text}. Open account`} title="Open account" style={{ padding: "6px 10px" }}><Icon n={sync.local ? "check" : sync.online ? "cloud" : "wifiOff"} s={14} /> {text}</Button>;
  }
  const tone = !sync.online ? "am" : !sync.signedIn ? "" : sync.error ? "rd" : sync.pending ? "cy" : "gr";
  const text = !sync.online ? `Offline · ${sync.pending} queued` : !sync.signedIn ? "Sign in to sync" : sync.error ? "Sync error" : sync.pending ? `Syncing ${sync.pending}` : "Synced";
  return (
    <Button className={`chip btn-chip ${tone}`} onClick={onOpen} aria-label={`${text}. Open account`} title="Open account" style={{ padding: "6px 10px" }}>
      <Icon n={sync.online ? "cloud" : "wifiOff"} s={14} /> {text}{live && live.loaded ? <span className="faint num">· {live.rows} live</span> : null}
    </Button>
  );
}

const PENDING_PROFILE = "hotl:pending-profile";
function readPendingProfile() {
  try { return JSON.parse(localStorage.getItem(PENDING_PROFILE) || "null"); } catch { return null; }
}
function phoneDigits(value) { return String(value || "").replace(/\D/g, "").slice(0, 15); }

export function AccountSheet({ sync, onClose }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState(null);
  const [live, setLive] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileNote, setProfileNote] = useState(null);
  useEffect(() => onLive(setLive), []);
  useEffect(() => {
    if (!sync?.signedIn) return;
    const pending = readPendingProfile();
    if (pending?.full_name) setName(pending.full_name);
    if (pending?.phone) setPhone(pending.phone);
    supabase.from("profiles").select("full_name,phone").maybeSingle().then(({ data, error }) => {
      if (error) { setProfileNote("Name and phone are not saved yet. The profiles table is not on this database."); return; }
      if (data) { setName(data.full_name || ""); setPhone(data.phone || ""); }
    });
  }, [sync?.signedIn]);
  const saveProfile = async () => {
    const full_name = name.trim();
    const phoneValue = phoneDigits(phone);
    if (full_name.length < 1 || full_name.length > 80 || phoneValue.length < 10) {
      setProfileNote("Enter your name and a phone number of at least 10 digits.");
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setProfileNote("Sign in again before saving."); return; }
    const { error } = await supabase.from("profiles").upsert({ user_id: user.id, full_name, phone: phoneValue, updated_at: new Date().toISOString() });
    if (error) setProfileNote(error.message);
    else { setProfileNote("Saved for this account only."); try { localStorage.removeItem(PENDING_PROFILE); } catch { /* ignore */ } }
  };
  const send = async () => {
    setErr(null);
    const full_name = name.trim();
    const phoneValue = phoneDigits(phone);
    if (full_name.length < 1 || phoneValue.length < 10) { setErr("Enter your name and phone, then the email for the link."); return; }
    try { localStorage.setItem(PENDING_PROFILE, JSON.stringify({ full_name, phone: phoneValue })); } catch { /* the link can still be sent */ }
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin + window.location.pathname } });
    if (error) setErr(error.message); else setSent(true);
  };
  return (
    <div className="sheet" onClick={onClose}>
      <div className="glass pad materialize" style={{ width: "min(460px, 100%)" }} onClick={(e) => e.stopPropagation()}>
        <div className="row between"><div className="micro cy">Operator access</div><Button className="btn quiet sm" onClick={onClose}><Icon n="x" s={14} /></Button></div>
        {ARTIFACT ? (
          <div className="col" style={{ marginTop: 10 }}>
            <div className="h3">{sync && sync.local ? "Research is saved in this browser" : "Research syncs through this artifact"}</div>
            {sync && sync.local ? (
              <div className="body">Shared storage isn't available in this view, so your diligence records, photos, stars, mission and outcomes stay on this device.</div>
            ) : (
              <div className="body">Your diligence records, stars, mission, pins and outcomes are private to you and follow you to any device that opens this page. Parcel photos and county call logs are shared with everyone on the team, so a photo one scout takes shows up for the rest.{sync && !sync.private ? " You aren't signed in with an identity here, so your personal research stays on this device." : ""}</div>
            )}
            <div className="grid g2" style={{ marginTop: 6 }}>
              <Stat v={sync ? sync.pending : 0} l="Queued writes" />
              <Stat v={sync && sync.lastSync ? new Date(sync.lastSync).toLocaleTimeString() : "—"} l="Last sync" />
              <Stat v={sync && sync.local ? "This device" : sync && sync.readOnly ? "View only" : "Private + team"} l="Storage" />
              <Stat v="15 counties" l="Terms read" n="2026-09-04, not all 3,143 names" />
            </div>
            {sync && sync.readOnly && <div className="chip am" style={{ whiteSpace: "normal" }}>You can view the team's evidence. Ask the owner for Contributor access to save research.</div>}
            {sync && sync.error && !sync.readOnly && <div className="chip rd" style={{ whiteSpace: "normal" }}>{sync.error}</div>}
            <Src>The team's live county corrections from Supabase load in the deployed web app, which this sandbox can't reach.</Src>
          </div>
        ) : sync && sync.signedIn ? (
          <div className="col" style={{ marginTop: 10 }}>
            <div className="h3">{sync.email}</div>
            <div className="body">Your research syncs to Supabase when this account is signed in. Subscription checkout is not connected. This session is not a paid account, and a magic link is not a payment.</div>
            <div className="grid g2" style={{ marginTop: 6 }}>
              <Stat v={sync.pending} l="Queued writes" />
              <Stat v={sync.lastSync ? new Date(sync.lastSync).toLocaleTimeString() : "—"} l="Last sync" />
              <Stat v={live && live.loaded ? live.rows : "—"} l="Team corrections" n={live && live.listen === "realtime" ? "updates when a correction is saved" : "rechecked every 10 minutes"} />
              <Stat v="Not connected" l="Subscription" n="No checkout and no paid access" />
            </div>
            <div className="micro">Name</div>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" aria-label="Name" />
            <div className="micro">Phone</div>
            <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" aria-label="Phone" />
            <Button className="btn ghost sm" type="button" onClick={saveProfile}>Save name and phone</Button>
            {profileNote && <div className="chip" style={{ whiteSpace: "normal" }}>{profileNote}</div>}
            {sync.error && <div className="chip rd">{sync.error}</div>}
            <Button className="btn quiet" onClick={() => supabase.auth.signOut()}>Sign out</Button>
          </div>
        ) : (
          <div className="col" style={{ marginTop: 10 }}>
            <div className="h3">Sign in with a magic link</div>
            <div className="body">The link proves you control that email. It does not start a subscription. If the email does not arrive, there is no second recovery path in this app. County terms have been read for 15 counties. The other names are only names.</div>
            {sent ? <div className="chip gr" style={{ whiteSpace: "normal" }}>Link sent to {email}. Open it on this device. Name and phone stay on this browser until you are signed in and save them.</div> : (
              <>
                <input className="input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" aria-label="Name" />
                <input className="input" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" aria-label="Phone" />
                <input className="input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && email && send()} aria-label="Email" />
                <Button className="btn" disabled={!email || !name.trim() || phoneDigits(phone).length < 10} onClick={send}><Icon n="mail" s={16} /> Send link</Button>
              </>
            )}
            {err && <div className="chip rd" style={{ whiteSpace: "normal" }}>{err}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

/* --------------------------- INTELLIGENCE CONFIDENCE --------------------------- */
const confColor = (n) => (n >= 80 ? "var(--emerald)" : n >= 60 ? "var(--cyan)" : n >= 40 ? "var(--blue-2)" : "var(--amber)");
/** A thin luminous ring traced around a card; its length is the score. */
export function Halo({ score, children, className = "", style, ...rest }) {
  const [shown, setShown] = useState(0);
  useEffect(() => { const t = requestAnimationFrame(() => setShown(score || 0)); return () => cancelAnimationFrame(t); }, [score]);
  return (
    <div className={`halo ${className}`} style={style} {...rest}>
      {children}
      <svg className="halo-ring" aria-hidden="true" preserveAspectRatio="none">
        <rect x="1" y="1" style={{ width: "calc(100% - 2px)", height: "calc(100% - 2px)" }} rx="18" fill="none" stroke="rgba(0,229,255,.08)" strokeWidth="1" />
        <rect x="1" y="1" style={{ width: "calc(100% - 2px)", height: "calc(100% - 2px)", filter: `drop-shadow(0 0 4px ${confColor(score)})` }} rx="18" fill="none" stroke={confColor(score)} strokeWidth="1.4" pathLength="100"
          strokeDasharray={`${shown} 100`} />
      </svg>
    </div>
  );
}
/** The score and its six parts, each with what it counts. */
export function ConfidencePanel({ conf, parts, title = "Intelligence confidence" }) {
  return (
    <div className="col" style={{ gap: 8 }}>
      <div className="row between"><div className="micro cy">{title}</div><div className="num" style={{ fontSize: 22, fontWeight: 700, color: confColor(conf.score) }}>{conf.score}<span className="faint" style={{ fontSize: 12 }}>/100</span></div></div>
      {parts.map(([k, l, note]) => (
        <div key={k}>
          <div className="row between" style={{ fontSize: 12 }}><span className="soft">{l}</span><span className="num">{conf.parts[k]}</span></div>
          <Bar pct={conf.parts[k]} color={`linear-gradient(90deg, var(--azure), ${confColor(conf.parts[k])})`} />
          <div className="faint" style={{ fontSize: 10.5, marginTop: 2 }}>{note}</div>
        </div>))}
      <Src>Weighted mean: source 20%, title 20%, freshness 15%, field 15%, county rules 15%, match 15%. It measures how much is known, not whether to bid.</Src>
    </div>
  );
}
export { confColor };
