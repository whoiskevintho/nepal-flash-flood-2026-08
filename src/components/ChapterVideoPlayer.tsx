import { useState } from 'react'
import type { ChapterVideo } from '../types/mapCamera'

type ChapterVideoPlayerProps = {
  videos: ChapterVideo[]
}

function getYoutubeEmbedUrl(youtubeUrl: string) {
  try {
    const parsed = new URL(youtubeUrl)
    const host = parsed.hostname.replace(/^www\./, '')

    if (host === 'youtu.be') {
      const id = parsed.pathname.split('/').filter(Boolean)[0]
      return id ? `https://www.youtube.com/embed/${id}` : null
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      const id =
        parsed.searchParams.get('v') ?? parsed.pathname.match(/\/(?:embed|shorts)\/([^/]+)/)?.[1]
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
  } catch {
    return null
  }

  return null
}

function getFacebookEmbedUrl(facebookUrl: string) {
  try {
    const parsed = new URL(facebookUrl)
    const host = parsed.hostname.replace(/^www\./, '')

    if (
      host === 'facebook.com' ||
      host === 'm.facebook.com' ||
      host === 'fb.com' ||
      host === 'fb.watch'
    ) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(facebookUrl)}&show_text=false`
    }
  } catch {
    return null
  }

  return null
}

function getOrientationClass(url: string) {
  try {
    return /\/(?:reel|reels|shorts)\//i.test(new URL(url).pathname) ? 'is-portrait' : 'is-landscape'
  } catch {
    return 'is-landscape'
  }
}

function VideoEmbed({ video }: { video: ChapterVideo }) {
  if (video.youtubeUrl) {
    return (
      <iframe
        className={`detail-youtube ${getOrientationClass(video.youtubeUrl)}`}
        src={getYoutubeEmbedUrl(video.youtubeUrl) ?? undefined}
        title={video.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    )
  }

  if (video.facebookUrl) {
    return (
      <iframe
        className={`detail-facebook ${getOrientationClass(video.facebookUrl)}`}
        src={getFacebookEmbedUrl(video.facebookUrl) ?? undefined}
        title={video.title}
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        allowFullScreen
      />
    )
  }

  return (
    <video className="detail-video" controls preload="metadata" src={video.src} title={video.title}>
      Your browser does not support the video tag.
    </video>
  )
}

export function ChapterVideoPlayer({ videos }: ChapterVideoPlayerProps) {
  const [index, setIndex] = useState(0)
  const video = videos[index]

  if (!video) {
    return null
  }

  return (
    <div className="chapter-video-player">
      <div className="video-source-row">
        <span className="video-title">{video.title}</span>
        {video.sourceHref ? (
          <a className="detail-source-link" href={video.sourceHref} target="_blank" rel="noreferrer">
            Source
          </a>
        ) : null}
      </div>
      <div className="video-frame">
        <VideoEmbed key={index} video={video} />
      </div>
      <p className="video-warning">
        <strong>WARNING:</strong> graphic content
      </p>
      {videos.length > 1 ? (
        <div className="video-navigation" aria-label="Video navigation">
          <button
            type="button"
            onClick={() => setIndex((index - 1 + videos.length) % videos.length)}
          >
            Prev Video
          </button>
          <span>
            {index + 1} of {videos.length}
          </span>
          <button type="button" onClick={() => setIndex((index + 1) % videos.length)}>
            Next Video
          </button>
        </div>
      ) : null}
    </div>
  )
}
