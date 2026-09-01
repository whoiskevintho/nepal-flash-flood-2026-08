import './App.css'
import { TerrainMap } from './components/TerrainMap'

function App() {
  return (
    <main className="app-shell">
      <TerrainMap />
      <section className="map-panel" aria-labelledby="map-title">
        <p className="eyebrow">MapLibre GL JS</p>
        <h1 id="map-title">3D Terrain Viewer</h1>
        <p>
          Explore the Himalaya with pitched navigation, shaded relief, and terrain
          exaggeration.
        </p>
      </section>
    </main>
  )
}

export default App
