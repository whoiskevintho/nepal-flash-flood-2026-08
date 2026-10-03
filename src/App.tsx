import { useEffect, useRef, useState } from 'react'
import './App.css'
import { BeforeAfterSlider } from './components/BeforeAfterSlider'
import { HighlightedText } from './components/HighlightedText'
import { TerrainMap, type TerrainMapHandle } from './components/TerrainMap'
import { globalMapOverlays, storyChapters } from './data/cameraChapters'
import {
  activeTextBox,
  camerasNearlyEqual,
  chapterHeightVh,
  flightCamera,
  formatCameraSnippet,
  lerpCamera,
  parseCameraHash,
  writeCameraHash,
} from './lib/storyScroll'
import type { MapCamera, MapOverlay } from './types/mapCamera'

const devMode = import.meta.env.DEV

function overlaysFor(chapterId: string): MapOverlay[] {
  const chapter = storyChapters.find((item) => item.id === chapterId) ?? storyChapters[0]

  return [...globalMapOverlays, ...(chapter.overlays ?? [])]
}

function App() {
  const authoredCamera = devMode ? parseCameraHash(window.location.hash) : null
  const initialCamera = authoredCamera ?? storyChapters[0].start
  const mapRef = useRef<TerrainMapHandle>(null)
  const readoutRef = useRef<HTMLPreElement>(null)
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})
  const boxRefs = useRef<Record<string, HTMLElement | null>>({})
  const chapterIdRef = useRef(storyChapters[0].id)
  const authoringRef = useRef(Boolean(authoredCamera))
  const shownCameraRef = useRef<MapCamera | null>(null)
  const [authoring, setAuthoring] = useState(Boolean(authoredCamera))
  const [overlays, setOverlays] = useState<MapOverlay[]>(() => overlaysFor(storyChapters[0].id))

  useEffect(() => {
    let frame = 0
    let transition: { from: MapCamera; startedAt: number; durationMs: number } | null = null

    const paintReadout = (camera: MapCamera) => {
      if (readoutRef.current) {
        readoutRef.current.textContent = formatCameraSnippet(camera)
      }
    }

    const applyFrame = (now: number) => {
      frame = 0
      const scrollY = window.scrollY
      let located: { id: string; localPx: number; height: number } | null = null

      for (let index = 0; index < storyChapters.length; index += 1) {
        const chapter = storyChapters[index]
        const section = sectionRefs.current[chapter.id]

        if (!section) {
          continue
        }

        const start = section.offsetTop
        const height = section.offsetHeight

        if (scrollY < start) {
          if (index === 0) {
            located = { id: chapter.id, localPx: 0, height }
          }
          break
        }

        if (scrollY < start + height || index === storyChapters.length - 1) {
          located = {
            id: chapter.id,
            localPx: Math.min(Math.max(scrollY - start, 0), height),
            height,
          }
          break
        }
      }

      if (!located) {
        return
      }

      const chapter = storyChapters.find((item) => item.id === located.id) ?? storyChapters[0]
      const totalVh = chapterHeightVh(chapter.boxes)
      const progress = located.height === 0 ? 0 : located.localPx / located.height
      const active = activeTextBox(
        chapter.boxes,
        progress * totalVh,
        totalVh === 0 ? 0 : located.height / totalVh,
      )

      for (const box of storyChapters.flatMap((item) => item.boxes)) {
        const node = boxRefs.current[box.id]

        if (!node) {
          continue
        }

        const isActive = active?.id === box.id && active.opacity > 0
        node.style.opacity = isActive ? String(active.opacity) : '0'
        node.style.visibility = isActive ? 'visible' : 'hidden'
        node.setAttribute('aria-hidden', isActive ? 'false' : 'true')
        node.style.transform = `translateX(-50%) translateY(${isActive ? -active.risePx : 0}px)`
      }

      if (chapter.id !== chapterIdRef.current) {
        const previousIndex = storyChapters.findIndex((item) => item.id === chapterIdRef.current)
        const nextIndex = storyChapters.findIndex((item) => item.id === chapter.id)
        const durationMs =
          nextIndex > previousIndex
            ? (chapter.transitionMs ?? 0)
            : (storyChapters[previousIndex]?.transitionMs ?? 0)

        chapterIdRef.current = chapter.id
        setOverlays(overlaysFor(chapter.id))

        const shown = shownCameraRef.current
        transition =
          shown && durationMs > 0 && mapRef.current?.isReady()
            ? { from: shown, startedAt: now, durationMs }
            : null
      }

      const scrollCamera = lerpCamera(chapter.start, chapter.end, progress)
      let camera = scrollCamera

      if (transition) {
        const t = (now - transition.startedAt) / transition.durationMs

        if (t >= 1) {
          transition = null
        } else {
          const viewportPx = Math.max(window.innerWidth, window.innerHeight)
          camera = flightCamera(transition.from, scrollCamera, t, viewportPx)
        }
      }

      const shown = shownCameraRef.current

      if (!shown || !camerasNearlyEqual(shown, camera)) {
        shownCameraRef.current = camera
        mapRef.current?.jumpTo(camera)
      }

      if (!authoringRef.current) {
        paintReadout(camera)
      }

      if (transition) {
        requestFrame()
      }
    }

    const requestFrame = () => {
      if (frame) {
        return
      }

      frame = window.requestAnimationFrame(applyFrame)
    }

    requestFrame()
    window.addEventListener('scroll', requestFrame, { passive: true })
    window.addEventListener('resize', requestFrame)

    return () => {
      window.removeEventListener('scroll', requestFrame)
      window.removeEventListener('resize', requestFrame)

      if (frame) {
        window.cancelAnimationFrame(frame)
      }
    }
  }, [])

  return (
    <main className="app-shell">
      <TerrainMap
        ref={mapRef}
        camera={initialCamera}
        overlays={overlays}
        interactive={devMode}
        initialAuthoring={Boolean(authoredCamera)}
        onUserControl={() => {
          authoringRef.current = true
          setAuthoring(true)
        }}
        onCameraLive={(camera) => {
          if (readoutRef.current) {
            readoutRef.current.textContent = formatCameraSnippet(camera)
          }
        }}
        onCameraCommit={writeCameraHash}
      />

      <div className="story-track">
        {storyChapters.map((chapter) => (
          <section
            key={chapter.id}
            className="story-chapter"
            style={{ height: `${chapterHeightVh(chapter.boxes)}vh` }}
            aria-label={chapter.title}
            ref={(node) => {
              sectionRefs.current[chapter.id] = node
            }}
          />
        ))}
      </div>

      {storyChapters.flatMap((chapter) =>
        chapter.boxes.map((box) => (
          <article
            key={box.id}
            className="story-card"
            aria-hidden="true"
            ref={(node) => {
              boxRefs.current[box.id] = node
            }}
          >
            <p>
              <HighlightedText text={box.text} />
            </p>
            {box.showBeforeAfter && chapter.detail?.beforeAfter ? (
              <div className="story-card-media">
                <BeforeAfterSlider
                  before={chapter.detail.beforeAfter.before}
                  after={chapter.detail.beforeAfter.after}
                />
              </div>
            ) : null}
          </article>
        )),
      )}

      {devMode ? (
        <aside className="camera-readout">
          <p className="eyebrow">Camera</p>
          <pre ref={readoutRef}>{formatCameraSnippet(initialCamera)}</pre>
          {authoring ? (
            <p className="camera-readout-note">
              Scroll camera is paused. Remove the hash from the address bar and reload to follow the
              story.
            </p>
          ) : (
            <p className="camera-readout-note">
              Drag the map to pause the story and copy this camera into a chapter.
            </p>
          )}
        </aside>
      ) : null}
    </main>
  )
}

export default App
