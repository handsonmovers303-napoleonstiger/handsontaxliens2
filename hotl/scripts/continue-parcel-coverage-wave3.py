#!/usr/bin/env python3
"""Test Ohio, Indiana, Minnesota, Nebraska, and Pennsylvania parcel layers.

A county is kept only when a point returns a polygon and a parcel id that contains a digit.
Owner and mailing fields are not requested.
"""
import json, re, urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
import importlib.util

spec = importlib.util.spec_from_file_location("cov", "/workspace/hotl/scripts/continue-parcel-coverage.py")
cov = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cov)

PROSE = re.compile(r"\b(assessed|unknown|various|owner|parcel|commonarea|water|alley)\b", re.I)

def good_id(value):
    text = cov.usable(value)
    if len(text) < 3 or not re.search(r"\d", text) or PROSE.search(text):
        return ""
    if text.upper() in {"UNK", "ROW", "GCE", "NULL", "NONE", "N/A", "NO ID"}:
        return ""
    return text

have = cov.existing_fips()
counties = [c for c in cov.COUNTIES if c["fips"] not in have]
by_state = {}
for county in counties:
    by_state.setdefault(county["state"], []).append(county)

OH = "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer/0"
IN = "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer/0"
MN = "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer/1"
NE = "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer/0"
PA = "https://apps.pasda.psu.edu/arcgis/rest/services/PA_Parcels/MapServer/1"

jobs = []
for county in by_state.get("OH", []):
    name = county["county"].replace("'", "''")
    jobs.append((county, OH, "LocalParcelID", f"County='{name}'"))
for county in by_state.get("IN", []):
    jobs.append((county, IN, "parcel_id", f"county_fips='{county['fips']}'"))
for county in by_state.get("MN", []):
    name = county["county"].replace("'", "''")
    jobs.append((county, MN, "county_pin", f"co_name='{name}'"))
print("attribute jobs", len(jobs))

def centroids(state):
    url = "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Counties_Generalized/FeatureServer/0/query?" + urllib.parse.urlencode({
        "where": f"STATE_ABBR='{state}'", "outFields": "NAME,FIPS", "returnCentroid": "true",
        "returnGeometry": "false", "f": "json", "resultRecordCount": "200",
    })
    body = cov.get(url, timeout=40)
    points = {}
    for feat in body.get("features") or []:
        attrs = feat.get("attributes") or {}
        center = feat.get("centroid") or {}
        if center.get("x") is None:
            continue
        points[str(attrs.get("FIPS") or "").zfill(5)] = (center["x"], center["y"], attrs.get("NAME"))
    return points, body.get("error")

def point_test(url, field, lon, lat, extra=""):
    params = {
        "geometry": f"{lon},{lat}", "geometryType": "esriGeometryPoint", "inSR": "4326",
        "spatialRel": "esriSpatialRelIntersects", "outFields": extra or field,
        "returnGeometry": "true", "outSR": "4326", "resultRecordCount": "5",
        "maxAllowableOffset": "0.01", "f": "geojson",
    }
    body = cov.get(url + "/query?" + urllib.parse.urlencode(params))
    if body.get("error"):
        params["f"] = "json"
        body = cov.get(url + "/query?" + urllib.parse.urlencode(params))
    if body.get("error"):
        return {"ok": False, "reason": str(body["error"])[:160]}
    ids, county_ids, polys = [], [], 0
    for feat in cov.as_features(body):
        props = feat["properties"]
        value = good_id(props.get(field))
        if value:
            ids.append(value[:48])
        if props.get("County_ID"):
            county_ids.append(str(props["County_ID"]))
        if cov.ring_of(feat.get("geometry") or {}):
            polys += 1
    if not ids or not polys:
        return {"ok": False, "reason": "point returned no parcel id or polygon", "ids": ids[:3]}
    return {"ok": True, "id": ids[0], "ids": ids[:4], "countyId": county_ids[0] if county_ids else "", "lon": round(lon, 5), "lat": round(lat, 5), "reason": "polygon and parcel id"}

passed, failed = [], []

def run_attr(job):
    county, url, field, where = job
    try:
        result = cov.test_where(url, field, where)
    except Exception as e:
        result = {"ok": False, "reason": f"{type(e).__name__}: {e}"[:160]}
    picked = good_id(result.get("id"))
    if not picked and result.get("reason") == "spatial query returned a different parcel id":
        picked = good_id((result.get("ids") or [None])[0])
    result.update({"state": county["state"], "county": county["county"], "fips": county["fips"], "url": url, "idField": field, "where": where})
    if picked and result.get("lon") is not None:
        result["ok"] = True
        result["id"] = picked
        result["reason"] = "polygon and parcel id"
    else:
        result["ok"] = False
    return result

print("attribute tests", len(jobs))
with ThreadPoolExecutor(max_workers=4) as pool:
    futs = [pool.submit(run_attr, job) for job in jobs]
    done = 0
    for fut in as_completed(futs):
        result = fut.result()
        done += 1
        cov.log(result)
        (passed if result.get("ok") else failed).append(result)
        if result.get("ok") or done % 25 == 0:
            print(("PASS" if result.get("ok") else "...."), done, "/", len(jobs), result["state"], result["county"], result.get("id") or (result.get("reason") or "")[:50])

# Nebraska and Pennsylvania: a county centroid is the test point.
for state, url, field, extra in (("NE", NE, "Parcel_ID", "Parcel_ID,County_ID"), ("PA", PA, "PIN", "PIN")):
    try:
        points, err = centroids(state)
    except Exception as e:
        points, err = {}, f"{type(e).__name__}: {e}"
    print("centroids", state, len(points), str(err)[:80] if err else "")
    if not points:
        for county in by_state.get(state, []):
            failed.append({"ok": False, "state": state, "county": county["county"], "fips": county["fips"], "url": url, "reason": "no county centroid"})
        continue
    def run_point(county):
        hit = points.get(county["fips"])
        if not hit:
            return {"ok": False, "state": state, "county": county["county"], "fips": county["fips"], "url": url, "idField": field, "reason": "centroid not in the county layer"}
        lon, lat, _name = hit
        try:
            result = point_test(url, field, lon, lat, extra)
        except Exception as e:
            result = {"ok": False, "reason": f"{type(e).__name__}: {e}"[:160]}
        if not result.get("ok"):
            try:
                result = point_test(url, field, lon + 0.05, lat, extra)
            except Exception as e:
                result = {"ok": False, "reason": f"{type(e).__name__}: {e}"[:160]}
        result.update({"state": state, "county": county["county"], "fips": county["fips"], "url": url, "idField": field})
        if state == "NE" and result.get("countyId"):
            result["where"] = f"County_ID='{result['countyId']}' AND Parcel_ID<>''"
        return result
    targets = by_state.get(state, [])
    with ThreadPoolExecutor(max_workers=4) as pool:
        futs = [pool.submit(run_point, county) for county in targets]
        done = 0
        for fut in as_completed(futs):
            result = fut.result()
            done += 1
            cov.log(result)
            (passed if result.get("ok") else failed).append(result)
            if result.get("ok") or done % 20 == 0:
                print(("PASS" if result.get("ok") else "FAIL"), state, result["county"], result.get("id") or (result.get("reason") or "")[:60])

Path("/tmp/continue-3.json").write_text(json.dumps({"passed": passed, "failed": failed}))
print(json.dumps({"passed": len(passed), "failed": len(failed)}))
