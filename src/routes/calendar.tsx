import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarActions } from "@/components/calendar-actions";
import { Button } from "@/components/ui";
import { events, formatIso, getCounty, todayIso, whenLabel, type DatedEvent } from "@/data/catalog";
import { LEVEL_LABEL } from "@/data/copy";

export const Route = createFileRoute("/calendar")({
  head: () => ({ meta: [{ title: "Calendar · Hands On Tax Liens" }] }),
  component: CalendarPage,
});

const WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function monthCells(year: number, month: number): Array<string | null> {
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells: Array<string | null> = [];
  for (let i = 0; i < first; i += 1) cells.push(null);
  for (let day = 1; day <= days; day += 1) {
    cells.push(`${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
  }
  while (cells.length % 7) cells.push(null);
  return cells;
}

function CalendarPage() {
  const today = todayIso();
  const now = new Date();
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [picked, setPicked] = useState(today);
  const [showDerived, setShowDerived] = useState(false);

  const visible = useMemo(
    () => events.filter((event) => showDerived || event.level !== "derived"),
    [showDerived],
  );
  const prefix = `${cursor.y}-${String(cursor.m + 1).padStart(2, "0")}`;
  const inMonth = visible.filter((event) => event.iso.startsWith(prefix));
  const byDay = new Map<string, DatedEvent[]>();
  for (const event of inMonth) {
    const list = byDay.get(event.iso) || [];
    list.push(event);
    byDay.set(event.iso, list);
  }
  const cells = monthCells(cursor.y, cursor.m);
  const label = new Date(cursor.y, cursor.m, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const dayEvents = visible.filter((event) => event.iso === picked);
  const upcoming = visible.filter((event) => event.iso >= today).slice(0, 8);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6">
      <header>
        <p className="font-mono text-xs tracking-widest text-gold">Dates on file</p>
        <h1 className="mt-2 font-display text-3xl">Calendar</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Each block is a day that a county page, a statute cycle, or the research file actually
          names. Derived statewide cycles stay hidden until you ask for them.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={() => setCursor((c) => (c.m === 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m: c.m - 1 }))}
        >
          Previous month
        </Button>
        <h2 className="min-w-40 text-center font-display text-xl">{label}</h2>
        <Button
          onClick={() => setCursor((c) => (c.m === 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m: c.m + 1 }))}
        >
          Next month
        </Button>
        <label className="ml-auto flex h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showDerived}
            onChange={(event) => setShowDerived(event.target.checked)}
          />
          Show derived cycles
        </label>
      </div>

      <div className="grid grid-cols-7 gap-px border border-line bg-line" role="grid" aria-label={label}>
        {WEEK.map((day) => (
          <div key={day} className="bg-bg-subtle px-1 py-2 text-center font-mono text-xs text-muted">
            {day}
          </div>
        ))}
        {cells.map((iso, index) => {
          const list = iso ? byDay.get(iso) || [] : [];
          const named = list.filter((event) => event.level !== "derived");
          const derived = list.length - named.length;
          return (
            <button
              key={iso || `empty-${index}`}
              type="button"
              disabled={!iso}
              onClick={() => iso && setPicked(iso)}
              aria-pressed={iso === picked}
              className={`min-h-24 bg-bg p-1 text-left ${iso === picked ? "outline outline-1 outline-gold" : ""} ${
                iso === today ? "bg-bg-subtle" : ""
              }`}
            >
              {iso ? <span className="font-mono text-xs text-muted">{Number(iso.slice(8))}</span> : null}
              {named.slice(0, 2).map((event) => (
                <span key={event.id} className="mt-1 block truncate text-xs text-fg">
                  {event.name}
                </span>
              ))}
              {named.length > 2 ? <span className="text-xs text-muted">+{named.length - 2}</span> : null}
              {derived > 0 ? <span className="mt-1 block text-xs text-subtle">{derived} derived</span> : null}
            </button>
          );
        })}
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-xl">{picked ? formatIso(picked) : "Pick a day"}</h2>
          {dayEvents.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Nothing on file for this day.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-4">
              {dayEvents.map((event) => {
                const county = getCounty(event.fips);
                if (!county) return null;
                return (
                  <li key={event.id} className="border border-line p-3">
                    <p className="text-sm font-medium">
                      {event.name} County, {event.state}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {event.kind} · {LEVEL_LABEL[event.level]} · {whenLabel(event.iso, today)}
                    </p>
                    <div className="mt-3">
                      <CalendarActions county={county} events={[event]} />
                    </div>
                    <Link
                      to="/county/$fips"
                      params={{ fips: event.fips }}
                      className="mt-2 inline-flex text-sm text-gold underline underline-offset-4"
                    >
                      Open the county file
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div>
          <h2 className="font-display text-xl">Still ahead</h2>
          {upcoming.length === 0 ? (
            <p className="mt-3 text-sm text-muted">
              No future date in the current filter. Larimer County’s November 19, 2026 sale is the
              next date opened on a treasurer page.
            </p>
          ) : (
            <ul className="mt-3">
              {upcoming.map((event) => (
                <li key={event.id} className="border-t border-line py-3">
                  <button type="button" className="text-left" onClick={() => {
                    setPicked(event.iso);
                    const [y, m] = event.iso.split("-");
                    setCursor({ y: Number(y), m: Number(m) - 1 });
                  }}>
                    <span className="block text-sm">
                      {event.name} County, {event.state}
                    </span>
                    <span className="font-mono text-xs text-muted">
                      {formatIso(event.iso)} · {event.kind} · {LEVEL_LABEL[event.level]}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
