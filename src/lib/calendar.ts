import { caveatText, LEVEL_LABEL } from "@/data/copy";
import { formatIso } from "@/data/catalog";
import type { CalEvent, County } from "@/data/types";

function addDays(iso: string, days: number): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  date.setDate(date.getDate() + days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function compact(iso: string): string {
  return iso.replace(/-/g, "");
}

export function eventDetails(county: County, event: CalEvent): string {
  const caveat = county.facts.find((fact) => fact.label === "Auction date" && event.kind === "sale")?.caveat;
  const caveatLine = event.kind === "sale" ? caveatText(caveat) : null;
  const source = event.source
    ? `Source: ${event.source.title}${event.source.url ? ` (${event.source.url})` : ""}${event.source.retrieved ? `, ${event.source.retrieved}` : ""}.`
    : "";
  const confidence = `Confidence: ${LEVEL_LABEL[event.level]}.`;
  return [event.details, caveatLine, confidence, source, "Hands On Tax Liens research file. Not financial, legal, or tax advice."]
    .filter(Boolean)
    .join("\n\n");
}

export function googleCalendarUrl(county: County, event: CalEvent): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${compact(event.iso)}/${compact(addDays(event.iso, 1))}`,
    details: eventDetails(county, event),
  });
  if (event.location) params.set("location", event.location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function icsEscape(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function fold(line: string): string {
  const max = 73;
  if (line.length <= max) return line;
  const parts = [line.slice(0, max)];
  for (let i = max; i < line.length; i += 72) parts.push(` ${line.slice(i, i + 72)}`);
  return parts.join("\r\n");
}

export function buildIcs(county: County, list: CalEvent[]): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Hands On Tax Liens//County Atlas//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];
  for (const event of list) {
    const details = eventDetails(county, event);
    lines.push("BEGIN:VEVENT");
    lines.push(fold(`UID:${event.id}@handsontaxliens`));
    lines.push(`DTSTAMP:${stamp}`);
    lines.push(`DTSTART;VALUE=DATE:${compact(event.iso)}`);
    lines.push(`DTEND;VALUE=DATE:${compact(addDays(event.iso, 1))}`);
    lines.push(fold(`SUMMARY:${icsEscape(event.title)}`));
    lines.push(fold(`DESCRIPTION:${icsEscape(details)}`));
    if (event.location) lines.push(fold(`LOCATION:${icsEscape(event.location)}`));
    if (event.source?.url) lines.push(fold(`URL:${event.source.url}`));
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return `${lines.join("\r\n")}\r\n`;
}

export function downloadIcs(county: County, list: CalEvent[], filename: string) {
  const blob = new Blob([buildIcs(county, list)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function eventKindLabel(kind: CalEvent["kind"]): string {
  if (kind === "sale") return "Auction";
  if (kind === "registration") return "Registration deadline";
  if (kind === "payment") return "Payment deadline";
  return "Reminder";
}

export function icsFilename(county: County, event?: CalEvent): string {
  const slug = `${county.name}-${county.state}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  if (!event) return `${slug}-dates.ics`;
  return `${slug}-${event.kind}-${event.iso}.ics`;
}

export function displayDate(iso: string): string {
  return formatIso(iso);
}
