import React, { useEffect, useMemo, useState } from "react";
import { allCounties } from "../data";
import { useStore } from "../store";
import { Icon, ScreenLead, SecHead, Src } from "../ui";
import { formatCents } from "../../marketplace/money.js";
import { catalogQuery, RESEARCH_SOURCES } from "../../marketplace/engine.js";
import { publicCatalogToDraft } from "../../marketplace/liveHandoff.js";
import { addLocalActor, currentActorId, localActors, marketCommand, marketScope, marketView, subscribeMarket, switchActor } from "../../marketplace/session.js";
import { Button, InteractiveCard } from "../ds";

const TABS = [
  ["browse", "Browse", "See certificates that passed a county check. Opens one listing."],
  ["sell", "Sell", "Draft a certificate you own. Opens a county check, not a public listing."],
  ["requests", "Buy", "Say what you want. Opens a match only when a real listing fits."],
  ["offers", "Offers", "Prices sent or received. Opens a transfer only if the seller selects one."],
  ["transfers", "Transfers", "The assignment checklist. Opens a recorded sale only after the county and the payment provider both confirm."],
];
const STATUS_WORD = { draft: "Draft", in_review: "Being checked", active: "Listed", paused: "Paused", transfer_pending: "Transfer started", sold: "Sold", redeemed: "Redeemed", withdrawn: "Withdrawn", rejected: "Not accepted" };
const EMPTY = {
  step: 1, id: null, version: null, holdingId: null, portfolioRef: null,
  countyFips: "", state: "", countyName: "", certificateNumber: "", certificateYear: "",
  principalDollars: "", premiumDollars: "", askingDollars: "", acquisitionDate: "",
  apn: "", address: "", statutoryTerms: "", redemptionDollars: "", redemptionQuoteDate: "", publicNotes: "",
  acquiredHow: "", claimedHolder: "",
};

function moneyOrUnknown(cents) { return cents == null ? "Not documented" : formatCents(cents); }
function centsToInput(cents) { return cents == null ? "" : (cents / 100).toFixed(2); }

export function MarketPulse({ go }) {
  const { sync } = useStore();
  const [, bump] = useState(0);
  useEffect(() => subscribeMarket(() => bump((n) => n + 1)), []);
  const tasks = marketScope() === "review" ? (marketView(currentActorId()).tasks || []) : (marketView(sync?.userId).tasks || []);
  return (
    <div className="glass pad mkt-pulse" role="status">
      <div className="micro cy">Certificate marketplace</div>
      <p className="body">{sync?.signedIn ? "Prepare a sale from a certificate this account holds. Other members cannot see a draft. A listing is not public until a county record is checked and trading is turned on." : "This browser can walk a sale with local identities. A signed-in member uses the Market tab in this same app."}</p>
      {tasks.slice(0, 3).map((t) => <div key={t.kind + t.ref} className="body">{t.text}</div>)}
      <Button className="btn ghost sm" onClick={() => go("market")}>Open marketplace</Button>
    </div>
  );
}

