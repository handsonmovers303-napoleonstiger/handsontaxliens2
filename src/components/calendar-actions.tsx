import { LEVEL_LABEL } from "@/data/copy";
import { formatIso } from "@/data/catalog";
import type { CalEvent, County } from "@/data/types";
import { downloadIcs, eventKindLabel, googleCalendarUrl, icsFilename } from "@/lib/calendar";
import { buttonClass } from "./ui";

export function CalendarActions({ county, events }: { county: County; events?: CalEvent[] }) {
  const list = events ?? county.events;
  if (!list.length) {
    return (
      <p className="text-sm text-muted">
        No single-day date is on file, so there is nothing to add to a calendar. A text window
        without a day stays in the county file and is not turned into an event.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {list.map((event) => (
        <div key={event.id} className="border border-line bg-bg p-3">
          <p className="text-sm font-medium">{eventKindLabel(event.kind)}</p>
          <p className="mt-1 font-mono text-sm text-fg">{formatIso(event.iso)}</p>
          <p className="mt-1 text-xs text-muted">{LEVEL_LABEL[event.level]}</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <a
              className={buttonClass("gold")}
              href={googleCalendarUrl(county, event)}
              target="_blank"
              rel="noreferrer"
            >
              Add to Google Calendar
            </a>
            <button
              type="button"
              className={buttonClass("ghost")}
              onClick={() => downloadIcs(county, [event], icsFilename(county, event))}
            >
              Download .ics
            </button>
          </div>
        </div>
      ))}
      {list.length > 1 ? (
        <button
          type="button"
          className={buttonClass("quiet")}
          onClick={() => downloadIcs(county, list, icsFilename(county))}
        >
          Download every date for this county
        </button>
      ) : null}
    </div>
  );
}
