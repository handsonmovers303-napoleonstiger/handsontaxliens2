import { Link } from "@tanstack/react-router";
import { Bookmark, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { caveatText, LEVEL_LABEL, linkNote, systemLabel } from "@/data/copy";
import { formatIso, requiredFacts, stateRule } from "@/data/catalog";
import type { County, Fact } from "@/data/types";
import { useSaved } from "@/lib/saved";
import { CalendarActions } from "./calendar-actions";
import { Button, buttonClass } from "./ui";

function showValue(fact: Fact): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(fact.value)) return formatIso(fact.value);
  return fact.value;
}

function FactList({ facts }: { facts: Fact[] }) {
  return (
    <dl>
      {facts.map((fact) => {
        const caveat = caveatText(fact.caveat);
        return (
          <div key={`${fact.label}-${fact.value.slice(0, 24)}`} className="border-t border-line py-3">
            <dt className="font-mono text-xs uppercase tracking-wide text-muted">{fact.label}</dt>
            <dd className="mt-1">
              <p className={fact.level === "gap" ? "text-subtle" : "text-fg"}>{showValue(fact)}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                {LEVEL_LABEL[fact.level]}
                {fact.source ? ` · ${fact.source.title}` : ""}
                {fact.source?.retrieved ? ` · ${fact.source.retrieved}` : ""}
              </p>
              {caveat ? <p className="mt-1 text-xs leading-relaxed text-subtle">{caveat}</p> : null}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

export function SaveButton({ fips }: { fips: string }) {
  const toggle = useSaved((state) => state.toggle);
  const saved = useSaved((state) => state.ids.includes(fips));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (useSaved.persist.hasHydrated()) setReady(true);
    return useSaved.persist.onFinishHydration(() => setReady(true));
  }, []);
  const on = ready && saved;
  return (
    <Button variant={on ? "gold" : "ghost"} aria-pressed={on} disabled={!ready} onClick={() => toggle(fips)}>
      <Bookmark className="size-4" aria-hidden="true" />
      {on ? "Saved" : "Save this county"}
    </Button>
  );
}

export function CountyView({ county, mode }: { county: County; mode: "brief" | "full" }) {
  const rule = stateRule(county.state);
  const facts = mode === "brief" ? requiredFacts(county) : county.facts;
  const official = county.links.filter((link) => link.level === "OFFICIAL" || link.level === "SECONDARY");
  const directory = county.links.filter((link) => link.level === "DIRECT" || link.level === "UNVERIFIED");

  return (
    <article className="flex flex-col gap-6 p-4 sm:p-5">
      <header>
        <p className="font-mono text-xs tracking-widest text-gold">
          {county.state} · {county.fips}
        </p>
        <h1 className="mt-1 font-display text-3xl leading-tight tracking-tight">
          {county.name} County
        </h1>
        <p className="mt-1 text-sm text-muted">{county.stateName}</p>
        <p className="mt-3 text-sm text-fg">
          Map class: {systemLabel(county.system)}
          {county.statuteVerified ? ". State statute is on file." : ". State statute is not in this file."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <SaveButton fips={county.fips} />
          {mode === "brief" ? (
            <Link to="/county/$fips" params={{ fips: county.fips }} className={buttonClass("ghost")}>
              Open the county file
            </Link>
          ) : (
            <Link to="/" search={{ fips: county.fips }} className={buttonClass("ghost")}>
              Show on the map
            </Link>
          )}
        </div>
      </header>

      <section>
        <h2 className="font-display text-xl">Sale terms</h2>
        <FactList facts={facts} />
      </section>

      <section>
        <h2 className="font-display text-xl">Calendar</h2>
        <div className="mt-3">
          <CalendarActions county={county} />
        </div>
      </section>

      {mode === "full" ? (
        <>
          {county.phone ? (
            <section>
              <h2 className="font-display text-xl">Phone</h2>
              <p className="mt-2 font-mono text-sm">{county.phone}</p>
              <p className="mt-1 text-xs text-muted">
                {county.phoneLevel === "opened"
                  ? "Printed on the page opened November 12, 2026."
                  : "Scraped August 6, 2026 into the national table. Not confirmed on this pass."}
              </p>
            </section>
          ) : null}

          {county.workbookHeadline ? (
            <section>
              <h2 className="font-display text-xl">Workbook note</h2>
              <p className="mt-2 text-sm leading-relaxed">{county.workbookHeadline}</p>
              <p className="mt-1 text-xs text-subtle">
                Headline stored on the national table, built September 4, 2026. It is a lead, not a
                reading of the county page.
              </p>
            </section>
          ) : null}

          <section>
            <h2 className="font-display text-xl">State rules</h2>
            {rule ? (
              <div className="mt-2 flex flex-col gap-3 text-sm leading-relaxed">
                <p>
                  {rule.verified ? "Verified against the sources below." : "Not verified."} Instrument
                  on file: {rule.instrument}.
                  {rule.headline ? ` Return language: ${rule.headline}.` : ""}
                </p>
                {rule.stale ? <p className="text-muted">{rule.stale}</p> : null}
                {rule.note ? <p>{rule.note}</p> : null}
                {rule.rules.length ? (
                  <ul className="flex list-disc flex-col gap-2 pl-5 text-muted">
                    {rule.rules.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                ) : null}
                {rule.sources.length ? (
                  <ul className="flex flex-col gap-1 text-xs text-subtle">
                    {rule.sources.map((source) => (
                      <li key={source.title}>
                        {source.title} · {source.host} · {source.checked}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-subtle">No statute source is stored for this state.</p>
                )}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted">
                {county.stateName} is not in the verified rulebook. Workbook figures on this county
                are leads.
              </p>
            )}
          </section>

          <section>
            <h2 className="font-display text-xl">Sources</h2>
            {official.length === 0 && directory.length === 0 ? (
              <p className="mt-2 text-sm text-muted">No link is on file for this county.</p>
            ) : null}
            <ul className="mt-2 flex flex-col">
              {official.map((link) => (
                <li key={link.url + link.label} className="border-t border-line py-3">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-start gap-2 text-sm text-fg underline decoration-line underline-offset-4"
                  >
                    <ExternalLink className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    {link.label}
                  </a>
                  <p className="mt-1 text-xs text-muted">
                    {link.level} · {link.kind}
                    {linkNote(link.note) ? ` · ${linkNote(link.note)}` : ""}
                  </p>
                </li>
              ))}
            </ul>
            {directory.length ? (
              <details className="mt-3">
                <summary className="cursor-pointer text-sm text-muted">
                  Directory links not opened ({directory.length})
                </summary>
                <ul className="mt-2 flex flex-col">
                  {directory.map((link) => (
                    <li key={link.url + link.label} className="border-t border-line py-3">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-fg underline decoration-line underline-offset-4"
                      >
                        {link.label}
                      </a>
                      <p className="mt-1 text-xs text-subtle">{linkNote(link.note)}</p>
                    </li>
                  ))}
                </ul>
              </details>
            ) : null}
          </section>
        </>
      ) : null}
    </article>
  );
}
