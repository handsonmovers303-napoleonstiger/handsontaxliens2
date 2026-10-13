/* US geometry (us-atlas, pre-projected Albers USA at 975×610), built once:
 * counties and states with their paths, centroids and bounds for drill-down. */
import topo from "us-atlas/counties-albers-10m.json";
import geoTopo from "us-atlas/counties-10m.json";
import { feature, mesh } from "topojson-client";
import { geoPath } from "d3-geo";
import { STATE_NAMES } from "../legacy/ScoutingDept.jsx";

const ABBR_BY_NAME = Object.fromEntries(Object.entries(STATE_NAMES).map(([ab, name]) => [name, ab]));

let cache = null;
export function usGeometry() {
  if (cache) return cache;
  const path = geoPath();
  const counties = feature(topo, topo.objects.counties).features.map((f) => {
    const d = path(f);
    return { fips: String(f.id).padStart(5, "0"), d, c: path.centroid(f), b: path.bounds(f) };
  }).filter((x) => x.d);
  const states = feature(topo, topo.objects.states).features.map((f) => ({
    id: String(f.id).padStart(2, "0"), name: f.properties.name, abbr: ABBR_BY_NAME[f.properties.name] || null,
    d: path(f), c: path.centroid(f), b: path.bounds(f),
  })).filter((s) => s.d);
  cache = {
    counties, states,
    byFips: new Map(counties.map((x) => [x.fips, x])),
    stateByAbbr: new Map(states.filter((s) => s.abbr).map((s) => [s.abbr, s])),
    stateMesh: path(mesh(topo, topo.objects.states, (a, b) => a !== b)),
    nation: path(mesh(topo, topo.objects.nation)),
    width: 975, height: 610,
  };
  cache.states_ = cache.stateMesh; // kept for older callers
  return cache;
}

function ringCenter(geometry) {
  const polys = geometry?.type === "Polygon" ? [geometry.coordinates] : geometry?.type === "MultiPolygon" ? geometry.coordinates : [];
  let ring = null;
  for (const poly of polys) {
    const outer = poly?.[0];
    if (outer && (!ring || outer.length > ring.length)) ring = outer;
  }
  if (!ring || ring.length < 3) return null;
  let lon = 0, lat = 0;
  for (const p of ring) { lon += p[0]; lat += p[1]; }
  lon /= ring.length; lat /= ring.length;
  return Number.isFinite(lat) && Number.isFinite(lon) ? [lat, lon] : null;
}

let countyGeoCache = null;
/** Unprojected Census county shapes, for a map in latitude and longitude. */
export function countyGeo() {
  if (countyGeoCache) return countyGeoCache;
  const features = feature(geoTopo, geoTopo.objects.counties).features.map((f) => ({
    type: "Feature",
    properties: { fips: String(f.id).padStart(5, "0"), name: f.properties?.name || "" },
    geometry: f.geometry,
  }));
  const centers = new Map();
  for (const f of features) {
    const c = ringCenter(f.geometry);
    if (c) centers.set(f.properties.fips, c);
  }
  countyGeoCache = { features, centers };
  return countyGeoCache;
}
/** A viewBox that frames bounds with padding, keeping the map's aspect ratio. */
export function frame(b, pad = 0.18, aspect = 975 / 610) {
  let [[x0, y0], [x1, y1]] = b;
  let w = x1 - x0, h = y1 - y0;
  const px = w * pad, py = h * pad; x0 -= px; y0 -= py; w += px * 2; h += py * 2;
  if (w / h > aspect) { const nh = w / aspect; y0 -= (nh - h) / 2; h = nh; } else { const nw = h * aspect; x0 -= (nw - w) / 2; w = nw; }
  return `${x0} ${y0} ${w} ${h}`;
}
