import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { BeforeAfterSlider } from './components/BeforeAfterSlider'
import { TerrainMap } from './components/TerrainMap'
import { cameraChapters, globalMapOverlays, initialCameraChapter } from './data/cameraChapters'
import type { CameraChapter, MapOverlay } from './types/mapCamera'

function App() {
  const [selectedChapterId, setSelectedChapterId] = useState(initialCameraChapter.id)
  const [activeDistanceChapterId, setActiveDistanceChapterId] = useState<string | null>(null)
  const [activeDetailChapterId, setActiveDetailChapterId] = useState<string | null>(null)
  const [activeVideoIndex, setActiveVideoIndex] = useState(0)
  const [pendingVideoIndex, setPendingVideoIndex] = useState<number | null>(null)
  const [isVideoLoading, setIsVideoLoading] = useState(false)
  const isVideoLoadingRef = useRef(false)

  const selectedChapter: CameraChapter =
    cameraChapters.find((chapter) => chapter.id === selectedChapterId) ?? initialCameraChapter
  const activeDistanceChapter: CameraChapter | undefined = cameraChapters.find(
    (chapter) => chapter.id === activeDistanceChapterId,
  )
  const activeDetailChapter: CameraChapter | undefined = cameraChapters.find(
    (chapter) => chapter.id === activeDetailChapterId,
  )
  const activeCamera = activeDistanceChapter?.distance?.camera ?? selectedChapter
  const activeOverlays = useMemo(() => {
    const overlays: MapOverlay[] = [...globalMapOverlays]

    if (activeDistanceChapter?.distance?.overlay) {
      overlays.push(activeDistanceChapter.distance.overlay)
    }

    return overlays
  }, [activeDistanceChapter])
  const activeVideos: CameraChapter['detail']['videos'] = activeDetailChapter?.detail.videos ?? []
  const activeVideo = activeVideos[activeVideoIndex]
  const pendingVideo = pendingVideoIndex === null ? undefined : activeVideos[pendingVideoIndex]
  const hasMultipleVideos = activeVideos.length > 1

  useEffect(() => {
    if (!activeDetailChapter) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeChapterDetail()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeDetailChapter])

  function openChapterDetail(chapterId: string) {
    setActiveDetailChapterId(chapterId)
    setActiveVideoIndex(0)
    setPendingVideoIndex(null)
    setIsVideoLoading(false)
    isVideoLoadingRef.current = false
  }

  function selectChapter(chapterId: string) {
    setSelectedChapterId(chapterId)
    setActiveDistanceChapterId(null)
  }

  function showDistance(chapter: CameraChapter) {
    if (!chapter.distance) {
      return
    }

    setSelectedChapterId(chapter.id)
    setActiveDistanceChapterId(chapter.id)
    closeChapterDetail()
  }

  function closeChapterDetail() {
    setActiveDetailChapterId(null)
    setPendingVideoIndex(null)
    setIsVideoLoading(false)
    isVideoLoadingRef.current = false
  }

  function requestVideoIndex(nextIndex: number) {
    if (isVideoLoadingRef.current || nextIndex === activeVideoIndex || !activeVideos[nextIndex]) {
      return
    }

    isVideoLoadingRef.current = true
    setIsVideoLoading(true)
    setPendingVideoIndex(nextIndex)
  }

  function showPendingVideo(videoIndex: number) {
    if (pendingVideoIndex !== videoIndex) {
      return
    }

    setActiveVideoIndex(videoIndex)
    setPendingVideoIndex(null)
    setIsVideoLoading(false)
    isVideoLoadingRef.current = false
  }

  function cancelPendingVideo(videoIndex: number) {
    if (pendingVideoIndex !== videoIndex) {
      return
    }

    setPendingVideoIndex(null)
    setIsVideoLoading(false)
    isVideoLoadingRef.current = false
  }

  function showPreviousVideo() {
    const previousIndex = activeVideoIndex === 0 ? activeVideos.length - 1 : activeVideoIndex - 1

    requestVideoIndex(previousIndex)
  }

  function showNextVideo() {
    const nextIndex = activeVideoIndex === activeVideos.length - 1 ? 0 : activeVideoIndex + 1

    requestVideoIndex(nextIndex)
  }

  return (
    <main className="app-shell">
      <TerrainMap camera={activeCamera} overlays={activeOverlays} />

      <section className="map-panel story-panel" aria-labelledby="map-title">
        <p className="eyebrow">Interactive Story</p>
        <h1 id="map-title">Nepal Flash Flood</h1>
        <p>
          Select chapters to fly to their views. Read More and view distances along the path of the flash flood.
        </p>

        <div className="chapter-list" aria-label="Story chapters">
          {cameraChapters.map((chapter, index) => (
            <article
              className={`chapter-card ${chapter.id === selectedChapter.id ? 'active' : ''}`}
              key={chapter.id}
            >
              <button
                type="button"
                className="chapter-button"
                aria-pressed={chapter.id === selectedChapter.id}
                onClick={() => selectChapter(chapter.id)}
              >
                <span className="chapter-kicker">Chapter {index + 1}</span>
                <span className="chapter-title-row">
                  <span className="chapter-title">{chapter.title}</span>
                </span>
                <span className="chapter-description">{chapter.description}</span>
              </button>
              <div className="chapter-actions">
                <button
                  type="button"
                  className="read-more-button"
                  onClick={() => openChapterDetail(chapter.id)}
                >
                  Read More
                </button>
                {chapter.distance ? (
                <button
                  type="button"
                  className="distance-button"
                  onClick={() => showDistance(chapter)}
                >
                  {chapter.distance.label}
                </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>

        <p className="author-note">
          Authoring tip: the URL hash is <code>zoom/lat/lng/bearing/pitch</code>.
          Use it as <code>center: [lng, lat]</code>, <code>zoom</code>,{' '}
          <code>bearing</code>, and <code>pitch</code>, then add{' '}
          <code>elevationMeters</code> for the terrain center point.
        </p>
      </section>

      {activeDetailChapter ? (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={closeChapterDetail}
        >
          <section
            className="detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="detail-modal-header">
              <p className="eyebrow">{activeDetailChapter.location ?? 'Chapter Detail'}</p>
              <button
                type="button"
                className="modal-close-button"
                aria-label="Close detail modal"
                onClick={closeChapterDetail}
              >
                Close
              </button>
            </div>
            <h2 id="detail-modal-title">{activeDetailChapter.title}</h2>
            {activeDetailChapter.detail.beforeAfter ? (
              <BeforeAfterSlider
                before={activeDetailChapter.detail.beforeAfter.before}
                after={activeDetailChapter.detail.beforeAfter.after}
              />
            ) : null}
            {activeVideo ? (
              <>
                {activeVideo.sourceHref ? (
                  <div className="video-source-row">
                    <a
                      className="detail-source-link"
                      href={activeVideo.sourceHref}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Source
                    </a>
                  </div>
                ) : null}
                <div className="video-frame">
                  <video
                    className="detail-video"
                    controls
                    preload="auto"
                    src={activeVideo.src}
                    title={activeVideo.title}
                  >
                    Your browser does not support the video tag.
                  </video>
                  {pendingVideo ? (
                    <video
                      aria-hidden="true"
                      className="video-preloader"
                      muted
                      preload="auto"
                      src={pendingVideo.src}
                      onCanPlay={() => {
                        if (pendingVideoIndex !== null) {
                          showPendingVideo(pendingVideoIndex)
                        }
                      }}
                      onError={() => {
                        if (pendingVideoIndex !== null) {
                          cancelPendingVideo(pendingVideoIndex)
                        }
                      }}
                    />
                  ) : null}
                </div>
                {hasMultipleVideos ? (
                  <div className="video-navigation" aria-label="Video navigation">
                    <button type="button" disabled={isVideoLoading} onClick={showPreviousVideo}>
                      Prev Video
                    </button>
                    <span>
                      {isVideoLoading ? 'Loading' : activeVideoIndex + 1} of {activeVideos.length}
                    </span>
                    <button type="button" disabled={isVideoLoading} onClick={showNextVideo}>
                      Next Video
                    </button>
                  </div>
                ) : null}
              </>
            ) : null}
            <p>{activeDetailChapter.detail.text}</p>
          </section>
        </div>
      ) : null}
    </main>
  )
}

export default App
