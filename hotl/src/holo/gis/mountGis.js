import L from "leaflet";
import { normApn } from "../propertyRecord";
import { ZOOM_GATE, detailFor, layerInfo, nextTileStatus, parcelQuery, parcelSourceFor, usableParcelId } from "./registry";

const FIRE_POINTS = "https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/WFIGS_Incident_Locations_Current/FeatureServer/0/query";
const FIRE_NOW = "https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/WFIGS_Interagency_Perimeters_Current/FeatureServer/0/query";
const FIRE_HIST = "https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/WFIGS_Interagency_Perimeters/FeatureServer/0/query";
const FEMA = "https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer";
const DEP = "https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer/exportImage";
const WHP = "https://imagery.geoplatform.gov/iipp/rest/services/Fire_Aviation/USFS_EDW_RMRS_WildfireHazardPotentialClassified/ImageServer";
const WHP_PROXY = "/api/gis/whp";
const REGRID = "https://tiles.arcgis.com/tiles/KzeiCaQsMoeCfoCq/arcgis/rest/services/Regrid_Nationwide_Parcel_Boundaries_v1/MapServer/tile/{z}/{y}/{x}";
const ROADS = "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}";

const cache = { fires: null, firesAt: 0, perims: null, perimsAt: 0 };
const FRESH_MS = 30 * 60 * 1000;

function bboxOf(coords) {
  const nw = L.CRS.EPSG3857.project(coords.nw);
  const se = L.CRS.EPSG3857.project(coords.se);
  return [nw.x, se.y, se.x, nw.y].map((n) => n.toFixed(2)).join(",");
}

function exportLayer(url, { extra = {}, minZoom, maxZoom, opacity, zIndex, attribution }) {
  const Layer = L.GridLayer.extend({
    createTile(coords, done) {
      const img = document.createElement("img");
      img.alt = "";
      const tile = this.getTileSize();
      const nw = this._map.unproject(L.point(coords.x * tile.x, coords.y * tile.y), coords.z);
      const se = this._map.unproject(L.point(coords.x * tile.x + tile.x, coords.y * tile.y + tile.y), coords.z);
      const params = new URLSearchParams({
        bbox: bboxOf({ nw, se }),
        bboxSR: "3857",
        imageSR: "3857",
        size: `${tile.x},${tile.y}`,
        format: extra.format || "png32",
        transparent: "true",
        f: "image",
      });
      if (extra.layers) params.set("layers", extra.layers);
      if (extra.renderingRule) params.set("renderingRule", extra.renderingRule);
      let settled = false;
      const finish = (err) => {
        if (settled) return;
        settled = true;
        done(err, img);
      };
      img.onload = () => finish(null);
      img.onerror = () => finish(new Error("tile"));
      img.src = `${url}?${params}`;
      return img;
    },
  });
  return new Layer({ minZoom, maxZoom, opacity, tileSize: 256, zIndex, updateWhenZooming: false, attribution });
}

function when(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

function textDate(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1e11) return null;
  const day = when(n);
  return day.startsWith("1970") ? null : day;
}

function pop(rows) {
  const root = document.createElement("div");
  root.className = "gis-pop";
  for (const [label, value] of rows) {
    if (value == null || value === "") continue;
    const p = document.createElement("p");
    const b = document.createElement("strong");
    b.textContent = label;
    p.append(b, document.createTextNode(` ${value}`));
    root.append(p);
  }
  return root;
}

async function geojson(url, params, signal) {
  const q = new URLSearchParams({ f: "geojson", outSR: "4326", returnGeometry: "true", where: "1=1", ...params });
  const res = await fetch(`${url}?${q}`, { signal });
  if (!res.ok) throw new Error(String(res.status));
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || "query failed");
  return data;
}