export default function Marketplace({ go, params }) {
  const { sync } = useStore();
  const [actorId, setActorId] = useState(currentActorId);
  const [tab, setTab] = useState(params?.tab || "browse");
  const [detailId, setDetailId] = useState(null);
  const [notice, setNotice] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [countyQuery, setCountyQuery] = useState("");
  const [filters, setFilters] = useState({ q: "", state: "", year: "", priceMin: "", priceMax: "", freshDays: "", availableOnly: false });
  const [, bump] = useState(0);
  const actors = localActors();
  const member = !!(sync?.signedIn && sync?.userId);
  const view = marketView(member ? sync.userId : actorId);

  useEffect(() => subscribeMarket(() => bump((n) => n + 1)), []);
  useEffect(() => {
    if (member) setActorId(sync.userId);
  }, [member, sync?.userId]);
  useEffect(() => {
    if (params?.tab) setTab(params.tab);
  }, [params?.tab]);
  useEffect(() => {
    if (params?.liveRecord) {
      const mapped = publicCatalogToDraft(params.liveRecord);
      if (!mapped.ok) { setNotice(mapped.message); return; }
      setTab("sell");
      setForm({ ...EMPTY, ...mapped.prefill, step: 1 });
      setNotice(mapped.notice);
      return;
    }
    if (!params?.prefill) return;
    setTab("sell");
    setForm((f) => ({ ...EMPTY, ...f, ...params.prefill, step: 1 }));
    setNotice("A portfolio position is not proof that you hold a transferable certificate. Confirm the certificate number and county FIPS before anything is saved.");
  }, [params?.liveRecord, params?.prefill]);

  async function run(name, payload, opts) {
    const res = await marketCommand({ id: actorId }, name, payload, opts);
    if (!res.ok) setNotice(res.message);
    else setNotice(res.data?.message || null);
    return res;
  }

  function selectTab(k) {
    setTab(k);
    setDetailId(null);
    const next = `market/${k}`;
    if ((window.location.hash || "").replace(/^#\/?/, "") !== next) window.location.hash = next;
  }

  function useActor(id) {
    switchActor(id);
    setActorId(id);
    setDetailId(null);
    setForm(EMPTY);
    setNotice(null);
  }

  const detail = detailId ? (view.catalog.find((r) => r.id === detailId) || view.listings.find((r) => r.id === detailId)) : null;

  return (
    <div className="materialize mkt">
      <SecHead ix="12" title="Market" sub="Sell or buy a certificate" right={!member && view.reviewer ? <Button className="btn ghost sm" onClick={() => selectTab("operator")}>Open operator controls</Button> : null} />
      <ScreenLead does="Let a holder find another buyer for a whole tax-lien certificate, and let a buyer check that certificate before offering." leads="A county check, then an offer, then a transfer. Nothing here is a sale until the county assignment and the payment provider are both recorded." />
      <p className="body">Sell a certificate you bought, or buy one from another member. Nothing is listed until someone else checks the county record and confirms you are the holder. You cannot approve your own certificate. Not financial, legal, or tax advice.</p>
      <section className="glass pad" aria-labelledby="mkt-liquidity">
        <div className="micro cy" id="mkt-liquidity">Why the money sits</div>
        <p className="body" style={{ marginTop: 8 }}>At the county sale you pay the delinquent tax and take a certificate. The cash stays there until the owner redeems, or until the holder finishes the deed path the statute allows. The holder does not choose that day. There is no exchange posting a price for the certificate while you wait.</p>
        <div className="grid g3" style={{ marginTop: 12 }}>
          <div>
            <div className="h3">County sale</div>
            <p className="body">The government sells the lien once, at auction. That is the primary market. Your bid is the entry. It is not a way out.</p>
          </div>
          <div>
            <div className="h3">County still holds it</div>
            <p className="body">Unsold certificates are often struck to the county or the state and sold later from a list. That is another purchase from the government, usually called over the counter. It is not a sale between two holders.</p>
          </div>
          <div>
            <div className="h3">A later holder</div>
            <p className="body">Where the state allows it, the person who already holds the certificate can assign it. Montana, for example, lets that assignment be for any price the two sides agree, and it binds only when it is filed with the county treasurer.</p>
          </div>
        </div>
        <p className="body" style={{ marginTop: 12 }}>This screen is that third path, for one whole certificate. A holder can look for a buyer before redemption. A buyer can read the county check before offering. The county’s assignment record, and the payment record, are what move the holder. Until both exist, nobody has been paid and the county still has the old name. A county that does not allow the assignment, or that this app has not enabled, stays closed. A listing can get no offer. A tax deed, once issued, is a sale of the land, not a listing on this screen.</p>
        <Src>Montana Code 15-17-323: a private assignment is binding only when filed with the treasurer. County-held and over-the-counter lists are later sales by the government. No national exchange publishes a certificate price. Not a bid, a quote, or a promise that a buyer will appear.</Src>
      </section>
      {member ? (
        <div className="mkt-banner" role="status">Signed in{sync.email ? ` as ${sync.email}` : ""}. Drafts stay with this member account on this browser. Other members cannot see them. Nothing is listed on the member site until a county record is checked and trading is turned on. Research notes are unchanged.</div>
      ) : (
        <div className="mkt-banner" role="status">Local review copy on this device. Sign in on the member app to keep drafts with your account. Trading flags start off. The public catalog at handsontaxliens.com is research, not an offer.</div>
      )}
      {notice && <div className="mkt-banner alert" role="alert">{notice}</div>}
      {!member && (
        <div className="row wrap" style={{ gap: 8 }}>
          <span className="micro">Local identity</span>
          {actors.map((a) => (
            <Button key={a.id} className={`chip btn-chip ${a.id === actorId ? "cy" : ""}`} onClick={() => useActor(a.id)} aria-pressed={a.id === actorId}>{a.label}{view.reviewer && a.id === actorId ? " · operator" : ""}</Button>
          ))}
          {actors.length < 3 && <Button className="btn ghost sm" onClick={() => { const next = addLocalActor(); useActor(next[next.length - 1].id); }}>Add a second local identity</Button>}
          <span className="faint" style={{ fontSize: 12 }}>These are not member accounts. They only separate roles on this device so a seller is not reviewing their own listing.</span>
        </div>
      )}
      <div className="tabs mkt-tabs" role="tablist" aria-label="Marketplace">
        {TABS.map(([k, label, lead]) => <Button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => selectTab(k)} title={lead}>{label}</Button>)}
        {!member && <Button role="tab" aria-selected={tab === "operator"} className={tab === "operator" ? "on" : ""} onClick={() => selectTab("operator")} title="Turn counties and trading on or off. A member cannot do this.">Operator controls</Button>}
      </div>
      <p className="body">{tab === "operator" ? "Turn a county or trading on or off for this review copy. A signed-in member cannot do this, and it does not publish the live site." : (TABS.find(([k]) => k === tab)?.[2])}</p>

      {tab === "browse" && !detail && <Browse view={view} filters={filters} setFilters={setFilters} onOpen={setDetailId} go={go} setTab={selectTab} run={run} />}
      {tab === "browse" && detail && <Detail row={detail} view={view} go={go} run={run} onBack={() => setDetailId(null)} actorId={actorId} />}
      {tab === "sell" && <Sell view={view} form={form} setForm={setForm} countyQuery={countyQuery} setCountyQuery={setCountyQuery} run={run} go={go} />}
      {tab === "requests" && <Requests view={view} run={run} />}
      {tab === "offers" && <Offers view={view} run={run} onOpen={setDetailId} setTab={selectTab} />}
      {tab === "transfers" && <Transfers view={view} run={run} />}
      {tab === "operator" && !member && <Operator view={view} run={run} />}
      <Src>Sources cited on this screen are research starting points, not a determination that any certificate, county, or HOTL activity is approved. County eligibility is whatever the operator registry shows. <a href="https://www.azleg.gov/ars/42/18118.htm">A.R.S. 42-18118</a> · <a href="https://www.flsenate.gov/Laws/Statutes/2026/0197.462">Fla. Stat. 197.462</a> · <a href="https://www.arapahoeco.gov/your_county/county_departments/treasurer/tax_lien_sale/tax_lien_sale_information.php">Arapahoe County</a> · <a href="https://www.sec.gov/resources-small-businesses/capital-raising-building-blocks/broker-dealers">SEC broker-dealer overview</a> · <a href="https://stripe.com/legal/restricted-businesses">Stripe restricted businesses</a>.</Src>
    </div>
  );
}

function Browse({ view, filters, setFilters, onOpen, go, setTab, run }) {
  const rows = useMemo(() => catalogQuery(view.catalog, {
    q: filters.q,
    state: filters.state,
    year: filters.year,
    priceMinCents: filters.priceMin ? Math.round(Number(filters.priceMin) * 100) : null,
    priceMaxCents: filters.priceMax ? Math.round(Number(filters.priceMax) * 100) : null,
    freshDays: filters.freshDays || null,
    availableOnly: filters.availableOnly,
    today: new Date().toISOString().slice(0, 10),
  }), [view.catalog, filters]);
  const enabled = view.enabledCounties || [];
  return (
    <div className="col">
      <div className="grid g4">
        <label className="col"><span className="micro">Search</span><input className="input" aria-label="Search listings" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} placeholder="County, certificate, APN, address" /></label>
        <label className="col"><span className="micro">State</span><input className="input" aria-label="State filter" maxLength={2} value={filters.state} onChange={(e) => setFilters({ ...filters, state: e.target.value.toUpperCase() })} placeholder="Any" /></label>
        <label className="col"><span className="micro">Certificate year</span><input className="input" aria-label="Certificate year" value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })} placeholder="Any" /></label>
        <label className="col"><span className="micro">Asking price</span>
          <div className="row"><input className="input" aria-label="Minimum asking price" value={filters.priceMin} onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })} placeholder="Min" /><input className="input" aria-label="Maximum asking price" value={filters.priceMax} onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })} placeholder="Max" /></div>
        </label>
      </div>
      <label className="row"><input type="checkbox" checked={filters.availableOnly} onChange={(e) => setFilters({ ...filters, availableOnly: e.target.checked })} /> Hide listings with an expired status check</label>
      {!rows.length && (
        <div className="empty">
          <div>No listings match. Nothing here was invented to fill the catalog.</div>
          <div style={{ marginTop: 8 }}>Enabled pilot counties: {enabled.length ? enabled.map((c) => `${c.countyName}, ${c.state}`).join("; ") : "none. Trading stays closed until a county procedure is approved."}</div>
          <div className="row wrap" style={{ justifyContent: "center", marginTop: 12 }}>
            <Button className="btn" onClick={() => setTab("requests")}>Post a buyer request</Button>
            <Button className="btn ghost" onClick={() => setTab("sell")}>List an owned certificate</Button>
          </div>
          <CountyReview run={run} />
        </div>
      )}
      <div className="grid g2">
        {rows.map((row) => <ListingCard key={row.id} row={row} onOpen={() => onOpen(row.id)} />)}
      </div>
      {!view.holdings.length && <div className="empty">No owned certificates on this identity. Add one from Sell. Deck cards and auction rows are not copied in as inventory.</div>}
    </div>
  );
}

