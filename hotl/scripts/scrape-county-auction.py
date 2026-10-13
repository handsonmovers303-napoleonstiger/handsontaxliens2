#!/usr/bin/env python3
"""Fetch each app county's own tax page and copy only sentences that are on it.

A sentence is kept only when it is a substring of the fetched page. Nothing is
rewritten into a verification. A shared URL, a failed fetch, and a page that
does not say the fact all stay blank.

  python3 scripts/scrape-county-auction.py --states CO,AZ --out src/holo/auction-shards/co-az.json
"""
import argparse
import html
import json
import re
import ssl
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import date
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
NAT = ROOT / "src" / "legacy" / "ScoutingDept.jsx"
TODAY = date.today().isoformat()
CTX = ssl.create_default_context()
LOOSE = ssl._create_unverified_context()
BROWSER = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15",
)
MONTHS = {
    "january": 1, "february": 2, "march": 3, "april": 4, "may": 5, "june": 6,
    "july": 7, "august": 8, "september": 9, "october": 10, "november": 11, "december": 12,
}
PLATFORMS = (
    "RealAuction", "GovEase", "LienHub", "RealTaxLien", "Bid4Assets",
    "CivicSource", "Grant Street", "Zeus Auction", "Public Surplus", "GovDeals",
)
DATE_WORD = re.compile(
    r"\b(January|February|March|April|May|June|July|August|September|October|November|December)"
    r"\s+(\d{1,2}),?\s+(20\d{2})\b",
    re.I,
)
DATE_NUM = re.compile(r"\b(0?[1-9]|1[0-2])/(0?[1-9]|[12]\d|3[01])/(20\d{2})\b")
EMAIL = re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.I)
DOLLAR = re.compile(r"\$\s?\d{1,3}(?:,\d{3})*(?:\.\d{2})?")


def collapse(value):
    return re.sub(r"\s+", " ", value or "").strip()


def html_to_text(raw):
    raw = re.sub(r"(?is)<(script|style|noscript).*?</\1>", " ", raw)
    raw = re.sub(r"(?i)<br\s*/?>", ". ", raw)
    raw = re.sub(r"(?i)</p>", ". ", raw)
    raw = re.sub(r"(?s)<[^>]+>", " ", raw)
    return collapse(html.unescape(raw))


def sentences(text):
    parts = re.split(r"(?<=[.!?])\s+", text)
    return [p for p in (collapse(p) for p in parts) if 30 <= len(p) <= 360]


def on_page(quote, text):
    quote = collapse(quote)
    if len(quote) < 20 or quote.lower() not in text.lower():
        return None
    return quote[:280]


def iso_in(sentence):
    word = DATE_WORD.search(sentence)
    if word:
        month = MONTHS[word.group(1).lower()]
        day = int(word.group(2))
        year = int(word.group(3))
        if 1 <= day <= 31:
            return f"{year:04d}-{month:02d}-{day:02d}", word.group(0)
    num = DATE_NUM.search(sentence)
    if num:
        month, day, year = int(num.group(1)), int(num.group(2)), int(num.group(3))
        return f"{year:04d}-{month:02d}-{day:02d}", num.group(0)
    return None, None


def field(value, quote):
    if not value or not quote:
        return None
    return {"value": collapse(value)[:160], "quote": quote}


def links(raw, page_url):
    found = []
    for href, label in re.findall(r'(?is)<a\b[^>]*href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', raw):
        label = collapse(re.sub(r"(?s)<[^>]+>", " ", label))
        if not label or not re.search(r"delinquent|sale list|tax sale|parcel list|certificate", label, re.I):
            continue
        url = urljoin(page_url, html.unescape(href.strip()))
        if url.startswith("http"):
            found.append((url, label[:160]))
    return found


def window(text, start, end, radius=140):
    quote = text[max(0, start - radius):min(len(text), end + radius)].strip()
    return on_page(quote, text)


