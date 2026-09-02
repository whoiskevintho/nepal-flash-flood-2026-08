import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'

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

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function BeforeAfterSlider({
  before,
  after,
  initialPosition = 50,
}: BeforeAfterSliderProps) {
  const sliderRef = useRef<HTMLDivElement | null>(null)
  const [sliderPosition, setSliderPosition] = useState(() => clamp(initialPosition, 0, 100))
  const [isDragging, setIsDragging] = useState(false)

  function updateSliderPosition(clientX: number) {
    const slider = sliderRef.current

    if (!slider) {
      return
    }

    const bounds = slider.getBoundingClientRect()
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
    event.currentTarget.releasePointerCapture(event.pointerId)
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
      <img className="before-after-image" src={after.src} alt={after.alt} draggable={false} />
      <div
        className="before-after-overlay"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img className="before-after-image" src={before.src} alt={before.alt} draggable={false} />
      </div>
      <span className="before-after-label before-after-label-before">Before</span>
      <span className="before-after-label before-after-label-after">After</span>
      <span className="before-after-handle" style={{ left: `${sliderPosition}%` }} />
    </div>
  )
}
