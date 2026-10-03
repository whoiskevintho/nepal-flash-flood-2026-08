import type { MapOverlay, StoryChapter, TextBox } from '../types/mapCamera'

// Highlight phrases in box text with [[red:...]] or [[yellow:...]].
// holdVh is how long a box stays fully visible, in viewport heights of scrolling.
// fadeVh is the fade in and the fade out. gapVh is blank scroll after the box.
// motion `pin` stays at the bottom. `rise` moves up at the scroll rate.
// transitionMs is how long the camera flies from the previous chapter's end to this chapter's start.

function pinned(id: string, text: string, holdVh: number, gapVh = 24): TextBox {
  return {
    id,
    text,
    holdVh,
    fadeVh: 18,
    gapVh,
    motion: 'pin',
  }
}

export const storyChapters = [
  {
    id: 'himalaya-overview',
    title: 'Glacier Collapse',
    start: {
      center: [85.52396, 28.28729],
      zoom: 13.68,
      pitch: 61,
      bearing: 126.5,
      elevationMeters: 4850,
    },
    end: {
      center: [85.52396, 28.28729],
      zoom: 14,
      pitch: 61,
      bearing: 126.5,
      elevationMeters: 4850,
    },
    boxes: [
      {
        id: 'himalaya-overview-intro',
        text: 'The Glacier below Langtang Lirung Peak collapsed, registering as a 5.2 seismic event.',
        holdVh: 40,
        fadeVh: 18,
        gapVh: 20,
        motion: 'rise',
      },
      pinned(
        'himalaya-overview-detail',
        'At approximately 8:37 a.m. local time in Nepal on August 26, 2026, a section of the glacier beneath Langtang Lirung Peak collapsed, generating a seismic event measured at magnitude 5.2. The [[yellow:yellow]] area was traced from satellite imagery and represents the approximate extent of the ice and bedrock that detached during the collapse. The highlighted area measures approximately one mile across and half a mile wide, and sits at an elevation of [[red:16,880 feet]]. The valley floor below is at an elevation of 12,150 feet – meaning the debris fell [[red:4,730 feet]] at the start of the slide.',
        90,
        36,
      ),
    ],
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
      videos: [],
    },
  },
  {
    id: 'border-crossing-rasu',
    title: 'Border crossing, CCTV',
    transitionMs: 2000,
    start: {
      center: [85.3688, 28.26166],
      zoom: 16.68,
      pitch: 38.6,
      bearing: 23.3,
      elevationMeters: 1000,
    },
    end: {
      center: [85.3688, 28.26166],
      zoom: 16.68,
      pitch: 38.6,
      bearing: 23.3,
      elevationMeters: 1000,
    },
    overlays: [
      {
        id: 'distance-glacier-to-rasu',
        data: '/data/distance_glacier_to_rasu.geojson',
        lineColor: '#d71920',
      },
    ],
    boxes: [
      pinned(
        'border-crossing-rasu-intro',
        'CCTV cameras capture debris flow destroy border crossing.',
        48,
        16,
      ),
      pinned(
        'border-crossing-rasu-detail',
        'By 8:45 a.m., the debris flow had reached the Tibet–Nepal border crossing, traveling approximately [[red:13 miles]] downstream and descending [[red:10,900 feet]] from the glacier to an elevation of approximately [[red:5,980]] feet. The first half of [[yellow:Video 1 & 2]] was captured by a CCTV camera pointed south west, at the main border crossing building. The second half is filmed from the same location, by a second camera looking north west up the Trishuli River. The footage is time stamped in China Standard Time, two hours and 15 minutes ahead of local Nepal Time. ',
        100,
        36,
      ),
    ],
    detail: {
      videos: [
        {
          youtubeUrl: 'https://youtu.be/oq7EXEEpQlg?si=R5TpYXDI3y3wR3l_',
          title: 'Video 1 & 2',
          sourceHref: 'https://x.com/MrGafish/status/2092547312518348820?s=46',
        },
      ],
    },
  },
  {
    id: 'work-site',
    title: 'Hydropower site at Mailung',
    transitionMs: 2000,
    start: {
      center: [85.197469, 28.05221],
      zoom: 18,
      pitch: 35,
      bearing: 22.6,
      elevationMeters: 1400,
    },
    end: {
      center: [85.197469, 28.05221],
      zoom: 18,
      pitch: 35,
      bearing: 22.6,
      elevationMeters: 1400,
    },
    overlays: [
      {
        id: 'distance-glacier-to-work-site',
        data: '/data/distance_glacier_to_worksite1.geojson',
        lineColor: '#d71920',
      },
    ],
    boxes: [
      pinned(
        'work-site-intro',
        'Videos capture hydropower site destroyed by debris flow.',
        48,
        16,
      ),
      pinned(
        'work-site-detail',
        'Workers and onlookers captured the debris flow as it rapidly approached and ultimately destroyed a hydropower facility in Mailung, approximately [[red:32 miles]] downstream from the glacier. By this point, the flow had descended [[red:13,880 feet]] in elevation, reaching this site at an elevation of approximately [[red:3,000 feet]]. In [[yellow:Video 1]], a worker at the hydropower site films the appraoching flood from upstream. [[yellow:Video 2]] is captured by an onlooker from a higher elevation on the left side of the Tishuli river, looking north east and upstream.',
        100,
        36,
      ),
    ],
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
    },
  },
  {
    id: 'betrawati-bazaar',
    title: 'The town of Betrawati',
    transitionMs: 2000,
    start: {
      center: [85.170015, 27.948871],
      zoom: 18,
      pitch: 35,
      bearing: 22.6,
      elevationMeters: 1400,
    },
    end: {
      center: [85.170015, 27.948871],
      zoom: 18,
      pitch: 35,
      bearing: 22.6,
      elevationMeters: 1400,
    },
    overlays: [
      {
        id: 'distance-glacier-to-betrawati',
        data: '/data/distance_glacier_to_betrawati.geojson',
        lineColor: '#d71920',
      },
    ],
    boxes: [
      pinned('betrawati-bazaar-intro', 'Videos taken of the town of Betrawati.', 48, 16),
      pinned(
        'betrawati-bazaar-detail',
        'The town of Betrawati is located approximately [[red:39 miles]] downstream from the glacier and sits at an elevation of approximately [[red:2,000 feet]]. At this point the debris flow had descended approximately [[red:14,880 feet]] in elevation. [[yellow:Video 1]] is filmed from a higher elevation north of town, looking south downstream, and captures the main flow as it enters town and pushes up a tributary river. [[yellow:Video 2]] was captured from a lower elevation along the Tishuli River, looking west as the debris flow violently rushes past and climbs 440 feet above the previous riverbank.',
        100,
        36,
      ),
    ],
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
    },
  },
  {
    id: 'trishuli-bidur',
    title: 'The town of Trishuli',
    transitionMs: 2000,
    start: {
      center: [85.132904, 27.900052],
      zoom: 18,
      pitch: 35,
      bearing: 22.6,
      elevationMeters: 1400,
    },
    end: {
      center: [85.132904, 27.900052],
      zoom: 18,
      pitch: 35,
      bearing: 22.6,
      elevationMeters: 1400,
    },
    overlays: [
      {
        id: 'distance-glacier-to-trishuli',
        data: '/data/distance_glacier_to_trishuli.geojson',
        lineColor: '#d71920',
      },
    ],
    boxes: [
      pinned('trishuli-bidur-intro', 'Videos taken in the town of Trishuli.', 48, 16),
      pinned(
        'trishuli-bidur-detail',
        'The town of Trishuli is located approximately [[red:44 miles]] downstream from the glacier and sits at an elevation of approximately [[red:1,790 feet]]. The debris flow has now descended approximately [[red:15,090 feet]] in elevation. [[yellow:Video 1]] was captured from the roof of a Buddhist temple, looking north upstream, and shows the debris flow as it enters the town. [[yellow:Video 2]] is captured just north of the town and looks north upstream as the debris flow approaches the center of Trishuli.',
        100,
        36,
      ),
    ],
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
    },
  },
] satisfies StoryChapter[]

export const globalMapOverlays = [
  {
    id: 'glacier-burst-shape',
    data: '/data/glacier_burst_shape.geojson',
    fillColor: '#ffd400',
    fillOpacity: 0.22,
    lineColor: '#ffd400',
  },
] satisfies MapOverlay[]
