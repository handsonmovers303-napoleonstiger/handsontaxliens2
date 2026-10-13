#!/usr/bin/env python3
"""Pull county statistics from public files. Writes src/holo/countyMarket.json.

Population and growth: Census Bureau population estimates, July 1, 2024.
Median home value and housing vacancy: ACS 2019–2023 5-year tables B25077 and B25002.
Metro / micro: Census Bureau OMB delineation file, July 2023.
Flood and wildfire: FEMA National Risk Index v1.20 (December 2025), county rating only.
Puerto Rico is not included.

A blank stays blank when the source did not publish a figure. Connecticut's retired
county codes are not given a planning-region number. This is a source pull, not a
county verification and not a parcel fact.
"""
import csv
import io
import json
import urllib.request
import zipfile
from datetime import date
from xml.etree import ElementTree as ET
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "src" / "holo" / "countyMarket.json"
POP_URL = "https://www2.census.gov/programs-surveys/popest/datasets/2020-2024/counties/totals/co-est2024-alldata.csv"
POP_2020_URL = "https://www2.census.gov/programs-surveys/popest/datasets/2020-2021/counties/totals/co-est2021-alldata.csv"
CT_NOTE = ("Connecticut retired this county code in 2022. Census now publishes nine planning regions, "
           "and their boundaries are not this county, so the 2024 estimate, ACS housing figures, "
           "metro status, and FEMA ratings are not copied here.")
ACS = "https://www2.census.gov/programs-surveys/acs/summary_file/2023/table-based-SF/data/5YRData/"
METRO_URL = "https://www2.census.gov/programs-surveys/metro-micro/geographies/reference-files/2023/delineation-files/list1_2023.xlsx"
NRI = "https://services.arcgis.com/XG15cJAlne2vxtgt/arcgis/rest/services/National_Risk_Index_Counties/FeatureServer/0/query"
NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "handsontaxliens-county-market/1.0"})
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()


def num(raw):
    if raw is None:
        return None
    s = str(raw).strip()
    if s in ("", ".", "-", "null", "N", "*"):
        return None
    try:
        v = float(s)
    except ValueError:
        return None
    if v < 0:
        return None
    return v


def fips5(state, county):
    return f"{int(state):02d}{int(county):03d}"


def acs_counties(filename, fields):
    raw = get(ACS + filename).decode("latin1")
    rows = csv.DictReader(io.StringIO(raw), delimiter="|")
    out = {}
    for row in rows:
        geo = row.get("GEO_ID") or ""
        if not geo.startswith("0500000US"):
            continue
        fid = geo[-5:]
        out[fid] = {k: num(row.get(k)) for k in fields}
    return out


def mark_unpublished(counties):
    """Say why a blank is blank. Do not invent the number."""
    island = ("Census county population estimates and the ACS 5-year housing tables do not cover this island-area code. "
              "No population or housing figure is filled in.")
    median = "ACS 2019–2023 table B25077 did not publish a median home value for this county. No figure is filled in."
    for fid, rec in counties.items():
        if fid[:2] in {"60", "66", "69", "78"} and rec.get("pop") is None and not rec.get("note"):
            rec["note"] = island
        elif rec.get("pop") is not None and rec.get("medianValue") is None and not rec.get("note"):
            rec["note"] = median


def population_2020_retired(already):
    """County codes the 2024 estimates no longer publish. Connecticut's eight counties are the case that matters."""
    raw = get(POP_2020_URL).decode("latin1")
    out = {}
    for row in csv.DictReader(io.StringIO(raw)):
        if row.get("SUMLEV") != "050":
            continue
        fid = fips5(row["STATE"], row["COUNTY"])
        if fid in already:
            continue
        base = num(row.get("ESTIMATESBASE2020"))
        if not base:
            continue
        out[fid] = {
            "pop": int(base),
            "popLabel": "Census Bureau estimates base, April 1, 2020",
            "note": CT_NOTE if fid.startswith("09") else "No July 1, 2024 population estimate was published for this county code.",
        }
    return out


def population():
    raw = get(POP_URL).decode("latin1")
    out = {}
    for row in csv.DictReader(io.StringIO(raw)):
        if row.get("SUMLEV") != "050":
            continue
        fid = fips5(row["STATE"], row["COUNTY"])
        pop = num(row.get("POPESTIMATE2024"))
        base = num(row.get("ESTIMATESBASE2020"))
        growth = round((pop - base) / base * 100, 1) if pop and base else None
        out[fid] = {"pop": None if not pop else int(pop), "growthPct": growth}
    return out


