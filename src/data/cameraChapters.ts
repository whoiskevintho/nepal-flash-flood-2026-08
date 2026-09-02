import type { CameraChapter, MapOverlay } from '../types/mapCamera'

// MapLibre's URL hash uses zoom/lat/lng/bearing/pitch.
// Chapter centers use [lng, lat], so swap the coordinate order when copying from the hash.
export const cameraChapters = [
  {
    id: 'himalaya-overview',
    title: 'Glacier Burst',
    location: 'Glacier Below Langtang Lirung Peak',
    description: 'The Glacier below Langtang Lirung Peak burst, registering as a 5.2 seismic event.',
    center: [85.52396, 28.28729],
    zoom: 13.68,
    pitch: 61,
    bearing: 126.5,
    elevationMeters: 4850,
    detail: {
      beforeAfter: {
        before: {
          src: '/images/glacier_before.webp',
          alt: 'Before satellite view of the glacier area',
        },
        after: {
          src: '/images/glacier_after.webp',
          alt: 'After satellite view of the glacier area',
        },
      },
      // Add sourceHref to each video when you have the original web source URL.
      videos: [
      ],
      text: 'At around 10:30am on 2026-08-26, part of the glacier below Langtang Lirung Peak breaks away, registering as a 5.2 seismic event.',
    },
  },
  {
    id: 'border-crossing-rasu',
    title: 'Border Crossing, CCTV',
    location: 'Rasuwagadhi',
    description: 'Rasu, the border of Nepal and Tibet (China).',
    center: [85.36239, 28.244456],
    zoom: 16.47,
    pitch: 55,
    bearing: 21.4,
    elevationMeters: 1000,
    distance: {
      label: 'Distance',
      camera: {
        center: [85.40324, 28.31172],
        zoom: 12.87,
        pitch: 60,
        bearing: 105.7,
        elevationMeters: 4850,
      },
      overlay: {
        id: 'distance-glacier-to-rasu',
        data: '/data/distance_glacier_to_rasu.geojson',
        lineColor: '#d71920',
      },
    },
    detail: {
      // Add sourceHref to each video when you have the original web source URL.
      videos: [
        {
          src: '/videos/CCTV_nepal-flood-border-crossing-1.mp4',
          title: 'Glacier Burst',
          sourceHref: 'https://x.com/MrGafish/status/2092547312518348820?s=46',
        },
        {
          src: '/videos/CCTV_nepal-flood-border-crossing-2.mp4',
          title: 'Glacier Burst',
          sourceHref: 'https://x.com/MrGafish/status/2092532134649229713',
        },
      ],
      text: 'This chapter focuses on the border crossing area, where CCTV and ground footage can help connect the map view to the path of flood impacts.',
    },
  },
  {
    id: 'work-site',
    title: 'Work Site',
    location: 'Work Site along Trishuli River ',
    description: 'Video taken from work site.',
    center: [85.197469, 28.05221],
    zoom: 18,
    pitch: 35,
    bearing: 22.6,
    elevationMeters: 1400,
    distance: {
      label: 'Distance',
      camera: {
        center: [85.2754, 28.1735],
        zoom: 11.46,
        pitch: 46,
        bearing: 71.7,
        elevationMeters: 4850,
      },
      overlay: {
        id: 'distance-glacier-to-work-site',
        data: '/data/distance_glacier_to_worksite1.geojson',
        lineColor: '#d71920',
      },
    },
    detail: {
      // Add sourceHref to each video when you have the original web source URL.
      videos: [
        {
          src: '/videos/worksite1_video_on_ground.mp4',
          title: 'Worksite Ground',
          sourceHref: 'https://www.facebook.com/reel/1928523987821099',
        },
        {
          src: '/videos/worksite1_video_up_high.mp4',
          title: 'Worksite Up High',
          sourceHref: 'https://www.instagram.com/reel/DcksC1Yx2RA/',
        },
      ],
      text: 'Footage from the work site gives a closer look at the terrain and infrastructure affected farther downstream.',
    },
  },
] satisfies CameraChapter[]

export const globalMapOverlays = [
  {
    id: 'glacier-burst-shape',
    data: '/data/glacier_burst_shape.geojson',
    fillColor: '#ffd400',
    fillOpacity: 0.22,
    lineColor: '#ffd400',
  },
] satisfies MapOverlay[]

export const initialCameraChapter = cameraChapters[0]
