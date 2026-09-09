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
      text: 'At around 8:40am on 2026-08-26, part of the glacier below Langtang Lirung Peak breaks away, registering as a 5.2 seismic event.',
    },
  },
  {
    id: 'border-crossing-rasu',
    title: 'Border Crossing, CCTV',
    location: 'Rasuwagadhi',
    description: 'CCTV cameras capture debris flow destroy border crossing.',
    center: [85.367247, 28.259807],
    zoom: 18,
    pitch: 39,
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
          youtubeUrl: 'https://youtu.be/oq7EXEEpQlg?si=R5TpYXDI3y3wR3l_',
          title: 'Video 1 & 2',
          sourceHref: 'https://x.com/MrGafish/status/2092547312518348820?s=46',
        },
      ],
      text: 'By 9:00am, the debri flow had reach the Tibet/Nepal border crossing, travleing 13 miles to get to this point. CCTV cameras captured the destruction and are time stamped with Beijing time (+2)',
    },
  },
  {
    id: 'work-site',
    title: 'Hydropower work-site',
    location: 'Mailung',
    description: 'Videos capture hydropower site destroyed by debri flow.',
    center: [85.197469, 28.05221],
    zoom: 18,
    pitch: 35,
    bearing: 22.6,
    elevationMeters: 1400,
    distance: {
      label: 'Distance',
      camera: {
        center: [85.298, 28.1804],
        zoom: 11.17,
        pitch: 48,
        bearing: 84.5,
        elevationMeters: 4850,
      },
      overlay: {
        id: 'distance-glacier-to-work-site',
        data: '/data/distance_glacier_to_worksite1.geojson',
        lineColor: '#d71920',
      },
    },
    detail: {
      videos: [
        {
          facebookUrl: 'https://www.facebook.com/reel/1928523987821099',
          title: 'Video 1',
          sourceHref: 'https://www.facebook.com/share/v/1CGYLJchVC/',
        },
        {
          facebookUrl: 'https://www.facebook.com/reel/1538884681259185',
          title: 'Video 2',
          sourceHref: 'https://www.facebook.com/share/v/1BoUyK4qLP/',
        },
      ],
      text: 'In Video 1, workers at the hydropower plant in Mailung capture the debri flow as it approaches. This location is roughly 32 miles away from teh glacier, at an elevation of  ',
    },
  },
  {
    id: 'betrawati-bazaar',
    title: 'The town of Betrawati',
    location: 'Betrawati Bazaar',
    description: 'Videos taken above the town of Betrawati.',
    center: [85.170015, 27.948871],
    zoom: 18,
    pitch: 35, 
    bearing: 22.6,
    elevationMeters: 1400,
    distance: {
      label: 'Distance',
      camera: {
        center: [85.2545, 28.1087],
        zoom: 10.78,
        pitch: 50,
        bearing: 65.8,
        elevationMeters: 4850,
      },
      overlay: {
        id: 'distance-glacier-to-work-site',
        data: '/data/distance_glacier_to_worksite1.geojson',
        lineColor: '#d71920',
      },
    },
    detail: {
      videos: [
        {
          youtubeUrl: 'https://www.youtube.com/watch?v=jnn4s6CkQs4',
          title: 'Betrawati Bazaar',
          sourceHref: 'https://www.youtube.com/watch?v=jnn4s6CkQs4',
        },
        {
          youtubeUrl: 'https://www.youtube.com/watch?v=qjApXYPD2Ow',
          title: 'Betrawati Bazaar',
          sourceHref: 'https://www.youtube.com/watch?v=qjApXYPD2Ow',
        },
      ],
      text: 'Footage from above Betrawati Bazaar shows the town and the path of flood water farther downstream.',
    },
  },
  {
    id: 'trishuli-bidur',
    title: 'The town of Trishuli',
    location: 'The town of Trishuli',
    description: 'Videos taken in the town of Trishuli.',
    center: [85.132904, 27.900052],
    zoom: 18,
    pitch: 35, 
    bearing: 22.6,
    elevationMeters: 1400,
    distance: {
      label: 'Distance',
      camera: {
        center: [85.2545, 28.1087],
        zoom: 10.78,
        pitch: 50,
        bearing: 65.8,
        elevationMeters: 4850,
      },
      overlay: {
        id: 'distance-glacier-to-work-site',
        data: '/data/distance_glacier_to_worksite1.geojson',
        lineColor: '#d71920',
      },
    },
    detail: {
      videos: [
        {
          youtubeUrl: 'https://www.youtube.com/watch?v=P1AodkdPMck',
          title: 'Betrawati Bazaar',
          sourceHref: 'https://www.youtube.com/watch?v=P1AodkdPMck',
        },
        {
          youtubeUrl: 'https://www.youtube.com/watch?v=RiaeLbsMx2o&t=2s',
          title: 'Betrawati Bazaar',
          sourceHref: 'https://www.youtube.com/watch?v=RiaeLbsMx2o&t=2s',
        },
      ],
      text: 'Footage from above Betrawati Bazaar shows the town and the path of flood water farther downstream.',
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
