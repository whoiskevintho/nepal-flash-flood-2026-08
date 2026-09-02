import { useEffect, useState } from 'react'
import './App.css'
import { BeforeAfterSlider } from './components/BeforeAfterSlider'
import { TerrainMap } from './components/TerrainMap'
import { cameraChapters, initialCameraChapter } from './data/cameraChapters'

function App() {
  const [selectedChapterId, setSelectedChapterId] = useState(initialCameraChapter.id)
  const [activeDetailChapterId, setActiveDetailChapterId] = useState<string | null>(null)
  const [activeVideoIndex, setActiveVideoIndex] = useState(0)

  const selectedChapter =
    cameraChapters.find((chapter) => chapter.id === selectedChapterId) ?? initialCameraChapter
  const activeDetailChapter = cameraChapters.find(
    (chapter) => chapter.id === activeDetailChapterId,
  )
  const activeVideos = activeDetailChapter?.detail.videos ?? []
  const activeVideo = activeVideos[activeVideoIndex]
  const hasMultipleVideos = activeVideos.length > 1

  useEffect(() => {
    if (!activeDetailChapter) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setActiveDetailChapterId(null)
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
  }

  function showPreviousVideo() {
    setActiveVideoIndex((currentIndex) =>
      currentIndex === 0 ? activeVideos.length - 1 : currentIndex - 1,
    )
  }

  function showNextVideo() {
    setActiveVideoIndex((currentIndex) =>
      currentIndex === activeVideos.length - 1 ? 0 : currentIndex + 1,
    )
  }

  return (
    <main className="app-shell">
      <TerrainMap camera={selectedChapter} />

      <section className="map-panel story-panel" aria-labelledby="map-title">
        <p className="eyebrow">Interactive Terrain Story</p>
        <h1 id="map-title">Nepal Terrain Views</h1>
        <p>
          Select a chapter to fly the camera to a saved 3D view. Chapters use
          explicit longitude, latitude, zoom, pitch, bearing, and elevation values.
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
                onClick={() => setSelectedChapterId(chapter.id)}
              >
                <span className="chapter-kicker">Chapter {index + 1}</span>
                <span className="chapter-title-row">
                  <span className="chapter-title">{chapter.title}</span>
                </span>
                <span className="chapter-description">{chapter.description}</span>
              </button>
              <button
                type="button"
                className="read-more-button"
                onClick={() => openChapterDetail(chapter.id)}
              >
                Read More
              </button>
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
          onClick={() => setActiveDetailChapterId(null)}
        >
          <section
            className="detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="detail-modal-header">
              <p className="eyebrow">Chapter Detail</p>
              <button
                type="button"
                className="modal-close-button"
                aria-label="Close detail modal"
                onClick={() => setActiveDetailChapterId(null)}
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
                <video
                  className="detail-video"
                  controls
                  key={activeVideo.src}
                  src={activeVideo.src}
                  title={activeVideo.title}
                >
                  Your browser does not support the video tag.
                </video>
                {hasMultipleVideos ? (
                  <div className="video-navigation" aria-label="Video navigation">
                    <button type="button" onClick={showPreviousVideo}>
                      Prev Video
                    </button>
                    <span>
                      {activeVideoIndex + 1} of {activeVideos.length}
                    </span>
                    <button type="button" onClick={showNextVideo}>
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
