import { NextRequest, NextResponse } from 'next/server'
import { validateBuilderProduct } from '@/lib/product-validation'
import { getPayload } from '@/lib/payload'
import { BUILDER_PHOTO_ANALYSIS_VERSION } from '@/lib/custom-builder/mapping-lifecycle'
import { parseBuilderStoneContour } from '@/lib/custom-builder/stone-contour'

function finiteBetween(value: unknown, minimum: number, maximum: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= minimum && value <= maximum
}

function isCanonicalFallbackConfidence(value: number): boolean {
  return Math.abs(value - 0.7) < 0.0001
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const origin = request.headers.get('origin')
  if (origin && new URL(origin).origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: 'Cross-origin request rejected.' }, { status: 403 })
  }

  const payload = await getPayload()
  const auth = await payload.auth({ headers: request.headers, canSetHeaders: false })
  if (!auth.user || auth.user.role !== 'admin') {
    return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 })
  }

  const id = Number((await params).id)
  if (!Number.isSafeInteger(id) || id < 1) {
    return NextResponse.json({ error: 'Invalid product ID.' }, { status: 400 })
  }

  const product = await payload.findByID({
    collection: 'products',
    id,
    depth: 0,
    overrideAccess: true,
  })
  if (product.category !== 'raw-opals') {
    return NextResponse.json({ error: 'Only raw-opal mappings can adopt a candidate.' }, { status: 409 })
  }

  const placementOnly = request.nextUrl.searchParams.get('mode') === 'placement'
  const contour = parseBuilderStoneContour(product.builderContourCandidate)
  const analyzedHash = product.builderMappingAnalyzedImageHash
  const confidence = product.builderPhotoAnalysisConfidence
  const focalX = product.builderPhotoCandidateFocalX
  const focalY = product.builderPhotoCandidateFocalY
  const zoom = product.builderPhotoCandidateZoom
  const rotation = product.builderPhotoCandidateRotation
  if (
    typeof analyzedHash !== 'string' ||
    !/^[0-9a-f]{64}$/i.test(analyzedHash) ||
    product.builderPhotoAnalysisVersion !== BUILDER_PHOTO_ANALYSIS_VERSION ||
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
      data: {
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
    builderContour: { version: contour.version, radii: [...contour.radii] },
    builderContourSourceImageHash: analyzedHash,
    builderPhotoFocalX: focalX,
    builderPhotoFocalY: focalY,
    builderPhotoZoom: zoom,
    builderPhotoRotation: rotation,
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
