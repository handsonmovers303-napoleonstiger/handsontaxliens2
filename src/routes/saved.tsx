import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { useEffect, useState } from "react";
import { CalendarActions } from "@/components/calendar-actions";
import { SaveButton } from "@/components/county-view";
import { buttonClass } from "@/components/ui";
import { formatIso, getCounty, todayIso } from "@/data/catalog";
import { LEVEL_LABEL } from "@/data/copy";
import { useSaved } from "@/lib/saved";

export const Route = createFileRoute("/saved")({
  head: () => ({ meta: [{ title: "Saved · Hands On Tax Liens" }] }),
  component: SavedPage,
});

function SavedPage() {
  const ids = useSaved((state) => state.ids);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (useSaved.persist.hasHydrated()) setReady(true);
    return useSaved.persist.onFinishHydration(() => setReady(true));
  }, []);
  const today = todayIso();
  const counties = ids.map((id) => getCounty(id)).filter((county) => county != null);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6">
      <header>
        <p className="font-mono text-xs tracking-widest text-gold">Watch list</p>
        <h1 className="mt-2 font-display text-3xl">Saved counties</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Saved on this browser only. The list is the counties you are tracking, with whatever sale
          and registration dates are actually on file.
        </p>
      </header>

      {!ready ? <p className="text-sm text-muted">Loading your saved counties…</p> : null}

      {ready && counties.length === 0 ? (
        <div className="border border-line bg-bg-elev px-5 py-10 text-center">
          <Bookmark className="mx-auto size-6 text-gold" aria-hidden="true" />
          <h2 className="mt-3 font-display text-2xl">Nothing saved yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Open a county from the atlas and save it. The auction date and the registration deadline,
            when either one is a real day, can go on your calendar from here.
          </p>
          <Link to="/" className={`${buttonClass("gold")} mt-5`}>
            Browse the atlas
          </Link>
        </div>
      ) : null}

      {ready ? (
        <ul className="flex flex-col gap-4">
          {counties.map((county) => {
            const next = county.events.find((event) => event.iso >= today) || county.events[0];
            return (
              <li key={county.fips} className="border border-line bg-bg-elev p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-2xl">
                      {county.name} County, {county.state}
                    </h2>
                    {next ? (
                      <p className="mt-1 font-mono text-xs text-muted">
                        {next.kind} · {formatIso(next.iso)} · {LEVEL_LABEL[next.level]}
                      </p>
                    ) : (
                      <p className="mt-1 text-sm text-subtle">No dated event on file.</p>
                    )}
                  </div>
                  <SaveButton fips={county.fips} />
                </div>
                <div className="mt-4">
                  <CalendarActions county={county} />
                </div>
                <Link
                  to="/county/$fips"
                  params={{ fips: county.fips }}
                  className="mt-3 inline-flex text-sm text-gold underline underline-offset-4"
                >
                  Open the county file
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </main>
  );
}
