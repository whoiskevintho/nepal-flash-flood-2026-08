import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import type { FeatureCollection, Point } from 'geojson'
import * as maplibregl from 'maplibre-gl'
import { setWorkerUrl } from 'maplibre-gl'
import type {
  ExpressionSpecification,
  LayerSpecification,
  RasterDEMSourceSpecification,
  RasterSourceSpecification,
  StyleSpecification,
} from 'maplibre-gl'
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import 'maplibre-gl/dist/maplibre-gl.css'
import type {
  MapCamera,
  MapLabel,
  MapLabelOverlay,
  MapLabelPlacement,
  MapOverlay,
  MapShapeOverlay,
} from '../types/mapCamera'

import { Protocol } from 'pmtiles'

setWorkerUrl(maplibreWorkerUrl)

const SATELLITE_SOURCE_ID = 'satelliteSource'
const TERRAIN_SOURCE_ID = 'terrainSource'
const OVERLAY_ID_PREFIX = 'geojson-overlay'
const OVERLAY_FADE_MS = 700
const OVERLAY_FADE = { duration: OVERLAY_FADE_MS, delay: 0 }
const LABEL_SIZE_PX = 18
/** How much bigger label text is at zoom 16 than at zoom 10. */
const LABEL_ZOOM_GROWTH = 28 / 18
const LABEL_COLOR = '#ffffff'
const LABEL_HALO_COLOR = '#111111'
const LABEL_HALO_WIDTH = 0.75
const LABEL_FONT = 'Noto Sans Regular'
const LABEL_ITALIC_FONT = 'Noto Sans Italic'
/** Leader length, from the point to the text, as a multiple of the label's text size. */
const LEADER_LENGTH_EMS = 1.7
const LEADER_LENGTH_PX = 34
const ARROW_LENGTH_PX = 22
const LEADER_DOT_RADIUS_PX = 4.5
const LEADER_LINE_WIDTH_PX = 2.25
/** Clear space between the dot and the line or arrow. */
const MARKER_GAP_PX = 8
const LEADER_PIXEL_RATIO = 2
const TERRAIN_EXAGGERATION = 1
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY as string | undefined
const TERRARIUM_TILES = ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png']

// const satelliteSource: RasterSourceSpecification = {
//   type: 'raster',
//   tiles: [
//     `https://api.maptiler.com/tiles/satellite-v2/{z}/{x}/{y}.jpg?key=${MAPTILER_KEY ?? ''}`,
//   ],
//   tileSize: 256,
//   attribution: 'Satellite imagery © MapTiler',
//   maxzoom: 22,
// }

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

function getOverlayLabelLayerId(overlay: MapOverlay) {
  return `${OVERLAY_ID_PREFIX}-labels-${getSafeOverlayId(overlay)}`
}

function getOverlayFillLayer(overlay: MapShapeOverlay): LayerSpecification {
  return {
    id: getOverlayFillLayerId(overlay),
    type: 'fill',
    source: getOverlaySourceId(overlay),
    paint: {
      'fill-color': overlay.fillColor ?? '#d71920',
      'fill-opacity': 0,
      'fill-opacity-transition': OVERLAY_FADE,
    },
  }
}

/** Distance paths have no fill. Shapes, like the glacier outline, keep the thinner stroke. */
function overlayLineWidth(overlay: MapShapeOverlay): ExpressionSpecification {
  const [near, mid, far] = overlay.fillColor ? [2, 5, 8] : [4, 8, 12]

  return ['interpolate', ['linear'], ['zoom'], 10, near, 15, mid, 18, far]
}

function getOverlayOutlineLayer(overlay: MapShapeOverlay): LayerSpecification {
  return {
    id: getOverlayOutlineLayerId(overlay),
    type: 'line',
    source: getOverlaySourceId(overlay),
    paint: {
      'line-color': overlay.lineColor ?? overlay.fillColor ?? '#d71920',
      'line-opacity': 0,
      'line-opacity-transition': OVERLAY_FADE,
      'line-width': overlayLineWidth(overlay),
    },
  }
}

/** Clockwise degrees from straight up. `placement` is the four main directions. */
const PLACEMENT_BEARING: Record<MapLabelPlacement, number> = {
  above: 0,
  right: 90,
  below: 180,
  left: 270,
}

