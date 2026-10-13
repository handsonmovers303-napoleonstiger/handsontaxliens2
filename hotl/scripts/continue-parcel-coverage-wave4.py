#!/usr/bin/env python3
"""Test Florida Department of Revenue cadastral parcels and North Dakota GIS Hub parcels."""
import json, re, urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
import importlib.util

spec = importlib.util.spec_from_file_location("cov", "/workspace/hotl/scripts/continue-parcel-coverage.py")
cov = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cov)
_get = cov.get
def get(url, timeout=40):
    return _get(url, timeout=timeout)
cov.get = get

FL = "https://services9.arcgis.com/Gh9awoU677aKree0/arcgis/rest/services/Florida_Statewide_Cadastral/FeatureServer/0"
ND = "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer/0"
# Florida Department of Revenue county numbers. 11, 50, and 77 were checked against city names.
DOR = {
    "Alachua": 11, "Baker": 12, "Bay": 13, "Bradford": 14, "Brevard": 15, "Broward": 16, "Calhoun": 17,
    "Charlotte": 18, "Citrus": 19, "Clay": 20, "Collier": 21, "Columbia": 22, "Miami-Dade": 23, "DeSoto": 24,
    "Dixie": 25, "Duval": 26, "Escambia": 27, "Flagler": 28, "Franklin": 29, "Gadsden": 30, "Gilchrist": 31,
    "Glades": 32, "Gulf": 33, "Hamilton": 34, "Hardee": 35, "Hendry": 36, "Hernando": 37, "Highlands": 38,
    "Hillsborough": 39, "Holmes": 40, "Indian River": 41, "Jackson": 42, "Jefferson": 43, "Lafayette": 44,
    "Lake": 45, "Lee": 46, "Leon": 47, "Levy": 48, "Liberty": 49, "Madison": 50, "Manatee": 51, "Marion": 52,
    "Martin": 53, "Monroe": 54, "Nassau": 55, "Okaloosa": 56, "Okeechobee": 57, "Orange": 58, "Osceola": 59,
    "Palm Beach": 60, "Pasco": 61, "Pinellas": 62, "Polk": 63, "Putnam": 64, "St. Johns": 65, "St. Lucie": 66,
    "Santa Rosa": 67, "Sarasota": 68, "Seminole": 69, "Sumter": 70, "Suwannee": 71, "Taylor": 72, "Union": 73,
    "Volusia": 74, "Wakulla": 75, "Walton": 76, "Washington": 77,
}

def good_id(value):
    text = cov.usable(value)
    if len(text) < 3 or not re.search(r"\d", text):
        return ""
    if re.search(r"unk|\brow\b|gap| and |\(|unknown|none|null", text, re.I):
        return ""
    digits = re.sub(r"\D", "", text)
    if not digits or set(digits) <= {"0"} or set(digits) <= {"9"}:
        return ""
    if re.fullmatch(r"[1-9]0{6,}", digits):
        return ""
    return text

have = cov.existing_fips()
jobs = []
for county in cov.COUNTIES:
    if county["fips"] in have:
        continue
    if county["state"] == "FL":
        jobs.append((county, FL, "PARCEL_ID", f"CO_NO={DOR[county['county']]}"))
    elif county["state"] == "ND":
        name = county["county"].replace("'", "''")
        jobs.append((county, ND, "GISID", f"CountyName='{name}'"))
print("jobs", len(jobs))

def run(job):
    county, url, field, where = job
    try:
        body = cov.get(url + "/query?" + urllib.parse.urlencode({
            "where": where, "outFields": field, "returnGeometry": "false", "returnCentroid": "true",
            "outSR": "4326", "resultRecordCount": "1", "f": "json",
        }), timeout=25)
        feat = (body.get("features") or [None])[0]
        attrs = (feat or {}).get("attributes") or {}
        center = (feat or {}).get("centroid") or {}
        apn = good_id(attrs.get(field))
        if body.get("error"):
            result = {"ok": False, "reason": str(body["error"])[:140]}
        elif not feat:
            result = {"ok": False, "reason": "no sample"}
        elif not apn:
            result = {"ok": False, "reason": "empty parcel id", "id": attrs.get(field)}
        elif center.get("x") is None:
            result = {"ok": False, "reason": "no centroid", "id": apn}
        else:
            hit = cov.spatial_at(url, field, where, center["x"], center["y"])
            same = any(apn.replace("-", "") == i.replace("-", "") for i in hit.get("ids") or [])
            picked = apn if same else good_id((hit.get("ids") or [None])[0])
            result = {"ok": bool(hit.get("ok") and picked), "id": picked, "ids": hit.get("ids"), "lon": round(center["x"], 5), "lat": round(center["y"], 5), "reason": hit.get("reason")}
    except Exception as e:
        result = {"ok": False, "reason": f"{type(e).__name__}: {e}"[:160]}
    result.update({"state": county["state"], "county": county["county"], "fips": county["fips"], "url": url, "idField": field, "where": where})
    return result

passed, failed = [], []
with ThreadPoolExecutor(max_workers=3) as pool:
    futs = [pool.submit(run, job) for job in jobs]
    done = 0
    for fut in as_completed(futs):
        result = fut.result()
        done += 1
        cov.log(result)
        (passed if result.get("ok") else failed).append(result)
        print(("PASS" if result.get("ok") else "FAIL"), done, "/", len(jobs), result["state"], result["county"], result.get("id") or (result.get("reason") or "")[:60])

Path("/tmp/continue-4.json").write_text(json.dumps({"passed": passed, "failed": failed}))
print(json.dumps({"passed": len(passed), "failed": len(failed)}))