function CountyReview({ run }) {
  const [name, setName] = useState("");
  const [state, setState] = useState("");
  const [fips, setFips] = useState("");
  return (
    <form className="col" style={{ marginTop: 12 }} onSubmit={async (e) => { e.preventDefault(); const res = await run("requestCountyReview", { countyName: name, state, countyFips: fips || null, note: "Member asked for a county procedure review." }); if (res.ok) { setName(""); setState(""); setFips(""); } }}>
      <div className="micro">Unsupported county</div>
      <div className="row wrap">
        <input className="input" aria-label="County to review" value={name} onChange={(e) => setName(e.target.value)} placeholder="County name" />
        <input className="input" aria-label="State to review" value={state} onChange={(e) => setState(e.target.value.toUpperCase())} placeholder="ST" maxLength={2} style={{ maxWidth: 80 }} />
        <input className="input" aria-label="FIPS to review" value={fips} onChange={(e) => setFips(e.target.value)} placeholder="FIPS optional" />
        <Button className="btn ghost" type="submit">Request county review</Button>
      </div>
      <span className="faint">This stays inside HOTL. It does not approve the county and it does not contact the treasurer.</span>
    </form>
  );
}

function ListingCard({ row, onOpen }) {
  return (
    <InteractiveCard className="glass pad list-item mkt-card" onClick={onOpen}>
      <span className="mkt-watermark num" aria-hidden="true">{row.certificateYear}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="micro cy">{row.countyName}, {row.state} · {row.countyFips}</div>
        <div className="h3">Certificate {row.certificateNumber}</div>
        <div className="faint">{row.address || "Address not documented"} · APN {row.apn || "not documented"}</div>
        <div className="row wrap" style={{ marginTop: 8 }}><Badges row={row} /></div>
      </div>
      <div className="col" style={{ alignItems: "flex-end" }}>
        <div className="num">{formatCents(row.askingPriceCents)}</div>
        <div className="faint">Asking price</div>
        <div className="num">{formatCents(row.principalCents)}</div>
        <div className="faint">Documented principal</div>
      </div>
    </InteractiveCard>
  );
}

function Badges({ row }) {
  return (
    <>
      <span className={`chip ${row.ownershipReviewed ? "gr" : "am"}`}>{row.ownershipReviewed ? `Ownership reviewed ${row.ownershipReviewedOn || ""}`.trim() : "Ownership not independently approved"}</span>
      {row.countyRecord ? <span className="chip cy">Retrieved from {row.countyRecord.host} on {row.countyRecord.retrievedOn}</span> : <span className="chip am">County record not retrieved</span>}
      {row.statusCheckExpired && <span className="chip rd">Status check expired</span>}
      <span className="chip">{row.policyCheckedOn ? `County rules checked ${row.policyCheckedOn}` : "County rules not on file"}</span>
      {row.sample && <span className="chip rd">Sample — not for sale</span>}
    </>
  );
}

function Detail({ row, view, go, run, onBack }) {
  const [amount, setAmount] = useState("");
  const [expires, setExpires] = useState("");
  const [question, setQuestion] = useState("");
  const [typedNumber, setTypedNumber] = useState("");
  const [typedYear, setTypedYear] = useState("");
  const [notProperty, setNotProperty] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmError, setConfirmError] = useState("");
  const watching = (view.watches || []).some((w) => w.listingId === row.id);
  const county = allCounties().find((c) => c.fips === row.countyFips);
  const mine = view.listings.some((l) => l.id === row.id && l.mine);
  function confirmCertificate(e) {
    e.preventDefault();
    if (typedNumber.trim() !== String(row.certificateNumber)) { setConfirmError("That certificate number does not match this listing. Leading zeros count."); return; }
    if (String(typedYear).trim() !== String(row.certificateYear)) { setConfirmError("That year does not match this certificate."); return; }
    if (!notProperty) { setConfirmError("Confirm you are buying the certificate, not the property."); return; }
    setConfirmError("");
    setConfirmed(true);
  }
  return (
    <div className="glass pad col">
      <Button className="btn ghost sm" onClick={onBack}>Back to browse</Button>
      <div className="micro cy">{row.countyName}, {row.state} · FIPS {row.countyFips}</div>
      <h2 className="h2">Certificate {row.certificateNumber} · {row.certificateYear}</h2>
      <div className="row wrap"><Badges row={row} /></div>
      <div className="kv">
        <div>Asking price</div><div className="num">{formatCents(row.askingPriceCents)}</div>
        <div>Documented principal</div><div className="num">{formatCents(row.principalCents)}</div>
        <div>Original auction premium</div><div className="num">{moneyOrUnknown(row.originalPremiumCents)}</div>
        <div>Redemption quote</div><div>{row.redemptionQuoteCents == null ? "Not documented" : `${formatCents(row.redemptionQuoteCents)} as of ${row.redemptionQuoteDate}`}</div>
        <div>County assignment fee</div><div>{moneyOrUnknown(row.countyFeeCents)}</div>
        <div>Settlement fee</div><div>{moneyOrUnknown(row.settlementFeeCents)}</div>
        <div>Marketplace fee</div><div>{row.marketplaceFeeNote}</div>
        <div>Indicative buyer cost</div><div>{row.buyerCost?.knownCents == null ? "Not documented" : formatCents(row.buyerCost.knownCents)}{row.buyerCost?.incomplete ? ` — ${row.buyerCost.note}` : ""}</div>
        <div>Compared with principal</div><div>{row.versusPrincipal?.note || "Not documented"}</div>
        <div>County record</div><div>{row.countyRecord?.note || "Not retrieved from the county's official host. A seller file is not a county record."}</div>
        <div>County source</div><div>{row.countyRecord?.sourceUrl ? <a href={row.countyRecord.sourceUrl}>{row.countyRecord.host}</a> : "Not documented"}</div>
        <div>Evidence coverage</div><div>{row.evidenceCoverage || "Not documented"}</div>
        <div>Transfer steps</div><div>{row.transferRequirements || "Not documented"}</div>
        <div>Buyer registration</div><div>{row.buyerRegistration || "Not documented"}</div>
        <div>Known limitations</div><div>{row.limitations || "Not documented"}</div>
        <div>Public notes</div><div>{row.publicNotes || "None authored"}</div>
      </div>
      <p className="body">{row.interestIsNotYield}</p>
      <div className="row wrap">
        <Button className="btn ghost" onClick={() => run("watchListing", { listingId: row.id })}>{watching ? "Stop watching" : "Watch listing"}</Button>
        {county && <Button className="btn ghost" onClick={() => go("counties", { focus: county.id })}>Open county file</Button>}
        {!view.flags?.negotiation?.enabled && <span className="chip am">Offers are off until negotiation is approved.</span>}
      </div>
      {!mine && (
        <div className="grid g2">
          <form className="col" onSubmit={confirmed ? async (e) => { e.preventDefault(); const res = await run("makeOffer", { listingId: row.id, listingVersion: row.version, amountDollars: amount, expiresAt: new Date(expires).toISOString(), confirmCertificate: true, notTheProperty: true, confirmedNumber: typedNumber.trim(), confirmedYear: typedYear }); if (res.ok) { setAmount(""); setExpires(""); } } : confirmCertificate}>
            <span className="micro">{confirmed ? "Step 2 · Make an offer" : "Step 1 · Confirm the certificate"}</span>
            {!confirmed && (
              <>
                <p className="body">Type the certificate number and year from the listing above. This is the lien, not the house.</p>
                <input className="input" aria-label="Confirm certificate number" value={typedNumber} onChange={(e) => setTypedNumber(e.target.value)} placeholder="Certificate number, including leading zeros" />
                <input className="input" aria-label="Confirm certificate year" value={typedYear} onChange={(e) => setTypedYear(e.target.value)} placeholder="Certificate year" />
                <label className="row"><input type="checkbox" checked={notProperty} onChange={(e) => setNotProperty(e.target.checked)} /> I am offering on this tax-lien certificate, not on the property</label>
                {confirmError && <div className="mkt-banner alert" role="alert">{confirmError}</div>}
                <Button className="btn" type="submit">Confirm this certificate</Button>
              </>
            )}
            {confirmed && (
              <>
                <input className="input" aria-label="Offer amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount in dollars" />
                <input className="input" aria-label="Offer expiry" type="datetime-local" value={expires} onChange={(e) => setExpires(e.target.value)} />
                <Button className="btn" type="submit">Make offer</Button>
                <Button className="btn ghost" type="button" onClick={() => setConfirmed(false)}>Change the certificate check</Button>
                <span className="faint">An offer is a price and an expiry. It does not transfer the certificate.</span>
              </>
            )}
          </form>
          <form className="col" onSubmit={async (e) => { e.preventDefault(); const res = await run("requestInfo", { listingId: row.id, text: question }); if (res.ok) setQuestion(""); }}>
            <span className="micro">Request information</span>
            <textarea className="input" rows={3} aria-label="Question for the seller" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask about a dated public fact. Private proof is not attached." />
            <Button className="btn ghost" type="submit">Request information</Button>
          </form>
        </div>
      )}
      <Threads view={view} listingId={row.id} run={run} />
    </div>
  );
}

