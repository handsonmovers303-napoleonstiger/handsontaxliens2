import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { feature } from "topojson-client";
import topology from "us-atlas/counties-10m.json";
import { getCounty } from "@/data/catalog";

type Props = {
  selected: string;
  system: "all" | "lien" | "deed";
  datedOnly: boolean;
  state: string;
  onSelect: (fips: string) => void;
};

const collection = feature(topology, topology.objects.counties);

for (const item of collection.features) {
  const id = String(item.id ?? "").padStart(5, "0");
  item.properties = { ...(item.properties || {}), fips: id };
}

function pad(id: string | number | undefined): string {
  return String(id ?? "").padStart(5, "0");
}

function token(name: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

export function AtlasMapClient({ selected, system, datedOnly, state, onSelect }: Props) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const onSelectRef = useRef(onSelect);
  const styleRef = useRef<Props>({ selected, system, datedOnly, state, onSelect });
  onSelectRef.current = onSelect;
  styleRef.current = { selected, system, datedOnly, state, onSelect };

  useEffect(() => {
    const el = elRef.current;
    if (!el || mapRef.current) return;

    const colors = {
      lien: token("--color-lien", "#8ea4b5"),
      deed: token("--color-deed", "#b08a68"),
      unknown: token("--color-unknown", "#44505c"),
      gold: token("--color-gold", "#c6a15a"),
      line: token("--color-line", "#2c3a4a"),
    };

    const styleOf = (fips: string): Record<string, string | number | boolean> => {
      const props = styleRef.current;
      const county = getCounty(fips);
      const selectedOn = props.selected === fips;
      const dated = !!county?.events.some((event) => event.level !== "derived");
      const systemMiss = props.system !== "all" && county?.system !== props.system;
      const stateMiss = !!props.state && county?.state !== props.state;
      const datedMiss = props.datedOnly && !dated;
      const dim = systemMiss || stateMiss || datedMiss;
      const fill =
        county?.system === "lien" ? colors.lien : county?.system === "deed" ? colors.deed : colors.unknown;
      return {
        color: selectedOn || dated ? colors.gold : colors.line,
        weight: selectedOn ? 2.4 : dated ? 1.3 : 0.45,
        fillColor: fill,
        fillOpacity: dim ? 0.08 : selectedOn ? 0.92 : 0.72,
        opacity: dim ? 0.35 : 1,
      };
    };

    const map = L.map(el, {
      minZoom: 3,
      maxZoom: 11,
      zoomControl: false,
      attributionControl: true,
    });
    L.control.zoom({ position: "topright" }).addTo(map);
    const attribution =
      "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ";
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
      { attribution, maxZoom: 16 },
    ).addTo(map);
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 16, pane: "tilePane" },
    ).addTo(map);

    const layer = L.geoJSON(collection as never, {
      style: (feat: { id?: string | number }) => styleOf(pad(feat?.id)),
      onEachFeature: (feat: { id?: string | number }, shape: any) => {
        const fips = pad(feat.id);
        const county = getCounty(fips);
        const label = county ? `${county.name} County, ${county.state}` : fips;
        shape.bindTooltip(label, { sticky: true, className: "atlas-tip", opacity: 1 });
        shape.on("click", () => onSelectRef.current(fips));
      },
    }).addTo(map);

    let alive = true;
    let framed = false;
    const frameHome = () => {
      if (!alive || framed) return;
      if (el.clientWidth < 40 || el.clientHeight < 40) return;
      map.invalidateSize();
      const focus = styleRef.current;
      if (!focus.selected && !focus.state) {
        map.fitBounds(
          [
            [24.4, -125],
            [49.4, -66.8],
          ],
          { animate: false },
        );
      }
      framed = true;
    };
    const frame = requestAnimationFrame(frameHome);
    mapRef.current = map;
    layerRef.current = layer;

    const observer = new ResizeObserver(frameHome);
    observer.observe(el);
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      mapRef.current = null;
      layerRef.current = null;
      map.remove();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.setStyle((feat: { id?: string | number }) => {
      const fips = pad(feat?.id);
      const county = getCounty(fips);
      const selectedOn = selected === fips;
      const dated = !!county?.events.some((event) => event.level !== "derived");
      const dim =
        (system !== "all" && county?.system !== system) ||
        (!!state && county?.state !== state) ||
        (datedOnly && !dated);
      const fill =
        county?.system === "lien"
          ? token("--color-lien", "#8ea4b5")
          : county?.system === "deed"
            ? token("--color-deed", "#b08a68")
            : token("--color-unknown", "#44505c");
      return {
        color: selectedOn || dated ? token("--color-gold", "#c6a15a") : token("--color-line", "#2c3a4a"),
        weight: selectedOn ? 2.4 : dated ? 1.3 : 0.45,
        fillColor: fill,
        fillOpacity: dim ? 0.08 : selectedOn ? 0.92 : 0.72,
        opacity: dim ? 0.35 : 1,
      };
    });
  }, [selected, system, datedOnly, state]);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    if (selected) {
      layer.eachLayer((shape: any) => {
        const poly = shape;
        if (pad(poly.feature?.id) === selected && poly.getBounds) {
          map.fitBounds(poly.getBounds(), { padding: [28, 28], maxZoom: 8 });
        }
      });
      return;
    }
    if (state) {
      const bounds = L.latLngBounds([]);
      let any = false;
      layer.eachLayer((shape: any) => {
        const poly = shape;
        const fips = pad(poly.feature?.id);
        if (getCounty(fips)?.state === state && poly.getBounds) {
          bounds.extend(poly.getBounds());
          any = true;
        }
      });
      if (any) map.fitBounds(bounds, { padding: [20, 20] });
      return;
    }
    map.fitBounds([
      [24.4, -125],
      [49.4, -66.8],
    ]);
  }, [selected, state]);

  return <div ref={elRef} className="h-full w-full" />;
}
