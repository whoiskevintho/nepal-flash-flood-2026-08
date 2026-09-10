# Nepal Flash Flood, August 2026

An interactive 3D story map of the flash flood that began with a glacier collapse below Langtang Lirung Peak on 26 August 2026, then traveled down the Trishuli River through Rasuwagadhi, Mailung, Betrawati, and Trishuli.

Each chapter flies the camera to a location, with optional distance lines along the flood path. **Read More** opens eyewitness video (YouTube, Facebook, or local files) and, for the glacier chapter, a before/after satellite slider.

## How it works

The app is a client-side React + TypeScript site built with Vite. There is no backend.

The map is [MapLibre GL](https://maplibre.org/). Satellite tiles and map fonts come from [MapTiler](https://www.maptiler.com/). Terrain is [AWS Terrarium](https://registry.opendata.aws/terrain-tiles/) elevation tiles. Story content lives in TypeScript; paths, place names, and video labels are GeoJSON under `public/data/`.

Selecting a chapter flies the 3D camera (center, zoom, pitch, bearing, and elevation). Distance buttons add a GeoJSON line overlay and pull the camera back to show how far the flow had traveled. Detail modals can include a before/after image slider and a video playlist.

### Stack

| Piece | Choice |
| --- | --- |
| UI | React 19, TypeScript |
| Build | Vite 8, `@vitejs/plugin-react` |
| Map | MapLibre GL 6 |
| Imagery | MapTiler satellite-v2 |
| Terrain | Terrarium DEM |
| Lint | Oxlint |

### Layout

```
src/
  App.tsx                      # Chapter list, detail modal, video embeds
  components/TerrainMap.tsx    # MapLibre map, terrain, overlays, labels
  components/BeforeAfterSlider.tsx
  data/cameraChapters.ts       # Chapter cameras, copy, videos, overlays
  types/mapCamera.ts
public/
  data/                        # GeoJSON paths, glacier outline, labels
  images/                      # Before/after satellite stills
  videos/                      # Optional local video files
```

## Run locally

1. Install [Node.js](https://nodejs.org/).
2. Copy your MapTiler API key into a `.env` file in the project root:

   ```
   VITE_MAPTILER_KEY=your_maptiler_key
   ```

3. Install and start the dev server:

   ```bash
   npm install
   npm run dev
   ```

Other scripts: `npm run build` (typecheck + production bundle), `npm run preview`, `npm run lint`.

## Authoring chapters

Chapters are defined in `src/data/cameraChapters.ts`. Each chapter has a camera (`center` as `[lng, lat]`, plus `zoom`, `pitch`, `bearing`, `elevationMeters`), short copy, and a `detail` block for modal text, videos, and optional before/after images.

Distance views are optional: a second camera plus a GeoJSON line (see `public/data/distance_*.geojson`). Global overlays such as the glacier burst outline are listed in `globalMapOverlays`. Place and video labels come from `public/data/locations.geojson` and `public/data/video_locations.geojson`.

Videos can be a YouTube URL, a Facebook URL, or a file under `public/` (`src: '/videos/...'`). Add `sourceHref` when you have the original source page.

## License

MIT. See [LICENSE](LICENSE).
