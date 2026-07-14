import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, test, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  findByID: vi.fn(),
  getPayload: vi.fn(),
  update: vi.fn(),
}))

vi.mock('@/lib/payload', () => ({ getPayload: mocks.getPayload }))

import { POST } from '../route'

const contour = { version: 1 as const, radii: Array.from({ length: 96 }, () => 1) }
const product = {
  id: 42,
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
  builderContourCandidate: contour,
  builderMappingAnalyzedImageHash: 'a'.repeat(64),
  builderPhotoAnalysisVersion: 3,
  builderPhotoAnalysisConfidence: 0.81,
  builderPhotoCandidateFocalX: 0.42,
  builderPhotoCandidateFocalY: 0.57,
  builderPhotoCandidateZoom: 3.4,
  builderPhotoCandidateRotation: -12,
}

function request() {
  return new NextRequest('https://example.com/api/admin/products/42/adopt-builder-candidate', {
    method: 'POST',
  })
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
    mocks.findByID.mockResolvedValue(product)
    mocks.update.mockResolvedValue({})
  })

  test('requires an authenticated administrator', async () => {
    mocks.auth.mockResolvedValue({ user: null })

    const response = await POST(request(), { params: Promise.resolve({ id: '42' }) })

    expect(response.status).toBe(403)
    expect(mocks.findByID).not.toHaveBeenCalled()
  })

  test('adopts the exact candidate contour and crop and enables a complete opal', async () => {
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
        builderContour: contour,
        builderContourSourceImageHash: 'a'.repeat(64),
        builderEligible: true,
        builderMappingStatus: 'manual',
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
      data: {
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
    mocks.findByID.mockResolvedValue({ ...product, builderPhotoAnalysisVersion: 2 })

    const response = await POST(request(), { params: Promise.resolve({ id: '42' }) })

    expect(response.status).toBe(409)
    expect(mocks.update).not.toHaveBeenCalled()
  })
})
