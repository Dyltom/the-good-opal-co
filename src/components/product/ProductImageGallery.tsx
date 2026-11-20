'use client'

import { useCallback, useEffect, useRef, useState, ViewTransition, type PointerEvent } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFocusTrap } from '@/hooks/useFocusTrap'

interface ProductImage {
  url: string
  alt: string
}

interface ProductImageGalleryProps {
  productName: string
  images: ProductImage[]
  transitionName: string
}

const LOUPE_SCALE = 2.4

export function ProductImageGallery({ productName, images, transitionName }: ProductImageGalleryProps) {
  const [index, setIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [loupe, setLoupe] = useState<{ x: number; y: number } | null>(null)
  const [lightboxZoom, setLightboxZoom] = useState<{ x: number; y: number } | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const lightboxRef = useFocusTrap<HTMLDivElement>({ active: lightboxOpen })
  const count = images.length

  const show = useCallback(
    (next: number) => {
      const wrapped = (next + count) % count
      setIndex(wrapped)
      setLightboxZoom(null)
      const track = trackRef.current
      if (track) track.scrollTo({ left: wrapped * track.clientWidth, behavior: 'smooth' })
    },
    [count]
  )

  useEffect(() => {
    if (!lightboxOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightboxOpen(false)
      if (event.key === 'ArrowRight') show(index + 1)
      if (event.key === 'ArrowLeft') show(index - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [lightboxOpen, index, show])

  if (count === 0) {
    return <div className="aspect-square w-full border border-warm-grey/55 bg-white" aria-hidden="true" />
  }

  const current = images[Math.min(index, count - 1)] ?? images[0]!

  const pointerPosition = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    return {
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    }
  }

  const onTrackScroll = () => {
    const track = trackRef.current
    if (!track) return
    const next = Math.round(track.scrollLeft / track.clientWidth)
    if (next !== index) setIndex(next)
  }

  return (
    <div className="space-y-3">
      <ViewTransition name={transitionName}>
      <div className="relative">
        <div
          ref={trackRef}
          onScroll={onTrackScroll}
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] lg:overflow-hidden [&::-webkit-scrollbar]:hidden"
        >
          {images.map((image, imageIndex) => (
            <button
              key={image.url}
              type="button"
              onClick={() => {
                setIndex(imageIndex)
                setLightboxOpen(true)
              }}
              onPointerMove={(event) => {
                if (event.pointerType === 'mouse') setLoupe(pointerPosition(event))
              }}
              onPointerLeave={() => setLoupe(null)}
              className="group relative aspect-square w-full shrink-0 snap-center overflow-hidden border border-warm-grey/55 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-opal-electric-accessible lg:cursor-zoom-in"
              aria-label={`Open image ${imageIndex + 1} of ${count} of ${productName} full screen`}
            >
              <Image
                src={image.url}
                alt={image.alt}
                fill
                priority={imageIndex === 0}
                sizes="(max-width: 1024px) 100vw, 55vw"
                quality={90}
                className="object-cover transition-transform duration-200 ease-out motion-reduce:transition-none"
                style={
                  loupe && imageIndex === index
                    ? { transform: `scale(${LOUPE_SCALE})`, transformOrigin: `${loupe.x}% ${loupe.y}%` }
                    : undefined
                }
              />
            </button>
          ))}
        </div>

        <span
          className={cn(
            'pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1.5 bg-cream/95 px-3 py-2 font-sans text-xs font-semibold text-charcoal transition-opacity',
            loupe && 'opacity-0'
          )}
        >
          <Search className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden lg:inline">Hover to inspect, click for full screen</span>
          <span className="lg:hidden">Tap for full screen</span>
        </span>

        {count > 1 ? (
          <span className="pointer-events-none absolute bottom-3 left-3 bg-charcoal/80 px-2.5 py-1.5 font-sans text-xs font-semibold tabular-nums text-cream lg:hidden">
            {index + 1} / {count}
          </span>
        ) : null}
      </div>
      </ViewTransition>

      {count > 1 ? (
        <div className="hidden gap-2 lg:flex" role="group" aria-label="Product images">
          {images.map((image, imageIndex) => (
            <button
              key={image.url}
              type="button"
              onClick={() => show(imageIndex)}
              aria-current={imageIndex === index ? 'true' : undefined}
              aria-label={`Show image ${imageIndex + 1} of ${count}`}
              className={cn(
                'relative h-20 w-20 shrink-0 overflow-hidden border bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible',
                imageIndex === index ? 'border-charcoal' : 'border-warm-grey/55 opacity-75 hover:opacity-100'
              )}
            >
              <Image src={image.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}

      {lightboxOpen ? (
        <div
          ref={lightboxRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${productName}, image ${index + 1} of ${count}`}
          className="fixed inset-0 z-[70] flex flex-col bg-charcoal"
        >
          <div className="flex items-center justify-between px-4 py-3 text-cream sm:px-6">
            <p className="font-sans text-sm tabular-nums text-cream/75">
              {index + 1} / {count}
              <span className="ml-3 hidden sm:inline">
                {lightboxZoom ? 'Move to explore, click to zoom out' : 'Click the stone to zoom in'}
              </span>
            </p>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="flex min-h-11 min-w-11 items-center justify-center text-cream hover:bg-cream/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream"
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
            onClick={(event) =>
              setLightboxZoom((zoomed) => (zoomed ? null : pointerPosition(event as unknown as PointerEvent<HTMLElement>)))
            }
            onPointerMove={(event) => {
              if (lightboxZoom && event.pointerType === 'mouse') setLightboxZoom(pointerPosition(event))
            }}
          >
            <Image
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
          </div>
          {count > 1 ? (
            <div className="flex justify-center gap-2 py-3">
              <button
                type="button"
                onClick={() => show(index - 1)}
                className="flex min-h-11 min-w-11 items-center justify-center text-cream hover:bg-cream/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => show(index + 1)}
                className="flex min-h-11 min-w-11 items-center justify-center text-cream hover:bg-cream/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream"
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