export function mountGis(map, handlers) {
  const bag = {
    alive: true,
    tiles: {},
    groups: {},
    counts: {},
    status: {},
    opts: { show: {}, opacity: {}, county: null, parcelPool: [], onParcel: null },
    aborts: {},
    coverage: {},
    floodEnv: null,
    timer: null,
    moveTimer: null,
    stamps: {},
  };
  const onStatus = handlers.onStatus || (() => {});

  function emit(id, event, extra = {}) {
    const prev = bag.counts[id] || { loads: 0, errors: 0 };
    const step = nextTileStatus(prev, event);
    bag.counts[id] = step;
    const info = layerInfo(id);
    const row = {
      id,
      state: extra.state || step.state,
      detail: extra.detail || detailFor(id, event, extra.state || step.state),
      provider: info?.provider || "",
      dataset: info?.dataset || "",
      url: info?.url || "",
      vintage: info?.vintage || "",
      kind: info?.kind || "",
      retrievedAt: extra.retrievedAt || (event === "load" || event === "empty" || event === "stale" ? new Date().toISOString() : bag.status[id]?.retrievedAt || null),
    };
    const before = bag.status[id];
    if (before && before.state === row.state && before.detail === row.detail && before.retrievedAt === row.retrievedAt) return;
    bag.status[id] = row;
    if (bag.timer) clearTimeout(bag.timer);
    bag.timer = setTimeout(() => { if (bag.alive) onStatus({ ...bag.status }); }, 180);
  }

  function drop(id) {
    if (bag.tiles[id]) { map.removeLayer(bag.tiles[id]); delete bag.tiles[id]; }
    if (bag.groups[id]) { map.removeLayer(bag.groups[id]); delete bag.groups[id]; }
    if (bag.aborts[id]) { bag.aborts[id].abort(); delete bag.aborts[id]; }
  }

  function onTile(id, event) {
    if (id === "flood" && bag.coverage.flood === "none") {
      emit("flood", "empty", {
        state: "Unavailable",
        detail: layerInfo("flood").emptyDetail,
        retrievedAt: new Date().toISOString(),
      });
      return;
    }
    emit(id, event);
  }

  function watchTiles(id, layer) {
    bag.tiles[id] = layer;
    layer.addTo(map);
    const timer = setTimeout(() => emit(id, "timeout"), 12000);
    layer.on("tileload", () => { clearTimeout(timer); onTile(id, "load"); });
    layer.on("tileerror", () => onTile(id, "error"));
  }

  function hazardUrl(bounds) {
    const nw = L.CRS.EPSG3857.project(bounds.getNorthWest());
    const se = L.CRS.EPSG3857.project(bounds.getSouthEast());
    const bbox = [nw.x, se.y, se.x, nw.y].map((n) => n.toFixed(2)).join(",");
    const size = map.getSize();
    const scale = Math.min(1, 960 / Math.max(size.x, size.y, 1));
    const w = Math.max(64, Math.round(size.x * scale));
    const h = Math.max(64, Math.round(size.y * scale));
    const root = import.meta.env.DEV ? WHP_PROXY : WHP;
    return `${root}/exportImage?bbox=${encodeURIComponent(bbox)}&bboxSR=3857&imageSR=3857&size=${w},${h}&format=png&transparent=true&f=image`;
  }

  function clearHazard() {
    if (bag.hazardOverlay) { map.removeLayer(bag.hazardOverlay); bag.hazardOverlay = null; }
    bag.hazardKey = null;
    bag.hazardReq = null;
  }

  function syncHazard(on) {
    const gate = ZOOM_GATE.hazard;
    const zoom = map.getZoom();
    if (!on) { clearHazard(); emit("hazard", "off"); return; }
    if (typeof navigator !== "undefined" && navigator.onLine === false) { clearHazard(); emit("hazard", "offline"); return; }
    if (zoom < gate.min || zoom > gate.max) { clearHazard(); emit("hazard", "gate"); return; }
    const bounds = map.getBounds();
    const opacity = bag.opts.opacity?.hazard ?? 0.5;
    const r = (n) => n.toFixed(2);
    const key = `${zoom}|${r(bounds.getWest())}|${r(bounds.getSouth())}|${r(bounds.getEast())}|${r(bounds.getNorth())}`;
    if (bag.hazardOverlay && bag.hazardKey === key) { bag.hazardOverlay.setOpacity(opacity); return; }
    const token = {};
    bag.hazardReq = token;
    if (!bag.hazardOverlay) {
      const info = layerInfo("hazard");
      bag.status.hazard = {
        id: "hazard", state: "Loading", detail: "Waiting for the service.",
        provider: info.provider, dataset: info.dataset, url: info.url, vintage: info.vintage, kind: info.kind, retrievedAt: null,
      };
      onStatus({ ...bag.status });
    }
    const url = hazardUrl(bounds);
    const img = new Image();
    img.onload = () => {
      if (!bag.alive || bag.hazardReq !== token || !bag.opts.show.hazard) return;
      if (bag.hazardOverlay) map.removeLayer(bag.hazardOverlay);
      bag.hazardOverlay = L.imageOverlay(url, bounds, { opacity, zIndex: 280, interactive: false, pane: "tilePane" }).addTo(map);
      bag.hazardKey = key;
      emit("hazard", "load", { retrievedAt: new Date().toISOString() });
    };
    img.onerror = () => {
      if (!bag.alive || bag.hazardReq !== token) return;
      if (bag.hazardOverlay) emit("hazard", "stale");
      else emit("hazard", "timeout");
    };
    img.src = url;
  }

  function checkFlood() {
    if (bag.aborts.flood) bag.aborts.flood.abort();
    const ctrl = new AbortController();
    bag.aborts.flood = ctrl;
    const b = map.getBounds();
    const digits = map.getZoom() >= 12 ? 3 : 2;
    const r = (n) => n.toFixed(digits);
    const env = [r(b.getWest()), r(b.getSouth()), r(b.getEast()), r(b.getNorth())].join(",");
    if (bag.floodEnv === env && bag.coverage.flood && bag.coverage.flood !== "pending") return;
    bag.floodEnv = env;
    bag.coverage.flood = "pending";
    const url = `${FEMA}/0/query?geometry=${env}&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&returnCountOnly=true&f=json`;
    const timed = { out: false };
    const timer = setTimeout(() => { timed.out = true; ctrl.abort(); }, 12000);
    fetch(url, { signal: ctrl.signal })
      .then((res) => res.json())
      .then((data) => {
        if (!bag.alive || !bag.opts.show.flood || ctrl.signal.aborted) return;
        if (data.count === 0) {
          bag.coverage.flood = "none";
          emit("flood", "empty", {
            state: "Unavailable",
            detail: layerInfo("flood").emptyDetail,
            retrievedAt: new Date().toISOString(),
          });
        } else if (typeof data.count === "number") {
          bag.coverage.flood = "some";
        }
      })
      .catch(() => {
        if (!bag.alive || (ctrl.signal.aborted && !timed.out)) return;
        bag.coverage.flood = "unknown";
        bag.floodEnv = null;
      })
      .finally(() => clearTimeout(timer));
  }

  function syncTiles(id, on, build) {
    const zoom = map.getZoom();
    const gate = ZOOM_GATE[id];
    const stamp = bag.opts.retry?.[id] || 0;
    if ((bag.stamps[id] || 0) !== stamp) {
      drop(id);
      bag.stamps[id] = stamp;
      bag.counts[id] = { loads: 0, errors: 0 };
    }
    if (!on) { drop(id); emit(id, "off"); return; }
    if (typeof navigator !== "undefined" && navigator.onLine === false) { drop(id); emit(id, "offline"); return; }
    if (gate && (zoom < gate.min || zoom > gate.max)) {
      drop(id);
      emit(id, "gate");
      return;
    }
    if (bag.tiles[id]) {
      const opacity = bag.opts.opacity?.[id];
      if (opacity != null) bag.tiles[id].setOpacity(opacity);
      if (id === "flood") checkFlood();
      return;
    }
    bag.counts[id] = { loads: 0, errors: 0, state: "Loading" };
    const info = layerInfo(id);
    bag.status[id] = {
      id, state: "Loading", detail: "Waiting for the service.",
      provider: info?.provider || "", dataset: info?.dataset || "", url: info?.url || "",
      vintage: info?.vintage || "", kind: info?.kind || "", retrievedAt: null,
    };
    onStatus({ ...bag.status });
    const layer = build();
    watchTiles(id, layer);
    if (id === "flood") checkFlood();
  }

  function removeDrawn(id) {
    if (bag.groups[id]) { map.removeLayer(bag.groups[id]); delete bag.groups[id]; }
  }

  function drawFires(data, stale) {
    removeDrawn("fires");
    const group = L.layerGroup();
    const features = data?.features || [];
    const fade = bag.opts.opacity?.fires ?? 0.9;
    for (const feature of features) {
      const coords = feature.geometry?.coordinates;
      const props = feature.properties || {};
      if (!coords || feature.geometry.type !== "Point") continue;
      const marker = L.circleMarker([coords[1], coords[0]], {
        radius: 7, color: "#fff", weight: 1.5, fillColor: "#e25b3a", fillOpacity: fade, opacity: Math.min(1, fade),
      });
      const day = textDate(props.FireDiscoveryDateTime);
      marker.on("click", (e) => L.DomEvent.stopPropagation(e));
      marker.bindPopup(pop([
        ["Current incident", props.IncidentName || "Name not in the record"],
        ["Type", props.IncidentTypeCategory || null],
        ["County", [props.POOCounty, props.POOState].filter(Boolean).join(", ") || null],
        ["Size on the record", props.IncidentSize != null ? `${props.IncidentSize} acres on the incident record` : null],
        ["Discovered", day],
        ["Source", "NIFC WFIGS current incidents. Not a parcel score and not a forecast."],
      ]));
      marker.addTo(group);
    }
    group.addTo(map);
    bag.groups.fires = group;
    if (!features.length) emit("fires", "empty", { retrievedAt: new Date().toISOString() });
    else emit("fires", stale ? "stale" : "load", { retrievedAt: new Date(cache.firesAt).toISOString() });
  }

  function drawPerimeters(current, historic, stale, note) {
    removeDrawn("perimeters");
    const group = L.layerGroup();
    const fade = bag.opts.opacity?.perimeters ?? 0.75;
    const add = (features, style, label) => {
      if (!features?.length) return;
      L.geoJSON({ type: "FeatureCollection", features }, {
        style: () => style,
        onEachFeature: (feature, layer) => {
          layer.on("click", (e) => L.DomEvent.stopPropagation(e));
          const p = feature.properties || {};
          const day = textDate(p.attr_FireDiscoveryDateTime || p.poly_PolygonDateTime);
          layer.bindPopup(pop([
            [label, p.poly_IncidentName || p.attr_IncidentName || "Name not in the record"],
            ["County", [p.attr_POOCounty, p.attr_POOState].filter(Boolean).join(", ") || null],
            ["Acres on the polygon", p.poly_GISAcres != null ? `${Math.round(p.poly_GISAcres).toLocaleString()} GIS acres` : null],
            ["Discovered", day],
            ["Source", "NIFC WFIGS. A perimeter is not a forecast and not a parcel determination."],
          ]));
        },
      }).addTo(group);
    };
    add(historic, { color: "#c9a227", weight: 1.5, dashArray: "4 4", opacity: fade, fillOpacity: 0.05 * fade }, "Historic perimeter");
    add(current, { color: "#e25b3a", weight: 2.5, opacity: fade, fillColor: "#e25b3a", fillOpacity: 0.22 * fade }, "Current perimeter");
    group.addTo(map);
    bag.groups.perimeters = group;
    const n = (current?.length || 0) + (historic?.length || 0);
    const wide = map.getZoom() < 8 ? " Historic perimeters were not requested at this zoom. A wide view is not a complete history." : "";
    if (!n) {
      emit("perimeters", "empty", {
        retrievedAt: new Date().toISOString(),
        detail: `${layerInfo("perimeters").emptyDetail}${wide}`,
      });
    } else {
      emit("perimeters", stale ? "stale" : "load", {
        retrievedAt: new Date().toISOString(),
        detail: note || (historic?.length
          ? `Current perimeters, plus ${historic.length} historic polygons in this view (capped at 30). Not a complete fire history.`
          : `Current perimeters in this view are drawn.${wide}`),
      });
    }
  }

  function viewKey() {
    const b = map.getBounds();
    const zoom = map.getZoom();
    const r = (n) => n.toFixed(zoom < 8 ? 1 : 2);
    return `${zoom}|${r(b.getWest())}|${r(b.getSouth())}|${r(b.getEast())}|${r(b.getNorth())}`;
  }

  function offsetFor(zoom) {
    if (zoom < 6) return "0.15";
    if (zoom < 9) return "0.05";
    if (zoom < 12) return "0.02";
    return "0.008";
  }

  async function loadFires() {
    if (cache.fires && Date.now() - cache.firesAt < FRESH_MS) { drawFires(cache.fires, false); return; }
    const ctrl = new AbortController();
    bag.aborts.fires = ctrl;
    const timer = setTimeout(() => ctrl.abort(), 15000);
    try {
      const data = await geojson(FIRE_POINTS, {
        outFields: "IncidentName,IncidentTypeCategory,FireDiscoveryDateTime,POOState,POOCounty,IncidentSize",
        resultRecordCount: "500",
      }, ctrl.signal);
      cache.fires = data;
      cache.firesAt = Date.now();
      if (bag.alive && bag.opts.show.fires) drawFires(data, false);
    } catch {
      if (!bag.alive) return;
      if (cache.fires && bag.opts.show.fires) drawFires(cache.fires, true);
      else if (bag.opts.show.fires) emit("fires", "timeout");
    } finally {
      clearTimeout(timer);
    }
  }

  async function loadPerimeters() {
    if (bag.aborts.perimeters) bag.aborts.perimeters.abort();
    const ctrl = new AbortController();
    bag.aborts.perimeters = ctrl;
    const key = viewKey();
    const zoom = map.getZoom();
    const bounds = map.getBounds();
    const env = [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()].join(",");
    const offset = offsetFor(zoom);
    let timed = false;
    const timer = setTimeout(() => { timed = true; ctrl.abort(); }, 15000);
    let historic = [];
    let stale = false;
    let capped = false;
    try {
      const hit = cache.perimView;
      let currentData = hit && hit.key === key && Date.now() - hit.at < FRESH_MS ? hit.current : null;
      if (!currentData) {
        currentData = await geojson(FIRE_NOW, {
          geometry: env,
          geometryType: "esriGeometryEnvelope",
          inSR: "4326",
          spatialRel: "esriSpatialRelIntersects",
          outFields: "poly_IncidentName,attr_IncidentName,attr_FireDiscoveryDateTime,poly_GISAcres,attr_POOCounty,attr_POOState",
          resultRecordCount: "120",
          geometryPrecision: "3",
          maxAllowableOffset: offset,
        }, ctrl.signal);
        if (currentData.properties?.exceededTransferLimit) capped = true;
      }
      if (zoom >= 8) {
        try {
          const hist = await geojson(FIRE_HIST, {
            geometry: env,
            geometryType: "esriGeometryEnvelope",
            inSR: "4326",
            spatialRel: "esriSpatialRelIntersects",
            outFields: "poly_IncidentName,attr_IncidentName,attr_FireDiscoveryDateTime,poly_GISAcres,attr_POOCounty,attr_POOState",
            resultRecordCount: "30",
            geometryPrecision: "3",
            maxAllowableOffset: offset,
          }, ctrl.signal);
          historic = hist.features || [];
          if (hist.properties?.exceededTransferLimit) capped = true;
        } catch (err) {
          if (ctrl.signal.aborted && !timed) throw err;
          stale = true;
        }
      }
      cache.perimView = { key, at: Date.now(), current: currentData };
      if (bag.alive && bag.opts.show.perimeters && !ctrl.signal.aborted) {
        const current = currentData.features || [];
        const note = capped
          ? "Some perimeters in this view were not returned. What is drawn is not a complete fire history."
          : null;
        drawPerimeters(current, historic, false, note);
        if ((stale || capped) && (current.length || historic.length)) {
          emit("perimeters", "load", {
            state: "Partial coverage",
            detail: stale
              ? "Current perimeters are drawn. The historic-perimeter request failed, so this view is not a fire history."
              : note,
          });
        }
      }
    } catch {
      if (!bag.alive || (ctrl.signal.aborted && !timed)) return;
      bag.perimKey = null;
      if (cache.perimView?.current && bag.opts.show.perimeters) drawPerimeters(cache.perimView.current.features || [], [], true);
      else if (bag.opts.show.perimeters) emit("perimeters", "timeout");
    } finally {
      clearTimeout(timer);
    }
  }

  function syncVectors() {
    const { show, opacity = {} } = bag.opts;
    const fade = `${opacity.fires ?? 0.9}|${opacity.perimeters ?? 0.75}`;
    if (!show.fires) { drop("fires"); emit("fires", "off"); bag.fireFade = null; }
    else if (!bag.groups.fires || bag.fireFade !== fade) {
      bag.fireFade = fade;
      if (cache.fires) drawFires(cache.fires, Date.now() - cache.firesAt >= FRESH_MS);
      else if (!bag.firesPending) {
        bag.firesPending = true;
        loadFires().finally(() => { bag.firesPending = false; });
      }
    }
    if (!show.perimeters) { drop("perimeters"); emit("perimeters", "off"); bag.perimKey = null; }
    else {
      const key = `${viewKey()}|${fade}`;
      if (bag.perimKey !== key) {
        bag.perimKey = key;
        loadPerimeters();
      }
    }
  }

  function run(label, job) {
    try { job(); }
    catch { emit(label, "error"); }
  }

  function sync() {
    const { show, opacity = {} } = bag.opts;
    run("parcels", () => syncTiles("parcels", !!show.parcels, () => L.tileLayer(REGRID, {
      minZoom: 15, maxZoom: 17, opacity: opacity.parcels ?? 0.9, zIndex: 420,
      attribution: "Parcel lines: Regrid nationwide boundary tiles (visual only)",
    })));
    run("terrain", () => syncTiles("terrain", !!show.terrain, () => exportLayer(DEP, {
      extra: { format: "png", renderingRule: JSON.stringify({ rasterFunction: "Hillshade Elevation Tinted" }) },
      minZoom: 6, maxZoom: 16, opacity: opacity.terrain ?? 0.55, zIndex: 260,
      attribution: "Terrain: USGS 3DEP",
    })));
    run("flood", () => syncTiles("flood", !!show.flood, () => exportLayer(`${FEMA}/export`, {
      extra: { format: "png32", layers: "show:28" },
      minZoom: 13, maxZoom: 18, opacity: opacity.flood ?? 0.62, zIndex: 340,
      attribution: "Flood: FEMA NFHL",
    })));
    run("roads", () => syncTiles("roads", !!show.roads, () => L.tileLayer(ROADS, {
      maxZoom: 19, opacity: opacity.roads ?? 1, zIndex: 280,
      attribution: "Roads: Esri World Transportation",
    })));
    run("hazard", () => syncHazard(!!show.hazard));
    run("fires", () => syncVectors());
  }

  function willIdentify() {
    const { show, county } = bag.opts;
    const zoom = map.getZoom();
    if (show.parcels && parcelSourceFor(county) && zoom >= (parcelSourceFor(county).minZoom ?? 14)) return true;
    if (show.flood && zoom >= 13) return true;
    return false;
  }

  function identify(latlng) {
    if (!willIdentify()) return false;
    void runIdentify(latlng);
    return true;
  }

  async function runIdentify(latlng) {
    const { show, county, parcelPool, onParcel } = bag.opts;
    const zoom = map.getZoom();
    const blocks = [];
    const source = parcelSourceFor(county);
    let parcelRoot = null;
    bag.parcelRoot = null;
    if (show.parcels && source && zoom >= (source.minZoom ?? 14)) {
      try {
        const res = await fetch(parcelQuery(source, latlng.lng, latlng.lat));
        const data = await res.json();
        const features = data.features || [];
        const apnKey = source.fields?.apn;
        const readApn = (feature) => usableParcelId(apnKey ? feature.properties?.[apnKey] : "");
        const groups = new Map();
        for (const feature of features) {
          const pin = readApn(feature);
          if (!pin) continue;
          if (!groups.has(pin)) groups.set(pin, []);
          groups.get(pin).push(feature);
        }
        const pins = [...groups.keys()];
        const draw = (drawn) => {
          if (bag.groups.hit) map.removeLayer(bag.groups.hit);
          if (!drawn?.length) { bag.groups.hit = null; return; }
          bag.groups.hit = L.geoJSON({ type: "FeatureCollection", features: drawn }, { style: { color: "#e2b657", weight: 3, fillColor: "#e2b657", fillOpacity: 0.2 } }).addTo(map);
        };
        const match = (pin) => (parcelPool || []).find((p) => p.state === source.state && String(p.county).toLowerCase() === source.county.toLowerCase() && normApn(p.apn) === normApn(pin));
        const openParcel = (pin, chosen, immediate) => {
          const hit = pin ? match(pin) : null;
          const root = pop(chosen || pins.length < 2
            ? [
              ["Parcel ID", pin],
              ["County", `${source.county} County, ${source.state}`],
              ["Source", `${source.provider}. Checked ${source.checked}. Not a title search.`],
            ]
            : [
              ["County", `${source.county} County, ${source.state}`],
              ["Source", `${source.provider}. Checked ${source.checked}. Not a title search.`],
            ]);
          if (!chosen && pins.length > 1) {
            const note = document.createElement("p");
            note.textContent = "More than one parcel overlaps this point. Choose one. A research file is not opened until you do.";
            root.append(note);
            for (const id of pins) {
              const button = document.createElement("button");
              button.type = "button";
              button.className = "gis-choice";
              button.textContent = id;
              button.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();
                draw(groups.get(id));
                openParcel(id, true, true);
              });
              root.append(button);
            }
          } else if (hit) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "gis-choice";
            button.textContent = "Open research file";
            button.addEventListener("click", (event) => {
              event.preventDefault();
              event.stopPropagation();
              if (onParcel) onParcel(hit);
            });
            root.append(button);
          } else {
            const note = document.createElement("p");
            note.textContent = "No row on the lists matches this parcel id. The list was not given a made-up parcel.";
            root.append(note);
          }
          parcelRoot = root;
          if (immediate) L.popup({ maxWidth: 320 }).setLatLng(latlng).setContent(root).openOn(map);
        };
        if (!pins.length) {
          blocks.push(["County parcels", `${source.provider} returned no parcel id at this point. That is not proof the point is unparceled.`]);
        } else if (pins.length > 1) {
          draw(features.filter((feature) => readApn(feature)));
          openParcel(null, false, false);
        } else {
          const pin = pins[0];
          draw(groups.get(pin));
          const hit = match(pin);
          openParcel(pin, true, false);
          if (hit && onParcel) onParcel(hit);
          emit("parcels", "load", { detail: `${source.provider} returned ${source.fields.apn} ${pin}. The nationwide lines remain visual only.` });
        }
        bag.parcelRoot = parcelRoot;
      } catch {
        blocks.push(["County parcels", `${source.provider} did not answer. The nationwide lines, if on, are still only a picture.`]);
      }
    }
    if (show.flood && zoom >= 13) {
      try {
        const b = map.getBounds();
        const url = `${FEMA}/identify?geometry=${latlng.lng},${latlng.lat}&geometryType=esriGeometryPoint&sr=4326&layers=all:28&tolerance=6&mapExtent=${b.getWest()},${b.getSouth()},${b.getEast()},${b.getNorth()}&imageDisplay=800,800,96&returnGeometry=false&f=pjson`;
        const data = await (await fetch(url)).json();
        const row = (data.results || [])[0];
        if (!row) {
          const avail = await (await fetch(`${FEMA}/0/query?geometry=${latlng.lng},${latlng.lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=STUDY_ID&returnGeometry=false&f=pjson`)).json();
          if (!(avail.features || []).length) {
            if (bag.coverage.flood !== "some") {
              emit("flood", "empty", { state: "Unavailable", detail: layerInfo("flood").emptyDetail });
            }
            blocks.push(["Flood", "No GIS coverage found for this area. That is not a finding of no flood risk."]);
          } else {
            blocks.push(["Flood", "The NFHL study footprint is present, and no flood-hazard zone was returned at this point. That is not a site-specific determination."]);
          }
        } else {
          const a = row.attributes || {};
          const zone = [a.FLD_ZONE, a.ZONE_SUBTY].filter(Boolean).join(" — ");
          blocks.push(["Flood zone", zone || "Returned without a zone code"]);
          if (a.SFHA_TF) blocks.push(["SFHA flag", String(a.SFHA_TF)]);
          blocks.push(["Study", a.DFIRM_ID || null]);
          blocks.push(["Flood note", "FEMA NFHL overlay. Not a site-specific flood determination and not a statement that a zone is safe."]);
          emit("flood", "load", {
            detail: `NFHL returned ${zone || "a flood-hazard polygon"} at the clicked point. Not a site-specific determination and not a statement that a zone is safe.`,
          });
        }
      } catch {
        blocks.push(["Flood", "The FEMA identify request failed. Other layers were left as they are."]);
      }
    }
    if (!bag.alive) return;
    const shown = bag.parcelRoot;
    if (shown) {
      for (const [label, value] of blocks) {
        if (value == null || value === "") continue;
        const p = document.createElement("p");
        const b = document.createElement("strong");
        b.textContent = label;
        p.append(b, document.createTextNode(` ${value}`));
        shown.append(p);
      }
      L.popup({ maxWidth: 320 }).setLatLng(latlng).setContent(shown).openOn(map);
      return;
    }
    if (!blocks.length) return;
    L.popup({ maxWidth: 320 }).setLatLng(latlng).setContent(pop(blocks)).openOn(map);
  }

  function onMove() {
    if (bag.moveTimer) clearTimeout(bag.moveTimer);
    bag.moveTimer = setTimeout(() => { if (bag.alive) { sync(); } }, 280);
  }

  map.on("moveend", onMove);
  map.on("click", (e) => { if (bag.alive) identify(e.latlng); });

  return {
    update(opts) {
      bag.opts = { ...bag.opts, ...opts, show: opts.show || bag.opts.show, opacity: opts.opacity || bag.opts.opacity };
      sync();
    },
    identify,
    destroy() {
      bag.alive = false;
      map.off("moveend", onMove);
      if (bag.timer) clearTimeout(bag.timer);
      if (bag.moveTimer) clearTimeout(bag.moveTimer);
      for (const id of Object.keys({ ...bag.tiles, ...bag.groups })) drop(id);
      clearHazard();
      if (bag.groups.hit) map.removeLayer(bag.groups.hit);
    },
  };
}
