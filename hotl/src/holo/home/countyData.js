/** The only place the map card reads county facts. Swap the body later; keep the shape. */
export function getCountyData(fips, county) {
  return {
    fips: String(fips || ""),
    name: county?.name || "Unknown",
    state: county?.stateName || county?.state || "—",
    stat: "Liens available: —",
  };
}
