import checks from "./linkChecks.json" with { type: "json" };

export function normLink(url) {
  try {
    const u = new URL(url);
    u.hash = "";
    let s = u.toString();
    if (s.endsWith("/") && u.pathname !== "/") s = s.slice(0, -1);
    return s;
  } catch {
    return String(url || "").trim();
  }
}

function unpackPacked(u) {
  if (!u) return "";
  if (u.startsWith("https://") || u.startsWith("http://")) return u;
  if (u.startsWith("w:")) return "https://www." + u.slice(2);
  if (u.startsWith("h:")) return "https://" + u.slice(2);
  if (u.startsWith("pw:")) return "http://www." + u.slice(3);
  if (u.startsWith("p:")) return "http://" + u.slice(2);
  return "";
}

/**
 * Turn a scraped string into one web address.
 * Returns null when the stored text is an email or a placeholder, not a page.
 * Does not invent a county page that was not in the string.
 */
export function repairLink(url) {
  if (!url || typeof url !== "string") return null;
  let s = url.trim().replace(/\s+/g, " ");
  const glue = s.match(/^(https?:\/\/\S*?)\s+((?:https?:\/\/|pw:|[hwp]:).+)$/i);
  if (glue) {
    const second = unpackPacked(glue[2].trim());
    if (second) return repairLink(second);
  }
  s = s.replace(/\/\s+\//g, "/");
  if (/mailto:/i.test(s) || /javascript:/i.test(s)) return null;
  s = s.replace(/^(https?:\/\/)([^/\s]+)\/\/\2(?=\/|$)/i, "$1$2");
  s = s.replace(/([^./])\.$/, "$1");
  try {
    const u = new URL(s);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    if (!u.hostname.includes(".")) return null;
    return u.toString();
  } catch {
    return null;
  }
}

export function lookupLink(url, book = checks) {
  if (!url || !book?.urls) return null;
  const key = normLink(url);
  const bare = key.endsWith("/") ? key.slice(0, -1) : key;
  let decoded = key;
  try { decoded = decodeURI(key); } catch { decoded = key; }
  return book.urls[key] || book.urls[url] || book.urls[bare] || book.urls[`${bare}/`] || book.urls[decoded] || null;
}

/** Prefer a stored address that actually answers. Never swaps in a page we have not requested. */
export function presentLink(url, book = checks) {
  const repaired = repairLink(url);
  if (!repaired) return null;
  if (repaired.startsWith("http://")) {
    const https = `https://${repaired.slice("http://".length)}`;
    const current = lookupLink(repaired, book);
    const better = lookupLink(https, book);
    if (current && current.ok === false && better?.ok) return https;
  }
  if (/\s/.test(url)) return repaired;
  if (normLink(repaired) === normLink(url)) return url;
  return repaired;
}

/** Reachability only. Official still means the page was opened and read. */
export function linkStatus(url, level, book = checks) {
  const shown = presentLink(url, book);
  const row = lookupLink(shown || url, book) || (shown && shown !== url ? lookupLink(url, book) : null);
  const day = book?.checkedAt || "the last check";
  if (level === "OFFICIAL") {
    if (row && row.ok === false) {
      return { status: "Stale", checked: day, note: `Opened and read before. The link did not respond on ${day}${row.status ? ` (HTTP ${row.status})` : row.error ? ` (${row.error})` : ""}.` };
    }
    return { status: "Source-supported", checked: day, note: "Official link on file." };
  }
  if (!url) return { status: "Not checked", checked: null, note: "Not on file." };
  if (!shown) return { status: "Not checked", checked: null, note: "The stored value is not one web address." };
  if (!row) return { status: "Not checked", checked: null, note: "A link is stored. It has not been requested yet." };
  if (row.ok) return { status: "Checked", checked: day, note: `The link responded on ${day} (HTTP ${row.status}). The page was not read.` };
  const why = row.status ? `HTTP ${row.status}` : row.error || "no response";
  return { status: "Unavailable", checked: day, note: `The link did not respond on ${day} (${why}). That is not proof the office removed the page.` };
}

const TONE = { "Source-supported": "gr", Checked: "cy", Unavailable: "rd", Stale: "am", "Not checked": "am" };

/** Short chip for a stored link. Read is stronger than Checked. */
export function linkChip(url, level, book) {
  const mark = linkStatus(url, level, book);
  return { ...mark, tone: TONE[mark.status] || "", word: mark.status === "Source-supported" ? "Read" : mark.status };
}