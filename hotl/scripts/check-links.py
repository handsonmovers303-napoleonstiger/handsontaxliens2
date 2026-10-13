#!/usr/bin/env python3
"""Request every stored http(s) link once. A response is not a reading of the page."""
import json, re, socket, ssl, time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = Path("/workspace/hotl")
OUT = ROOT / "src/holo/linkChecks.json"
SRC = ROOT / "src"

def unpack(u):
    if not u:
        return ""
    if u.startswith("https://") or u.startswith("http://"):
        return u
    if u.startswith("w:"):
        return "https://www." + u[2:]
    if u.startswith("h:"):
        return "https://" + u[2:]
    if u.startswith("pw:"):
        return "http://www." + u[3:]
    if u.startswith("p:"):
        return "http://" + u[2:]
    return ""

def norm(url):
    url = url.split("#", 1)[0].strip().rstrip(".,);")
    if url.endswith("/") and url.count("/") > 2:
        url = url[:-1]
    return url

def collect():
    found = set()
    for path in SRC.rglob("*"):
        if path.suffix not in {".js", ".jsx", ".json"}:
            continue
        text = path.read_text(errors="replace")
        for raw in re.findall(r"https?://[^\s\"'`<>\\)]+", text):
            url = norm(raw)
            if not url or any(tok in url for tok in ("{z}", "{y}", "{x}", "localhost", "127.0.0.1", "${")):
                continue
            if len(url) > 400 or " " in url:
                continue
            found.add(url)
    scouting = (SRC / "legacy/ScoutingDept.jsx").read_text(errors="replace")
    start = scouting.find("const _NAT = `")
    end = scouting.find("`;", start)
    nat = scouting[start:end]
    for line in nat.splitlines():
        parts = line.split("|")
        if len(parts) < 23:
            continue
        for col in (13, 18, 23):
            got = unpack(parts[col])
            if got:
                found.add(norm(got))
        blob = parts[22]
        if not blob:
            continue
        for piece in blob.split(","):
            i = piece.find(":")
            if i < 0:
                continue
            u, _, _lv = piece[i + 1:].partition("~")
            got = unpack(u)
            if got:
                found.add(norm(got))
    clean = []
    for url in sorted(found):
        host = url.split("/")[2] if "://" in url else ""
        if "." not in host or len(host) < 4:
            continue
        clean.append(url)
    return clean

CTX = ssl.create_default_context()
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

def one(url):
    req = Request(url, headers={"User-Agent": UA, "Accept": "text/html,application/xhtml+xml,*/*;q=0.8"})
    try:
        with urlopen(req, timeout=8, context=CTX) as res:
            res.read(200)
            code = getattr(res, "status", 200)
            return url, {"ok": 200 <= code < 400, "status": code}
    except HTTPError as err:
        return url, {"ok": False, "status": err.code}
    except URLError as err:
        reason = err.reason
        if isinstance(reason, socket.timeout):
            label = "timeout"
        else:
            label = str(reason).split("]")[-1].strip()[:120] or type(reason).__name__
        return url, {"ok": False, "error": label}
    except Exception as err:
        return url, {"ok": False, "error": type(err).__name__}

def main():
    urls = collect()
    print(f"checking {len(urls)}", flush=True)
    done = {}
    ok = fail = 0
    started = time.time()
    with ThreadPoolExecutor(max_workers=16) as pool:
        futures = [pool.submit(one, url) for url in urls]
        for n, fut in enumerate(as_completed(futures), 1):
            url, row = fut.result()
            done[url] = row
            if row.get("ok"):
                ok += 1
            else:
                fail += 1
            if n % 200 == 0 or n == len(urls):
                print(f"{n}/{len(urls)} ok={ok} fail={fail} {int(time.time()-started)}s", flush=True)
    payload = {
        "checkedAt": "2026-10-11",
        "method": "HTTP GET, redirects followed, 8 second limit. A response means the link answered. The page was not read.",
        "checked": ok,
        "failed": fail,
        "urls": done,
    }
    OUT.write_text(json.dumps(payload, separators=(",", ":")))
    print(f"wrote {OUT} ok={ok} fail={fail}", flush=True)

if __name__ == "__main__":
    main()
