import { useEffect, useRef } from 'react'
import * as maplibregl from 'maplibre-gl'
import type {
  GeoJSONSourceSpecification,
  LayerSpecification,
  RasterDEMSourceSpecification,
  RasterSourceSpecification,
  StyleSpecification,
} from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { CameraChapter } from '../types/mapCamera'

const SATELLITE_SOURCE_ID = 'satelliteSource'
const TERRAIN_SOURCE_ID = 'terrainSource'
const GLACIER_BREAK_SOURCE_ID = 'glacierBreakSource'
const TERRAIN_EXAGGERATION = 1
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY as string | undefined
const TERRARIUM_TILES = ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png']
const GLACIER_BREAK_GEOJSON_URL = '/data/glacier_burst_shape.geojson'

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

const glacierBreakSource: GeoJSONSourceSpecification = {
  type: 'geojson',
  data: GLACIER_BREAK_GEOJSON_URL,
}

const satelliteLayer: LayerSpecification = {
  id: 'satellite',
  type: 'raster',
  source: SATELLITE_SOURCE_ID,
}

const glacierBreakFillLayer: LayerSpecification = {
  id: 'glacier-break-fill',
  type: 'fill',
  source: GLACIER_BREAK_SOURCE_ID,
  paint: {
    'fill-color': '#ffd400',
    'fill-opacity': 0.22,
  },
}

const glacierBreakOutlineLayer: LayerSpecification = {
  id: 'glacier-break-outline',
  type: 'line',
  source: GLACIER_BREAK_SOURCE_ID,
  paint: {
    'line-color': '#ffd400',
    'line-opacity': 1,
    'line-width': ['interpolate', ['linear'], ['zoom'], 10, 2, 15, 5, 18, 8],
  },
}

const terrainStyle: StyleSpecification = {
  version: 8,
  sources: {
    [SATELLITE_SOURCE_ID]: satelliteSource,
    [TERRAIN_SOURCE_ID]: demSource,
    [GLACIER_BREAK_SOURCE_ID]: glacierBreakSource,
  },
  layers: [satelliteLayer],
}

function addGlacierBreakLayers(map: maplibregl.Map) {
  if (!map.getLayer(glacierBreakFillLayer.id)) {
    map.addLayer(glacierBreakFillLayer)
  }

  if (!map.getLayer(glacierBreakOutlineLayer.id)) {
    map.addLayer(glacierBreakOutlineLayer)
  }
}

function getChapterCamera(chapter: CameraChapter) {
  return {
    center: chapter.center,
    zoom: chapter.zoom,
    pitch: chapter.pitch,
    bearing: chapter.bearing,
  }
}

function getElevatedChapterCamera(chapter: CameraChapter) {
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

function jumpToChapter(map: maplibregl.Map, chapter: CameraChapter) {
  if (!map.getTerrain()) {
    map.jumpTo(getChapterCamera(chapter))
    return
  }

  map.setCenterClampedToGround(false)
  map.setCenterElevation(chapter.elevationMeters)
  map.jumpTo(getElevatedChapterCamera(chapter))
}

function flyToChapter(map: maplibregl.Map, chapter: CameraChapter) {
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
  camera: CameraChapter
}

export function TerrainMap({ camera }: TerrainMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const cameraRef = useRef(camera)
  const terrainReadyRef = useRef(false)

  useEffect(() => {
    cameraRef.current = camera
  }, [camera])

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
      addGlacierBreakLayers(map)
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

  return <div ref={containerRef} className="terrain-map" aria-label="3D terrain map of Nepal" />
}
