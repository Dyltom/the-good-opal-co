'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Pause, Play, Rotate3D } from 'lucide-react'
import type { RingRenderModelSelection } from '@/lib/custom-builder/ring-render-model'
import type { BuilderOpal, RingConfig } from './config'
import { opalPlacementFromConfig } from './config'
import { OpalFaceImage } from './OpalFaceImage'
import { RingScene } from './RingScene'
import type { RingView } from './RingScene'

interface RingPreviewProps {
  config: RingConfig
  description: string
  renderModel: RingRenderModelSelection
  selectedOpal?: BuilderOpal
}

function supportsWebGl(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

const views: readonly { accessibleLabel: string; id: RingView; label: string }[] = [
  { id: 'three-quarter', label: '3/4', accessibleLabel: 'Three-quarter view' },
  { id: 'front', label: 'Top', accessibleLabel: 'Top view' },
  { id: 'profile', label: 'Profile', accessibleLabel: 'Profile view' },
]

export function RingPreview({ config, description, renderModel, selectedOpal }: RingPreviewProps) {
  const [webGlAvailable, setWebGlAvailable] = useState<boolean | null>(null)
  const [motionEnabled, setMotionEnabled] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [zoomEnabled, setZoomEnabled] = useState(false)
  const [view, setView] = useState<RingView>('front')
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const desktop = window.matchMedia('(min-width: 640px)')
    setPrefersReducedMotion(media.matches)
    setMotionEnabled(false)
    setWebGlAvailable(supportsWebGl())
    setZoomEnabled(desktop.matches)
    const updateMotion = () => {
      setPrefersReducedMotion(media.matches)
      if (media.matches) setMotionEnabled(false)
    }
    media.addEventListener('change', updateMotion)
    const updateZoom = () => setZoomEnabled(desktop.matches)
    desktop.addEventListener('change', updateZoom)
    return () => {
      media.removeEventListener('change', updateMotion)
      desktop.removeEventListener('change', updateZoom)
    }
  }, [])

  return (
    <div className="relative aspect-[4/5] min-h-[28rem] w-full min-w-0 overflow-hidden bg-[#171714] text-cream sm:aspect-[5/4] lg:aspect-auto lg:h-full lg:min-h-0 [&_canvas]:touch-pan-y">
      {webGlAvailable ? (
        <RingScene
          config={config}
          selectedOpal={selectedOpal}
          allowMotion={motionEnabled}
          onContextLost={() => setWebGlAvailable(false)}
          reduceMotion={prefersReducedMotion}
          renderModel={renderModel}
          view={view}
          zoomEnabled={zoomEnabled}
        />
      ) : (
        <div className="absolute inset-0">
          <Image
            src="/images/customs/custom-2.jpg"
            alt="Australian opals used as inspiration for a custom jewellery design"
            fill
            priority
            className="object-cover opacity-70"
            sizes="(max-width: 1024px) 100vw, 58vw"
          />
          <div className="absolute inset-0 bg-black-rich/35" />
          <p className="absolute inset-x-6 bottom-24 max-w-md text-sm leading-6 text-cream/85">
            {webGlAvailable === null
              ? 'Preparing your studio preview…'
              : 'Interactive 3D is unavailable on this device. Your design choices still work and will be included with your enquiry.'}
          </p>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-5 sm:p-7">
        <div className="max-w-xs">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-opal-light">
            Studio preview
          </p>
          <p className="sr-only">{description}</p>
        </div>
        <span className="rounded-full bg-cream px-3 py-1 text-xs font-medium text-charcoal">
          {renderModel.makerApproved ? 'Maker-approved model' : 'Concept'}
        </span>
      </div>

      {webGlAvailable && (
        <div
          role="group"
          aria-label="Ring preview angle"
          className="absolute right-5 top-20 flex rounded-full border border-cream/20 bg-black-rich/75 p-1 sm:right-7 sm:top-24"
        >
          {views.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setView(option.id)}
              aria-label={option.accessibleLabel}
              aria-pressed={view === option.id}
              className="min-h-11 min-w-11 rounded-full px-3 text-xs font-medium text-cream/70 transition-colors hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-light aria-pressed:bg-cream aria-pressed:text-charcoal"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {webGlAvailable && (
        <div className="absolute inset-x-5 bottom-5 flex items-center justify-between gap-3 sm:inset-x-7 sm:bottom-7">
          {selectedOpal ? (
            <div className="flex max-w-[calc(100%_-_3.75rem)] items-center gap-2.5 rounded-lg bg-black-rich/80 p-2 text-cream sm:max-w-[70%] sm:gap-3 sm:p-2.5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center sm:h-28 sm:w-28">
                <OpalFaceImage
                  opal={selectedOpal}
                  placement={opalPlacementFromConfig(config)}
                  alt=""
                  clipToStone={selectedOpal.selectionKind === 'individual'}
                  sizes="112px"
                  className={
                    selectedOpal.selectionKind === 'individual'
                      ? 'h-full w-auto'
                      : 'h-full w-auto rounded-md'
                  }
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.12em] text-opal-light">
                  {selectedOpal.selectionKind === 'individual'
                    ? selectedOpal.visual.canonicalFace
                      ? 'Rectified opal face'
                      : selectedOpal.visual.contour
                        ? 'Reviewed crop + traced outline'
                        : 'Reviewed colour crop'
                    : 'Selected listing photo'}
                </p>
                <p className="line-clamp-2 text-xs leading-4 text-cream/85">{selectedOpal.name}</p>
                <p className="mt-1 text-xs text-cream/70">
                  {selectedOpal.stoneTypeLabel}
                  {selectedOpal.weight ? ` · ${selectedOpal.weight} ct` : ''}
                </p>
                {selectedOpal.visual.dimensionsMm && (
                  <p className="mt-1 text-xs text-cream/70">
                    {selectedOpal.visual.dimensionsMm.width} ×{' '}
                    {selectedOpal.visual.dimensionsMm.length} ×{' '}
                    {selectedOpal.visual.dimensionsMm.depth} mm
                  </p>
                )}
                {selectedOpal.selectionKind === 'individual' &&
                  !selectedOpal.visual.dimensionsMm && (
                    <p className="mt-1 text-xs text-cream/70">
                      Normalized shape scale · measurements pending
                    </p>
                  )}
                <p className="mt-1 text-xs leading-4 text-cream/60">
                  {selectedOpal.visual.canonicalFace
                    ? `Contour-masked reviewed face · ${selectedOpal.visual.silhouette} ${
                        selectedOpal.visual.dimensionsMm ? 'measured' : 'normalized'
                      } setting concept`
                    : selectedOpal.visual.textureCrop && selectedOpal.visual.photoFit === 'reviewed'
                      ? `${selectedOpal.visual.contour ? 'Reviewed crop + traced outline' : 'Reviewed colour crop'} · ${selectedOpal.visual.silhouette} ${
                          selectedOpal.visual.dimensionsMm ? 'measured' : 'normalized'
                        } setting concept`
                      : selectedOpal.visual.textureCrop
                        ? 'Listing photo mapped to an estimated setting profile · visual guide only'
                        : selectedOpal.selectionKind === 'individual'
                          ? 'Listing photo shown · 3D shape and colour are a visual guide'
                          : selectedOpal.selectionKind === 'specimen'
                            ? 'Specimen photo shown · setting feasibility requires consultation'
                            : 'Multiple stones pictured · 3D represents material, not one guaranteed stone'}
                </p>
              </div>
            </div>
          ) : (
            <p className="hidden items-center gap-2 text-xs text-cream/65 sm:flex">
              <Rotate3D aria-hidden="true" className="h-4 w-4" /> Drag to rotate · scroll to zoom
            </p>
          )}
          <button
            type="button"
            onClick={() => setMotionEnabled((current) => !current)}
            disabled={prefersReducedMotion}
            className="ml-auto inline-flex min-h-11 items-center gap-2 rounded-full border border-cream/25 bg-black-rich/70 px-4 text-sm text-cream transition-colors hover:bg-black-rich focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-light disabled:cursor-not-allowed disabled:opacity-55"
            aria-pressed={motionEnabled}
          >
            {motionEnabled ? (
              <Pause aria-hidden="true" className="h-4 w-4" />
            ) : (
              <Play aria-hidden="true" className="h-4 w-4" />
            )}
            <span className="sr-only sm:not-sr-only">
              {prefersReducedMotion
                ? 'Motion reduced'
                : motionEnabled
                  ? 'Pause motion'
                  : 'Play motion'}
            </span>
          </button>
        </div>
      )}
    </div>
  )
}
