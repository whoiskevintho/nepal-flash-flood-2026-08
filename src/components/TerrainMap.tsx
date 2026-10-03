import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
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
import { flightCamera } from '../lib/storyScroll'
import type { MapCamera, MapOverlay } from '../types/mapCamera'

import { Protocol } from 'pmtiles'

setWorkerUrl(maplibreWorkerUrl)

const SATELLITE_SOURCE_ID = 'satelliteSource'
const TERRAIN_SOURCE_ID = 'terrainSource'
const OVERLAY_ID_PREFIX = 'geojson-overlay'
const PLACE_LABELS_SOURCE_ID = 'place-labels'
const PLACE_LABELS_LAYER_ID = 'place-labels'
const PLACE_LABELS_DATA = '/data/locations.geojson'
const VIDEO_LABELS_SOURCE_ID = 'video-labels'
const VIDEO_LABELS_LAYER_ID = 'video-labels'
const VIDEO_LABELS_DATA = '/data/video_locations.geojson'
const TERRAIN_EXAGGERATION = 1
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY as string | undefined
const TERRARIUM_TILES = ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png']

const satelliteSource: RasterSourceSpecification = {
  type: 'raster',
  tiles: [
    'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2024_3857/default/g/{z}/{y}/{x}.jpg',
  ],
  tileSize: 256,
  attribution:
    'Sentinel-2 cloudless by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2024)',
  maxzoom: 14,
}

// const demSource: RasterDEMSourceSpecification = {
//   type: 'raster-dem',
//   url: 'pmtiles://https://pub-890dc02699474df8ae81f43d5c38e315.r2.dev/nepal_terrain_v2.pmtiles',
//   encoding: 'terrarium',
//   tileSize: 256,
//   maxzoom: 14,
// }

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

