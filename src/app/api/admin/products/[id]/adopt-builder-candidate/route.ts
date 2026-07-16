import { NextRequest, NextResponse } from 'next/server'
import type { Media, Product } from '@/types/payload-types'
import { validateBuilderProduct } from '@/lib/product-validation'
import { getPayload } from '@/lib/payload'
import { resolveMediaUrl } from '@/lib/media-url'
import { BUILDER_PHOTO_ANALYSIS_VERSION } from '@/lib/custom-builder/mapping-lifecycle'
import { BUILDER_MEDIA_REPLACEMENT_CONTEXT } from '@/lib/custom-builder/media-mapping-invalidation'
import {
  parseBuilderStoneContour,
  type BuilderStoneContourV1,
} from '@/lib/custom-builder/stone-contour'

function finiteBetween(value: unknown, minimum: number, maximum: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= minimum && value <= maximum
}

function isCanonicalFallbackConfidence(value: number): boolean {
  return Math.abs(value - 0.7) < 0.0001
}

function numericOrNull(value: unknown, minimum: number, maximum: number): number | null {
  return finiteBetween(value, minimum, maximum) ? value : null
}

function safeMediaUrl(value: string | null | undefined): string | null {
  const resolved = resolveMediaUrl(value)
  if (!resolved) return null

  try {
    const relative = resolved.startsWith('/') && !resolved.startsWith('//')
    const url = new URL(resolved, 'https://payload-admin.invalid')
    if ((url.protocol !== 'https:' && url.protocol !== 'http:') || url.username || url.password) {
      return null
    }
    return relative ? `${url.pathname}${url.search}` : url.toString()
  } catch {
    return null
  }
}

function isSameOriginRequest(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return true
  try {
    return new URL(origin).origin === request.nextUrl.origin
  } catch {
    return false
  }
}

function contoursMatch(
  active: BuilderStoneContourV1 | undefined,
  candidate: BuilderStoneContourV1 | undefined
): boolean {
  return Boolean(
    active &&
    candidate &&
    active.version === candidate.version &&
    active.radii.length === candidate.radii.length &&
    active.radii.every((radius, index) => radius === candidate.radii[index])
  )
}

function cropsMatch(
  active: {
    focalX: number | null
    focalY: number | null
    rotation: number | null
    zoom: number | null
  },
  candidate: {
    focalX: number | null
    focalY: number | null
    rotation: number | null
    zoom: number | null
  }
): boolean {
  return (
    active.focalX !== null &&
    active.focalX === candidate.focalX &&
    active.focalY !== null &&
    active.focalY === candidate.focalY &&
    active.zoom !== null &&
    active.zoom === candidate.zoom &&
    (active.rotation ?? 0) === (candidate.rotation ?? 0)
  )
}

async function requireAdminProduct(
  request: NextRequest,
  params: Promise<{ id: string }>
): Promise<
  { error: NextResponse } | { payload: Awaited<ReturnType<typeof getPayload>>; product: Product }
> {
  const payload = await getPayload()
  const auth = await payload.auth({ headers: request.headers, canSetHeaders: false })
  if (!auth.user || auth.user.role !== 'admin') {
    return {
      error: NextResponse.json({ error: 'Administrator access required.' }, { status: 403 }),
    }
  }

  const id = Number((await params).id)
  if (!Number.isSafeInteger(id) || id < 1) {
    return { error: NextResponse.json({ error: 'Invalid product ID.' }, { status: 400 }) }
  }

  const product = await payload.findByID({
    collection: 'products',
    id,
    depth: 0,
    overrideAccess: true,
  })
  if (product.category !== 'raw-opals') {
    return {
      error: NextResponse.json(
        { error: 'Only raw-opal mappings have builder candidates.' },
        { status: 409 }
      ),
    }
  }

  return { payload, product }
}

