'use client'

import { startTransition, useCallback, useLayoutEffect, useRef, useState, ViewTransition, type PointerEvent } from 'react'
import { flushSync } from 'react-dom'
import Image from 'next/image'
import { Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import { trackGalleryFullscreen } from '@/lib/analytics'
import { ProductVideo } from './ProductVideo'
import type { ProductImageViewer, ViewerPreview } from './ProductImageViewer'

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
const MORPH_NAME = 'opal-inspect'
const MORPH_DECODE_WAIT = 300

let viewerModule: Promise<typeof ProductImageViewer> | undefined

function loadViewer() {
  viewerModule ??= import('./ProductImageViewer').then((module) => module.ProductImageViewer)
  return viewerModule
}

const focusRing = 'focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-accent'

function canMorph(element: HTMLElement | null | undefined): element is HTMLElement {
  if (!element || typeof document.startViewTransition !== 'function') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  const rect = element.getBoundingClientRect()
  return rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth
}

function morph(from: HTMLElement | null | undefined, update: () => void, target: () => HTMLElement | null | undefined) {
  if (!canMorph(from)) {
    flushSync(update)
    return
  }
  const root = document.documentElement
  let to: HTMLElement | null | undefined
  root.classList.add('vt-inspect')
  from.style.viewTransitionName = MORPH_NAME
  const transition = document.startViewTransition(async () => {
    from.style.viewTransitionName = ''
    flushSync(update)
    to = target()
    if (!to) return
    to.style.viewTransitionName = MORPH_NAME
    const image = to.querySelector('img')
    await Promise.race([
      image?.decode().catch(() => undefined),
      new Promise((resolve) => setTimeout(resolve, MORPH_DECODE_WAIT)),
    ])
  })
  void transition.finished.finally(() => {
    root.classList.remove('vt-inspect')
    if (to) to.style.viewTransitionName = ''
  })
}

export function ProductImageGallery({ productName, images, videos = [], transitionName }: ProductImageGalleryProps) {
  const [mainIndex, setMainIndex] = useState(0)
  const [scrollIndex, setScrollIndex] = useState(0)
  const [Viewer, setViewer] = useState<typeof ProductImageViewer | null>(null)
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)
  const [preview, setPreview] = useState<ViewerPreview>()
  const [loupeSource, setLoupeSource] = useState<string | null>(null)
  const [loupeLoaded, setLoupeLoaded] = useState<string | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const frames = useRef(new Map<number, HTMLSpanElement>())
  const viewerFrameRef = useRef<HTMLDivElement>(null)
  const loupeRef = useRef<HTMLSpanElement>(null)
  const loupeFrame = useRef(0)
  const returnFocusTo = useRef<number | null>(null)
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
    (delta: number) => setViewerIndex((current) => (current === null ? current : (current + delta + count) % count)),
    [count]
  )

  useLayoutEffect(() => {
    if (viewerIndex !== null || returnFocusTo.current === null) return
    frames.current.get(returnFocusTo.current)?.parentElement?.focus({ preventScroll: true })
    returnFocusTo.current = null
  }, [viewerIndex])

  const moveLoupe = (event: PointerEvent<HTMLElement> | null) => {
    const span = loupeRef.current
    cancelAnimationFrame(loupeFrame.current)
    if (!span) return
    if (!event) {
      span.style.transform = ''
      return
    }
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    loupeFrame.current = requestAnimationFrame(() => {
      span.style.transformOrigin = `${x}% ${y}%`
      span.style.transform = `scale(${LOUPE_SCALE})`
    })
  }

  const closeViewer = () => {
    const index = viewerIndex
    const frame = viewerFrameRef.current
    if (index === null) return
    returnFocusTo.current = index
    const tile = frames.current.get(index)
    const track = trackRef.current
    if (tile && track && track.scrollWidth > track.clientWidth) {
      const slide = tile.parentElement
      if (slide) track.scrollLeft = slide.offsetLeft - track.offsetLeft
    }
    if (frame) {
      frame.style.transition = 'none'
      frame.style.transform = ''
    }
    morph(
      slides[index]?.video ? null : frame,
      () => setViewerIndex(null),
      () => frames.current.get(index)
    )
  }

  if (count === 0) {
    return <div className="aspect-[4/5] w-full bg-plinth" aria-hidden="true" />
  }

  const openViewer = (slideIndex: number) => {
    cancelAnimationFrame(loupeFrame.current)
    const loupe = loupeRef.current
    if (loupe) {
      loupe.style.transition = 'none'
      loupe.style.transform = ''
      void loupe.offsetWidth
      loupe.style.transition = ''
    }
    const tile = frames.current.get(slideIndex)
    const image = tile?.querySelector('img')
    const ready = image && image.complete && image.naturalWidth > 0
    trackGalleryFullscreen(productName)
    void loadViewer().then((component) =>
      morph(
        slides[slideIndex]?.video || !ready ? null : tile,
        () => {
          setViewer(() => component)
          setPreview(
            ready ? { index: slideIndex, src: image.currentSrc || image.src, aspect: image.naturalWidth / image.naturalHeight } : undefined
          )
          setViewerIndex(slideIndex)
        },
        () => viewerFrameRef.current
      )
    )
  }

  const order = [mainIndex, ...slides.map((_, slideIndex) => slideIndex).filter((slideIndex) => slideIndex !== mainIndex)]
  const layout = count >= 3 ? 'stack' : count === 2 ? 'pair' : 'single'

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
            moveLoupe(null)
            startTransition(() => setMainIndex(slideIndex))
            return
          }
          openViewer(slideIndex)
        }}
        onPointerEnter={(event) => {
          if (isMain && event.pointerType === 'mouse' && !slide.video) setLoupeSource(slide.url)
        }}
        onPointerMove={(event) => {
          if (isMain && event.pointerType === 'mouse') moveLoupe(event)
        }}
        onPointerLeave={() => moveLoupe(null)}
        className={cn(slideClass(position), focusRing, 'cursor-zoom-in')}
        aria-label={
          isMain
            ? `Open image ${slideIndex + 1} of ${count} of ${productName} full screen`
            : slide.video
              ? `Show video ${slideIndex + 1} of ${count}`
              : `Show image ${slideIndex + 1} of ${count} larger`
        }
      >
        <span
          ref={(node) => {
            if (node) frames.current.set(slideIndex, node)
            else frames.current.delete(slideIndex)
          }}
          className={cn('block overflow-hidden', frameClass(position))}
        >
          {slide.url ? (
            <span
              ref={isMain ? loupeRef : undefined}
              className="absolute inset-0 transition-transform duration-200 ease-out motion-reduce:transition-none"
            >
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
                className="object-cover"
              />
              {isMain && loupeSource === slide.url ? (
                <Image
                  src={slide.url}
                  unoptimized
                  alt=""
                  fill
                  loading="eager"
                  onLoad={() => setLoupeLoaded(slide.url)}
                  className={cn('object-cover', loupeLoaded === slide.url ? 'opacity-100' : 'opacity-0')}
                />
              ) : null}
            </span>
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
        onPointerEnter={() => void loadViewer()}
        onFocus={() => void loadViewer()}
        aria-label={`Photos of ${productName}`}
        role="group"
        className={cn(
          'flex snap-x snap-mandatory items-start gap-1.5 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          'md:grid md:grid-cols-12 md:items-stretch md:gap-2 md:overflow-visible'
        )}
      >
        {order.map((slideIndex, position) =>
          position === 0 ? (
            <ViewTransition key={`main-${slideIndex}`} name={transitionName} share="piece" update="none">
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

      {Viewer && viewerIndex !== null ? (
        <Viewer
          productName={productName}
          slides={slides}
          index={viewerIndex}
          preview={preview}
          frameRef={viewerFrameRef}
          onStep={step}
          onClose={closeViewer}
        />
      ) : null}
    </div>
  )
}
