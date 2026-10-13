#!/usr/bin/env python3
"""Resumable parcel-click discovery. A county is added only after a spatial query returns a polygon and a parcel id."""
import json, re, ssl, urllib.parse, urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

CTX = ssl.create_default_context()
COUNTIES = json.loads(Path("/tmp/hotl-counties.json").read_text())
OUT = Path("/tmp/expand-out.json")
LOG = Path("/workspace/hotl/data/parcel-coverage-log.json")
EVIDENCE = Path("/workspace/hotl/data/parcel-evidence.jsonl")
OWNER = re.compile(r"owner|taxpayer|mailname|ownname", re.I)
ID_RANK = [r"^apn$", r"^ain$", r"^pin$", r"^folio$", r"^parid$", r"^parcel_?id$", r"^parcelid$", r"^parcel_?no$", r"^parcelno$", r"^parcelnumber$", r"^print_?key$", r"^sbl$", r"^pid$", r"^prop_?id$", r"^strap$", r"parcel"]

CANDIDATES = [
    ("CO", "https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer/0", "parcel_id", "countyName"),
    ("NY", "https://services6.arcgis.com/EbVsqZ18sv1kVJ3k/arcgis/rest/services/NYS_Tax_Parcels_Public/FeatureServer/1", "PRINT_KEY", "COUNTY_NAME"),
    ("MA", "https://services1.arcgis.com/hGdibHYSPO59RG1h/arcgis/rest/services/L3_TAXPAR_POLY_ASSESS_gdb/FeatureServer/0", None, None),
    ("MT", "https://gisservicemt.gov/arcgis/rest/services/MSDI_Framework/Parcels/MapServer/0", None, None),
    ("VA", "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Parcels/FeatureServer/0", None, None),
    ("MD", "https://mdgeodata.md.gov/imap/rest/services/PlanningCadastre/MD_ParcelBoundaries/MapServer/0", None, None),
    ("NJ", "https://maps.nj.gov/arcgis/rest/services/Framework/Cadastral/MapServer/0", None, None),
    ("MN", "https://gisdata.mn.gov/public/rest/services/us_mn_state_mngeo/plan_parcels_open/MapServer/0", None, None),
    ("WI", "https://services.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels/FeatureServer/0", None, None),
    ("ME", "https://services1.arcgis.com/RbMX0mRVOFNTdLzd/arcgis/rest/services/Maine_Parcels_Organized_Towns/FeatureServer/0", None, None),
    ("DE", "https://enterprise.firstmap.delaware.gov/arcgis/rest/services/PlanningCadastre/DE_StateParcels/MapServer/0", None, None),
    ("NM", "https://gis.ose.state.nm.us/server/rest/services/Parcels/FeatureServer/0", None, None),
    ("AR", "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer/6", None, None),
    ("CT", "https://services3.arcgis.com/3FL1kr7L4LvwA2Kb/arcgis/rest/services/Connecticut_State_Parcel_Layer_2023/FeatureServer/0", None, None),
    ("FL", "https://services9.arcgis.com/Gh9awoU677aKree0/arcgis/rest/services/Florida_Statewide_Cadastral/FeatureServer/0", "PARCEL_ID", None),
]

def get(url, timeout=22):
    req = urllib.request.Request(url, headers={"User-Agent": "HandsOnTaxLiens/parcel-coverage"})
    with urllib.request.urlopen(req, timeout=timeout, context=CTX) as r:
        return json.loads(r.read(700_000).decode("utf-8", "replace"))

def ring_of(geom):
    if not geom: return None
    t, c = geom.get("type"), geom.get("coordinates")
    if t == "Polygon" and c and c[0] and len(c[0]) >= 4: return c[0]
    if t == "MultiPolygon" and c and c[0] and c[0][0] and len(c[0][0]) >= 4: return c[0][0]
    return None

def pip(x, y, ring):
    inside = False
    j = len(ring) - 1
    for i in range(len(ring)):
        xi, yi = ring[i][0], ring[i][1]
        xj, yj = ring[j][0], ring[j][1]
        if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / ((yj - yi) or 1e-12) + xi):
            inside = not inside
        j = i
    return inside

