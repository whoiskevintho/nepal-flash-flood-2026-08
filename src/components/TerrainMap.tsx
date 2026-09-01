import { useEffect, useRef } from 'react'
import * as maplibregl from 'maplibre-gl'
import type { LayerSpecification, RasterDEMSourceSpecification, RasterSourceSpecification } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const BASE_STYLE_URL = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'
const SATELLITE_SOURCE_ID = 'satelliteSource'
const TERRAIN_SOURCE_ID = 'terrainSource'
const HILLSHADE_SOURCE_ID = 'hillshadeSource'
const TERRAIN_EXAGGERATION = 1
const EVEREST_REGION_CENTER: [number, number] = [85.379, 28.278]
const TERRARIUM_TILES = ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png']

const satelliteSource: RasterSourceSpecification = {
  type: 'raster',
  tiles: [
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  ],
  tileSize: 256,
  attribution:
    'Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
  maxzoom: 20,
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

const hillshadeLayer: LayerSpecification = {
  id: 'hillshade',
  type: 'hillshade',
  source: HILLSHADE_SOURCE_ID,
  paint: {
    'hillshade-shadow-color': '#473b24',
    'hillshade-highlight-color': '#ffffff',
    'hillshade-exaggeration': 0.1,
  },
}

function getFirstSymbolLayerId(map: maplibregl.Map) {
  return map.getStyle().layers?.find((layer) => layer.type === 'symbol')?.id
}

export function TerrainMap() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: BASE_STYLE_URL,
      center: EVEREST_REGION_CENTER,
      zoom: 15.2,
      pitch: 35,
      bearing: 35,
      maxPitch: 85,
      maxZoom: 18,
      renderWorldCopies: false,
      attributionControl: false,
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
      const firstSymbolLayerId = getFirstSymbolLayerId(map)

      map.addSource(SATELLITE_SOURCE_ID, satelliteSource)
      map.addSource(TERRAIN_SOURCE_ID, demSource)
      map.addSource(HILLSHADE_SOURCE_ID, demSource)
      map.addLayer(satelliteLayer, firstSymbolLayerId)
      map.addLayer(hillshadeLayer, firstSymbolLayerId)
      map.setTerrain({ source: TERRAIN_SOURCE_ID, exaggeration: TERRAIN_EXAGGERATION })
      map.setSky({})

      map.addControl(
        new maplibregl.TerrainControl({
          source: TERRAIN_SOURCE_ID,
          exaggeration: TERRAIN_EXAGGERATION,
        }),
        'top-right',
      )
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  return <div ref={containerRef} className="terrain-map" aria-label="3D terrain map of Nepal" />
}