def extract(raw, page_url):
    text = html_to_text(raw)
    out = {"platform": None, "cadence": None, "deadline": None, "saleDate": None, "deposit": None, "inventory": None, "email": None}

    for name in PLATFORMS:
        idx = text.lower().find(name.lower())
        if idx < 0:
            continue
        quote = window(text, idx, idx + len(name), 80)
        if quote:
            out["platform"] = field(name, quote)
            break

    for match in re.finditer(r"tax sale|tax auction|certificate sale|delinquent tax", text, re.I):
        quote = window(text, match.start(), match.end(), 90)
        if not quote:
            continue
        low = quote.lower()
        if re.search(r"\bmonthly\b", low):
            label = "Monthly"
        elif re.search(r"\bquarterly\b", low):
            label = "Quarterly"
        elif re.search(r"annual|each year|every year|once a year", low):
            label = "Annual"
        else:
            continue
        out["cadence"] = field(label, quote)
        break

    for match in DATE_WORD.finditer(text):
        quote = window(text, match.start(), match.end(), 80)
        if not quote or "registration" not in quote.lower():
            continue
        iso, _shown = iso_in(match.group(0))
        if iso:
            out["deadline"] = field(match.group(0), quote)
            out["deadline"]["iso"] = iso
            break
    if not out["deadline"]:
        for match in DATE_NUM.finditer(text):
            quote = window(text, match.start(), match.end(), 80)
            if not quote or "registration" not in quote.lower():
                continue
            iso, _shown = iso_in(match.group(0))
            if iso:
                out["deadline"] = field(match.group(0), quote)
                out["deadline"]["iso"] = iso
                break

    for match in DATE_WORD.finditer(text):
        quote = window(text, match.start(), match.end(), 80)
        if not quote or "registration" in quote.lower():
            continue
        if not re.search(r"tax sale|auction|sale date|certificate sale", quote, re.I):
            continue
        iso, _shown = iso_in(match.group(0))
        if iso:
            out["saleDate"] = field(match.group(0), quote)
            out["saleDate"]["iso"] = iso
            break

    dep = re.search(r"deposit", text, re.I)
    if dep:
        quote = window(text, dep.start(), dep.end(), 80)
        amount = DOLLAR.search(quote or "")
        if quote and amount:
            out["deposit"] = field(amount.group(0).replace(" ", ""), quote)

    for url, label in links(raw, page_url):
        if on_page(label, text) or label.lower() in text.lower():
            out["inventory"] = {"value": label, "url": url, "quote": label}
            break

    mail = EMAIL.search(text)
    while mail:
        quote = window(text, mail.start(), mail.end(), 70)
        if quote and re.search(r"treasurer|tax collector|tax@", quote, re.I):
            out["email"] = field(mail.group(0), quote)
            break
        mail = EMAIL.search(text, mail.end())
    return out


def load_targets(states):
    text = NAT.read_text(encoding="utf-8")
    start = text.find("const _NAT = `")
    end = text.find("`;", start)
    rows = []
    uses = {}
    for line in text[start + len("const _NAT = `"):end].split("\n"):
        if not line.strip():
            continue
        parts = line.split("|")
        while len(parts) < 16:
            parts.append("")
        url = parts[13].strip()
        uses[url] = uses.get(url, 0) + 1
        rows.append({
            "fips": parts[2].zfill(5),
            "name": parts[0],
            "state": parts[1],
            "url": url if url.startswith("http") else "",
            "alts": alt_urls(parts[22] if len(parts) > 22 else "", parts[23] if len(parts) > 23 else ""),
        })
    if states:
        want = {s.strip().upper() for s in states.split(",") if s.strip()}
        rows = [r for r in rows if r["state"] in want]
    for row in rows:
        row["shared"] = bool(row["url"] and uses.get(row["url"], 0) > 1 and row["name"].lower().replace(" ", "") not in row["url"].lower().replace("-", ""))
    return rows


