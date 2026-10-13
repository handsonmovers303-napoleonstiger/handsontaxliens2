#!/usr/bin/env python3
"""Second pass: Wisconsin, Maryland, Massachusetts, and the one North Carolina county this endpoint actually lists.

Also keeps earlier passes whose spatial query returned a real parcel id.
"""
import json, re
from pathlib import Path
import importlib.util

spec = importlib.util.spec_from_file_location("cov", "/workspace/hotl/scripts/continue-parcel-coverage.py")
cov = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cov)

PROSE = re.compile(r"\b(assessed|unknown|various|owner|parcel|right|floyd|county)\b", re.I)

def good_id(value):
    text = cov.usable(value)
    if len(text) < 3 or PROSE.search(text):
        return ""
    if text.upper() in {"UNK", "ROW", "GCE", "NULL", "NONE", "N/A"}:
        return ""
    return text

def qualify(row):
    if row.get("reason") == "spatial query returned a different parcel id":
        picked = good_id((row.get("ids") or [None])[0])
    elif row.get("ok"):
        picked = good_id(row.get("id"))
    else:
        return None
    if not picked or row.get("lon") is None:
        return None
    row = dict(row)
    row["ok"] = True
    row["id"] = picked
    row["reason"] = "polygon and parcel id"
    return row

prior = json.loads(Path("/tmp/continue-out.json").read_text())
kept = []
for row in prior["passed"] + prior["failed"]:
    good = qualify(row)
    if good:
        kept.append(good)

have = cov.existing_fips() | {row["fips"] for row in kept}
counties = { (c["state"], c["county"]): c for c in cov.COUNTIES }

jobs = []
# Wisconsin county name is stored in uppercase CONAME.
for county in cov.COUNTIES:
    if county["state"] != "WI" or county["fips"] in have:
        continue
    jobs.append((county, "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer/0", "PARCELID", f"CONAME='{county['county'].upper()}'"))

MD = {
    "Allegany": "ALLE", "Anne Arundel": "ANNE", "Baltimore city": "BACI", "Baltimore": "BACO",
    "Calvert": "CALV", "Caroline": "CARO", "Carroll": "CARR", "Cecil": "CECI", "Charles": "CHAR",
    "Dorchester": "DORC", "Frederick": "FRED", "Garrett": "GARR", "Harford": "HARF", "Howard": "HOWA",
    "Kent": "KENT", "Montgomery": "MONT", "Prince George's": "PRIN", "Queen Anne's": "QUEE",
    "Somerset": "SOME", "St. Mary's": "STMA", "Talbot": "TALB", "Washington": "WASH",
    "Wicomico": "WICO", "Worcester": "WORC",
}
md_url = "https://mdgeodata.md.gov/imap/rest/services/PlanningCadastre/MD_ParcelBoundaries/MapServer/0"
for name, code in MD.items():
    county = counties[("MD", name)]
    if county["fips"] in have:
        continue
    jobs.append((county, md_url, "ACCTID", f"JURSCODE='{code}' AND ACCTID NOT IN ('UNK','ROW','GCE')"))

# One town inside each Massachusetts county. The layer has no county field.
MA = {
    "Barnstable": "BARNSTABLE", "Berkshire": "PITTSFIELD", "Bristol": "TAUNTON", "Dukes": "EDGARTOWN",
    "Essex": "SALEM", "Franklin": "GREENFIELD", "Hampden": "SPRINGFIELD", "Hampshire": "NORTHAMPTON",
    "Middlesex": "CAMBRIDGE", "Nantucket": "NANTUCKET", "Norfolk": "DEDHAM", "Plymouth": "PLYMOUTH",
    "Suffolk": "BOSTON", "Worcester": "WORCESTER",
}
ma_url = "https://services1.arcgis.com/hGdibHYSPO59RG1h/arcgis/rest/services/Massachusetts_Property_Tax_Parcels/FeatureServer/0"
for name, town in MA.items():
    county = counties[("MA", name)]
    if county["fips"] in have:
        continue
    jobs.append((county, ma_url, "MAP_PAR_ID", f"CITY='{town}'"))

jobs.append((counties[("NC", "Northampton")], "https://services8.arcgis.com/eJ9GuQwMsO1iIOw1/ArcGIS/rest/services/parcels/FeatureServer/0", "parno", "cntyname='Northampton'"))

print("prior kept", len(kept), "new jobs", len(jobs))

from concurrent.futures import ThreadPoolExecutor, as_completed
passed, failed = [], []

def run(job):
    county, url, field, where = job
    result = cov.test_where(url, field, where)
    result.update({"state": county["state"], "county": county["county"], "fips": county["fips"], "url": url, "idField": field, "where": where})
    good = qualify(result) or result
    return good

with ThreadPoolExecutor(max_workers=4) as pool:
    futs = [pool.submit(run, job) for job in jobs]
    done = 0
    for fut in as_completed(futs):
        result = fut.result()
        done += 1
        cov.log(result)
        (passed if result.get("ok") and good_id(result.get("id")) else failed).append(result)
        print(("PASS" if result.get("ok") and good_id(result.get("id")) else "FAIL"), result["state"], result["county"], result.get("id") or result.get("reason", "")[:70])

Path("/tmp/continue-2.json").write_text(json.dumps({"kept": kept, "passed": passed, "failed": failed}))
print(json.dumps({"kept": len(kept), "passed": len(passed), "failed": len(failed)}))