const TEXT_ANCHORS = [
  'bottom',
  'bottom-left',
  'left',
  'top-left',
  'top',
  'top-right',
  'right',
  'bottom-right',
] as const

function scaledLabelSize(scale: number): ExpressionSpecification {
  return [
    'interpolate',
    ['linear'],
    ['zoom'],
    10,
    ['*', ['get', 'size'], scale],
    16,
    ['*', ['get', 'size'], scale * LABEL_ZOOM_GROWTH],
  ]
}

function normalizeBearing(degrees: number) {
  return ((degrees % 360) + 360) % 360
}

function textBearingOf(label: MapLabel) {
  return normalizeBearing(
    label.textBearing ?? label.bearing ?? PLACEMENT_BEARING[label.placement ?? 'above'],
  )
}

function textAnchorForBearing(bearing: number) {
  return TEXT_ANCHORS[Math.round(bearing / 45) % 8]
}

type CalloutParts = {
  dot: boolean
  line: boolean
}

/** Canvas pixels of black that display as `LABEL_HALO_WIDTH` once the icon is scaled. */
function calloutHaloPx(labelSize: number) {
  const iconScale = labelSize * (LEADER_LENGTH_EMS / LEADER_LENGTH_PX) * LABEL_ZOOM_GROWTH
  return LABEL_HALO_WIDTH / iconScale
}

function createCalloutImage(color: string, parts: CalloutParts, haloPx: number) {
  const logical = (LEADER_LENGTH_PX + 8) * 2
  const canvas = document.createElement('canvas')
  canvas.width = logical * LEADER_PIXEL_RATIO
  canvas.height = logical * LEADER_PIXEL_RATIO
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Canvas 2D is not available to draw map labels.')
  }

  context.scale(LEADER_PIXEL_RATIO, LEADER_PIXEL_RATIO)
  const center = logical / 2
  const tailY = center - LEADER_LENGTH_PX
  const dotClearance = parts.dot ? LEADER_DOT_RADIUS_PX + haloPx + MARKER_GAP_PX : 0
  const tipY = center - dotClearance

  if (parts.line) {
    const strokeLine = (width: number, stroke: string) => {
      context.beginPath()
      context.moveTo(center, tipY)
      context.lineTo(center, tailY)
      context.lineCap = 'round'
      context.lineWidth = width
      context.strokeStyle = stroke
      context.stroke()
    }

    strokeLine(LEADER_LINE_WIDTH_PX + haloPx * 2, LABEL_HALO_COLOR)
    strokeLine(LEADER_LINE_WIDTH_PX, color)
  }

  if (parts.dot) {
    context.beginPath()
    context.arc(center, center, LEADER_DOT_RADIUS_PX + haloPx, 0, Math.PI * 2)
    context.fillStyle = LABEL_HALO_COLOR
    context.fill()
    context.beginPath()
    context.arc(center, center, LEADER_DOT_RADIUS_PX, 0, Math.PI * 2)
    context.fillStyle = color
    context.fill()
  }

  return context.getImageData(0, 0, canvas.width, canvas.height)
}

function createArrowImage(color: string, gapPx: number, haloPx: number) {
  const logical = (LEADER_LENGTH_PX + 8) * 2
  const canvas = document.createElement('canvas')
  canvas.width = logical * LEADER_PIXEL_RATIO
  canvas.height = logical * LEADER_PIXEL_RATIO
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Canvas 2D is not available to draw map labels.')
  }

  context.scale(LEADER_PIXEL_RATIO, LEADER_PIXEL_RATIO)
  const center = logical / 2
  const tailY = center - gapPx
  const tipY = tailY - ARROW_LENGTH_PX
  const headBaseY = tipY + 12
  const headHalf = 8
  const shaftHalf = 2.4

  const drawArrow = (stroke: string | null, fill: string | null) => {
    context.beginPath()
    context.moveTo(center - shaftHalf, tailY)
    context.lineTo(center + shaftHalf, tailY)
    context.lineTo(center + shaftHalf, headBaseY)
    context.lineTo(center + headHalf, headBaseY)
    context.lineTo(center, tipY)
    context.lineTo(center - headHalf, headBaseY)
    context.lineTo(center - shaftHalf, headBaseY)
    context.closePath()
    context.lineJoin = 'round'

    if (stroke) {
      context.lineWidth = haloPx * 2
      context.strokeStyle = stroke
      context.stroke()
    }

    if (fill) {
      context.fillStyle = fill
      context.fill()
    }
  }

  drawArrow(LABEL_HALO_COLOR, null)
  drawArrow(null, color)

  return context.getImageData(0, 0, canvas.width, canvas.height)
}

