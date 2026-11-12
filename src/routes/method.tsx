import { createFileRoute } from "@tanstack/react-router";
import { catalog, stateRules } from "@/data/catalog";

export const Route = createFileRoute("/method")({
  head: () => ({ meta: [{ title: "Sources · Hands On Tax Liens" }] }),
  component: MethodPage,
});

const LEVELS = [
  ["Opened and read", "A person opened the county page on the date shown and copied what it said."],
  ["On file", "Stored in the September 2026 research file from a page that was opened then, and not re-read on November 12, 2026."],
  ["State statute", "The state rulebook entry, with the statute or agency named under State rules."],
  ["Derived", "Calculated from a statewide cycle. Iowa’s third Monday in June is the main one. A county can move its own sale."],
  ["Workbook lead", "A figure from the national county table. Useful as a lead. Not a confirmation."],
  ["Not on file", "The field is blank on purpose. Nothing was guessed."],
];

function MethodPage() {
  const verified = Object.values(stateRules).filter((rule) => rule.verified);
  const unverified = Object.values(stateRules).filter((rule) => !rule.verified);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-6 sm:px-6">
      <header>
        <p className="font-mono text-xs tracking-widest text-gold">How to read this</p>
        <h1 className="mt-2 font-display text-3xl">Sources and gaps</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Hands On Tax Liens is a field-research desk. This atlas is the county file: what the statute
          says, what a treasurer page said when it was opened, and what is still missing. It does not
          bid, clear title, or tell you a lien will pay.
        </p>
      </header>

      <section>
        <h2 className="font-display text-xl">Confidence</h2>
        <dl className="mt-3">
          {LEVELS.map(([label, text]) => (
            <div key={label} className="border-t border-line py-3">
              <dt className="font-mono text-xs uppercase tracking-wide text-gold">{label}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted">{text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h2 className="font-display text-xl">What was opened on November 12, 2026</h2>
        <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted">
          <li>Larimer County Treasurer tax lien sale page. Sale November 19, 2026, in person, 13%.</li>
          <li>El Paso County Treasurer tax lien sale page. Sale October 28, 2026, RealAuction, registration deadline October 27 at 2:00 p.m. MST, 13%.</li>
          <li>Eagle County Treasurer tax lien sale page. Sale November 10, 2026, RealAuction, registration deadline November 3 at 2:00 p.m. MT, deposit at least 10%, 13%. The same page also heads a section “Registration: October 15, 2026.”</li>
          <li>Mesa County bidding page. Sale November 6, 2026 online, 13%, deposit 10%. This replaces an October 16 date and a 15% note in the September file.</li>
          <li>Douglas County tax lien sale page. Sale November 5, 2026, SRI / Zeus, 13%. The page does not state a registration deadline.</li>
          <li>Maricopa County tax lien landing page. It did not state a 2027 auction day. The February 1, 2027 roster date stays marked derived.</li>
          <li>Routt County’s sale page timed out. October 30, 2026 and the October 29 registration deadline stay “on file,” not re-opened.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl">Rulebook</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Statute entries were checked September 4, 2026, except where a county page opened later
          states a newer rate. Verified states: {verified.map((rule) => rule.name).join(", ")}.
          {unverified.length
            ? ` ${unverified.map((rule) => rule.name).join(", ")} is in the rulebook and marked unverified.`
            : ""}{" "}
          Every other state is absent. Louisiana’s entry records the change to tax lien certificates on
          January 1, 2026. Illinois is marked mid-reform. Colorado counties opened in November 2026
          publish 13% for that sale; that rate is not assumed for counties whose pages were not opened.
          The statute still describes the method: nine points over the federal discount rate as of
          September 1.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl">What is not in the map</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          An October 8, 2026 machine scrape of about 2,300 county sites is in the research archive and
          is not shown. It assigned dates to the wrong fields. El Paso’s registration-open day was
          stored as the deadline. Workbook phones were scraped August 6, 2026 and are labeled that way.
          Web addresses built from an email domain are omitted. Priority scores from the old deck are
          omitted. This file does not list parcels, and a county outline is not a property.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Catalog built {catalog.built}. {catalog.countyCount.toLocaleString()} counties. {catalog.sourceArchive}. A
          correction replaces that county’s reading. A date is added only when the page prints it.
        </p>
      </section>
    </main>
  );
}
