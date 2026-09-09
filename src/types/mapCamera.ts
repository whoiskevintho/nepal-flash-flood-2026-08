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

export type CameraChapter = MapCamera & {
  id: string
  title: string
  description: string
  location?: string
  distance?: {
    label: string
    camera: MapCamera
    overlay?: MapOverlay
  }
  detail: {
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
    text: string
  }
}
