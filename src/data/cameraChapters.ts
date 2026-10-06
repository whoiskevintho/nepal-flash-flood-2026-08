import type { MapOverlay, StoryChapter, TextBox } from '../types/mapCamera'

// Highlight phrases in box text with [[red:...]] or [[yellow:...]].
// holdVh is how long a box stays fully visible, in viewport heights of scrolling.
// fadeVh is the fade in and the fade out. gapVh is blank scroll after the box.
// motion `pin` fades in and out at the bottom. `rise` scrolls up from below the screen, taking
// holdVh to cross it. About 100 plus the box's height in vh matches the scroll rate.
// On rise boxes, fadeVh is how close to the bottom and top edges the box fades in and out.
// Rise box width is `.story-card-rise` in App.css.
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

export const storyIntro = {
  kicker: 'Visual story',
  title: 'Following the path of the flood in Nepal',
  deck: 'A visual story following the path of the torrential flash flood that struck Nepal in August 2026. This story puts the scale of the disaster into context through satellite imagery and eyewitness video.',
  author: 'Kevin Young',
  authorHref: 'https://whoiskevintho.com/',
  date: 'October 5, 2026',
}

type StorySource = {
  name: string
  detail: string
  href?: string
}

export const storyEnd: {
  kicker: string
  title: string
  methodology: string
  sources: StorySource[]
} = {
  kicker: 'Sources',
  title: '',
  methodology:
    'The distances and elevations were measured from satellite imagery in QGIS. Eyewitness footage is sourced from facebook and the 2026 Himalayan Tragedy Archive Youtube page. Individual video sources are linked above each video throughout the story. ',
  sources: [
    {
      name: 'Copernicus Browser',
      detail: 'Used to source DEMs and elevation data.',
      href: 'https://browser.dataspace.copernicus.eu/',
    },
    {
      name: 'Sentinel-2 cloudless, EOX',
      detail: 'Satellite imagery in the map, modified Copernicus Sentinel data 2024.',
      href: 'https://s2maps.eu/',
    },
    {
      name: 'MapTiler Satellite',
      detail: 'Satellite imagery.',
      href: 'https://www.maptiler.com/copyright/',
    },
    {
      name: 'AWS Terrain Tiles',
      detail: 'Elevation tiles for the 3D terrain.',
      href: 'https://registry.opendata.aws/terrain-tiles/',
    },
  ],
}

