export type CameraCenter = [longitude: number, latitude: number]

export type MapCamera = {
  center: CameraCenter
  zoom: number
  pitch: number
  bearing: number
  elevationMeters: number
}

export type MapOverlay = {
  id: string
  data: string
  fillColor?: string
  fillOpacity?: number
  lineColor?: string
}

export type TextBoxMotion = 'pin' | 'rise'

export type TextBox = {
  id: string
  text: string
  /** Viewport heights of scrolling while the box is fully visible. */
  holdVh: number
  /** Viewport heights used to fade in, and the same distance to fade out. */
  fadeVh: number
  /** Blank viewport heights after this box, before the next one. */
  gapVh: number
  /** `pin` stays at the bottom. `rise` moves up with the scroll. */
  motion: TextBoxMotion
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
  overlays?: MapOverlay[]
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
