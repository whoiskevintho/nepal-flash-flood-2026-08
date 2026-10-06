import { useEffect, useRef, useState } from 'react'
import './App.css'
import { BeforeAfterSlider } from './components/BeforeAfterSlider'
import { ChapterVideoPlayer } from './components/ChapterVideoPlayer'
import { HighlightedText } from './components/HighlightedText'
import { TerrainMap, type TerrainMapHandle } from './components/TerrainMap'
import { mapOverlays, storyChapters, storyEnd, storyIntro } from './data/cameraChapters'
import {
  activeTextBox,
  camerasNearlyEqual,
  chapterHeightVh,
  clamp01,
  flightCamera,
  lerpCamera,
} from './lib/storyScroll'
import type { MapCamera, MapOverlay } from './types/mapCamera'

function overlaysFor(chapterId: string): MapOverlay[] {
  return mapOverlays.filter(
    (overlay) => !overlay.chapterIds || overlay.chapterIds.includes(chapterId),
  )
}

function App() {
  const initialCamera = storyChapters[0].start
  const mapRef = useRef<TerrainMapHandle>(null)
  const introRef = useRef<HTMLElement | null>(null)
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})
  const boxRefs = useRef<Record<string, HTMLElement | null>>({})
  const chapterIdRef = useRef(storyChapters[0].id)
  const shownCameraRef = useRef<MapCamera | null>(null)
  const [visibleBoxId, setVisibleBoxId] = useState<string | null>(null)
  const [overlays, setOverlays] = useState<MapOverlay[]>(() => overlaysFor(storyChapters[0].id))

  useEffect(() => {
    let frame = 0
    let transition: { from: MapCamera; startedAt: number; durationMs: number } | null = null

    const applyFrame = (now: number) => {
      frame = 0
      const scrollY = window.scrollY
      const intro = introRef.current

      if (intro) {
        const height = intro.offsetHeight || 1
        intro.style.opacity = String(1 - clamp01(scrollY / height))
      }

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
      const active = activeTextBox(chapter.boxes, progress * totalVh)

      for (const box of storyChapters.flatMap((item) => item.boxes)) {
        const node = boxRefs.current[box.id]

        if (!node) {
          continue
        }

        let isActive = active?.id === box.id && active.opacity > 0
        let opacity = isActive && active ? active.opacity : 0
        let risePx = 0

        if (isActive && active && box.motion === 'rise') {
          const viewportPx = window.innerHeight
          risePx = active.riseProgress * (viewportPx + node.offsetHeight)
          const fadePx = ((box.fadeVh ?? 0) / 100) * viewportPx

          if (fadePx > 0) {
            const top = viewportPx - risePx
            const bottom = top + node.offsetHeight
            opacity *= clamp01((viewportPx - top) / fadePx) * clamp01(bottom / fadePx)
            isActive = opacity > 0
          }
        }

        node.style.opacity = String(opacity)
        node.style.visibility = isActive ? 'visible' : 'hidden'
        node.setAttribute('aria-hidden', isActive ? 'false' : 'true')
        if (box.motion === 'rise') {
          node.style.top = `calc(100svh - ${risePx}px)`
        }
      }

      setVisibleBoxId(active && active.opacity > 0 ? active.id : null)

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
      />

      <div className="story-track">
        <section
          className="scroll-screen scroll-screen-intro"
          aria-label="Introduction"
          ref={introRef}
        >
          <div className="story-masthead">
            <p className="story-kicker">{storyIntro.kicker}</p>
            <h1>{storyIntro.title}</h1>
            <p className="story-deck">{storyIntro.deck}</p>
            <p className="story-byline">
              <span>
                By{' '}
                <a href={storyIntro.authorHref} target="_blank" rel="noreferrer">
                  {storyIntro.author}
                </a>
              </span>
              <span className="story-byline-date">{storyIntro.date}</span>
            </p>
          </div>
        </section>

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

        <section className="scroll-screen scroll-screen-sources" aria-label="Sources">
          <div className="sources-page">
            <p className="story-kicker">{storyEnd.kicker}</p>
            {storyEnd.title ? <h1>{storyEnd.title}</h1> : null}
            <p className="sources-methodology">{storyEnd.methodology}</p>
            <ul className="sources-list">
              {storyEnd.sources.map((source) => (
                <li key={source.name}>
                  {source.href ? (
                    <a href={source.href} target="_blank" rel="noreferrer">
                      {source.name}
                    </a>
                  ) : (
                    <span className="sources-name">{source.name}</span>
                  )}
                  <p>{source.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {storyChapters.flatMap((chapter) =>
        chapter.boxes.map((box) => (
          <article
            key={box.id}
            className={`story-card story-card-${box.motion}`}
            aria-hidden="true"
            ref={(node) => {
              boxRefs.current[box.id] = node
            }}
          >
            {box.showBeforeAfter && chapter.detail?.beforeAfter ? (
              <div className="story-card-media">
                <BeforeAfterSlider
                  before={chapter.detail.beforeAfter.before}
                  after={chapter.detail.beforeAfter.after}
                />
              </div>
            ) : null}
            {box.showVideos && chapter.detail?.videos.length && visibleBoxId === box.id ? (
              <div className="story-card-media">
                <ChapterVideoPlayer videos={chapter.detail.videos} />
              </div>
            ) : null}
            <p>
              <HighlightedText text={box.text} />
            </p>
          </article>
        )),
      )}
    </main>
  )
}

export default App
