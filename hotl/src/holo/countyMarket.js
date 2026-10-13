import raw from "./countyMarket.json";

export const MARKET_PULLED = raw.pulled;
export const MARKET_SOURCES = raw.sources;

export function marketFor(fips) {
  const id = String(fips ?? "").replace(/\D/g, "").padStart(5, "0");
  return raw.counties[id] || null;
}

const dollars = (n) => `$${Number(n).toLocaleString("en-US")}`;
const signed = (n) => `${n > 0 ? "+" : ""}${n}%`;

/** Display lines for the county file. Null means the source did not publish it. */
export function countyMarketLines(fips) {
  const m = marketFor(fips);
  if (!m) return { population: null, metro: null, growth: null, flood: null, wildfire: null, median: null, vacancy: null, note: null };
  const flood = (m.inlandFlood || m.coastalFlood)
    ? `Inland flooding ${m.inlandFlood || "not rated"} · Coastal flooding ${m.coastalFlood || "not rated"} · ${raw.sources.flood}. County rating, not a parcel flood zone. Check FEMA NFHL per parcel.`
    : null;
  return {
    population: m.pop != null ? `${m.pop.toLocaleString("en-US")} · ${m.popLabel || raw.sources.population}` : null,
    metro: m.metro === "metro" ? `Metro · ${m.metroName} · ${raw.sources.metro}`
      : m.metro === "micro" ? `Micro · ${m.metroName} · ${raw.sources.metro}`
      : m.metro === "neither" ? `Not in a metro or micro area · ${raw.sources.metro}` : null,
    growth: m.growthPct != null ? `${signed(m.growthPct)} · ${raw.sources.growth}` : null,
    flood,
    wildfire: m.wildfire ? `${m.wildfire} · ${raw.sources.wildfire}. County rating, not a parcel. Check the state risk map per parcel.` : null,
    median: m.medianValue != null ? `${dollars(m.medianValue)} · ${raw.sources.medianValue}. Not a parcel value.` : null,
    vacancy: m.vacantPct != null ? `${m.vacantPct}% of housing units vacant${m.units != null && m.vacant != null ? ` (${m.vacant.toLocaleString("en-US")} of ${m.units.toLocaleString("en-US")})` : ""} · ${raw.sources.vacancy}. Not a parcel occupancy check.` : null,
    note: m.note || null,
  };
}
