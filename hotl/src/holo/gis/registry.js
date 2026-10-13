/** Live map sources. A status here is about the service response, never about safety. */
import book from "./coverageBook.json";

export const LAYER_INFO = [
  {
    id: "parcels",
    label: "Parcel lines",
    provider: "Regrid",
    dataset: "Nationwide parcel boundaries (tile layer)",
    url: "https://tiles.arcgis.com/tiles/KzeiCaQsMoeCfoCq/arcgis/rest/services/Regrid_Nationwide_Parcel_Boundaries_v1/MapServer",
    vintage: "Tile cache last-modified 2026-07-28. Levels 15–17 only.",
    kind: "Commercial visual overlay",
    okDetail: "Parcel lines are on the photo. They are not a county record and they do not supply an APN.",
    failDetail: "The parcel-line service did not return a tile. Parcel identity was not filled in.",
    gateDetail: "Nationwide parcel lines draw only at zoom 15–17. A wider view is not a finding that no parcels exist.",
  },
  {
    id: "terrain",
    label: "Terrain",
    provider: "USGS 3D Elevation Program",
    dataset: "3DEP bare-earth DEM, elevation-tinted hillshade",
    url: "https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer",
    vintage: "Service copyright notice: October 01, 2026. Dynamic image, not a static snapshot.",
    kind: "Official",
    okDetail: "Hillshade is drawn from the USGS 3DEP image service. It is elevation, not a parcel or a hazard.",
    failDetail: "The USGS elevation service did not return a hillshade tile.",
    gateDetail: "Hillshade is requested from zoom 6. A national view was not given a terrain reading.",
  },
  {
    id: "flood",
    label: "Flood",
    provider: "FEMA",
    dataset: "National Flood Hazard Layer, current effective flood-hazard zones",
    url: "https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer",
    vintage: "Effective NFHL. A study date, when the identify call returns one, is per polygon. There is no single national effective date.",
    kind: "Official",
    okDetail: "Flood-hazard zones are drawn where the NFHL image returned. This is not a site-specific flood determination.",
    failDetail: "The FEMA flood service did not return a map tile.",
    emptyDetail: "No GIS coverage found for this area. That is not a finding of no flood risk.",
    gateDetail: "FEMA draws flood-hazard zones only when the map is close (about zoom 13 or tighter). A wide view is not “no flood risk.”",
  },
  {
    id: "fires",
    label: "Current fires",
    provider: "National Interagency Fire Center (WFIGS)",
    dataset: "Current incident locations",
    url: "https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/WFIGS_Incident_Locations_Current/FeatureServer",
    vintage: "Current incident service. It changes through the season.",
    kind: "Official",
    okDetail: "Current incident points are from WFIGS. A point is an incident record, not a parcel risk score.",
    emptyDetail: "The current-incident service answered and returned no features. That is not a finding of no fire.",
    failDetail: "The current-incident service did not answer.",
    gateDetail: "Current incidents load with the layer. Zoom does not turn an empty response into safety.",
  },
  {
    id: "perimeters",
    label: "Fire perimeters",
    provider: "National Interagency Fire Center (WFIGS)",
    dataset: "Current interagency perimeters, plus historic perimeters in the view",
    url: "https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/WFIGS_Interagency_Perimeters_Current/FeatureServer",
    vintage: "Current perimeters, and the interagency perimeter history when the view is close enough to query it.",
    kind: "Official",
    okDetail: "Perimeters are incident polygons from WFIGS. They are not a forecast and not a parcel score.",
    emptyDetail: "The perimeter service answered. No current perimeter was returned. That is not a fire history and not a no-fire finding.",
    failDetail: "The perimeter service did not answer.",
    gateDetail: "Historic perimeters are requested only inside a closer view, and only up to 30 polygons. A wide view is not a complete history.",
  },
  {
    id: "hazard",
    label: "Long-term fire potential",
    provider: "USDA Forest Service, Fire Modeling Institute",
    dataset: "Wildfire Hazard Potential, classified 2023",
    url: "https://imagery.geoplatform.gov/iipp/rest/services/Fire_Aviation/USFS_EDW_RMRS_WildfireHazardPotentialClassified/ImageServer",
    vintage: "2023 classified product. Forest Service description: landscape conditions as of the end of 2020. 270-meter planning index.",
    kind: "Official",
    okDetail: "The 2023 Wildfire Hazard Potential image is on the map. It is a broad planning index, not a current fire and not a parcel determination.",
    failDetail: "The Wildfire Hazard Potential service did not return a tile.",
    gateDetail: "The potential image is requested from zoom 5. It is still the 2023 planning index, not a live fire.",
  },
];