function getVideoLabelsLayer(): LayerSpecification {
  return {
    id: VIDEO_LABELS_LAYER_ID,
    type: 'symbol',
    source: VIDEO_LABELS_SOURCE_ID,
    layout: {
      'text-field': ['get', 'video'],
      'text-font': ['Noto Sans Regular'],
      'text-size': ['interpolate', ['linear'], ['zoom'], 10, 14, 16, 28],
      'text-anchor': 'top',
      'text-offset': [0, 0.6],
      'text-pitch-alignment': 'viewport',
      'text-rotation-alignment': 'viewport',
      'text-allow-overlap': true,
      'symbol-height-anchor': 'ground',
      'symbol-height-offset': 40,
    },
    paint: {
      'text-color': '#ffd400',
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

function addVideoLabels(map: maplibregl.Map) {
  if (!map.getSource(VIDEO_LABELS_SOURCE_ID)) {
    map.addSource(VIDEO_LABELS_SOURCE_ID, {
      type: 'geojson',
      data: VIDEO_LABELS_DATA,
    })
  }

  if (!map.getLayer(VIDEO_LABELS_LAYER_ID)) {
    map.addLayer(getVideoLabelsLayer())
  }
}

function bringLabelsToFront(map: maplibregl.Map) {
  if (map.getLayer(PLACE_LABELS_LAYER_ID)) {
    map.moveLayer(PLACE_LABELS_LAYER_ID)
  }

  if (map.getLayer(VIDEO_LABELS_LAYER_ID)) {
    map.moveLayer(VIDEO_LABELS_LAYER_ID)
  }
}

function setActiveOverlays(map: maplibregl.Map, overlays: MapOverlay[]) {
  removeRenderedOverlays(map)

  overlays.forEach((overlay) => {
    addOverlay(map, overlay)
  })

  bringLabelsToFront(map)
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

function jumpToChapter(map: maplibregl.Map, chapter: MapCamera) {
  if (!map.getTerrain()) {
    map.jumpTo(getChapterCamera(chapter))
    return
  }

  map.setCenterClampedToGround(false)
  map.setCenterElevation(chapter.elevationMeters)
  map.jumpTo(getElevatedChapterCamera(chapter))
}

function readMapCamera(map: maplibregl.Map): MapCamera {
  const center = map.getCenter()

  return {
    center: [center.lng, center.lat],
    zoom: map.getZoom(),
    pitch: map.getPitch(),
    bearing: map.getBearing(),
    elevationMeters: map.getCenterElevation(),
  }
}

export type TerrainMapHandle = {
  jumpTo: (camera: MapCamera) => void
  flyTo: (camera: MapCamera, durationMs: number) => void
}

type TerrainMapProps = {
  /** Read once, when the map is created and again when terrain is ready. */
  getCamera: () => MapCamera
  overlays?: MapOverlay[]
  interactive?: boolean
  /** Ignore story camera moves from the start, for a camera restored from the URL hash. */
  initialAuthoring?: boolean
  /** Called once terrain is loaded and the map accepts camera moves. */
  onReady?: () => void
  onUserControl?: () => void
  onCameraLive?: (camera: MapCamera) => void
  onCameraCommit?: (camera: MapCamera) => void
}

export const TerrainMap = forwardRef<TerrainMapHandle, TerrainMapProps>(function TerrainMap(
  {
    getCamera,
    overlays = [],
    interactive = false,
    initialAuthoring = false,
    onReady,
    onUserControl,
    onCameraLive,
    onCameraCommit,
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const overlaysRef = useRef(overlays)
  const readyRef = useRef(false)
  const authoringRef = useRef(initialAuthoring)
  const callbacksRef = useRef({ getCamera, onReady, onUserControl, onCameraLive, onCameraCommit })
  const flightFrameRef = useRef(0)

  useEffect(() => {
    overlaysRef.current = overlays
  }, [overlays])

  useEffect(() => {
    callbacksRef.current = { getCamera, onReady, onUserControl, onCameraLive, onCameraCommit }
  })

  useImperativeHandle(ref, () => {
    const cancelFlight = () => {
      window.cancelAnimationFrame(flightFrameRef.current)
      flightFrameRef.current = 0
    }

    const usableMap = () => {
      const map = mapRef.current
      return map && readyRef.current && !authoringRef.current ? map : null
    }

    return {
      jumpTo(nextCamera: MapCamera) {
        const map = usableMap()

        if (map) {
          cancelFlight()
          jumpToChapter(map, nextCamera)
        }
      },
      flyTo(nextCamera: MapCamera, durationMs: number) {
        const map = usableMap()

        if (!map) {
          return
        }

        cancelFlight()
        const from = readMapCamera(map)
        const viewportPx = Math.max(map.getContainer().clientWidth, map.getContainer().clientHeight)
        const startedAt = performance.now()

        const step = (now: number) => {
          const t = Math.min((now - startedAt) / durationMs, 1)

          if (!usableMap()) {
            flightFrameRef.current = 0
            return
          }

          jumpToChapter(map, flightCamera(from, nextCamera, t, viewportPx))
          flightFrameRef.current = t < 1 ? window.requestAnimationFrame(step) : 0
        }

        flightFrameRef.current = window.requestAnimationFrame(step)
      },
    }
  })

  useEffect(() => {
    const container = containerRef.current

    if (!container || mapRef.current) {
      return
    }

    const initialCamera = callbacksRef.current.getCamera()

    const protocol = new Protocol()
    maplibregl.addProtocol('pmtiles', protocol.tile)

    const map = new maplibregl.Map({
      container,
      style: terrainStyle,
      center: initialCamera.center,
      zoom: initialCamera.zoom,
      pitch: initialCamera.pitch,
      bearing: initialCamera.bearing,
      maxPitch: 85,
      maxZoom: 18,
      interactive,
      scrollZoom: false,
      renderWorldCopies: false,
      attributionControl: false,
    })

    if (interactive) {
      map.addControl(
        new maplibregl.NavigationControl({
          visualizePitch: true,
          showCompass: true,
          showZoom: true,
        }),
        'top-right',
      )
    }
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')

    map.on('movestart', (event) => {
      if (!event.originalEvent || authoringRef.current) {
        return
      }

      authoringRef.current = true
      callbacksRef.current.onUserControl?.()
    })

    map.on('move', () => {
      if (!authoringRef.current) {
        return
      }

      callbacksRef.current.onCameraLive?.(readMapCamera(map))
    })

    map.on('moveend', () => {
      if (!authoringRef.current) {
        return
      }

      const liveCamera = readMapCamera(map)
      callbacksRef.current.onCameraLive?.(liveCamera)
      callbacksRef.current.onCameraCommit?.(liveCamera)
    })

    map.once('load', () => {
      addPlaceLabels(map)
      addVideoLabels(map)
      map.setTerrain({ source: TERRAIN_SOURCE_ID, exaggeration: TERRAIN_EXAGGERATION })
      map.setSky({})

      if (interactive) {
        map.addControl(
          new maplibregl.TerrainControl({
            source: TERRAIN_SOURCE_ID,
            exaggeration: TERRAIN_EXAGGERATION,
          }),
          'top-right',
        )
      }

      map.once('idle', () => {
        readyRef.current = true
        map.resize()
        setActiveOverlays(map, overlaysRef.current)
        jumpToChapter(map, callbacksRef.current.getCamera())
        callbacksRef.current.onReady?.()

        map.once('idle', () => {
          container.classList.add('is-ready')
        })
        map.triggerRepaint()
      })
    })

    mapRef.current = map

    return () => {
      window.cancelAnimationFrame(flightFrameRef.current)
      map.remove()
      mapRef.current = null
      readyRef.current = false
    }
  }, [interactive])

  useEffect(() => {
    const map = mapRef.current

    if (!map || !readyRef.current) {
      return
    }

    setActiveOverlays(map, overlays)
  }, [overlays])

  return <div ref={containerRef} className="terrain-map" aria-label="3D terrain map of Nepal" />
})
