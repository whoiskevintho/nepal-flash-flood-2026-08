import { useEffect, useRef } from 'react'
import * as maplibregl from 'maplibre-gl'
import { setWorkerUrl } from 'maplibre-gl'
import type {
  LayerSpecification,
  RasterDEMSourceSpecification,
  RasterSourceSpecification,
  StyleSpecification,
} from 'maplibre-gl'
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { MapCamera, MapOverlay } from '../types/mapCamera'

setWorkerUrl(maplibreWorkerUrl)

const SATELLITE_SOURCE_ID = 'satelliteSource'
const TERRAIN_SOURCE_ID = 'terrainSource'
const OVERLAY_ID_PREFIX = 'geojson-overlay'
const PLACE_LABELS_SOURCE_ID = 'place-labels'
const PLACE_LABELS_LAYER_ID = 'place-labels'
const PLACE_LABELS_DATA = '/data/locations.geojson'
const TERRAIN_EXAGGERATION = 1
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY as string | undefined
const TERRARIUM_TILES = ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png']

const satelliteSource: RasterSourceSpecification = {
  type: 'raster',
  tiles: [
    `https://api.maptiler.com/tiles/satellite-v2/{z}/{x}/{y}.jpg?key=${MAPTILER_KEY ?? ''}`,
  ],
  tileSize: 256,
  attribution: 'Satellite imagery © MapTiler',
  maxzoom: 22,
}

const demSource: RasterDEMSourceSpecification = {
  type: 'raster-dem',
  tiles: TERRARIUM_TILES,
  encoding: 'terrarium',
  tileSize: 256,
  maxzoom: 15,
}

const satelliteLayer: LayerSpecification = {
  id: 'satellite',
  type: 'raster',
  source: SATELLITE_SOURCE_ID,
}

function getSafeOverlayId(overlay: MapOverlay) {
  return overlay.id.replace(/[^a-z0-9-_]/gi, '-')
}

function getOverlaySourceId(overlay: MapOverlay) {
  return `${OVERLAY_ID_PREFIX}-source-${getSafeOverlayId(overlay)}`
}

function getOverlayFillLayerId(overlay: MapOverlay) {
  return `${OVERLAY_ID_PREFIX}-fill-${getSafeOverlayId(overlay)}`
}

function getOverlayOutlineLayerId(overlay: MapOverlay) {
  return `${OVERLAY_ID_PREFIX}-outline-${getSafeOverlayId(overlay)}`
}

function getOverlayFillLayer(overlay: MapOverlay): LayerSpecification {
  return {
    id: getOverlayFillLayerId(overlay),
    type: 'fill',
    source: getOverlaySourceId(overlay),
    paint: {
      'fill-color': overlay.fillColor ?? '#d71920',
      'fill-opacity': overlay.fillOpacity ?? 0.24,
    },
  }
}

function getOverlayOutlineLayer(overlay: MapOverlay): LayerSpecification {
  return {
    id: getOverlayOutlineLayerId(overlay),
  type: 'line',
    source: getOverlaySourceId(overlay),
    paint: {
      'line-color': overlay.lineColor ?? overlay.fillColor ?? '#d71920',
      'line-opacity': 1,
      'line-width': ['interpolate', ['linear'], ['zoom'], 10, 2, 15, 5, 18, 8],
    },
  }
}

function getPlaceLabelsLayer(): LayerSpecification {
  return {
    id: PLACE_LABELS_LAYER_ID,
    type: 'symbol',
    source: PLACE_LABELS_SOURCE_ID,
    layout: {
      'text-field': ['get', 'Location'],
      'text-font': ['Noto Sans Regular'],
      'text-size': ['interpolate', ['linear'], ['zoom'], 10, 18, 16, 28],
      'text-anchor': 'bottom',
      'text-offset': [0, -0.5],
      'text-pitch-alignment': 'viewport',
      'text-rotation-alignment': 'viewport',
      'text-allow-overlap': true,
      'symbol-height-anchor': 'ground',
      'symbol-height-offset': 40,
    },
    paint: {
      'text-color': '#ffffff',
      'text-halo-color': '#111111',
      'text-halo-width': 1.5,
    },
  }
}

const terrainStyle: StyleSpecification = {
  version: 8,
  glyphs: `https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=${MAPTILER_KEY ?? ''}`,
  sources: {
    [SATELLITE_SOURCE_ID]: satelliteSource,
    [TERRAIN_SOURCE_ID]: demSource,
  },
  layers: [satelliteLayer],
}

function removeRenderedOverlays(map: maplibregl.Map) {
  const overlayLayers = map
    .getStyle()
    .layers?.filter((layer) => layer.id.startsWith(`${OVERLAY_ID_PREFIX}-`))
    .reverse()

  overlayLayers?.forEach((layer) => {
    if (map.getLayer(layer.id)) {
      map.removeLayer(layer.id)
    }
  })

  Object.keys(map.getStyle().sources)
    .filter((sourceId) => sourceId.startsWith(`${OVERLAY_ID_PREFIX}-source-`))
    .forEach((sourceId) => {
      if (map.getSource(sourceId)) {
        map.removeSource(sourceId)
      }
    })
}

