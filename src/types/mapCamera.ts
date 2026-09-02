export type CameraCenter = [longitude: number, latitude: number]

export type MapCamera = {
  center: CameraCenter
  zoom: number
  pitch: number
  bearing: number
  elevationMeters: number
}

export type CameraChapter = MapCamera & {
  id: string
  title: string
  description: string
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
    videos: {
      src: string
      title: string
    }[]
    text: string
  }
}