def unpack_url(value):
    value = (value or "").strip()
    if value.startswith("w:"):
        return "https://www." + value[2:]
    if value.startswith("h:"):
        return "https://" + value[2:]
    if value.startswith("pw:"):
        return "http://www." + value[3:]
    if value.startswith("p:"):
        return "http://" + value[2:]
    return value if value.startswith("http") else ""


def alt_urls(packed, site):
    ranked = []
    if site.strip():
        ranked.append((3, unpack_url(site.strip())))
    for part in packed.split(","):
        if ":" not in part:
            continue
        kind, rest = part.split(":", 1)
        url = unpack_url(rest.split("~", 1)[0])
        rank = {"tr": 0, "pl": 1, "ot": 2}.get(kind, 5)
        ranked.append((rank, url))
    out = []
    for _, url in sorted(ranked, key=lambda item: item[0]):
        host = (urlparse(url).hostname or "").lower()
        if not url.startswith("http") or "floridarevenue.com" in host or url in out:
            continue
        out.append(url)
    return out[:4]
    return "https://" + url[len("http://"):] if str(url).startswith("http://") else None


def https_twin(url):
    return "https://" + url[len("http://"):] if str(url).startswith("http://") else None


def fallback_urls(url):
    parsed = urlparse(url)
    found = []
    path = (parsed.path or "").rstrip("/")
    if path and path != "/":
        parent = path.rsplit("/", 1)[0]
        found.append(parsed._replace(path=(parent + "/" if parent else "/"), query="", fragment="").geturl())
        found.append(f"{parsed.scheme}://{parsed.netloc}/")
    twin = https_twin(url)
    if twin:
        found.append(twin)
    out = []
    for item in found:
        if item and item != url and item not in out:
            out.append(item)
    return out


def ssl_problem(exc):
    reason = getattr(exc, "reason", exc)
    text = f"{type(exc).__name__} {reason}".upper()
    return isinstance(reason, ssl.SSLError) or "CERTIFICATE" in text or "SSL" in text or "TLS" in text


def open_once(url, ua, ctx, timeout):
    current = url
    seen = set()
    for _ in range(5):
        if current in seen:
            raise URLError("redirect loop")
        seen.add(current)
        req = Request(current, headers={
            "User-Agent": ua,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
        })
        try:
            with urlopen(req, timeout=timeout, context=ctx) as response:
                raw = response.read(900_000)
                charset = response.headers.get_content_charset() or "utf-8"
                ctype = (response.headers.get("content-type") or "").lower()
                return response.geturl(), response.status, raw.decode(charset, "replace"), ctype
        except HTTPError as exc:
            loc = exc.headers.get("Location") if exc.headers else None
            if exc.code in (301, 302, 303, 307, 308) and loc:
                nxt = urljoin(current, loc.strip())
                current = https_twin(nxt) or nxt
                continue
            raise
    raise URLError("too many redirects")


def open_page(url):
    """Try the stored address, then the secure twin, a second browser, a longer wait, and the site root."""
    queue = [(url, BROWSER[0], CTX, 16, None)]
    tried = set()
    last = {"error": "URLError"}
    while queue and len(tried) < 8:
        target, ua, ctx, timeout, note = queue.pop(0)
        key = (target, ua, ctx is LOOSE, timeout)
        if not target or key in tried:
            continue
        tried.add(key)
        try:
            final, status, text, ctype = open_once(target, ua, ctx, timeout)
        except HTTPError as exc:
            last = {"http": exc.code}
            if exc.code == 403 and ua == BROWSER[0]:
                queue.append((target, BROWSER[1], ctx, timeout, note))
            elif exc.code == 404:
                for nxt in fallback_urls(target):
                    queue.append((nxt, ua, CTX, timeout, note))
            elif exc.code in (429, 500, 502, 503, 504, 525) and timeout == 16:
                queue.append((target, ua, ctx, 24, note))
            continue
        except (URLError, TimeoutError, OSError, ssl.SSLError) as exc:
            last = {"error": type(getattr(exc, "reason", exc)).__name__ if ssl_problem(exc) else type(exc).__name__}
            if ssl_problem(exc) and ctx is not LOOSE:
                queue.insert(0, (target, ua, LOOSE, timeout, "tls-unverified"))
            elif timeout == 16 and type(exc).__name__ in ("TimeoutError", "ConnectionResetError"):
                queue.append((target, ua, ctx, 24, note))
            twin = https_twin(target)
            if twin:
                queue.append((twin, BROWSER[0], CTX, timeout, note))
            continue
        if "pdf" in ctype or text.lstrip().startswith("%PDF"):
            last = {"error": "pdf"}
            continue
        return {"ok": True, "url": final, "http": status, "text": text, "tls": note}
    return {"ok": False, **last}


