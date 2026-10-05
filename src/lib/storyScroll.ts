import type { MapCamera, TextBox } from '../types/mapCamera'

const HASH_PREFIX = '#camera='

function roundTo(value: number, digits: number) {
  const scale = 10 ** digits
  return Math.round(value * scale) / scale
}

export function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

function lerp(start: number, end: number, t: number) {
  return start + (end - start) * t
}

function lerpAngle(start: number, end: number, t: number) {
  const delta = ((((end - start) % 360) + 540) % 360) - 180
  return start + delta * t
}

export function roundCamera(camera: MapCamera): MapCamera {
  return {
    center: [roundTo(camera.center[0], 5), roundTo(camera.center[1], 5)],
    zoom: roundTo(camera.zoom, 2),
    pitch: roundTo(camera.pitch, 1),
    bearing: roundTo(camera.bearing, 1),
    elevationMeters: Math.round(camera.elevationMeters),
  }
}

export function formatCameraSnippet(camera: MapCamera) {
  const rounded = roundCamera(camera)
  const [lng, lat] = rounded.center

  return [
    `center: [${lng}, ${lat}],`,
    `zoom: ${rounded.zoom},`,
    `pitch: ${rounded.pitch},`,
    `bearing: ${rounded.bearing},`,
    `elevationMeters: ${rounded.elevationMeters},`,
  ].join('\n')
}

export function formatCameraHash(camera: MapCamera) {
  const rounded = roundCamera(camera)
  const [lng, lat] = rounded.center

  return `${HASH_PREFIX}${rounded.zoom}/${lat}/${lng}/${rounded.bearing}/${rounded.pitch}/${rounded.elevationMeters}`
}

export function parseCameraHash(hash: string): MapCamera | null {
  if (!hash.startsWith(HASH_PREFIX)) {
    return null
  }

  const parts = hash.slice(HASH_PREFIX.length).split('/')

  if (parts.length !== 6 || parts.some((part) => part.trim() === '' || Number.isNaN(Number(part)))) {
    return null
  }

  const [zoom, lat, lng, bearing, pitch, elevation] = parts.map(Number)

  return {
    center: [lng, lat],
    zoom,
    pitch,
    bearing,
    elevationMeters: elevation,
  }
}

export function writeCameraHash(camera: MapCamera) {
  const next = formatCameraHash(camera)

  if (window.location.hash === next) {
    return
  }

  window.history.replaceState(null, '', next)
}

function fadeVhOf(box: TextBox) {
  return box.motion === 'rise' ? 0 : (box.fadeVh ?? 0)
}

export function boxSlotVh(box: TextBox) {
  return fadeVhOf(box) * 2 + box.holdVh + box.gapVh
}

export function chapterHeightVh(boxes: TextBox[]) {
  return boxes.reduce((sum, box) => sum + boxSlotVh(box), 0)
}

export function camerasNearlyEqual(a: MapCamera, b: MapCamera) {
  const rawBearing = Math.abs(a.bearing - b.bearing) % 360
  const bearingDelta = rawBearing > 180 ? 360 - rawBearing : rawBearing

  return (
    Math.abs(a.center[0] - b.center[0]) < 0.000001 &&
    Math.abs(a.center[1] - b.center[1]) < 0.000001 &&
    Math.abs(a.zoom - b.zoom) < 0.001 &&
    Math.abs(a.pitch - b.pitch) < 0.02 &&
    bearingDelta < 0.02 &&
    Math.abs(a.elevationMeters - b.elevationMeters) < 0.5
  )
}

export function lerpCamera(start: MapCamera, end: MapCamera, t: number): MapCamera {
  const progress = clamp01(t)

  return {
    center: [lerp(start.center[0], end.center[0], progress), lerp(start.center[1], end.center[1], progress)],
    zoom: lerp(start.zoom, end.zoom, progress),
    pitch: lerp(start.pitch, end.pitch, progress),
    bearing: lerpAngle(start.bearing, end.bearing, progress),
    elevationMeters: lerp(start.elevationMeters, end.elevationMeters, progress),
  }
}

function toMercator([lng, lat]: [number, number]) {
  const sin = Math.sin((lat * Math.PI) / 180)

  return {
    x: (lng + 180) / 360,
    y: 0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI),
  }
}

function fromMercator(x: number, y: number): [number, number] {
  const lat = (Math.atan(Math.sinh(Math.PI * (1 - 2 * y))) * 180) / Math.PI
  return [x * 360 - 180, lat]
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

/**
 * Camera at time `t` (0–1) of a flight between chapters. Zooms out partway
 * when the two views are too far apart to see each other. At `t = 1` it is exactly `to`.
 */
export function flightCamera(from: MapCamera, to: MapCamera, t: number, viewportPx: number): MapCamera {
  const k = easeInOutCubic(clamp01(t))
  const a = toMercator(from.center)
  const b = toMercator(to.center)
  const distance = Math.hypot(b.x - a.x, b.y - a.y)
  const fitZoom = distance > 0 ? Math.log2(viewportPx / (64 * distance * 1.5)) : Infinity
  const dip = Math.max(0, Math.min(from.zoom, to.zoom) - fitZoom)

  return {
    center: fromMercator(lerp(a.x, b.x, k), lerp(a.y, b.y, k)),
    zoom: lerp(from.zoom, to.zoom, k) - dip * Math.sin(Math.PI * k),
    pitch: lerp(from.pitch, to.pitch, k),
    bearing: lerpAngle(from.bearing, to.bearing, k),
    elevationMeters: lerp(from.elevationMeters, to.elevationMeters, k),
  }
}

export function boxOpacity(box: TextBox, intoVh: number) {
  const fadeVh = fadeVhOf(box)
  const visibleVh = fadeVh * 2 + box.holdVh

  if (intoVh <= 0 || intoVh >= visibleVh) {
    return intoVh <= 0 && fadeVh <= 0 && box.holdVh > 0 && box.motion === 'pin' ? 1 : 0
  }

  if (intoVh < fadeVh) {
    return intoVh / fadeVh
  }

  if (intoVh < fadeVh + box.holdVh) {
    return 1
  }

  return (visibleVh - intoVh) / fadeVh
}

export type ActiveTextBox = {
  id: string
  opacity: number
  /** `rise` boxes only: 0 is just below the screen, 1 is just past the top. */
  riseProgress: number
}

export function activeTextBox(boxes: TextBox[], localVh: number): ActiveTextBox | null {
  let cursor = 0

  for (const box of boxes) {
    const slot = boxSlotVh(box)

    if (localVh < cursor + slot) {
      const intoVh = localVh - cursor

      return {
        id: box.id,
        opacity: boxOpacity(box, intoVh),
        riseProgress: box.motion === 'rise' && box.holdVh > 0 ? clamp01(intoVh / box.holdVh) : 0,
      }
    }

    cursor += slot
  }

  return null
}
