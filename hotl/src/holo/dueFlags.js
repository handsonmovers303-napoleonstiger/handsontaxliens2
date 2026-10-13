/** Warnings only from what is actually on file. No machine reading of the picture. */
export function dueFlags({ p, point, ring, visit, photos }) {
  const flags = [];
  if (!point && !ring) flags.push({
    title: "Parcel location is not on file",
    reason: "This record has no coordinate, so the picture cannot be centered on the parcel.",
    evidence: "The list row has no latitude or longitude, and no site pin is saved.",
    source: "Parcel list on file",
    confidence: "High",
    status: "UNKNOWN",
    action: "Confirm the parcel on the county GIS, or pin it on site.",
  });
  if (!ring) flags.push({
    title: "Parcel boundary not on file",
    reason: "No parcel polygon is stored, so no line is drawn.",
    evidence: "The parcel record has no geometry.",
    source: "Parcel list on file",
    confidence: "High",
    status: "NEEDS VERIFICATION",
    action: "Open the county GIS and confirm the line before measuring.",
  });
  const road = visit?.obs?.road;
  flags.push(road ? {
    title: road === "None / blocked" ? "Property appears inaccessible" : "Road note from a site visit",
    reason: `A scout recorded the road as “${road}”. That is one visit, not an easement search.`,
    evidence: "Field visit observation.",
    source: "Scout observation",
    confidence: "Medium",
    status: "USER-OBSERVED",
    action: "Confirm legal access with the county. A visit does not prove an easement.",
  } : {
    title: "ACCESS REQUIRES VERIFICATION",
    reason: "No driveway, easement, or road observation is on file.",
    evidence: "No access layer and no scout road note.",
    source: "Not on file",
    confidence: "High",
    status: "NEEDS VERIFICATION",
    action: "Check the county road map and record what you see on site.",
  });
  flags.push({
    title: "Imagery date is not on file",
    reason: "The aerial tiles do not include a capture date.",
    evidence: "USGS National Map imagery tiles. The date is not in the tile.",
    source: "USGS The National Map",
    confidence: "High",
    status: "UNKNOWN",
    action: "Do not treat the picture as current. Check the county GIS for a dated photo.",
  });
  if (p.value == null) flags.push({
    title: "Missing assessor data",
    reason: "Assessed value is not on this list row.",
    evidence: "The parcel record has no assessed value.",
    source: "Parcel list on file",
    confidence: "High",
    status: "UNKNOWN",
    action: "Read the assessor record before comparing the picture to the roll.",
  });
  if (p.acres == null) flags.push({
    title: "Acreage is not on file",
    reason: "Size cannot be shown from this row.",
    evidence: "The parcel record has no acreage.",
    source: "Parcel list on file",
    confidence: "High",
    status: "UNKNOWN",
    action: "Read the assessor or GIS acreage.",
  });
  const structure = visit?.obs?.structure;
  if (!structure) flags.push({
    title: "Structure count needs verification",
    reason: "The picture was not scanned for buildings, and the assessor structure count is not on file.",
    evidence: "No imagery detection was run.",
    source: "Not on file",
    confidence: "High",
    status: "NEEDS VERIFICATION",
    action: "Compare the assessor card with what you see, then record it.",
  });
  else flags.push({
    title: "Structure note from a site visit",
    reason: `A scout recorded structure condition as “${structure}”. That is not an assessor count.`,
    evidence: "Field visit observation.",
    source: "Scout observation",
    confidence: "Medium",
    status: "USER-OBSERVED",
    action: "Match it to the assessor improvement record.",
  });
  if (visit?.obs?.occupancy === "Occupied") flags.push({
    title: "Possible occupied structure",
    reason: "A scout recorded occupancy as occupied.",
    evidence: "Field visit observation.",
    source: "Scout observation",
    confidence: "Medium",
    status: "USER-OBSERVED",
    action: "Confirm occupancy before any contact. A note is not a title finding.",
  });
  if (!(photos && photos.length)) flags.push({
    title: "Scout verification required",
    reason: "No field photo is saved for this parcel.",
    evidence: "The photo set is empty.",
    source: "This device",
    confidence: "High",
    status: "NEEDS VERIFICATION",
    action: "Record a site visit if you need ground evidence.",
  });
  return flags;
}