function addOverlay(map: maplibregl.Map, overlay: MapOverlay) {
  map.addSource(getOverlaySourceId(overlay), {
    type: 'geojson',
    data: overlay.data,
  })

  if (overlay.fillColor) {
    map.addLayer(getOverlayFillLayer(overlay))
  }

  map.addLayer(getOverlayOutlineLayer(overlay))
}

function addPlaceLabels(map: maplibregl.Map) {
  if (!map.getSource(PLACE_LABELS_SOURCE_ID)) {
    map.addSource(PLACE_LABELS_SOURCE_ID, {
      type: 'geojson',
      data: PLACE_LABELS_DATA,
    })
  }

  if (!map.getLayer(PLACE_LABELS_LAYER_ID)) {
    map.addLayer(getPlaceLabelsLayer())
  }
}

function bringPlaceLabelsToFront(map: maplibregl.Map) {
  if (map.getLayer(PLACE_LABELS_LAYER_ID)) {
    map.moveLayer(PLACE_LABELS_LAYER_ID)
  }
}

function setActiveOverlays(map: maplibregl.Map, overlays: MapOverlay[]) {
  removeRenderedOverlays(map)

  overlays.forEach((overlay) => {
    addOverlay(map, overlay)
  })

  bringPlaceLabelsToFront(map)
}

function getChapterCamera(chapter: MapCamera) {
  return {
    center: chapter.center,
    zoom: chapter.zoom,
    pitch: chapter.pitch,
    bearing: chapter.bearing,
  }
}

function getElevatedChapterCamera(chapter: MapCamera) {
  return {
    ...getChapterCamera(chapter),
    elevation: chapter.elevationMeters,
  }
}

function getCurrentElevatedCamera(map: maplibregl.Map) {
  const center = map.getCenter()

  return {
    center: [center.lng, center.lat] as [number, number],
    zoom: map.getZoom(),
    pitch: map.getPitch(),
    bearing: map.getBearing(),
    elevation: map.getCenterElevation(),
  }
}

function jumpToChapter(map: maplibregl.Map, chapter: MapCamera) {
  if (!map.getTerrain()) {
    map.jumpTo(getChapterCamera(chapter))
    return
  }

  map.setCenterClampedToGround(false)
  map.setCenterElevation(chapter.elevationMeters)
  map.jumpTo(getElevatedChapterCamera(chapter))
}

function flyToChapter(map: maplibregl.Map, chapter: MapCamera) {
  map.stop()

  if (!map.getTerrain()) {
    map.flyTo({
      ...getChapterCamera(chapter),
      duration: 1800,
      essential: true,
    })
    return
  }

  const startCamera = getCurrentElevatedCamera(map)

  map.setCenterClampedToGround(false)
  map.setCenterElevation(chapter.elevationMeters)
  map.jumpTo(startCamera)
  map.flyTo({
    ...getElevatedChapterCamera(chapter),
    duration: 1800,
    essential: true,
    freezeElevation: true,
  })
}

type TerrainMapProps = {
  camera: MapCamera
  overlays?: MapOverlay[]
}

export function TerrainMap({ camera, overlays = [] }: TerrainMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const cameraRef = useRef(camera)
  const overlaysRef = useRef(overlays)
  const terrainReadyRef = useRef(false)

  useEffect(() => {
    cameraRef.current = camera
  }, [camera])

  useEffect(() => {
    overlaysRef.current = overlays
  }, [overlays])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return
    }

    const initialCamera = cameraRef.current

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: terrainStyle,
      center: initialCamera.center,
      zoom: initialCamera.zoom,
      pitch: initialCamera.pitch,
      bearing: initialCamera.bearing,
      maxPitch: 85,
      maxZoom: 18,
      renderWorldCopies: false,
      attributionControl: false,
      hash: 'camera',
    })

    map.addControl(
      new maplibregl.NavigationControl({
        visualizePitch: true,
        showCompass: true,
        showZoom: true,
      }),
      'top-right',
    )
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')

    map.once('load', () => {
      setActiveOverlays(map, overlaysRef.current)
      addPlaceLabels(map)
      map.setTerrain({ source: TERRAIN_SOURCE_ID, exaggeration: TERRAIN_EXAGGERATION })
      map.setSky({})

      map.addControl(
        new maplibregl.TerrainControl({
          source: TERRAIN_SOURCE_ID,
          exaggeration: TERRAIN_EXAGGERATION,
        }),
        'top-right',
      )

      map.once('idle', () => {
        terrainReadyRef.current = true
        map.stop()
        jumpToChapter(map, cameraRef.current)
      })
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current

    if (!map || !terrainReadyRef.current) {
      return
    }

    flyToChapter(map, camera)
  }, [camera])

  useEffect(() => {
    const map = mapRef.current

    if (!map || !terrainReadyRef.current) {
      return
    }

    setActiveOverlays(map, overlays)
  }, [overlays])

  return <div ref={containerRef} className="terrain-map" aria-label="3D terrain map of Nepal" />
}
