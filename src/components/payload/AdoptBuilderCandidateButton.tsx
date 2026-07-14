'use client'

import type { CSSProperties } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useDocumentInfo, useFormFields } from '@payloadcms/ui'
import type { BuilderStoneContourV1 } from '@/lib/custom-builder/stone-contour'
import { computePlacedPhotoCrop, rotationCoverScale } from '@/lib/custom-builder/photo-crop'

type Crop = {
  focalX: number | null
  focalY: number | null
  rotation: number | null
  zoom: number | null
}

interface BuilderCandidateReview {
  active: {
    contour: BuilderStoneContourV1 | null
    crop: Crop
    eligible: boolean
    mappingStatus: 'manual' | 'pending' | 'reviewed' | 'stale' | null
    matchesCandidateContour: boolean
    matchesCandidateCrop: boolean
    sourceIsCurrent: boolean
  }
  candidate: {
    adoptable: boolean
    analysisError: string | null
    analysisVersion: number | null
    confidence: number | null
    contour: BuilderStoneContourV1 | null
    crop: Crop
    genericFallback: boolean
    placementAdoptable: boolean
    sourceImageHash: string | null
  }
  dimensions: {
    depth: number | null
    length: number | null
    width: number | null
  }
  product: {
    id: number
    name: string
    silhouette: string | null
  }
  sourceImage: {
    alt: string
    height: number | null
    url: string | null
    width: number | null
  } | null
}

