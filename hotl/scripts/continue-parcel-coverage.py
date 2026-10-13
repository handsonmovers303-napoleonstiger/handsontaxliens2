#!/usr/bin/env python3
"""Continue parcel-click tests for counties that do not yet have an adapter.

A county is recorded as a pass only when a point inside a sampled polygon
returns that same parcel id. Owner-name fields are never requested.
"""
import json, re, ssl, urllib.parse, urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

CTX = ssl.create_default_context()
COUNTIES = json.loads(Path("/tmp/hotl-counties.json").read_text())
EVIDENCE = Path("/workspace/hotl/data/parcel-evidence.jsonl")
OUT = Path("/tmp/continue-out.json")
OWNER = re.compile(r"owner|taxpayer|mailname|ownname|own_name|ownernme", re.I)
ID_RANK = [
    r"^apn$", r"^ain$", r"^pin$", r"^folio$", r"^parid$", r"^parcel_?id(_nr)?$",
    r"^parcelid$", r"^parno$", r"^parcel_?no$", r"^print_?key$", r"^sbl$",
    r"^pams_pin$", r"^prop_?id$", r"^pid$", r"^accountid$", r"^acctid$", r"parcel",
]

# Real published layers. A URL that fails metadata is logged and not assigned.
CANDIDATES = [
    ("WA", "https://services.arcgis.com/jsIt88o09Q0r1j8h/ArcGIS/rest/services/Current_Parcels/FeatureServer/0", "PARCEL_ID_NR", "COUNTY_NM"),
    ("WI", "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer/0", None, None),
    ("NC", "https://services8.arcgis.com/eJ9GuQwMsO1iIOw1/ArcGIS/rest/services/parcels/FeatureServer/0", "parno", None),
    ("MA", "https://services1.arcgis.com/hGdibHYSPO59RG1h/arcgis/rest/services/Massachusetts_Property_Tax_Parcels/FeatureServer/0", None, None),
    ("VA", "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer/0", "PARCELID", "LOCALITY"),
    ("MD", "https://mdgeodata.md.gov/imap/rest/services/PlanningCadastre/MD_ParcelBoundaries/MapServer/0", None, None),
    ("MT", "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer/1", "PARCELID", "CountyName"),
    ("NJ", "https://services2.arcgis.com/XVOqAjTOJ5P6ngMu/arcgis/rest/services/Parcels_Composite_NJ_WM/FeatureServer/0", None, None),
]

def existing_fips():
    text = Path("/workspace/hotl/src/holo/gis/registry.js").read_text()
    start = text.index("export const COUNTY_PARCEL_SOURCES = ")
    end = text.index("\n];\n\nexport const ROAD_LAYER")
    sources = json.loads(text[start + len("export const COUNTY_PARCEL_SOURCES = "):end + 2])
    return {row["fips"] for row in sources}

def get(url, timeout=24):
    req = urllib.request.Request(url, headers={"User-Agent": "HandsOnTaxLiens/parcel-coverage"})
    with urllib.request.urlopen(req, timeout=timeout, context=CTX) as r:
        raw = r.read(900_000)
    return json.loads(raw.decode("utf-8", "replace"))

def ring_of(geom):
    if not geom:
        return None
    t, c = geom.get("type"), geom.get("coordinates")
    if t == "Polygon" and c and c[0] and len(c[0]) >= 4:
        return c[0]
    if t == "MultiPolygon" and c and c[0] and c[0][0] and len(c[0][0]) >= 4:
        return c[0][0]
    rings = geom.get("rings")
    if rings and rings[0] and len(rings[0]) >= 4:
        return rings[0]
    return None