export const storyChapters = [
  {
    id: 'himalaya-overview',
    title: 'Glacier Collapse',
    start: {
      center: [85.52396, 28.28729],
      zoom: 14,
      pitch: 61,
      bearing: 126.5,
      elevationMeters: 4850,
    },
    end: {
      center: [85.51598, 28.29516],
      zoom: 13,
      pitch: 62,
      bearing: 127.6,
      elevationMeters: 4850,
    },
    boxes: [
      { //Chapter 1
        id: 'himalaya-overview-intro',
        text: 'At approximately 8:37 a.m. local time in Nepal on August 26, 2026, the glacier below Langtang Lirung Peak collapsed, registering as a 5.2 seismic event.',
        holdVh: 120,
        fadeVh: 15,
        gapVh: 20,
        motion: 'rise',
      },
      pinned(
        'himalaya-overview-detail',
        'This [[yellow:yellow]] area was traced from satellite imagery and covers the extent of the ice and bedrock that detached during the collapse.',
        90,
        36,
      ),
      pinned(
        'himalaya-overview-detail-2',
        'It measures approximately one mile across and half a mile tall and sits at an elevation of [[red:16,880 feet]]. The valley floor below is at an elevation of 12,150 feet, meaning the debris fell nearly a mile at the start of the torrential debris flow.',
        90,
        36,
      ),
      {
        id: 'himalaya-beforeafter',
        text: 'Satellite imagery shows the glacier before and after the collapse.',
        holdVh: 170,
        fadeVh: 15,
        gapVh: 36,
        motion: 'rise',
        showBeforeAfter: true,
      },
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
  { //Chapter 2, zoom out before 3
    id: 'distance-glacier-rasu',
    title: 'Distance to glacier',
    transitionMs: 2000,
    start: {
      center: [85.39458, 28.31205],
      zoom: 11.5,
      pitch: 40.1,
      bearing: 120,
      elevationMeters: 8800,
    },
    end: {
      center: [85.39458, 28.31205],
      zoom: 12,
      pitch: 40.1,
      bearing: 120,
      elevationMeters: 8800,
    },
    boxes: [
      pinned(
        'distance-glacier-rasu-intro',
        'By 8:45 a.m., the debris flow had reached the Tibet–Nepal border crossing, traveling [[red:13 miles]] downstream and descending [[red:10,900 feet]].',
        96,
        16,
      ),
    ],
  },
  { //Chapter 3
    id: 'border-crossing-rasu',
    title: 'Border crossing, CCTV',
    transitionMs: 2000,
    start: {
      center: [85.36884, 28.25924],
      zoom: 16,
      pitch: 38.6,
      bearing: 23.3,
      elevationMeters: 4800,
    },
    end: {
      center: [85.3688, 28.26166],
      zoom: 16.68,
      pitch: 38.6,
      bearing: 23.3,
      elevationMeters: 4800,
    },
    boxes: [
      pinned(
        'border-crossing-rasu-intro',
        'CCTV cameras captured the debris flow as it destroyed the border crossing. [[yellow:Camera 1]] was pointed south west, at the main border crossing building. [[yellow:Camera 2]] was looking north west up the Trishuli River.',
        90,
        36,
      ),
      {
        id: 'border-crossing-cameras',
        text: 'The first half of this video is footage captured by [[yellow:Camera 1]]. The second half is footage from [[yellow:Camera 2]].',
        holdVh: 170,
        fadeVh: 15,
        gapVh: 36,
        motion: 'rise',
        showVideos: true,
      },
    ],
    detail: {
      videos: [
        {
          youtubeUrl: 'https://youtu.be/oq7EXEEpQlg?si=R5TpYXDI3y3wR3l_',
          title: 'Cameras 1 & 2',
          sourceHref: 'https://x.com/MrGafish/status/2092547312518348820?s=46',
        },
      ],
    },
  },
  { //Chapter 4, zoom out before 5
    id: 'distance-work-site',
    title: 'Hydropower site at Mailung',
    transitionMs: 3000,
    start: {
      center: [85.22524, 28.10903],
      zoom: 10.6,
      pitch: 48,
      bearing: 60.2,
      elevationMeters: 8800,
    },
    end: {
      center: [85.22524, 28.10903],
      zoom: 11.1,
      pitch: 48,
      bearing: 60.2,
      elevationMeters: 8800,
    },
    boxes: [
      pinned(
        'distance-work-site-detail',
        'By the time the flow reached a hydro facility in Mailung, it had descended [[red:13,880 feet]] and traveled [[red:32 miles]] downstream from the glacier.',
        90,
        36,
      ),
    ],
  },
  { //Chapter 5
    id: 'work-site',
    title: 'Hydropower site at Mailung',
    transitionMs: 3000,
    start: {
      center: [85.19557, 28.04744],
      zoom: 17.5,
      pitch: 35,
      bearing: 22.6,
      elevationMeters: 4800,
    },
    end: {
      center: [85.19557, 28.04744],
      zoom: 18,
      pitch: 35,
      bearing: 22.6,
      elevationMeters: 4800,
    },
    boxes: [
      pinned(
        'work-site-detail',
        'Workers and witnesses captured the debris flow as it rapidly approached.[[yellow:Camera 3]] was filmed from the bank of the Trishuli river and captures the approaching flood. [[yellow:Camera 4]] was filmed from a higher elevation.',
        100,
        36,
      ),
      {
        id: 'work-site-cameras',
        text: 'The first video is footage captured by [[yellow:Camera 3]]. The second is footage from [[yellow:Camera 4]].',
        holdVh: 170,
        fadeVh: 15,
        gapVh: 36,
        motion: 'rise',
        showVideos: true,
      },
    ],
    detail: {
      videos: [
        {
          facebookUrl: 'https://www.facebook.com/reel/1928523987821099',
          title: 'Camera 3',
          sourceHref: 'https://www.facebook.com/share/v/1CGYLJchVC/',
        },
        {
          facebookUrl: 'https://www.facebook.com/reel/1538884681259185',
          title: 'Camera 4',
          sourceHref: 'https://www.facebook.com/share/v/1BoUyK4qLP/',
        },
      ],
    },
  },
  { //Chapter 6, zoom out before 7
    id: 'distance-betrawati',
    title: 'The town of Betrawati',
    transitionMs: 3000,
    start: {
      center: [85.26057, 28.10998],
      zoom: 9.9,
      pitch: 39.3,
      bearing: 62.7,
      elevationMeters: 2000,
    },
    end: {
      center: [85.26057, 28.10998],
      zoom: 10.4,
      pitch: 39.3,
      bearing: 62.7,
      elevationMeters: 2000,
    },
    boxes: [
      pinned(
        'distance-betrawati-detail',
        'By the time the flow reached the town of Betrawati, it had descended [[red:14,880 feet]] and traveled [[red:39 miles]] downstream from the glacier.',
        90,
        36,
      ),
    ],
  },
  { //Chapter 7
    id: 'betrawati-bazaar',
    title: 'The town of Betrawati',
    transitionMs: 2000,
    start: {
      center: [85.17442, 27.96324],
      zoom: 15,
      pitch: 30,
      bearing: 40,
      elevationMeters: 3000,
    },
    end: {
      center: [85.17442, 27.96324],
      zoom: 15,
      pitch: 30,
      bearing: 40,
      elevationMeters: 3000,
    },
    boxes: [
      pinned(
        'betrawati-detail',
        'Witnesses captured the debris flow as it destroyed the town. [[yellow:Camera 5]] filmed from a higher elevation looking downstream, and captures the debris flow as it enters town and pushes up a tributary river. [[yellow:Camera 6]] was captured from a lower elevation along the Tishuli River, looking west as the debris flow violently swept past.',
        100,
        36,
      ),
      {
        id: 'betrawati-cameras',
        text: 'The first video is footage captured by [[yellow:Camera 5]]. The second is footage from [[yellow:Camera 6]].',
        holdVh: 170,
        fadeVh: 15,
        gapVh: 36,
        motion: 'rise',
        showVideos: true,
      },
    ],
    detail: {
      videos: [
        {
          youtubeUrl: 'https://www.youtube.com/watch?v=jnn4s6CkQs4',
          title: 'Camera 5',
          sourceHref: 'https://www.youtube.com/watch?v=jnn4s6CkQs4',
        },
        {
          youtubeUrl: 'https://www.youtube.com/watch?v=qjApXYPD2Ow',
          title: 'Camera 6',
          sourceHref: 'https://www.youtube.com/watch?v=qjApXYPD2Ow',
        },
      ],
    },
  },
  { //Chapter 8, zoom out before 9
    id: 'distance-trishuli',
    title: 'The town of Trishuli',
    transitionMs: 3000,
    start: {
      center: [85.23121, 28.07599],
      zoom: 10,
      pitch: 39.3,
      bearing: 62.7,
      elevationMeters: 2000,
    },
    end: {
      center: [85.23121, 28.07599],
      zoom: 10.4,
      pitch: 39.3,
      bearing: 62.7,
      elevationMeters: 2000,
    },
    boxes: [
      pinned(
        'distance-trishuli-detail',
        'By the time the flow reached the town of Trishuli, it had descended [[red:15,060 feet]] and traveled [[red:44 miles]].',
        90,
        36,
      ),
    ],
  },
  { //Chapter 9
    id: 'trishuli-bidur',
    title: 'The town of Trishuli',
    transitionMs: 3000,
    start: {
      center: [85.14231, 27.9079],
      zoom: 18,
      pitch: 35,
      bearing: 22.6,
      elevationMeters: 3000,
    },
    end: {
      center: [85.14231, 27.9079],
      zoom: 18,
      pitch: 35,
      bearing: 22.6,
      elevationMeters: 3000,
    },
    boxes: [
      pinned(
        'trishuli-bidur-detail',
        'Footage from [[yellow:Camera 7]] was captured by witnesses from the roof of a Buddhist temple, and shows the debris flow as it enters town. [[yellow:Camera 8]] was captured just north of the town and looks upstream as the debris flow approaches.',
        90,
        36,
      ),
      {
        id: 'trishuli-cameras',
        text: 'The first video is footage captured by [[yellow:Camera 7]]. The second is footage from [[yellow:Camera 8]].',
        holdVh: 170,
        fadeVh: 15,
        gapVh: 36,
        motion: 'rise',
        showVideos: true,
      },
    ],
    detail: {
      videos: [
        {
          youtubeUrl: 'https://www.youtube.com/watch?v=P1AodkdPMck',
          title: 'Camera 7',
          sourceHref: 'https://www.youtube.com/watch?v=P1AodkdPMck',
        },
        {
          youtubeUrl: 'https://www.youtube.com/watch?v=RiaeLbsMx2o&t=2s',
          title: 'Camera 8',
          sourceHref: 'https://www.youtube.com/watch?v=RiaeLbsMx2o&t=2s',
        },
      ],
    },
  },
] satisfies StoryChapter[]

// Each overlay shows in the chapters listed in chapterIds, or in every chapter when omitted.
// An overlay stays loaded while scrolling between its chapters and fades in and out at the edges.
// Label overlays take `labels` instead of `data`. Coordinates are [longitude, latitude].
// `textBearing` places the text, in degrees clockwise from straight up. The line follows it.
// `dot: true` marks the coordinate and connects it to the text. `line: true` draws that line
// without a dot. `arrow: true` adds an arrow; `arrowBearing` is the direction it points.
// {
//   id: 'rasuwagadi-labels',
//   chapterIds: ['distance-glacier-rasu', 'border-crossing-rasu'],
//   labels: [
//     { text: 'Rasuwagadi', coordinates: [85.37702, 28.27727], textBearing: 40, dot: true },
//     { text: 'Camera 1', coordinates: [85.37789, 28.28041], color: '#ffd400', arrow: true, arrowBearing: 200 },
//   ],
// },
export const mapOverlays = [
  {
    id: 'glacier-burst-shape',
    chapterIds: ['himalaya-overview', 'distance-glacier-rasu'],
    data: '/data/glacier_burst_shape.geojson',
    fillColor: '#ffd400',
    fillOpacity: 0.22,
    lineColor: '#ffd400',
  },
  {
    id: 'glacier-labels',
    labels: [
      { text: 'Glacier', coordinates: [85.53488, 28.28415] },
    ],
  },
  {
    id: 'valley-label',
    chapterIds: ['himalaya-overview'],
    labels: [
      { text: 'Valley floor', coordinates: [85.5104, 28.29344] },
      { text: 'Langtang Lirung', coordinates: [85.516583, 28.256547], italic: true  },
    ],
  },
  {
    id: 'rasuwagadi-labels',
    chapterIds: ['distance-glacier-rasu', 'border-crossing-rasu'],
    labels: [
      { text: 'Rasuwagadi', coordinates: [85.37702, 28.27727], italic: true },
    ],
  },
  {
    id: 'border-crossing-labels',
    chapterIds: ['border-crossing-rasu'],
    labels: [
      { text: 'Camera 1', coordinates: [85.37789, 28.28041], color: '#ffd400', size: 20, textBearing: 150, dot: true },
      { text: 'Camera 2', coordinates: [85.37789, 28.28041], color: '#ffd400', size: 20, textBearing: 280, dot: true },
      { text: 'Direction of flow', coordinates: [85.382758, 28.282321], color: '#FF2C2C', size: 20, textBearing: 0, dot: false, arrow: true, arrowBearing: 210 },
      { text: 'Trishuli River', coordinates: [85.369035, 28.286315], italic: true },
    ],
  },
  {
    id: 'mailung-labels',
    chapterIds: ['distance-work-site', 'work-site'],
    labels: [
      { text: 'Mailung', coordinates: [85.20723, 28.07019], italic: true },
    ],
  },
  {
    id: 'mailung-cameras-labels',
    chapterIds: ['work-site'],
    labels: [
      { text: 'Camera 3', coordinates: [85.20785, 28.07332], color: '#ffd400', size: 20, textBearing: 40, dot: true },
      { text: 'Camera 4', coordinates: [85.20367, 28.07256], color: '#ffd400', size: 20, textBearing: 60, dot: true },
      { text: 'Direction of flow', coordinates: [85.214605, 28.076906], color: '#FF2C2C', size: 20, textBearing: 0, dot: false, arrow: true, arrowBearing: 210 }
    ],
  },
  {
    id: 'betrawati-labels',
    chapterIds: ['distance-betrawati','betrawati-bazaar'],
    labels: [
      { text: 'Betrawati', coordinates: [85.18391, 27.97082], italic: true },
    ],
  },
  {
    id: 'betrawati-cameras-labels',
    chapterIds: ['betrawati-bazaar'],
    labels: [
      { text: 'Camera 5', coordinates: [85.18561, 27.97566], color: '#ffd400', size: 20, textBearing: 140, dot: true  },
      { text: 'Camera 6', coordinates: [85.18366, 27.97585], color: '#ffd400', size: 20, textBearing: 220, dot: true  },
      { text: 'Direction of flow', coordinates: [85.181532, 27.978881], color: '#FF2C2C', size: 20, textBearing: 0, dot: false, arrow: true, arrowBearing: 130 }
    ],
  },
  {
    id: 'trishuli-labels',
    chapterIds: ['distance-trishuli', 'trishuli-bidur'],
    labels: [
      { text: 'Trishuli', coordinates: [85.14843, 27.92304], italic: true },
    ],
  },
  {
    id: 'trishuli-cameras-labels',
    chapterIds: ['trishuli-bidur'],
    labels: [
      { text: 'Camera 7', coordinates: [85.1483, 27.92057], color: '#ffd400', size: 25, textBearing: 20, dot: true },
      { text: 'Camera 8', coordinates: [85.14828, 27.92814], color: '#ffd400', size: 25, textBearing: 0, dot: true },
      { text: 'Direction of flow', coordinates: [85.149808, 27.931345], color: '#FF2C2C', size: 25, textBearing: 0, dot: false, arrow: true, arrowBearing: 180 }
    ],
  },
  {
    id: 'distance-glacier-to-rasu',
    data: '/data/distance_glacier_to_rasu.geojson',
    lineColor: '#d71920',
    chapterIds: ['distance-glacier-rasu' ],
  },
  {
    id: 'distance-glacier-to-work-site',
    data: '/data/distance_glacier_to_worksite1.geojson',
    lineColor: '#d71920',
    chapterIds: ['distance-work-site'],
  },
  {
    id: 'distance-glacier-to-betrawati',
    data: '/data/distance_glacier_to_betrawati.geojson',
    lineColor: '#d71920',
    chapterIds: ['distance-betrawati'],
  },
  {
    id: 'distance-glacier-to-trishuli',
    data: '/data/distance_glacier_to_trishuli.geojson',
    lineColor: '#d71920',
    chapterIds: ['distance-trishuli'],
  },
] satisfies MapOverlay[]