def metro():
    blob = get(METRO_URL)
    z = zipfile.ZipFile(io.BytesIO(blob))
    shared = []
    if "xl/sharedStrings.xml" in z.namelist():
        root = ET.fromstring(z.read("xl/sharedStrings.xml"))
        for si in root.findall("m:si", NS):
            shared.append("".join(t.text or "" for t in si.iter("{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t")))
    sheet = ET.fromstring(z.read("xl/worksheets/sheet1.xml"))
    table = []
    for row in sheet.findall("m:sheetData/m:row", NS):
        vals = []
        for c in row.findall("m:c", NS):
            t = c.get("t")
            v = c.find("m:v", NS)
            if v is None or v.text is None:
                vals.append("")
            elif t == "s":
                vals.append(shared[int(v.text)])
            else:
                vals.append(v.text)
        table.append(vals)
    header_i = next(i for i, r in enumerate(table) if "FIPS State Code" in r and "FIPS County Code" in r)
    header = table[header_i]
    idx = {name: header.index(name) for name in ("CBSA Title", "Metropolitan/Micropolitan Statistical Area", "FIPS State Code", "FIPS County Code")}
    out = {}
    for r in table[header_i + 1:]:
        if len(r) <= max(idx.values()) or not r[idx["FIPS State Code"]] or not r[idx["FIPS County Code"]]:
            continue
        kind = r[idx["Metropolitan/Micropolitan Statistical Area"]]
        metro_kind = "metro" if kind.startswith("Metropolitan") else "micro" if kind.startswith("Micropolitan") else None
        if not metro_kind:
            continue
        fid = fips5(r[idx["FIPS State Code"]], r[idx["FIPS County Code"]])
        out[fid] = {"metro": metro_kind, "metroName": r[idx["CBSA Title"]]}
    return out


def nri():
    out = {}
    offset = 0
    while True:
        url = (NRI + "?where=1%3D1&outFields=STCOFIPS,IFLD_RISKR,CFLD_RISKR,WFIR_RISKR"
               f"&returnGeometry=false&f=json&resultRecordCount=2000&resultOffset={offset}")
        data = json.loads(get(url))
        feats = data.get("features") or []
        for f in feats:
            a = f["attributes"]
            fid = str(a.get("STCOFIPS") or "").zfill(5)
            if len(fid) != 5:
                continue
            out[fid] = {
                "inlandFlood": a.get("IFLD_RISKR") or None,
                "coastalFlood": a.get("CFLD_RISKR") or None,
                "wildfire": a.get("WFIR_RISKR") or None,
            }
        if not data.get("exceededTransferLimit") and len(feats) < 2000:
            break
        offset += len(feats)
        if not feats:
            break
    return out


def main():
    pop = population()
    value = acs_counties("acsdt5y2023-b25077.dat", ["B25077_E001"])
    vac = acs_counties("acsdt5y2023-b25002.dat", ["B25002_E001", "B25002_E003"])
    areas = metro()
    hazard = nri()
    ids = set(pop) | set(value) | set(vac) | set(areas) | set(hazard)
    counties = {}
    for fid in sorted(ids):
        if fid.startswith("72"):
            continue
        p = pop.get(fid, {})
        v = value.get(fid, {})
        h = vac.get(fid, {})
        units = h.get("B25002_E001")
        vacant = h.get("B25002_E003")
        vacant_pct = round(vacant / units * 100, 1) if units and vacant is not None else None
        median = v.get("B25077_E001")
        rec = {
            "pop": p.get("pop"),
            "growthPct": p.get("growthPct"),
            "medianValue": None if not median else int(median),
            "units": None if not units else int(units),
            "vacant": None if vacant is None else int(vacant),
            "vacantPct": vacant_pct,
            "metro": areas.get(fid, {}).get("metro"),
            "metroName": areas.get(fid, {}).get("metroName"),
            "inlandFlood": hazard.get(fid, {}).get("inlandFlood"),
            "coastalFlood": hazard.get(fid, {}).get("coastalFlood"),
            "wildfire": hazard.get(fid, {}).get("wildfire"),
        }
        if fid in pop and rec["metro"] is None:
            rec["metro"] = "neither"
        counties[fid] = rec
    for fid, old in population_2020_retired(counties).items():
        counties[fid] = {
            "pop": old["pop"], "popLabel": old["popLabel"], "note": old["note"],
            "growthPct": None, "medianValue": None, "units": None, "vacant": None, "vacantPct": None,
            "metro": None, "metroName": None, "inlandFlood": None, "coastalFlood": None, "wildfire": None,
        }
    mark_unpublished(counties)
    counties = dict(sorted(counties.items()))
    sources = {
        "population": "Census Bureau population estimates, July 1, 2024",
        "growth": "Census Bureau population estimates, April 1, 2020 base to July 1, 2024",
        "metro": "Census Bureau delineation file list1, OMB July 2023",
        "medianValue": "ACS 2019–2023 5-year table B25077, median value of owner-occupied homes",
        "vacancy": "ACS 2019–2023 5-year table B25002, vacant housing units",
        "flood": "FEMA National Risk Index v1.20, December 2025, county inland and coastal flood ratings",
        "wildfire": "FEMA National Risk Index v1.20, December 2025, county wildfire rating",
        "terrain": "Not scraped. Shown only when the county database already has a class.",
    }
    prev = None
    if OUT.exists():
        try:
            prev = json.loads(OUT.read_text())
        except json.JSONDecodeError:
            prev = None
    same = bool(prev) and json.dumps(prev.get("counties") or {}, sort_keys=True) == json.dumps(counties, sort_keys=True)
    if same:
        print(f"market-unchanged counties {len(counties)} last-checked {prev.get('pulled')}")
        return
    today = date.today().isoformat()
    doc = {"pulled": today, "sources": sources, "counties": counties}
    OUT.write_text(json.dumps(doc, separators=(",", ":")))
    print(f"market-changed counties {len(counties)} mesa {json.dumps(counties.get('08077'))} bytes {OUT.stat().st_size} last-checked {today}")


if __name__ == "__main__":
    main()
