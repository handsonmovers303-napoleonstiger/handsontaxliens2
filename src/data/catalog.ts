import raw from "./catalog.json";
import type { CalEvent, Catalog, County, StateRule } from "./types";

export const catalog = raw as Catalog;
export const counties: County[] = catalog.counties;
export const stateRules: Record<string, StateRule> = catalog.states;

const byFips = new Map(counties.map((c) => [c.fips, c]));

export function getCounty(fips: string | undefined | null): County | null {
  if (!fips) return null;
  const id = fips.replace(/\D/g, "").padStart(5, "0");
  return byFips.get(id) ?? null;
}

export function stateRule(abbr: string): StateRule | null {
  return stateRules[abbr] ?? null;
}

export type DatedEvent = CalEvent & {
  fips: string;
  name: string;
  state: string;
  stateName: string;
};

export function allEvents(): DatedEvent[] {
  const out: DatedEvent[] = [];
  for (const county of counties) {
    for (const event of county.events) {
      out.push({
        ...event,
        fips: county.fips,
        name: county.name,
        state: county.state,
        stateName: county.stateName,
      });
    }
  }
  out.sort((a, b) => a.iso.localeCompare(b.iso) || a.name.localeCompare(b.name));
  return out;
}

export const events = allEvents();

export function todayIso(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatIso(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function daysFromToday(iso: string, today = todayIso()): number {
  const a = Date.parse(`${iso}T12:00:00`);
  const b = Date.parse(`${today}T12:00:00`);
  return Math.round((a - b) / 86400000);
}

export function whenLabel(iso: string, today = todayIso()): string {
  const days = daysFromToday(iso, today);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days > 1) return `In ${days} days`;
  if (days === -1) return "Yesterday";
  return `${Math.abs(days)} days ago`;
}

const REQUIRED = [
  "Auction type",
  "Interest or penalty",
  "Redemption period",
  "Auction format",
  "Platform",
  "Auction date",
  "Registration deadline",
  "Deposit",
];

export function requiredFacts(county: County) {
  return REQUIRED.map((label) => county.facts.find((fact) => fact.label === label)).filter(
    (fact): fact is NonNullable<typeof fact> => !!fact,
  );
}

export function datedCounties(includeDerived = false): County[] {
  return counties.filter((county) =>
    county.events.some((event) => includeDerived || event.level !== "derived"),
  );
}
