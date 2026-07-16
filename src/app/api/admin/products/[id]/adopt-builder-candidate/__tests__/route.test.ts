import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { BUILDER_PHOTO_ANALYSIS_VERSION } from '@/lib/custom-builder/mapping-lifecycle'

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  findByID: vi.fn(),
  getPayload: vi.fn(),
  update: vi.fn(),
}))

vi.mock('@/lib/payload', () => ({ getPayload: mocks.getPayload }))

import { GET, POST } from '../route'

const contour = { version: 1 as const, radii: Array.from({ length: 96 }, () => 1) }
const product = {
  id: 42,
  name: 'Lightning Ridge black opal',
  category: 'raw-opals',
  images: [{ image: 7 }],
  stoneType: 'black-opal',
  dimensions: { depth: 2.5, length: 9, width: 6 },
  builderBodyColour: '#102434',
  builderFlashColourPrimary: '#1bd8ed',
  builderFlashColourSecondary: '#38ed91',
  builderFlashColourAccent: '#ffcb45',
  builderTransmission: 0.04,
  builderSilhouette: 'oval',
  builderRecommendedStyle: 'gemini',
  builderMappedImageIndex: 0,
  builderPhotoCandidateImageIndex: 0,
  builderContourCandidate: contour,
  builderMappingAnalyzedImageHash: 'a'.repeat(64),
  builderPhotoAnalysisVersion: BUILDER_PHOTO_ANALYSIS_VERSION,
  builderPhotoAnalysisConfidence: 0.81,
  builderPhotoCandidateFocalX: 0.42,
  builderPhotoCandidateFocalY: 0.57,
  builderPhotoCandidateZoom: 3.4,
  builderPhotoCandidateRotation: -12,
}

const media = {
  id: 7,
  alt: 'Black opal on a neutral background',
  url: '/api/media/file/black-opal.jpg',
  width: 1200,
  height: 1600,
}

function request() {
  return new NextRequest('https://example.com/api/admin/products/42/adopt-builder-candidate', {
    method: 'POST',
  })
}

function getRequest() {
  return new NextRequest('https://example.com/api/admin/products/42/adopt-builder-candidate')
}