def interior(ring):
    xs = [p[0] for p in ring]; ys = [p[1] for p in ring]
    cx, cy = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
    if pip(cx, cy, ring): return cx, cy
    ax, ay = sum(xs) / len(xs), sum(ys) / len(ys)
    if pip(ax, ay, ring): return ax, ay
    return ring[len(ring) // 2][0], ring[len(ring) // 2][1]

def usable(value):
    text = re.sub(r"\s+", " ", str(value or "")).strip()
    if not text or re.fullmatch(r"(n/?a|nap|\?+|--|none|null|0+)", text, re.I): return ""
    if text.lower().startswith("city of "): return ""
    return text

def pick_id(fields, preferred=None):
    names = [f.get("name") for f in fields or [] if f.get("name")]
    if preferred and preferred in names: return preferred
    ranked = []
    for name in names:
        if OWNER.search(name): continue
        for i, pat in enumerate(ID_RANK):
            if re.search(pat, name, re.I):
                ranked.append((i, len(name), name))
                break
    ranked.sort()
    return ranked[0][2] if ranked else None

def county_field(fields, preferred=None):
    names = [f.get("name") for f in fields or [] if f.get("name")]
    if preferred and preferred in names: return preferred
    for name in names:
        if re.fullmatch(r"county(Name|_NAME|_NM)?|COUNTY|CNTY_NAME|CO_NAME|COUNTY_NAM", name):
            return name
    for name in names:
        if re.search(r"county", name, re.I) and not re.search(r"fips|code|id|num", name, re.I):
            return name
    return None

def spatial(url, field, where):
    q = (f"{url}/query?where={urllib.parse.quote(where)}&outFields={urllib.parse.quote(field)}"
         f"&returnGeometry=true&outSR=4326&resultRecordCount=1&f=geojson")
    sample = get(q)
    if sample.get("error"):
        return {"ok": False, "reason": str(sample["error"])[:180]}
    feats = sample.get("features") or []
    if not feats: return {"ok": False, "reason": "no sample"}
    ring = ring_of(feats[0].get("geometry") or {})
    apn = usable((feats[0].get("properties") or {}).get(field))
    if not ring: return {"ok": False, "reason": "sample was not a polygon"}
    if not apn: return {"ok": False, "reason": f"empty id {((feats[0].get('properties') or {}).get(field))!r}"[:80]}
    lon, lat = interior(ring)
    sq = (f"{url}/query?geometry={lon},{lat}&geometryType=esriGeometryPoint&inSR=4326"
          f"&spatialRel=esriSpatialRelIntersects&outFields={urllib.parse.quote(field)}"
          f"&returnGeometry=true&outSR=4326&resultRecordCount=5&f=geojson")
    if where and where != "1=1":
        sq += "&where=" + urllib.parse.quote(where)
    hit = get(sq)
    if hit.get("error"):
        return {"ok": False, "reason": str(hit["error"])[:180]}
    ids, polys = [], 0
    for f in hit.get("features") or []:
        v = usable((f.get("properties") or {}).get(field))
        if v: ids.append(v[:48])
        if ring_of(f.get("geometry") or {}): polys += 1
    ok = any(apn == i or apn.replace("-", "") == i.replace("-", "") for i in ids) and polys >= 1
    return {"ok": ok, "id": apn[:48], "n": len(hit.get("features") or []), "ids": ids[:4], "lon": round(lon, 5), "lat": round(lat, 5), "reason": "polygon and parcel id" if ok else "spatial query did not return the sampled parcel id"}

def log(row):
    EVIDENCE.parent.mkdir(parents=True, exist_ok=True)
    with EVIDENCE.open("a") as fh:
        fh.write(json.dumps(row) + "\n")

def inspect(item):
    state, url, pref_id, pref_county = item
    try:
        meta = get(url + "?f=pjson", timeout=18)
    except Exception as e:
        return {"state": state, "url": url, "ok": False, "reason": f"metadata {type(e).__name__}: {e}"[:180]}
    if meta.get("error"):
        return {"state": state, "url": url, "ok": False, "reason": str(meta["error"])[:180]}
    fields = meta.get("fields") or []
    idf = pick_id(fields, pref_id)
    cf = county_field(fields, pref_county)
    if not idf:
        return {"state": state, "url": url, "ok": False, "reason": "no parcel id field", "fields": [f.get("name") for f in fields][:25]}
    geom = str(meta.get("geometryType") or "")
    if geom and "Polygon" not in geom:
        return {"state": state, "url": url, "ok": False, "reason": f"geometry {geom}"}
    return {"state": state, "url": url, "ok": True, "idField": idf, "countyField": cf, "name": meta.get("name")}

def main():
    if EVIDENCE.exists():
        EVIDENCE.unlink()
    inspected = []
    with ThreadPoolExecutor(max_workers=6) as ex:
        futs = [ex.submit(inspect, item) for item in CANDIDATES]
        for fut in as_completed(futs):
            row = fut.result()
            inspected.append(row)
            print(("META" if row["ok"] else "SKIP"), row["state"], row.get("idField"), row.get("countyField"), row.get("reason", "")[:80])
    # fan out services that expose a county field
    existing = {(c["state"], c["county"].lower()) for c in []}
    # load current adapters from registry via coverage book keys is not name-based; read registry json is heavy.
    # Caller merges by fips. We still emit every pass.
    new = []
    failures = []
    by_state = {}
    for c in COUNTIES:
        by_state.setdefault(c["state"], []).append(c)
    jobs = []
    for row in inspected:
        if not row["ok"] or not row.get("countyField"):
            continue
        field, cf, url, state = row["idField"], row["countyField"], row["url"], row["state"]
        for county in by_state.get(state, []):
            jobs.append((state, county, url, field, cf))
    print("fanout jobs", len(jobs))

    def run_job(job):
        state, county, url, field, cf = job
        name = county["county"].replace("'", "''")
        where = f"{cf}='{name}'"
        try:
            result = spatial(url, field, where)
        except Exception as e:
            result = {"ok": False, "reason": f"{type(e).__name__}: {e}"[:160]}
        if not result.get("ok"):
            try:
                result2 = spatial(url, field, f"{cf}='{name.upper()}'")
                if result2.get("ok"):
                    result = result2
                    where = f"{cf}='{name.upper()}'"
            except Exception:
                pass
        result.update({"state": state, "county": county["county"], "fips": county["fips"], "url": url, "idField": field, "where": where})
        return result

    with ThreadPoolExecutor(max_workers=6) as ex:
        futs = [ex.submit(run_job, job) for job in jobs]
        done = 0
        for fut in as_completed(futs):
            result = fut.result()
            done += 1
            log(result)
            if result.get("ok"):
                new.append(result)
                print("PASS", result["state"], result["county"], result.get("id"))
            else:
                failures.append(result)
                if done % 25 == 0:
                    print("progress", done, "/", len(jobs), "pass", len(new))
    # one-shot candidates without a county field: record only, do not assign a county
    for row in inspected:
        if row["ok"] and not row.get("countyField"):
            try:
                sample = spatial(row["url"], row["idField"], "1=1")
            except Exception as e:
                sample = {"ok": False, "reason": str(e)[:160]}
            sample.update(row)
            log({"kind": "unassigned", **{k: sample.get(k) for k in ("state", "url", "idField", "ok", "reason", "id")}})
            print("UNASSIGNED", row["state"], sample.get("ok"), sample.get("reason", "")[:80])
    OUT.write_text(json.dumps({"inspected": inspected, "passed": new, "failed": failures}, indent=1))
    summary = {
        "asOf": "2026-10-11",
        "candidates": len(CANDIDATES),
        "metadataPassed": sum(1 for r in inspected if r["ok"]),
        "fanout": len(jobs),
        "passed": len(new),
        "failed": len(failures),
        "note": "Counties not in this run were not searched county by county. A failed candidate endpoint does not prove the county has no parcel service.",
    }
    LOG.write_text(json.dumps(summary, indent=2))
    print(json.dumps(summary))

if __name__ == "__main__":
    main()