def one(row):
    base = {"fips": row["fips"], "name": row["name"], "state": row["state"], "pulled": TODAY}
    if not row["url"] and not row.get("alts"):
        return {**base, "status": row.get("keep") or "no-url", "url": None}
    if row.get("shared") and not row.get("alts"):
        return {**base, "status": "shared-url", "url": row["url"]}
    opened = None
    for url in ([row["url"]] if row["url"] and not row.get("shared") else []) + row.get("alts", []):
        opened = open_page(url)
        if opened.get("ok"):
            break
    if not opened or not opened.get("ok"):
        fail = {k: opened[k] for k in ("http", "error") if opened and k in opened}
        return {**base, "status": row.get("keep") or "fetch-failed", "url": row["url"] or None, **fail}
    found = extract(opened["text"], opened["url"])
    out = {**base, "status": "fetched", "url": opened["url"], "http": opened["http"], **found}
    if opened.get("tls"):
        out["tls"] = opened["tls"]
    return out


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--states", default="")
    parser.add_argument("--out", required=True)
    parser.add_argument("--workers", type=int, default=8)
    parser.add_argument("--retry-failed", default="")
    args = parser.parse_args()
    rows = load_targets(args.states)
    if args.retry_failed:
        prev = json.loads(Path(args.retry_failed).read_text(encoding="utf-8"))
        rest = {fid: row for fid, row in prev.get("counties", {}).items() if row.get("status") != "fetched"}
        rows = [row for row in rows if row["fips"] in rest]
        for row in rows:
            previous = rest[row["fips"]]
            row["keep"] = previous.get("status")
            if previous.get("status") == "fetch-failed":
                row["url"] = ""
                row["shared"] = False
            row["alts"] = [url for url in row["alts"] if url != previous.get("url")]
        uses = {}
        for row in rows:
            for url in row["alts"]:
                uses[url] = uses.get(url, 0) + 1
        for row in rows:
            token = re.sub(r"[^a-z]", "", row["name"].lower())
            row["alts"] = [
                url for url in row["alts"]
                if uses[url] == 1 or (len(token) >= 4 and token in re.sub(r"[^a-z0-9]", "", url.lower()))
            ]
    counties = {}
    with ThreadPoolExecutor(max_workers=max(1, args.workers)) as pool:
        futures = [pool.submit(one, row) for row in rows]
        for future in as_completed(futures):
            row = future.result()
            counties[row.pop("fips")] = row
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    payload = {"pulled": TODAY, "states": args.states, "counties": dict(sorted(counties.items()))}
    out.write_text(json.dumps(payload, separators=(",", ":")))
    counts = {}
    for row in counties.values():
        counts[row["status"]] = counts.get(row["status"], 0) + 1
    copied = sum(1 for row in counties.values() if any(row.get(k) for k in ("platform", "cadence", "deadline", "saleDate", "deposit", "inventory", "email")))
    print(f"counties {len(counties)} with-a-copied-sentence {copied} {counts} -> {out}")


if __name__ == "__main__":
    main()