function ensureCalloutImage(map: maplibregl.Map, color: string, parts: CalloutParts, labelSize: number) {
  const haloPx = calloutHaloPx(labelSize)
  const imageId = `${OVERLAY_ID_PREFIX}-callout-${color}-${parts.dot ? 'd' : ''}${parts.line ? 'l' : ''}-${haloPx.toFixed(3)}`

  if (!map.hasImage(imageId)) {
    map.addImage(imageId, createCalloutImage(color, parts, haloPx), { pixelRatio: LEADER_PIXEL_RATIO })
  }

  return imageId
}

function ensureArrowImage(map: maplibregl.Map, color: string, gapPx: number, haloPx: number) {
  const imageId = `${OVERLAY_ID_PREFIX}-arrow-${color}-${gapPx}-${haloPx.toFixed(3)}`

  if (!map.hasImage(imageId)) {
    map.addImage(imageId, createArrowImage(color, gapPx, haloPx), { pixelRatio: LEADER_PIXEL_RATIO })
  }

  return imageId
}

function getLabelOverlayData(
  map: maplibregl.Map,
  overlay: MapLabelOverlay,
): FeatureCollection<Point> {
  return {
    type: 'FeatureCollection',
    features: overlay.labels.flatMap((label) => {
      const textBearing = textBearingOf(label)
      const color = label.color ?? LABEL_COLOR
      const radians = (textBearing * Math.PI) / 180
      const showDot = label.dot ?? false
      const showLine = label.line ?? showDot
      const showArrow = label.arrow === true || label.arrowBearing !== undefined
      const arrowBearing = normalizeBearing(label.arrowBearing ?? textBearing)
      const labelSize = label.size ?? LABEL_SIZE_PX
      const offsetEms = showLine ? LEADER_LENGTH_EMS + 0.35 : showDot ? 0.9 : 0.5
      const features: FeatureCollection<Point>['features'] = [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: label.coordinates },
          properties: {
            text: label.text,
            color,
            italic: label.italic ?? false,
            size: labelSize,
            bearing: textBearing,
            anchor: textAnchorForBearing(textBearing),
            textOffset: [Math.sin(radians) * offsetEms, -Math.cos(radians) * offsetEms],
            calloutImage:
              showDot || showLine
                ? ensureCalloutImage(map, color, { dot: showDot, line: showLine }, labelSize)
                : '',
          },
        },
      ]

      if (showArrow) {
        features.push({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: label.coordinates },
          properties: {
            text: '',
            color,
            italic: false,
            size: labelSize,
            bearing: arrowBearing,
            anchor: 'center',
            textOffset: [0, 0],
            calloutImage: ensureArrowImage(
              map,
              color,
              showDot ? LEADER_DOT_RADIUS_PX + calloutHaloPx(labelSize) + MARKER_GAP_PX : 0,
              calloutHaloPx(labelSize),
            ),
          },
        })
      }

      return features
    }),
  }
}

