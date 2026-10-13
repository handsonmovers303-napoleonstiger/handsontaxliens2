/** Bundled sale dates for the push server. Live browser corrections are not in this file. */

export function saleEventsFromSource(text) {
  const saleAt = text.indexOf("const _bundled_NEXT_SALE");
  const levelAt = text.indexOf("const _bundled_SALE_DATE_LEVEL");
  const deadAt = text.indexOf("const _bundled_HARD_DEADLINES");
  const saleEnd = text.indexOf("const PATTERNS", saleAt);
  const levelEnd = text.indexOf("const SALE_WINDOW", levelAt);
  const deadEnd = text.indexOf("function deadlineTide", deadAt);
  if (saleAt < 0 || levelAt < 0 || deadAt < 0) throw new Error("Sale date tables were not found.");
  const derived = new Set([...text.slice(levelAt, levelEnd).matchAll(/"([^"]+)": "DERIVED"/g)].map((m) => m[1]));
  const events = [];
  for (const m of text.slice(saleAt, saleEnd).matchAll(/"([^"]+)": "(\d{4}-\d{2}-\d{2})"/g)) {
    const [state, name] = m[1].split("|");
    if (!name) continue;
    const level = derived.has(m[1]) ? "DERIVED" : "ON_FILE";
    events.push({
      id: `sale:${m[1]}:${m[2]}`, kind: "sale", key: m[1], name, state, iso: m[2], level,
      note: level === "DERIVED" ? "Derived from the state sale cycle, not a separate page for this county." : null,
    });
  }
  for (const m of text.slice(deadAt, deadEnd).matchAll(/"([^"]+)":\s*\{[^}]*iso: "(\d{4}-\d{2}-\d{2})"/g)) {
    const [state, name] = m[1].split("|");
    if (!name) continue;
    events.push({ id: `reg:${m[1]}:${m[2]}`, kind: "registration", key: m[1], name, state, iso: m[2], level: "ON_FILE", note: null });
  }
  return events;
}
