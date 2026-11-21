'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Pause, Play, Rotate3D } from 'lucide-react'
import type { RingRenderModelSelection } from '@/lib/custom-builder/ring-render-model'
import type { BuilderOpal, RingConfig } from './config'
import { opalPhotoFitLabel, opalPlacementFromConfig } from './config'
import { OpalFaceImage } from './OpalFaceImage'
import { RingScene } from './RingScene'
import type { RingView } from './RingScene'

interface RingPreviewProps {
  config: RingConfig
  description: string
  reference: {
    image: string
    name: string
  }
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

export function RingPreview({
  config,
  description,
  reference,
  renderModel,
  selectedOpal,
}: RingPreviewProps) {
  const [webGlAvailable, setWebGlAvailable] = useState<boolean | null>(null)
  const [motionEnabled, setMotionEnabled] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [zoomEnabled, setZoomEnabled] = useState(false)
  const [view, setView] = useState<RingView>('front')
  const [previewSource, setPreviewSource] = useState<'concept' | 'reference'>('concept')
  const [failedAssetKey, setFailedAssetKey] = useState<string>()
  const approvedAssetFitKey =
    renderModel.kind === 'asset' && selectedOpal
      ? JSON.stringify([
          renderModel.variant.asset.sha256,
          renderModel.variant.id,
          config.style,
          config.shape,
          config.metal,
          config.size,
          selectedOpal.id,
          selectedOpal.visual.dimensionsMm,
          selectedOpal.visual.contour,
        ])
      : undefined
  const approvedAssetFailed = failedAssetKey === approvedAssetFitKey
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
  const sizeLabel = selectedOpal?.visual.dimensionsMm
    ? selectedOpal.visual.dimensionEvidence === 'maker-measured'
      ? 'Shown at measured size'
      : 'Shown at listed size'
    : undefined
  const previewCaption = !selectedOpal
    ? undefined
    : selectedOpal.visual.canonicalFace ||
        (selectedOpal.visual.textureCrop && selectedOpal.visual.photoFit === 'reviewed')
      ? sizeLabel
      : selectedOpal.visual.textureCrop
        ? 'Colour from the listing photo · shape is a guide'
        : selectedOpal.selectionKind === 'individual'
          ? 'Shape and colour are a guide'
          : selectedOpal.selectionKind === 'specimen'
            ? 'Specimen · we confirm at consultation whether it can be set'
            : 'Multi-stone listing · the preview shows a representative stone'

  return (
    <div className="relative h-[36svh] min-h-[16rem] w-full min-w-0 overflow-hidden bg-[#eae6de] text-bg sm:aspect-[5/4] sm:h-auto sm:min-h-0 lg:aspect-auto lg:h-full [&_canvas]:touch-pan-y">
      {previewSource === 'reference' ? (
        <div className="absolute inset-0 bg-[#11110f]">
          <Image
            src={reference.image}
            alt={`${reference.name}, sold Good Opal Co ring reference`}
            fill
            priority
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 58vw"
          />
        </div>
      ) : webGlAvailable ? (
        <RingScene
          config={config}
          selectedOpal={selectedOpal}
          allowMotion={motionEnabled}
          approvedAssetResetKey={approvedAssetFitKey}
          onContextLost={() => setWebGlAvailable(false)}
          onApprovedAssetFailure={
            approvedAssetFitKey ? () => setFailedAssetKey(approvedAssetFitKey) : undefined
          }
          reduceMotion={prefersReducedMotion}
          renderModel={renderModel}
          view={view}
          zoomEnabled={zoomEnabled}
        />
      ) : (
        <div className="absolute inset-0">
          {webGlAvailable === false && (
            <>
              <Image
                src={reference.image}
                alt={`${reference.name}, sold Good Opal Co ring reference`}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 62vw"
              />
              <p className="absolute inset-x-4 bottom-4 max-w-md rounded-sm bg-ink p-3 text-xs leading-5 text-bg sm:inset-x-6 sm:bottom-6">
                Showing our sold {reference.name}. The 3D view needs WebGL, which is off in this
                browser (often the hardware acceleration setting). Your choices still go with your
                enquiry.
              </p>
            </>
          )}
        </div>
      )}

      <p className="sr-only">{description}</p>
      <div className="pointer-events-none absolute right-3 top-16 sm:right-5 sm:top-20">
        <span className="rounded-full bg-bg/90 px-3 py-1 text-xs font-medium text-ink shadow-sm">
          {previewSource === 'reference' || webGlAvailable === false
            ? 'Sold reference'
            : renderModel.makerApproved && !approvedAssetFailed
              ? 'Maker-approved model'
              : 'Concept'}
        </span>
      </div>

      <div
        role="group"
        aria-label="Preview source"
        className="absolute left-3 top-3 flex rounded-full border border-bg/20 bg-ink p-1 sm:left-5 sm:top-5"
      >
        <button
          type="button"
          onClick={() => setPreviewSource('concept')}
          aria-pressed={previewSource === 'concept'}
          className="min-h-11 rounded-full px-3 text-xs font-medium text-bg/70 transition-colors hover:text-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plinth aria-pressed:bg-bg aria-pressed:text-ink"
        >
          3D concept
        </button>
        <button
          type="button"
          onClick={() => setPreviewSource('reference')}
          aria-label="Sold ring reference"
          aria-pressed={previewSource === 'reference'}
          className="min-h-11 rounded-full px-3 text-xs font-medium text-bg/70 transition-colors hover:text-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plinth aria-pressed:bg-bg aria-pressed:text-ink"
        >
          Sold ring
        </button>
      </div>

      {previewSource === 'concept' && webGlAvailable && (
        <div
          role="group"
          aria-label="Ring preview angle"
          className="absolute right-3 top-3 flex rounded-full border border-bg/20 bg-ink p-1 sm:right-5 sm:top-5"
        >
          {views.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setView(option.id)}
              aria-label={option.accessibleLabel}
              aria-pressed={view === option.id}
              className="min-h-11 min-w-11 rounded-full px-3 text-xs font-medium text-bg/70 transition-colors hover:text-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plinth aria-pressed:bg-bg aria-pressed:text-ink"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {previewSource === 'reference' ? (
        <div className="absolute inset-x-3 bottom-3 rounded-sm bg-ink p-3 sm:inset-x-5 sm:bottom-5 sm:p-4">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-bg">
            Physical design reference
          </p>
          <p className="mt-1 font-serif text-lg text-bg">{reference.name}</p>
          <p className="mt-1 text-xs leading-5 text-bg/70">
            Sold-ring photo for construction and proportion. Your selected opal changes the final
            fit and scale.
          </p>
        </div>
      ) : webGlAvailable ? (
        <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3 sm:inset-x-5 sm:bottom-5">
          {selectedOpal ? (
            <div className="hidden max-w-[70%] items-center gap-3 rounded-sm bg-ink p-2.5 text-bg sm:flex">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center xl:h-28 xl:w-28">
                <OpalFaceImage
                  opal={selectedOpal}
                  placement={opalPlacementFromConfig(config)}
                  alt=""
                  clipToStone={selectedOpal.selectionKind === 'individual'}
                  sizes="112px"
                  className={
                    selectedOpal.selectionKind === 'individual'
                      ? 'h-full w-auto'
                      : 'h-full w-auto rounded-sm'
                  }
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.12em] text-bg">
                  {selectedOpal.selectionKind === 'individual'
                    ? opalPhotoFitLabel(selectedOpal)
                    : 'Selected listing photo'}
                </p>
                <p className="line-clamp-2 text-xs leading-4 text-bg/85">{selectedOpal.name}</p>
                <p className="mt-1 text-xs text-bg/70">
                  {selectedOpal.stoneTypeLabel}
                  {selectedOpal.weight ? ` · ${selectedOpal.weight} ct` : ''}
                </p>
                {selectedOpal.visual.dimensionsMm && (
                  <p className="mt-1 text-xs text-bg/70">
                    {selectedOpal.visual.dimensionsMm.width} ×{' '}
                    {selectedOpal.visual.dimensionsMm.length} ×{' '}
                    {selectedOpal.visual.dimensionsMm.depth} mm
                  </p>
                )}
                {selectedOpal.selectionKind === 'individual' &&
                  !selectedOpal.visual.dimensionsMm && (
                    <p className="mt-1 text-xs text-bg/70">
                      Size estimated · confirmed at consultation
                    </p>
                  )}
                {previewCaption && (
                  <p className="mt-1 text-xs leading-4 text-bg/60">{previewCaption}</p>
                )}
              </div>
            </div>
          ) : (
            <p className="hidden items-center gap-2 rounded-full bg-bg/90 px-3 py-1.5 text-xs text-ink sm:flex">
              <Rotate3D aria-hidden="true" className="h-4 w-4" /> Drag to rotate · scroll to zoom
            </p>
          )}
          <button
            type="button"
            onClick={() => setMotionEnabled((current) => !current)}
            disabled={prefersReducedMotion}
            className="ml-auto inline-flex min-h-11 items-center gap-2 rounded-full border border-bg/25 bg-ink px-4 text-sm text-bg transition-colors hover:bg-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plinth disabled:cursor-not-allowed disabled:opacity-55"
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
      ) : null}
    </div>
  )
}