function getOverlayLabelLayer(overlay: MapLabelOverlay): LayerSpecification {
  return {
    id: getOverlayLabelLayerId(overlay),
    type: 'symbol',
    source: getOverlaySourceId(overlay),
    layout: {
      'text-field': ['get', 'text'],
      'text-font': [
        'case',
        ['get', 'italic'],
        ['literal', [LABEL_ITALIC_FONT]],
        ['literal', [LABEL_FONT]],
      ],
      'text-size': scaledLabelSize(1),
      'text-anchor': ['get', 'anchor'],
      'text-offset': ['get', 'textOffset'],
      'text-pitch-alignment': 'viewport',
      'text-rotation-alignment': 'viewport',
      'text-allow-overlap': true,
      'icon-image': ['get', 'calloutImage'],
      'icon-anchor': 'center',
      'icon-rotate': ['get', 'bearing'],
      'icon-size': scaledLabelSize(LEADER_LENGTH_EMS / LEADER_LENGTH_PX),
      'icon-pitch-alignment': 'viewport',
      'icon-rotation-alignment': 'viewport',
      'icon-allow-overlap': true,
      'symbol-height-anchor': 'ground',
      'symbol-height-offset': 40,
    },
    paint: {
      'text-color': ['get', 'color'],
      'text-halo-color': LABEL_HALO_COLOR,
      'text-halo-width': LABEL_HALO_WIDTH,
      'text-opacity': 0,
      'text-opacity-transition': OVERLAY_FADE,
      'icon-opacity': 0,
      'icon-opacity-transition': OVERLAY_FADE,
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

const pendingOverlayRemovals = new WeakMap<
  maplibregl.Map,
  Map<string, ReturnType<typeof setTimeout>>
>()

function getPendingOverlayRemovals(map: maplibregl.Map) {
  let pending = pendingOverlayRemovals.get(map)

  if (!pending) {
    pending = new Map()
    pendingOverlayRemovals.set(map, pending)
  }

  return pending
}

function clearPendingOverlayRemovals(map: maplibregl.Map) {
  pendingOverlayRemovals.get(map)?.forEach((timeout) => clearTimeout(timeout))
  pendingOverlayRemovals.delete(map)
}

function showOverlay(map: maplibregl.Map, overlay: MapOverlay) {
  if (overlay.labels) {
    const labelLayerId = getOverlayLabelLayerId(overlay)

    if (map.getLayer(labelLayerId)) {
      map.setPaintProperty(labelLayerId, 'text-opacity', 1)
      map.setPaintProperty(labelLayerId, 'icon-opacity', 1)
    }

    return
  }

  const fillLayerId = getOverlayFillLayerId(overlay)
  const outlineLayerId = getOverlayOutlineLayerId(overlay)

  if (map.getLayer(fillLayerId)) {
    map.setPaintProperty(fillLayerId, 'fill-opacity', overlay.fillOpacity ?? 0.24)
  }

  if (map.getLayer(outlineLayerId)) {
    map.setPaintProperty(outlineLayerId, 'line-opacity', 1)
  }
}

function showOverlayWhenLoaded(map: maplibregl.Map, overlay: MapOverlay) {
  const sourceId = getOverlaySourceId(overlay)

  const onSourceData = () => {
    if (!map.getSource(sourceId)) {
      map.off('sourcedata', onSourceData)
      return
    }

    if (!map.isSourceLoaded(sourceId)) {
      return
    }

    map.off('sourcedata', onSourceData)

    if (!getPendingOverlayRemovals(map).has(sourceId)) {
      showOverlay(map, overlay)
    }
  }

  map.on('sourcedata', onSourceData)
}

function addOverlay(map: maplibregl.Map, overlay: MapOverlay) {
  if (overlay.labels) {
    map.addSource(getOverlaySourceId(overlay), {
      type: 'geojson',
      data: getLabelOverlayData(map, overlay),
    })
    map.addLayer(getOverlayLabelLayer(overlay))
  } else {
    map.addSource(getOverlaySourceId(overlay), {
      type: 'geojson',
      data: overlay.data,
    })

    if (overlay.fillColor) {
      map.addLayer(getOverlayFillLayer(overlay))
    }

    map.addLayer(getOverlayOutlineLayer(overlay))
  }

  showOverlayWhenLoaded(map, overlay)
}

type OpacityProperty = 'fill-opacity' | 'line-opacity' | 'text-opacity' | 'icon-opacity'

const OPACITY_PROPERTIES: Partial<Record<LayerSpecification['type'], OpacityProperty[]>> = {
  fill: ['fill-opacity'],
  line: ['line-opacity'],
  symbol: ['text-opacity', 'icon-opacity'],
}

function fadeOutOverlay(map: maplibregl.Map, sourceId: string) {
  const pending = getPendingOverlayRemovals(map)

  if (pending.has(sourceId)) {
    return
  }

  const layerIds = (map.getStyle().layers ?? [])
    .filter((layer) => 'source' in layer && layer.source === sourceId)
    .map((layer) => {
      OPACITY_PROPERTIES[layer.type]?.forEach((property) => {
        map.setPaintProperty(layer.id, property, 0)
      })
      return layer.id
    })

  pending.set(
    sourceId,
    setTimeout(() => {
      pending.delete(sourceId)
      layerIds
        .filter((layerId) => map.getLayer(layerId))
        .forEach((layerId) => map.removeLayer(layerId))

      if (map.getSource(sourceId)) {
        map.removeSource(sourceId)
      }
    }, OVERLAY_FADE_MS),
  )
}

function bringLabelsToFront(map: maplibregl.Map) {
  map
    .getStyle()
    .layers?.filter((layer) => layer.id.startsWith(`${OVERLAY_ID_PREFIX}-labels-`))
    .forEach((layer) => {
      map.moveLayer(layer.id)
    })
}

function setActiveOverlays(map: maplibregl.Map, overlays: MapOverlay[]) {
  const keepSourceIds = new Set(overlays.map(getOverlaySourceId))
  const pending = getPendingOverlayRemovals(map)

  Object.keys(map.getStyle().sources)
    .filter(
      (sourceId) =>
        sourceId.startsWith(`${OVERLAY_ID_PREFIX}-source-`) && !keepSourceIds.has(sourceId),
    )
    .forEach((sourceId) => fadeOutOverlay(map, sourceId))

  overlays.forEach((overlay) => {
    const sourceId = getOverlaySourceId(overlay)
    const pendingRemoval = pending.get(sourceId)

    if (pendingRemoval) {
      clearTimeout(pendingRemoval)
      pending.delete(sourceId)
      showOverlay(map, overlay)
    } else if (!map.getSource(sourceId)) {
      addOverlay(map, overlay)
    }
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

export type TerrainMapHandle = {
  jumpTo: (camera: MapCamera) => void
  /** True once terrain is loaded and cameras land at their authored elevation. */
  isReady: () => boolean
}

type TerrainMapProps = {
  camera: MapCamera
  overlays?: MapOverlay[]
}

export const TerrainMap = forwardRef<TerrainMapHandle, TerrainMapProps>(function TerrainMap(
  { camera, overlays = [] },
  ref,
) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const cameraRef = useRef(camera)
  const overlaysRef = useRef(overlays)
  const terrainReadyRef = useRef(false)

  useEffect(() => {
    overlaysRef.current = overlays
  }, [overlays])

  useImperativeHandle(ref, () => ({
    jumpTo(nextCamera: MapCamera) {
      const map = mapRef.current
      cameraRef.current = nextCamera

      if (!map) {
        return
      }

      if (terrainReadyRef.current) {
        jumpToChapter(map, nextCamera)
      } else {
        map.jumpTo(getChapterCamera(nextCamera))
      }
    },
    isReady() {
      return terrainReadyRef.current
    },
  }))

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return
    }

    const initialCamera = cameraRef.current

    const protocol = new Protocol()
    maplibregl.addProtocol('pmtiles', protocol.tile)

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: terrainStyle,
      center: initialCamera.center,
      zoom: initialCamera.zoom,
      pitch: initialCamera.pitch,
      bearing: initialCamera.bearing,
      maxPitch: 85,
      maxZoom: 18,
      interactive: false,
      renderWorldCopies: false,
      attributionControl: false,
    })

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')

    map.once('load', () => {
      setActiveOverlays(map, overlaysRef.current)
      map.setTerrain({ source: TERRAIN_SOURCE_ID, exaggeration: TERRAIN_EXAGGERATION })
      map.setSky({})

      map.once('idle', () => {
        terrainReadyRef.current = true
        map.resize()
        jumpToChapter(map, cameraRef.current)
      })
    })

    mapRef.current = map

    return () => {
      clearPendingOverlayRemovals(map)
      map.remove()
      mapRef.current = null
      terrainReadyRef.current = false
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current

    if (!map || !terrainReadyRef.current) {
      return
    }

    setActiveOverlays(map, overlays)
  }, [overlays])

  return <div ref={containerRef} className="terrain-map" aria-label="3D terrain map of Nepal" />
})