export const COUNTY_PARCEL_SOURCES = [
  {
    "state": "WA",
    "county": "King",
    "fips": "53033",
    "provider": "King County Assessor's Office",
    "dataset": "King County parcels",
    "url": "https://gismaps.kingcounty.gov/arcgis/rest/services/Property/KingCo_Parcels/MapServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN,MAJOR,MINOR",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this assessor service for a PIN and a polygon. Address is not in this layer. It is not a title search.",
    "sourceType": "county-assessor",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AZ",
    "county": "Maricopa",
    "fips": "04013",
    "provider": "Maricopa County Assessor",
    "dataset": "Parcels",
    "url": "https://gis.mcassessor.maricopa.gov/arcgis/rest/services/Parcels/MapServer",
    "queryLayer": 0,
    "fields": {
      "apn": "APN"
    },
    "outFields": "APN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this assessor layer for an APN and a polygon. Overlapping parcels are listed and do not open a research file. Owner name is not requested. It is not a title search.",
    "sourceType": "county-assessor",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AZ",
    "county": "Pima",
    "fips": "04019",
    "provider": "Pima County parcels, hosted by the City of Tucson",
    "dataset": "PAREGION",
    "url": "https://mapdata.tucsonaz.gov/public/rest/services/PublicMaps/PropertyHousing/MapServer",
    "queryLayer": 17,
    "fields": {
      "apn": "PARCEL"
    },
    "outFields": "PARCEL",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "The layer description says it displays parcels in Pima County, including duplicate tax codes on some subdivisions. A click requests PARCEL only. Overlapping results must be chosen and do not open a research file by themselves. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "partial",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -111.012463,
        "lat": 32.33591,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "invalidId": "The host says some subdivisions repeat a tax code, so one click can overlap."
  },
  {
    "state": "ID",
    "county": "Ada",
    "fips": "16001",
    "provider": "Ada County Assessor",
    "dataset": "Parcel",
    "url": "https://services2.arcgis.com/dgGjZc6xAH5m5JyP/arcgis/rest/services/Parcels/FeatureServer",
    "queryLayer": 5,
    "fields": {
      "apn": "PARCEL"
    },
    "outFields": "PARCEL",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "The service description says parcel boundaries are maintained by the Ada County Assessor. A click requests PARCEL only. Some points return several overlapping parcels; choose one. A point with no polygon is not proof the land is unparceled. It is not a title search.",
    "sourceType": "county-assessor",
    "coverageClass": "partial",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -116.19378,
        "lat": 43.60877,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "invalidId": "A downtown Boise point returned no polygon. That miss is not proof the land is unparceled."
  },
  {
    "state": "CA",
    "county": "Alameda",
    "fips": "06001",
    "provider": "Alameda County parcels",
    "dataset": "Parcels",
    "url": "https://services5.arcgis.com/ROBnTHSNjoZ2Wm1P/arcgis/rest/services/Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "APN"
    },
    "outFields": "APN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -122.281423,
        "lat": 37.8441,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CA",
    "county": "Contra Costa",
    "fips": "06013",
    "provider": "Contra Costa County Assessment Parcels",
    "dataset": "Assessment parcels",
    "url": "https://gis.cccounty.us/arcgis/rest/services/CCMAP/Assessment_Parcels_ArcPro/MapServer",
    "queryLayer": 0,
    "fields": {
      "apn": "APN"
    },
    "outFields": "APN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -122.365549,
        "lat": 37.90018,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CA",
    "county": "Fresno",
    "fips": "06019",
    "provider": "Fresno County parcels",
    "dataset": "FC_PARCEL_SELECT",
    "url": "https://gisprod10.co.fresno.ca.us/server/rest/services/FC_PARCEL_SELECT/MapServer",
    "queryLayer": 0,
    "fields": {
      "apn": "APN"
    },
    "outFields": "APN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -120.541436,
        "lat": 37.0432,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CA",
    "county": "Humboldt",
    "fips": "06023",
    "provider": "Humboldt County parcels",
    "dataset": "Parcels",
    "url": "https://cty-gis-web.co.humboldt.ca.us/server/rest/services/Parcels/Parcels/MapServer",
    "queryLayer": 0,
    "fields": {
      "apn": "APN"
    },
    "outFields": "APN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -124.062415,
        "lat": 40.04402,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CA",
    "county": "Los Angeles",
    "fips": "06037",
    "provider": "Los Angeles County GIS",
    "dataset": "LACounty_Parcel",
    "url": "https://public.gis.lacounty.gov/public/rest/services/LACounty_Cache/LACounty_Parcel/MapServer",
    "queryLayer": 0,
    "fields": {
      "apn": "AIN"
    },
    "outFields": "AIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click requests AIN only. A polygon with a blank AIN is ignored and is not a finding that no parcel exists. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "partial",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "invalidId": "A blank AIN is ignored. That is an incomplete query, not a finding that no parcel exists."
  },
  {
    "state": "CA",
    "county": "Mendocino",
    "fips": "06045",
    "provider": "Mendocino County public parcels",
    "dataset": "Parcels_Public",
    "url": "https://services5.arcgis.com/8y4r60VTvWj2wnDH/arcgis/rest/services/Parcels_Public_/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "APN"
    },
    "outFields": "APN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -123.43082,
        "lat": 39.06501,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CA",
    "county": "Riverside",
    "fips": "06065",
    "provider": "Riverside County Assessor open data",
    "dataset": "Assessor",
    "url": "https://gis.countyofriverside.us/arcgis_mapping/rest/services/OpenData/Assessor/MapServer",
    "queryLayer": 50,
    "fields": {
      "apn": "APN"
    },
    "outFields": "APN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-assessor",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -117.613286,
        "lat": 33.92053,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CA",
    "county": "Sacramento",
    "fips": "06067",
    "provider": "Sacramento County parcels",
    "dataset": "Parcels",
    "url": "https://services1.arcgis.com/5NARefyPVtAeuJPU/arcgis/rest/services/Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "APN"
    },
    "outFields": "APN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -121.505143,
        "lat": 38.59657,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CA",
    "county": "San Bernardino",
    "fips": "06071",
    "provider": "San Bernardino County parcels",
    "dataset": "Parcels",
    "url": "https://services.arcgis.com/aA3snZwJfFkVyDuP/arcgis/rest/services/Parcels_for_San_Bernardino_County/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "ParcelNumber"
    },
    "outFields": "ParcelNumber",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -117.510081,
        "lat": 34.08448,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CA",
    "county": "San Diego",
    "fips": "06073",
    "provider": "County of San Diego public parcels",
    "dataset": "parcels_all_for_public_use",
    "url": "https://gis-public.sandiegocounty.gov/arcgis/rest/services/cosd_warehouse/parcels_all_for_public_use/MapServer",
    "queryLayer": 0,
    "fields": {
      "apn": "APN"
    },
    "outFields": "APN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -116.937006,
        "lat": 32.77038,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CA",
    "county": "Santa Clara",
    "fips": "06085",
    "provider": "Santa Clara County parcels",
    "dataset": "Santa Clara County Parcels",
    "url": "https://services8.arcgis.com/fpjs8A5Vtkshblnd/arcgis/rest/services/Santa_Clara_County_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "apn"
    },
    "outFields": "apn",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -121.92409,
        "lat": 37.26207,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CA",
    "county": "Sonoma",
    "fips": "06097",
    "provider": "Sonoma County parcel base",
    "dataset": "Cities_GIS_Parcel_Base",
    "url": "https://socogis.sonomacounty.ca.gov/map/rest/services/OWTSPublic/Cities_GIS_Parcel_Base/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "APN"
    },
    "outFields": "APN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -123.02333,
        "lat": 38.813,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CA",
    "county": "Tulare",
    "fips": "06107",
    "provider": "Tulare County public parcels",
    "dataset": "Parcels (Public View)",
    "url": "https://services2.arcgis.com/bYBANhmQGwSSLC0l/ArcGIS/rest/services/Parcels_(Public_View)/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "APN"
    },
    "outFields": "APN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -119.27021,
        "lat": 36.62958,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CA",
    "county": "Ventura",
    "fips": "06111",
    "provider": "Ventura County parcels",
    "dataset": "Parcels",
    "url": "https://maps.ventura.org/arcgis/rest/services/SDs/Parcels/MapServer",
    "queryLayer": 0,
    "fields": {
      "apn": "APN"
    },
    "outFields": "APN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -119.440135,
        "lat": 34.89418,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CO",
    "county": "Denver",
    "fips": "08031",
    "provider": "City and County of Denver open data",
    "dataset": "PROP_PARCELS_A",
    "url": "https://services1.arcgis.com/zdB7qR0BtYrg0Xpl/arcgis/rest/services/ODC_PROP_PARCELS_A/FeatureServer",
    "queryLayer": 245,
    "fields": {
      "apn": "SCHEDNUM"
    },
    "outFields": "SCHEDNUM",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click requests SCHEDNUM only. Owner fields exist on the layer and are not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -104.767674,
        "lat": 39.81757,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CO",
    "county": "Adams",
    "fips": "08001",
    "provider": "Colorado GIS",
    "dataset": "Colorado Public Parcels",
    "url": "https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Colorado GIS public parcel composite, not the county assessor. The click is limited to this county and requests parcel_id only. Owner fields exist on the layer and are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "where": "countyName='Adams'",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -104.9489,
        "lat": 39.9122,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CO",
    "county": "Arapahoe",
    "fips": "08005",
    "provider": "Colorado GIS",
    "dataset": "Colorado Public Parcels",
    "url": "https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Colorado GIS public parcel composite, not the county assessor. The click is limited to this county and requests parcel_id only. Owner fields exist on the layer and are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "where": "countyName='Arapahoe'",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -104.9489,
        "lat": 39.9122,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CO",
    "county": "Boulder",
    "fips": "08013",
    "provider": "Colorado GIS",
    "dataset": "Colorado Public Parcels",
    "url": "https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Colorado GIS public parcel composite, not the county assessor. The click is limited to this county and requests parcel_id only. Owner fields exist on the layer and are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "where": "countyName='Boulder'",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -104.9489,
        "lat": 39.9122,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CO",
    "county": "Douglas",
    "fips": "08035",
    "provider": "Colorado GIS",
    "dataset": "Colorado Public Parcels",
    "url": "https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Colorado GIS public parcel composite, not the county assessor. The click is limited to this county and requests parcel_id only. Owner fields exist on the layer and are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "where": "countyName='Douglas'",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -104.9489,
        "lat": 39.9122,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CO",
    "county": "Eagle",
    "fips": "08037",
    "provider": "Colorado GIS",
    "dataset": "Colorado Public Parcels",
    "url": "https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Colorado GIS public parcel composite, not the county assessor. The click is limited to this county and requests parcel_id only. Owner fields exist on the layer and are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "where": "countyName='Eagle'",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -104.9489,
        "lat": 39.9122,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CO",
    "county": "El Paso",
    "fips": "08041",
    "provider": "Colorado GIS",
    "dataset": "Colorado Public Parcels",
    "url": "https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Colorado GIS public parcel composite, not the county assessor. The click is limited to this county and requests parcel_id only. Owner fields exist on the layer and are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "where": "countyName='El Paso'",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -104.9489,
        "lat": 39.9122,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CO",
    "county": "Jefferson",
    "fips": "08059",
    "provider": "Colorado GIS",
    "dataset": "Colorado Public Parcels",
    "url": "https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Colorado GIS public parcel composite, not the county assessor. The click is limited to this county and requests parcel_id only. Owner fields exist on the layer and are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "where": "countyName='Jefferson'",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -104.9489,
        "lat": 39.9122,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CO",
    "county": "Larimer",
    "fips": "08069",
    "provider": "Colorado GIS",
    "dataset": "Colorado Public Parcels",
    "url": "https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Colorado GIS public parcel composite, not the county assessor. The click is limited to this county and requests parcel_id only. Owner fields exist on the layer and are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "where": "countyName='Larimer'",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -104.9489,
        "lat": 39.9122,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CO",
    "county": "Mesa",
    "fips": "08077",
    "provider": "Colorado GIS",
    "dataset": "Colorado Public Parcels",
    "url": "https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Colorado GIS public parcel composite, not the county assessor. The click is limited to this county and requests parcel_id only. Owner fields exist on the layer and are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "where": "countyName='Mesa'",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -104.9489,
        "lat": 39.9122,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CO",
    "county": "Pueblo",
    "fips": "08101",
    "provider": "Colorado GIS",
    "dataset": "Colorado Public Parcels",
    "url": "https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Colorado GIS public parcel composite, not the county assessor. The click is limited to this county and requests parcel_id only. Owner fields exist on the layer and are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "where": "countyName='Pueblo'",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -104.9489,
        "lat": 39.9122,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CO",
    "county": "Weld",
    "fips": "08123",
    "provider": "Colorado GIS",
    "dataset": "Colorado Public Parcels",
    "url": "https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Colorado GIS public parcel composite, not the county assessor. The click is limited to this county and requests parcel_id only. Owner fields exist on the layer and are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "where": "countyName='Weld'",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -104.9489,
        "lat": 39.9122,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "FL",
    "county": "Broward",
    "fips": "12011",
    "provider": "Broward County Property Appraiser",
    "dataset": "BCPA parcels",
    "url": "https://gisweb-adapters.bcpa.net/arcgis/rest/services/BCPA_EXTERNAL_JAN26/MapServer",
    "queryLayer": 16,
    "fields": {
      "apn": "FOLIO"
    },
    "outFields": "FOLIO",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -80.23146,
        "lat": 26.33359,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "FL",
    "county": "Duval",
    "fips": "12031",
    "provider": "City of Jacksonville parcels",
    "dataset": "Parcels",
    "url": "https://maps.coj.net/coj/rest/services/CityBiz/Parcels/MapServer",
    "queryLayer": 0,
    "fields": {
      "apn": "RE"
    },
    "outFields": "RE",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click requests the RE number only. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -81.683213,
        "lat": 30.35576,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "FL",
    "county": "Hillsborough",
    "fips": "12057",
    "provider": "Hillsborough County Property Appraiser",
    "dataset": "WebParcels",
    "url": "https://gis.hcpafl.org/arcgis/rest/services/Webmaps/HillsboroughFL_WebParcels/MapServer",
    "queryLayer": 0,
    "fields": {
      "apn": "folio"
    },
    "outFields": "folio",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click requests folio only. Owner fields exist on the layer and are not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -82.760277,
        "lat": 27.58936,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "FL",
    "county": "Lee",
    "fips": "12071",
    "provider": "Lee County parcels",
    "dataset": "Lee County Parcels",
    "url": "https://services2.arcgis.com/LvWGAAhHwbCJ2GMP/arcgis/rest/services/Lee_County_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "STRAP"
    },
    "outFields": "STRAP",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -81.954493,
        "lat": 26.4673,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "FL",
    "county": "Manatee",
    "fips": "12081",
    "provider": "Manatee County Property Appraiser",
    "dataset": "WebLayers",
    "url": "https://gis.manateepao.com/arcgis/rest/services/Website/WebLayers/MapServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARID"
    },
    "outFields": "PARID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -82.162557,
        "lat": 27.49026,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "FL",
    "county": "Miami-Dade",
    "fips": "12086",
    "provider": "Miami-Dade County parcels",
    "dataset": "PaParcel",
    "url": "https://gisweb.miamidade.gov/arcgis/rest/services/MD_LandInformation/MapServer",
    "queryLayer": 26,
    "fields": {
      "apn": "FOLIO"
    },
    "outFields": "FOLIO",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click requests FOLIO only. A zero folio is ignored and is not a finding that no parcel exists. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "partial",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "invalidId": "An all-zero folio is ignored. That is an incomplete query, not a finding that no parcel exists."
  },
  {
    "state": "FL",
    "county": "Palm Beach",
    "fips": "12099",
    "provider": "Palm Beach County parcels",
    "dataset": "Parcels and property details",
    "url": "https://services1.arcgis.com/ZWOoUZbtaYePLlPw/arcgis/rest/services/Parcels_and_Property_Details_WebMercator/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARID"
    },
    "outFields": "PARID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -80.080668,
        "lat": 26.93143,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "FL",
    "county": "Pasco",
    "fips": "12101",
    "provider": "Pasco County Property Appraiser",
    "dataset": "Parcels",
    "url": "https://maps.pascopa.com/arcgis/rest/services/Parcels/MapServer",
    "queryLayer": 3,
    "fields": {
      "apn": "ParcelID"
    },
    "outFields": "ParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -82.754588,
        "lat": 28.18057,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "FL",
    "county": "Pinellas",
    "fips": "12103",
    "provider": "Pinellas County parcels",
    "dataset": "Parcels",
    "url": "https://egis.pinellas.gov/gis/rest/services/PublicWebGIS/Parcels/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -82.739228,
        "lat": 27.74618,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "GA",
    "county": "Chatham",
    "fips": "13051",
    "provider": "SAGIS open parcels",
    "dataset": "Parcels",
    "url": "https://pub.sagis.org/arcgis/rest/services/OpenData/Parcels/FeatureServer",
    "queryLayer": 27,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -81.147714,
        "lat": 32.05336,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "GA",
    "county": "Cobb",
    "fips": "13067",
    "provider": "Cobb County tax assessor parcels",
    "dataset": "CobbParcels",
    "url": "https://gis.cobbcounty.gov/gisserver/rest/services/tax/taxassessorsdaily/MapServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click requests PIN only. Owner fields exist on the layer and are not requested. It is not a title search.",
    "sourceType": "county-assessor",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -84.692885,
        "lat": 34.07666,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "GA",
    "county": "Fulton",
    "fips": "13121",
    "provider": "Fulton County tax parcels",
    "dataset": "Tax Parcel",
    "url": "https://gismaps.fultoncountyga.gov/arcgispub2/rest/services/PropertyMapViewer/PropertyMapViewer/MapServer",
    "queryLayer": 11,
    "fields": {
      "apn": "ParcelID"
    },
    "outFields": "ParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click requests ParcelID only. Owner fields exist on the layer and are not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -84.615395,
        "lat": 33.50308,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "IL",
    "county": "Cook",
    "fips": "17031",
    "provider": "Cook County parcels",
    "dataset": "CookViewer3Parcels",
    "url": "https://gis12.cookcountyil.gov/traditional/rest/services/CookViewer3Parcels/MapServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PIN14"
    },
    "outFields": "PIN14",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -87.531154,
        "lat": 41.47568,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "IL",
    "county": "DeKalb",
    "fips": "17037",
    "provider": "DeKalb County parcels",
    "dataset": "DeKalbIL_Parcels",
    "url": "https://services7.arcgis.com/hEXJrPwm89CLXBYe/arcgis/rest/services/DeKalbIL_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_Number"
    },
    "outFields": "Parcel_Number",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -88.837919,
        "lat": 42.15233,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "IL",
    "county": "DuPage",
    "fips": "17043",
    "provider": "DuPage County parcels",
    "dataset": "ParcelsWithRealEstateCC",
    "url": "https://gis.dupageco.org/arcgis/rest/services/DuPage_County_IL/ParcelsWithRealEstateCC/MapServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click requests PIN only. Owner fields exist on the layer and are not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -88.067161,
        "lat": 41.97462,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "IL",
    "county": "Kane",
    "fips": "17089",
    "provider": "Kane County PIN list",
    "dataset": "KanePINList",
    "url": "https://gistech.countyofkane.org/arcgis/rest/services/KanePINList/MapServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click requests PIN only. Owner fields exist on the layer and are not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -88.513703,
        "lat": 42.1133,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "IL",
    "county": "Lake",
    "fips": "17097",
    "provider": "Lake County parcels",
    "dataset": "WABParcels",
    "url": "https://maps.lakecountyil.gov/arcgis/rest/services/GISMapping/WABParcels/MapServer",
    "queryLayer": 12,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -88.139682,
        "lat": 42.49328,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "IL",
    "county": "McHenry",
    "fips": "17111",
    "provider": "McHenry County tax parcels",
    "dataset": "McHenry County TaxParcels",
    "url": "https://services1.arcgis.com/6iYC5AXXYapRVNzl/arcgis/rest/services/McHenry_County_TaxParcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "ParcelNumber"
    },
    "outFields": "ParcelNumber",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -88.314776,
        "lat": 42.27617,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "IL",
    "county": "St. Clair",
    "fips": "17163",
    "provider": "St. Clair County parcels",
    "dataset": "SCC parcel map",
    "url": "https://arcgispublicmap.co.st-clair.il.us/server/rest/services/SCC_parcel_map_data/MapServer",
    "queryLayer": 29,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -89.733176,
        "lat": 38.22,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "IL",
    "county": "Will",
    "fips": "17197",
    "provider": "Will County parcels",
    "dataset": "Parcels_20",
    "url": "https://gis.willcountyillinois.com/server/rest/services/Basemap/Parcels_20/MapServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -87.813239,
        "lat": 41.52834,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "NM",
    "county": "Bernalillo",
    "fips": "35001",
    "provider": "Bernalillo County Assessor public parcels",
    "dataset": "Public access parcels",
    "url": "https://assessormap.bernco.gov/server/rest/services/Enterprise_Assessment_And_Tax/Public_Access_Parcel_Data_EAT/MapServer",
    "queryLayer": 0,
    "fields": {
      "apn": "UPC"
    },
    "outFields": "UPC",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click requests UPC only. Owner fields exist on the layer and are not requested. A point can return more than one UPC; choose one. It is not a title search.",
    "sourceType": "county-assessor",
    "coverageClass": "partial",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "NV",
    "county": "Clark",
    "fips": "32003",
    "provider": "Clark County Assessor map",
    "dataset": "AssessorMap",
    "url": "https://maps.clarkcountynv.gov/arcgis/rest/services/GISMO/AssessorMapv2/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "APN"
    },
    "outFields": "APN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-assessor",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -115.133913,
        "lat": 36.19437,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "NV",
    "county": "Lyon",
    "fips": "32019",
    "provider": "Lyon County parcels",
    "dataset": "Land use parcel",
    "url": "https://gis.lyon-county.org/server/rest/services/Landbase/Land_Use_Parcel/MapServer",
    "queryLayer": 10,
    "fields": {
      "apn": "APN"
    },
    "outFields": "APN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -119.245851,
        "lat": 39.59589,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "NV",
    "county": "Washoe",
    "fips": "32031",
    "provider": "Washoe County open data",
    "dataset": "OpenData",
    "url": "https://wcgisweb.washoecounty.us/arcgis/rest/services/OpenData/OpenData/MapServer",
    "queryLayer": 0,
    "fields": {
      "apn": "APN"
    },
    "outFields": "APN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -119.862587,
        "lat": 39.54613,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "NY",
    "county": "Bronx",
    "fips": "36005",
    "provider": "NYC Planning MapPLUTO",
    "dataset": "Tax lots",
    "url": "https://services5.arcgis.com/GfwWNkhOj9bNBqoJ/arcgis/rest/services/MAPPLUTO/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "BBL"
    },
    "outFields": "BBL",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click requests the BBL tax-lot id only. This is NYC Planning MapPLUTO, not an ownership record and not a title search.",
    "sourceType": "other",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -74.01418,
        "lat": 40.69277,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "NY",
    "county": "Erie",
    "fips": "36029",
    "provider": "Erie County parcels",
    "dataset": "Erie County Parcels",
    "url": "https://services1.arcgis.com/CgOSc11uky3egK6O/arcgis/rest/services/Erie_County_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click requests PIN only. Owner fields exist on the layer and are not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -78.601666,
        "lat": 42.75817,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "NY",
    "county": "Kings",
    "fips": "36047",
    "provider": "NYC Planning MapPLUTO",
    "dataset": "Tax lots",
    "url": "https://services5.arcgis.com/GfwWNkhOj9bNBqoJ/arcgis/rest/services/MAPPLUTO/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "BBL"
    },
    "outFields": "BBL",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click requests the BBL tax-lot id only. This is NYC Planning MapPLUTO, not an ownership record and not a title search.",
    "sourceType": "other",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -74.01418,
        "lat": 40.69277,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "NY",
    "county": "Monroe",
    "fips": "36055",
    "provider": "Monroe County parcels",
    "dataset": "Monroe County Parcels",
    "url": "https://services1.arcgis.com/yisUfwZZ4fyubK3R/arcgis/rest/services/Monroe_County_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PRINTKEY"
    },
    "outFields": "PRINTKEY",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -77.804907,
        "lat": 43.20373,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "NY",
    "county": "New York",
    "fips": "36061",
    "provider": "NYC Planning MapPLUTO",
    "dataset": "Tax lots",
    "url": "https://services5.arcgis.com/GfwWNkhOj9bNBqoJ/arcgis/rest/services/MAPPLUTO/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "BBL"
    },
    "outFields": "BBL",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click requests the BBL tax-lot id only. This is NYC Planning MapPLUTO, not an ownership record and not a title search.",
    "sourceType": "other",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -74.01418,
        "lat": 40.69277,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "NY",
    "county": "Queens",
    "fips": "36081",
    "provider": "NYC Planning MapPLUTO",
    "dataset": "Tax lots",
    "url": "https://services5.arcgis.com/GfwWNkhOj9bNBqoJ/arcgis/rest/services/MAPPLUTO/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "BBL"
    },
    "outFields": "BBL",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click requests the BBL tax-lot id only. This is NYC Planning MapPLUTO, not an ownership record and not a title search.",
    "sourceType": "other",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -74.01418,
        "lat": 40.69277,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "NY",
    "county": "Richmond",
    "fips": "36085",
    "provider": "NYC Planning MapPLUTO",
    "dataset": "Tax lots",
    "url": "https://services5.arcgis.com/GfwWNkhOj9bNBqoJ/arcgis/rest/services/MAPPLUTO/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "BBL"
    },
    "outFields": "BBL",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click requests the BBL tax-lot id only. This is NYC Planning MapPLUTO, not an ownership record and not a title search.",
    "sourceType": "other",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -74.01418,
        "lat": 40.69277,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "NC",
    "county": "Buncombe",
    "fips": "37021",
    "provider": "Buncombe County property",
    "dataset": "property_bc",
    "url": "https://gis.buncombecounty.org/arcgis/rest/services/property_bc_dis/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "pin"
    },
    "outFields": "pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -82.567717,
        "lat": 35.45745,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "NC",
    "county": "Durham",
    "fips": "37063",
    "provider": "Durham County property",
    "dataset": "Property",
    "url": "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Property/MapServer",
    "queryLayer": 4,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click requests PIN only. Owner fields exist on the layer and are not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -78.915996,
        "lat": 36.00615,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "NC",
    "county": "Gaston",
    "fips": "37071",
    "provider": "Gaston County parcels",
    "dataset": "Parcels",
    "url": "https://gis.gastoncountync.gov/publicgis/rest/services/PublicGIS/Parcels/MapServer",
    "queryLayer": 11,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -81.194821,
        "lat": 35.2802,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "NC",
    "county": "Mecklenburg",
    "fips": "37119",
    "provider": "Mecklenburg County parcels",
    "dataset": "Parcels",
    "url": "https://gis.charlottenc.gov/arcgis/rest/services/CountyData/Parcels/MapServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PID"
    },
    "outFields": "PID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -80.941065,
        "lat": 35.42807,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "NC",
    "county": "Wake",
    "fips": "37183",
    "provider": "Wake County property",
    "dataset": "Parcels",
    "url": "https://maps.wake.gov/arcgis/rest/services/Property/Parcels/MapServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PIN_NUM"
    },
    "outFields": "PIN_NUM",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click requests PIN_NUM only. Owner fields exist on the layer and are not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -78.685002,
        "lat": 35.54311,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "OR",
    "county": "Coos",
    "fips": "41011",
    "provider": "Coos County parcels",
    "dataset": "Coos County Parcels",
    "url": "https://services8.arcgis.com/Mg5lKoVeyQMwwiX3/ArcGIS/rest/services/Coos_County_Parcels/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "Parcel_No"
    },
    "outFields": "Parcel_No",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -123.904911,
        "lat": 43.562,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "OR",
    "county": "Lane",
    "fips": "41039",
    "provider": "Lane County tax lots",
    "dataset": "AddressParcel",
    "url": "https://lcgispubags.lanecountyor.gov/arcgis/rest/services/LaneCountyMaps/AddressParcel/MapServer",
    "queryLayer": 2,
    "fields": {
      "apn": "MAPTAXLOT"
    },
    "outFields": "MAPTAXLOT",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click requests the map-taxlot id only. Owner fields exist on the layer and are not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "OR",
    "county": "Marion",
    "fips": "41047",
    "provider": "Marion County parcels",
    "dataset": "Parcels",
    "url": "https://gis.co.marion.or.us/arcgis/rest/services/Public/Parcels/MapServer",
    "queryLayer": 0,
    "fields": {
      "apn": "TAXLOT"
    },
    "outFields": "TAXLOT",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click requests TAXLOT only. Owner fields exist on the layer and are not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "OR",
    "county": "Multnomah",
    "fips": "41051",
    "provider": "Multnomah County taxlot parcels",
    "dataset": "Taxlot parcels",
    "url": "https://services5.arcgis.com/x7DNZL1YqNQVNykA/arcgis/rest/services/Multnomah_County_Taxlot_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PROPID"
    },
    "outFields": "PROPID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -122.637085,
        "lat": 45.48872,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "TX",
    "county": "Bexar",
    "fips": "48029",
    "provider": "Bexar County parcels",
    "dataset": "Parcels",
    "url": "https://maps.bexar.org/arcgis/rest/services/Parcels/MapServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PropID"
    },
    "outFields": "PropID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -98.410475,
        "lat": 29.11654,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "TX",
    "county": "Dallas",
    "fips": "48113",
    "provider": "Dallas County tax parcels",
    "dataset": "DallasTaxParcels",
    "url": "https://services2.arcgis.com/rwnOSbfKSwyTBcwN/arcgis/rest/services/DallasTaxParcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "ACCT"
    },
    "outFields": "ACCT",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -96.807451,
        "lat": 32.98427,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "TX",
    "county": "Denton",
    "fips": "48121",
    "provider": "Denton County parcels",
    "dataset": "Parcels",
    "url": "https://gis.dentoncounty.gov/arcgis/rest/services/Parcels/MapServer",
    "queryLayer": 0,
    "fields": {
      "apn": "prop_id"
    },
    "outFields": "prop_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -96.995339,
        "lat": 33.27837,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "TX",
    "county": "Fort Bend",
    "fips": "48157",
    "provider": "Fort Bend County public parcels",
    "dataset": "Parcels_Public",
    "url": "https://gisportal.fortbendcountytx.gov/arcgis/rest/services/InteractiveMap/Parcels_Public/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "CAD_Reference_Number"
    },
    "outFields": "CAD_Reference_Number",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click requests the CAD reference number only. Owner fields exist on the layer and are not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -95.534273,
        "lat": 29.57767,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "TX",
    "county": "Harris",
    "fips": "48201",
    "provider": "Harris County Appraisal District parcels",
    "dataset": "HCAD Parcels",
    "url": "https://www.gis.hctx.net/arcgis/rest/services/HCAD/Parcels/MapServer",
    "queryLayer": 0,
    "fields": {
      "apn": "HCAD_NUM"
    },
    "outFields": "HCAD_NUM",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-assessor",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -95.091496,
        "lat": 29.90739,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "TX",
    "county": "Hill",
    "fips": "48217",
    "provider": "Hill County appraisal parcels",
    "dataset": "HillCAD",
    "url": "https://services6.arcgis.com/c1IEzrw0UDP7bzay/arcgis/rest/services/HillCADWebService/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "prop_id"
    },
    "outFields": "prop_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-assessor",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -97.237676,
        "lat": 32.20443,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "TX",
    "county": "Tarrant",
    "fips": "48439",
    "provider": "Tarrant County tax parcels",
    "dataset": "TCProperty",
    "url": "https://mapit.tarrantcounty.com/arcgis/rest/services/Tax/TCProperty/MapServer",
    "queryLayer": 0,
    "fields": {
      "apn": "TAXPIN"
    },
    "outFields": "TAXPIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -97.301945,
        "lat": 32.68142,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "TX",
    "county": "Travis",
    "fips": "48453",
    "provider": "Travis Central Appraisal District",
    "dataset": "TCAD parcels",
    "url": "https://services.arcgis.com/0L95CJ0VTaxqcmED/arcgis/rest/services/EXTERNAL_tcad_parcel/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PROP_ID"
    },
    "outFields": "PROP_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click requests PROP_ID only. It is not a title search.",
    "sourceType": "county-assessor",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -97.803857,
        "lat": 30.44547,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "TX",
    "county": "Williamson",
    "fips": "48491",
    "provider": "Williamson Central Appraisal District parcels",
    "dataset": "county_wcad_parcels",
    "url": "https://gis.wilco.org/arcgis/rest/services/public/county_wcad_parcels/MapServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-assessor",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -97.930579,
        "lat": 30.65992,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "UT",
    "county": "Davis",
    "fips": "49011",
    "provider": "Davis County parcels",
    "dataset": "Parcels_Davis_LIR",
    "url": "https://services1.arcgis.com/99lidPhWCzftIe9K/ArcGIS/rest/services/Parcels_Davis_LIR/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID"
    },
    "outFields": "PARCEL_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -111.805541,
        "lat": 40.83832,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "UT",
    "county": "Salt Lake",
    "fips": "49035",
    "provider": "Salt Lake County parcels",
    "dataset": "Parcels_SaltLake_LIR",
    "url": "https://services1.arcgis.com/99lidPhWCzftIe9K/ArcGIS/rest/services/Parcels_SaltLake_LIR/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID"
    },
    "outFields": "PARCEL_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -111.941706,
        "lat": 40.80786,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "UT",
    "county": "Utah",
    "fips": "49049",
    "provider": "Utah County parcels",
    "dataset": "Parcels_Utah_LIR",
    "url": "https://services1.arcgis.com/99lidPhWCzftIe9K/ArcGIS/rest/services/Parcels_Utah_LIR/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID"
    },
    "outFields": "PARCEL_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -111.69588,
        "lat": 40.07165,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "UT",
    "county": "Weber",
    "fips": "49057",
    "provider": "Weber County parcels",
    "dataset": "Parcels_Weber_LIR",
    "url": "https://services1.arcgis.com/99lidPhWCzftIe9K/ArcGIS/rest/services/Parcels_Weber_LIR/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID"
    },
    "outFields": "PARCEL_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -111.663816,
        "lat": 41.36876,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "WA",
    "county": "Thurston",
    "fips": "53067",
    "provider": "Thurston County parcels",
    "dataset": "Thurston_Parcels",
    "url": "https://map.co.thurston.wa.us/arcgis/rest/services/Thurston/Thurston_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_NO"
    },
    "outFields": "PARCEL_NO",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "A click queries this public layer for the parcel id and a polygon. Owner name is not requested. It is not a title search.",
    "sourceType": "county-gis",
    "coverageClass": "verified-county",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -122.865844,
        "lat": 47.07948,
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "NY",
    "county": "Montgomery",
    "fips": "36057",
    "provider": "New York State GIS",
    "dataset": "NYS Tax Parcels Public",
    "url": "https://services6.arcgis.com/EbVsqZ18sv1kVJ3k/arcgis/rest/services/NYS_Tax_Parcels_Public/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PRINT_KEY"
    },
    "outFields": "PRINT_KEY",
    "where": "COUNTY_NAME='Montgomery'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "New York State public tax-parcel layer, not the county assessor. The click is limited to this county and requests PRINT_KEY only. Owner fields are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -74.60728,
        "lat": 42.83924,
        "id": "109.15-1-37",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "NY",
    "county": "Broome",
    "fips": "36007",
    "provider": "New York State GIS",
    "dataset": "NYS Tax Parcels Public",
    "url": "https://services6.arcgis.com/EbVsqZ18sv1kVJ3k/arcgis/rest/services/NYS_Tax_Parcels_Public/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PRINT_KEY"
    },
    "outFields": "PRINT_KEY",
    "where": "COUNTY_NAME='Broome'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "New York State public tax-parcel layer, not the county assessor. The click is limited to this county and requests PRINT_KEY only. Owner fields are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -75.97727,
        "lat": 42.24124,
        "id": "054.03-1-11",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "NY",
    "county": "Oneida",
    "fips": "36065",
    "provider": "New York State GIS",
    "dataset": "NYS Tax Parcels Public",
    "url": "https://services6.arcgis.com/EbVsqZ18sv1kVJ3k/arcgis/rest/services/NYS_Tax_Parcels_Public/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PRINT_KEY"
    },
    "outFields": "PRINT_KEY",
    "where": "COUNTY_NAME='ONEIDA'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "New York State public tax-parcel layer, not the county assessor. The click is limited to this county and requests PRINT_KEY only. Owner fields are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -75.69898,
        "lat": 43.27968,
        "id": "183.000-3-22",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "NY",
    "county": "Lewis",
    "fips": "36049",
    "provider": "New York State GIS",
    "dataset": "NYS Tax Parcels Public",
    "url": "https://services6.arcgis.com/EbVsqZ18sv1kVJ3k/arcgis/rest/services/NYS_Tax_Parcels_Public/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PRINT_KEY"
    },
    "outFields": "PRINT_KEY",
    "where": "COUNTY_NAME='LEWIS'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "New York State public tax-parcel layer, not the county assessor. The click is limited to this county and requests PRINT_KEY only. Owner fields are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -75.51043,
        "lat": 43.88847,
        "id": "127.13-04-07.000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "NY",
    "county": "Cayuga",
    "fips": "36011",
    "provider": "New York State GIS",
    "dataset": "NYS Tax Parcels Public",
    "url": "https://services6.arcgis.com/EbVsqZ18sv1kVJ3k/arcgis/rest/services/NYS_Tax_Parcels_Public/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PRINT_KEY"
    },
    "outFields": "PRINT_KEY",
    "where": "COUNTY_NAME='Cayuga'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "New York State public tax-parcel layer, not the county assessor. The click is limited to this county and requests PRINT_KEY only. Owner fields are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -76.53812,
        "lat": 42.9319,
        "id": "116.50-1-33",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "NY",
    "county": "Cortland",
    "fips": "36023",
    "provider": "New York State GIS",
    "dataset": "NYS Tax Parcels Public",
    "url": "https://services6.arcgis.com/EbVsqZ18sv1kVJ3k/arcgis/rest/services/NYS_Tax_Parcels_Public/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PRINT_KEY"
    },
    "outFields": "PRINT_KEY",
    "where": "COUNTY_NAME='Cortland'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "New York State public tax-parcel layer, not the county assessor. The click is limited to this county and requests PRINT_KEY only. Owner fields are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -75.97004,
        "lat": 42.56034,
        "id": "111.00-01-01.200",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "NY",
    "county": "Chautauqua",
    "fips": "36013",
    "provider": "New York State GIS",
    "dataset": "NYS Tax Parcels Public",
    "url": "https://services6.arcgis.com/EbVsqZ18sv1kVJ3k/arcgis/rest/services/NYS_Tax_Parcels_Public/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PRINT_KEY"
    },
    "outFields": "PRINT_KEY",
    "where": "COUNTY_NAME='Chautauqua'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "New York State public tax-parcel layer, not the county assessor. The click is limited to this county and requests PRINT_KEY only. Owner fields are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -79.29172,
        "lat": 42.43295,
        "id": "131.00-2-1",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "NY",
    "county": "Putnam",
    "fips": "36079",
    "provider": "New York State GIS",
    "dataset": "NYS Tax Parcels Public",
    "url": "https://services6.arcgis.com/EbVsqZ18sv1kVJ3k/arcgis/rest/services/NYS_Tax_Parcels_Public/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PRINT_KEY"
    },
    "outFields": "PRINT_KEY",
    "where": "COUNTY_NAME='Putnam'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "New York State public tax-parcel layer, not the county assessor. The click is limited to this county and requests PRINT_KEY only. Owner fields are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -73.62248,
        "lat": 41.39734,
        "id": "67.25-1-24",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "NY",
    "county": "Livingston",
    "fips": "36051",
    "provider": "New York State GIS",
    "dataset": "NYS Tax Parcels Public",
    "url": "https://services6.arcgis.com/EbVsqZ18sv1kVJ3k/arcgis/rest/services/NYS_Tax_Parcels_Public/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PRINT_KEY"
    },
    "outFields": "PRINT_KEY",
    "where": "COUNTY_NAME='Livingston'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "New York State public tax-parcel layer, not the county assessor. The click is limited to this county and requests PRINT_KEY only. Owner fields are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -77.72267,
        "lat": 42.8572,
        "id": "54.-1-5.2",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "NY",
    "county": "Albany",
    "fips": "36001",
    "provider": "New York State GIS",
    "dataset": "NYS Tax Parcels Public",
    "url": "https://services6.arcgis.com/EbVsqZ18sv1kVJ3k/arcgis/rest/services/NYS_Tax_Parcels_Public/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PRINT_KEY"
    },
    "outFields": "PRINT_KEY",
    "where": "COUNTY_NAME='Albany'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "New York State public tax-parcel layer, not the county assessor. The click is limited to this county and requests PRINT_KEY only. Owner fields are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -73.86841,
        "lat": 42.72079,
        "id": "41.00-2-127",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "NY",
    "county": "Hamilton",
    "fips": "36041",
    "provider": "New York State GIS",
    "dataset": "NYS Tax Parcels Public",
    "url": "https://services6.arcgis.com/EbVsqZ18sv1kVJ3k/arcgis/rest/services/NYS_Tax_Parcels_Public/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PRINT_KEY"
    },
    "outFields": "PRINT_KEY",
    "where": "COUNTY_NAME='HAMILTON'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "New York State public tax-parcel layer, not the county assessor. The click is limited to this county and requests PRINT_KEY only. Owner fields are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -74.69068,
        "lat": 43.66075,
        "id": "78.000-1-1",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CO",
    "county": "Routt",
    "fips": "08107",
    "provider": "Colorado GIS",
    "dataset": "Colorado Public Parcels",
    "url": "https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "where": "countyName='Routt'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Colorado GIS public parcel composite, not the county assessor. The click is limited to this county and requests parcel_id only. Owner fields exist on the layer and are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -106.90321,
        "lat": 40.50387,
        "id": "194500021",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CO",
    "county": "Park",
    "fips": "08093",
    "provider": "Colorado GIS",
    "dataset": "Colorado Public Parcels",
    "url": "https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "where": "countyName='Park'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Colorado GIS public parcel composite, not the county assessor. The click is limited to this county and requests parcel_id only. Owner fields exist on the layer and are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -105.37376,
        "lat": 38.86825,
        "id": "48064",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CO",
    "county": "Gunnison",
    "fips": "08051",
    "provider": "Colorado GIS",
    "dataset": "Colorado Public Parcels",
    "url": "https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "where": "countyName='Gunnison'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Colorado GIS public parcel composite, not the county assessor. The click is limited to this county and requests parcel_id only. Owner fields exist on the layer and are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -107.474,
        "lat": 38.29687,
        "id": "404500000021",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CO",
    "county": "Clear Creek",
    "fips": "08019",
    "provider": "Colorado GIS",
    "dataset": "Colorado Public Parcels",
    "url": "https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "where": "countyName='Clear Creek'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Colorado GIS public parcel composite, not the county assessor. The click is limited to this county and requests parcel_id only. Owner fields exist on the layer and are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -105.65365,
        "lat": 39.80857,
        "id": "183710101023",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CO",
    "county": "Morgan",
    "fips": "08087",
    "provider": "Colorado GIS",
    "dataset": "Colorado Public Parcels",
    "url": "https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "where": "countyName='Morgan'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Colorado GIS public parcel composite, not the county assessor. The click is limited to this county and requests parcel_id only. Owner fields exist on the layer and are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -103.80681,
        "lat": 40.25517,
        "id": "122906227002",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CO",
    "county": "Saguache",
    "fips": "08109",
    "provider": "Colorado GIS",
    "dataset": "Colorado Public Parcels",
    "url": "https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "where": "countyName='Saguache'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Colorado GIS public parcel composite, not the county assessor. The click is limited to this county and requests parcel_id only. Owner fields exist on the layer and are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -105.8428,
        "lat": 38.23555,
        "id": "421914200011",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CO",
    "county": "Archuleta",
    "fips": "08007",
    "provider": "Colorado GIS",
    "dataset": "Colorado Public Parcels",
    "url": "https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "where": "countyName='Archuleta'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Colorado GIS public parcel composite, not the county assessor. The click is limited to this county and requests parcel_id only. Owner fields exist on the layer and are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -107.17858,
        "lat": 37.24559,
        "id": "569302307020",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CO",
    "county": "Dolores",
    "fips": "08033",
    "provider": "Colorado GIS",
    "dataset": "Colorado Public Parcels",
    "url": "https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "where": "countyName='Dolores'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Colorado GIS public parcel composite, not the county assessor. The click is limited to this county and requests parcel_id only. Owner fields exist on the layer and are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -109.00714,
        "lat": 37.66456,
        "id": "506712100053",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CO",
    "county": "Garfield",
    "fips": "08045",
    "provider": "Colorado GIS",
    "dataset": "Colorado Public Parcels",
    "url": "https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "where": "countyName='Garfield'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Colorado GIS public parcel composite, not the county assessor. The click is limited to this county and requests parcel_id only. Owner fields exist on the layer and are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -107.22854,
        "lat": 39.41356,
        "id": "239328308013",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CO",
    "county": "La Plata",
    "fips": "08067",
    "provider": "Colorado GIS",
    "dataset": "Colorado Public Parcels",
    "url": "https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "where": "countyName='La Plata'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Colorado GIS public parcel composite, not the county assessor. The click is limited to this county and requests parcel_id only. Owner fields exist on the layer and are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -107.71515,
        "lat": 37.17532,
        "id": "590321413002",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CO",
    "county": "Moffat",
    "fips": "08081",
    "provider": "Colorado GIS",
    "dataset": "Colorado Public Parcels",
    "url": "https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "where": "countyName='Moffat'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Colorado GIS public parcel composite, not the county assessor. The click is limited to this county and requests parcel_id only. Owner fields exist on the layer and are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -107.62476,
        "lat": 40.38548,
        "id": "090917400040",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CO",
    "county": "Pitkin",
    "fips": "08097",
    "provider": "Colorado GIS",
    "dataset": "Colorado Public Parcels",
    "url": "https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "where": "countyName='Pitkin'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Colorado GIS public parcel composite, not the county assessor. The click is limited to this county and requests parcel_id only. Owner fields exist on the layer and are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -106.95165,
        "lat": 39.20851,
        "id": "273301304025",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CO",
    "county": "Summit",
    "fips": "08117",
    "provider": "Colorado GIS",
    "dataset": "Colorado Public Parcels",
    "url": "https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "where": "countyName='Summit'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Colorado GIS public parcel composite, not the county assessor. The click is limited to this county and requests parcel_id only. Owner fields exist on the layer and are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -106.05994,
        "lat": 39.37305,
        "id": "2483-1210-12-023",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CO",
    "county": "Teller",
    "fips": "08119",
    "provider": "Colorado GIS",
    "dataset": "Colorado Public Parcels",
    "url": "https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "where": "countyName='Teller'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Colorado GIS public parcel composite, not the county assessor. The click is limited to this county and requests parcel_id only. Owner fields exist on the layer and are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -105.14517,
        "lat": 39.00266,
        "id": "3029.184000050",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CO",
    "county": "Custer",
    "fips": "08027",
    "provider": "Colorado GIS",
    "dataset": "Colorado Public Parcels",
    "url": "https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "where": "countyName='Custer'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Colorado GIS public parcel composite, not the county assessor. The click is limited to this county and requests parcel_id only. Owner fields exist on the layer and are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -105.56704,
        "lat": 38.25331,
        "id": "101-18-750",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CO",
    "county": "Elbert",
    "fips": "08039",
    "provider": "Colorado GIS",
    "dataset": "Colorado Public Parcels",
    "url": "https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "where": "countyName='Elbert'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Colorado GIS public parcel composite, not the county assessor. The click is limited to this county and requests parcel_id only. Owner fields exist on the layer and are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -104.60132,
        "lat": 39.46445,
        "id": "7406301011",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CO",
    "county": "Gilpin",
    "fips": "08047",
    "provider": "Colorado GIS",
    "dataset": "Colorado Public Parcels",
    "url": "https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "where": "countyName='Gilpin'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Colorado GIS public parcel composite, not the county assessor. The click is limited to this county and requests parcel_id only. Owner fields exist on the layer and are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -105.46315,
        "lat": 39.91842,
        "id": "158132400055",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CO",
    "county": "Huerfano",
    "fips": "08055",
    "provider": "Colorado GIS",
    "dataset": "Colorado Public Parcels",
    "url": "https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "where": "countyName='Huerfano'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Colorado GIS public parcel composite, not the county assessor. The click is limited to this county and requests parcel_id only. Owner fields exist on the layer and are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -104.79557,
        "lat": 37.61835,
        "id": "27819",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CO",
    "county": "Hinsdale",
    "fips": "08053",
    "provider": "Colorado GIS",
    "dataset": "Colorado Public Parcels",
    "url": "https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "where": "countyName='Hinsdale'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Colorado GIS public parcel composite, not the county assessor. The click is limited to this county and requests parcel_id only. Owner fields exist on the layer and are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -107.53187,
        "lat": 37.98302,
        "id": "MINER1645",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CO",
    "county": "Ouray",
    "fips": "08091",
    "provider": "Colorado GIS",
    "dataset": "Colorado Public Parcels",
    "url": "https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "where": "countyName='Ouray'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Colorado GIS public parcel composite, not the county assessor. The click is limited to this county and requests parcel_id only. Owner fields exist on the layer and are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -107.76288,
        "lat": 38.14487,
        "id": "430516318064",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CO",
    "county": "Rio Grande",
    "fips": "08105",
    "provider": "Colorado GIS",
    "dataset": "Colorado Public Parcels",
    "url": "https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "where": "countyName='Rio Grande'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Colorado GIS public parcel composite, not the county assessor. The click is limited to this county and requests parcel_id only. Owner fields exist on the layer and are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -106.63665,
        "lat": 37.68188,
        "id": "2127100011",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CO",
    "county": "Rio Blanco",
    "fips": "08103",
    "provider": "Colorado GIS",
    "dataset": "Colorado Public Parcels",
    "url": "https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "where": "countyName='Rio Blanco'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Colorado GIS public parcel composite, not the county assessor. The click is limited to this county and requests parcel_id only. Owner fields exist on the layer and are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -107.22306,
        "lat": 40.19672,
        "id": "116725300023",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CO",
    "county": "Grand",
    "fips": "08049",
    "provider": "Colorado GIS",
    "dataset": "Colorado Public Parcels",
    "url": "https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "where": "countyName='Grand'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Colorado GIS public parcel composite, not the county assessor. The click is limited to this county and requests parcel_id only. Owner fields exist on the layer and are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -105.91168,
        "lat": 40.06027,
        "id": "145108413184",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CO",
    "county": "Sedgwick",
    "fips": "08115",
    "provider": "Colorado GIS",
    "dataset": "Colorado Public Parcels",
    "url": "https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "where": "countyName='Sedgwick'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Colorado GIS public parcel composite, not the county assessor. The click is limited to this county and requests parcel_id only. Owner fields exist on the layer and are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -102.64116,
        "lat": 40.93309,
        "id": "91118040",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CO",
    "county": "Broomfield",
    "fips": "08014",
    "provider": "Colorado GIS",
    "dataset": "Colorado Public Parcels",
    "url": "https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "where": "countyName='Broomfield'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Colorado GIS public parcel composite, not the county assessor. The click is limited to this county and requests parcel_id only. Owner fields exist on the layer and are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -105.12265,
        "lat": 39.94709,
        "id": "157521318295",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CO",
    "county": "Logan",
    "fips": "08075",
    "provider": "Colorado GIS",
    "dataset": "Colorado Public Parcels",
    "url": "https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "where": "countyName='Logan'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Colorado GIS public parcel composite, not the county assessor. The click is limited to this county and requests parcel_id only. Owner fields exist on the layer and are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -103.21415,
        "lat": 40.6218,
        "id": "38052532222008",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CO",
    "county": "San Juan",
    "fips": "08111",
    "provider": "Colorado GIS",
    "dataset": "Colorado Public Parcels",
    "url": "https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "where": "countyName='San Juan'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Colorado GIS public parcel composite, not the county assessor. The click is limited to this county and requests parcel_id only. Owner fields exist on the layer and are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -107.66839,
        "lat": 37.81219,
        "id": "R7124",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CO",
    "county": "Lake",
    "fips": "08065",
    "provider": "Colorado GIS",
    "dataset": "Colorado Public Parcels",
    "url": "https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "where": "countyName='Lake'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Colorado GIS public parcel composite, not the county assessor. The click is limited to this county and requests parcel_id only. Owner fields exist on the layer and are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -106.28667,
        "lat": 39.25229,
        "id": "263324223006",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CO",
    "county": "San Miguel",
    "fips": "08113",
    "provider": "Colorado GIS",
    "dataset": "Colorado Public Parcels",
    "url": "https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "where": "countyName='San Miguel'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Colorado GIS public parcel composite, not the county assessor. The click is limited to this county and requests parcel_id only. Owner fields exist on the layer and are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -108.2501,
        "lat": 38.13622,
        "id": "429524100077",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CO",
    "county": "Montezuma",
    "fips": "08083",
    "provider": "Colorado GIS",
    "dataset": "Colorado Public Parcels",
    "url": "https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "where": "countyName='Montezuma'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Colorado GIS public parcel composite, not the county assessor. The click is limited to this county and requests parcel_id only. Owner fields exist on the layer and are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -108.37959,
        "lat": 37.44023,
        "id": "536127101110",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "DE",
    "county": "Kent",
    "fips": "10001",
    "provider": "Delaware FirstMap",
    "dataset": "State parcels",
    "url": "https://enterprise.firstmap.delaware.gov/arcgis/rest/services/PlanningCadastre/DE_StateParcels/MapServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "where": "COUNTY='Kent'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Delaware FirstMap state parcels, not each county assessor. The click is limited to this county and requests PIN only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -75.50247,
        "lat": 39.00027,
        "id": "8-00-14002-06-2300-00001",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "DE",
    "county": "Sussex",
    "fips": "10005",
    "provider": "Delaware FirstMap",
    "dataset": "State parcels",
    "url": "https://enterprise.firstmap.delaware.gov/arcgis/rest/services/PlanningCadastre/DE_StateParcels/MapServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "where": "COUNTY='Sussex'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Delaware FirstMap state parcels, not each county assessor. The click is limited to this county and requests PIN only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -75.25749,
        "lat": 38.57048,
        "id": "233-5.00-304.00",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Sebastian",
    "fips": "05131",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Sebastian'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -94.42211,
        "lat": 35.26055,
        "id": "60063-0000-00004-00",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "DE",
    "county": "New Castle",
    "fips": "10003",
    "provider": "Delaware FirstMap",
    "dataset": "State parcels",
    "url": "https://enterprise.firstmap.delaware.gov/arcgis/rest/services/PlanningCadastre/DE_StateParcels/MapServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "where": "COUNTY='New Castle'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Delaware FirstMap state parcels, not each county assessor. The click is limited to this county and requests PIN only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -75.69502,
        "lat": 39.62907,
        "id": "1004220014",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Cleburne",
    "fips": "05023",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Cleburne'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -92.24011,
        "lat": 35.4237,
        "id": "001-09300-001",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Baxter",
    "fips": "05005",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Baxter'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -92.19827,
        "lat": 36.32317,
        "id": "001-00352-008",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Franklin",
    "fips": "05047",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Franklin'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -93.71651,
        "lat": 35.38224,
        "id": "001-00005-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CO",
    "county": "Yuma",
    "fips": "08125",
    "provider": "Colorado GIS",
    "dataset": "Colorado Public Parcels",
    "url": "https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "where": "countyName='Yuma'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Colorado GIS public parcel composite, not the county assessor. The click is limited to this county and requests parcel_id only. Owner fields exist on the layer and are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -102.17694,
        "lat": 39.7353,
        "id": "R423138",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Cross",
    "fips": "05037",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Cross'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -90.72492,
        "lat": 35.43699,
        "id": "001-03040-010",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Faulkner",
    "fips": "05045",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Faulkner'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -92.50322,
        "lat": 35.10522,
        "id": "712-11901-030",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "CO",
    "county": "Washington",
    "fips": "08121",
    "provider": "Colorado GIS",
    "dataset": "Colorado Public Parcels",
    "url": "https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "where": "countyName='Washington'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Colorado GIS public parcel composite, not the county assessor. The click is limited to this county and requests parcel_id only. Owner fields exist on the layer and are not requested. A miss is not proof that no parcel exists. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -103.01964,
        "lat": 39.63703,
        "id": "07807000067",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "White",
    "fips": "05145",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='White'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -91.83144,
        "lat": 35.23684,
        "id": "002-01189-407",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Pope",
    "fips": "05115",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Pope'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -92.97171,
        "lat": 35.25964,
        "id": "016-00259-000A",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Grant",
    "fips": "05053",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Grant'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -92.4024,
        "lat": 34.3107,
        "id": "700-00814-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Arkansas",
    "fips": "05001",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Arkansas'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -91.33733,
        "lat": 34.28458,
        "id": "071-01464-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Monroe",
    "fips": "05095",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Monroe'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -91.0517,
        "lat": 34.73236,
        "id": "0001-00001-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Carroll",
    "fips": "05015",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Carroll'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -93.31954,
        "lat": 36.18851,
        "id": "001-00331-001",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Ashley",
    "fips": "05003",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Ashley'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -91.97404,
        "lat": 33.12519,
        "id": "706-01694-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Izard",
    "fips": "05065",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Izard'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -92.09354,
        "lat": 36.19303,
        "id": "001-08645-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Independence",
    "fips": "05063",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Independence'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -91.76909,
        "lat": 35.54555,
        "id": "0111727000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Calhoun",
    "fips": "05013",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Calhoun'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -92.55992,
        "lat": 33.48596,
        "id": "100-05577-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Lawrence",
    "fips": "05075",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Lawrence'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -91.05741,
        "lat": 35.9335,
        "id": "001-02787-001-C",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Logan",
    "fips": "05083",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Logan'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -93.81119,
        "lat": 35.15021,
        "id": "120-00381-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Lee",
    "fips": "05077",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Lee'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -90.69057,
        "lat": 34.8431,
        "id": "01-06674",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Miller",
    "fips": "05091",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Miller'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -93.98824,
        "lat": 33.39961,
        "id": "00542403",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Pike",
    "fips": "05109",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Pike'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -93.68675,
        "lat": 34.05849,
        "id": "900-00668-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Saline",
    "fips": "05125",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Saline'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -92.99521,
        "lat": 34.85219,
        "id": "001-14594-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Crawford",
    "fips": "05033",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Crawford'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -94.23972,
        "lat": 35.43397,
        "id": "740-00229-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Woodruff",
    "fips": "05147",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Woodruff'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -91.20018,
        "lat": 35.25613,
        "id": "006-00212-001",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Clark",
    "fips": "05019",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Clark'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -93.45763,
        "lat": 34.23088,
        "id": "01-12834-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Fulton",
    "fips": "05049",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Fulton'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -91.53514,
        "lat": 36.41605,
        "id": "001-00080-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Garland",
    "fips": "05051",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Garland'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -93.02973,
        "lat": 34.57217,
        "id": "100-04807-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Hempstead",
    "fips": "05057",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Hempstead'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -93.56128,
        "lat": 33.61734,
        "id": "001-04958-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Madison",
    "fips": "05087",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Madison'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -93.724,
        "lat": 36.05437,
        "id": "001-08200-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Scott",
    "fips": "05127",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Scott'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -93.71353,
        "lat": 34.85414,
        "id": "001-00039-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Hot Spring",
    "fips": "05059",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Hot Spring'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -92.74058,
        "lat": 34.5015,
        "id": "013-00001-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Poinsett",
    "fips": "05111",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Poinsett'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -90.931,
        "lat": 35.52695,
        "id": "001-00005-0000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Lonoke",
    "fips": "05085",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Lonoke'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -91.65924,
        "lat": 34.6446,
        "id": "001-00002-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Stone",
    "fips": "05137",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Stone'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -92.15744,
        "lat": 35.82758,
        "id": "001-04820-001",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Yell",
    "fips": "05149",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Yell'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -93.23673,
        "lat": 35.10425,
        "id": "001-11231-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Sevier",
    "fips": "05133",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Sevier'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -94.3191,
        "lat": 34.16488,
        "id": "072-00087-002-R",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Benton",
    "fips": "05007",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Benton'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -94.19336,
        "lat": 36.44195,
        "id": "16-26005-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Union",
    "fips": "05139",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Union'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -92.26745,
        "lat": 33.13675,
        "id": "00000-09699-0400",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Desha",
    "fips": "05041",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Desha'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -91.385,
        "lat": 33.86288,
        "id": "001-04631-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Boone",
    "fips": "05009",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Boone'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -93.07364,
        "lat": 36.28374,
        "id": "250-00016-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Polk",
    "fips": "05113",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Polk'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -94.02018,
        "lat": 34.50052,
        "id": "0000-00995-0010",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Clay",
    "fips": "05021",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Clay'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -90.2417,
        "lat": 36.31533,
        "id": "051-04603-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Chicot",
    "fips": "05017",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Chicot'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -91.44008,
        "lat": 33.53987,
        "id": "050-00658-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Bradley",
    "fips": "05011",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Bradley'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -92.16235,
        "lat": 33.44242,
        "id": "801-00047-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Conway",
    "fips": "05029",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Conway'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -92.73064,
        "lat": 35.27289,
        "id": "001-05033-002",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Columbia",
    "fips": "05027",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Columbia'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -93.24768,
        "lat": 33.28913,
        "id": "01-00370-00000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Cleveland",
    "fips": "05025",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Cleveland'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -92.4632,
        "lat": 34.02387,
        "id": "10170-00",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Craighead",
    "fips": "05031",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Craighead'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -90.7719,
        "lat": 35.87482,
        "id": "12-143041-00300",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Crittenden",
    "fips": "05035",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Crittenden'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -90.14013,
        "lat": 35.15784,
        "id": "373100000000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Greene",
    "fips": "05055",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Greene'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -90.49417,
        "lat": 36.05676,
        "id": "1551-00191-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Dallas",
    "fips": "05039",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Dallas'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -92.79019,
        "lat": 34.13478,
        "id": "001-08720-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Drew",
    "fips": "05043",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Drew'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -91.46038,
        "lat": 33.6766,
        "id": "001-00393-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Howard",
    "fips": "05061",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Howard'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -93.94443,
        "lat": 34.34669,
        "id": "001-00001-000E",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Jackson",
    "fips": "05067",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Jackson'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -91.31462,
        "lat": 35.64403,
        "id": "001-06373-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Jefferson",
    "fips": "05069",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Jefferson'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -92.16956,
        "lat": 34.44913,
        "id": "001-01583-001",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Johnson",
    "fips": "05071",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Johnson'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -93.46131,
        "lat": 35.45591,
        "id": "002-01924-006C",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Lafayette",
    "fips": "05073",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Lafayette'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -93.5062,
        "lat": 33.35942,
        "id": "701-00646-000E",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Lincoln",
    "fips": "05079",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Lincoln'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -91.7395,
        "lat": 33.97522,
        "id": "000-02592-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Marion",
    "fips": "05089",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Marion'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -92.6594,
        "lat": 36.47367,
        "id": "001-06613-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Little River",
    "fips": "05081",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Little River'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -93.9942,
        "lat": 33.58342,
        "id": "001-01055-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Newton",
    "fips": "05101",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Newton'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -93.37407,
        "lat": 35.7831,
        "id": "001-01118-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Mississippi",
    "fips": "05093",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Mississippi'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -89.87164,
        "lat": 35.81322,
        "id": "102-03564-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Perry",
    "fips": "05105",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Perry'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -93.18899,
        "lat": 34.94768,
        "id": "180-00101-001",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Montgomery",
    "fips": "05097",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Montgomery'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -93.70593,
        "lat": 34.43048,
        "id": "001-07492-001",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Nevada",
    "fips": "05099",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Nevada'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -93.45033,
        "lat": 33.95042,
        "id": "001-08537-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Ouachita",
    "fips": "05103",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Ouachita'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -92.93754,
        "lat": 33.81137,
        "id": "000-00001-000E",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Pulaski",
    "fips": "05119",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Pulaski'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -92.40423,
        "lat": 34.87455,
        "id": "42M-004.00-144.00",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Prairie",
    "fips": "05117",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Prairie'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -91.37962,
        "lat": 34.81281,
        "id": "001-00548-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Phillips",
    "fips": "05107",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Phillips'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -90.94761,
        "lat": 34.64044,
        "id": "001-00001-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Randolph",
    "fips": "05121",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Randolph'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -91.0352,
        "lat": 36.45634,
        "id": "001-05166-002",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Searcy",
    "fips": "05129",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Searcy'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -92.47543,
        "lat": 35.80093,
        "id": "001-00032-001",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Van Buren",
    "fips": "05141",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Van Buren'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -92.65745,
        "lat": 35.48301,
        "id": "0000-11750-0000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Washington",
    "fips": "05143",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Washington'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -94.16381,
        "lat": 36.07536,
        "id": "765-12322-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "Sharp",
    "fips": "05135",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='Sharp'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -91.47903,
        "lat": 36.31458,
        "id": "760-05967-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "AR",
    "county": "St. Francis",
    "fips": "05123",
    "provider": "Arkansas GIS",
    "dataset": "Planning Cadastre",
    "url": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Planning_Cadastre/FeatureServer",
    "queryLayer": 6,
    "fields": {
      "apn": "parcelid"
    },
    "outFields": "parcelid",
    "where": "county='St. Francis'",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Arkansas GIS planning cadastre, not each county assessor. The click is limited to this county and requests parcelid only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -90.78129,
        "lat": 35.01353,
        "id": "0723-00001-0000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "VA",
    "county": "Gloucester",
    "fips": "51073",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -76.619,
        "lat": 37.519,
        "id": "0721-78-9510",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Gloucester County'"
  },
  {
    "state": "VA",
    "county": "Northampton",
    "fips": "51131",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -75.926,
        "lat": 37.542,
        "id": "00001-0A-00-0000001",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Northampton County'"
  },
  {
    "state": "VA",
    "county": "Lancaster",
    "fips": "51103",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -76.583,
        "lat": 37.8115,
        "id": "6 2E",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Lancaster County'"
  },
  {
    "state": "VA",
    "county": "Warren",
    "fips": "51187",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -78.1525,
        "lat": 39.031,
        "id": "5 1",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Warren County'"
  },
  {
    "state": "VA",
    "county": "Accomack",
    "fips": "51001",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -75.542,
        "lat": 38.001,
        "id": "00100A000000100",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Accomack County'"
  },
  {
    "state": "VA",
    "county": "Bland",
    "fips": "51021",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -81.136,
        "lat": 37.188,
        "id": "34 A 11",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Bland County'"
  },
  {
    "state": "VA",
    "county": "Fluvanna",
    "fips": "51065",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -78.306,
        "lat": 38.006,
        "id": "1 A 6",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Fluvanna County'"
  },
  {
    "state": "VA",
    "county": "Covington city",
    "fips": "51580",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -79.992,
        "lat": 37.805,
        "id": "-6---9---163-",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Covington City'"
  },
  {
    "state": "VA",
    "county": "Frederick",
    "fips": "51069",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -78.172,
        "lat": 39.275,
        "id": "1154-77-5473",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Frederick County'"
  },
  {
    "state": "VA",
    "county": "King William",
    "fips": "51101",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -77.309,
        "lat": 37.809,
        "id": "10-12",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='King William County'"
  },
  {
    "state": "VA",
    "county": "Isle of Wight",
    "fips": "51093",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -76.666,
        "lat": 37.0885,
        "id": "03-01-003A",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Isle of Wight County'"
  },
  {
    "state": "VA",
    "county": "Manassas Park city",
    "fips": "51685",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -77.4545,
        "lat": 38.7715,
        "id": "1605",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Manassas Park City'"
  },
  {
    "state": "VA",
    "county": "Nelson",
    "fips": "51125",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -78.8355,
        "lat": 38.0325,
        "id": "3 A 48",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Nelson County'"
  },
  {
    "state": "VA",
    "county": "Prince Edward",
    "fips": "51147",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -78.5935,
        "lat": 37.3955,
        "id": "001 A APPO",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Prince Edward County'"
  },
  {
    "state": "VA",
    "county": "Sussex",
    "fips": "51183",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -77.185,
        "lat": 37.0985,
        "id": "1-1-2",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Sussex County'"
  },
  {
    "state": "VA",
    "county": "Suffolk city",
    "fips": "51800",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -76.481,
        "lat": 36.915,
        "id": "0479-38-1829",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Suffolk City'"
  },
  {
    "state": "VA",
    "county": "Tazewell",
    "fips": "51185",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -81.351,
        "lat": 37.3095,
        "id": "002 A 0001",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Tazewell County'"
  },
  {
    "state": "VA",
    "county": "Southampton",
    "fips": "51175",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -76.92,
        "lat": 36.961,
        "id": "1-1",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Southampton County'"
  },
  {
    "state": "VA",
    "county": "Alexandria city",
    "fips": "51510",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -77.04,
        "lat": 38.805,
        "id": "075.01-04-08",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Alexandria City'"
  },
  {
    "state": "VA",
    "county": "Prince William",
    "fips": "51153",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -77.635,
        "lat": 38.938,
        "id": "7202-85-9380",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Prince William County'"
  },
  {
    "state": "VA",
    "county": "Augusta",
    "fips": "51015",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -79.225,
        "lat": 38.477,
        "id": "001",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Augusta County'"
  },
  {
    "state": "VA",
    "county": "Brunswick",
    "fips": "51025",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -77.9975,
        "lat": 37.0065,
        "id": "2 2C",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Brunswick County'"
  },
  {
    "state": "VA",
    "county": "Caroline",
    "fips": "51033",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -77.3825,
        "lat": 37.816,
        "id": "107-A-10",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Caroline County'"
  },
  {
    "state": "VA",
    "county": "Buckingham",
    "fips": "51029",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -78.495,
        "lat": 37.78325,
        "id": "1-1",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Buckingham County'"
  },
  {
    "state": "VA",
    "county": "Cumberland",
    "fips": "51049",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -78.1625,
        "lat": 37.74875,
        "id": "2-A-4",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Cumberland County'"
  },
  {
    "state": "VA",
    "county": "Emporia city",
    "fips": "51595",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -77.543,
        "lat": 36.6945,
        "id": "142-A-85",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Emporia City'"
  },
  {
    "state": "VA",
    "county": "Chesterfield",
    "fips": "51041",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -77.7625,
        "lat": 37.3375,
        "id": "6976472433",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Chesterfield County'"
  },
  {
    "state": "VA",
    "county": "Franklin",
    "fips": "51067",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -79.7655,
        "lat": 36.834,
        "id": "1090012911",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Franklin County'"
  },
  {
    "state": "VA",
    "county": "Greene",
    "fips": "51079",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -78.4405,
        "lat": 38.452,
        "id": "3 A 1",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Greene County'"
  },
  {
    "state": "VA",
    "county": "King George",
    "fips": "51099",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -77.12175,
        "lat": 38.23825,
        "id": "34B 1 10B",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='King George County'"
  },
  {
    "state": "VA",
    "county": "Norton city",
    "fips": "51720",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -82.65,
        "lat": 36.9175,
        "id": "2205",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Norton City'"
  },
  {
    "state": "VA",
    "county": "Richmond",
    "fips": "51159",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -76.8765,
        "lat": 38.1215,
        "id": "20622",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Richmond County'"
  },
  {
    "state": "VA",
    "county": "Winchester city",
    "fips": "51840",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -78.19,
        "lat": 39.172,
        "id": "8712",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Winchester City'"
  },
  {
    "state": "VA",
    "county": "Russell",
    "fips": "51167",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -81.902,
        "lat": 37.1355,
        "id": "13927",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Russell County'"
  },
  {
    "state": "VA",
    "county": "Amherst",
    "fips": "51009",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -79.243,
        "lat": 37.792,
        "id": "2 1 1",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Amherst County'"
  },
  {
    "state": "VA",
    "county": "York",
    "fips": "51199",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -76.7375,
        "lat": 37.3695,
        "id": "C21A-0372-2795",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='York County'"
  },
  {
    "state": "VA",
    "county": "Dinwiddie",
    "fips": "51053",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -77.746,
        "lat": 37.168,
        "id": "15-2A",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Dinwiddie County'"
  },
  {
    "state": "VA",
    "county": "Dickenson",
    "fips": "51051",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -82.49,
        "lat": 37.187,
        "id": "186B-348A",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Dickenson County'"
  },
  {
    "state": "VA",
    "county": "Galax city",
    "fips": "51640",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -80.929,
        "lat": 36.631,
        "id": "4487",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Galax City'"
  },
  {
    "state": "VA",
    "county": "Hanover",
    "fips": "51085",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -77.795,
        "lat": 37.729,
        "id": "6788-69-7729",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Hanover County'"
  },
  {
    "state": "VA",
    "county": "Louisa",
    "fips": "51109",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -78.0745,
        "lat": 38.1375,
        "id": "5 7",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Louisa County'"
  },
  {
    "state": "VA",
    "county": "Madison",
    "fips": "51113",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -78.362,
        "lat": 38.531,
        "id": "1 111",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Madison County'"
  },
  {
    "state": "VA",
    "county": "Henry",
    "fips": "51089",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -79.819,
        "lat": 36.622,
        "id": "083200000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Henry County'"
  },
  {
    "state": "VA",
    "county": "Poquoson city",
    "fips": "51735",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -76.4055,
        "lat": 37.12625,
        "id": "6490",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Poquoson City'"
  },
  {
    "state": "VA",
    "county": "Pittsylvania",
    "fips": "51143",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -79.592,
        "lat": 36.7325,
        "id": "1462-27-3157",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Pittsylvania County'"
  },
  {
    "state": "VA",
    "county": "Charles City",
    "fips": "51036",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -77.1765,
        "lat": 37.4355,
        "id": "7-4-B-2",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Charles City County'"
  },
  {
    "state": "VA",
    "county": "Floyd",
    "fips": "51063",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -80.1655,
        "lat": 37.0815,
        "id": "10-1",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Floyd County'"
  },
  {
    "state": "VA",
    "county": "Giles",
    "fips": "51071",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -80.5725,
        "lat": 37.4615,
        "id": "5393",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Giles County'"
  },
  {
    "state": "VA",
    "county": "Chesapeake city",
    "fips": "51550",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -76.3045,
        "lat": 36.6255,
        "id": "0940000000293",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Chesapeake City'"
  },
  {
    "state": "VA",
    "county": "Middlesex",
    "fips": "51119",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -76.419,
        "lat": 37.513,
        "id": "43-18-9",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Middlesex County'"
  },
  {
    "state": "VA",
    "county": "Page",
    "fips": "51139",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -78.3835,
        "lat": 38.7705,
        "id": "5196-63-1462",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Page County'"
  },
  {
    "state": "VA",
    "county": "Westmoreland",
    "fips": "51193",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -76.951,
        "lat": 38.11875,
        "id": "31 3",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Westmoreland County'"
  },
  {
    "state": "VA",
    "county": "Washington",
    "fips": "51191",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -81.9725,
        "lat": 36.7235,
        "id": "001-2-1",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Washington County'"
  },
  {
    "state": "VA",
    "county": "Wise",
    "fips": "51195",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -82.45,
        "lat": 36.92475,
        "id": "040556",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Wise County'"
  },
  {
    "state": "WA",
    "county": "Benton",
    "fips": "53005",
    "provider": "Washington State Parcels Project",
    "dataset": "Current parcels",
    "url": "https://services.arcgis.com/jsIt88o09Q0r1j8h/ArcGIS/rest/services/Current_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID_NR"
    },
    "outFields": "PARCEL_ID_NR",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Washington State Parcels Project, not the county assessor. The click is limited to this county and requests PARCEL_ID_NR only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -119.0795,
        "lat": 46.14275,
        "id": "005-129804011519004",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "FIPS_NR='005'"
  },
  {
    "state": "WA",
    "county": "Chelan",
    "fips": "53007",
    "provider": "Washington State Parcels Project",
    "dataset": "Current parcels",
    "url": "https://services.arcgis.com/jsIt88o09Q0r1j8h/ArcGIS/rest/services/Current_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID_NR"
    },
    "outFields": "PARCEL_ID_NR",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Washington State Parcels Project, not the county assessor. The click is limited to this county and requests PARCEL_ID_NR only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -120.6515,
        "lat": 47.344,
        "id": "007-211701000000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "FIPS_NR='007'"
  },
  {
    "state": "VA",
    "county": "Wythe",
    "fips": "51197",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -81.2275,
        "lat": 37.045,
        "id": "1-1",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Wythe County'"
  },
  {
    "state": "WA",
    "county": "Clark",
    "fips": "53011",
    "provider": "Washington State Parcels Project",
    "dataset": "Current parcels",
    "url": "https://services.arcgis.com/jsIt88o09Q0r1j8h/ArcGIS/rest/services/Current_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID_NR"
    },
    "outFields": "PARCEL_ID_NR",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Washington State Parcels Project, not the county assessor. The click is limited to this county and requests PARCEL_ID_NR only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -122.689,
        "lat": 45.6455,
        "id": "011-6000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "FIPS_NR='011'"
  },
  {
    "state": "WA",
    "county": "Grays Harbor",
    "fips": "53027",
    "provider": "Washington State Parcels Project",
    "dataset": "Current parcels",
    "url": "https://services.arcgis.com/jsIt88o09Q0r1j8h/ArcGIS/rest/services/Current_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID_NR"
    },
    "outFields": "PARCEL_ID_NR",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Washington State Parcels Project, not the county assessor. The click is limited to this county and requests PARCEL_ID_NR only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -123.80575,
        "lat": 46.9805,
        "id": "027-010100100100",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "FIPS_NR='027'"
  },
  {
    "state": "WA",
    "county": "Skamania",
    "fips": "53059",
    "provider": "Washington State Parcels Project",
    "dataset": "Current parcels",
    "url": "https://services.arcgis.com/jsIt88o09Q0r1j8h/ArcGIS/rest/services/Current_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID_NR"
    },
    "outFields": "PARCEL_ID_NR",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Washington State Parcels Project, not the county assessor. The click is limited to this county and requests PARCEL_ID_NR only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -122.236,
        "lat": 45.562,
        "id": "059-01051900050000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "FIPS_NR='059'"
  },
  {
    "state": "WA",
    "county": "Walla Walla",
    "fips": "53071",
    "provider": "Washington State Parcels Project",
    "dataset": "Current parcels",
    "url": "https://services.arcgis.com/jsIt88o09Q0r1j8h/ArcGIS/rest/services/Current_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID_NR"
    },
    "outFields": "PARCEL_ID_NR",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Washington State Parcels Project, not the county assessor. The click is limited to this county and requests PARCEL_ID_NR only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -118.3635,
        "lat": 46.028,
        "id": "071-360606230002",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "COUNTY_NM='Walla Walla'"
  },
  {
    "state": "WA",
    "county": "Lincoln",
    "fips": "53043",
    "provider": "Washington State Parcels Project",
    "dataset": "Current parcels",
    "url": "https://services.arcgis.com/jsIt88o09Q0r1j8h/ArcGIS/rest/services/Current_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID_NR"
    },
    "outFields": "PARCEL_ID_NR",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Washington State Parcels Project, not the county assessor. The click is limited to this county and requests PARCEL_ID_NR only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -118.2545,
        "lat": 47.93425,
        "id": "043-2836010000000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "FIPS_NR='043'"
  },
  {
    "state": "WA",
    "county": "Adams",
    "fips": "53001",
    "provider": "Washington State Parcels Project",
    "dataset": "Current parcels",
    "url": "https://services.arcgis.com/jsIt88o09Q0r1j8h/ArcGIS/rest/services/Current_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID_NR"
    },
    "outFields": "PARCEL_ID_NR",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Washington State Parcels Project, not the county assessor. The click is limited to this county and requests PARCEL_ID_NR only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -117.972,
        "lat": 47.256,
        "id": "001-2038010000001",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "FIPS_NR='001'"
  },
  {
    "state": "WA",
    "county": "Clallam",
    "fips": "53009",
    "provider": "Washington State Parcels Project",
    "dataset": "Current parcels",
    "url": "https://services.arcgis.com/jsIt88o09Q0r1j8h/ArcGIS/rest/services/Current_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID_NR"
    },
    "outFields": "PARCEL_ID_NR",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Washington State Parcels Project, not the county assessor. The click is limited to this county and requests PARCEL_ID_NR only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -123.65175,
        "lat": 48.13175,
        "id": "009-083136330250",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "FIPS_NR='009'"
  },
  {
    "state": "WA",
    "county": "Lewis",
    "fips": "53041",
    "provider": "Washington State Parcels Project",
    "dataset": "Current parcels",
    "url": "https://services.arcgis.com/jsIt88o09Q0r1j8h/ArcGIS/rest/services/Current_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID_NR"
    },
    "outFields": "PARCEL_ID_NR",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Washington State Parcels Project, not the county assessor. The click is limited to this county and requests PARCEL_ID_NR only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -121.4915,
        "lat": 46.3965,
        "id": "041-039105000000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "FIPS_NR='041'"
  },
  {
    "state": "WA",
    "county": "San Juan",
    "fips": "53055",
    "provider": "Washington State Parcels Project",
    "dataset": "Current parcels",
    "url": "https://services.arcgis.com/jsIt88o09Q0r1j8h/ArcGIS/rest/services/Current_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID_NR"
    },
    "outFields": "PARCEL_ID_NR",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Washington State Parcels Project, not the county assessor. The click is limited to this county and requests PARCEL_ID_NR only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -122.862,
        "lat": 48.4745,
        "id": "055-140623006000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "FIPS_NR='055'"
  },
  {
    "state": "WA",
    "county": "Spokane",
    "fips": "53063",
    "provider": "Washington State Parcels Project",
    "dataset": "Current parcels",
    "url": "https://services.arcgis.com/jsIt88o09Q0r1j8h/ArcGIS/rest/services/Current_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID_NR"
    },
    "outFields": "PARCEL_ID_NR",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Washington State Parcels Project, not the county assessor. The click is limited to this county and requests PARCEL_ID_NR only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -117.7095,
        "lat": 47.3365,
        "id": "063-01013.9002",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "FIPS_NR='063'"
  },
  {
    "state": "WA",
    "county": "Snohomish",
    "fips": "53061",
    "provider": "Washington State Parcels Project",
    "dataset": "Current parcels",
    "url": "https://services.arcgis.com/jsIt88o09Q0r1j8h/ArcGIS/rest/services/Current_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID_NR"
    },
    "outFields": "PARCEL_ID_NR",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Washington State Parcels Project, not the county assessor. The click is limited to this county and requests PARCEL_ID_NR only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -122.361,
        "lat": 48.2865,
        "id": "061-32030100401200",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "FIPS_NR='061'"
  },
  {
    "state": "WA",
    "county": "Whatcom",
    "fips": "53073",
    "provider": "Washington State Parcels Project",
    "dataset": "Current parcels",
    "url": "https://services.arcgis.com/jsIt88o09Q0r1j8h/ArcGIS/rest/services/Current_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID_NR"
    },
    "outFields": "PARCEL_ID_NR",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Washington State Parcels Project, not the county assessor. The click is limited to this county and requests PARCEL_ID_NR only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -122.5815,
        "lat": 48.645,
        "id": "073-3602053285140000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "FIPS_NR='073'"
  },
  {
    "state": "WA",
    "county": "Wahkiakum",
    "fips": "53069",
    "provider": "Washington State Parcels Project",
    "dataset": "Current parcels",
    "url": "https://services.arcgis.com/jsIt88o09Q0r1j8h/ArcGIS/rest/services/Current_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID_NR"
    },
    "outFields": "PARCEL_ID_NR",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Washington State Parcels Project, not the county assessor. The click is limited to this county and requests PARCEL_ID_NR only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -123.2385,
        "lat": 46.20775,
        "id": "069-010805110001",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "FIPS_NR='069'"
  },
  {
    "state": "WA",
    "county": "Kitsap",
    "fips": "53035",
    "provider": "Washington State Parcels Project",
    "dataset": "Current parcels",
    "url": "https://services.arcgis.com/jsIt88o09Q0r1j8h/ArcGIS/rest/services/Current_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID_NR"
    },
    "outFields": "PARCEL_ID_NR",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Washington State Parcels Project, not the county assessor. The click is limited to this county and requests PARCEL_ID_NR only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -122.7425,
        "lat": 47.429,
        "id": "035-012201-1-001-1007",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "FIPS_NR='035'"
  },
  {
    "state": "WA",
    "county": "Whitman",
    "fips": "53075",
    "provider": "Washington State Parcels Project",
    "dataset": "Current parcels",
    "url": "https://services.arcgis.com/jsIt88o09Q0r1j8h/ArcGIS/rest/services/Current_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID_NR"
    },
    "outFields": "PARCEL_ID_NR",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Washington State Parcels Project, not the county assessor. The click is limited to this county and requests PARCEL_ID_NR only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -117.47175,
        "lat": 46.8785,
        "id": "075-200004216132902",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "FIPS_NR='075'"
  },
  {
    "state": "NJ",
    "county": "Warren",
    "fips": "34041",
    "provider": "New Jersey Office of GIS",
    "dataset": "Statewide parcel composite",
    "url": "https://services2.arcgis.com/XVOqAjTOJ5P6ngMu/arcgis/rest/services/Parcels_Composite_NJ_WM/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PAMS_PIN"
    },
    "outFields": "PAMS_PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "New Jersey GIS statewide parcel composite, not the county assessor. The click is limited to this county and requests PAMS_PIN only. Owner name is not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -74.861,
        "lat": 40.907,
        "id": "2101_602_24.03",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "COUNTY='WARREN'"
  },
  {
    "state": "NJ",
    "county": "Mercer",
    "fips": "34021",
    "provider": "New Jersey Office of GIS",
    "dataset": "Statewide parcel composite",
    "url": "https://services2.arcgis.com/XVOqAjTOJ5P6ngMu/arcgis/rest/services/Parcels_Composite_NJ_WM/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PAMS_PIN"
    },
    "outFields": "PAMS_PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "New Jersey GIS statewide parcel composite, not the county assessor. The click is limited to this county and requests PAMS_PIN only. Owner name is not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -74.831,
        "lat": 40.2685,
        "id": "1102_423_17",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "COUNTY='MERCER'"
  },
  {
    "state": "NJ",
    "county": "Burlington",
    "fips": "34005",
    "provider": "New Jersey Office of GIS",
    "dataset": "Statewide parcel composite",
    "url": "https://services2.arcgis.com/XVOqAjTOJ5P6ngMu/arcgis/rest/services/Parcels_Composite_NJ_WM/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PAMS_PIN"
    },
    "outFields": "PAMS_PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "New Jersey GIS statewide parcel composite, not the county assessor. The click is limited to this county and requests PAMS_PIN only. Owner name is not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -74.8285,
        "lat": 40.115,
        "id": "0306_154.01_3.01",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "COUNTY='BURLINGTON'"
  },
  {
    "state": "NJ",
    "county": "Hudson",
    "fips": "34017",
    "provider": "New Jersey Office of GIS",
    "dataset": "Statewide parcel composite",
    "url": "https://services2.arcgis.com/XVOqAjTOJ5P6ngMu/arcgis/rest/services/Parcels_Composite_NJ_WM/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PAMS_PIN"
    },
    "outFields": "PAMS_PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "New Jersey GIS statewide parcel composite, not the county assessor. The click is limited to this county and requests PAMS_PIN only. Owner name is not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -74.1045,
        "lat": 40.6925,
        "id": "0901_7_1.01",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "COUNTY='HUDSON'"
  },
  {
    "state": "NJ",
    "county": "Gloucester",
    "fips": "34015",
    "provider": "New Jersey Office of GIS",
    "dataset": "Statewide parcel composite",
    "url": "https://services2.arcgis.com/XVOqAjTOJ5P6ngMu/arcgis/rest/services/Parcels_Composite_NJ_WM/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PAMS_PIN"
    },
    "outFields": "PAMS_PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "New Jersey GIS statewide parcel composite, not the county assessor. The click is limited to this county and requests PAMS_PIN only. Owner name is not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -75.322,
        "lat": 39.738,
        "id": "0824_4_4",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "COUNTY='GLOUCESTER'"
  },
  {
    "state": "MT",
    "county": "Dawson",
    "fips": "30021",
    "provider": "Montana State Library",
    "dataset": "Montana Parcels",
    "url": "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Montana cadastral framework, not a title search. The click is limited to this county and requests PARCELID only. Owner names exist on the layer and are not requested. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -105.2455,
        "lat": 47.77975,
        "id": "16343501101010000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CountyName='Dawson'"
  },
  {
    "state": "MT",
    "county": "Carbon",
    "fips": "30009",
    "provider": "Montana State Library",
    "dataset": "Montana Parcels",
    "url": "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Montana cadastral framework, not a title search. The click is limited to this county and requests PARCELID only. Owner names exist on the layer and are not requested. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -109.1355,
        "lat": 45.3335,
        "id": "10044704401010000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CountyName='Carbon'"
  },
  {
    "state": "MT",
    "county": "Pondera",
    "fips": "30073",
    "provider": "Montana State Library",
    "dataset": "Montana Parcels",
    "url": "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Montana cadastral framework, not a title search. The click is limited to this county and requests PARCELID only. Owner names exist on the layer and are not requested. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -112.55725,
        "lat": 48.4795,
        "id": "26431006101010000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CountyName='Pondera'"
  },
  {
    "state": "MT",
    "county": "Treasure",
    "fips": "30103",
    "provider": "Montana State Library",
    "dataset": "Montana Parcels",
    "url": "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Montana cadastral framework, not a title search. The click is limited to this county and requests PARCELID only. Owner names exist on the layer and are not requested. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -107.185,
        "lat": 46.4755,
        "id": "33172902101010000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CountyName='Treasure'"
  },
  {
    "state": "MT",
    "county": "Missoula",
    "fips": "30063",
    "provider": "Montana State Library",
    "dataset": "Montana Parcels",
    "url": "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Montana cadastral framework, not a title search. The click is limited to this county and requests PARCELID only. Owner names exist on the layer and are not requested. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -113.9665,
        "lat": 46.8815,
        "id": "04220014223170000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CountyName='Missoula'"
  },
  {
    "state": "MT",
    "county": "Rosebud",
    "fips": "30087",
    "provider": "Montana State Library",
    "dataset": "Montana Parcels",
    "url": "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Montana cadastral framework, not a title search. The click is limited to this county and requests PARCELID only. Owner names exist on the layer and are not requested. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -106.773,
        "lat": 46.8525,
        "id": "29227127101011640",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CountyName='Rosebud'"
  },
  {
    "state": "MT",
    "county": "Yellowstone",
    "fips": "30111",
    "provider": "Montana State Library",
    "dataset": "Montana Parcels",
    "url": "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Montana cadastral framework, not a title search. The click is limited to this county and requests PARCELID only. Owner names exist on the layer and are not requested. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -108.5795,
        "lat": 45.5185,
        "id": "03062801101010000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CountyName='Yellowstone'"
  },
  {
    "state": "MT",
    "county": "Carter",
    "fips": "30011",
    "provider": "Montana State Library",
    "dataset": "Montana Parcels",
    "url": "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Montana cadastral framework, not a title search. The click is limited to this county and requests PARCELID only. Owner names exist on the layer and are not requested. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -104.6095,
        "lat": 46.033,
        "id": "42126411101010000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CountyName='Carter'"
  },
  {
    "state": "MT",
    "county": "Blaine",
    "fips": "30005",
    "provider": "Montana State Library",
    "dataset": "Montana Parcels",
    "url": "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Montana cadastral framework, not a title search. The click is limited to this county and requests PARCELID only. Owner names exist on the layer and are not requested. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -108.665,
        "lat": 48.9925,
        "id": "24498002101010000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CountyName='Blaine'"
  },
  {
    "state": "MT",
    "county": "Custer",
    "fips": "30017",
    "provider": "Montana State Library",
    "dataset": "Montana Parcels",
    "url": "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Montana cadastral framework, not a title search. The click is limited to this county and requests PARCELID only. Owner names exist on the layer and are not requested. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -105.4975,
        "lat": 46.6365,
        "id": "14194312101010000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CountyName='Custer'"
  },
  {
    "state": "MT",
    "county": "Fallon",
    "fips": "30025",
    "provider": "Montana State Library",
    "dataset": "Montana Parcels",
    "url": "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Montana cadastral framework, not a title search. The click is limited to this county and requests PARCELID only. Owner names exist on the layer and are not requested. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -104.4655,
        "lat": 46.6775,
        "id": "39207230101010000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CountyName='Fallon'"
  },
  {
    "state": "MT",
    "county": "Daniels",
    "fips": "30019",
    "provider": "Montana State Library",
    "dataset": "Montana Parcels",
    "url": "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Montana cadastral framework, not a title search. The click is limited to this county and requests PARCELID only. Owner names exist on the layer and are not requested. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -105.4805,
        "lat": 48.9995,
        "id": "37500402101020000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CountyName='Daniels'"
  },
  {
    "state": "MT",
    "county": "Golden Valley",
    "fips": "30037",
    "provider": "Montana State Library",
    "dataset": "Montana Parcels",
    "url": "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Montana cadastral framework, not a title search. The click is limited to this county and requests PARCELID only. Owner names exist on the layer and are not requested. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -109.03875,
        "lat": 46.28975,
        "id": "53151512107060000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CountyName='Golden Valley'"
  },
  {
    "state": "MT",
    "county": "Meagher",
    "fips": "30059",
    "provider": "Montana State Library",
    "dataset": "Montana Parcels",
    "url": "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Montana cadastral framework, not a title search. The click is limited to this county and requests PARCELID only. Owner names exist on the layer and are not requested. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -110.935,
        "lat": 46.54775,
        "id": "47179814101010001",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CountyName='Meagher'"
  },
  {
    "state": "MT",
    "county": "Judith Basin",
    "fips": "30045",
    "provider": "Montana State Library",
    "dataset": "Montana Parcels",
    "url": "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Montana cadastral framework, not a title search. The click is limited to this county and requests PARCELID only. Owner names exist on the layer and are not requested. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -110.5865,
        "lat": 47.4125,
        "id": "36289816101010000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CountyName='Judith Basin'"
  },
  {
    "state": "MT",
    "county": "Park",
    "fips": "30067",
    "provider": "Montana State Library",
    "dataset": "Montana Parcels",
    "url": "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Montana cadastral framework, not a title search. The click is limited to this county and requests PARCELID only. Owner names exist on the layer and are not requested. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -110.785,
        "lat": 45.6525,
        "id": "49080119103200000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CountyName='Park'"
  },
  {
    "state": "MT",
    "county": "Petroleum",
    "fips": "30069",
    "provider": "Montana State Library",
    "dataset": "Montana Parcels",
    "url": "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Montana cadastral framework, not a title search. The click is limited to this county and requests PARCELID only. Owner names exist on the layer and are not requested. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -108.145,
        "lat": 47.47675,
        "id": "55304421101010000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CountyName='Petroleum'"
  },
  {
    "state": "MT",
    "county": "Roosevelt",
    "fips": "30085",
    "provider": "Montana State Library",
    "dataset": "Montana Parcels",
    "url": "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Montana cadastral framework, not a title search. The click is limited to this county and requests PARCELID only. Owner names exist on the layer and are not requested. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -105.485,
        "lat": 48.5555,
        "id": "17447704103030000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CountyName='Roosevelt'"
  },
  {
    "state": "MT",
    "county": "Sheridan",
    "fips": "30091",
    "provider": "Montana State Library",
    "dataset": "Montana Parcels",
    "url": "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Montana cadastral framework, not a title search. The click is limited to this county and requests PARCELID only. Owner names exist on the layer and are not requested. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -104.3245,
        "lat": 48.9995,
        "id": "34501303201020000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CountyName='Sheridan'"
  },
  {
    "state": "MT",
    "county": "Wheatland",
    "fips": "30107",
    "provider": "Montana State Library",
    "dataset": "Montana Parcels",
    "url": "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Montana cadastral framework, not a title search. The click is limited to this county and requests PARCELID only. Owner names exist on the layer and are not requested. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -109.8825,
        "lat": 46.686,
        "id": "44202130101010000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CountyName='Wheatland'"
  },
  {
    "state": "MT",
    "county": "Sweet Grass",
    "fips": "30097",
    "provider": "Montana State Library",
    "dataset": "Montana Parcels",
    "url": "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Montana cadastral framework, not a title search. The click is limited to this county and requests PARCELID only. Owner names exist on the layer and are not requested. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -109.959,
        "lat": 46.2015,
        "id": "40141510102010000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CountyName='Sweet Grass'"
  },
  {
    "state": "MT",
    "county": "Silver Bow",
    "fips": "30093",
    "provider": "Montana State Library",
    "dataset": "Montana Parcels",
    "url": "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Montana cadastral framework, not a title search. The click is limited to this county and requests PARCELID only. Owner names exist on the layer and are not requested. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -112.66,
        "lat": 45.6925,
        "id": "01078101101010000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CountyName='Silver Bow'"
  },
  {
    "state": "MT",
    "county": "Big Horn",
    "fips": "30003",
    "provider": "Montana State Library",
    "dataset": "Montana Parcels",
    "url": "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Montana cadastral framework, not a title search. The click is limited to this county and requests PARCELID only. Owner names exist on the layer and are not requested. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -107.179,
        "lat": 45.0685,
        "id": "22020609101010000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CountyName='Big Horn'"
  },
  {
    "state": "MT",
    "county": "Broadwater",
    "fips": "30007",
    "provider": "Montana State Library",
    "dataset": "Montana Parcels",
    "url": "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Montana cadastral framework, not a title search. The click is limited to this county and requests PARCELID only. Owner names exist on the layer and are not requested. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -111.59,
        "lat": 46.5635,
        "id": "43179103101130000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CountyName='Broadwater'"
  },
  {
    "state": "MT",
    "county": "Deer Lodge",
    "fips": "30023",
    "provider": "Montana State Library",
    "dataset": "Montana Parcels",
    "url": "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Montana cadastral framework, not a title search. The click is limited to this county and requests PARCELID only. Owner names exist on the layer and are not requested. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -112.7135,
        "lat": 46.2445,
        "id": "30148227101010000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CountyName='Deer Lodge'"
  },
  {
    "state": "MT",
    "county": "Garfield",
    "fips": "30033",
    "provider": "Montana State Library",
    "dataset": "Montana Parcels",
    "url": "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Montana cadastral framework, not a title search. The click is limited to this county and requests PARCELID only. Owner names exist on the layer and are not requested. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -107.539,
        "lat": 46.902,
        "id": "50226009101010000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CountyName='Garfield'"
  },
  {
    "state": "MT",
    "county": "Madison",
    "fips": "30057",
    "provider": "Montana State Library",
    "dataset": "Montana Parcels",
    "url": "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Montana cadastral framework, not a title search. The click is limited to this county and requests PARCELID only. Owner names exist on the layer and are not requested. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -112.0925,
        "lat": 45.8415,
        "id": "25099915201040000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CountyName='Madison'"
  },
  {
    "state": "MT",
    "county": "McCone",
    "fips": "30055",
    "provider": "Montana State Library",
    "dataset": "Montana Parcels",
    "url": "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Montana cadastral framework, not a title search. The click is limited to this county and requests PARCELID only. Owner names exist on the layer and are not requested. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -105.24025,
        "lat": 47.8655,
        "id": "41354401301010000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CountyName='McCone'"
  },
  {
    "state": "MT",
    "county": "Teton",
    "fips": "30099",
    "provider": "Montana State Library",
    "dataset": "Montana Parcels",
    "url": "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Montana cadastral framework, not a title search. The click is limited to this county and requests PARCELID only. Owner names exist on the layer and are not requested. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -112.558,
        "lat": 47.754,
        "id": "31336618201010000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CountyName='Teton'"
  },
  {
    "state": "MT",
    "county": "Granite",
    "fips": "30039",
    "provider": "Montana State Library",
    "dataset": "Montana Parcels",
    "url": "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Montana cadastral framework, not a title search. The click is limited to this county and requests PARCELID only. Owner names exist on the layer and are not requested. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -113.407,
        "lat": 46.8245,
        "id": "46209906101010000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CountyName='Granite'"
  },
  {
    "state": "MT",
    "county": "Stillwater",
    "fips": "30095",
    "provider": "Montana State Library",
    "dataset": "Montana Parcels",
    "url": "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Montana cadastral framework, not a title search. The click is limited to this county and requests PARCELID only. Owner names exist on the layer and are not requested. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -109.6825,
        "lat": 45.404,
        "id": "32052918201020000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CountyName='Stillwater'"
  },
  {
    "state": "MT",
    "county": "Glacier",
    "fips": "30035",
    "provider": "Montana State Library",
    "dataset": "Montana Parcels",
    "url": "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Montana cadastral framework, not a title search. The click is limited to this county and requests PARCELID only. Owner names exist on the layer and are not requested. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -114.062,
        "lat": 48.9955,
        "id": "38493804101010000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CountyName='Glacier'"
  },
  {
    "state": "MT",
    "county": "Gallatin",
    "fips": "30031",
    "provider": "Montana State Library",
    "dataset": "Montana Parcels",
    "url": "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Montana cadastral framework, not a title search. The click is limited to this county and requests PARCELID only. Owner names exist on the layer and are not requested. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -111.712,
        "lat": 45.795,
        "id": "06100534101010000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CountyName='Gallatin'"
  },
  {
    "state": "MT",
    "county": "Jefferson",
    "fips": "30043",
    "provider": "Montana State Library",
    "dataset": "Montana Parcels",
    "url": "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Montana cadastral framework, not a title search. The click is limited to this county and requests PARCELID only. Owner names exist on the layer and are not requested. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -112.0265,
        "lat": 46.5685,
        "id": "51178506101250000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CountyName='Jefferson'"
  },
  {
    "state": "MT",
    "county": "Musselshell",
    "fips": "30065",
    "provider": "Montana State Library",
    "dataset": "Montana Parcels",
    "url": "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Montana cadastral framework, not a title search. The click is limited to this county and requests PARCELID only. Owner names exist on the layer and are not requested. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -108.8935,
        "lat": 46.7435,
        "id": "23203301101010000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CountyName='Musselshell'"
  },
  {
    "state": "MT",
    "county": "Phillips",
    "fips": "30071",
    "provider": "Montana State Library",
    "dataset": "Montana Parcels",
    "url": "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Montana cadastral framework, not a title search. The click is limited to this county and requests PARCELID only. Owner names exist on the layer and are not requested. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -108.3355,
        "lat": 47.9465,
        "id": "11364002401010000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CountyName='Phillips'"
  },
  {
    "state": "MT",
    "county": "Powder River",
    "fips": "30075",
    "provider": "Montana State Library",
    "dataset": "Montana Parcels",
    "url": "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Montana cadastral framework, not a title search. The click is limited to this county and requests PARCELID only. Owner names exist on the layer and are not requested. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -105.11,
        "lat": 45.229,
        "id": "09039616101010000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CountyName='Powder River'"
  },
  {
    "state": "MT",
    "county": "Powell",
    "fips": "30077",
    "provider": "Montana State Library",
    "dataset": "Montana Parcels",
    "url": "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Montana cadastral framework, not a title search. The click is limited to this county and requests PARCELID only. Owner names exist on the layer and are not requested. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -112.7305,
        "lat": 46.3645,
        "id": "28157816102010000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CountyName='Powell'"
  },
  {
    "state": "MT",
    "county": "Wibaux",
    "fips": "30109",
    "provider": "Montana State Library",
    "dataset": "Montana Parcels",
    "url": "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Montana cadastral framework, not a title search. The click is limited to this county and requests PARCELID only. Owner names exist on the layer and are not requested. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -104.051,
        "lat": 47.3915,
        "id": "52295722101010000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CountyName='Wibaux'"
  },
  {
    "state": "VA",
    "county": "Goochland",
    "fips": "51075",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -77.72,
        "lat": 37.606,
        "id": "7704-85-8161",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Goochland County'"
  },
  {
    "state": "VA",
    "county": "Bedford",
    "fips": "51019",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -79.675,
        "lat": 37.309,
        "id": "142 A 33A",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Bedford County'"
  },
  {
    "state": "VA",
    "county": "Staunton city",
    "fips": "51790",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -79.075,
        "lat": 38.136,
        "id": "1146953",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Staunton City'"
  },
  {
    "state": "VA",
    "county": "Montgomery",
    "fips": "51121",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -80.493,
        "lat": 36.991,
        "id": "000710",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Montgomery County'"
  },
  {
    "state": "VA",
    "county": "Bath",
    "fips": "51017",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -79.747,
        "lat": 38.17,
        "id": "22-0-10",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Bath County'"
  },
  {
    "state": "VA",
    "county": "Arlington",
    "fips": "51013",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -77.1195,
        "lat": 38.9325,
        "id": "03001007",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Arlington County'"
  },
  {
    "state": "VA",
    "county": "Buchanan",
    "fips": "51027",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -81.961,
        "lat": 37.281,
        "id": "2HH050009",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Buchanan County'"
  },
  {
    "state": "VA",
    "county": "Fauquier",
    "fips": "51061",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -77.749,
        "lat": 38.793,
        "id": "6997-62-8829-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Fauquier County'"
  },
  {
    "state": "VA",
    "county": "Falls Church city",
    "fips": "51610",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -77.18,
        "lat": 38.885,
        "id": "52-302-249",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Falls Church City'"
  },
  {
    "state": "VA",
    "county": "Lexington city",
    "fips": "51678",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -79.452,
        "lat": 37.787,
        "id": "15 1 1 68",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Lexington City'"
  },
  {
    "state": "VA",
    "county": "Manassas city",
    "fips": "51683",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -77.472,
        "lat": 38.73,
        "id": "7795-60-3376",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Manassas City'"
  },
  {
    "state": "VA",
    "county": "Prince George",
    "fips": "51149",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -77.2255,
        "lat": 37.3015,
        "id": "040(01)00-001-A",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Prince George County'"
  },
  {
    "state": "VA",
    "county": "Rockingham",
    "fips": "51165",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -78.958,
        "lat": 38.377,
        "id": "43000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Rockingham County'"
  },
  {
    "state": "VA",
    "county": "Richmond city",
    "fips": "51760",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -77.5505,
        "lat": 37.55775,
        "id": "312378",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Richmond City'"
  },
  {
    "state": "VA",
    "county": "Scott",
    "fips": "51169",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -82.712,
        "lat": 36.81,
        "id": "1423",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Scott County'"
  },
  {
    "state": "VA",
    "county": "Albemarle",
    "fips": "51003",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -78.442,
        "lat": 38.031,
        "id": "499629898965",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Albemarle County'"
  },
  {
    "state": "VA",
    "county": "Bristol city",
    "fips": "51520",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -82.124,
        "lat": 36.625,
        "id": "268 4 20",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Bristol City'"
  },
  {
    "state": "VA",
    "county": "Craig",
    "fips": "51045",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -80.223,
        "lat": 37.565,
        "id": "003734",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Craig County'"
  },
  {
    "state": "VA",
    "county": "Danville city",
    "fips": "51590",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -79.391,
        "lat": 36.542,
        "id": "75882",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Danville City'"
  },
  {
    "state": "VA",
    "county": "Franklin city",
    "fips": "51620",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -76.9465,
        "lat": 36.6785,
        "id": "103-209-29",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Franklin City'"
  },
  {
    "state": "VA",
    "county": "Fairfax",
    "fips": "51059",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -77.383,
        "lat": 39.0,
        "id": "232824",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Fairfax County'"
  },
  {
    "state": "VA",
    "county": "Lunenburg",
    "fips": "51111",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -78.41575,
        "lat": 37.00775,
        "id": "1373",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Lunenburg County'"
  },
  {
    "state": "VA",
    "county": "Loudoun",
    "fips": "51107",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -77.49,
        "lat": 39.005,
        "id": "089360732000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Loudoun County'"
  },
  {
    "state": "VA",
    "county": "Shenandoah",
    "fips": "51171",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -78.339,
        "lat": 39.099,
        "id": "3-((A))-37A",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Shenandoah County'"
  },
  {
    "state": "VA",
    "county": "Roanoke city",
    "fips": "51770",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -79.947,
        "lat": 37.272,
        "id": "1010829",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Roanoke City'"
  },
  {
    "state": "VA",
    "county": "Hampton city",
    "fips": "51650",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -76.434,
        "lat": 37.092,
        "id": "13002090",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Hampton City'"
  },
  {
    "state": "VA",
    "county": "Henrico",
    "fips": "51087",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -77.611,
        "lat": 37.71,
        "id": "740-783-6119",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Henrico County'"
  },
  {
    "state": "VA",
    "county": "Mecklenburg",
    "fips": "51117",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -78.14,
        "lat": 36.594,
        "id": "12578",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Mecklenburg County'"
  },
  {
    "state": "VA",
    "county": "Radford city",
    "fips": "51750",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -80.574,
        "lat": 37.122,
        "id": "15-(5)-BLK7-10",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Radford City'"
  },
  {
    "state": "VA",
    "county": "Surry",
    "fips": "51181",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -76.837,
        "lat": 37.132,
        "id": "1838",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Surry County'"
  },
  {
    "state": "VA",
    "county": "Salem city",
    "fips": "51775",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -80.089,
        "lat": 37.295,
        "id": "0623-04-786812",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Salem City'"
  },
  {
    "state": "VA",
    "county": "Culpeper",
    "fips": "51047",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -77.907,
        "lat": 38.696,
        "id": "3 1A",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Culpeper County'"
  },
  {
    "state": "VA",
    "county": "Williamsburg city",
    "fips": "51830",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -76.707,
        "lat": 37.263,
        "id": "2415.679.214",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Williamsburg City'"
  },
  {
    "state": "VA",
    "county": "Essex",
    "fips": "51057",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -76.7295,
        "lat": 37.78825,
        "id": "60C 2 24",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Essex County'"
  },
  {
    "state": "VA",
    "county": "Virginia Beach city",
    "fips": "51810",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -76.0575,
        "lat": 36.881,
        "id": "14987924680000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Virginia Beach City'"
  },
  {
    "state": "VA",
    "county": "Lynchburg city",
    "fips": "51680",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -79.214,
        "lat": 37.334,
        "id": "26606005",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Lynchburg City'"
  },
  {
    "state": "VA",
    "county": "Highland",
    "fips": "51091",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -79.583,
        "lat": 38.40775,
        "id": "31A3 A 25",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Highland County'"
  },
  {
    "state": "VA",
    "county": "Pulaski",
    "fips": "51155",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -80.618,
        "lat": 37.2375,
        "id": "003-1-17",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Pulaski County'"
  },
  {
    "state": "VA",
    "county": "Northumberland",
    "fips": "51133",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -76.4155,
        "lat": 37.9155,
        "id": "26(1)3A",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Northumberland County'"
  },
  {
    "state": "VA",
    "county": "Smyth",
    "fips": "51173",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -81.432,
        "lat": 36.84,
        "id": "48-A-106E",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Smyth County'"
  },
  {
    "state": "VA",
    "county": "Spotsylvania",
    "fips": "51177",
    "provider": "Virginia Geographic Information Network",
    "dataset": "Virginia Parcels",
    "url": "https://vginmaps.vdem.virginia.gov/arcgis/rest/services/VA_Base_Layers/VA_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Virginia Geographic Information Network statewide parcels, not the local assessor. The click is limited to this locality and requests PARCELID only. The layer is cartographic, not a survey. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -77.664,
        "lat": 38.311,
        "id": "7279-18-9644",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "LOCALITY='Spotsylvania County'"
  },
  {
    "state": "WA",
    "county": "Stevens",
    "fips": "53065",
    "provider": "Washington State Parcels Project",
    "dataset": "Current parcels",
    "url": "https://services.arcgis.com/jsIt88o09Q0r1j8h/ArcGIS/rest/services/Current_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID_NR"
    },
    "outFields": "PARCEL_ID_NR",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Washington State Parcels Project, not the county assessor. The click is limited to this county and requests PARCEL_ID_NR only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -117.906,
        "lat": 48.547,
        "id": "065-5555551",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "FIPS_NR='065'"
  },
  {
    "state": "WA",
    "county": "Jefferson",
    "fips": "53031",
    "provider": "Washington State Parcels Project",
    "dataset": "Current parcels",
    "url": "https://services.arcgis.com/jsIt88o09Q0r1j8h/ArcGIS/rest/services/Current_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID_NR"
    },
    "outFields": "PARCEL_ID_NR",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Washington State Parcels Project, not the county assessor. The click is limited to this county and requests PARCEL_ID_NR only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -123.7505,
        "lat": 47.528,
        "id": "031-408312001",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "FIPS_NR='031'"
  },
  {
    "state": "WA",
    "county": "Kittitas",
    "fips": "53037",
    "provider": "Washington State Parcels Project",
    "dataset": "Current parcels",
    "url": "https://services.arcgis.com/jsIt88o09Q0r1j8h/ArcGIS/rest/services/Current_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID_NR"
    },
    "outFields": "PARCEL_ID_NR",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Washington State Parcels Project, not the county assessor. The click is limited to this county and requests PARCEL_ID_NR only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -120.534,
        "lat": 47.016,
        "id": "037-18-18-25058-0001",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "FIPS_NR='037'"
  },
  {
    "state": "WA",
    "county": "Mason",
    "fips": "53045",
    "provider": "Washington State Parcels Project",
    "dataset": "Current parcels",
    "url": "https://services.arcgis.com/jsIt88o09Q0r1j8h/ArcGIS/rest/services/Current_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID_NR"
    },
    "outFields": "PARCEL_ID_NR",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Washington State Parcels Project, not the county assessor. The click is limited to this county and requests PARCEL_ID_NR only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -122.875,
        "lat": 47.165,
        "id": "045-219010090030",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "FIPS_NR='045'"
  },
  {
    "state": "WA",
    "county": "Pend Oreille",
    "fips": "53051",
    "provider": "Washington State Parcels Project",
    "dataset": "Current parcels",
    "url": "https://services.arcgis.com/jsIt88o09Q0r1j8h/ArcGIS/rest/services/Current_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID_NR"
    },
    "outFields": "PARCEL_ID_NR",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Washington State Parcels Project, not the county assessor. The click is limited to this county and requests PARCEL_ID_NR only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -117.317,
        "lat": 48.156,
        "id": "051-433125539034",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "FIPS_NR='051'"
  },
  {
    "state": "WA",
    "county": "Ferry",
    "fips": "53019",
    "provider": "Washington State Parcels Project",
    "dataset": "Current parcels",
    "url": "https://services.arcgis.com/jsIt88o09Q0r1j8h/ArcGIS/rest/services/Current_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID_NR"
    },
    "outFields": "PARCEL_ID_NR",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Washington State Parcels Project, not the county assessor. The click is limited to this county and requests PARCEL_ID_NR only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -118.226,
        "lat": 48.70225,
        "id": "019-63715340002000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "FIPS_NR='019'"
  },
  {
    "state": "WA",
    "county": "Island",
    "fips": "53029",
    "provider": "Washington State Parcels Project",
    "dataset": "Current parcels",
    "url": "https://services.arcgis.com/jsIt88o09Q0r1j8h/ArcGIS/rest/services/Current_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID_NR"
    },
    "outFields": "PARCEL_ID_NR",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Washington State Parcels Project, not the county assessor. The click is limited to this county and requests PARCEL_ID_NR only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -122.351,
        "lat": 47.96,
        "id": "029-R42931-379-0720",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "FIPS_NR='029'"
  },
  {
    "state": "WA",
    "county": "Grant",
    "fips": "53025",
    "provider": "Washington State Parcels Project",
    "dataset": "Current parcels",
    "url": "https://services.arcgis.com/jsIt88o09Q0r1j8h/ArcGIS/rest/services/Current_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID_NR"
    },
    "outFields": "PARCEL_ID_NR",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Washington State Parcels Project, not the county assessor. The click is limited to this county and requests PARCEL_ID_NR only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -120.005,
        "lat": 47.225,
        "id": "025-141347486",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "FIPS_NR='025'"
  },
  {
    "state": "WA",
    "county": "Douglas",
    "fips": "53017",
    "provider": "Washington State Parcels Project",
    "dataset": "Current parcels",
    "url": "https://services.arcgis.com/jsIt88o09Q0r1j8h/ArcGIS/rest/services/Current_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID_NR"
    },
    "outFields": "PARCEL_ID_NR",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Washington State Parcels Project, not the county assessor. The click is limited to this county and requests PARCEL_ID_NR only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -120.292,
        "lat": 47.424,
        "id": "017-40000005208",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "FIPS_NR='017'"
  },
  {
    "state": "WA",
    "county": "Columbia",
    "fips": "53013",
    "provider": "Washington State Parcels Project",
    "dataset": "Current parcels",
    "url": "https://services.arcgis.com/jsIt88o09Q0r1j8h/ArcGIS/rest/services/Current_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID_NR"
    },
    "outFields": "PARCEL_ID_NR",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Washington State Parcels Project, not the county assessor. The click is limited to this county and requests PARCEL_ID_NR only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -117.992,
        "lat": 46.264,
        "id": "013-2009380131100",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "FIPS_NR='013'"
  },
  {
    "state": "WA",
    "county": "Garfield",
    "fips": "53023",
    "provider": "Washington State Parcels Project",
    "dataset": "Current parcels",
    "url": "https://services.arcgis.com/jsIt88o09Q0r1j8h/ArcGIS/rest/services/Current_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID_NR"
    },
    "outFields": "PARCEL_ID_NR",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Washington State Parcels Project, not the county assessor. The click is limited to this county and requests PARCEL_ID_NR only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -117.598,
        "lat": 46.474,
        "id": "023-10500600122400000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "FIPS_NR='023'"
  },
  {
    "state": "WA",
    "county": "Klickitat",
    "fips": "53039",
    "provider": "Washington State Parcels Project",
    "dataset": "Current parcels",
    "url": "https://services.arcgis.com/jsIt88o09Q0r1j8h/ArcGIS/rest/services/Current_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID_NR"
    },
    "outFields": "PARCEL_ID_NR",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Washington State Parcels Project, not the county assessor. The click is limited to this county and requests PARCEL_ID_NR only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -121.139,
        "lat": 45.884,
        "id": "039-05132600000100",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "FIPS_NR='039'"
  },
  {
    "state": "NC",
    "county": "Northampton",
    "fips": "37131",
    "provider": "NC OneMap",
    "dataset": "Public parcel endpoint",
    "url": "https://services8.arcgis.com/eJ9GuQwMsO1iIOw1/ArcGIS/rest/services/parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parno"
    },
    "outFields": "parno",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Public NC OneMap parcel endpoint. A county count on 2026-10-11 returned only Northampton, so this is not statewide coverage. The click requests parno only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "partial",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -77.281,
        "lat": 36.28,
        "id": "5902-65-5327",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "cntyname='Northampton'"
  },
  {
    "state": "NJ",
    "county": "Atlantic",
    "fips": "34001",
    "provider": "New Jersey Office of GIS",
    "dataset": "Statewide parcel composite",
    "url": "https://services2.arcgis.com/XVOqAjTOJ5P6ngMu/arcgis/rest/services/Parcels_Composite_NJ_WM/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PAMS_PIN"
    },
    "outFields": "PAMS_PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "New Jersey GIS statewide parcel composite, not the county assessor. The click is limited to this county and requests PAMS_PIN only. Owner name is not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -74.482,
        "lat": 39.434,
        "id": "0101_21_29",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "COUNTY='ATLANTIC'"
  },
  {
    "state": "NJ",
    "county": "Bergen",
    "fips": "34003",
    "provider": "New Jersey Office of GIS",
    "dataset": "Statewide parcel composite",
    "url": "https://services2.arcgis.com/XVOqAjTOJ5P6ngMu/arcgis/rest/services/Parcels_Composite_NJ_WM/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PAMS_PIN"
    },
    "outFields": "PAMS_PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "New Jersey GIS statewide parcel composite, not the county assessor. The click is limited to this county and requests PAMS_PIN only. Owner name is not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -74.131,
        "lat": 41.041,
        "id": "0201_404_4",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "COUNTY='BERGEN'"
  },
  {
    "state": "NJ",
    "county": "Ocean",
    "fips": "34029",
    "provider": "New Jersey Office of GIS",
    "dataset": "Statewide parcel composite",
    "url": "https://services2.arcgis.com/XVOqAjTOJ5P6ngMu/arcgis/rest/services/Parcels_Composite_NJ_WM/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PAMS_PIN"
    },
    "outFields": "PAMS_PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "New Jersey GIS statewide parcel composite, not the county assessor. The click is limited to this county and requests PAMS_PIN only. Owner name is not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -74.113,
        "lat": 39.743,
        "id": "1502_49_21",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "COUNTY='OCEAN'"
  },
  {
    "state": "NJ",
    "county": "Passaic",
    "fips": "34031",
    "provider": "New Jersey Office of GIS",
    "dataset": "Statewide parcel composite",
    "url": "https://services2.arcgis.com/XVOqAjTOJ5P6ngMu/arcgis/rest/services/Parcels_Composite_NJ_WM/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PAMS_PIN"
    },
    "outFields": "PAMS_PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "New Jersey GIS statewide parcel composite, not the county assessor. The click is limited to this county and requests PAMS_PIN only. Owner name is not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -74.342,
        "lat": 41.018,
        "id": "1601_3037_32",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "COUNTY='PASSAIC'"
  },
  {
    "state": "NJ",
    "county": "Morris",
    "fips": "34027",
    "provider": "New Jersey Office of GIS",
    "dataset": "Statewide parcel composite",
    "url": "https://services2.arcgis.com/XVOqAjTOJ5P6ngMu/arcgis/rest/services/Parcels_Composite_NJ_WM/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PAMS_PIN"
    },
    "outFields": "PAMS_PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "New Jersey GIS statewide parcel composite, not the county assessor. The click is limited to this county and requests PAMS_PIN only. Owner name is not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -74.728,
        "lat": 40.721,
        "id": "1407_1_1",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "COUNTY='MORRIS'"
  },
  {
    "state": "NJ",
    "county": "Monmouth",
    "fips": "34025",
    "provider": "New Jersey Office of GIS",
    "dataset": "Statewide parcel composite",
    "url": "https://services2.arcgis.com/XVOqAjTOJ5P6ngMu/arcgis/rest/services/Parcels_Composite_NJ_WM/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PAMS_PIN"
    },
    "outFields": "PAMS_PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "New Jersey GIS statewide parcel composite, not the county assessor. The click is limited to this county and requests PAMS_PIN only. Owner name is not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -74.2155,
        "lat": 40.4125,
        "id": "1301_14_55",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "COUNTY='MONMOUTH'"
  },
  {
    "state": "NJ",
    "county": "Salem",
    "fips": "34033",
    "provider": "New Jersey Office of GIS",
    "dataset": "Statewide parcel composite",
    "url": "https://services2.arcgis.com/XVOqAjTOJ5P6ngMu/arcgis/rest/services/Parcels_Composite_NJ_WM/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PAMS_PIN"
    },
    "outFields": "PAMS_PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "New Jersey GIS statewide parcel composite, not the county assessor. The click is limited to this county and requests PAMS_PIN only. Owner name is not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -75.3625,
        "lat": 39.5625,
        "id": "1701_22_46",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "COUNTY='SALEM'"
  },
  {
    "state": "NJ",
    "county": "Cape May",
    "fips": "34009",
    "provider": "New Jersey Office of GIS",
    "dataset": "Statewide parcel composite",
    "url": "https://services2.arcgis.com/XVOqAjTOJ5P6ngMu/arcgis/rest/services/Parcels_Composite_NJ_WM/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PAMS_PIN"
    },
    "outFields": "PAMS_PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "New Jersey GIS statewide parcel composite, not the county assessor. The click is limited to this county and requests PAMS_PIN only. Owner name is not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -74.944,
        "lat": 38.938,
        "id": "0505_841_36",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "COUNTY='CAPE MAY'"
  },
  {
    "state": "NJ",
    "county": "Union",
    "fips": "34039",
    "provider": "New Jersey Office of GIS",
    "dataset": "Statewide parcel composite",
    "url": "https://services2.arcgis.com/XVOqAjTOJ5P6ngMu/arcgis/rest/services/Parcels_Composite_NJ_WM/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PAMS_PIN"
    },
    "outFields": "PAMS_PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "New Jersey GIS statewide parcel composite, not the county assessor. The click is limited to this county and requests PAMS_PIN only. Owner name is not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -74.441,
        "lat": 40.673,
        "id": "2001_1714_33",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "COUNTY='UNION'"
  },
  {
    "state": "NJ",
    "county": "Hunterdon",
    "fips": "34019",
    "provider": "New Jersey Office of GIS",
    "dataset": "Statewide parcel composite",
    "url": "https://services2.arcgis.com/XVOqAjTOJ5P6ngMu/arcgis/rest/services/Parcels_Composite_NJ_WM/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PAMS_PIN"
    },
    "outFields": "PAMS_PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "New Jersey GIS statewide parcel composite, not the county assessor. The click is limited to this county and requests PAMS_PIN only. Owner name is not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -74.859,
        "lat": 40.505,
        "id": "1009_41_26",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "COUNTY='HUNTERDON'"
  },
  {
    "state": "NJ",
    "county": "Essex",
    "fips": "34013",
    "provider": "New Jersey Office of GIS",
    "dataset": "Statewide parcel composite",
    "url": "https://services2.arcgis.com/XVOqAjTOJ5P6ngMu/arcgis/rest/services/Parcels_Composite_NJ_WM/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PAMS_PIN"
    },
    "outFields": "PAMS_PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "New Jersey GIS statewide parcel composite, not the county assessor. The click is limited to this county and requests PAMS_PIN only. Owner name is not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -74.269,
        "lat": 40.841,
        "id": "0703_14_4",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "COUNTY='ESSEX'"
  },
  {
    "state": "NJ",
    "county": "Camden",
    "fips": "34007",
    "provider": "New Jersey Office of GIS",
    "dataset": "Statewide parcel composite",
    "url": "https://services2.arcgis.com/XVOqAjTOJ5P6ngMu/arcgis/rest/services/Parcels_Composite_NJ_WM/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PAMS_PIN"
    },
    "outFields": "PAMS_PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "New Jersey GIS statewide parcel composite, not the county assessor. The click is limited to this county and requests PAMS_PIN only. Owner name is not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -75.074,
        "lat": 39.882,
        "id": "0401_130_6",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "COUNTY='CAMDEN'"
  },
  {
    "state": "NJ",
    "county": "Cumberland",
    "fips": "34011",
    "provider": "New Jersey Office of GIS",
    "dataset": "Statewide parcel composite",
    "url": "https://services2.arcgis.com/XVOqAjTOJ5P6ngMu/arcgis/rest/services/Parcels_Composite_NJ_WM/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PAMS_PIN"
    },
    "outFields": "PAMS_PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "New Jersey GIS statewide parcel composite, not the county assessor. The click is limited to this county and requests PAMS_PIN only. Owner name is not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -75.04,
        "lat": 39.245,
        "id": "0602_245_17",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "COUNTY='CUMBERLAND'"
  },
  {
    "state": "NJ",
    "county": "Somerset",
    "fips": "34035",
    "provider": "New Jersey Office of GIS",
    "dataset": "Statewide parcel composite",
    "url": "https://services2.arcgis.com/XVOqAjTOJ5P6ngMu/arcgis/rest/services/Parcels_Composite_NJ_WM/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PAMS_PIN"
    },
    "outFields": "PAMS_PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "New Jersey GIS statewide parcel composite, not the county assessor. The click is limited to this county and requests PAMS_PIN only. Owner name is not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -74.67,
        "lat": 40.517,
        "id": "1810_150.04_17",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "COUNTY='SOMERSET'"
  },
  {
    "state": "MT",
    "county": "Hill",
    "fips": "30041",
    "provider": "Montana State Library",
    "dataset": "Montana Parcels",
    "url": "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Montana cadastral framework, not a title search. The click is limited to this county and requests PARCELID only. Owner names exist on the layer and are not requested. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -110.7375,
        "lat": 48.99825,
        "id": "12496406101010000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CountyName='Hill'"
  },
  {
    "state": "MT",
    "county": "Chouteau",
    "fips": "30015",
    "provider": "Montana State Library",
    "dataset": "Montana Parcels",
    "url": "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Montana cadastral framework, not a title search. The click is limited to this county and requests PARCELID only. Owner names exist on the layer and are not requested. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -110.6145,
        "lat": 48.2995,
        "id": "19411006101010000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CountyName='Chouteau'"
  },
  {
    "state": "MT",
    "county": "Lewis and Clark",
    "fips": "30049",
    "provider": "Montana State Library",
    "dataset": "Montana Parcels",
    "url": "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Montana cadastral framework, not a title search. The click is limited to this county and requests PARCELID only. Owner names exist on the layer and are not requested. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -112.112,
        "lat": 46.601,
        "id": "05188728102200000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CountyName='Lewis and Clark'"
  },
  {
    "state": "MT",
    "county": "Richland",
    "fips": "30083",
    "provider": "Montana State Library",
    "dataset": "Montana Parcels",
    "url": "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Montana cadastral framework, not a title search. The click is limited to this county and requests PARCELID only. Owner names exist on the layer and are not requested. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -104.837,
        "lat": 48.092,
        "id": "27392214101010000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CountyName='Richland'"
  },
  {
    "state": "MT",
    "county": "Prairie",
    "fips": "30079",
    "provider": "Montana State Library",
    "dataset": "Montana Parcels",
    "url": "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Montana cadastral framework, not a title search. The click is limited to this county and requests PARCELID only. Owner names exist on the layer and are not requested. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -105.9915,
        "lat": 47.0985,
        "id": "45260235101010000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CountyName='Prairie'"
  },
  {
    "state": "MT",
    "county": "Valley",
    "fips": "30105",
    "provider": "Montana State Library",
    "dataset": "Montana Parcels",
    "url": "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Montana cadastral framework, not a title search. The click is limited to this county and requests PARCELID only. Owner names exist on the layer and are not requested. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -106.134,
        "lat": 48.999,
        "id": "20499901201010000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CountyName='Valley'"
  },
  {
    "state": "WI",
    "county": "Buffalo",
    "fips": "55011",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -91.7585,
        "lat": 44.584,
        "id": "026-00149-0000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='BUFFALO'"
  },
  {
    "state": "WI",
    "county": "Clark",
    "fips": "55019",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -90.53325,
        "lat": 44.754,
        "id": "032.0147.000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='CLARK'"
  },
  {
    "state": "WI",
    "county": "Marquette",
    "fips": "55077",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -89.3155,
        "lat": 43.7895,
        "id": "012007330000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='MARQUETTE'"
  },
  {
    "state": "WI",
    "county": "Milwaukee",
    "fips": "55079",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -88.065,
        "lat": 43.1935,
        "id": "0009999000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='MILWAUKEE'"
  },
  {
    "state": "WI",
    "county": "Adams",
    "fips": "55001",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -89.8135,
        "lat": 43.70825,
        "id": "008002310010",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='ADAMS'"
  },
  {
    "state": "WI",
    "county": "Barron",
    "fips": "55005",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -91.8485,
        "lat": 45.46675,
        "id": "042330019000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='BARRON'"
  },
  {
    "state": "WI",
    "county": "Trempealeau",
    "fips": "55121",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -91.4105,
        "lat": 44.511,
        "id": "002008210000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='TREMPEALEAU'"
  },
  {
    "state": "WI",
    "county": "Vilas",
    "fips": "55125",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -89.22425,
        "lat": 45.875,
        "id": "14-557-0001",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='VILAS'"
  },
  {
    "state": "WI",
    "county": "Columbia",
    "fips": "55021",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -89.368,
        "lat": 43.379,
        "id": "2283054",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='COLUMBIA'"
  },
  {
    "state": "WI",
    "county": "Dane",
    "fips": "55025",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -89.721,
        "lat": 42.945,
        "id": "060636498310",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='DANE'"
  },
  {
    "state": "WI",
    "county": "Waushara",
    "fips": "55137",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -88.8935,
        "lat": 44.066,
        "id": "002-00113-0110",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='WAUSHARA'"
  },
  {
    "state": "WI",
    "county": "Jackson",
    "fips": "55053",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -91.0565,
        "lat": 44.595,
        "id": "02200050000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='JACKSON'"
  },
  {
    "state": "WI",
    "county": "Langlade",
    "fips": "55067",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -89.3065,
        "lat": 45.2015,
        "id": "0020001",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='LANGLADE'"
  },
  {
    "state": "WI",
    "county": "Kewaunee",
    "fips": "55061",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -87.655,
        "lat": 44.54625,
        "id": "31 012 13.124",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='KEWAUNEE'"
  },
  {
    "state": "WI",
    "county": "Marinette",
    "fips": "55075",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -87.939,
        "lat": 45.539,
        "id": "002-00001.000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='MARINETTE'"
  },
  {
    "state": "WI",
    "county": "Monroe",
    "fips": "55081",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -90.811,
        "lat": 43.806,
        "id": "032-00009-1000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='MONROE'"
  },
  {
    "state": "WI",
    "county": "Marathon",
    "fips": "55073",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -90.3025,
        "lat": 44.955,
        "id": "20129023110997",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='MARATHON'"
  },
  {
    "state": "WI",
    "county": "Polk",
    "fips": "55095",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -92.7875,
        "lat": 45.634,
        "id": "046009530000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='POLK'"
  },
  {
    "state": "WI",
    "county": "Racine",
    "fips": "55101",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -88.301,
        "lat": 42.611,
        "id": "002021919021020",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='RACINE'"
  },
  {
    "state": "WI",
    "county": "Sauk",
    "fips": "55111",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -90.036,
        "lat": 43.44,
        "id": "149-0031-00000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='SAUK'"
  },
  {
    "state": "WI",
    "county": "Rock",
    "fips": "55105",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -89.25,
        "lat": 42.5845,
        "id": "002 001001",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='ROCK'"
  },
  {
    "state": "WI",
    "county": "Vernon",
    "fips": "55123",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -90.85525,
        "lat": 43.7065,
        "id": "004-00244-0000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='VERNON'"
  },
  {
    "state": "WI",
    "county": "Shawano",
    "fips": "55115",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -89.0755,
        "lat": 44.92725,
        "id": "002082100000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='SHAWANO'"
  },
  {
    "state": "WI",
    "county": "Waukesha",
    "fips": "55133",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -88.398,
        "lat": 43.057,
        "id": "DELC0798942",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='WAUKESHA'"
  },
  {
    "state": "WI",
    "county": "Sheboygan",
    "fips": "55117",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -88.0585,
        "lat": 43.8025,
        "id": "59002000200",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='SHEBOYGAN'"
  },
  {
    "state": "WI",
    "county": "Ashland",
    "fips": "55003",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -90.615,
        "lat": 46.8635,
        "id": "014-00332-0400",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='ASHLAND'"
  },
  {
    "state": "WI",
    "county": "Dunn",
    "fips": "55033",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -91.654,
        "lat": 45.028,
        "id": "1700222911011100001",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='DUNN'"
  },
  {
    "state": "WI",
    "county": "Fond du Lac",
    "fips": "55039",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -88.413,
        "lat": 43.7975,
        "id": "FDL1517013100100",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='FOND DU LAC'"
  },
  {
    "state": "WI",
    "county": "Manitowoc",
    "fips": "55071",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -87.661,
        "lat": 44.049,
        "id": "00900700100102",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='MANITOWOC'"
  },
  {
    "state": "WI",
    "county": "Waupaca",
    "fips": "55135",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -89.12325,
        "lat": 44.5915,
        "id": "07 35 44 1",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='WAUPACA'"
  },
  {
    "state": "WI",
    "county": "Oneida",
    "fips": "55085",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -89.6785,
        "lat": 45.7265,
        "id": "CA-1",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='ONEIDA'"
  },
  {
    "state": "WI",
    "county": "Ozaukee",
    "fips": "55089",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -87.806,
        "lat": 43.542,
        "id": "010010100300",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='OZAUKEE'"
  },
  {
    "state": "WI",
    "county": "Pepin",
    "fips": "55091",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -91.6525,
        "lat": 44.682,
        "id": "002000010000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='PEPIN'"
  },
  {
    "state": "WI",
    "county": "Richland",
    "fips": "55103",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -90.2645,
        "lat": 43.389,
        "id": "03233240000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='RICHLAND'"
  },
  {
    "state": "WI",
    "county": "Price",
    "fips": "55099",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -90.455,
        "lat": 45.669,
        "id": "006107704010",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='PRICE'"
  },
  {
    "state": "WI",
    "county": "Bayfield",
    "fips": "55007",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -91.0535,
        "lat": 46.156,
        "id": "24959",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='BAYFIELD'"
  },
  {
    "state": "WI",
    "county": "Taylor",
    "fips": "55119",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -90.7845,
        "lat": 45.20525,
        "id": "002000010000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='TAYLOR'"
  },
  {
    "state": "WI",
    "county": "Calumet",
    "fips": "55015",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -88.0765,
        "lat": 44.1295,
        "id": "10000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='CALUMET'"
  },
  {
    "state": "WI",
    "county": "Washburn",
    "fips": "55129",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -91.558,
        "lat": 45.657,
        "id": "65-106-2-37-10-25-5 15-577-770000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='WASHBURN'"
  },
  {
    "state": "WI",
    "county": "Crawford",
    "fips": "55023",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -90.7865,
        "lat": 43.306,
        "id": "004-0686-0000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='CRAWFORD'"
  },
  {
    "state": "WI",
    "county": "Door",
    "fips": "55029",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -87.196,
        "lat": 45.068,
        "id": "0020122302711",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='DOOR'"
  },
  {
    "state": "WI",
    "county": "Douglas",
    "fips": "55031",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -92.037,
        "lat": 46.699,
        "id": "018010047400",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='DOUGLAS'"
  },
  {
    "state": "WI",
    "county": "Wood",
    "fips": "55141",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -89.9665,
        "lat": 44.5945,
        "id": "0100004",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='WOOD'"
  },
  {
    "state": "WI",
    "county": "Iron",
    "fips": "55051",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -90.4075,
        "lat": 46.37525,
        "id": "002-0402-0000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='IRON'"
  },
  {
    "state": "WI",
    "county": "Kenosha",
    "fips": "55059",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -87.837,
        "lat": 42.577,
        "id": "01-122-01-177-022",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='KENOSHA'"
  },
  {
    "state": "WI",
    "county": "Burnett",
    "fips": "55013",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -92.5335,
        "lat": 45.6605,
        "id": "07-034-2-37-18-25-4 01-000-012000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='BURNETT'"
  },
  {
    "state": "WI",
    "county": "Oconto",
    "fips": "55083",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -88.022,
        "lat": 44.76425,
        "id": "002010100221A",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='OCONTO'"
  },
  {
    "state": "WI",
    "county": "Green Lake",
    "fips": "55047",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -89.0605,
        "lat": 43.66025,
        "id": "012005180000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='GREEN LAKE'"
  },
  {
    "state": "WI",
    "county": "Dodge",
    "fips": "55027",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -88.4215,
        "lat": 43.28,
        "id": "00209170111000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='DODGE'"
  },
  {
    "state": "WI",
    "county": "Eau Claire",
    "fips": "55035",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -91.489,
        "lat": 44.81,
        "id": "221020296",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='EAU CLAIRE'"
  },
  {
    "state": "WI",
    "county": "Florence",
    "fips": "55037",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -88.1965,
        "lat": 45.876,
        "id": "004-00519-0090",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='FLORENCE'"
  },
  {
    "state": "WI",
    "county": "Walworth",
    "fips": "55127",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -88.3345,
        "lat": 42.8395,
        "id": "#VM 00015",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='WALWORTH'"
  },
  {
    "state": "WI",
    "county": "Portage",
    "fips": "55097",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -89.305,
        "lat": 44.244,
        "id": "008211033-11.04",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='PORTAGE'"
  },
  {
    "state": "WI",
    "county": "Iowa",
    "fips": "55049",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -90.4235,
        "lat": 42.81325,
        "id": "016-0941",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='IOWA'"
  },
  {
    "state": "WI",
    "county": "Forest",
    "fips": "55041",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -88.83,
        "lat": 45.9825,
        "id": "002000010000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='FOREST'"
  },
  {
    "state": "WI",
    "county": "La Crosse",
    "fips": "55063",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -91.2885,
        "lat": 44.0025,
        "id": "14-5260-0",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='LA CROSSE'"
  },
  {
    "state": "WI",
    "county": "Lafayette",
    "fips": "55065",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -89.839,
        "lat": 42.769,
        "id": "002.0001.1100",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='LAFAYETTE'"
  },
  {
    "state": "WI",
    "county": "Lincoln",
    "fips": "55069",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -89.5535,
        "lat": 45.3735,
        "id": "00233070119999",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='LINCOLN'"
  },
  {
    "state": "MD",
    "county": "Allegany",
    "fips": "24001",
    "provider": "Maryland Department of Planning",
    "dataset": "Parcel boundaries",
    "url": "https://mdgeodata.md.gov/imap/rest/services/PlanningCadastre/MD_ParcelBoundaries/MapServer",
    "queryLayer": 0,
    "fields": {
      "apn": "ACCTID"
    },
    "outFields": "ACCTID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Maryland parcel boundaries from the Department of Planning, not the county assessor. The click is limited to this jurisdiction and requests ACCTID only. Placeholder account values are ignored. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -78.7355,
        "lat": 39.69075,
        "id": "0134004617",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "JURSCODE='ALLE' AND ACCTID NOT IN ('UNK','ROW','GCE')"
  },
  {
    "state": "WI",
    "county": "Washington",
    "fips": "55131",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -88.181,
        "lat": 43.452,
        "id": "291 11190122131",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='WASHINGTON'"
  },
  {
    "state": "MD",
    "county": "Anne Arundel",
    "fips": "24003",
    "provider": "Maryland Department of Planning",
    "dataset": "Parcel boundaries",
    "url": "https://mdgeodata.md.gov/imap/rest/services/PlanningCadastre/MD_ParcelBoundaries/MapServer",
    "queryLayer": 0,
    "fields": {
      "apn": "ACCTID"
    },
    "outFields": "ACCTID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Maryland parcel boundaries from the Department of Planning, not the county assessor. The click is limited to this jurisdiction and requests ACCTID only. Placeholder account values are ignored. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -76.706,
        "lat": 39.092,
        "id": "020481590236156",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "JURSCODE='ANNE' AND ACCTID NOT IN ('UNK','ROW','GCE')"
  },
  {
    "state": "WI",
    "county": "Rusk",
    "fips": "55107",
    "provider": "Wisconsin Statewide Parcel Initiative",
    "dataset": "V12 statewide parcels",
    "url": "https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCELID"
    },
    "outFields": "PARCELID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Wisconsin Statewide Parcel Initiative, not the county assessor. The click is limited to this county and requests PARCELID only. The state documents unmapped gaps, so a miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -91.1255,
        "lat": 45.294,
        "id": "046006910005",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "CONAME='RUSK'"
  },
  {
    "state": "MD",
    "county": "Caroline",
    "fips": "24011",
    "provider": "Maryland Department of Planning",
    "dataset": "Parcel boundaries",
    "url": "https://mdgeodata.md.gov/imap/rest/services/PlanningCadastre/MD_ParcelBoundaries/MapServer",
    "queryLayer": 0,
    "fields": {
      "apn": "ACCTID"
    },
    "outFields": "ACCTID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Maryland parcel boundaries from the Department of Planning, not the county assessor. The click is limited to this jurisdiction and requests ACCTID only. Placeholder account values are ignored. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -75.885,
        "lat": 38.949,
        "id": "0607007817",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "JURSCODE='CARO' AND ACCTID NOT IN ('UNK','ROW','GCE')"
  },
  {
    "state": "MD",
    "county": "Baltimore",
    "fips": "24005",
    "provider": "Maryland Department of Planning",
    "dataset": "Parcel boundaries",
    "url": "https://mdgeodata.md.gov/imap/rest/services/PlanningCadastre/MD_ParcelBoundaries/MapServer",
    "queryLayer": 0,
    "fields": {
      "apn": "ACCTID"
    },
    "outFields": "ACCTID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Maryland parcel boundaries from the Department of Planning, not the county assessor. The click is limited to this jurisdiction and requests ACCTID only. Placeholder account values are ignored. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -76.5925,
        "lat": 39.50275,
        "id": "04101002057590",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "JURSCODE='BACO' AND ACCTID NOT IN ('UNK','ROW','GCE')"
  },
  {
    "state": "MD",
    "county": "Carroll",
    "fips": "24013",
    "provider": "Maryland Department of Planning",
    "dataset": "Parcel boundaries",
    "url": "https://mdgeodata.md.gov/imap/rest/services/PlanningCadastre/MD_ParcelBoundaries/MapServer",
    "queryLayer": 0,
    "fields": {
      "apn": "ACCTID"
    },
    "outFields": "ACCTID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Maryland parcel boundaries from the Department of Planning, not the county assessor. The click is limited to this jurisdiction and requests ACCTID only. Placeholder account values are ignored. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -76.8555,
        "lat": 39.6305,
        "id": "0708431542",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "JURSCODE='CARR' AND ACCTID NOT IN ('UNK','ROW','GCE')"
  },
  {
    "state": "MD",
    "county": "Kent",
    "fips": "24029",
    "provider": "Maryland Department of Planning",
    "dataset": "Parcel boundaries",
    "url": "https://mdgeodata.md.gov/imap/rest/services/PlanningCadastre/MD_ParcelBoundaries/MapServer",
    "queryLayer": 0,
    "fields": {
      "apn": "ACCTID"
    },
    "outFields": "ACCTID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Maryland parcel boundaries from the Department of Planning, not the county assessor. The click is limited to this jurisdiction and requests ACCTID only. Placeholder account values are ignored. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -76.011,
        "lat": 39.2835,
        "id": "1502010259",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "JURSCODE='KENT' AND ACCTID NOT IN ('UNK','ROW','GCE')"
  },
  {
    "state": "MD",
    "county": "Frederick",
    "fips": "24021",
    "provider": "Maryland Department of Planning",
    "dataset": "Parcel boundaries",
    "url": "https://mdgeodata.md.gov/imap/rest/services/PlanningCadastre/MD_ParcelBoundaries/MapServer",
    "queryLayer": 0,
    "fields": {
      "apn": "ACCTID"
    },
    "outFields": "ACCTID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Maryland parcel boundaries from the Department of Planning, not the county assessor. The click is limited to this jurisdiction and requests ACCTID only. Placeholder account values are ignored. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -77.3985,
        "lat": 39.4495,
        "id": "1102590358",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "JURSCODE='FRED' AND ACCTID NOT IN ('UNK','ROW','GCE')"
  },
  {
    "state": "MD",
    "county": "Harford",
    "fips": "24025",
    "provider": "Maryland Department of Planning",
    "dataset": "Parcel boundaries",
    "url": "https://mdgeodata.md.gov/imap/rest/services/PlanningCadastre/MD_ParcelBoundaries/MapServer",
    "queryLayer": 0,
    "fields": {
      "apn": "ACCTID"
    },
    "outFields": "ACCTID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Maryland parcel boundaries from the Department of Planning, not the county assessor. The click is limited to this jurisdiction and requests ACCTID only. Placeholder account values are ignored. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -76.351,
        "lat": 39.546,
        "id": "C14033",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "JURSCODE='HARF' AND ACCTID NOT IN ('UNK','ROW','GCE')"
  },
  {
    "state": "MD",
    "county": "Queen Anne's",
    "fips": "24035",
    "provider": "Maryland Department of Planning",
    "dataset": "Parcel boundaries",
    "url": "https://mdgeodata.md.gov/imap/rest/services/PlanningCadastre/MD_ParcelBoundaries/MapServer",
    "queryLayer": 0,
    "fields": {
      "apn": "ACCTID"
    },
    "outFields": "ACCTID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Maryland parcel boundaries from the Department of Planning, not the county assessor. The click is limited to this jurisdiction and requests ACCTID only. Placeholder account values are ignored. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -76.359,
        "lat": 38.894,
        "id": "1804028643",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "JURSCODE='QUEE' AND ACCTID NOT IN ('UNK','ROW','GCE')"
  },
  {
    "state": "MD",
    "county": "Howard",
    "fips": "24027",
    "provider": "Maryland Department of Planning",
    "dataset": "Parcel boundaries",
    "url": "https://mdgeodata.md.gov/imap/rest/services/PlanningCadastre/MD_ParcelBoundaries/MapServer",
    "queryLayer": 0,
    "fields": {
      "apn": "ACCTID"
    },
    "outFields": "ACCTID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Maryland parcel boundaries from the Department of Planning, not the county assessor. The click is limited to this jurisdiction and requests ACCTID only. Placeholder account values are ignored. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -76.7245,
        "lat": 39.2125,
        "id": "1401157434",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "JURSCODE='HOWA' AND ACCTID NOT IN ('UNK','ROW','GCE')"
  },
  {
    "state": "MD",
    "county": "Montgomery",
    "fips": "24031",
    "provider": "Maryland Department of Planning",
    "dataset": "Parcel boundaries",
    "url": "https://mdgeodata.md.gov/imap/rest/services/PlanningCadastre/MD_ParcelBoundaries/MapServer",
    "queryLayer": 0,
    "fields": {
      "apn": "ACCTID"
    },
    "outFields": "ACCTID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Maryland parcel boundaries from the Department of Planning, not the county assessor. The click is limited to this jurisdiction and requests ACCTID only. Placeholder account values are ignored. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -77.068,
        "lat": 39.031,
        "id": "161303382102",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "JURSCODE='MONT' AND ACCTID NOT IN ('UNK','ROW','GCE')"
  },
  {
    "state": "MA",
    "county": "Barnstable",
    "fips": "25001",
    "provider": "MassGIS",
    "dataset": "Level 3 property tax parcels",
    "url": "https://services1.arcgis.com/hGdibHYSPO59RG1h/arcgis/rest/services/Massachusetts_Property_Tax_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "MAP_PAR_ID"
    },
    "outFields": "MAP_PAR_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "MassGIS Level 3 property-tax parcels, not the municipal assessor. One parcel in this county returned MAP_PAR_ID and a polygon. Owner fields are not requested. A miss is not proof a town is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -70.4555,
        "lat": 41.604,
        "id": "005_017",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "MD",
    "county": "Talbot",
    "fips": "24041",
    "provider": "Maryland Department of Planning",
    "dataset": "Parcel boundaries",
    "url": "https://mdgeodata.md.gov/imap/rest/services/PlanningCadastre/MD_ParcelBoundaries/MapServer",
    "queryLayer": 0,
    "fields": {
      "apn": "ACCTID"
    },
    "outFields": "ACCTID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Maryland parcel boundaries from the Department of Planning, not the county assessor. The click is limited to this jurisdiction and requests ACCTID only. Placeholder account values are ignored. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -76.073,
        "lat": 38.783,
        "id": "2101002805",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "JURSCODE='TALB' AND ACCTID NOT IN ('UNK','ROW','GCE')"
  },
  {
    "state": "MA",
    "county": "Berkshire",
    "fips": "25003",
    "provider": "MassGIS",
    "dataset": "Level 3 property tax parcels",
    "url": "https://services1.arcgis.com/hGdibHYSPO59RG1h/arcgis/rest/services/Massachusetts_Property_Tax_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "MAP_PAR_ID"
    },
    "outFields": "MAP_PAR_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "MassGIS Level 3 property-tax parcels, not the municipal assessor. One parcel in this county returned MAP_PAR_ID and a polygon. Owner fields are not requested. A miss is not proof a town is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -73.323,
        "lat": 42.4295,
        "id": "B040002101",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "MA",
    "county": "Bristol",
    "fips": "25005",
    "provider": "MassGIS",
    "dataset": "Level 3 property tax parcels",
    "url": "https://services1.arcgis.com/hGdibHYSPO59RG1h/arcgis/rest/services/Massachusetts_Property_Tax_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "MAP_PAR_ID"
    },
    "outFields": "MAP_PAR_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "MassGIS Level 3 property-tax parcels, not the municipal assessor. One parcel in this county returned MAP_PAR_ID and a polygon. Owner fields are not requested. A miss is not proof a town is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -71.1325,
        "lat": 41.8835,
        "id": "89-62",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "MA",
    "county": "Dukes",
    "fips": "25007",
    "provider": "MassGIS",
    "dataset": "Level 3 property tax parcels",
    "url": "https://services1.arcgis.com/hGdibHYSPO59RG1h/arcgis/rest/services/Massachusetts_Property_Tax_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "MAP_PAR_ID"
    },
    "outFields": "MAP_PAR_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "MassGIS Level 3 property-tax parcels, not the municipal assessor. One parcel in this county returned MAP_PAR_ID and a polygon. Owner fields are not requested. A miss is not proof a town is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -70.576,
        "lat": 41.406,
        "id": "10_47",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "MA",
    "county": "Essex",
    "fips": "25009",
    "provider": "MassGIS",
    "dataset": "Level 3 property tax parcels",
    "url": "https://services1.arcgis.com/hGdibHYSPO59RG1h/arcgis/rest/services/Massachusetts_Property_Tax_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "MAP_PAR_ID"
    },
    "outFields": "MAP_PAR_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "MassGIS Level 3 property-tax parcels, not the municipal assessor. One parcel in this county returned MAP_PAR_ID and a polygon. Owner fields are not requested. A miss is not proof a town is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -70.904,
        "lat": 42.528,
        "id": "27-0083",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "MA",
    "county": "Franklin",
    "fips": "25011",
    "provider": "MassGIS",
    "dataset": "Level 3 property tax parcels",
    "url": "https://services1.arcgis.com/hGdibHYSPO59RG1h/arcgis/rest/services/Massachusetts_Property_Tax_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "MAP_PAR_ID"
    },
    "outFields": "MAP_PAR_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "MassGIS Level 3 property-tax parcels, not the municipal assessor. One parcel in this county returned MAP_PAR_ID and a polygon. Owner fields are not requested. A miss is not proof a town is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -72.5795,
        "lat": 42.61175,
        "id": "130-7C-0",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "MA",
    "county": "Hampshire",
    "fips": "25015",
    "provider": "MassGIS",
    "dataset": "Level 3 property tax parcels",
    "url": "https://services1.arcgis.com/hGdibHYSPO59RG1h/arcgis/rest/services/Massachusetts_Property_Tax_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "MAP_PAR_ID"
    },
    "outFields": "MAP_PAR_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "MassGIS Level 3 property-tax parcels, not the municipal assessor. One parcel in this county returned MAP_PAR_ID and a polygon. Owner fields are not requested. A miss is not proof a town is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -72.65,
        "lat": 42.336,
        "id": "18C-057-001",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "MA",
    "county": "Nantucket",
    "fips": "25019",
    "provider": "MassGIS",
    "dataset": "Level 3 property tax parcels",
    "url": "https://services1.arcgis.com/hGdibHYSPO59RG1h/arcgis/rest/services/Massachusetts_Property_Tax_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "MAP_PAR_ID"
    },
    "outFields": "MAP_PAR_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "MassGIS Level 3 property-tax parcels, not the municipal assessor. One parcel in this county returned MAP_PAR_ID and a polygon. Owner fields are not requested. A miss is not proof a town is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -69.997,
        "lat": 41.328,
        "id": "11 21",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "MA",
    "county": "Norfolk",
    "fips": "25021",
    "provider": "MassGIS",
    "dataset": "Level 3 property tax parcels",
    "url": "https://services1.arcgis.com/hGdibHYSPO59RG1h/arcgis/rest/services/Massachusetts_Property_Tax_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "MAP_PAR_ID"
    },
    "outFields": "MAP_PAR_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "MassGIS Level 3 property-tax parcels, not the municipal assessor. One parcel in this county returned MAP_PAR_ID and a polygon. Owner fields are not requested. A miss is not proof a town is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -71.165,
        "lat": 42.247,
        "id": "110-71",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "MA",
    "county": "Plymouth",
    "fips": "25023",
    "provider": "MassGIS",
    "dataset": "Level 3 property tax parcels",
    "url": "https://services1.arcgis.com/hGdibHYSPO59RG1h/arcgis/rest/services/Massachusetts_Property_Tax_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "MAP_PAR_ID"
    },
    "outFields": "MAP_PAR_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "MassGIS Level 3 property-tax parcels, not the municipal assessor. One parcel in this county returned MAP_PAR_ID and a polygon. Owner fields are not requested. A miss is not proof a town is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -70.533,
        "lat": 41.866,
        "id": "050-000-004F-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "MA",
    "county": "Suffolk",
    "fips": "25025",
    "provider": "MassGIS",
    "dataset": "Level 3 property tax parcels",
    "url": "https://services1.arcgis.com/hGdibHYSPO59RG1h/arcgis/rest/services/Massachusetts_Property_Tax_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "MAP_PAR_ID"
    },
    "outFields": "MAP_PAR_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "MassGIS Level 3 property-tax parcels, not the municipal assessor. One parcel in this county returned MAP_PAR_ID and a polygon. Owner fields are not requested. A miss is not proof a town is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -71.098,
        "lat": 42.337,
        "id": "0401828000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "OH",
    "county": "Fairfield",
    "fips": "39045",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -82.638,
        "lat": 39.729,
        "id": "0531304400",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Fairfield'"
  },
  {
    "state": "OH",
    "county": "Clark",
    "fips": "39023",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -83.697,
        "lat": 39.923,
        "id": "1300800035304013",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Clark'"
  },
  {
    "state": "OH",
    "county": "Auglaize",
    "fips": "39011",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -84.371,
        "lat": 40.437,
        "id": "C10-08",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Auglaize'"
  },
  {
    "state": "OH",
    "county": "Tuscarawas",
    "fips": "39157",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -81.287,
        "lat": 40.499,
        "id": "62-01897-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Tuscarawas'"
  },
  {
    "state": "OH",
    "county": "Hamilton",
    "fips": "39061",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -84.52775,
        "lat": 39.1105,
        "id": "1340004005200",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Hamilton'"
  },
  {
    "state": "OH",
    "county": "Geauga",
    "fips": "39055",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -81.354,
        "lat": 41.4145,
        "id": "03-Open06",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Geauga'"
  },
  {
    "state": "OH",
    "county": "Monroe",
    "fips": "39111",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -80.874,
        "lat": 39.668,
        "id": "150300930000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Monroe'"
  },
  {
    "state": "OH",
    "county": "Gallia",
    "fips": "39053",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -82.421,
        "lat": 38.8235,
        "id": "02100111302",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Gallia'"
  },
  {
    "state": "OH",
    "county": "Lake",
    "fips": "39085",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -81.44075,
        "lat": 41.6155,
        "id": "27A0060000CL0",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Lake'"
  },
  {
    "state": "OH",
    "county": "Holmes",
    "fips": "39075",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -81.983,
        "lat": 40.5,
        "id": "0900444006",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Holmes'"
  },
  {
    "state": "OH",
    "county": "Hocking",
    "fips": "39073",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -82.494,
        "lat": 39.487,
        "id": "020008910100",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Hocking'"
  },
  {
    "state": "OH",
    "county": "Huron",
    "fips": "39077",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -82.672,
        "lat": 41.1105,
        "id": "140020010500100",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Huron'"
  },
  {
    "state": "OH",
    "county": "Summit",
    "fips": "39153",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -81.5155,
        "lat": 41.3215,
        "id": "3303338",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Summit'"
  },
  {
    "state": "OH",
    "county": "Mercer",
    "fips": "39107",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -84.5735,
        "lat": 40.412,
        "id": "1124500001",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Mercer'"
  },
  {
    "state": "OH",
    "county": "Morrow",
    "fips": "39117",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -82.721,
        "lat": 40.609,
        "id": "E13-001-00-139-05",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Morrow'"
  },
  {
    "state": "OH",
    "county": "Cuyahoga",
    "fips": "39035",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -81.588,
        "lat": 41.446,
        "id": "13811037",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Cuyahoga'"
  },
  {
    "state": "OH",
    "county": "Lucas",
    "fips": "39095",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -83.8425,
        "lat": 41.6985,
        "id": "5907447",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Lucas'"
  },
  {
    "state": "OH",
    "county": "Sandusky",
    "fips": "39143",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -83.321,
        "lat": 41.39,
        "id": "279700000000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Sandusky'"
  },
  {
    "state": "OH",
    "county": "Shelby",
    "fips": "39149",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -84.162,
        "lat": 40.286,
        "id": "1836133011",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Shelby'"
  },
  {
    "state": "OH",
    "county": "Butler",
    "fips": "39017",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -84.552,
        "lat": 39.401,
        "id": "P6431021000059",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Butler'"
  },
  {
    "state": "OH",
    "county": "Allen",
    "fips": "39003",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -84.054,
        "lat": 40.788,
        "id": "37160101003601",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Allen'"
  },
  {
    "state": "OH",
    "county": "Greene",
    "fips": "39057",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -83.942,
        "lat": 39.67,
        "id": "M40000100130034100",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Greene'"
  },
  {
    "state": "OH",
    "county": "Hardin",
    "fips": "39065",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -83.617,
        "lat": 40.64,
        "id": "060501660000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Hardin'"
  },
  {
    "state": "OH",
    "county": "Meigs",
    "fips": "39105",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -81.8515,
        "lat": 39.1475,
        "id": "070020041",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Meigs'"
  },
  {
    "state": "OH",
    "county": "Knox",
    "fips": "39083",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -82.6965,
        "lat": 40.302,
        "id": "18ROW",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Knox'"
  },
  {
    "state": "OH",
    "county": "Stark",
    "fips": "39151",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -81.468,
        "lat": 40.8,
        "id": "10000279",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Stark'"
  },
  {
    "state": "OH",
    "county": "Morgan",
    "fips": "39115",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -81.857,
        "lat": 39.645,
        "id": "0800001500",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Morgan'"
  },
  {
    "state": "OH",
    "county": "Wyandot",
    "fips": "39175",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -83.381,
        "lat": 40.816,
        "id": "201125010000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Wyandot'"
  },
  {
    "state": "OH",
    "county": "Muskingum",
    "fips": "39119",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -82.0045,
        "lat": 40.138,
        "id": "99-96-10-02-053",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Muskingum'"
  },
  {
    "state": "OH",
    "county": "Fayette",
    "fips": "39047",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -83.4935,
        "lat": 39.552,
        "id": "19001000001300",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Fayette'"
  },
  {
    "state": "OH",
    "county": "Delaware",
    "fips": "39041",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -83.1955,
        "lat": 40.397,
        "id": "10040001072000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Delaware'"
  },
  {
    "state": "OH",
    "county": "Coshocton",
    "fips": "39031",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -81.863,
        "lat": 40.258,
        "id": "0430000590500",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Coshocton'"
  },
  {
    "state": "OH",
    "county": "Pickaway",
    "fips": "39129",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -83.0515,
        "lat": 39.7605,
        "id": "L27-0-001-00-408-00",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Pickaway'"
  },
  {
    "state": "OH",
    "county": "Ross",
    "fips": "39141",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -82.9885,
        "lat": 39.3315,
        "id": "305133999000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Ross'"
  },
  {
    "state": "OH",
    "county": "Licking",
    "fips": "39089",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -82.758,
        "lat": 40.109,
        "id": "09511155800000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Licking'"
  },
  {
    "state": "OH",
    "county": "Seneca",
    "fips": "39147",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -83.4155,
        "lat": 40.9925,
        "id": "B10000108520300",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Seneca'"
  },
  {
    "state": "OH",
    "county": "Athens",
    "fips": "39009",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -82.206,
        "lat": 39.227,
        "id": "H02005",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Athens'"
  },
  {
    "state": "OH",
    "county": "Belmont",
    "fips": "39013",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -80.84,
        "lat": 39.87,
        "id": "52-90010.000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Belmont'"
  },
  {
    "state": "OH",
    "county": "Clermont",
    "fips": "39025",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -84.283,
        "lat": 39.1505,
        "id": "393109C381.",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Clermont'"
  },
  {
    "state": "OH",
    "county": "Wayne",
    "fips": "39169",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -81.71,
        "lat": 40.697,
        "id": "39-00660.000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Wayne'"
  },
  {
    "state": "OH",
    "county": "Clinton",
    "fips": "39027",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -83.991,
        "lat": 39.293,
        "id": "220101501C05800",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Clinton'"
  },
  {
    "state": "OH",
    "county": "Crawford",
    "fips": "39033",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -82.883,
        "lat": 40.943,
        "id": "100001726001",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Crawford'"
  },
  {
    "state": "OH",
    "county": "Defiance",
    "fips": "39039",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -84.488,
        "lat": 41.366,
        "id": "L150026000502",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Defiance'"
  },
  {
    "state": "OH",
    "county": "Henry",
    "fips": "39069",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -83.895,
        "lat": 41.206,
        "id": "400095430860",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Henry'"
  },
  {
    "state": "OH",
    "county": "Highland",
    "fips": "39071",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -83.772,
        "lat": 39.271,
        "id": "40400019901",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Highland'"
  },
  {
    "state": "OH",
    "county": "Logan",
    "fips": "39091",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -83.761,
        "lat": 40.354,
        "id": "170911622000000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Logan'"
  },
  {
    "state": "OH",
    "county": "Medina",
    "fips": "39103",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -81.7945,
        "lat": 41.2595,
        "id": "00318B",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Medina'"
  },
  {
    "state": "OH",
    "county": "Jefferson",
    "fips": "39081",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -80.626,
        "lat": 40.507,
        "id": "17-00000-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Jefferson'"
  },
  {
    "state": "OH",
    "county": "Noble",
    "fips": "39121",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -81.274,
        "lat": 39.9335,
        "id": "010021459000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Noble'"
  },
  {
    "state": "OH",
    "county": "Montgomery",
    "fips": "39113",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -84.215,
        "lat": 39.801,
        "id": "E20 17004 0101",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Montgomery'"
  },
  {
    "state": "OH",
    "county": "Miami",
    "fips": "39109",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -84.286,
        "lat": 40.149,
        "id": "N44-076512",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Miami'"
  },
  {
    "state": "OH",
    "county": "Pike",
    "fips": "39131",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -83.281,
        "lat": 39.022,
        "id": "993010000000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Pike'"
  },
  {
    "state": "OH",
    "county": "Portage",
    "fips": "39133",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -81.355,
        "lat": 41.161,
        "id": "17-031-21-00-047-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Portage'"
  },
  {
    "state": "OH",
    "county": "Scioto",
    "fips": "39145",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -83.2315,
        "lat": 38.792,
        "id": "030760000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Scioto'"
  },
  {
    "state": "OH",
    "county": "Richland",
    "fips": "39139",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -82.667,
        "lat": 40.874,
        "id": "046-08-223-15-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Richland'"
  },
  {
    "state": "OH",
    "county": "Van Wert",
    "fips": "39161",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -84.569,
        "lat": 40.855,
        "id": "160307560000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Van Wert'"
  },
  {
    "state": "OH",
    "county": "Lorain",
    "fips": "39093",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -81.902,
        "lat": 41.34,
        "id": "1200022630002",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Lorain'"
  },
  {
    "state": "IN",
    "county": "Benton",
    "fips": "18007",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -87.1305,
        "lat": 40.734,
        "id": "04-01-05-200-002.002-005",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18007'"
  },
  {
    "state": "IN",
    "county": "Boone",
    "fips": "18011",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -86.601,
        "lat": 40.027,
        "id": "0605020000010000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18011'"
  },
  {
    "state": "IN",
    "county": "Clay",
    "fips": "18021",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -87.128,
        "lat": 39.52,
        "id": "11-02-36-400-419.001-002",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18021'"
  },
  {
    "state": "IN",
    "county": "Floyd",
    "fips": "18043",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -85.9145,
        "lat": 38.197,
        "id": "22-01-00-100-017.001-001",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18043'"
  },
  {
    "state": "IN",
    "county": "Greene",
    "fips": "18055",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -86.9475,
        "lat": 39.0275,
        "id": "2808220000070051",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18055'"
  },
  {
    "state": "IN",
    "county": "Jackson",
    "fips": "18071",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -86.202,
        "lat": 38.967,
        "id": "36-63-09-600-006.007-014",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18071'"
  },
  {
    "state": "IN",
    "county": "Lake",
    "fips": "18089",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -87.449,
        "lat": 41.418,
        "id": "45-15-10-104-009.000-015",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18089'"
  },
  {
    "state": "IN",
    "county": "Owen",
    "fips": "18119",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -86.6405,
        "lat": 39.4225,
        "id": "6008047102050001018",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18119'"
  },
  {
    "state": "IN",
    "county": "Randolph",
    "fips": "18135",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -85.203,
        "lat": 40.133,
        "id": "68-15-05-100-010.100-010",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18135'"
  },
  {
    "state": "IN",
    "county": "Ripley",
    "fips": "18137",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -85.296,
        "lat": 39.228,
        "id": "69-05-16-400-006.001-016",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18137'"
  },
  {
    "state": "IN",
    "county": "Shelby",
    "fips": "18145",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -85.6545,
        "lat": 39.6045,
        "id": "73080540001100009",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18145'"
  },
  {
    "state": "IN",
    "county": "Steuben",
    "fips": "18151",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -85.044,
        "lat": 41.655,
        "id": "76-06-21-220-1UN.K00-011",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18151'"
  },
  {
    "state": "IN",
    "county": "Switzerland",
    "fips": "18155",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -85.072,
        "lat": 38.795,
        "id": "78-08-35-400-0OO.000-003",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18155'"
  },
  {
    "state": "IN",
    "county": "Vermillion",
    "fips": "18165",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -87.4995,
        "lat": 40.0835,
        "id": "83-02-28-240-040.000-009",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18165'"
  },
  {
    "state": "IN",
    "county": "Wells",
    "fips": "18179",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -85.177,
        "lat": 40.859,
        "id": "90-00-00-117-200.000-008",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18179'"
  },
  {
    "state": "IN",
    "county": "Brown",
    "fips": "18013",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -86.295,
        "lat": 39.266,
        "id": "0703200221000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18013'"
  },
  {
    "state": "OH",
    "county": "Union",
    "fips": "39159",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -83.3685,
        "lat": 40.226,
        "id": "2900021401100",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Union'"
  },
  {
    "state": "IN",
    "county": "Grant",
    "fips": "18053",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -85.50575,
        "lat": 40.6455,
        "id": "27-01-04-800-004.000-029",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18053'"
  },
  {
    "state": "IN",
    "county": "Jennings",
    "fips": "18079",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -85.521,
        "lat": 39.0035,
        "id": "40-08-33-400-017.001-002",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18079'"
  },
  {
    "state": "IN",
    "county": "Martin",
    "fips": "18101",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -86.797,
        "lat": 38.6705,
        "id": "001-005",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18101'"
  },
  {
    "state": "IN",
    "county": "Monroe",
    "fips": "18105",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -86.512,
        "lat": 39.238,
        "id": "5305033000070",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18105'"
  },
  {
    "state": "IN",
    "county": "Ohio",
    "fips": "18115",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -85.041,
        "lat": 38.958,
        "id": "58-05-06-200-001.004-002",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18115'"
  },
  {
    "state": "IN",
    "county": "Orange",
    "fips": "18117",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -86.451,
        "lat": 38.657,
        "id": "59-02-31-200-101.000-010",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18117'"
  },
  {
    "state": "IN",
    "county": "Posey",
    "fips": "18129",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -87.9455,
        "lat": 37.9035,
        "id": "651623100009017",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18129'"
  },
  {
    "state": "IN",
    "county": "Starke",
    "fips": "18149",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -86.723,
        "lat": 41.353,
        "id": "75-01-35-200-004.000-015",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18149'"
  },
  {
    "state": "IN",
    "county": "Warren",
    "fips": "18171",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -87.126,
        "lat": 40.466,
        "id": "86-01-05-300-021.000-007",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18171'"
  },
  {
    "state": "IN",
    "county": "White",
    "fips": "18181",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -86.926,
        "lat": 40.605,
        "id": "910110001499015",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18181'"
  },
  {
    "state": "OH",
    "county": "Warren",
    "fips": "39165",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -84.36175,
        "lat": 39.56025,
        "id": "02063220110",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Warren'"
  },
  {
    "state": "IN",
    "county": "LaPorte",
    "fips": "18091",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -86.70975,
        "lat": 41.6005,
        "id": "46-10-01-182-NPN.000-043",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18091'"
  },
  {
    "state": "IN",
    "county": "Fulton",
    "fips": "18049",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -86.0285,
        "lat": 41.0545,
        "id": "25-08-13-100-004.014-002",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18049'"
  },
  {
    "state": "IN",
    "county": "Hancock",
    "fips": "18059",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -85.871,
        "lat": 39.719,
        "id": "002-RR",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18059'"
  },
  {
    "state": "IN",
    "county": "Franklin",
    "fips": "18047",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -85.199,
        "lat": 39.489,
        "id": "24-02-16-300-001.001-010",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18047'"
  },
  {
    "state": "IN",
    "county": "Montgomery",
    "fips": "18107",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -86.9075,
        "lat": 39.8675,
        "id": "5415400009001020",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18107'"
  },
  {
    "state": "IN",
    "county": "Pike",
    "fips": "18125",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -87.15775,
        "lat": 38.482,
        "id": "63-03-26-300-023.000-002",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18125'"
  },
  {
    "state": "IN",
    "county": "Tipton",
    "fips": "18159",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -85.9575,
        "lat": 40.2885,
        "id": "80-10-09-500-008.000-007",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18159'"
  },
  {
    "state": "IN",
    "county": "Whitley",
    "fips": "18183",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -85.4425,
        "lat": 41.0855,
        "id": "92-10-06-000-999.000-006",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18183'"
  },
  {
    "state": "IN",
    "county": "Clark",
    "fips": "18019",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -85.8355,
        "lat": 38.447,
        "id": "10020100088000026",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18019'"
  },
  {
    "state": "IN",
    "county": "Johnson",
    "fips": "18081",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -86.142,
        "lat": 39.559,
        "id": "4104240140710000040",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18081'"
  },
  {
    "state": "IN",
    "county": "Marshall",
    "fips": "18099",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -86.342,
        "lat": 41.326,
        "id": "9993",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18099'"
  },
  {
    "state": "IN",
    "county": "Parke",
    "fips": "18121",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -87.315,
        "lat": 39.8595,
        "id": "61-06-05-000-117.000-012",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18121'"
  },
  {
    "state": "IN",
    "county": "Sullivan",
    "fips": "18153",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -87.30975,
        "lat": 39.1085,
        "id": "77082800007001001",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18153'"
  },
  {
    "state": "IN",
    "county": "Daviess",
    "fips": "18027",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -86.9505,
        "lat": 38.733,
        "id": "14-07-34-400-022.004-014",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18027'"
  },
  {
    "state": "IN",
    "county": "Carroll",
    "fips": "18015",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -86.751,
        "lat": 40.659,
        "id": "08-04-34-000-132.000-011",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18015'"
  },
  {
    "state": "IN",
    "county": "Dearborn",
    "fips": "18029",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -84.8225,
        "lat": 39.30025,
        "id": "15-01-01-100-012.002-006",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18029'"
  },
  {
    "state": "IN",
    "county": "Dubois",
    "fips": "18037",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -86.941,
        "lat": 38.46825,
        "id": "19-03-35-300-013.001-011",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18037'"
  },
  {
    "state": "IN",
    "county": "Elkhart",
    "fips": "18039",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -85.819,
        "lat": 41.504,
        "id": "20-15-10-176-010.000-018",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18039'"
  },
  {
    "state": "IN",
    "county": "Jefferson",
    "fips": "18077",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -85.3765,
        "lat": 38.7365,
        "id": "39-13-02-123-004.000-007",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18077'"
  },
  {
    "state": "IN",
    "county": "Kosciusko",
    "fips": "18085",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -85.835,
        "lat": 41.283,
        "id": "43-07-28-300-089.000-017",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18085'"
  },
  {
    "state": "IN",
    "county": "Madison",
    "fips": "18095",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -85.851,
        "lat": 39.98,
        "id": "481528403",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18095'"
  },
  {
    "state": "IN",
    "county": "Morgan",
    "fips": "18109",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -86.37,
        "lat": 39.62,
        "id": "55-01-25-451-001.000-005",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18109'"
  },
  {
    "state": "IN",
    "county": "Marion",
    "fips": "18097",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -86.124,
        "lat": 39.898,
        "id": "49-02-19-107-055.000-800",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18097'"
  },
  {
    "state": "IN",
    "county": "Newton",
    "fips": "18111",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -87.35,
        "lat": 41.141,
        "id": "564130801801",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18111'"
  },
  {
    "state": "IN",
    "county": "Perry",
    "fips": "18123",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -86.739,
        "lat": 37.963,
        "id": "62-13-28-0Ff-277.001-006",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18123'"
  },
  {
    "state": "IN",
    "county": "Noble",
    "fips": "18113",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -85.35,
        "lat": 41.479,
        "id": "57-04-22-100-999.000-010",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18113'"
  },
  {
    "state": "IN",
    "county": "Pulaski",
    "fips": "18131",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -86.569,
        "lat": 41.017,
        "id": "66-08-30-400-076.001-006",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18131'"
  },
  {
    "state": "IN",
    "county": "Scott",
    "fips": "18143",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -85.801,
        "lat": 38.754,
        "id": "720325420131001000003",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18143'"
  },
  {
    "state": "IN",
    "county": "Spencer",
    "fips": "18147",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -86.99025,
        "lat": 38.13625,
        "id": "74-02-29-300-005.000-001",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18147'"
  },
  {
    "state": "IN",
    "county": "Putnam",
    "fips": "18133",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -86.7135,
        "lat": 39.8265,
        "id": "67-01-14-800-011.002-009",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18133'"
  },
  {
    "state": "IN",
    "county": "Vanderburgh",
    "fips": "18163",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -87.661,
        "lat": 37.8525,
        "id": "82-11-05-010-060.004-032",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18163'"
  },
  {
    "state": "IN",
    "county": "Warrick",
    "fips": "18173",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -87.328,
        "lat": 38.001,
        "id": "87131720502200002",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18173'"
  },
  {
    "state": "IN",
    "county": "Washington",
    "fips": "18175",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -86.098,
        "lat": 38.6835,
        "id": "88-34-20-000-012.004-012",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18175'"
  },
  {
    "state": "IN",
    "county": "Wayne",
    "fips": "18177",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -84.888,
        "lat": 39.889,
        "id": "89-16-09-300-106.000-029",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18177'"
  },
  {
    "state": "MN",
    "county": "Lyon",
    "fips": "27083",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -96.062,
        "lat": 44.596,
        "id": "30-104005-1",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Lyon'"
  },
  {
    "state": "MN",
    "county": "Aitkin",
    "fips": "27001",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -93.2725,
        "lat": 46.7495,
        "id": "29-0-019809",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Aitkin'"
  },
  {
    "state": "MN",
    "county": "Big Stone",
    "fips": "27011",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -96.4515,
        "lat": 45.2895,
        "id": "22-1659-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Big Stone'"
  },
  {
    "state": "MN",
    "county": "Cook",
    "fips": "27031",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -90.3225,
        "lat": 48.0505,
        "id": "53-404-1100",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Cook'"
  },
  {
    "state": "MN",
    "county": "Fillmore",
    "fips": "27045",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -92.1035,
        "lat": 43.5185,
        "id": "210209040",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Fillmore'"
  },
  {
    "state": "MN",
    "county": "Lake of the Woods",
    "fips": "27077",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -94.5785,
        "lat": 48.7145,
        "id": "615201060",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Lake of the Woods'"
  },
  {
    "state": "IN",
    "county": "St. Joseph",
    "fips": "18141",
    "provider": "Indiana Geographic Information Office",
    "dataset": "Parcel boundaries 2025",
    "url": "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_2025/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "parcel_id"
    },
    "outFields": "parcel_id",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Indiana Geographic Information Office 2025 parcel harvest, not each county assessor. The click is limited to this county and requests parcel_id only. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -86.323,
        "lat": 41.76,
        "id": "71-03-08-251-001.000-008",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "county_fips='18141'"
  },
  {
    "state": "MN",
    "county": "Mille Lacs",
    "fips": "27095",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -93.5175,
        "lat": 46.22,
        "id": "05-008-4600",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Mille Lacs'"
  },
  {
    "state": "MN",
    "county": "Norman",
    "fips": "27107",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -96.264,
        "lat": 47.259,
        "id": "32-8720000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Norman'"
  },
  {
    "state": "MN",
    "county": "Otter Tail",
    "fips": "27111",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -96.1635,
        "lat": 46.405,
        "id": "45000240141002",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Otter Tail'"
  },
  {
    "state": "MN",
    "county": "Pennington",
    "fips": "27113",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -96.208,
        "lat": 48.131,
        "id": "1106101110",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Pennington'"
  },
  {
    "state": "MN",
    "county": "Steele",
    "fips": "27147",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -93.091,
        "lat": 43.961,
        "id": "040271001",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Steele'"
  },
  {
    "state": "MN",
    "county": "Rice",
    "fips": "27131",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -93.14,
        "lat": 44.447,
        "id": "22-05-3-25-006",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Rice'"
  },
  {
    "state": "MN",
    "county": "Wabasha",
    "fips": "27157",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -91.976,
        "lat": 44.359,
        "id": "R05-00875-00",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Wabasha'"
  },
  {
    "state": "MN",
    "county": "Wright",
    "fips": "27171",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -93.949,
        "lat": 45.061,
        "id": "116036006050",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Wright'"
  },
  {
    "state": "MN",
    "county": "Carver",
    "fips": "27019",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -93.9155,
        "lat": 44.78025,
        "id": "583850340",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Carver'"
  },
  {
    "state": "MN",
    "county": "Clearwater",
    "fips": "27029",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -95.292,
        "lat": 47.275,
        "id": "10-301-0020",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Clearwater'"
  },
  {
    "state": "MN",
    "county": "Jackson",
    "fips": "27063",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -95.015,
        "lat": 43.637,
        "id": "050151600",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Jackson'"
  },
  {
    "state": "MN",
    "county": "Lake",
    "fips": "27075",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -91.752,
        "lat": 47.2695,
        "id": "25-5511-08010",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Lake'"
  },
  {
    "state": "MN",
    "county": "Marshall",
    "fips": "27089",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -96.498,
        "lat": 48.475,
        "id": "22-0156-001",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Marshall'"
  },
  {
    "state": "MN",
    "county": "McLeod",
    "fips": "27085",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -94.355,
        "lat": 44.867,
        "id": "235200140",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='McLeod'"
  },
  {
    "state": "MN",
    "county": "Murray",
    "fips": "27101",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -95.7165,
        "lat": 43.974,
        "id": "20-024-0040",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Murray'"
  },
  {
    "state": "MN",
    "county": "Renville",
    "fips": "27129",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -94.79175,
        "lat": 44.808,
        "id": "20-01620-00",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Renville'"
  },
  {
    "state": "MN",
    "county": "Pipestone",
    "fips": "27117",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -96.24,
        "lat": 43.877,
        "id": "20-027-0100",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Pipestone'"
  },
  {
    "state": "MN",
    "county": "Stearns",
    "fips": "27145",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -94.959,
        "lat": 45.739,
        "id": "94-59219-0000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Stearns'"
  },
  {
    "state": "MN",
    "county": "St. Louis",
    "fips": "27137",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -92.233,
        "lat": 46.67,
        "id": "010-1790-00840",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='St. Louis'"
  },
  {
    "state": "MN",
    "county": "Traverse",
    "fips": "27155",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -96.8215,
        "lat": 45.598,
        "id": "05-0192000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Traverse'"
  },
  {
    "state": "MN",
    "county": "Yellow Medicine",
    "fips": "27173",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -95.681,
        "lat": 44.898,
        "id": "17-200-0214",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Yellow Medicine'"
  },
  {
    "state": "MN",
    "county": "Wilkin",
    "fips": "27167",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -96.308,
        "lat": 46.167,
        "id": "04-010-0600",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Wilkin'"
  },
  {
    "state": "MN",
    "county": "Chisago",
    "fips": "27025",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -92.9895,
        "lat": 45.5225,
        "id": "110090600",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Chisago'"
  },
  {
    "state": "MN",
    "county": "Grant",
    "fips": "27051",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -95.817,
        "lat": 45.787,
        "id": "06-0155-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Grant'"
  },
  {
    "state": "MN",
    "county": "Hennepin",
    "fips": "27053",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -93.2815,
        "lat": 44.9275,
        "id": "1002824240171",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Hennepin'"
  },
  {
    "state": "MN",
    "county": "Pope",
    "fips": "27121",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -95.2485,
        "lat": 45.57525,
        "id": "26-0023-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Pope'"
  },
  {
    "state": "MN",
    "county": "Ramsey",
    "fips": "27123",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -93.176,
        "lat": 44.928,
        "id": "092823130133",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Ramsey'"
  },
  {
    "state": "MN",
    "county": "Carlton",
    "fips": "27017",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -92.7845,
        "lat": 46.429,
        "id": "63-022-3490",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Carlton'"
  },
  {
    "state": "MN",
    "county": "Cass",
    "fips": "27021",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -94.6005,
        "lat": 47.01,
        "id": "38-028-1100",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Cass'"
  },
  {
    "state": "MN",
    "county": "Chippewa",
    "fips": "27023",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -95.373,
        "lat": 44.956,
        "id": "30-030-0210",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Chippewa'"
  },
  {
    "state": "MN",
    "county": "Clay",
    "fips": "27027",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -96.771,
        "lat": 46.834,
        "id": "58-491-0140",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Clay'"
  },
  {
    "state": "MN",
    "county": "Crow Wing",
    "fips": "27035",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -94.1705,
        "lat": 46.721,
        "id": "92360510",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Crow Wing'"
  },
  {
    "state": "MN",
    "county": "Isanti",
    "fips": "27059",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -93.252,
        "lat": 45.498,
        "id": "16-104-1550",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Isanti'"
  },
  {
    "state": "MN",
    "county": "Itasca",
    "fips": "27061",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -93.166,
        "lat": 47.378,
        "id": "95-440-1344",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Itasca'"
  },
  {
    "state": "MN",
    "county": "Polk",
    "fips": "27119",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -96.6395,
        "lat": 47.9725,
        "id": "19-00153-00",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Polk'"
  },
  {
    "state": "MN",
    "county": "Sherburne",
    "fips": "27141",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -93.523,
        "lat": 45.431,
        "id": "30-00404-0125",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Sherburne'"
  },
  {
    "state": "MN",
    "county": "Stevens",
    "fips": "27149",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -96.1865,
        "lat": 45.5585,
        "id": "140049100",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Stevens'"
  },
  {
    "state": "OH",
    "county": "Washington",
    "fips": "39167",
    "provider": "Ohio statewide parcel layer",
    "dataset": "Local parcel ids",
    "url": "https://services2.arcgis.com/MlJ0G8iWUyC7jAmu/arcgis/rest/services/OhioStatewidePacels_full_view/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "LocalParcelID"
    },
    "outFields": "LocalParcelID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Ohio statewide parcel layer, not the county auditor. The click is limited to this county and requests LocalParcelID only. Mailing fields exist and are not requested. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -81.568,
        "lat": 39.272,
        "id": "080099999002",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County='Washington'"
  },
  {
    "state": "MN",
    "county": "Waseca",
    "fips": "27161",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -93.5085,
        "lat": 44.064,
        "id": "177050040",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Waseca'"
  },
  {
    "state": "MN",
    "county": "Benton",
    "fips": "27009",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -94.122,
        "lat": 45.573,
        "id": "170174000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Benton'"
  },
  {
    "state": "MN",
    "county": "Dakota",
    "fips": "27037",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -93.051,
        "lat": 44.888,
        "id": "368390010271",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Dakota'"
  },
  {
    "state": "MN",
    "county": "Koochiching",
    "fips": "27071",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -94.201,
        "lat": 48.34,
        "id": "68-051-34000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Koochiching'"
  },
  {
    "state": "MN",
    "county": "Morrison",
    "fips": "27097",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -93.8155,
        "lat": 46.0355,
        "id": "150110000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Morrison'"
  },
  {
    "state": "MN",
    "county": "Mower",
    "fips": "27099",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -92.9545,
        "lat": 43.7105,
        "id": "34-887-0250",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Mower'"
  },
  {
    "state": "MN",
    "county": "Scott",
    "fips": "27139",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -93.767,
        "lat": 44.626,
        "id": "200014991",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Scott'"
  },
  {
    "state": "MN",
    "county": "Anoka",
    "fips": "27003",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -93.202,
        "lat": 45.2855,
        "id": "033223330007",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Anoka'"
  },
  {
    "state": "MN",
    "county": "Becker",
    "fips": "27005",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -95.2295,
        "lat": 46.835,
        "id": "130136000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Becker'"
  },
  {
    "state": "MN",
    "county": "Douglas",
    "fips": "27041",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -95.577,
        "lat": 45.995,
        "id": "09-0163-180",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Douglas'"
  },
  {
    "state": "MN",
    "county": "Houston",
    "fips": "27055",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -91.4895,
        "lat": 43.806,
        "id": "11-0201-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Houston'"
  },
  {
    "state": "MN",
    "county": "Lac qui Parle",
    "fips": "27073",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -96.03,
        "lat": 45.132,
        "id": "20-0031-900",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Lac qui Parle'"
  },
  {
    "state": "MN",
    "county": "Olmsted",
    "fips": "27109",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -92.3155,
        "lat": 43.9635,
        "id": "621933032752",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Olmsted'"
  },
  {
    "state": "MN",
    "county": "Red Lake",
    "fips": "27125",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -96.2735,
        "lat": 47.88225,
        "id": "17-2869-010",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Red Lake'"
  },
  {
    "state": "MN",
    "county": "Washington",
    "fips": "27163",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -92.818,
        "lat": 45.064,
        "id": "2803020210025",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Washington'"
  },
  {
    "state": "MN",
    "county": "Winona",
    "fips": "27169",
    "provider": "Minnesota Geospatial Information Office",
    "dataset": "Opt-in open parcels",
    "url": "https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer",
    "queryLayer": 1,
    "fields": {
      "apn": "county_pin"
    },
    "outFields": "county_pin",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Minnesota Geospatial Information Office opt-in open parcels, not the county's own live layer. The click is limited to this county and requests county_pin only. Counties that did not opt in are not in this layer. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -91.633,
        "lat": 44.03,
        "id": "323050010",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "co_name='Winona'"
  },
  {
    "state": "NE",
    "county": "Boone",
    "fips": "31011",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -98.065,
        "lat": 41.7,
        "id": "0028300.00",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='011' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Adams",
    "fips": "31001",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -98.5,
        "lat": 40.525,
        "id": "010002261",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='001' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Box Butte",
    "fips": "31013",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -103.07,
        "lat": 42.22,
        "id": "070204764",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='013' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Washington",
    "fips": "31177",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -96.19,
        "lat": 41.535,
        "id": "890089118",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='177' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Boyd",
    "fips": "31015",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -98.78,
        "lat": 42.89,
        "id": "200112800",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='015' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Buffalo",
    "fips": "31019",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -99.075,
        "lat": 40.86,
        "id": "380003000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='019' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Burt",
    "fips": "31021",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -96.32,
        "lat": 41.86,
        "id": "432702000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='021' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Butler",
    "fips": "31023",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -97.14,
        "lat": 41.255,
        "id": "120033733",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='023' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Cedar",
    "fips": "31027",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -97.255,
        "lat": 42.6,
        "id": "0002621.00",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='027' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Cherry",
    "fips": "31031",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -101.125,
        "lat": 42.545,
        "id": "160092981",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='031' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Colfax",
    "fips": "31037",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -97.08,
        "lat": 41.56,
        "id": "0580160.00",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='037' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Cuming",
    "fips": "31039",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -96.79,
        "lat": 41.915,
        "id": "0045380.00",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='039' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Deuel",
    "fips": "31049",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -102.335,
        "lat": 41.11,
        "id": "0000562.00",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='049' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Custer",
    "fips": "31041",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -99.73,
        "lat": 41.395,
        "id": "000514310",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='041' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Dixon",
    "fips": "31051",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -96.875,
        "lat": 42.51,
        "id": "0014050.00",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='051' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Dawes",
    "fips": "31045",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -103.14,
        "lat": 42.72,
        "id": "230002628",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='045' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Franklin",
    "fips": "31061",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -98.955,
        "lat": 40.175,
        "id": "2085003.00",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='061' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Frontier",
    "fips": "31063",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -100.38,
        "lat": 40.525,
        "id": "320016579",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='063' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Fillmore",
    "fips": "31059",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -97.595,
        "lat": 40.525,
        "id": "300021287",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='059' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Garden",
    "fips": "31069",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -102.37,
        "lat": 41.615,
        "id": "350034168",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='069' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Grant",
    "fips": "31075",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -101.75,
        "lat": 41.92,
        "id": "380007665",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='075' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Furnas",
    "fips": "31065",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -99.915,
        "lat": 40.175,
        "id": "0001142.00",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='065' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Harlan",
    "fips": "31083",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -99.405,
        "lat": 40.175,
        "id": "200002000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='083' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Hall",
    "fips": "31079",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -98.5,
        "lat": 40.875,
        "id": "400199661",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='079' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Hooker",
    "fips": "31091",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -101.135,
        "lat": 41.915,
        "id": "460004245",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='091' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Hamilton",
    "fips": "31081",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -98.055,
        "lat": 40.935,
        "id": "410027936",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='081' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Johnson",
    "fips": "31097",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -96.265,
        "lat": 40.39,
        "id": "490017134",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='097' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Madison",
    "fips": "31119",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -97.6,
        "lat": 41.915,
        "id": "590137409",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='119' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Nance",
    "fips": "31125",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -97.995,
        "lat": 41.37,
        "id": "0900117.00",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='125' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Knox",
    "fips": "31107",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -97.895,
        "lat": 42.66,
        "id": "540008337",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='107' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Nemaha",
    "fips": "31127",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -95.855,
        "lat": 40.39,
        "id": "640091431",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='127' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Merrick",
    "fips": "31121",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -97.945,
        "lat": 41.135,
        "id": "0001752.00",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='121' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Nuckolls",
    "fips": "31129",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -98.045,
        "lat": 40.175,
        "id": "0003626.00",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='129' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Kearney",
    "fips": "31099",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -98.87,
        "lat": 40.505,
        "id": "0002302.00",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='099' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Perkins",
    "fips": "31135",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -101.65,
        "lat": 40.85,
        "id": "680021906",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='135' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Richardson",
    "fips": "31147",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -95.734,
        "lat": 40.052,
        "id": "740034707",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='147' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Otoe",
    "fips": "31131",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -96.145,
        "lat": 40.65,
        "id": "003731000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='131' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Pawnee",
    "fips": "31133",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -96.235,
        "lat": 40.13,
        "id": "670001623",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='133' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Pierce",
    "fips": "31139",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -97.6,
        "lat": 42.265,
        "id": "700026124",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='139' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Saline",
    "fips": "31151",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -97.14,
        "lat": 40.525,
        "id": "760068267",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='151' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Saunders",
    "fips": "31155",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -96.63,
        "lat": 41.235,
        "id": "002123501",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='155' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Scotts Bluff",
    "fips": "31157",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -103.705,
        "lat": 41.85,
        "id": "010020071",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='157' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Seward",
    "fips": "31159",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -97.14,
        "lat": 40.875,
        "id": "800037154",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='159' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Valley",
    "fips": "31175",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -98.98,
        "lat": 41.565,
        "id": "880006461",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='175' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Sheridan",
    "fips": "31161",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -102.4,
        "lat": 42.5,
        "id": "810024594",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='161' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Sioux",
    "fips": "31165",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -103.725,
        "lat": 42.5,
        "id": "830025111",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='165' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Thomas",
    "fips": "31171",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -100.56,
        "lat": 41.915,
        "id": "860006778",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='171' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Antelope",
    "fips": "31003",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -98.065,
        "lat": 42.175,
        "id": "000451600",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='003' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Brown",
    "fips": "31017",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -99.93,
        "lat": 42.47,
        "id": "090037014",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='017' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Dawson",
    "fips": "31047",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -99.82,
        "lat": 40.86,
        "id": "240220900",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='047' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Blaine",
    "fips": "31009",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -99.98,
        "lat": 41.915,
        "id": "050035762",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='009' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Cass",
    "fips": "31025",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -96.175,
        "lat": 40.92,
        "id": "130124648",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='025' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Keith",
    "fips": "31101",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -101.655,
        "lat": 41.195,
        "id": "257247700",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='101' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Dakota",
    "fips": "31043",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -96.57,
        "lat": 42.4,
        "id": "220092508",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='043' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Keya Paha",
    "fips": "31103",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -99.725,
        "lat": 42.9,
        "id": "520010639",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='103' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Sarpy",
    "fips": "31153",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -96.11,
        "lat": 41.12,
        "id": "010405151",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='153' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Lincoln",
    "fips": "31111",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -100.745,
        "lat": 41.045,
        "id": "0085820.00",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='111' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Morrill",
    "fips": "31123",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -103.005,
        "lat": 41.725,
        "id": "200055138",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='123' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Phelps",
    "fips": "31137",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -99.41,
        "lat": 40.515,
        "id": "0006345.00",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='137' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Wayne",
    "fips": "31179",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -97.095,
        "lat": 42.22,
        "id": "0001550.00",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='179' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Hayes",
    "fips": "31085",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -101.065,
        "lat": 40.525,
        "id": "430014996",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='085' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Jefferson",
    "fips": "31095",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -97.145,
        "lat": 40.175,
        "id": "480060134",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='095' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Thayer",
    "fips": "31169",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -97.515,
        "lat": 40.175,
        "id": "850003938",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='169' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Lancaster",
    "fips": "31109",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -96.685,
        "lat": 40.785,
        "id": "1036423008000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='109' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Rock",
    "fips": "31149",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -99.455,
        "lat": 42.445,
        "id": "750001276",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='149' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Webster",
    "fips": "31181",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -98.5,
        "lat": 40.175,
        "id": "001552600",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='181' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Arthur",
    "fips": "31005",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -101.7,
        "lat": 41.57,
        "id": "030001706",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='005' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Cheyenne",
    "fips": "31033",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -103.0,
        "lat": 41.22,
        "id": "170036871",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='033' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "McPherson",
    "fips": "31117",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -101.06,
        "lat": 41.565,
        "id": "600001539",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='117' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Banner",
    "fips": "31007",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -103.71,
        "lat": 41.545,
        "id": "040007081",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='007' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "York",
    "fips": "31185",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -97.6,
        "lat": 40.875,
        "id": "930061241",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='185' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Chase",
    "fips": "31029",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -101.7,
        "lat": 40.525,
        "id": "150061447",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='029' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Dodge",
    "fips": "31053",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -96.67,
        "lat": 41.595,
        "id": "270115318",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='053' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Clay",
    "fips": "31035",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -98.05,
        "lat": 40.525,
        "id": "000468600",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='035' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Gage",
    "fips": "31067",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -96.69,
        "lat": 40.26,
        "id": "005666000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='067' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Douglas",
    "fips": "31055",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -96.205,
        "lat": 41.29,
        "id": "0523380542",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='055' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Dundy",
    "fips": "31057",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -101.685,
        "lat": 40.175,
        "id": "290025885",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='057' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Gosper",
    "fips": "31073",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -99.865,
        "lat": 40.515,
        "id": "370007577",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='073' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Hitchcock",
    "fips": "31087",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -101.04,
        "lat": 40.175,
        "id": "440029422",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='087' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Garfield",
    "fips": "31071",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -98.99,
        "lat": 41.915,
        "id": "004207400",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='071' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Greeley",
    "fips": "31077",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -98.52,
        "lat": 41.565,
        "id": "390110400",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='077' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Kimball",
    "fips": "31105",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -103.715,
        "lat": 41.195,
        "id": "530011581",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='105' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Holt",
    "fips": "31089",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -98.78,
        "lat": 42.445,
        "id": "450375200",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='089' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Logan",
    "fips": "31113",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -100.48,
        "lat": 41.565,
        "id": "570010152",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='113' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Polk",
    "fips": "31143",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -97.6,
        "lat": 41.225,
        "id": "720021532",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='143' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Howard",
    "fips": "31093",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -98.44,
        "lat": 41.22,
        "id": "471026790",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='093' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Loup",
    "fips": "31115",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -99.455,
        "lat": 41.915,
        "id": "580015211",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='115' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Platte",
    "fips": "31141",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -97.54,
        "lat": 41.56,
        "id": "710040691",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='141' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Sherman",
    "fips": "31163",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -98.98,
        "lat": 41.22,
        "id": "090011100",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='163' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Wheeler",
    "fips": "31183",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -98.53,
        "lat": 41.915,
        "id": "0000428.00",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='183' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Red Willow",
    "fips": "31145",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -100.475,
        "lat": 40.175,
        "id": "000140700",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='145' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Stanton",
    "fips": "31167",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -97.195,
        "lat": 41.915,
        "id": "0003111.00",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='167' AND Parcel_ID<>''"
  },
  {
    "state": "NE",
    "county": "Thurston",
    "fips": "31173",
    "provider": "Nebraska OCIO",
    "dataset": "Statewide parcels",
    "url": "https://giscat.ne.gov/enterprise/rest/services/StatewideParcelsExternal/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "Parcel_ID"
    },
    "outFields": "Parcel_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Nebraska OCIO statewide parcels compiled from county assessors, not a title search. The click is limited to this county and requests Parcel_ID only. A blank id is ignored. A miss is not proof the land is unparceled.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -96.545,
        "lat": 42.165,
        "id": "001490008",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ],
    "where": "County_ID='173' AND Parcel_ID<>''"
  },
  {
    "state": "PA",
    "county": "Lycoming",
    "fips": "42081",
    "provider": "Pennsylvania Spatial Data Access",
    "dataset": "PA Parcels",
    "url": "https://apps.pasda.psu.edu/arcgis/rest/services/PA_Parcels/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Pennsylvania Spatial Data Access parcels. The publisher says this layer is incomplete. A tested interior returned a PIN and a polygon. The layer has no county field. A miss is not proof the county has no parcels. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "partial",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -77.025,
        "lat": 41.33,
        "id": "15-2890012600000-",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "PA",
    "county": "Mercer",
    "fips": "42085",
    "provider": "Pennsylvania Spatial Data Access",
    "dataset": "PA Parcels",
    "url": "https://apps.pasda.psu.edu/arcgis/rest/services/PA_Parcels/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Pennsylvania Spatial Data Access parcels. The publisher says this layer is incomplete. A tested interior returned a PIN and a polygon. The layer has no county field. A miss is not proof the county has no parcels. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "partial",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -80.285,
        "lat": 41.305,
        "id": "03 110 095",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "PA",
    "county": "Montgomery",
    "fips": "42091",
    "provider": "Pennsylvania Spatial Data Access",
    "dataset": "PA Parcels",
    "url": "https://apps.pasda.psu.edu/arcgis/rest/services/PA_Parcels/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Pennsylvania Spatial Data Access parcels. The publisher says this layer is incomplete. A tested interior returned a PIN and a polygon. The layer has no county field. A miss is not proof the county has no parcels. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "partial",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -75.36,
        "lat": 40.225,
        "id": "670001364009",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "PA",
    "county": "Berks",
    "fips": "42011",
    "provider": "Pennsylvania Spatial Data Access",
    "dataset": "PA Parcels",
    "url": "https://apps.pasda.psu.edu/arcgis/rest/services/PA_Parcels/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Pennsylvania Spatial Data Access parcels. The publisher says this layer is incomplete. A tested interior returned a PIN and a polygon. The layer has no county field. A miss is not proof the county has no parcels. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "partial",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -76.04,
        "lat": 40.41,
        "id": "69437901467717",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "PA",
    "county": "Cambria",
    "fips": "42021",
    "provider": "Pennsylvania Spatial Data Access",
    "dataset": "PA Parcels",
    "url": "https://apps.pasda.psu.edu/arcgis/rest/services/PA_Parcels/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Pennsylvania Spatial Data Access parcels. The publisher says this layer is incomplete. A tested interior returned a PIN and a polygon. The layer has no county field. A miss is not proof the county has no parcels. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "partial",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -78.705,
        "lat": 40.5,
        "id": "08-012. -105.000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "PA",
    "county": "Montour",
    "fips": "42093",
    "provider": "Pennsylvania Spatial Data Access",
    "dataset": "PA Parcels",
    "url": "https://apps.pasda.psu.edu/arcgis/rest/services/PA_Parcels/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Pennsylvania Spatial Data Access parcels. The publisher says this layer is incomplete. A tested interior returned a PIN and a polygon. The layer has no county field. A miss is not proof the county has no parcels. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "partial",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -76.59,
        "lat": 41.06,
        "id": "21 01 00900",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "PA",
    "county": "Centre",
    "fips": "42027",
    "provider": "Pennsylvania Spatial Data Access",
    "dataset": "PA Parcels",
    "url": "https://apps.pasda.psu.edu/arcgis/rest/services/PA_Parcels/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Pennsylvania Spatial Data Access parcels. The publisher says this layer is incomplete. A tested interior returned a PIN and a polygon. The layer has no county field. A miss is not proof the county has no parcels. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "partial",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -77.76,
        "lat": 41.0,
        "id": "07-008-,500-,0000-",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "PA",
    "county": "Dauphin",
    "fips": "42043",
    "provider": "Pennsylvania Spatial Data Access",
    "dataset": "PA Parcels",
    "url": "https://apps.pasda.psu.edu/arcgis/rest/services/PA_Parcels/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Pennsylvania Spatial Data Access parcels. The publisher says this layer is incomplete. A tested interior returned a PIN and a polygon. The layer has no county field. A miss is not proof the county has no parcels. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "partial",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -76.78,
        "lat": 40.44,
        "id": "55-001-007",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "PA",
    "county": "Franklin",
    "fips": "42055",
    "provider": "Pennsylvania Spatial Data Access",
    "dataset": "PA Parcels",
    "url": "https://apps.pasda.psu.edu/arcgis/rest/services/PA_Parcels/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Pennsylvania Spatial Data Access parcels. The publisher says this layer is incomplete. A tested interior returned a PIN and a polygon. The layer has no county field. A miss is not proof the county has no parcels. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "partial",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -77.78,
        "lat": 40.005,
        "id": "11-0E02.-003.-000000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "PA",
    "county": "Fulton",
    "fips": "42057",
    "provider": "Pennsylvania Spatial Data Access",
    "dataset": "PA Parcels",
    "url": "https://apps.pasda.psu.edu/arcgis/rest/services/PA_Parcels/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Pennsylvania Spatial Data Access parcels. The publisher says this layer is incomplete. A tested interior returned a PIN and a polygon. The layer has no county field. A miss is not proof the county has no parcels. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "partial",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -78.17,
        "lat": 39.945,
        "id": "06-05-001",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "PA",
    "county": "Monroe",
    "fips": "42089",
    "provider": "Pennsylvania Spatial Data Access",
    "dataset": "PA Parcels",
    "url": "https://apps.pasda.psu.edu/arcgis/rest/services/PA_Parcels/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Pennsylvania Spatial Data Access parcels. The publisher says this layer is incomplete. A tested interior returned a PIN and a polygon. The layer has no county field. A miss is not proof the county has no parcels. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "partial",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -75.31,
        "lat": 41.055,
        "id": "12637303236181",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "PA",
    "county": "Huntingdon",
    "fips": "42061",
    "provider": "Pennsylvania Spatial Data Access",
    "dataset": "PA Parcels",
    "url": "https://apps.pasda.psu.edu/arcgis/rest/services/PA_Parcels/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Pennsylvania Spatial Data Access parcels. The publisher says this layer is incomplete. A tested interior returned a PIN and a polygon. The layer has no county field. A miss is not proof the county has no parcels. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "partial",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -77.88,
        "lat": 40.395,
        "id": "21 ,03-0105F-,000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "PA",
    "county": "Lebanon",
    "fips": "42075",
    "provider": "Pennsylvania Spatial Data Access",
    "dataset": "PA Parcels",
    "url": "https://apps.pasda.psu.edu/arcgis/rest/services/PA_Parcels/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Pennsylvania Spatial Data Access parcels. The publisher says this layer is incomplete. A tested interior returned a PIN and a polygon. The layer has no county field. A miss is not proof the county has no parcels. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "partial",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -76.265,
        "lat": 40.395,
        "id": "62431900407228",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "PA",
    "county": "Union",
    "fips": "42119",
    "provider": "Pennsylvania Spatial Data Access",
    "dataset": "PA Parcels",
    "url": "https://apps.pasda.psu.edu/arcgis/rest/services/PA_Parcels/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Pennsylvania Spatial Data Access parcels. The publisher says this layer is incomplete. A tested interior returned a PIN and a polygon. The layer has no county field. A miss is not proof the county has no parcels. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "partial",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -77.13,
        "lat": 40.995,
        "id": "999-999-999.00000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "PA",
    "county": "Wyoming",
    "fips": "42131",
    "provider": "Pennsylvania Spatial Data Access",
    "dataset": "PA Parcels",
    "url": "https://apps.pasda.psu.edu/arcgis/rest/services/PA_Parcels/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Pennsylvania Spatial Data Access parcels. The publisher says this layer is incomplete. A tested interior returned a PIN and a polygon. The layer has no county field. A miss is not proof the county has no parcels. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "partial",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -76.03,
        "lat": 41.515,
        "id": "03-049.0-002-01-00-0",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "PA",
    "county": "Adams",
    "fips": "42001",
    "provider": "Pennsylvania Spatial Data Access",
    "dataset": "PA Parcels",
    "url": "https://apps.pasda.psu.edu/arcgis/rest/services/PA_Parcels/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Pennsylvania Spatial Data Access parcels. The publisher says this layer is incomplete. A tested interior returned a PIN and a polygon. The layer has no county field. A miss is not proof the county has no parcels. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "partial",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -77.235,
        "lat": 39.895,
        "id": "07F10-0015A--000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "PA",
    "county": "Allegheny",
    "fips": "42003",
    "provider": "Pennsylvania Spatial Data Access",
    "dataset": "PA Parcels",
    "url": "https://apps.pasda.psu.edu/arcgis/rest/services/PA_Parcels/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Pennsylvania Spatial Data Access parcels. The publisher says this layer is incomplete. A tested interior returned a PIN and a polygon. The layer has no county field. A miss is not proof the county has no parcels. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "partial",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -80.025,
        "lat": 40.495,
        "id": "0162K00096000000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "PA",
    "county": "Blair",
    "fips": "42013",
    "provider": "Pennsylvania Spatial Data Access",
    "dataset": "PA Parcels",
    "url": "https://apps.pasda.psu.edu/arcgis/rest/services/PA_Parcels/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Pennsylvania Spatial Data Access parcels. The publisher says this layer is incomplete. A tested interior returned a PIN and a polygon. The layer has no county field. A miss is not proof the county has no parcels. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "partial",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -78.33,
        "lat": 40.49,
        "id": "08.00-04..-003.00-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "PA",
    "county": "Butler",
    "fips": "42019",
    "provider": "Pennsylvania Spatial Data Access",
    "dataset": "PA Parcels",
    "url": "https://apps.pasda.psu.edu/arcgis/rest/services/PA_Parcels/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Pennsylvania Spatial Data Access parcels. The publisher says this layer is incomplete. A tested interior returned a PIN and a polygon. The layer has no county field. A miss is not proof the county has no parcels. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "partial",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -79.92,
        "lat": 40.92,
        "id": "060- S6- G6-0000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "PA",
    "county": "Cumberland",
    "fips": "42041",
    "provider": "Pennsylvania Spatial Data Access",
    "dataset": "PA Parcels",
    "url": "https://apps.pasda.psu.edu/arcgis/rest/services/PA_Parcels/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Pennsylvania Spatial Data Access parcels. The publisher says this layer is incomplete. A tested interior returned a PIN and a polygon. The layer has no county field. A miss is not proof the county has no parcels. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "partial",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -77.27,
        "lat": 40.135,
        "id": "08-11-0294-007",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "PA",
    "county": "Forest",
    "fips": "42053",
    "provider": "Pennsylvania Spatial Data Access",
    "dataset": "PA Parcels",
    "url": "https://apps.pasda.psu.edu/arcgis/rest/services/PA_Parcels/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Pennsylvania Spatial Data Access parcels. The publisher says this layer is incomplete. A tested interior returned a PIN and a polygon. The layer has no county field. A miss is not proof the county has no parcels. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "partial",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -79.24,
        "lat": 41.53,
        "id": "17-07 -100-00",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "PA",
    "county": "Juniata",
    "fips": "42067",
    "provider": "Pennsylvania Spatial Data Access",
    "dataset": "PA Parcels",
    "url": "https://apps.pasda.psu.edu/arcgis/rest/services/PA_Parcels/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Pennsylvania Spatial Data Access parcels. The publisher says this layer is incomplete. A tested interior returned a PIN and a polygon. The layer has no county field. A miss is not proof the county has no parcels. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "partial",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -77.352,
        "lat": 40.506,
        "id": "15-7-2",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "PA",
    "county": "Lancaster",
    "fips": "42071",
    "provider": "Pennsylvania Spatial Data Access",
    "dataset": "PA Parcels",
    "url": "https://apps.pasda.psu.edu/arcgis/rest/services/PA_Parcels/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Pennsylvania Spatial Data Access parcels. The publisher says this layer is incomplete. A tested interior returned a PIN and a polygon. The layer has no county field. A miss is not proof the county has no parcels. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "partial",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -76.345,
        "lat": 40.02,
        "id": "3400220900000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "PA",
    "county": "Mifflin",
    "fips": "42087",
    "provider": "Pennsylvania Spatial Data Access",
    "dataset": "PA Parcels",
    "url": "https://apps.pasda.psu.edu/arcgis/rest/services/PA_Parcels/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Pennsylvania Spatial Data Access parcels. The publisher says this layer is incomplete. A tested interior returned a PIN and a polygon. The layer has no county field. A miss is not proof the county has no parcels. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "partial",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -77.6,
        "lat": 40.57,
        "id": "17 ,12-0109--,000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "PA",
    "county": "Venango",
    "fips": "42121",
    "provider": "Pennsylvania Spatial Data Access",
    "dataset": "PA Parcels",
    "url": "https://apps.pasda.psu.edu/arcgis/rest/services/PA_Parcels/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Pennsylvania Spatial Data Access parcels. The publisher says this layer is incomplete. A tested interior returned a PIN and a polygon. The layer has no county field. A miss is not proof the county has no parcels. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "partial",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -79.755,
        "lat": 41.395,
        "id": "08,002.-001C.-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "PA",
    "county": "Warren",
    "fips": "42123",
    "provider": "Pennsylvania Spatial Data Access",
    "dataset": "PA Parcels",
    "url": "https://apps.pasda.psu.edu/arcgis/rest/services/PA_Parcels/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Pennsylvania Spatial Data Access parcels. The publisher says this layer is incomplete. A tested interior returned a PIN and a polygon. The layer has no county field. A miss is not proof the county has no parcels. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "partial",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -79.265,
        "lat": 41.81,
        "id": "YV-009-381000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "PA",
    "county": "Columbia",
    "fips": "42037",
    "provider": "Pennsylvania Spatial Data Access",
    "dataset": "PA Parcels",
    "url": "https://apps.pasda.psu.edu/arcgis/rest/services/PA_Parcels/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Pennsylvania Spatial Data Access parcels. The publisher says this layer is incomplete. A tested interior returned a PIN and a polygon. The layer has no county field. A miss is not proof the county has no parcels. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "partial",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -76.47,
        "lat": 41.07,
        "id": "26 03 00900",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "PA",
    "county": "York",
    "fips": "42133",
    "provider": "Pennsylvania Spatial Data Access",
    "dataset": "PA Parcels",
    "url": "https://apps.pasda.psu.edu/arcgis/rest/services/PA_Parcels/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Pennsylvania Spatial Data Access parcels. The publisher says this layer is incomplete. A tested interior returned a PIN and a polygon. The layer has no county field. A miss is not proof the county has no parcels. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "partial",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -76.69,
        "lat": 39.97,
        "id": "4600001017800",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "PA",
    "county": "Snyder",
    "fips": "42109",
    "provider": "Pennsylvania Spatial Data Access",
    "dataset": "PA Parcels",
    "url": "https://apps.pasda.psu.edu/arcgis/rest/services/PA_Parcels/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Pennsylvania Spatial Data Access parcels. The publisher says this layer is incomplete. A tested interior returned a PIN and a polygon. The layer has no county field. A miss is not proof the county has no parcels. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "partial",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -77.005,
        "lat": 40.74,
        "id": "19-03-005",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "PA",
    "county": "Bradford",
    "fips": "42015",
    "provider": "Pennsylvania Spatial Data Access",
    "dataset": "PA Parcels",
    "url": "https://apps.pasda.psu.edu/arcgis/rest/services/PA_Parcels/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Pennsylvania Spatial Data Access parcels. The publisher says this layer is incomplete. A tested interior returned a PIN and a polygon. The layer has no county field. A miss is not proof the county has no parcels. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "partial",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -76.54,
        "lat": 41.77,
        "id": "1208500100000000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "PA",
    "county": "Fayette",
    "fips": "42051",
    "provider": "Pennsylvania Spatial Data Access",
    "dataset": "PA Parcels",
    "url": "https://apps.pasda.psu.edu/arcgis/rest/services/PA_Parcels/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Pennsylvania Spatial Data Access parcels. The publisher says this layer is incomplete. A tested interior returned a PIN and a polygon. The layer has no county field. A miss is not proof the county has no parcels. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "partial",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -79.7,
        "lat": 39.935,
        "id": "25-12-0011",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "PA",
    "county": "Bedford",
    "fips": "42009",
    "provider": "Pennsylvania Spatial Data Access",
    "dataset": "PA Parcels",
    "url": "https://apps.pasda.psu.edu/arcgis/rest/services/PA_Parcels/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Pennsylvania Spatial Data Access parcels. The publisher says this layer is incomplete. A tested interior returned a PIN and a polygon. The layer has no county field. A miss is not proof the county has no parcels. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "partial",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -78.47,
        "lat": 40.025,
        "id": "E.09-0.00-141",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "PA",
    "county": "Bucks",
    "fips": "42017",
    "provider": "Pennsylvania Spatial Data Access",
    "dataset": "PA Parcels",
    "url": "https://apps.pasda.psu.edu/arcgis/rest/services/PA_Parcels/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Pennsylvania Spatial Data Access parcels. The publisher says this layer is incomplete. A tested interior returned a PIN and a polygon. The layer has no county field. A miss is not proof the county has no parcels. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "partial",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -75.1,
        "lat": 40.285,
        "id": "09-022-110-001",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "PA",
    "county": "Chester",
    "fips": "42029",
    "provider": "Pennsylvania Spatial Data Access",
    "dataset": "PA Parcels",
    "url": "https://apps.pasda.psu.edu/arcgis/rest/services/PA_Parcels/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Pennsylvania Spatial Data Access parcels. The publisher says this layer is incomplete. A tested interior returned a PIN and a polygon. The layer has no county field. A miss is not proof the county has no parcels. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "partial",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -75.75,
        "lat": 39.98,
        "id": "5001 0065000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "PA",
    "county": "Crawford",
    "fips": "42039",
    "provider": "Pennsylvania Spatial Data Access",
    "dataset": "PA Parcels",
    "url": "https://apps.pasda.psu.edu/arcgis/rest/services/PA_Parcels/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Pennsylvania Spatial Data Access parcels. The publisher says this layer is incomplete. A tested interior returned a PIN and a polygon. The layer has no county field. A miss is not proof the county has no parcels. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "partial",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -80.065,
        "lat": 41.67,
        "id": "6711-044-2",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "PA",
    "county": "Indiana",
    "fips": "42063",
    "provider": "Pennsylvania Spatial Data Access",
    "dataset": "PA Parcels",
    "url": "https://apps.pasda.psu.edu/arcgis/rest/services/PA_Parcels/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Pennsylvania Spatial Data Access parcels. The publisher says this layer is incomplete. A tested interior returned a PIN and a polygon. The layer has no county field. A miss is not proof the county has no parcels. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "partial",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -79.13,
        "lat": 40.655,
        "id": "42-003-105.00..-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "PA",
    "county": "Lehigh",
    "fips": "42077",
    "provider": "Pennsylvania Spatial Data Access",
    "dataset": "PA Parcels",
    "url": "https://apps.pasda.psu.edu/arcgis/rest/services/PA_Parcels/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Pennsylvania Spatial Data Access parcels. The publisher says this layer is incomplete. A tested interior returned a PIN and a polygon. The layer has no county field. A miss is not proof the county has no parcels. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "partial",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -75.685,
        "lat": 40.56,
        "id": "544514697738",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "PA",
    "county": "Perry",
    "fips": "42099",
    "provider": "Pennsylvania Spatial Data Access",
    "dataset": "PA Parcels",
    "url": "https://apps.pasda.psu.edu/arcgis/rest/services/PA_Parcels/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Pennsylvania Spatial Data Access parcels. The publisher says this layer is incomplete. A tested interior returned a PIN and a polygon. The layer has no county field. A miss is not proof the county has no parcels. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "partial",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -77.31,
        "lat": 40.445,
        "id": "230,069.00-013.000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "PA",
    "county": "Philadelphia",
    "fips": "42101",
    "provider": "Pennsylvania Spatial Data Access",
    "dataset": "PA Parcels",
    "url": "https://apps.pasda.psu.edu/arcgis/rest/services/PA_Parcels/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Pennsylvania Spatial Data Access parcels. The publisher says this layer is incomplete. A tested interior returned a PIN and a polygon. The layer has no county field. A miss is not proof the county has no parcels. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "partial",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -75.12,
        "lat": 40.005,
        "id": "1001020395",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "PA",
    "county": "Washington",
    "fips": "42125",
    "provider": "Pennsylvania Spatial Data Access",
    "dataset": "PA Parcels",
    "url": "https://apps.pasda.psu.edu/arcgis/rest/services/PA_Parcels/MapServer",
    "queryLayer": 1,
    "fields": {
      "apn": "PIN"
    },
    "outFields": "PIN",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Pennsylvania Spatial Data Access parcels. The publisher says this layer is incomplete. A tested interior returned a PIN and a polygon. The layer has no county field. A miss is not proof the county has no parcels. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "partial",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "tested": [
      {
        "lon": -80.205,
        "lat": 40.22,
        "id": "520-011-00-00-0016-03",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "FL",
    "county": "Gilchrist",
    "fips": "12041",
    "provider": "Florida Department of Revenue",
    "dataset": "Statewide cadastral",
    "url": "https://services9.arcgis.com/Gh9awoU677aKree0/arcgis/rest/services/Florida_Statewide_Cadastral/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID"
    },
    "outFields": "PARCEL_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Florida Department of Revenue cadastral extract, August 2025 property-appraiser GIS joined to the tax roll. Not the live county appraiser. The click is limited to this county and requests PARCEL_ID only. Owner name exists on the layer and is not requested. Confidential records may be omitted. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CO_NO=31",
    "tested": [
      {
        "lon": -82.81639,
        "lat": 29.92178,
        "id": "330615000000010010",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "FL",
    "county": "Holmes",
    "fips": "12059",
    "provider": "Florida Department of Revenue",
    "dataset": "Statewide cadastral",
    "url": "https://services9.arcgis.com/Gh9awoU677aKree0/arcgis/rest/services/Florida_Statewide_Cadastral/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID"
    },
    "outFields": "PARCEL_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Florida Department of Revenue cadastral extract, August 2025 property-appraiser GIS joined to the tax roll. Not the live county appraiser. The click is limited to this county and requests PARCEL_ID only. Owner name exists on the layer and is not requested. Confidential records may be omitted. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CO_NO=40",
    "tested": [
      {
        "lon": -85.56647,
        "lat": 30.94509,
        "id": "020700000000001000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "FL",
    "county": "Monroe",
    "fips": "12087",
    "provider": "Florida Department of Revenue",
    "dataset": "Statewide cadastral",
    "url": "https://services9.arcgis.com/Gh9awoU677aKree0/arcgis/rest/services/Florida_Statewide_Cadastral/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID"
    },
    "outFields": "PARCEL_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Florida Department of Revenue cadastral extract, August 2025 property-appraiser GIS joined to the tax roll. Not the live county appraiser. The click is limited to this county and requests PARCEL_ID only. Owner name exists on the layer and is not requested. Confidential records may be omitted. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CO_NO=54",
    "tested": [
      {
        "lon": -81.76662,
        "lat": 24.56688,
        "id": "3367 25 00065780000206",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "FL",
    "county": "Hendry",
    "fips": "12051",
    "provider": "Florida Department of Revenue",
    "dataset": "Statewide cadastral",
    "url": "https://services9.arcgis.com/Gh9awoU677aKree0/arcgis/rest/services/Florida_Statewide_Cadastral/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID"
    },
    "outFields": "PARCEL_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Florida Department of Revenue cadastral extract, August 2025 property-appraiser GIS joined to the tax roll. Not the live county appraiser. The click is limited to this county and requests PARCEL_ID only. Owner name exists on the layer and is not requested. Confidential records may be omitted. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CO_NO=36",
    "tested": [
      {
        "lon": -81.33812,
        "lat": 26.68361,
        "id": "1 30 44 04 010 0009-002.2",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "FL",
    "county": "Jefferson",
    "fips": "12065",
    "provider": "Florida Department of Revenue",
    "dataset": "Statewide cadastral",
    "url": "https://services9.arcgis.com/Gh9awoU677aKree0/arcgis/rest/services/Florida_Statewide_Cadastral/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID"
    },
    "outFields": "PARCEL_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Florida Department of Revenue cadastral extract, August 2025 property-appraiser GIS joined to the tax roll. Not the live county appraiser. The click is limited to this county and requests PARCEL_ID only. Owner name exists on the layer and is not requested. Confidential records may be omitted. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CO_NO=43",
    "tested": [
      {
        "lon": -83.95474,
        "lat": 30.35111,
        "id": "32-1S-4E-0000-0060-0000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "FL",
    "county": "Baker",
    "fips": "12003",
    "provider": "Florida Department of Revenue",
    "dataset": "Statewide cadastral",
    "url": "https://services9.arcgis.com/Gh9awoU677aKree0/arcgis/rest/services/Florida_Statewide_Cadastral/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID"
    },
    "outFields": "PARCEL_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Florida Department of Revenue cadastral extract, August 2025 property-appraiser GIS joined to the tax roll. Not the live county appraiser. The click is limited to this county and requests PARCEL_ID only. Owner name exists on the layer and is not requested. Confidential records may be omitted. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CO_NO=12",
    "tested": [
      {
        "lon": -82.12155,
        "lat": 30.2769,
        "id": "322S22004900760075",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "FL",
    "county": "Levy",
    "fips": "12075",
    "provider": "Florida Department of Revenue",
    "dataset": "Statewide cadastral",
    "url": "https://services9.arcgis.com/Gh9awoU677aKree0/arcgis/rest/services/Florida_Statewide_Cadastral/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID"
    },
    "outFields": "PARCEL_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Florida Department of Revenue cadastral extract, August 2025 property-appraiser GIS joined to the tax roll. Not the live county appraiser. The click is limited to this county and requests PARCEL_ID only. Owner name exists on the layer and is not requested. Confidential records may be omitted. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CO_NO=48",
    "tested": [
      {
        "lon": -82.94059,
        "lat": 29.58392,
        "id": "1730500000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "FL",
    "county": "DeSoto",
    "fips": "12027",
    "provider": "Florida Department of Revenue",
    "dataset": "Statewide cadastral",
    "url": "https://services9.arcgis.com/Gh9awoU677aKree0/arcgis/rest/services/Florida_Statewide_Cadastral/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID"
    },
    "outFields": "PARCEL_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Florida Department of Revenue cadastral extract, August 2025 property-appraiser GIS joined to the tax roll. Not the live county appraiser. The click is limited to this county and requests PARCEL_ID only. Owner name exists on the layer and is not requested. Confidential records may be omitted. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CO_NO=24",
    "tested": [
      {
        "lon": -81.86709,
        "lat": 27.21066,
        "id": "363724028400700040",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "FL",
    "county": "Hardee",
    "fips": "12049",
    "provider": "Florida Department of Revenue",
    "dataset": "Statewide cadastral",
    "url": "https://services9.arcgis.com/Gh9awoU677aKree0/arcgis/rest/services/Florida_Statewide_Cadastral/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID"
    },
    "outFields": "PARCEL_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Florida Department of Revenue cadastral extract, August 2025 property-appraiser GIS joined to the tax roll. Not the live county appraiser. The click is limited to this county and requests PARCEL_ID only. Owner name exists on the layer and is not requested. Confidential records may be omitted. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CO_NO=35",
    "tested": [
      {
        "lon": -81.96995,
        "lat": 27.63343,
        "id": "0133230000100100000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "FL",
    "county": "Dixie",
    "fips": "12029",
    "provider": "Florida Department of Revenue",
    "dataset": "Statewide cadastral",
    "url": "https://services9.arcgis.com/Gh9awoU677aKree0/arcgis/rest/services/Florida_Statewide_Cadastral/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID"
    },
    "outFields": "PARCEL_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Florida Department of Revenue cadastral extract, August 2025 property-appraiser GIS joined to the tax roll. Not the live county appraiser. The click is limited to this county and requests PARCEL_ID only. Owner name exists on the layer and is not requested. Confidential records may be omitted. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CO_NO=25",
    "tested": [
      {
        "lon": -82.96902,
        "lat": 29.82024,
        "id": "010813000036380404",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "FL",
    "county": "Putnam",
    "fips": "12107",
    "provider": "Florida Department of Revenue",
    "dataset": "Statewide cadastral",
    "url": "https://services9.arcgis.com/Gh9awoU677aKree0/arcgis/rest/services/Florida_Statewide_Cadastral/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID"
    },
    "outFields": "PARCEL_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Florida Department of Revenue cadastral extract, August 2025 property-appraiser GIS joined to the tax roll. Not the live county appraiser. The click is limited to this county and requests PARCEL_ID only. Owner name exists on the layer and is not requested. Confidential records may be omitted. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CO_NO=64",
    "tested": [
      {
        "lon": -81.95944,
        "lat": 29.64635,
        "id": "01-10-23-9512-0000-3222",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "FL",
    "county": "Suwannee",
    "fips": "12121",
    "provider": "Florida Department of Revenue",
    "dataset": "Statewide cadastral",
    "url": "https://services9.arcgis.com/Gh9awoU677aKree0/arcgis/rest/services/Florida_Statewide_Cadastral/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID"
    },
    "outFields": "PARCEL_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Florida Department of Revenue cadastral extract, August 2025 property-appraiser GIS joined to the tax roll. Not the live county appraiser. The click is limited to this county and requests PARCEL_ID only. Owner name exists on the layer and is not requested. Confidential records may be omitted. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CO_NO=71",
    "tested": [
      {
        "lon": -82.89192,
        "lat": 30.05691,
        "id": "1405S14E03503000010",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "FL",
    "county": "Taylor",
    "fips": "12123",
    "provider": "Florida Department of Revenue",
    "dataset": "Statewide cadastral",
    "url": "https://services9.arcgis.com/Gh9awoU677aKree0/arcgis/rest/services/Florida_Statewide_Cadastral/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID"
    },
    "outFields": "PARCEL_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Florida Department of Revenue cadastral extract, August 2025 property-appraiser GIS joined to the tax roll. Not the live county appraiser. The click is limited to this county and requests PARCEL_ID only. Owner name exists on the layer and is not requested. Confidential records may be omitted. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CO_NO=72",
    "tested": [
      {
        "lon": -83.37123,
        "lat": 29.69007,
        "id": "09459-507",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "FL",
    "county": "Washington",
    "fips": "12133",
    "provider": "Florida Department of Revenue",
    "dataset": "Statewide cadastral",
    "url": "https://services9.arcgis.com/Gh9awoU677aKree0/arcgis/rest/services/Florida_Statewide_Cadastral/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID"
    },
    "outFields": "PARCEL_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Florida Department of Revenue cadastral extract, August 2025 property-appraiser GIS joined to the tax roll. Not the live county appraiser. The click is limited to this county and requests PARCEL_ID only. Owner name exists on the layer and is not requested. Confidential records may be omitted. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CO_NO=77",
    "tested": [
      {
        "lon": -85.62013,
        "lat": 30.53063,
        "id": "000000001910750013",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "FL",
    "county": "Collier",
    "fips": "12021",
    "provider": "Florida Department of Revenue",
    "dataset": "Statewide cadastral",
    "url": "https://services9.arcgis.com/Gh9awoU677aKree0/arcgis/rest/services/Florida_Statewide_Cadastral/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID"
    },
    "outFields": "PARCEL_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Florida Department of Revenue cadastral extract, August 2025 property-appraiser GIS joined to the tax roll. Not the live county appraiser. The click is limited to this county and requests PARCEL_ID only. Owner name exists on the layer and is not requested. Confidential records may be omitted. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CO_NO=21",
    "tested": [
      {
        "lon": -81.71793,
        "lat": 26.07176,
        "id": "50865003700",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "FL",
    "county": "Calhoun",
    "fips": "12013",
    "provider": "Florida Department of Revenue",
    "dataset": "Statewide cadastral",
    "url": "https://services9.arcgis.com/Gh9awoU677aKree0/arcgis/rest/services/Florida_Statewide_Cadastral/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID"
    },
    "outFields": "PARCEL_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Florida Department of Revenue cadastral extract, August 2025 property-appraiser GIS joined to the tax roll. Not the live county appraiser. The click is limited to this county and requests PARCEL_ID only. Owner name exists on the layer and is not requested. Confidential records may be omitted. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CO_NO=17",
    "tested": [
      {
        "lon": -85.22358,
        "lat": 30.20268,
        "id": "223S10000000040000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "FL",
    "county": "Union",
    "fips": "12125",
    "provider": "Florida Department of Revenue",
    "dataset": "Statewide cadastral",
    "url": "https://services9.arcgis.com/Gh9awoU677aKree0/arcgis/rest/services/Florida_Statewide_Cadastral/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID"
    },
    "outFields": "PARCEL_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Florida Department of Revenue cadastral extract, August 2025 property-appraiser GIS joined to the tax roll. Not the live county appraiser. The click is limited to this county and requests PARCEL_ID only. Owner name exists on the layer and is not requested. Confidential records may be omitted. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CO_NO=73",
    "tested": [
      {
        "lon": -82.42527,
        "lat": 29.92649,
        "id": "2806192400000100",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "FL",
    "county": "Lafayette",
    "fips": "12067",
    "provider": "Florida Department of Revenue",
    "dataset": "Statewide cadastral",
    "url": "https://services9.arcgis.com/Gh9awoU677aKree0/arcgis/rest/services/Florida_Statewide_Cadastral/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID"
    },
    "outFields": "PARCEL_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Florida Department of Revenue cadastral extract, August 2025 property-appraiser GIS joined to the tax roll. Not the live county appraiser. The click is limited to this county and requests PARCEL_ID only. Owner name exists on the layer and is not requested. Confidential records may be omitted. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CO_NO=44",
    "tested": [
      {
        "lon": -83.23543,
        "lat": 29.82371,
        "id": "3307110000000000200",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "FL",
    "county": "Liberty",
    "fips": "12077",
    "provider": "Florida Department of Revenue",
    "dataset": "Statewide cadastral",
    "url": "https://services9.arcgis.com/Gh9awoU677aKree0/arcgis/rest/services/Florida_Statewide_Cadastral/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID"
    },
    "outFields": "PARCEL_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Florida Department of Revenue cadastral extract, August 2025 property-appraiser GIS joined to the tax roll. Not the live county appraiser. The click is limited to this county and requests PARCEL_ID only. Owner name exists on the layer and is not requested. Confidential records may be omitted. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CO_NO=49",
    "tested": [
      {
        "lon": -84.77877,
        "lat": 30.42952,
        "id": "0061S5W00083020",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "FL",
    "county": "Madison",
    "fips": "12079",
    "provider": "Florida Department of Revenue",
    "dataset": "Statewide cadastral",
    "url": "https://services9.arcgis.com/Gh9awoU677aKree0/arcgis/rest/services/Florida_Statewide_Cadastral/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID"
    },
    "outFields": "PARCEL_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Florida Department of Revenue cadastral extract, August 2025 property-appraiser GIS joined to the tax roll. Not the live county appraiser. The click is limited to this county and requests PARCEL_ID only. Owner name exists on the layer and is not requested. Confidential records may be omitted. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CO_NO=50",
    "tested": [
      {
        "lon": -83.41698,
        "lat": 30.45617,
        "id": "0000004899000000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "FL",
    "county": "Okeechobee",
    "fips": "12093",
    "provider": "Florida Department of Revenue",
    "dataset": "Statewide cadastral",
    "url": "https://services9.arcgis.com/Gh9awoU677aKree0/arcgis/rest/services/Florida_Statewide_Cadastral/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "PARCEL_ID"
    },
    "outFields": "PARCEL_ID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "Florida Department of Revenue cadastral extract, August 2025 property-appraiser GIS joined to the tax roll. Not the live county appraiser. The click is limited to this county and requests PARCEL_ID only. Owner name exists on the layer and is not requested. Confidential records may be omitted. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CO_NO=57",
    "tested": [
      {
        "lon": -81.08021,
        "lat": 27.63528,
        "id": "10133320A00000010000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "Bottineau",
    "fips": "38009",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='Bottineau'",
    "tested": [
      {
        "lon": -100.79378,
        "lat": 48.72479,
        "id": "25000009903000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "Stark",
    "fips": "38089",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='Stark'",
    "tested": [
      {
        "lon": -102.86998,
        "lat": 46.91154,
        "id": "31407505888000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "Towner",
    "fips": "38095",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='Towner'",
    "tested": [
      {
        "lon": -99.32469,
        "lat": 48.7003,
        "id": "26000002485000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "Barnes",
    "fips": "38003",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='Barnes'",
    "tested": [
      {
        "lon": -98.13513,
        "lat": 47.10671,
        "id": "31-2210100",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "Benson",
    "fips": "38005",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='Benson'",
    "tested": [
      {
        "lon": -99.57964,
        "lat": 48.12616,
        "id": "22-0000-05230-300",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "Grand Forks",
    "fips": "38035",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='Grand Forks'",
    "tested": [
      {
        "lon": -97.64906,
        "lat": 47.67577,
        "id": "24350400001000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "McIntosh",
    "fips": "38051",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='McIntosh'",
    "tested": [
      {
        "lon": -99.5255,
        "lat": 46.25802,
        "id": "2627004",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "Nelson",
    "fips": "38063",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='Nelson'",
    "tested": [
      {
        "lon": -98.25062,
        "lat": 48.09628,
        "id": "29000008233000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "Ransom",
    "fips": "38073",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='Ransom'",
    "tested": [
      {
        "lon": -97.57867,
        "lat": 46.52261,
        "id": "52731100",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "Stutsman",
    "fips": "38093",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='Stutsman'",
    "tested": [
      {
        "lon": -98.77726,
        "lat": 46.90798,
        "id": "352944041",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "Billings",
    "fips": "38007",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='Billings'",
    "tested": [
      {
        "lon": -103.18938,
        "lat": 47.29259,
        "id": "29000001327000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "Cavalier",
    "fips": "38019",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='Cavalier'",
    "tested": [
      {
        "lon": -98.63921,
        "lat": 48.64146,
        "id": "13110000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "Golden Valley",
    "fips": "38033",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='Golden Valley'",
    "tested": [
      {
        "lon": -104.01019,
        "lat": 46.9209,
        "id": "5230000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "McLean",
    "fips": "38055",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='McLean'",
    "tested": [
      {
        "lon": -100.72657,
        "lat": 47.35125,
        "id": "8002700971000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "Oliver",
    "fips": "38065",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='Oliver'",
    "tested": [
      {
        "lon": -101.19166,
        "lat": 47.09984,
        "id": "12087000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "Renville",
    "fips": "38075",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='Renville'",
    "tested": [
      {
        "lon": -101.77635,
        "lat": 48.79664,
        "id": "11000001936000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "Richland",
    "fips": "38077",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='Richland'",
    "tested": [
      {
        "lon": -96.60748,
        "lat": 46.26533,
        "id": "50000112861000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "Slope",
    "fips": "38087",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='Slope'",
    "tested": [
      {
        "lon": -102.98226,
        "lat": 46.51531,
        "id": "58-1030009",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "Steele",
    "fips": "38091",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='Steele'",
    "tested": [
      {
        "lon": -97.83741,
        "lat": 47.51388,
        "id": "24000305495000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "Burleigh",
    "fips": "38015",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='Burleigh'",
    "tested": [
      {
        "lon": -100.21931,
        "lat": 46.87828,
        "id": "35-139-76-00-12-401",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "Dickey",
    "fips": "38021",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='Dickey'",
    "tested": [
      {
        "lon": -98.30156,
        "lat": 45.99986,
        "id": "475050",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "Foster",
    "fips": "38031",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='Foster'",
    "tested": [
      {
        "lon": -98.89387,
        "lat": 47.38105,
        "id": "580000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "McHenry",
    "fips": "38049",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='McHenry'",
    "tested": [
      {
        "lon": -100.84012,
        "lat": 48.14599,
        "id": "20000003886004",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "Ramsey",
    "fips": "38071",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='Ramsey'",
    "tested": [
      {
        "lon": -98.8391,
        "lat": 48.08582,
        "id": "5000001156030",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "Wells",
    "fips": "38103",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='Wells'",
    "tested": [
      {
        "lon": -99.31394,
        "lat": 47.57672,
        "id": "3013000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "Griggs",
    "fips": "38039",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='Griggs'",
    "tested": [
      {
        "lon": -98.04405,
        "lat": 47.47471,
        "id": "3000000424000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "Pembina",
    "fips": "38067",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='Pembina'",
    "tested": [
      {
        "lon": -97.67436,
        "lat": 48.80736,
        "id": "6-4550020",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "Pierce",
    "fips": "38069",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='Pierce'",
    "tested": [
      {
        "lon": -100.14196,
        "lat": 48.21941,
        "id": "3650000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "Sargent",
    "fips": "38081",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='Sargent'",
    "tested": [
      {
        "lon": -97.7218,
        "lat": 45.99713,
        "id": "185378000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "Sheridan",
    "fips": "38083",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='Sheridan'",
    "tested": [
      {
        "lon": -100.08089,
        "lat": 47.64984,
        "id": "5001001630000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "Walsh",
    "fips": "38099",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='Walsh'",
    "tested": [
      {
        "lon": -97.75131,
        "lat": 48.40755,
        "id": "19000004811040",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "Ward",
    "fips": "38101",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='Ward'",
    "tested": [
      {
        "lon": -101.30528,
        "lat": 48.26094,
        "id": "MI110330900020",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "Williams",
    "fips": "38105",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='Williams'",
    "tested": [
      {
        "lon": -103.26175,
        "lat": 48.08792,
        "id": "27-153-98-15-00-010",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "Adams",
    "fips": "38001",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='Adams'",
    "tested": [
      {
        "lon": -102.56114,
        "lat": 46.01112,
        "id": "4090000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "Burke",
    "fips": "38013",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='Burke'",
    "tested": [
      {
        "lon": -102.848,
        "lat": 48.86776,
        "id": "4956000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "Bowman",
    "fips": "38011",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='Bowman'",
    "tested": [
      {
        "lon": -103.96645,
        "lat": 46.14433,
        "id": "33000005017000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "Divide",
    "fips": "38023",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='Divide'",
    "tested": [
      {
        "lon": -102.90219,
        "lat": 48.68035,
        "id": "27000000650000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "Cass",
    "fips": "38017",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='Cass'",
    "tested": [
      {
        "lon": -96.80523,
        "lat": 46.93154,
        "id": "1-8610-00090-000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "Eddy",
    "fips": "38027",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='Eddy'",
    "tested": [
      {
        "lon": -98.75103,
        "lat": 47.6419,
        "id": "2000000293000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "Emmons",
    "fips": "38029",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='Emmons'",
    "tested": [
      {
        "lon": -100.03839,
        "lat": 46.12688,
        "id": "35000002501010",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "Hettinger",
    "fips": "38041",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='Hettinger'",
    "tested": [
      {
        "lon": -102.72327,
        "lat": 46.55385,
        "id": "6000000926000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "Grant",
    "fips": "38037",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='Grant'",
    "tested": [
      {
        "lon": -101.12791,
        "lat": 46.23453,
        "id": "36176900-RD",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "Kidder",
    "fips": "38043",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='Kidder'",
    "tested": [
      {
        "lon": -99.97249,
        "lat": 47.28102,
        "id": "39019013",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "LaMoure",
    "fips": "38045",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='LaMoure'",
    "tested": [
      {
        "lon": -98.47218,
        "lat": 46.53718,
        "id": "380250120",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "Logan",
    "fips": "38047",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='Logan'",
    "tested": [
      {
        "lon": -99.4189,
        "lat": 46.40806,
        "id": "1633001",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "Mercer",
    "fips": "38057",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='Mercer'",
    "tested": [
      {
        "lon": -101.49922,
        "lat": 47.43326,
        "id": "3146850027600",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "Rolette",
    "fips": "38079",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='Rolette'",
    "tested": [
      {
        "lon": -99.61647,
        "lat": 48.83037,
        "id": "16000016164000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "Morton",
    "fips": "38059",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='Morton'",
    "tested": [
      {
        "lon": -101.38051,
        "lat": 46.85767,
        "id": "450050000",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "Traill",
    "fips": "38097",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='Traill'",
    "tested": [
      {
        "lon": -97.22511,
        "lat": 47.56111,
        "id": "17000002651001",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  },
  {
    "state": "ND",
    "county": "Mountrail",
    "fips": "38061",
    "provider": "North Dakota GIS Hub",
    "dataset": "Statewide parcels",
    "url": "https://services1.arcgis.com/GOcSXpzwBHyk2nog/ArcGIS/rest/services/NDGISHUB_Parcels/FeatureServer",
    "queryLayer": 0,
    "fields": {
      "apn": "GISID"
    },
    "outFields": "GISID",
    "minZoom": 14,
    "kind": "Official",
    "checked": "2026-10-11",
    "coverage": "Available",
    "note": "North Dakota GIS Hub statewide parcels, not the county recorder. The click is limited to this county and requests GISID only. An ownership field exists and is not requested. A miss is not proof the land is unparceled. It is not a title search.",
    "sourceType": "state-composite",
    "coverageClass": "verified-state",
    "adapterVersion": 1,
    "queryMethod": "esriSpatialRelIntersects point",
    "spatialReference": "EPSG:4326",
    "geometryType": "polygon",
    "health": "ok",
    "where": "CountyName='Mountrail'",
    "tested": [
      {
        "lon": -102.34537,
        "lat": 48.37791,
        "id": "100014600",
        "date": "2026-10-11",
        "result": "polygon and parcel id"
      }
    ]
  }
];

export const ROAD_LAYER = {
  id: "roads",
  label: "Roads",
  provider: "Esri",
  dataset: "World Transportation reference overlay",
  url: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer",
  vintage: "Reference roads drawn over the basemap. Not a survey of legal access, easements, or driveways.",
  kind: "Commercial reference",
  okDetail: "Road lines are drawn on top of the basemap. They are not proof of legal access.",
  failDetail: "The road overlay did not return a tile. The basemap was left as it was.",
  gateDetail: "Road lines are requested with the overlay. A missing tile is not a finding of no road.",
};

const BY_ID = new Map([...LAYER_INFO, ROAD_LAYER].map((row) => [row.id, row]));

export function layerInfo(id) {
  return BY_ID.get(id) || null;
}

export const COVERAGE_LABEL = {
  "verified-county": "Verified county parcel clicks",
  "verified-state": "Verified state composite",
  "visual-only": "Visual boundaries only",
  "partial": "Partial / ambiguous",
  "not-tested": "Unavailable / not tested",
};

export function parcelSourceFor(county) {
  if (!county) return null;
  const state = county.state;
  const name = String(county.name || county.county || "").toLowerCase();
  return COUNTY_PARCEL_SOURCES.find((row) => row.state === state && row.county.toLowerCase() === name) || null;
}

export function coverageOf(county) {
  const source = parcelSourceFor(county);
  const status = source?.health === "unavailable"
    ? "not-tested"
    : (source?.coverageClass || (county && book.byFips?.[county.fips]) || "not-tested");
  return {
    status,
    label: COVERAGE_LABEL[status] || status,
    source: source?.health === "unavailable" ? null : source,
    unavailable: source?.health === "unavailable" ? source : null,
  };
}

export function coverageCounts() {
  return { ...book.counts, universe: book.universe, asOf: book.asOf, scope: book.scope };
}

/** Blank, zero, and name labels are not parcel ids. */
export function usableParcelId(value) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  if (/^(n\/?a|nap|\?+|--|none|null|0+)$/i.test(text)) return "";
  if (/^city of /i.test(text)) return "";
  return text;
}

export function parcelQuery(source, lng, lat) {
  const fields = source.outFields || source.fields?.apn || "*";
  const where = source.where ? `&where=${encodeURIComponent(source.where)}` : "";
  return `${source.url}/${source.queryLayer}/query?geometry=${lng},${lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=${encodeURIComponent(fields)}&returnGeometry=true&outSR=4326&resultRecordCount=8${where}&f=geojson`;
}

/** Tile/request bookkeeping. Wording stays off “safe”, “clear”, and “no risk”. */
export function nextTileStatus(current, event) {
  const loads = current.loads || 0;
  const errors = current.errors || 0;
  if (event === "off") return { state: "Not checked", loads: 0, errors: 0 };
  if (event === "gate") return { state: "Not checked", loads, errors };
  if (event === "load") {
    const n = loads + 1;
    return { state: errors > 0 ? "Partial coverage" : "Available", loads: n, errors };
  }
  if (event === "error") {
    const e = errors + 1;
    if (loads === 0 && e >= 3) return { state: "Unavailable", loads, errors: e };
    if (loads > 0) return { state: "Partial coverage", loads, errors: e };
    return { state: "Loading", loads, errors: e };
  }
  if (event === "timeout") {
    if (loads > 0) return { state: errors ? "Partial coverage" : "Available", loads, errors };
    return { state: "Unavailable", loads, errors };
  }
  if (event === "empty") return { state: "Available", loads, errors };
  if (event === "stale") return { state: "Stale", loads, errors };
  if (event === "offline") return { state: "Unavailable", loads, errors };
  return { ...current, loads, errors };
}

export function detailFor(id, event, state) {
  const info = layerInfo(id);
  if (!info) return "";
  if (event === "off") return "Not requested. Nothing was read from this service.";
  if (event === "gate") return info.gateDetail;
  if (event === "empty") return info.emptyDetail || info.okDetail;
  if (event === "stale") return `Showing the last answer. A newer request failed. ${info.okDetail}`;
  if (event === "offline") return "This browser is offline. The overlay was not requested.";
  if (state === "Unavailable") return info.failDetail;
  if (state === "Partial coverage") return `${info.okDetail} Some tiles failed, so coverage in this view is partial.`;
  if (state === "Available") return info.okDetail;
  if (state === "Loading") return "Waiting for the service.";
  return info.gateDetail || "";
}

export const ZOOM_GATE = {
  parcels: { min: 15, max: 17 },
  terrain: { min: 6, max: 16 },
  flood: { min: 13, max: 18 },
  hazard: { min: 5, max: 14 },
};