function contourPoints(contour: BuilderStoneContourV1 | null): string | undefined {
  if (!contour) return undefined
  return contour.radii
    .map((radius, index) => {
      const angle = (index / contour.radii.length) * Math.PI * 2
      const x = 50 + Math.cos(angle) * radius * 45
      const y = 50 - Math.sin(angle) * radius * 45
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')
}

function formatConfidence(value: number | null): string {
  return value === null ? 'Unavailable' : `${Math.round(value * 100)}%`
}

function reviewState(review: BuilderCandidateReview): string {
  if (review.candidate.genericFallback) return 'Generic fallback — manual mapping required'
  if (!review.candidate.contour) return 'No image-derived contour candidate'
  if (
    review.active.matchesCandidateContour &&
    review.active.matchesCandidateCrop &&
    review.active.sourceIsCurrent
  ) {
    return 'Approved mapping matches this candidate'
  }
  if (review.active.contour) return 'Candidate differs from approved mapping'
  return 'Candidate awaiting approval'
}

function missingDimensions(review: BuilderCandidateReview): string[] {
  return (['length', 'width', 'depth'] as const).filter(
    (dimension) => review.dimensions[dimension] === null
  )
}

function candidatePhotoStyle(
  review: BuilderCandidateReview,
  frameAspect: number
): CSSProperties | undefined {
  const image = review.sourceImage
  if (!image?.url) return undefined
  const crop = review.candidate.crop
  const rotation = crop.rotation ?? 0
  const base: CSSProperties = {
    position: 'absolute',
    backgroundImage: `url(${JSON.stringify(image.url)})`,
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }
  if (
    image.width === null ||
    image.height === null ||
    crop.focalX === null ||
    crop.focalY === null ||
    crop.zoom === null
  ) {
    return {
      ...base,
      inset: '-8%',
      backgroundPosition: `${(crop.focalX ?? 0.5) * 100}% ${(crop.focalY ?? 0.5) * 100}%`,
      backgroundSize: `${(crop.zoom ?? 1) * 100}% auto`,
      transform: `rotate(${rotation}deg)`,
    }
  }

  const placed = computePlacedPhotoCrop(image.width, image.height, frameAspect, {
    focalX: crop.focalX,
    focalY: crop.focalY,
    zoom: crop.zoom,
  })
  return {
    ...base,
    height: `${100 / placed.height}%`,
    left: `${(-placed.left / placed.width) * 100}%`,
    top: `${(-placed.top / placed.height) * 100}%`,
    width: `${100 / placed.width}%`,
    backgroundSize: '100% 100%',
    transform: `rotate(${rotation}deg) scale(${rotationCoverScale(frameAspect, rotation)})`,
    transformOrigin: `${(placed.left + placed.width / 2) * 100}% ${(placed.top + placed.height / 2) * 100}%`,
  }
}

export function AdoptBuilderCandidateButton() {
  const { id } = useDocumentInfo()
  const category = useFormFields(([fields]) => fields.category?.value)
  const [review, setReview] = useState<BuilderCandidateReview | null>(null)
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [loadMessage, setLoadMessage] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [action, setAction] = useState<'full' | 'placement' | null>(null)
  const [saveMessage, setSaveMessage] = useState('')
  const reloadTimer = useRef<number | null>(null)

  useEffect(() => {
    if (!id || category !== 'raw-opals') return
    const controller = new AbortController()
    setLoadState('loading')
    setLoadMessage('')

    void fetch(`/api/admin/products/${id}/adopt-builder-candidate`, {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = (await response.json()) as BuilderCandidateReview | { error?: string }
        if (!response.ok) {
          throw new Error(
            'error' in result && result.error ? result.error : 'Review data failed to load.'
          )
        }
        setReview(result as BuilderCandidateReview)
        setLoadState('ready')
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setLoadState('error')
        setLoadMessage(error instanceof Error ? error.message : 'Review data failed to load.')
      })

    return () => controller.abort()
  }, [category, id, reloadKey])

  useEffect(
    () => () => {
      if (reloadTimer.current !== null) window.clearTimeout(reloadTimer.current)
    },
    []
  )

  const candidatePoints = useMemo(
    () => contourPoints(review?.candidate.contour ?? null),
    [review?.candidate.contour]
  )
  const activePoints = useMemo(
    () => contourPoints(review?.active.contour ?? null),
    [review?.active.contour]
  )

  if (!id || category !== 'raw-opals') return null

  async function adoptCandidate(mode: 'full' | 'placement') {
    const confirmation =
      mode === 'placement'
        ? 'Apply the analyzed image placement without changing the approved contour or review status?'
        : 'Adopt this analyzed contour and image placement as the protected builder mapping?'
    if (!window.confirm(confirmation)) return

    setSaveState('saving')
    setAction(mode)
    setSaveMessage('')
    try {
      const query = mode === 'placement' ? '?mode=placement' : ''
      const response = await fetch(`/api/admin/products/${id}/adopt-builder-candidate${query}`, {
        method: 'POST',
      })
      const result = (await response.json()) as { error?: string; message?: string }
      if (!response.ok) throw new Error(result.error ?? 'Candidate adoption failed.')
      setSaveState('saved')
      setSaveMessage(result.message ?? 'Candidate adopted.')
      reloadTimer.current = window.setTimeout(() => window.location.reload(), 900)
    } catch (error) {
      setSaveState('error')
      setSaveMessage(error instanceof Error ? error.message : 'Candidate adoption failed.')
    }
  }

  if (loadState === 'idle' || loadState === 'loading') {
    return (
      <div role="status" aria-live="polite" style={{ paddingBlock: 10, fontSize: 13 }}>
        Loading opal mapping review…
      </div>
    )
  }

  if (loadState === 'error' || !review) {
    return (
      <div
        style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, paddingBlock: 8 }}
      >
        <span role="alert" style={{ fontSize: 13 }}>
          {loadMessage || 'Review data failed to load.'}
        </span>
        <button
          type="button"
          className="btn btn--style-secondary btn--size-small"
          onClick={() => setReloadKey((value) => value + 1)}
        >
          Retry
        </button>
      </div>
    )
  }

  const missing = missingDimensions(review)
  const crop = review.candidate.crop
  const frameAspect =
    review.dimensions.width && review.dimensions.length
      ? Math.min(1.6, Math.max(0.4, review.dimensions.width / review.dimensions.length))
      : 1
  const placementDisabled =
    !review.candidate.placementAdoptable || saveState === 'saving' || saveState === 'saved'
  const fullDisabled =
    !review.candidate.adoptable || saveState === 'saving' || saveState === 'saved'
  const photoStyle = candidatePhotoStyle(review, frameAspect)

  return (
    <section
      aria-labelledby="builder-candidate-review-title"
      style={{
        width: 'min(100%, 760px)',
        marginBlockEnd: 16,
        padding: 16,
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 6,
        background: 'var(--theme-elevation-50)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h3 id="builder-candidate-review-title" style={{ margin: 0, fontSize: 16 }}>
            Ring builder mapping review
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: 13 }}>{reviewState(review)}</p>
        </div>
        <div style={{ textAlign: 'right', fontSize: 12 }}>
          <div>Analysis confidence: {formatConfidence(review.candidate.confidence)}</div>
          <div>
            Status: {review.active.mappingStatus ?? 'unset'} ·{' '}
            {review.active.eligible ? 'builder enabled' : 'builder disabled'}
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))',
          alignItems: 'start',
          gap: 16,
          marginBlockStart: 14,
        }}
      >
        <div>
          <div
            role="img"
            aria-label={`Analyzed source image for ${review.product.name} with candidate and approved contour overlays`}
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: frameAspect,
              overflow: 'hidden',
              border: '1px solid var(--theme-elevation-200)',
              borderRadius: 4,
              background: 'var(--theme-elevation-100)',
            }}
          >
            {review.sourceImage?.url ? (
              <div aria-hidden="true" style={photoStyle} />
            ) : (
              <span
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'grid',
                  placeItems: 'center',
                  padding: 12,
                  textAlign: 'center',
                  fontSize: 12,
                }}
              >
                Selected source image unavailable
              </span>
            )}
            <svg
              aria-hidden="true"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            >
              {activePoints && (
                <polygon
                  points={activePoints}
                  fill="none"
                  stroke="#f2ad35"
                  strokeWidth="1.4"
                  strokeDasharray="3 2"
                  vectorEffect="non-scaling-stroke"
                />
              )}
              {candidatePoints && (
                <polygon
                  points={candidatePoints}
                  fill="rgba(51, 214, 193, 0.12)"
                  stroke="#21c9b3"
                  strokeWidth="1.8"
                  vectorEffect="non-scaling-stroke"
                />
              )}
            </svg>
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              marginBlockStart: 6,
              fontSize: 11,
            }}
          >
            <span>Solid aqua: candidate</span>
            <span>Dashed gold: approved</span>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 10, fontSize: 13 }}>
          <div>
            <strong>Candidate crop</strong>
            <div style={{ marginBlockStart: 3 }}>
              Focus {crop.focalX?.toFixed(2) ?? '—'}, {crop.focalY?.toFixed(2) ?? '—'} · zoom{' '}
              {crop.zoom?.toFixed(2) ?? '—'}× · rotation {crop.rotation?.toFixed(1) ?? '—'}°
            </div>
          </div>
          <div>
            <strong>Physical measurements</strong>
            <div style={{ marginBlockStart: 3 }}>
              {review.dimensions.length ?? '—'} × {review.dimensions.width ?? '—'} ×{' '}
              {review.dimensions.depth ?? '—'} mm (L × W × D)
            </div>
          </div>
          <div>
            <strong>Approved mapping</strong>
            <div style={{ marginBlockStart: 3 }}>
              {review.active.contour
                ? `Contour saved · ${review.active.matchesCandidateContour ? 'shape matches' : 'shape differs'} · ${review.active.matchesCandidateCrop ? 'crop matches' : 'crop differs'} · ${review.active.sourceIsCurrent ? 'current source' : 'different source'}`
                : 'No approved contour'}
            </div>
          </div>
          {review.candidate.genericFallback && (
            <div role="alert" style={{ color: 'var(--theme-error-500)' }}>
              Generic silhouette fallback. Do not approve it as the opal’s real outline; adjust the
              manual mapping instead.
            </div>
          )}
          {missing.length > 0 && (
            <div role="alert" style={{ color: 'var(--theme-warning-600)' }}>
              Missing {missing.join(', ')} measurement{missing.length > 1 ? 's' : ''}. Preview scale
              or depth cannot match the physical opal exactly.
            </div>
          )}
          {review.candidate.analysisError && (
            <div role="alert" style={{ color: 'var(--theme-error-500)' }}>
              Analyzer: {review.candidate.analysisError}
            </div>
          )}
          {!review.sourceImage?.url && (
            <div role="alert">
              Selected source image cannot be previewed. Check its media record.
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
          marginBlockStart: 14,
        }}
      >
        <button
          type="button"
          className="btn btn--style-primary btn--size-medium"
          disabled={placementDisabled}
          aria-busy={saveState === 'saving' && action === 'placement'}
          onClick={() => void adoptCandidate('placement')}
        >
          {saveState === 'saving' && action === 'placement'
            ? 'Applying placement…'
            : saveState === 'saved' && action === 'placement'
              ? 'Placement applied'
              : 'Apply candidate placement'}
        </button>
        <button
          type="button"
          className="btn btn--style-secondary btn--size-medium"
          disabled={fullDisabled}
          aria-busy={saveState === 'saving' && action === 'full'}
          onClick={() => void adoptCandidate('full')}
        >
          {saveState === 'saving' && action === 'full'
            ? 'Adopting mapping…'
            : saveState === 'saved' && action === 'full'
              ? 'Mapping adopted'
              : 'Adopt contour + placement'}
        </button>
        <span
          role={saveState === 'error' ? 'alert' : 'status'}
          aria-live="polite"
          style={{ fontSize: 12, maxWidth: 320 }}
        >
          {saveMessage}
        </span>
      </div>
    </section>
  )
}
