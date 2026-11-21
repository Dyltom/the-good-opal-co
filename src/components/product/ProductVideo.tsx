'use client'

import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductVideoProps {
  src: string
  mimeType: string
  poster?: string
  label: string
  controls?: boolean
  className?: string
}

export function ProductVideo({ src, mimeType, poster, label, controls = false, className }: ProductVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const pausedByViewer = useRef(false)
  const [playing, setPlaying] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(true)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video || reducedMotion) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) video.pause()
        else if (!pausedByViewer.current) void video.play().catch(() => undefined)
      },
      { threshold: 0.6 }
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [reducedMotion])

  const toggle = () => {
    const video = videoRef.current
    if (!video) return
    pausedByViewer.current = !video.paused
    if (video.paused) void video.play().catch(() => undefined)
    else video.pause()
  }

  return (
    <div className={cn('relative h-full w-full bg-ink', className)}>
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        controls={controls}
        preload={poster ? 'none' : 'metadata'}
        poster={poster}
        aria-label={label}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className={cn('h-full w-full', controls ? 'object-contain' : 'object-cover')}
      >
        <source src={src} type={mimeType} />
      </video>
      {controls ? null : (
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? `Pause ${label}` : `Play ${label}`}
          className={cn(
            'absolute flex items-center justify-center bg-bg/95 text-ink transition-colors hover:bg-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
            playing
              ? 'right-3 top-3 h-11 w-11'
              : 'left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full'
          )}
        >
          {playing ? (
            <Pause className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Play className="ml-0.5 h-6 w-6" aria-hidden="true" />
          )}
        </button>
      )}
    </div>
  )
}