function Threads({ view, listingId, run }) {
  const threads = (view.threads || []).filter((t) => !listingId || t.listingId === listingId);
  if (!threads.length) return null;
  return (
    <div className="col">
      <div className="micro">Information threads</div>
      {threads.map((t) => <Thread key={t.id} thread={t} run={run} />)}
    </div>
  );
}

function Thread({ thread, run }) {
  const [text, setText] = useState("");
  return (
    <div className="glass pad col">
      {thread.messages.map((m) => <div key={m.id} className="body"><b>{m.mine ? "You" : "Other party"}</b> · {m.text}</div>)}
      <form className="row" onSubmit={async (e) => { e.preventDefault(); const res = await run("postMessage", { threadId: thread.id, text }); if (res.ok) setText(""); }}>
        <input className="input" aria-label="Reply" value={text} onChange={(e) => setText(e.target.value)} />
        <Button className="btn" type="submit">Send this reply</Button>
      </form>
    </div>
  );
}

function Sell({ view, form, setForm, countyQuery, setCountyQuery, run, go }) {
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const matches = countyQuery.trim().length < 2 ? [] : allCounties().filter((c) => `${c.name} ${c.state} ${c.fips}`.toLowerCase().includes(countyQuery.trim().toLowerCase())).slice(0, 8);
  const listing = view.listings.find((l) => l.id === form.id);
  const certificateFile = (listing?.evidence || []).find((ev) => ev.note === "tax certificate");
  const [stepError, setStepError] = useState("");
  async function save() {
    const res = await run("saveDraft", { ...form, id: form.id, expectedVersion: form.version, instrumentType: "tax_lien_certificate" });
    if (res.ok) setForm({ ...form, id: res.data.listing.id, version: res.data.listing.version, step: Math.max(form.step, 2) });
    return res;
  }
  return (
    <div className="grid g2">
      <div className="col">
        <div className="micro">Your drafts and listings</div>
        {!view.listings.length && <div className="empty">No certificate draft yet. Add an owned certificate. Proof is required before review, and an upload is not an approval.</div>}
        {view.listings.map((l) => (
          <InteractiveCard key={l.id} className="list-item" onClick={() => setForm({
            ...EMPTY, step: 1, id: l.id, version: l.version, holdingId: l.holdingId, countyFips: l.countyFips, state: l.state, countyName: l.countyName,
            certificateNumber: l.certificateNumber, certificateYear: String(l.certificateYear), principalDollars: centsToInput(l.principalCents),
            premiumDollars: centsToInput(l.originalPremiumCents), askingDollars: centsToInput(l.askingPriceCents), apn: l.apn || "", address: l.address || "",
            statutoryTerms: l.statutoryTerms || "", redemptionDollars: centsToInput(l.redemptionQuoteCents), redemptionQuoteDate: l.redemptionQuoteDate || "", publicNotes: l.publicNotes || "",
            acquiredHow: l.acquiredHow || "", claimedHolder: l.claimedHolder || "",
          })}>
            <span className="chip">{STATUS_WORD[l.status] || l.status}</span>
            <span style={{ flex: 1 }}>{l.countyName} {l.certificateNumber}</span>
            <span className="num">{formatCents(l.askingPriceCents)}</span>
          </InteractiveCard>
        ))}
        {view.listings.filter((l) => l.reviewFailureReason).map((l) => <div key={l.id + "why"} className="mkt-banner alert">{l.certificateNumber}: {l.reviewFailureReason}</div>)}
        {listing?.pauseReason && <div className="mkt-banner">{listing.pauseReason}</div>}
        <Button className="btn ghost" onClick={() => go("portfolio")}>Back to portfolio</Button>
      </div>
      <form className="glass pad col" onSubmit={async (e) => {
        e.preventDefault();
        if (form.step === 2 && !certificateFile) { setStepError("Upload the tax certificate before continuing. Use a PDF or photo of the certificate itself."); return; }
        setStepError("");
        if (form.step < 5) { const res = await save(); if (res.ok) setForm((f) => ({ ...f, step: Math.min(5, f.step + 1) })); }
      }}>
        {form.source === "public-catalog" && <div className="mkt-banner">{form.sourceLabel}{form.sourceUrl ? <> · <a href={form.sourceUrl}>source record</a></> : null}. Not an offer, and not proof of ownership.</div>}
        <div className="micro cy">{["The certificate", "Upload the tax certificate", "Who can sell it", "Your price", "Send for a check"][form.step - 1]}</div>
        {stepError && <div className="mkt-banner alert" role="alert">{stepError}</div>}
        {form.step === 1 && (
          <>
            <div className="h3">Which certificate did you buy?</div>
            <p className="body">Use the certificate from the tax sale, not a parcel you only researched. Keep leading zeros.</p>
            <input className="input" aria-label="Find county" value={countyQuery} onChange={(e) => setCountyQuery(e.target.value)} placeholder="County name" />
            {matches.map((c) => <InteractiveCard type="button" key={c.fips} className="list-item" onClick={() => { setForm({ ...form, countyFips: c.fips, state: c.state, countyName: c.name }); setCountyQuery(`${c.name}, ${c.state}`); }}>{c.name}, {c.state}</InteractiveCard>)}
            {form.countyName && <div className="faint">{form.countyName}, {form.state}</div>}
            <input className="input" aria-label="Certificate number" value={form.certificateNumber} onChange={set("certificateNumber")} placeholder="Certificate number" />
            <input className="input" aria-label="Certificate year" value={form.certificateYear} onChange={set("certificateYear")} placeholder="Year of the certificate" />
            <input className="input" aria-label="Documented principal" value={form.principalDollars} onChange={set("principalDollars")} placeholder="Amount you paid the county, $" />
          </>
        )}
        {form.step === 2 && (
          <>
            <div className="h3">Upload the tax certificate</div>
            <p className="body">Upload a PDF or photo of the certificate from the tax sale. Buyers do not see this file. Uploading it does not prove the county still shows you as the holder.</p>
            <input className="input" aria-label="Tax certificate file" type="file" accept="application/pdf,image/png,image/jpeg,image/webp" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setStepError("");
              let current = form;
              if (!current.id) { const saved = await save(); if (!saved.ok) return; current = { ...form, id: saved.data.listing.id, version: saved.data.listing.version }; setForm(current); }
              const res = await run("uploadEvidence", { listingId: current.id, expectedVersion: current.version, filename: file.name, contentType: file.type || "application/pdf", byteLength: file.size, note: "tax certificate" });
              if (res.ok) setForm({ ...current, version: res.data.listingVersion });
              e.target.value = "";
            }} />
            <div className="faint">{certificateFile ? `Tax certificate on file: ${certificateFile.filename}` : "No tax certificate uploaded yet."}</div>
          </>
        )}
        {form.step === 3 && (
          <>
            <div className="h3">Who is allowed to sell it?</div>
            <p className="body">The holder name is compared with the county page. Buyers never see it. If you bought the certificate from someone else, the county must have recorded that assignment.</p>
            <label className="row"><input type="radio" name="acquiredHow" checked={form.acquiredHow === "county_sale"} onChange={() => setForm({ ...form, acquiredHow: "county_sale" })} /> I bought it at the county sale</label>
            <label className="row"><input type="radio" name="acquiredHow" checked={form.acquiredHow === "later_assignment"} onChange={() => setForm({ ...form, acquiredHow: "later_assignment" })} /> I bought it later, and the county recorded the assignment</label>
            <input className="input" aria-label="Holder name on your certificate" value={form.claimedHolder} onChange={set("claimedHolder")} placeholder="Holder name exactly as it appears on the certificate" />
          </>
        )}
        {form.step === 4 && (
          <>
            <div className="h3">What are you asking?</div>
            <p className="body">Buyers see this price. They do not see your holder name. Leave a field blank if you do not have it. Blank is not zero.</p>
            <input className="input" aria-label="Asking price" value={form.askingDollars} onChange={set("askingDollars")} placeholder="Asking price $" />
            <input className="input" aria-label="Original premium" value={form.premiumDollars} onChange={set("premiumDollars")} placeholder="Original premium $, leave blank if unknown" />
            <input className="input" aria-label="APN" value={form.apn} onChange={set("apn")} placeholder="APN, keep leading zeros" />
            <input className="input" aria-label="Address" value={form.address} onChange={set("address")} placeholder="Address, if documented" />
            <textarea className="input" aria-label="Public notes" rows={3} value={form.publicNotes} onChange={set("publicNotes")} placeholder="Public note you are willing to show every member" />
          </>
        )}
        {form.step === 5 && (
          <>
            <div className="h3">Check before anyone can buy</div>
            <ul className="mkt-checks">
              <li>The tax certificate you uploaded is your copy. It is not the county record.</li>
              <li>The certificate number, year, and amount have to match.</li>
              <li>The holder on that page has to match the name you entered.</li>
              <li>Only then can another member, or Hands On, offer to buy it.</li>
            </ul>
            <PublicPreview form={form} />
            <Button className="btn" type="button" onClick={() => run("submitForReview", { listingId: form.id, expectedVersion: form.version })}>Send for a county check</Button>
            <span className="faint">You cannot mark this approved. If this county is not open for sales yet, the draft stays saved and is not listed.</span>
          </>
        )}
        <div className="row wrap">
          {form.step > 1 && <Button className="btn ghost" type="button" onClick={() => setForm({ ...form, step: form.step - 1 })}>Previous step</Button>}
          {form.step < 5 && <Button className="btn" type="submit">Save and continue</Button>}
          <Button className="btn quiet" type="button" onClick={save}>Save draft</Button>
        </div>
      </form>
    </div>
  );
}

