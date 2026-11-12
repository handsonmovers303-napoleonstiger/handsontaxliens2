import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { AtlasMap } from "@/components/atlas-map";
import { CountyView } from "@/components/county-view";
import { Chip } from "@/components/ui";
import { catalog, counties, events, formatIso, getCounty, todayIso, whenLabel } from "@/data/catalog";
import { systemLabel } from "@/data/copy";

type AtlasSearch = { fips?: string };

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): AtlasSearch => {
    const raw = typeof search.fips === "string" ? search.fips.replace(/\D/g, "") : "";
    if (!raw) return {};
    return { fips: raw.padStart(5, "0") };
  },
  head: () => ({
    meta: [
      { title: "Atlas · Hands On Tax Liens" },
      {
        name: "description",
        content:
          "County atlas of tax lien and tax deed sales. Map, sale terms, and calendar dates from county and statute sources.",
      },
    ],
  }),
  component: AtlasPage,
});

const STATE_OPTIONS = [...new Set(counties.map((county) => county.state))].sort();

function AtlasPage() {
  const { fips = "" } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [query, setQuery] = useState("");
  const [system, setSystem] = useState<"all" | "lien" | "deed">("all");
  const [datedOnly, setDatedOnly] = useState(false);
  const [state, setState] = useState("");
  const selected = getCounty(fips);
  const today = todayIso();

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return counties
      .filter((county) => `${county.name} ${county.state} ${county.stateName} ${county.fips}`.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query]);

  const upcoming = events.filter((event) => event.level !== "derived" && event.iso >= today).slice(0, 6);
  const dated = new Set(events.filter((event) => event.level !== "derived").map((event) => event.fips)).size;

  function choose(next: string) {
    setQuery("");
    void navigate({ search: { fips: next } });
  }

  return (
    <div className="flex flex-1 flex-col lg:flex-row lg:min-h-0">
      <div className="map-stage relative shrink-0 lg:min-h-0 lg:flex-1">
        <AtlasMap
          selected={fips}
          system={system}
          datedOnly={datedOnly}
          state={state}
          onSelect={choose}
        />
        <div className="map-overlay pointer-events-none absolute inset-x-0 top-0 flex flex-col gap-2 p-3 sm:max-w-xl">
          <form
            className="pointer-events-auto relative"
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              if (matches[0]) choose(matches[0].fips);
            }}
          >
            <Search className="pointer-events-none absolute top-3 left-3 size-4 text-muted" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search counties"
              aria-label="Search counties"
              className="h-11 w-full border border-line bg-bg pr-3 pl-10 text-sm text-fg outline-none placeholder:text-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            />
            {matches.length ? (
              <ul className="absolute mt-1 w-full border border-line bg-bg-elev" role="listbox">
                {matches.map((county) => (
                  <li key={county.fips}>
                    <button
                      type="button"
                      className="flex h-11 w-full items-center justify-between px-3 text-left text-sm hover:bg-bg-subtle"
                      onClick={() => choose(county.fips)}
                    >
                      <span>
                        {county.name} County, {county.state}
                      </span>
                      <span className="font-mono text-xs text-muted">{systemLabel(county.system)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </form>
          <div className="pointer-events-auto flex flex-wrap gap-2">
            <Chip on={system === "all"} onClick={() => setSystem("all")}>
              All
            </Chip>
            <Chip on={system === "lien"} onClick={() => setSystem("lien")}>
              Lien
            </Chip>
            <Chip on={system === "deed"} onClick={() => setSystem("deed")}>
              Deed
            </Chip>
            <Chip on={datedOnly} onClick={() => setDatedOnly((value) => !value)}>
              Dated sale
            </Chip>
            <label className="sr-only" htmlFor="state-filter">
              State
            </label>
            <select
              id="state-filter"
              value={state}
              onChange={(event) => {
                setState(event.target.value);
                void navigate({ search: {} });
              }}
              className="h-11 border border-line bg-bg px-3 text-sm text-fg"
            >
              <option value="">Every state</option>
              {STATE_OPTIONS.map((abbr) => (
                <option key={abbr} value={abbr}>
                  {abbr}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="map-legend pointer-events-none absolute inset-x-0 bottom-0 bg-bg px-3 py-2 font-mono text-xs text-fg">
          {catalog.countyCount.toLocaleString()} counties · {dated} with a dated sale on file · steel is a
          workbook lien, clay is a workbook deed, gold outline is a date
        </p>
      </div>
      <aside className="atlas-aside border-line lg:border-l">
        {selected ? (
          <CountyView county={selected} mode="brief" />
        ) : (
          <div className="flex flex-col gap-5 p-4 sm:p-5">
            <div>
              <p className="font-mono text-xs tracking-widest text-gold">County atlas</p>
              <h1 className="mt-2 font-display text-3xl leading-tight">Where the sales are on file</h1>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Click a county. The file shows auction type, rate, redemption, format, platform, dates,
                deposit, and the official source when one has been opened. Empty fields stay empty.
              </p>
            </div>
            <section>
              <h2 className="font-display text-xl">Upcoming dates</h2>
              {upcoming.length === 0 ? (
                <p className="mt-2 text-sm text-muted">No future non-derived sale date is on file.</p>
              ) : (
                <ul className="mt-2">
                  {upcoming.map((event) => (
                    <li key={event.id} className="border-t border-line">
                      <button
                        type="button"
                        className="flex w-full flex-col items-start gap-1 py-3 text-left"
                        onClick={() => choose(event.fips)}
                      >
                        <span className="text-sm">
                          {event.name} County, {event.state}
                        </span>
                        <span className="font-mono text-xs text-muted">
                          {formatIso(event.iso)} · {whenLabel(event.iso, today)} · {event.kind}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <p className="text-xs leading-relaxed text-subtle">
              Iowa’s June 2027 cycle and a few Florida and Arizona days are derived from a statewide
              pattern. They stay off this list until you turn them on in Calendar. Census shapes are not
              parcel maps.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