async function selectedMedia(
  payload: Awaited<ReturnType<typeof getPayload>>,
  product: Product
): Promise<Media | undefined> {
  const images = product.images ?? []
  const requestedIndex = product.builderPhotoCandidateImageIndex
  const imageIndex =
    typeof requestedIndex === 'number' &&
    Number.isInteger(requestedIndex) &&
    requestedIndex >= 0 &&
    requestedIndex < images.length
      ? requestedIndex
      : typeof product.builderMappedImageIndex === 'number' &&
          Number.isInteger(product.builderMappedImageIndex) &&
          product.builderMappedImageIndex >= 0 &&
          product.builderMappedImageIndex < images.length
        ? product.builderMappedImageIndex
        : 0
  const relationship = (images[imageIndex] ?? images[0])?.image
  if (relationship && typeof relationship === 'object') return relationship
  if (typeof relationship !== 'number') return undefined

  return payload.findByID({
    collection: 'media',
    id: relationship,
    depth: 0,
    overrideAccess: true,
  })
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authorization = await requireAdminProduct(request, params)
  if ('error' in authorization) return authorization.error
  const { payload, product } = authorization

  const media = await selectedMedia(payload, product)
  const candidateContour = parseBuilderStoneContour(product.builderContourCandidate)
  const activeContour = parseBuilderStoneContour(product.builderContour)
  const confidence = numericOrNull(product.builderPhotoAnalysisConfidence, 0, 1)
  const candidateCrop = {
    focalX: numericOrNull(product.builderPhotoCandidateFocalX, 0, 1),
    focalY: numericOrNull(product.builderPhotoCandidateFocalY, 0, 1),
    zoom: numericOrNull(product.builderPhotoCandidateZoom, 1, 12),
    rotation: numericOrNull(product.builderPhotoCandidateRotation, -180, 180),
  }
  const activeCrop = {
    focalX: numericOrNull(product.builderPhotoFocalX, 0, 1),
    focalY: numericOrNull(product.builderPhotoFocalY, 0, 1),
    zoom: numericOrNull(product.builderPhotoZoom, 1, 12),
    rotation: numericOrNull(product.builderPhotoRotation, -180, 180),
  }
  const sourceHash =
    typeof product.builderMappingAnalyzedImageHash === 'string'
      ? product.builderMappingAnalyzedImageHash
      : null
  const candidateImageIndex =
    typeof product.builderPhotoCandidateImageIndex === 'number' &&
    Number.isInteger(product.builderPhotoCandidateImageIndex) &&
    product.builderPhotoCandidateImageIndex >= 0 &&
    product.builderPhotoCandidateImageIndex < (product.images?.length ?? 0)
      ? product.builderPhotoCandidateImageIndex
      : null
  const candidateCurrent =
    product.builderPhotoAnalysisVersion === BUILDER_PHOTO_ANALYSIS_VERSION &&
    Boolean(sourceHash?.match(/^[0-9a-f]{64}$/i)) &&
    candidateImageIndex !== null
  const completeCrop = Object.values(candidateCrop).every((value) => value !== null)
  const genericFallback = confidence !== null && isCanonicalFallbackConfidence(confidence)
  const dimensions = product.dimensions

  return NextResponse.json(
    {
      product: {
        id: product.id,
        name: product.name,
        silhouette: product.builderSilhouette ?? null,
      },
      sourceImage: media
        ? {
            alt: media.alt || product.name,
            height: numericOrNull(media.height, 1, Number.MAX_SAFE_INTEGER),
            url: safeMediaUrl(media.url),
            width: numericOrNull(media.width, 1, Number.MAX_SAFE_INTEGER),
          }
        : null,
      candidate: {
        adoptable: Boolean(
          candidateCurrent &&
          completeCrop &&
          candidateContour &&
          confidence !== null &&
          !genericFallback
        ),
        analysisError: product.builderMappingAnalysisError?.trim() || null,
        analysisVersion: product.builderPhotoAnalysisVersion ?? null,
        confidence,
        contour: candidateContour ?? null,
        crop: candidateCrop,
        imageIndex: candidateImageIndex,
        genericFallback,
        placementAdoptable: Boolean(
          candidateCurrent && completeCrop && confidence !== null && !genericFallback
        ),
        sourceImageHash: sourceHash,
      },
      active: {
        contour: activeContour ?? null,
        crop: activeCrop,
        eligible: product.builderEligible === true,
        mappingStatus: product.builderMappingStatus ?? null,
        matchesCandidateContour: contoursMatch(activeContour, candidateContour),
        matchesCandidateCrop: cropsMatch(activeCrop, candidateCrop),
        sourceIsCurrent:
          Boolean(sourceHash) && product.builderContourSourceImageHash === sourceHash,
      },
      dimensions: {
        depth: numericOrNull(dimensions?.depth, 0.01, Number.MAX_SAFE_INTEGER),
        length: numericOrNull(dimensions?.length, 0.01, Number.MAX_SAFE_INTEGER),
        width: numericOrNull(dimensions?.width, 0.01, Number.MAX_SAFE_INTEGER),
      },
    },
    { headers: { 'Cache-Control': 'private, no-store' } }
  )
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: 'Cross-origin request rejected.' }, { status: 403 })
  }

  const authorization = await requireAdminProduct(request, params)
  if ('error' in authorization) return authorization.error
  const { payload, product } = authorization
  const id = product.id

  const placementOnly = request.nextUrl.searchParams.get('mode') === 'placement'
  const contour = parseBuilderStoneContour(product.builderContourCandidate)
  const analyzedHash = product.builderMappingAnalyzedImageHash
  const candidateImageIndex = product.builderPhotoCandidateImageIndex
  const confidence = product.builderPhotoAnalysisConfidence
  const focalX = product.builderPhotoCandidateFocalX
  const focalY = product.builderPhotoCandidateFocalY
  const zoom = product.builderPhotoCandidateZoom
  const rotation = product.builderPhotoCandidateRotation
  if (
    typeof analyzedHash !== 'string' ||
    !/^[0-9a-f]{64}$/i.test(analyzedHash) ||
    product.builderPhotoAnalysisVersion !== BUILDER_PHOTO_ANALYSIS_VERSION ||
    (product.images?.length ?? 0) === 0 ||
    !finiteBetween(candidateImageIndex, 0, Math.max(0, (product.images?.length ?? 0) - 1)) ||
    !Number.isInteger(candidateImageIndex) ||
    !finiteBetween(confidence, 0, 1) ||
    !finiteBetween(focalX, 0, 1) ||
    !finiteBetween(focalY, 0, 1) ||
    !finiteBetween(zoom, 1, 12) ||
    !finiteBetween(rotation, -180, 180)
  ) {
    return NextResponse.json(
      { error: 'No complete analyzed contour and crop candidate is ready to adopt.' },
      { status: 409 }
    )
  }

  if (isCanonicalFallbackConfidence(confidence)) {
    return NextResponse.json(
      {
        error:
          'This candidate is a generic shape fallback, not an isolated opal trace. Adjust the mapping manually instead.',
      },
      { status: 409 }
    )
  }

  if (placementOnly) {
    await payload.update({
      collection: 'products',
      id,
      overrideAccess: true,
      // Candidate source and crop are adopted atomically by an administrator;
      // do not let the generic source-change hook mark the approved mapping stale.
      context: { [BUILDER_MEDIA_REPLACEMENT_CONTEXT]: true },
      data: {
        builderMappedImageIndex: candidateImageIndex,
        builderMappingAnalysisError: null,
        builderPhotoAnalysisVersion: null,
        builderPhotoFocalX: focalX,
        builderPhotoFocalY: focalY,
        builderPhotoZoom: zoom,
        builderPhotoRotation: rotation,
      },
    })

    return NextResponse.json({
      adopted: true,
      builderEligible: product.builderEligible === true,
      message: 'Candidate placement applied. Existing contour and review status preserved.',
    })
  }

  if (!contour) {
    return NextResponse.json(
      { error: 'No complete analyzed contour and crop candidate is ready to adopt.' },
      { status: 409 }
    )
  }

  const adopted = {
    builderMappedImageIndex: candidateImageIndex,
    builderContour: { version: contour.version, radii: [...contour.radii] },
    builderContourSourceImageHash: analyzedHash,
    builderPhotoFocalX: focalX,
    builderPhotoFocalY: focalY,
    builderPhotoZoom: zoom,
    builderPhotoRotation: rotation,
    // Force the worker to persist the canonical artifact before the public
    // resolver advertises this newly approved contour.
    builderPhotoAnalysisVersion: null,
    builderMappingAnalysisError: null,
    builderMappingStatus: 'manual' as const,
    builderEligible: true,
  }
  const eligibility = validateBuilderProduct({ ...product, ...adopted })
  const builderEligible = eligibility === true

  await payload.update({
    collection: 'products',
    id,
    overrideAccess: true,
    data: { ...adopted, builderEligible },
  })

  return NextResponse.json({
    adopted: true,
    builderEligible,
    message: builderEligible
      ? 'Candidate adopted and enabled in the ring builder.'
      : `Candidate adopted, but remains unavailable: ${eligibility}`,
  })
}
