import type { CameraChapter, MapOverlay } from '../types/mapCamera'

// Highlight phrases in detail.text with [[red:...]] or [[yellow:...]].
export const cameraChapters = [
  {
    id: 'himalaya-overview',
    title: 'Glacier Collapse',
    location: 'Glacier Below Langtang Lirung Peak',
    description: 'The Glacier below Langtang Lirung Peak collapsed, registering as a 5.2 seismic event.',
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
      text: 'At approximately 8:37 a.m. local time in Nepal on August 26, 2026, a section of the glacier beneath Langtang Lirung Peak collapsed, generating a seismic event measured at magnitude 5.2. The [[yellow:yellow]] area was traced from satellite imagery and represents the approximate extent of the ice and bedrock that detached during the collapse. The highlighted area measures approximately one mile across and half a mile wide, and sits at an elevation of [[red:16,880 feet]]. The valley floor below is at an elevation of 12,150 feet – meaning the debris fell [[red:4,730 feet]] at the start of the slide.',
    },
  },
  {
    id: 'border-crossing-rasu',
    title: 'Border crossing, CCTV',
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
      text: 'By 8:45 a.m., the debris flow had reached the Tibet–Nepal border crossing, traveling approximately [[red:13 miles]] downstream and descending [[red:10,900 feet]] from the glacier to an elevation of approximately [[red:5,980]] feet. The first half of [[yellow:Video 1 & 2]] was captured by a CCTV camera pointed south west, at the main border crossing building. The second half is filmed from the same location, by a second camera looking north west up the Trishuli River. The footage is time stamped in China Standard Time, two hours and 15 minutes ahead of local Nepal Time. ',
    },
  },
  {
    id: 'work-site',
    title: 'Hydropower site at Mailung',
    location: 'Mailung',
    description: 'Videos capture hydropower site destroyed by debris flow.',
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
      text: 'Workers and onlookers captured the debris flow as it rapidly approached and ultimately destroyed a hydropower facility in Mailung, approximately [[red:32 miles]] downstream from the glacier. By this point, the flow had descended [[red:13,880 feet]] in elevation, reaching this site at an elevation of approximately [[red:3,000 feet]]. In [[yellow:Video 1]], a worker at the hydropower site films the appraoching flood from upstream. [[yellow:Video 2]] is captured by an onlooker from a higher elevation on the left side of the Tishuli river, looking north east and upstream.',
    },
  },
  {
    id: 'betrawati-bazaar',
    title: 'The town of Betrawati',
    location: 'Betrawati',
    description: 'Videos taken of the town of Betrawati.',
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
        data: '/data/distance_glacier_to_betrawati.geojson',
        lineColor: '#d71920',
      },
    },
    detail: {
      videos: [
        {
          youtubeUrl: 'https://www.youtube.com/watch?v=jnn4s6CkQs4',
          title: 'Video 1',
          sourceHref: 'https://www.youtube.com/watch?v=jnn4s6CkQs4',
        },
        {
          youtubeUrl: 'https://www.youtube.com/watch?v=qjApXYPD2Ow',
          title: 'Video 2',
          sourceHref: 'https://www.youtube.com/watch?v=qjApXYPD2Ow',
        },
      ],
      text: 'The town of Betrawati is located approximately [[red:39 miles]] downstream from the glacier and sits at an elevation of approximately [[red:2,000 feet]]. At this point the debris flow had descended approximately [[red:14,880 feet]] in elevation. [[yellow:Video 1]] is filmed from a higher elevation north of town, looking south downstream, and captures the main flow as it enters town and pushes up a tributary river. [[yellow:Video 2]] was captured from a lower elevation along the Tishuli River, looking west as the debris flow violently rushes past and climbs 440 feet above the previous riverbank.',
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
        data: '/data/distance_glacier_to_trishuli.geojson',
        lineColor: '#d71920',
      },
    },
    detail: {
      videos: [
        {
          youtubeUrl: 'https://www.youtube.com/watch?v=P1AodkdPMck',
          title: 'Video 1',
          sourceHref: 'https://www.youtube.com/watch?v=P1AodkdPMck',
        },
        {
          youtubeUrl: 'https://www.youtube.com/watch?v=RiaeLbsMx2o&t=2s',
          title: 'Video 2',
          sourceHref: 'https://www.youtube.com/watch?v=RiaeLbsMx2o&t=2s',
        },
      ],
      text: 'The town of Trishuli is located approximately [[red:44 miles]] downstream from the glacier and sits at an elevation of approximately [[red:1,790 feet]]. The debris flow has now descended approximately [[red:15,090 feet]] in elevation. [[yellow:Video 1]] was captured from the roof of a Buddhist temple, looking north upstream, and shows the debris flow as it enters the town. [[yellow:Video 2]] is captured just north of the town and looks north upstream as the debris flow approaches the center of Trishuli.',
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
