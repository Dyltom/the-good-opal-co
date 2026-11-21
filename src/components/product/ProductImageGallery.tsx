'use client'

import { startTransition, useCallback, useEffect, useRef, useState, ViewTransition, type PointerEvent } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { trackGalleryFullscreen, trackGalleryZoom } from '@/lib/analytics'
import { ProductVideo } from './ProductVideo'

interface ProductImage {
  url: string
  alt: string
}

export interface ProductGalleryVideo {
  url: string
  mimeType: string
  poster?: string
}

interface GallerySlide extends ProductImage {
  video?: ProductGalleryVideo
}

interface ProductImageGalleryProps {
  productName: string
  images: ProductImage[]
  videos?: ProductGalleryVideo[]
  transitionName: string
}

const LOUPE_SCALE = 2.4

const focusRing = 'focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-accent'

function pointerPosition(event: PointerEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect()
  return {
    x: ((event.clientX - rect.left) / rect.width) * 100,
    y: ((event.clientY - rect.top) / rect.height) * 100,
  }
}

export function ProductImageGallery({ productName, images, videos = [], transitionName }: ProductImageGalleryProps) {
  const [mainIndex, setMainIndex] = useState(0)
  const [scrollIndex, setScrollIndex] = useState(0)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [loupe, setLoupe] = useState<{ x: number; y: number } | null>(null)
  const [lightboxZoom, setLightboxZoom] = useState<{ x: number; y: number } | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const lightboxOpen = lightboxIndex !== null
  const lightboxRef = useFocusTrap<HTMLDivElement>({ active: lightboxOpen })
  const [firstImage, ...otherImages] = images
  const slides: GallerySlide[] = [
    ...(firstImage ? [firstImage] : []),
    ...videos.map((video, videoIndex) => ({
      url: video.poster ?? '',
      alt: `${productName} video ${videoIndex + 1}`,
      video,
    })),
    ...otherImages,
  ]
  const count = slides.length

  const step = useCallback(
    (delta: number) => {
      setLightboxZoom(null)
      setLightboxIndex((current) => (current === null ? current : (current + delta + count) % count))
    },
    [count]
  )

  useEffect(() => {
    if (!lightboxOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightboxIndex(null)
      if (event.key === 'ArrowRight') step(1)
      if (event.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [lightboxOpen, step])

  if (count === 0) {
    return <div className="aspect-[4/5] w-full bg-plinth" aria-hidden="true" />
  }

  const openLightbox = (slideIndex: number) => {
    setLoupe(null)
    setLightboxZoom(null)
    setLightboxIndex(slideIndex)
    trackGalleryFullscreen(productName)
  }

  const order = [mainIndex, ...slides.map((_, slideIndex) => slideIndex).filter((slideIndex) => slideIndex !== mainIndex)]
  const layout = count >= 3 ? 'stack' : count === 2 ? 'pair' : 'single'
  const current = lightboxIndex === null ? undefined : slides[lightboxIndex]

  const onTrackScroll = () => {
    const track = trackRef.current
    const first = track?.firstElementChild as HTMLElement | null
    if (!track || !first) return
    const next = Math.min(count - 1, Math.round(track.scrollLeft / (first.offsetWidth + 6)))
    if (next !== scrollIndex) setScrollIndex(next)
  }

  const slideClass = (position: number) =>
    cn(
      'relative block flex-none snap-start overflow-hidden bg-plinth',
      count > 1 ? 'w-[88%] md:w-auto' : 'w-full',
      layout === 'single' && 'md:col-span-12',
      layout === 'pair' && 'md:col-span-6',
      layout === 'stack' && position === 0 && 'md:col-span-12 lg:col-span-8 lg:row-span-2',
      layout === 'stack' && position > 0 && position < 3 && 'md:col-span-6 lg:col-span-4',
      layout === 'stack' && position >= 3 && (count - 3) % 2 === 0 && 'md:col-span-6',
      layout === 'stack' && position >= 3 && (count - 3) % 2 === 1 && 'md:col-span-6 lg:col-span-4'
    )

  const frameClass = (position: number) =>
    cn('relative aspect-[4/5]', layout === 'stack' && position > 0 && position < 3 && 'lg:aspect-auto lg:h-full')

  const renderSlide = (slideIndex: number, position: number) => {
    const slide = slides[slideIndex]!
    const isMain = position === 0

    if (slide.video && isMain) {
      return (
        <div key={slide.video.url} className={slideClass(position)}>
          <div className={frameClass(position)}>
            <ProductVideo src={slide.video.url} mimeType={slide.video.mimeType} poster={slide.video.poster} label={slide.alt} />
          </div>
        </div>
      )
    }

    return (
      <button
        key={slide.video?.url ?? slide.url}
        type="button"
        onClick={() => {
          const desktop = window.matchMedia('(min-width: 768px)').matches
          if (!isMain && desktop) {
            setLoupe(null)
            startTransition(() => setMainIndex(slideIndex))
            return
          }
          openLightbox(slideIndex)
        }}
        onPointerMove={(event) => {
          if (isMain && event.pointerType === 'mouse') setLoupe(pointerPosition(event))
        }}
        onPointerLeave={() => setLoupe(null)}
        className={cn(slideClass(position), focusRing, 'cursor-zoom-in')}
        aria-label={
          isMain
            ? `Open image ${slideIndex + 1} of ${count} of ${productName} full screen`
            : slide.video
              ? `Show video ${slideIndex + 1} of ${count}`
              : `Show image ${slideIndex + 1} of ${count} larger`
        }
      >
        <span className={cn('block', frameClass(position))}>
          {slide.url ? (
            <Image
              src={slide.url}
              alt={slide.alt}
              fill
              priority={slideIndex === 0}
              fetchPriority={slideIndex === 0 ? 'high' : undefined}
              sizes={
                isMain
                  ? '(max-width: 767px) 88vw, (max-width: 1023px) 55vw, 50vw'
                  : '(max-width: 767px) 88vw, (max-width: 1023px) 28vw, 25vw'
              }
              quality={90}
              className="object-cover transition-transform duration-200 ease-out motion-reduce:transition-none"
              style={
                isMain && loupe
                  ? { transform: `scale(${LOUPE_SCALE})`, transformOrigin: `${loupe.x}% ${loupe.y}%` }
                  : undefined
              }
            />
          ) : null}
          {slide.video ? (
            <span className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-sm border border-rule bg-bg text-ink">
              <Play className="h-4 w-4" aria-hidden="true" />
            </span>
          ) : null}
        </span>
      </button>
    )
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        onScroll={onTrackScroll}
        aria-label={`Photos of ${productName}`}
        role="group"
        className={cn(
          'flex snap-x snap-mandatory items-start gap-1.5 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          'md:grid md:grid-cols-12 md:items-stretch md:gap-2 md:overflow-visible'
        )}
      >
        {order.map((slideIndex, position) =>
          position === 0 ? (
            <ViewTransition key={`main-${slideIndex}`} name={transitionName} share="piece">
              {renderSlide(slideIndex, position)}
            </ViewTransition>
          ) : (
            renderSlide(slideIndex, position)
          )
        )}
      </div>

      {count > 1 ? (
        <p
          aria-hidden="true"
          className="absolute right-gut top-full pt-3 text-[12.5px] leading-5 text-ink-3 md:hidden"
        >
          <b className="font-medium text-ink">{scrollIndex + 1}</b> / {count}
        </p>
      ) : null}

      {current && lightboxIndex !== null ? (
        <div
          ref={lightboxRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${productName}, image ${lightboxIndex + 1} of ${count}`}
          className="fixed inset-0 z-[70] flex flex-col bg-ink"
        >
          <div className="flex items-center justify-between px-4 py-3 text-bg sm:px-6">
            <p className="font-sans text-sm tabular-nums text-bg/75">
              {lightboxIndex + 1} / {count}
              <span className="ml-3 hidden sm:inline">
                {current.video ? null : lightboxZoom ? 'Move to explore, click to zoom out' : 'Click the stone to zoom in'}
              </span>
            </p>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setLightboxIndex(null)}
              className="flex min-h-11 min-w-11 items-center justify-center text-bg hover:bg-bg/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bg"
              aria-label="Close full screen view"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div
            className={cn(
              'relative min-h-0 flex-1 touch-pinch-zoom overflow-hidden',
              lightboxZoom ? 'cursor-zoom-out' : 'cursor-zoom-in'
            )}
            onClick={(event) => {
              if (current.video) return
              if (!lightboxZoom) trackGalleryZoom(productName)
              setLightboxZoom((zoomed) => (zoomed ? null : pointerPosition(event as unknown as PointerEvent<HTMLElement>)))
            }}
            onPointerMove={(event) => {
              if (lightboxZoom && event.pointerType === 'mouse') setLightboxZoom(pointerPosition(event))
            }}
          >
            {current.video ? (
              <ProductVideo
                key={current.video.url}
                src={current.video.url}
                mimeType={current.video.mimeType}
                poster={current.video.poster}
                label={current.alt}
                controls
              />
            ) : (
              <Image
                key={current.url}
                src={current.url}
                alt={current.alt}
                fill
                sizes="100vw"
                quality={95}
                className="object-contain transition-transform duration-200 ease-out motion-reduce:transition-none"
                style={
                  lightboxZoom
                    ? { transform: 'scale(2.5)', transformOrigin: `${lightboxZoom.x}% ${lightboxZoom.y}%` }
                    : undefined
                }
              />
            )}
          </div>
          {count > 1 ? (
            <div className="flex justify-center gap-2 py-3">
              <button
                type="button"
                onClick={() => step(-1)}
                className="flex min-h-11 min-w-11 items-center justify-center text-bg hover:bg-bg/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bg"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                className="flex min-h-11 min-w-11 items-center justify-center text-bg hover:bg-bg/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bg"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
