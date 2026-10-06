export type CameraCenter = [longitude: number, latitude: number]

export type MapCamera = {
  center: CameraCenter
  zoom: number
  pitch: number
  bearing: number
  elevationMeters: number
}

type MapOverlayBase = {
  id: string
  /** Chapter ids this overlay is shown in. Omit to show it in every chapter. */
  chapterIds?: string[]
}

/** Lines and shapes loaded from a GeoJSON file. */
export type MapShapeOverlay = MapOverlayBase & {
  data: string
  fillColor?: string
  fillOpacity?: number
  lineColor?: string
  labels?: never
}

/** Which side of its point a label sits on. */
export type MapLabelPlacement = 'above' | 'below' | 'left' | 'right'

export type MapLabel = {
  text: string
  coordinates: CameraCenter
  /** Defaults to white. Also colors the arrow. */
  color?: string
  italic?: boolean
  /** Text size in pixels at zoom 10. It grows as the map zooms in. Defaults to 18. */
  size?: number
  /** Defaults to `above`. Ignored when `textBearing` is set. */
  placement?: MapLabelPlacement
  /**
   * Where the text sits, in degrees clockwise from straight up on the screen.
   * The line to the dot follows this direction. Overrides `placement`.
   */
  textBearing?: number
  /** Same as `textBearing`. */
  bearing?: number
  /** Draws a dot on the coordinate and a line from that dot to the text. */
  dot?: boolean
  /** Draws the line from the coordinate to the text without a dot. */
  line?: boolean
  /** Draws an arrow at the coordinate. Aim it with `arrowBearing`. */
  arrow?: boolean
  /** Direction the arrowhead points, in degrees clockwise from straight up. */
  arrowBearing?: number
}

/** Text labels, and optional arrows, written directly in TypeScript. */
export type MapLabelOverlay = MapOverlayBase & {
  labels: MapLabel[]
  data?: never
}

export type MapOverlay = MapShapeOverlay | MapLabelOverlay

export type TextBoxMotion = 'pin' | 'rise'

export type TextBox = {
  id: string
  text: string
  /**
   * Viewport heights of scrolling while the box is fully visible. For `rise` boxes this is
   * the scroll it takes to travel from below the screen to past the top.
   */
  holdVh: number
  /**
   * `pin`: viewport heights of scrolling to fade in, and the same to fade out.
   * `rise`: how close to the bottom and top of the screen, in vh, the box fades in and out.
   */
  fadeVh?: number
  /** Blank viewport heights after this box, before the next one. */
  gapVh: number
  /** `pin` fades in and out at the bottom. `rise` scrolls up from below the screen, no fade. */
  motion: TextBoxMotion
  /** Shows the chapter's before/after slider inside the box. */
  showBeforeAfter?: boolean
  /** Shows the chapter's videos inside the box, with Prev/Next when there are several. */
  showVideos?: boolean
}

export type ChapterVideo = {
  title: string
  sourceHref?: string
} & (
  | {
      src: string
      youtubeUrl?: never
      facebookUrl?: never
    }
  | {
      youtubeUrl: string
      src?: never
      facebookUrl?: never
    }
  | {
      facebookUrl: string
      src?: never
      youtubeUrl?: never
    }
)

export type StoryChapter = {
  id: string
  title: string
  start: MapCamera
  end: MapCamera
  /**
   * Milliseconds to fly from the previous chapter's end to this chapter's start.
   * Omit on the first chapter.
   */
  transitionMs?: number
  boxes: TextBox[]
  /** Kept for a later pass. The scroll story reads `boxes`. */
  detail?: {
    beforeAfter?: {
      before: {
        src: string
        alt: string
      }
      after: {
        src: string
        alt: string
      }
    }
    videos: ChapterVideo[]
  }
}
