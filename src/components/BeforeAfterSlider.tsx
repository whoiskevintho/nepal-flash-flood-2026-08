import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'

type BeforeAfterSliderProps = {
  before: {
    src: string
    alt: string
  }
  after: {
    src: string
    alt: string
  }
  initialPosition?: number
}

type ImageLoadStatus = 'loading' | 'ready' | 'error'

type LoadedImages = {
  beforeSrc: string
  afterSrc: string
  status: ImageLoadStatus
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function loadImage(src: string) {
  return new Promise<void>((resolve, reject) => {
    const image = new Image()

    image.onload = () => {
      resolve()
    }
    image.onerror = () => {
      reject(new Error(`Failed to load image: ${src}`))
    }
    image.src = src
  })
}

export function BeforeAfterSlider({
  before,
  after,
  initialPosition = 50,
}: BeforeAfterSliderProps) {
  const sliderRef = useRef<HTMLDivElement | null>(null)
  const [sliderPosition, setSliderPosition] = useState(() => clamp(initialPosition, 0, 100))
  const [isDragging, setIsDragging] = useState(false)
  const [loadedImages, setLoadedImages] = useState<LoadedImages>({
    beforeSrc: before.src,
    afterSrc: after.src,
    status: 'loading',
  })
  const imageLoadStatus =
    loadedImages.beforeSrc === before.src && loadedImages.afterSrc === after.src
      ? loadedImages.status
      : 'loading'

  useEffect(() => {
    let isCancelled = false

    Promise.all([loadImage(before.src), loadImage(after.src)])
      .then(() => {
        if (!isCancelled) {
          setLoadedImages({
            beforeSrc: before.src,
            afterSrc: after.src,
            status: 'ready',
          })
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setLoadedImages({
            beforeSrc: before.src,
            afterSrc: after.src,
            status: 'error',
          })
        }
      })

    return () => {
      isCancelled = true
    }
  }, [after.src, before.src])

  function updateSliderPosition(clientX: number) {
    const slider = sliderRef.current

    if (!slider) {
      return
    }

    const bounds = slider.getBoundingClientRect()

    if (bounds.width === 0) {
      return
    }

    const nextPosition = ((clientX - bounds.left) / bounds.width) * 100

    setSliderPosition(clamp(nextPosition, 0, 100))
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    setIsDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
    updateSliderPosition(event.clientX)
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!isDragging) {
      return
    }

    updateSliderPosition(event.clientX)
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    setIsDragging(false)

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      setSliderPosition((currentPosition) => clamp(currentPosition - 5, 0, 100))
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      setSliderPosition((currentPosition) => clamp(currentPosition + 5, 0, 100))
    }

    if (event.key === 'Home') {
      event.preventDefault()
      setSliderPosition(0)
    }

    if (event.key === 'End') {
      event.preventDefault()
      setSliderPosition(100)
    }
  }

  if (imageLoadStatus !== 'ready') {
    return (
      <div className="before-after-slider before-after-slider-placeholder" aria-live="polite">
        {imageLoadStatus === 'loading'
          ? 'Loading before and after imagery...'
          : 'Before and after imagery could not be loaded.'}
      </div>
    )
  }

  return (
    <div
      className="before-after-slider"
      ref={sliderRef}
      role="slider"
      tabIndex={0}
      aria-label="Compare before and after imagery"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(sliderPosition)}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <img
        className="before-after-image"
        src={after.src}
        alt={after.alt}
        draggable={false}
        decoding="async"
      />
      <div
        className="before-after-overlay"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          className="before-after-image"
          src={before.src}
          alt={before.alt}
          draggable={false}
          decoding="async"
        />
      </div>
      <span className="before-after-label before-after-label-before">Before</span>
      <span className="before-after-label before-after-label-after">After</span>
      <span className="before-after-handle" style={{ left: `${sliderPosition}%` }} />
    </div>
  )
}
