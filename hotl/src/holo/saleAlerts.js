/** Which on-file sale dates should alert this member. Dates are not created here. */

const LEADS = new Set([1, 7, 14, 30]);

export function daysBetweenIso(today, iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(today || "")) || !/^\d{4}-\d{2}-\d{2}$/.test(String(iso || ""))) return null;
  return Math.round((Date.parse(`${iso}T12:00:00Z`) - Date.parse(`${today}T12:00:00Z`)) / 86400000);
}

export function upcomingAlerts(events, { today, leadDays, watch, allSales }) {
  const lead = LEADS.has(Number(leadDays)) ? Number(leadDays) : 7;
  const watched = new Set(watch || []);
  return (events || []).filter((e) => {
    const days = daysBetweenIso(today, e.iso);
    if (days == null || days < 0 || days > lead) return false;
    if (allSales && e.kind === "sale") return true;
    return watched.has(e.key);
  }).map((e) => ({ ...e, days: daysBetweenIso(today, e.iso) }));
}

/** Collapse a same-day derived cycle so one alert is not ninety-nine notifications. */
export function presentAlerts(alerts) {
  const derived = alerts.filter((a) => a.kind === "sale" && a.level === "DERIVED");
  const rest = alerts.filter((a) => !(a.kind === "sale" && a.level === "DERIVED"));
  const groups = new Map();
  for (const a of derived) {
    const g = groups.get(a.iso) || { ...a, id: `sale:derived:${a.iso}`, name: a.state, names: [] };
    g.names.push(a.name);
    groups.set(a.iso, g);
  }
  const folded = [...groups.values()].map((g) => (g.names.length > 1 ? {
    ...g,
    name: `${g.names.length} ${g.state} counties`,
    note: "Derived from the state sale cycle, not a separate page for each county.",
  } : { ...g, name: g.names[0] }));
  return [...rest, ...folded].sort((a, b) => a.iso.localeCompare(b.iso) || a.name.localeCompare(b.name));
}

export function alertCopy(a) {
  const when = a.days === 0 ? "today" : a.days === 1 ? "tomorrow" : `in ${a.days} days`;
  const what = a.kind === "registration" ? "Registration deadline" : "Tax sale";
  const level = a.level === "DERIVED" ? "Derived date." : a.level === "LIVE" ? "Live correction." : "Date on file.";
  return {
    title: `${what} ${when}`,
    body: `${a.name}, ${a.state} · ${a.iso}. ${level}${a.note ? ` ${a.note}` : ""}`,
  };
}

export function salePushPayload(alert, base = "/") {
  const copy = alertCopy(alert);
  const root = base.endsWith("/") ? base : `${base}/`;
  return { type: "SHOW", title: copy.title, body: copy.body, tag: alert.id, url: `${root}#/calendar` };
}