describe('adopt builder candidate admin route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getPayload.mockResolvedValue({
      auth: mocks.auth,
      findByID: mocks.findByID,
      update: mocks.update,
    })
    mocks.auth.mockResolvedValue({ user: { id: 1, role: 'admin' } })
    mocks.findByID.mockImplementation(({ collection }: { collection: string }) =>
      Promise.resolve(collection === 'media' ? media : product)
    )
    mocks.update.mockResolvedValue({})
  })

  test('requires an authenticated administrator', async () => {
    mocks.auth.mockResolvedValue({ user: null })

    const response = await POST(request(), { params: Promise.resolve({ id: '42' }) })

    expect(response.status).toBe(403)
    expect(mocks.findByID).not.toHaveBeenCalled()
  })

  test('rejects a malformed request origin before authentication', async () => {
    const malformedOrigin = new NextRequest(
      'https://example.com/api/admin/products/42/adopt-builder-candidate',
      { headers: { origin: 'not a valid origin' }, method: 'POST' }
    )

    const response = await POST(malformedOrigin, { params: Promise.resolve({ id: '42' }) })

    expect(response.status).toBe(403)
    expect(mocks.auth).not.toHaveBeenCalled()
  })

  test('returns the selected source, candidate, crop, active state, and dimensions for review', async () => {
    const activeContour = { version: 1 as const, radii: Array.from({ length: 96 }, () => 0.95) }
    mocks.findByID.mockImplementation(({ collection }: { collection: string }) =>
      Promise.resolve(
        collection === 'media'
          ? { ...media, id: 8, url: 'https://cdn.example.com/selected-opal.jpg' }
          : {
              ...product,
              images: [{ image: 7 }, { image: 8 }],
              builderMappedImageIndex: 1,
              builderPhotoCandidateImageIndex: 1,
              builderContour: activeContour,
              builderContourSourceImageHash: 'b'.repeat(64),
              builderPhotoFocalX: 0.5,
              builderPhotoFocalY: 0.5,
              builderPhotoZoom: 2.8,
              builderPhotoRotation: 0,
              builderMappingStatus: 'reviewed',
              builderEligible: true,
            }
      )
    )

    const response = await GET(getRequest(), { params: Promise.resolve({ id: '42' }) })
    const result = (await response.json()) as {
      active: Record<string, unknown>
      candidate: Record<string, unknown>
      dimensions: Record<string, unknown>
      product: Record<string, unknown>
      sourceImage: Record<string, unknown>
    }

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('private, no-store')
    expect(result.product).toEqual({
      id: 42,
      name: 'Lightning Ridge black opal',
      silhouette: 'oval',
    })
    expect(result.sourceImage).toEqual({
      alt: 'Black opal on a neutral background',
      height: 1600,
      url: 'https://cdn.example.com/selected-opal.jpg',
      width: 1200,
    })
    expect(result.candidate).toMatchObject({
      adoptable: true,
      analysisVersion: BUILDER_PHOTO_ANALYSIS_VERSION,
      confidence: 0.81,
      contour,
      crop: { focalX: 0.42, focalY: 0.57, rotation: -12, zoom: 3.4 },
      imageIndex: 1,
      genericFallback: false,
      placementAdoptable: true,
    })
    expect(result.active).toMatchObject({
      contour: activeContour,
      eligible: true,
      mappingStatus: 'reviewed',
      matchesCandidateContour: false,
      matchesCandidateCrop: false,
      sourceIsCurrent: false,
    })
    expect(result.dimensions).toEqual({ depth: 2.5, length: 9, width: 6 })
    expect(mocks.findByID).toHaveBeenNthCalledWith(2, {
      collection: 'media',
      id: 8,
      depth: 0,
      overrideAccess: true,
    })
  })

  test('marks a canonical fallback and missing measurements as unsafe to adopt', async () => {
    mocks.findByID.mockImplementation(({ collection }: { collection: string }) =>
      Promise.resolve(
        collection === 'media'
          ? { ...media, url: 'javascript:alert(1)' }
          : {
              ...product,
              dimensions: { length: 9 },
              builderPhotoAnalysisConfidence: 0.7,
            }
      )
    )

    const response = await GET(getRequest(), { params: Promise.resolve({ id: '42' }) })
    const result = (await response.json()) as {
      candidate: { adoptable: boolean; genericFallback: boolean; placementAdoptable: boolean }
      dimensions: Record<string, unknown>
      sourceImage: { url: string | null }
    }

    expect(result.candidate).toMatchObject({
      adoptable: false,
      genericFallback: true,
      placementAdoptable: false,
    })
    expect(result.dimensions).toEqual({ depth: null, length: 9, width: null })
    expect(result.sourceImage.url).toBeNull()
  })

  test('adopts the exact candidate contour and crop and enables a complete opal', async () => {
    mocks.findByID.mockResolvedValue({
      ...product,
      images: [{ image: 7 }, { image: 8 }],
      builderPhotoCandidateImageIndex: 1,
    })
    const response = await POST(request(), { params: Promise.resolve({ id: '42' }) })

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      adopted: true,
      builderEligible: true,
      message: 'Candidate adopted and enabled in the ring builder.',
    })
    expect(mocks.update).toHaveBeenCalledWith({
      collection: 'products',
      id: 42,
      overrideAccess: true,
      data: {
        builderMappedImageIndex: 1,
        builderContour: contour,
        builderContourSourceImageHash: 'a'.repeat(64),
        builderEligible: true,
        builderMappingStatus: 'manual',
        builderMappingAnalysisError: null,
        builderPhotoAnalysisVersion: null,
        builderPhotoFocalX: 0.42,
        builderPhotoFocalY: 0.57,
        builderPhotoRotation: -12,
        builderPhotoZoom: 3.4,
      },
    })
  })

  test('enables an audited visual concept without fabricating physical dimensions', async () => {
    mocks.findByID.mockResolvedValue({ ...product, dimensions: null })

    const response = await POST(request(), { params: Promise.resolve({ id: '42' }) })
    const result = (await response.json()) as { builderEligible: boolean; message: string }

    expect(response.status).toBe(200)
    expect(result.builderEligible).toBe(true)
    expect(result.message).toBe('Candidate adopted and enabled in the ring builder.')
    expect(mocks.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ builderEligible: true }) })
    )
  })

  test('applies low-confidence real placement without approving its contour or review state', async () => {
    mocks.findByID.mockResolvedValue({
      ...product,
      builderContourCandidate: null,
      builderEligible: false,
      builderMappingStatus: 'pending',
      builderPhotoAnalysisConfidence: 0.6927,
    })
    const placementRequest = new NextRequest(
      'https://example.com/api/admin/products/42/adopt-builder-candidate?mode=placement',
      { method: 'POST' }
    )

    const response = await POST(placementRequest, { params: Promise.resolve({ id: '42' }) })

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      adopted: true,
      builderEligible: false,
      message: 'Candidate placement applied. Existing contour and review status preserved.',
    })
    expect(mocks.update).toHaveBeenCalledWith({
      collection: 'products',
      id: 42,
      overrideAccess: true,
      context: { builderMediaReplacementInvalidation: true },
      data: {
        builderMappedImageIndex: 0,
        builderMappingAnalysisError: null,
        builderPhotoAnalysisVersion: null,
        builderPhotoFocalX: 0.42,
        builderPhotoFocalY: 0.57,
        builderPhotoRotation: -12,
        builderPhotoZoom: 3.4,
      },
    })
  })

  test.each(['', '?mode=placement'])(
    'rejects the analyser canonical fallback instead of applying it (%s)',
    async (query) => {
      mocks.findByID.mockResolvedValue({ ...product, builderPhotoAnalysisConfidence: 0.7 })
      const fallbackRequest = new NextRequest(
        `https://example.com/api/admin/products/42/adopt-builder-candidate${query}`,
        { method: 'POST' }
      )

      const response = await POST(fallbackRequest, { params: Promise.resolve({ id: '42' }) })

      expect(response.status).toBe(409)
      await expect(response.json()).resolves.toEqual({
        error:
          'This candidate is a generic shape fallback, not an isolated opal trace. Adjust the mapping manually instead.',
      })
      expect(mocks.update).not.toHaveBeenCalled()
    }
  )

  test('rejects a product without a complete candidate crop', async () => {
    mocks.findByID.mockResolvedValue({ ...product, builderPhotoCandidateZoom: null })

    const response = await POST(request(), { params: Promise.resolve({ id: '42' }) })

    expect(response.status).toBe(409)
    expect(mocks.update).not.toHaveBeenCalled()
  })

  test('rejects a candidate produced by an older analysis version', async () => {
    mocks.findByID.mockResolvedValue({
      ...product,
      builderPhotoAnalysisVersion: BUILDER_PHOTO_ANALYSIS_VERSION - 1,
    })

    const response = await POST(request(), { params: Promise.resolve({ id: '42' }) })

    expect(response.status).toBe(409)
    expect(mocks.update).not.toHaveBeenCalled()
  })
})