function PublicPreview({ form }) {
  const rows = [
    ["County", form.countyName ? `${form.countyName}, ${form.state} (${form.countyFips})` : "Missing"],
    ["Certificate", form.certificateNumber || "Missing"],
    ["Year", form.certificateYear || "Missing"],
    ["Instrument", "Whole tax-lien certificate"],
    ["Asking price", form.askingDollars ? `$${form.askingDollars}` : "Missing"],
    ["Principal", form.principalDollars ? `$${form.principalDollars}` : "Missing"],
    ["Original premium", form.premiumDollars === "" ? "Not documented" : `$${form.premiumDollars}`],
    ["APN", form.apn || "Not documented"],
    ["Address", form.address || "Not documented"],
    ["Public note", form.publicNotes || "None"],
  ];
  return <div className="kv">{rows.flatMap(([k, v]) => [<div key={k}>{k}</div>, <div key={k + "v"}>{v}</div>])}</div>;
}

function Requests({ view, run }) {
  const [f, setF] = useState({ states: "", countyFips: "", priceMinDollars: "", priceMaxDollars: "", yearMin: "", yearMax: "", expiresAt: "", publicPreference: "" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <div className="grid g2">
      <div className="col">
        <div className="micro">Open buyer requests</div>
        {!view.requests.length && <div className="empty">No matching buyer requests. A seller can publish an eligible listing and change its asking price to see whether a real request fits. There is no count of hidden buyers.</div>}
        {view.requests.map((r) => (
          <div key={r.id} className="glass pad">
            <div className="h3">{r.states.join(", ") || "Named counties"} {r.countyFips.join(", ")}</div>
            <div className="body">{r.publicPreference || "No public preference."}</div>
            <div className="faint">{moneyOrUnknown(r.priceMinCents)} – {r.priceMaxCents == null ? "no maximum" : formatCents(r.priceMaxCents)} · expires {r.expiresAt?.slice(0, 10)}</div>
            <div className="faint">{r.fundingNote}</div>
          </div>
        ))}
        <div className="micro">Matches for you</div>
        {!view.matches.length && <div className="faint">No real match on geography, instrument, year, and price.</div>}
        {view.matches.map((m) => <div key={m.listingId + m.requestId} className="list-item"><div><b>{m.countyName}, {m.state}</b> certificate {m.certificateNumber}<div className="faint">{m.reasons.join(" ")}</div></div></div>)}
        <label className="row"><input type="checkbox" checked={!!view.preferences?.matchAlerts} onChange={(e) => run("setPreference", { matchAlerts: e.target.checked })} /> In-app match alerts. Off until you opt in. No email is sent.</label>
      </div>
      <form className="glass pad col" onSubmit={async (e) => {
        e.preventDefault();
        const res = await run("postRequest", {
          ...f,
          states: f.states.split(/[,\s]+/).filter(Boolean),
          countyFips: f.countyFips.split(/[,\s]+/).filter(Boolean),
          expiresAt: f.expiresAt ? new Date(f.expiresAt).toISOString() : "",
        });
        if (res.ok) setF({ states: "", countyFips: "", priceMinDollars: "", priceMaxDollars: "", yearMin: "", yearMax: "", expiresAt: "", publicPreference: "" });
      }}>
        <div className="h3">Say what you want to buy</div>
        <input className="input" aria-label="States" value={f.states} onChange={set("states")} placeholder="States, e.g. AZ" />
        <input className="input" aria-label="County FIPS list" value={f.countyFips} onChange={set("countyFips")} placeholder="County FIPS, optional" />
        <input className="input" aria-label="Minimum price" value={f.priceMinDollars} onChange={set("priceMinDollars")} placeholder="Minimum price $" />
        <input className="input" aria-label="Maximum price" value={f.priceMaxDollars} onChange={set("priceMaxDollars")} placeholder="Maximum price $" />
        <div className="row"><input className="input" aria-label="First certificate year" value={f.yearMin} onChange={set("yearMin")} placeholder="Year from" /><input className="input" aria-label="Last certificate year" value={f.yearMax} onChange={set("yearMax")} placeholder="Year to" /></div>
        <input className="input" aria-label="Request expiry" type="datetime-local" value={f.expiresAt} onChange={set("expiresAt")} />
        <textarea className="input" aria-label="Public preference" rows={3} value={f.publicPreference} onChange={set("publicPreference")} placeholder="Public preference. No phone number or private bid limit." />
        <Button className="btn" type="submit">Post what I want to buy</Button>
        {!view.flags?.solicitation?.enabled && <span className="faint">Solicitation is off, so posting stays blocked. The form is here so the request is ready when that scope is approved.</span>}
      </form>
    </div>
  );
}

function Offers({ view, run, onOpen, setTab }) {
  return (
    <div className="col">
      {!view.offers.length && <div className="empty">No offers. Buyers can offer only on an active listing in an approved county. There is no offer history to show yet.</div>}
      {view.offers.map((o) => (
        <div key={o.id} className="glass pad row wrap between">
          <div>
            <div className="h3">{formatCents(o.amountCents)} · {o.status}</div>
            <div className="faint">{o.countyName}, {o.state} certificate {o.certificateNumber} · you are the {o.role}</div>
            {o.outdatedReason && <div className="body">{o.outdatedReason}</div>}
          </div>
          <div className="row wrap">
            <Button className="btn ghost" onClick={() => { setTab("browse"); onOpen(o.listingId); }}>Open this listing</Button>
            {o.role === "buyer" && o.status === "open" && <Button className="btn ghost" onClick={() => run("withdrawOffer", { offerId: o.id })}>Withdraw this offer</Button>}
            {o.role === "seller" && o.status === "open" && <Button className="btn ghost" onClick={() => run("declineOffer", { offerId: o.id })}>Decline this offer</Button>}
            {o.role === "seller" && o.status === "open" && <Button className="btn" onClick={() => run("selectOffer", { offerId: o.id })}>Select for transfer review</Button>}
          </div>
        </div>
      ))}
      <p className="faint">Selecting an offer opens a transfer case. It does not assign the certificate and it does not move money. HOTL subscription checkout is not used for this.</p>
    </div>
  );
}

const REVIEW_CHECKS = [
  ["sellerAuthority", "Seller authority rechecked"],
  ["buyerEligibility", "Buyer eligibility rechecked"],
  ["certificateStatus", "Certificate status rechecked"],
  ["assignmentInstructions", "Assignment instructions rechecked"],
  ["assignmentSubmitted", "Assignment submitted to the county"],
  ["assignmentConfirmed", "County assignment confirmed"],
];

function Transfers({ view, run }) {
  const [note, setNote] = useState("");
  const [record, setRecord] = useState("");
  if (!view.transfers.length) return <div className="empty">No transfer cases. A case starts only when a seller selects one open offer. Completion needs both an official assignment record and a signed settlement event from an approved provider.</div>;
  return (
    <div className="col">
      {!view.provider?.configured && <div className="mkt-banner" role="status">External settlement integration pending. Live completion is blocked. No one can mark this paid inside HOTL.</div>}
      {view.transfers.map((t) => (
        <div key={t.id} className="glass pad col">
          <div className="row between wrap"><div className="h3">{t.countyName} certificate {t.certificateNumber}</div><span className="chip cy">{t.state.replaceAll("_", " ")}</span></div>
          <div className="faint">Price under review {formatCents(t.amountCents)}. You are the {t.role}. {t.settlementNote}</div>
          {t.freeze && <div className="mkt-banner alert">Frozen: {t.freeze.reason}. {t.freeze.source} Next step is reconciliation. This was not refunded or relisted from here.</div>}
          <ul className="mkt-checks">
            {REVIEW_CHECKS.map(([key, label]) => <li key={key}>{t.checks[key] ? `Done ${t.checks[key].at.slice(0, 10)} — ${t.checks[key].note}` : label}</li>)}
            <li>{t.checks.settlementOpened ? `Settlement case ${t.checks.settlementOpened.providerCaseId || "opened"}` : "Approved external settlement case — waiting on the provider"}</li>
            <li>{t.checks.fundsConfirmed ? "Provider confirmed funds" : "Funds confirmation — provider only, not documented"}</li>
            <li>{t.checks.fundsReleased ? "Provider released funds" : "Final funds release — provider only, not documented"}</li>
          </ul>
          {t.listingStatus === "sold" && <p className="body">Reconciled as a marketplace sale at {formatCents(t.completedPriceCents)}. Recorded assignment and payment are separate. Portfolio was not changed automatically. Asking price was {formatCents(t.askingPriceCents)}.</p>}
          {t.role !== "none" && t.state === "open" && (
            <form className="row" onSubmit={(e) => { e.preventDefault(); run("memberAck", { transferId: t.id, note }); setNote(""); }}>
              <input className="input" aria-label="Acknowledge a transfer task" value={note} onChange={(e) => setNote(e.target.value)} placeholder="What you uploaded or acknowledged" />
              <Button className="btn ghost" type="submit">Save what I acknowledged</Button>
            </form>
          )}
          {view.reviewer && t.state !== "reconciled" && (
            <div className="col">
              {REVIEW_CHECKS.map(([key, label]) => (
                <Button key={key} className="btn ghost" onClick={() => run("reviewerCheck", { transferId: t.id, check: key, note: note || label, officialRecordRef: key === "assignmentConfirmed" ? record : null })}>{label}</Button>
              ))}
              <input className="input" aria-label="Official record reference" value={record} onChange={(e) => setRecord(e.target.value)} placeholder="Official record reference for assignment confirmation" />
              <Button className="btn ghost" onClick={() => run("cancelTransfer", { transferId: t.id, reason: note || "Cancelled in reconciliation." })}>Reconcile a cancellation</Button>
            </div>
          )}
          <div className="row wrap">
            <Button className="btn ghost" onClick={() => run("reportRedemption", { listingId: t.listingId, source: note })}>Report redemption</Button>
            {view.reviewer && <Button className="btn ghost" onClick={() => run("reportRedemption", { listingId: t.listingId, source: note, confirm: true })}>Confirm redemption</Button>}
            <Button className="btn ghost" onClick={() => run("openDispute", { transferId: t.id, reason: note })}>Open a dispute</Button>
          </div>
          <div className="faint">{t.events.map((ev) => `${ev.at.slice(0, 16)} ${ev.type}: ${ev.detail}`).join(" · ")}</div>
        </div>
      ))}
    </div>
  );
}

function Operator({ view, run }) {
  const [policy, setPolicy] = useState({ countyFips: "", state: "", countyName: "", assignmentInstructions: "", buyerRegistration: "", checkedOn: "", validUntil: "", legalReviewRef: "", limitations: "", assignmentFeeDollars: "", officialHosts: "", enabled: false });
  const [flagRefs, setFlagRefs] = useState({ listings: "", solicitation: "", negotiation: "", transactions: "" });
  const set = (k) => (e) => setPolicy({ ...policy, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const stats = view.analytics;
  const savedPolicy = (view.policies || []).find((p) => p.countyFips === policy.countyFips);
  const flags = [
    ["listings", "Listings"],
    ["solicitation", "Buyer requests"],
    ["negotiation", "Offers"],
    ["transactions", "Transfers"],
  ];
  return (
    <div className="col">
      {!view.reviewer && (
        <div className="glass pad col">
          <div className="h3">No operator on this local copy</div>
          <p className="body">Recording yourself here does not approve a county, turn trading on, or make you a reviewer in production. Production roles are assigned in the database, not by this button.</p>
          <Button className="btn" onClick={() => run("bootstrapLocalOperator", {})}>Record this local identity as operator</Button>
        </div>
      )}
      {view.reviewer && (
        <>
          <form className="glass pad col" onSubmit={(e) => { e.preventDefault(); run("savePolicy", { ...policy, instrument: "tax_lien_certificate", forms: [] }); }}>
            <div className="h3">County eligibility</div>
            <div className="grid g2">
              <input className="input" aria-label="Policy FIPS" placeholder="FIPS" value={policy.countyFips} onChange={set("countyFips")} />
              <input className="input" aria-label="Policy state" placeholder="State" maxLength={2} value={policy.state} onChange={set("state")} />
              <input className="input" aria-label="Policy county" placeholder="County name" value={policy.countyName} onChange={set("countyName")} />
              <input className="input" aria-label="Assignment fee" placeholder="Assignment fee $, blank if unknown" value={policy.assignmentFeeDollars} onChange={set("assignmentFeeDollars")} />
              <input className="input" aria-label="Checked on" type="date" value={policy.checkedOn} onChange={set("checkedOn")} />
              <input className="input" aria-label="Valid until" type="date" value={policy.validUntil} onChange={set("validUntil")} />
            </div>
            <textarea className="input" aria-label="Assignment instructions" rows={3} placeholder="Official assignment instructions" value={policy.assignmentInstructions} onChange={set("assignmentInstructions")} />
            <input className="input" aria-label="Official county hosts" placeholder="Official host, e.g. treasurer.example.gov" value={policy.officialHosts} onChange={set("officialHosts")} />
            <textarea className="input" aria-label="Buyer registration" rows={2} placeholder="Buyer registration requirements" value={policy.buyerRegistration} onChange={set("buyerRegistration")} />
            <input className="input" aria-label="Legal review reference" placeholder="Legal review reference" value={policy.legalReviewRef} onChange={set("legalReviewRef")} />
            <Button className="btn" type="submit">Save county policy</Button>
            <Button className="btn ghost" type="button" onClick={() => run("savePolicy", { ...policy, instrument: "tax_lien_certificate", forms: [], enabled: true })}>Propose enable</Button>
            {savedPolicy?.pendingEnable && savedPolicy.pendingEnable.proposedBy !== view.actorId && (
              <Button className="btn" type="button" onClick={() => run("confirmPolicy", { countyFips: policy.countyFips })}>Confirm enable</Button>
            )}
            {savedPolicy?.pendingEnable && <p className="faint">Enable proposed by {savedPolicy.pendingEnable.proposedBy}. A different reviewer confirms it. Saving does not turn the county on.</p>}
          </form>
          <div className="glass pad col">
            <div className="h3">Trading flags</div>
            <p className="body">Each flag is off until one reviewer proposes it and a different reviewer confirms it. Turning one on does not turn the others on. Leave them off for a production launch.</p>
            {flags.map(([key, label]) => {
              const flag = view.flags?.[key] || {};
              return (
                <div key={key} className="row wrap" style={{ gap: 8 }}>
                  <span className="micro">{label}: {flag.enabled ? "on" : "off"}</span>
                  <input className="input" aria-label={`${label} legal review reference`} value={flagRefs[key]} onChange={(e) => setFlagRefs({ ...flagRefs, [key]: e.target.value })} placeholder="Legal review reference" />
                  <Button className="btn ghost sm" type="button" onClick={() => run("proposeFlags", { legalReviewRef: flagRefs[key], flags: { [key]: true } })}>Propose</Button>
                  {flag.pending && flag.pending.proposedBy !== view.actorId && <Button className="btn sm" type="button" onClick={() => run("confirmFlags", { key })}>Confirm</Button>}
                  <Button className="btn ghost sm" type="button" onClick={() => run("setFlags", { flags: { [key]: false } })}>Turn off</Button>
                </div>
              );
            })}
          </div>
          <div className="glass pad col">
            <div className="h3">Review queue</div>
            {!view.reviewQueue.length && <div className="faint">No listing waiting that you are allowed to decide. Your own listings are excluded.</div>}
            {view.reviewQueue.map((l) => <ReviewCard key={l.id} listing={l} policies={view.policies} run={run} />)}
          </div>
          <div className="glass pad">
            <div className="h3">Outcomes</div>
            {!stats || !stats.activated ? <p className="body">No activated listings yet. Averages stay blank until there is a real denominator. Redemptions are not sales.</p> : (
              <div className="kv">
                <div>Active listings that received an offer</div><div>{stats.withOffer} / {stats.activated}</div>
                <div>Mean hours to first offer</div><div>{stats.meanHoursToFirstOffer == null ? "No offer yet" : stats.meanHoursToFirstOffer.toFixed(1)}</div>
                <div>Selected offers / offers recorded</div><div>{stats.offerToTransfer == null ? "—" : stats.offerToTransfer.toFixed(2)}</div>
                <div>Reconciled sales / transfers opened</div><div>{stats.completedSales} / {stats.transfersOpened}</div>
                <div>Redemptions, not sales</div><div>{stats.redemptions}</div>
              </div>
            )}
          </div>
          <div className="glass pad">
            <div className="micro">Research sources, not enabled counties</div>
            {RESEARCH_SOURCES.map((s) => <p key={s.id} className="body"><a href={s.url}>{s.title}</a> — {s.note}</p>)}
          </div>
        </>
      )}
    </div>
  );
}

function ReviewCard({ listing, policies, run }) {
  const policy = (policies || []).find((p) => p.countyFips === listing.countyFips);
  const hosts = policy?.officialHosts || [];
  const [coverage, setCoverage] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [notes, setNotes] = useState("");
  const [record, setRecord] = useState({ sourceUrl: "", retrievedOn: "", result: "outstanding", certificateNumber: "", certificateYear: "", apn: "", principalDollars: "", holder: "" });
  const [checks, setChecks] = useState({ authority: false, identity: false, redemptionStatus: false, restrictions: false, encumbrance: false });
  const flip = (k) => setChecks({ ...checks, [k]: !checks[k] });
  const setRecordField = (k) => (e) => setRecord({ ...record, [k]: e.target.value });
  return (
    <div className="col" style={{ borderTop: "1px solid rgba(90,170,255,.15)", paddingTop: 8 }}>
      <div className="h3">{listing.countyName}, {listing.state}</div>
      <div className="faint">The seller's name stays hidden. Open the county site and type the holder shown there. If it does not match the name on the seller's certificate, approval fails. A seller file is not the county record. Seller files: {(listing.evidence || []).map((e) => e.filename).join(", ") || "none"}.</div>
      <div className="micro">County record</div>
      <p className="body">Open {hosts.length ? hosts.join(" or ") : "the official host on this county's registry"} yourself. Type what that page shows. A HOTL link, a seller screenshot, or a checkbox does not pass this item.</p>
      <input className="input" aria-label="County record URL" value={record.sourceUrl} onChange={setRecordField("sourceUrl")} placeholder="https:// on the official county host" />
      <input className="input" aria-label="County retrieval date" type="date" value={record.retrievedOn} onChange={setRecordField("retrievedOn")} />
      <select className="input" aria-label="County result" value={record.result} onChange={setRecordField("result")}>
        <option value="outstanding">Outstanding</option>
        <option value="redeemed">Redeemed</option>
        <option value="assigned">Already assigned</option>
        <option value="not_found">Not found</option>
      </select>
      <input className="input" aria-label="Certificate number on the county record" value={record.certificateNumber} onChange={setRecordField("certificateNumber")} placeholder="Certificate number as shown" />
      <input className="input" aria-label="Certificate year on the county record" value={record.certificateYear} onChange={setRecordField("certificateYear")} placeholder="Year as shown" />
      <input className="input" aria-label="Parcel on the county record" value={record.apn} onChange={setRecordField("apn")} placeholder="Parcel as shown, blank if the county does not show it" />
      <input className="input" aria-label="Amount on the county record" value={record.principalDollars} onChange={setRecordField("principalDollars")} placeholder="Amount as shown, blank if not shown" />
      <input className="input" aria-label="Holder on the county record" value={record.holder} onChange={setRecordField("holder")} placeholder="Holder as shown, blank if not shown. Buyers do not see this." />
      {[["authority", "The seller is the holder who can sell"], ["identity", "This is the certificate they bought"], ["redemptionStatus", "The county still shows it outstanding"], ["restrictions", "The county allows this assignment"], ["encumbrance", "No dispute is showing"]].map(([k, label]) => (
        <label key={k} className="row"><input type="checkbox" checked={checks[k]} onChange={() => flip(k)} /> {label}</label>
      ))}
      <input className="input" aria-label="Evidence coverage" value={coverage} onChange={(e) => setCoverage(e.target.value)} placeholder="What the seller file covers. This is not the county record." />
      <input className="input" aria-label="Status valid until" type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
      <textarea className="input" aria-label="Private review notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Private review notes. Buyers do not see this." />
      <div className="row wrap">
        <Button className="btn" type="button" onClick={() => run("reviewListing", { listingId: listing.id, expectedVersion: listing.version, decision: "approve", checks: { ...checks, countyRecord: true }, countyRecord: record, statusCheckedOn: record.retrievedOn, statusValidUntil: validUntil, evidenceCoverage: coverage, notes })}>Matches the county. Allow the sale.</Button>
        <Button className="btn ghost" type="button" onClick={() => run("reviewListing", { listingId: listing.id, expectedVersion: listing.version, decision: "reject", notes })}>Does not match. Stop the sale.</Button>
      </div>
    </div>
  );
}

export function marketSearchIntent(text) {
  const q = String(text || "").toLowerCase();
  if (/buyer request/.test(q)) return "requests";
  if (/sell (this |my )?(holding|certificate)/.test(q)) return "sell";
  if (/marketplace|secondary (market|sale)/.test(q)) return "browse";
  return null;
}
