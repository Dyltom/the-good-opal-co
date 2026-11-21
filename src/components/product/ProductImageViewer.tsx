'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent, type RefObject } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Minus, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { trackGalleryZoom } from '@/lib/analytics'
import { ProductVideo } from './ProductVideo'
import type { ProductGalleryVideo } from './ProductImageGallery'
import {
  actualPixelScale,
  clampView,
  fitRect,
  restingView,
  zoomAt,
  type Point,
  type Size,
  type View,
} from './inspect-view'

export interface ViewerSlide {
  url: string
  alt: string
  video?: ProductGalleryVideo
}

export interface ViewerPreview {
  index: number
  src: string
  aspect: number
}

interface ProductImageViewerProps {
  productName: string
  slides: ViewerSlide[]
  index: number
  preview?: ViewerPreview
  frameRef: RefObject<HTMLDivElement | null>
  onStep: (delta: number) => void
  onClose: () => void
}

interface Gesture {
  kind: 'pan' | 'pinch' | 'swipe'
  start: Point
  view: View
  distance: number
  moved: boolean
}

const ZOOM_STEP = 1.6
const SWIPE_DISTANCE = 56
const KEY_PAN = 0.2

const control =
  'flex min-h-11 min-w-11 items-center justify-center text-bg hover:bg-bg/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bg aria-disabled:opacity-40 aria-disabled:hover:bg-transparent'

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