def as_features(body):
    feats = body.get("features") or []
    out = []
    for f in feats:
        if "attributes" in f:
            geom = f.get("geometry") or {}
            rings = geom.get("rings")
            g = {"type": "Polygon", "coordinates": rings} if rings else None
            out.append({"properties": f.get("attributes") or {}, "geometry": g})
        else:
            out.append({"properties": f.get("properties") or {}, "geometry": f.get("geometry")})
    return out

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
    xs = [p[0] for p in ring]
    ys = [p[1] for p in ring]
    cx, cy = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
    if pip(cx, cy, ring):
        return cx, cy
    ax, ay = sum(xs) / len(xs), sum(ys) / len(ys)
    if pip(ax, ay, ring):
        return ax, ay
    return ring[len(ring) // 2][0], ring[len(ring) // 2][1]

def usable(value):
    text = re.sub(r"\s+", " ", str(value or "")).strip()
    if not text or re.fullmatch(r"(n/?a|nap|\?+|--|none|null|0+)", text, re.I):
        return ""
    if text.lower().startswith("city of "):
        return ""
    return text

def norm_name(value):
    s = str(value or "").lower().replace(".", "")
    s = s.replace("saint ", "st ")
    s = re.sub(r"[^a-z0-9 ]", " ", s)
    s = re.sub(r"\b(county|parish)\b", " ", s)
    return re.sub(r"\s+", " ", s).strip()

def pick_fields(fields, pref_id, pref_county):
    names = [f.get("name") for f in fields or [] if f.get("name") and not OWNER.search(f.get("name"))]
    id_name = pref_id if pref_id in names else None
    if not id_name:
        ranked = []
        for name in names:
            for i, pat in enumerate(ID_RANK):
                if re.search(pat, name, re.I):
                    ranked.append((i, len(name), name))
                    break
        ranked.sort()
        id_name = ranked[0][2] if ranked else None
    county_name = pref_county if pref_county in [f.get("name") for f in fields or []] else None
    if county_name and OWNER.search(county_name):
        county_name = None
    if not county_name:
        for name in (f.get("name") for f in fields or []):
            if name and re.search(r"county|locality|cntyname|juris|coname|jurs", name, re.I) and not re.search(r"fips|code|cd$|id$", name, re.I) and not OWNER.search(name):
                county_name = name
                break
    fips_name = None
    for name in (f.get("name") for f in fields or []):
        if name and re.fullmatch(r"(cntyfips|county_fips|fips|fips_nr|co_fips)", name, re.I):
            fips_name = name
            break
    return id_name, county_name, fips_name

def q(url, **params):
    params.setdefault("f", "geojson")
    return get(url + "/query?" + urllib.parse.urlencode(params))

def sample_feature(url, field, where):
    body = q(url, where=where, outFields=field, returnGeometry="true", outSR="4326", resultRecordCount="1", maxAllowableOffset="0.02")
    if body.get("error"):
        body = get(url + "/query?" + urllib.parse.urlencode({
            "where": where, "outFields": field, "returnGeometry": "true", "outSR": "4326",
            "resultRecordCount": "1", "maxAllowableOffset": "0.02", "f": "json",
        }))
    if body.get("error"):
        return None, str(body["error"])[:160]
    feats = as_features(body)
    if not feats:
        return None, "no sample"
    return feats[0], None

def spatial_at(url, field, where, lon, lat):
    params = {
        "geometry": f"{lon},{lat}", "geometryType": "esriGeometryPoint", "inSR": "4326",
        "spatialRel": "esriSpatialRelIntersects", "outFields": field, "returnGeometry": "true",
        "outSR": "4326", "resultRecordCount": "5", "maxAllowableOffset": "0.01", "f": "geojson",
    }
    if where and where != "1=1":
        params["where"] = where
    body = get(url + "/query?" + urllib.parse.urlencode(params))
    if body.get("error"):
        params["f"] = "json"
        body = get(url + "/query?" + urllib.parse.urlencode(params))
    if body.get("error"):
        return {"ok": False, "reason": str(body["error"])[:160]}
    ids, polys = [], 0
    for feat in as_features(body):
        value = usable(feat["properties"].get(field))
        if value:
            ids.append(value[:48])
        if ring_of(feat.get("geometry") or {}):
            polys += 1
    return {"ok": bool(ids) and polys >= 1, "ids": ids[:4], "n": len(as_features(body)), "reason": "polygon and parcel id" if ids and polys else "spatial query missed the parcel id or polygon"}

def test_where(url, field, where):
    try:
        feat, err = sample_feature(url, field, where)
    except Exception as e:
        return {"ok": False, "reason": f"{type(e).__name__}: {e}"[:160]}
    if err:
        return {"ok": False, "reason": err}
    apn = usable(feat["properties"].get(field))
    ring = ring_of(feat.get("geometry") or {})
    if not apn:
        return {"ok": False, "reason": "empty parcel id"}
    if not ring:
        return {"ok": False, "reason": "sample was not a polygon"}
    lon, lat = interior(ring)
    try:
        hit = spatial_at(url, field, where, lon, lat)
    except Exception as e:
        return {"ok": False, "reason": f"{type(e).__name__}: {e}"[:160]}
    same = any(apn == i or apn.replace("-", "") == i.replace("-", "") for i in hit.get("ids") or [])
    hit.update({"ok": bool(hit.get("ok") and same), "id": apn[:48], "lon": round(lon, 5), "lat": round(lat, 5), "where": where})
    if not same and hit.get("ids"):
        hit["ok"] = False
        hit["reason"] = "spatial query returned a different parcel id"
    return hit

def log(row):
    EVIDENCE.parent.mkdir(parents=True, exist_ok=True)
    with EVIDENCE.open("a") as fh:
        fh.write(json.dumps(row) + "\n")

def inspect(item):
    state, url, pref_id, pref_county = item
    try:
        meta = get(url + "?f=pjson", timeout=20)
    except Exception as e:
        return {"state": state, "url": url, "ok": False, "reason": f"metadata {type(e).__name__}: {e}"[:180]}
    if meta.get("error"):
        return {"state": state, "url": url, "ok": False, "reason": str(meta["error"])[:180]}
    geom = str(meta.get("geometryType") or "")
    if geom and "Polygon" not in geom:
        return {"state": state, "url": url, "ok": False, "reason": f"geometry {geom}"}
    id_name, county_name, fips_name = pick_fields(meta.get("fields") or [], pref_id, pref_county)
    if not id_name:
        return {"state": state, "url": url, "ok": False, "reason": "no parcel id field", "fields": [f.get("name") for f in (meta.get("fields") or [])][:30]}
    return {"state": state, "url": url, "ok": True, "idField": id_name, "countyField": county_name, "fipsField": fips_name, "name": meta.get("name")}

def distinct_values(url, field):
    body = get(url + "/query?" + urllib.parse.urlencode({
        "where": "1=1", "outFields": field, "returnDistinctValues": "true", "returnGeometry": "false",
        "f": "json", "orderByFields": field, "resultRecordCount": "400",
    }), timeout=40)
    vals = []
    for feat in body.get("features") or []:
        attrs = feat.get("attributes") or feat.get("properties") or {}
        if attrs.get(field) not in (None, ""):
            vals.append(str(attrs[field]))
    return vals

def main():
    have = existing_fips()
    by_state = {}
    for county in COUNTIES:
        by_state.setdefault(county["state"], []).append(county)
    inspected = []
    with ThreadPoolExecutor(max_workers=4) as pool:
        futs = [pool.submit(inspect, item) for item in CANDIDATES]
        for fut in as_completed(futs):
            row = fut.result()
            inspected.append(row)
            print(("META" if row["ok"] else "SKIP"), row["state"], row.get("idField"), row.get("countyField"), row.get("fipsField"), (row.get("reason") or "")[:90])

    jobs = []
    unmatched = []
    for row in inspected:
        if not row["ok"]:
            log({"kind": "metadata", **row})
            continue
        state, url, field = row["state"], row["url"], row["idField"]
        ours = [c for c in by_state.get(state, []) if c["fips"] not in have]
        service_names = []
        if row.get("countyField"):
            try:
                service_names = distinct_values(url, row["countyField"])
            except Exception as e:
                print("DISTINCT FAIL", state, type(e).__name__, str(e)[:80])
        index = {}
        ambiguous = set()
        for value in service_names:
            key = norm_name(value)
            if key in index and index[key] != value:
                ambiguous.add(key)
            index[key] = value
        for county in ours:
            key = norm_name(county["county"])
            if row.get("countyField") and key in index and key not in ambiguous:
                jobs.append((county, url, field, f"{row['countyField']}='{index[key].replace(chr(39), chr(39)+chr(39))}'"))
            elif row.get("fipsField"):
                jobs.append((county, url, field, f"{row['fipsField']}='{county['fips'][-3:]}'"))
            elif not row.get("countyField") and not service_names:
                jobs.append((county, url, field, "1=1"))
            else:
                unmatched.append({"state": state, "county": county["county"], "fips": county["fips"], "reason": "county name was not in the service list"})
        print("QUEUE", state, "jobs", sum(1 for c, *_ in [(j[0],) for j in jobs] if False), "pending", len(jobs), "unmatched", len(unmatched))

    print("jobs", len(jobs), "unmatched", len(unmatched))
    passed, failed = [], []

    def run(job):
        county, url, field, where = job
        # A statewide where of 1=1 would sample a random parcel, then the spatial
        # check only proves that one parcel. Require a county filter.
        if where == "1=1":
            return {"ok": False, "reason": "no county filter", "state": county["state"], "county": county["county"], "fips": county["fips"], "url": url, "idField": field}
        result = test_where(url, field, where)
        result.update({"state": county["state"], "county": county["county"], "fips": county["fips"], "url": url, "idField": field})
        return result

    with ThreadPoolExecutor(max_workers=4) as pool:
        futs = [pool.submit(run, job) for job in jobs]
        done = 0
        for fut in as_completed(futs):
            result = fut.result()
            done += 1
            log(result)
            (passed if result.get("ok") else failed).append(result)
            if result.get("ok") or done % 20 == 0:
                print(("PASS" if result.get("ok") else "...."), done, "/", len(jobs), result["state"], result["county"], result.get("id") or result.get("reason", "")[:60])

    for row in unmatched:
        log({"kind": "unmatched", **row})
    OUT.write_text(json.dumps({"inspected": inspected, "passed": passed, "failed": failed, "unmatched": unmatched}))
    print(json.dumps({"passed": len(passed), "failed": len(failed), "unmatched": len(unmatched)}))

if __name__ == "__main__":
    main()
