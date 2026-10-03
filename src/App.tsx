import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { HighlightedText } from './components/HighlightedText'
import { TerrainMap, type TerrainMapHandle } from './components/TerrainMap'
import { globalMapOverlays, storyChapters } from './data/cameraChapters'
import {
  activeTextBox,
  camerasNearlyEqual,
  chapterHeightVh,
  formatCameraSnippet,
  lerpCamera,
  parseCameraHash,
  writeCameraHash,
} from './lib/storyScroll'
import type { MapCamera } from './types/mapCamera'

const devMode = import.meta.env.DEV

type StoryPosition = {
  index: number
  progress: number
  camera: MapCamera
}

function locateStory(sections: Array<HTMLElement | null>, scrollY: number): StoryPosition {
  let index = 0

  for (let i = 0; i < sections.length; i += 1) {
    const section = sections[i]

    if (section && scrollY >= section.offsetTop) {
      index = i
    }
  }

  const section = sections[index]
  const chapter = storyChapters[index]
  const height = section?.offsetHeight ?? 0
  const offset = scrollY - (section?.offsetTop ?? 0)
  const progress = height > 0 ? Math.min(Math.max(offset / height, 0), 1) : 0

  return {
    index,
    progress,
    camera: lerpCamera(chapter.start, chapter.end, progress),
  }
}

function transitionMs(from: number, to: number) {
  if (Math.abs(to - from) !== 1) {
    return 0
  }

  const arriving = storyChapters[Math.max(from, to)]
  return arriving.transitionMs ?? 0
}

function App() {
  const [authoredCamera] = useState(() => (devMode ? parseCameraHash(window.location.hash) : null))
  const [authoring, setAuthoring] = useState(Boolean(authoredCamera))
  const [chapterIndex, setChapterIndex] = useState(0)
  const mapRef = useRef<TerrainMapHandle>(null)
  const readoutRef = useRef<HTMLPreElement>(null)
  const sectionRefs = useRef<Array<HTMLElement | null>>([])
  const boxRefs = useRef<Record<string, HTMLElement | null>>({})
  const authoringRef = useRef(Boolean(authoredCamera))
  const renderRef = useRef<() => void>(() => {})
  const cameraState = useRef({
    ready: false,
    chapter: -1,
    flightEndsAt: 0,
    applied: null as MapCamera | null,
  })

  const overlays = useMemo(
    () => [...globalMapOverlays, ...(storyChapters[chapterIndex].overlays ?? [])],
    [chapterIndex],
  )

  useEffect(() => {
    let frame = 0
    let flightTimer = 0

    const requestFrame = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(render)
      }
    }

    const moveCamera = (position: StoryPosition) => {
      const state = cameraState.current

      if (!state.ready || authoringRef.current) {
        return
      }

      const now = performance.now()
      const previous = state.chapter
      state.chapter = position.index

      if (previous !== position.index && previous !== -1) {
        const duration = transitionMs(previous, position.index)

        if (duration > 0) {
          mapRef.current?.flyTo(position.camera, duration)
          state.applied = position.camera
          state.flightEndsAt = now + duration
          window.clearTimeout(flightTimer)
          flightTimer = window.setTimeout(requestFrame, duration + 16)
          return
        }
      }

      if (previous === position.index && now < state.flightEndsAt) {
        return
      }

      state.flightEndsAt = 0

      if (state.applied && camerasNearlyEqual(state.applied, position.camera)) {
        return
      }

      state.applied = position.camera
      mapRef.current?.jumpTo(position.camera)
    }

    const render = () => {
      frame = 0
      const position = locateStory(sectionRefs.current, window.scrollY)
      const chapter = storyChapters[position.index]
      const section = sectionRefs.current[position.index]
      const totalVh = chapterHeightVh(chapter.boxes)
      const pxPerVh = section && totalVh > 0 ? section.offsetHeight / totalVh : 0
      const active = activeTextBox(chapter.boxes, position.progress * totalVh, pxPerVh)

      for (const item of storyChapters) {
        for (const box of item.boxes) {
          const node = boxRefs.current[box.id]

          if (!node) {
            continue
          }

          const visible = active?.id === box.id && active.opacity > 0
          node.style.opacity = visible ? String(active.opacity) : '0'
          node.style.visibility = visible ? 'visible' : 'hidden'
          node.style.transform = `translateX(-50%) translateY(${visible ? -active.risePx : 0}px)`
          node.setAttribute('aria-hidden', visible ? 'false' : 'true')
        }
      }

      setChapterIndex(position.index)
      moveCamera(position)

      if (readoutRef.current && !authoringRef.current) {
        readoutRef.current.textContent = formatCameraSnippet(position.camera)
      }
    }

    renderRef.current = render
    requestFrame()
    window.addEventListener('scroll', requestFrame, { passive: true })
    window.addEventListener('resize', requestFrame)

    return () => {
      window.removeEventListener('scroll', requestFrame)
      window.removeEventListener('resize', requestFrame)
      window.cancelAnimationFrame(frame)
      window.clearTimeout(flightTimer)
    }
  }, [])

  return (
    <main className="app-shell">
      <TerrainMap
        ref={mapRef}
        getCamera={() => authoredCamera ?? locateStory(sectionRefs.current, window.scrollY).camera}
        overlays={overlays}
        interactive={devMode}
        initialAuthoring={Boolean(authoredCamera)}
        onReady={() => {
          cameraState.current = { ready: true, chapter: -1, flightEndsAt: 0, applied: null }
          renderRef.current()
        }}
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
        {storyChapters.map((chapter, index) => (
          <section
            key={chapter.id}
            className="story-chapter"
            style={{ height: `${chapterHeightVh(chapter.boxes)}vh` }}
            aria-label={chapter.title}
            ref={(node) => {
              sectionRefs.current[index] = node
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
            <p className="eyebrow">{chapter.title}</p>
            <p>
              <HighlightedText text={box.text} />
            </p>
          </article>
        )),
      )}

      {devMode ? (
        <aside className="camera-readout">
          <p className="eyebrow">Camera</p>
          <pre ref={readoutRef}>{formatCameraSnippet(authoredCamera ?? storyChapters[0].start)}</pre>
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