export function ProductImageViewer({
  productName,
  slides,
  index,
  preview,
  frameRef,
  onStep,
  onClose,
}: ProductImageViewerProps) {
  const slide = slides[index]!
  const count = slides.length
  const dialogRef = useFocusTrap<HTMLDivElement>({ active: true, returnFocus: false })
  const closeRef = useRef<HTMLButtonElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const view = useRef<View>(restingView)
  const pointers = useRef(new Map<number, Point>())
  const gesture = useRef<Gesture | null>(null)
  const lastTap = useRef<{ time: number; point: Point } | null>(null)
  const zoomTracked = useRef(false)
  const [stage, setStage] = useState<Size | null>(null)
  const [shownUrl, setShownUrl] = useState(slide.url)
  const [aspect, setAspect] = useState<number | null>(preview && preview.index === index ? preview.aspect : null)
  const [full, setFull] = useState<Size | null>(null)
  const [scale, setScale] = useState(1)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [pixelRatio, setPixelRatio] = useState(1)

  if (shownUrl !== slide.url) {
    setShownUrl(slide.url)
    setAspect(preview && preview.index === index ? preview.aspect : null)
    setFull(null)
    setScale(1)
  }

  const photoAspect = full ? full.width / full.height : aspect
  const fit = stage ? fitRect(stage, photoAspect ?? stage.width / stage.height) : null
  const actual = fit && full ? actualPixelScale(full.width, fit.width, pixelRatio) : null
  const maxScale = Math.max(4, actual ?? 0)
  const detailScale = actual ? Math.min(maxScale, Math.max(2, actual)) : 2.5
  const zoomed = scale > 1.01

  const geometry = useRef({ stage, fit, maxScale, detailScale, reducedMotion })
  geometry.current = { stage, fit, maxScale, detailScale, reducedMotion }

  const apply = useCallback(
    (next: View, animate = false) => {
      const { stage: size, fit: rect, reducedMotion: still } = geometry.current
      const frame = frameRef.current
      if (!size || !rect || !frame) return
      const clamped = clampView(next, size, rect)
      view.current = clamped
      frame.style.transition = animate && !still ? 'transform 320ms cubic-bezier(0.16, 1, 0.3, 1)' : 'none'
      frame.style.transform = `translate3d(${clamped.x}px, ${clamped.y}px, 0) scale(${clamped.scale})`
      setScale(clamped.scale)
      if (clamped.scale > 1.01 && !zoomTracked.current) {
        zoomTracked.current = true
        trackGalleryZoom(productName)
      }
    },
    [frameRef, productName]
  )

  const zoomTo = useCallback(
    (target: number, point: Point, animate = false) => {
      const { fit: rect, maxScale: max } = geometry.current
      if (!rect) return
      const next = Math.min(max, Math.max(1, target))
      apply(zoomAt(view.current, next, point, rect), animate)
    },
    [apply]
  )

  const centre = useCallback((): Point => {
    const size = geometry.current.stage
    return size ? { x: size.width / 2, y: size.height / 2 } : { x: 0, y: 0 }
  }, [])

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(motion.matches)
    update()
    setPixelRatio(window.devicePixelRatio || 1)
    motion.addEventListener('change', update)
    return () => motion.removeEventListener('change', update)
  }, [])

  useLayoutEffect(() => {
    const element = stageRef.current
    if (!element) return
    const measure = () => {
      view.current = restingView
      const frame = frameRef.current
      if (frame) frame.style.transform = ''
      setScale(1)
      setStage({ width: element.clientWidth, height: element.clientHeight })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [frameRef])

  useLayoutEffect(() => {
    view.current = restingView
  }, [slide.url])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  useEffect(() => {
    const pan = (dx: number, dy: number) => {
      const size = geometry.current.stage
      if (!size) return
      apply({ ...view.current, x: view.current.x + dx * size.width, y: view.current.y + dy * size.height }, true)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return
      const isZoomed = view.current.scale > 1.01
      const keys: Record<string, () => void> = {
        Escape: onClose,
        ArrowRight: () => (isZoomed ? pan(-KEY_PAN, 0) : onStep(1)),
        ArrowLeft: () => (isZoomed ? pan(KEY_PAN, 0) : onStep(-1)),
        ArrowDown: () => isZoomed && pan(0, -KEY_PAN),
        ArrowUp: () => isZoomed && pan(0, KEY_PAN),
        '+': () => zoomTo(view.current.scale * ZOOM_STEP, centre(), true),
        '=': () => zoomTo(view.current.scale * ZOOM_STEP, centre(), true),
        '-': () => zoomTo(view.current.scale / ZOOM_STEP, centre(), true),
        '0': () => zoomTo(1, centre(), true),
      }
      const action = keys[event.key]
      if (!action) return
      event.preventDefault()
      action()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [apply, centre, onClose, onStep, zoomTo])

  const local = useCallback((event: { clientX: number; clientY: number }): Point => {
    const rect = stageRef.current?.getBoundingClientRect()
    return rect ? { x: event.clientX - rect.left, y: event.clientY - rect.top } : { x: 0, y: 0 }
  }, [])

  useEffect(() => {
    const element = stageRef.current
    if (!element || slide.video) return
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      const lines = event.deltaMode === 1 ? 16 : 1
      const speed = event.ctrlKey ? 0.01 : 0.0015
      zoomTo(view.current.scale * Math.exp(-event.deltaY * lines * speed), local(event))
    }
    element.addEventListener('wheel', onWheel, { passive: false })
    return () => element.removeEventListener('wheel', onWheel)
  }, [local, slide.video, zoomTo])

  const toggleZoom = (point: Point) => {
    zoomTo(view.current.scale > 1.01 ? 1 : geometry.current.detailScale, point, true)
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (slide.video || (event.pointerType === 'mouse' && event.button !== 0)) return
    event.currentTarget.setPointerCapture(event.pointerId)
    pointers.current.set(event.pointerId, local(event))
    const [a, b] = [...pointers.current.values()]
    if (a && b) {
      gesture.current = { kind: 'pinch', start: midpoint(a, b), view: view.current, distance: distance(a, b), moved: true }
    } else if (a) {
      gesture.current = { kind: view.current.scale > 1.01 ? 'pan' : 'swipe', start: a, view: view.current, distance: 0, moved: false }
    }
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return
    pointers.current.set(event.pointerId, local(event))
    const current = gesture.current
    const { fit: rect, maxScale: max } = geometry.current
    if (!current || !rect) return
    const [a, b] = [...pointers.current.values()]
    if (current.kind === 'pinch' && a && b) {
      const centrePoint = midpoint(a, b)
      const target = Math.min(max, Math.max(1, (current.view.scale * distance(a, b)) / current.distance))
      const next = zoomAt(current.view, target, current.start, rect)
      apply({ ...next, x: next.x + centrePoint.x - current.start.x, y: next.y + centrePoint.y - current.start.y })
      return
    }
    if (!a) return
    const dx = a.x - current.start.x
    const dy = a.y - current.start.y
    if (!current.moved && Math.hypot(dx, dy) < 6) return
    current.moved = true
    if (current.kind === 'pan') {
      apply({ ...current.view, x: current.view.x + dx, y: current.view.y + dy })
    } else if (count > 1 && frameRef.current) {
      frameRef.current.style.transition = 'none'
      frameRef.current.style.transform = `translate3d(${dx}px, 0, 0)`
    }
  }

  const endPointer = (event: PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    if (!pointers.current.delete(event.pointerId)) return
    const current = gesture.current
    const point = local(event)
    const remaining = [...pointers.current.values()][0]
    if (current?.kind === 'pinch') {
      gesture.current = remaining
        ? { kind: 'pan', start: remaining, view: view.current, distance: 0, moved: true }
        : null
      return
    }
    gesture.current = null
    if (!current || cancelled) {
      apply(view.current, true)
      return
    }
    if (!current.moved) {
      if (event.pointerType === 'mouse') {
        toggleZoom(point)
        return
      }
      const last = lastTap.current
      if (last && event.timeStamp - last.time < 320 && distance(last.point, point) < 32) {
        lastTap.current = null
        toggleZoom(point)
      } else {
        lastTap.current = { time: event.timeStamp, point }
      }
      return
    }
    const dx = point.x - current.start.x
    if (current.kind === 'swipe' && count > 1 && Math.abs(dx) > SWIPE_DISTANCE) {
      onStep(dx < 0 ? 1 : -1)
      return
    }
    apply(view.current, true)
  }

  const previewSrc = preview && preview.index === index ? preview.src : null

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${productName}, image ${index + 1} of ${count}`}
      className="fixed inset-0 z-[70] flex flex-col bg-ink"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 text-bg sm:px-6">
        <p className="min-w-0 truncate font-sans text-[12.5px] text-bg/75 sm:text-sm">
          <span className="tabular-nums">
            {index + 1} / {count}
          </span>
          {slide.video ? null : (
            <>
              <span className="ml-3">
                {full ? `Full-size photo, ${full.width} × ${full.height} px` : 'Loading full-size photo'}
              </span>
              <span className="ml-3 hidden sm:inline [@media(pointer:coarse)]:hidden">
                Scroll or click to zoom, drag to look around
              </span>
            </>
          )}
        </p>
        <button ref={closeRef} type="button" onClick={onClose} className={control} aria-label="Close full screen view">
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div
        ref={stageRef}
        tabIndex={-1}
        className={cn(
          'relative min-h-0 flex-1 touch-none select-none overflow-hidden outline-none',
          slide.video ? undefined : zoomed ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(event) => endPointer(event, false)}
        onPointerCancel={(event) => endPointer(event, true)}
      >
        {slide.video ? (
          <ProductVideo
            key={slide.video.url}
            src={slide.video.url}
            mimeType={slide.video.mimeType}
            poster={slide.video.poster}
            label={slide.alt}
            controls
          />
        ) : (
          <div
            key={slide.url}
            ref={frameRef}
            role="img"
            aria-label={slide.alt}
            className="absolute origin-top-left"
            style={
              fit
                ? { left: fit.left, top: fit.top, width: fit.width, height: fit.height }
                : { inset: 0 }
            }
          >
            <Image
              src={previewSrc ?? slide.url}
              unoptimized={Boolean(previewSrc)}
              alt=""
              fill
              sizes="100vw"
              quality={90}
              loading="eager"
              draggable={false}
              onLoad={(event) => {
                const image = event.currentTarget
                if (!aspect) setAspect(image.naturalWidth / image.naturalHeight)
              }}
              className={cn('object-contain', full && 'invisible')}
            />
            <Image
              src={slide.url}
              unoptimized
              alt=""
              fill
              loading="eager"
              draggable={false}
              onLoad={(event) => {
                const image = event.currentTarget
                setFull({ width: image.naturalWidth, height: image.naturalHeight })
              }}
              className={cn('object-contain', full ? 'opacity-100' : 'opacity-0')}
            />
          </div>
        )}
      </div>

      <div className="flex justify-center gap-2 py-3">
        {count > 1 ? (
          <button type="button" onClick={() => onStep(-1)} className={control} aria-label="Previous image">
            <ChevronLeft className="h-6 w-6" aria-hidden="true" />
          </button>
        ) : null}
        {slide.video ? null : (
          <>
            <button
              type="button"
              onClick={() => zoomTo(view.current.scale / ZOOM_STEP, centre(), true)}
              aria-disabled={!zoomed}
              className={control}
              aria-label="Zoom out"
            >
              <Minus className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => zoomTo(view.current.scale * ZOOM_STEP, centre(), true)}
              aria-disabled={scale >= maxScale - 0.01}
              className={control}
              aria-label="Zoom in"
            >
              <Plus className="h-5 w-5" aria-hidden="true" />
            </button>
          </>
        )}
        {count > 1 ? (
          <button type="button" onClick={() => onStep(1)} className={control} aria-label="Next image">
            <ChevronRight className="h-6 w-6" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </div>
  )
}
