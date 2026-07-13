import { createHash } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { BUILDER_PHOTO_ANALYSIS_VERSION } from '../mapping-lifecycle'

const mocks = vi.hoisted(() => {
  const pipeline = {
    raw: vi.fn(),
    removeAlpha: vi.fn(),
    resize: vi.fn(),
    rotate: vi.fn(),
    toBuffer: vi.fn(),
    toColourspace: vi.fn(),
  }
  pipeline.raw.mockReturnValue(pipeline)
  pipeline.removeAlpha.mockReturnValue(pipeline)
  pipeline.resize.mockReturnValue(pipeline)
  pipeline.rotate.mockReturnValue(pipeline)
  pipeline.toColourspace.mockReturnValue(pipeline)

  return {
    analyzeOpalRaster: vi.fn(),
    find: vi.fn(),
    findByID: vi.fn(),
    getPayload: vi.fn(),
    pipeline,
    sharp: vi.fn(() => pipeline),
    update: vi.fn(),
  }
})

vi.mock('@/lib/payload', () => ({ getPayload: mocks.getPayload }))
vi.mock('sharp', () => ({ default: mocks.sharp }))
vi.mock('../photo-analysis', () => ({
  analyzeOpalRaster: mocks.analyzeOpalRaster,
  OPAL_PHOTO_ANALYSIS_VERSION: 1,
}))

import { processBuilderMappings } from '../mapping-processor'

const imageBytes = new Uint8Array([1, 3, 3, 7])

describe('builder mapping processor', () => {
  beforeEach(() => {
    mocks.getPayload.mockResolvedValue({
      find: mocks.find,
      findByID: mocks.findByID,
      update: mocks.update,
    })
    mocks.find.mockResolvedValue({ docs: [] })
    mocks.update.mockResolvedValue({})
    mocks.pipeline.toBuffer.mockResolvedValue({
      data: Buffer.from([5, 10, 15, 20, 25, 30]),
      info: { channels: 3, height: 1, width: 2 },
    })
    mocks.analyzeOpalRaster.mockReturnValue({
      confidence: 0.91,
      focalX: 0.42,
      focalY: 0.57,
      rotation: -12,
      zoom: 3.4,
    })
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://example.com')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(imageBytes, {
          headers: { 'content-type': 'image/jpeg' },
          status: 200,
        })
      )
    )
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  test('analyzes the selected gallery image and persists a reviewable crop', async () => {
    mocks.find.mockResolvedValue({
      docs: [
        {
          id: 42,
          builderMappedImageIndex: 1,
          builderMappingMode: 'inferred',
          builderMappingStatus: 'pending',
          dimensions: { length: 9, width: 6 },
          name: 'Lightning Ridge black opal',
          images: [
            { image: { id: 7, url: '/first.jpg' } },
            { image: { id: 8, url: '/selected.jpg' } },
          ],
        },
      ],
    })

    await expect(processBuilderMappings({ limit: 999 })).resolves.toEqual({
      analyzed: 1,
      checked: 1,
      failed: 0,
      manual: 0,
      nonIndividual: 0,
      unchanged: 0,
    })

    expect(mocks.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'products',
        depth: 1,
        limit: 25,
        where: expect.objectContaining({
          and: expect.arrayContaining([
            {
              or: [
                { builderMappingMode: { not_equals: 'manual' } },
                { builderMappingMode: { exists: false } },
              ],
            },
          ]),
        }),
      })
    )
    expect(fetch).toHaveBeenCalledWith(
      'https://example.com/selected.jpg',
      expect.objectContaining({ headers: { accept: 'image/*' } })
    )
    expect(mocks.analyzeOpalRaster).toHaveBeenCalledWith({
      channels: 3,
      data: Buffer.from([5, 10, 15, 20, 25, 30]),
      height: 1,
      stoneAspect: 6 / 9,
      width: 2,
    })
    expect(mocks.update).toHaveBeenCalledWith({
      collection: 'products',
      id: 42,
      data: expect.objectContaining({
        builderMappingAnalysisError: null,
        builderMappingAnalyzedImageHash: expect.stringMatching(/^[0-9a-f]{64}$/),
        builderPhotoAnalysisConfidence: 0.91,
        builderPhotoAnalysisVersion: BUILDER_PHOTO_ANALYSIS_VERSION,
        builderPhotoFocalX: 0.42,
        builderPhotoFocalY: 0.57,
        builderPhotoRotation: -12,
        builderPhotoZoom: 3.4,
      }),
      overrideAccess: true,
    })
  })

  test('does not repeat current analysis and never changes manual mappings', async () => {
    const currentHash = createHash('sha256').update(imageBytes).digest('hex')
    mocks.find.mockResolvedValue({
      docs: [
        {
          id: 42,
          builderMappingAnalyzedImageHash: currentHash,
          builderMappingMode: 'inferred',
          builderMappingStatus: 'pending',
          builderPhotoAnalysisVersion: BUILDER_PHOTO_ANALYSIS_VERSION,
          images: [{ image: { id: 7, url: '/first.jpg' } }],
          name: 'Lightning Ridge black opal',
        },
        {
          id: 43,
          builderMappingMode: 'manual',
          builderMappingStatus: 'stale',
          images: [{ image: { id: 8, url: '/manual.jpg' } }],
        },
      ],
    })

    await expect(processBuilderMappings()).resolves.toEqual({
      analyzed: 0,
      checked: 2,
      failed: 0,
      manual: 1,
      nonIndividual: 0,
      unchanged: 1,
    })
    expect(mocks.analyzeOpalRaster).not.toHaveBeenCalled()
    expect(mocks.update).not.toHaveBeenCalled()
  })

  test('records an analysis error for retry without aborting the batch', async () => {
    mocks.find.mockResolvedValue({
      docs: [
        {
          id: 42,
          builderMappingMode: 'inferred',
          builderMappingStatus: 'pending',
          images: [],
          name: 'Lightning Ridge black opal',
        },
      ],
    })

    await expect(processBuilderMappings()).resolves.toEqual({
      analyzed: 0,
      checked: 1,
      failed: 1,
      manual: 0,
      nonIndividual: 0,
      unchanged: 0,
    })
    expect(mocks.update).toHaveBeenCalledWith({
      collection: 'products',
      id: 42,
      data: { builderMappingAnalysisError: 'Mapped product image is unavailable' },
      overrideAccess: true,
    })
  })

  test('records low-confidence analysis without applying an unsafe crop', async () => {
    mocks.find.mockResolvedValue({
      docs: [
        {
          id: 42,
          builderMappingMode: 'inferred',
          builderMappingStatus: 'pending',
          images: [{ image: { id: 7, url: '/unclear.jpg' } }],
          name: 'Lightning Ridge black opal',
        },
      ],
    })
    mocks.analyzeOpalRaster.mockReturnValue({
      confidence: 0.4,
      focalX: 0.42,
      focalY: 0.57,
      rotation: -12,
      zoom: 3.4,
    })

    await expect(processBuilderMappings()).resolves.toMatchObject({ analyzed: 0, failed: 1 })
    expect(mocks.update).toHaveBeenCalledWith({
      collection: 'products',
      id: 42,
      data: {
        builderMappingAnalyzedImageHash: expect.stringMatching(/^[0-9a-f]{64}$/),
        builderMappingAnalysisError:
          'Opal photo analysis confidence is too low for automatic crop mapping',
        builderPhotoAnalysisConfidence: 0.4,
        builderPhotoAnalysisVersion: BUILDER_PHOTO_ANALYSIS_VERSION,
      },
      overrideAccess: true,
    })
    const update = mocks.update.mock.calls[0]?.[0]
    expect(update?.data).not.toHaveProperty('builderPhotoFocalX')
    expect(update?.data).not.toHaveProperty('builderPhotoRotation')
  })

  test('records an unisolated photo without applying crop coordinates', async () => {
    mocks.find.mockResolvedValue({
      docs: [
        {
          id: 42,
          builderMappingMode: 'inferred',
          builderMappingStatus: 'pending',
          images: [{ image: { id: 7, url: '/unclear.jpg' } }],
          name: 'Lightning Ridge black opal',
        },
      ],
    })
    mocks.analyzeOpalRaster.mockReturnValue(undefined)

    await expect(processBuilderMappings()).resolves.toMatchObject({ analyzed: 0, failed: 1 })
    expect(mocks.update).toHaveBeenCalledWith({
      collection: 'products',
      id: 42,
      data: {
        builderMappingAnalyzedImageHash: expect.stringMatching(/^[0-9a-f]{64}$/),
        builderMappingAnalysisError: 'Opal face could not be isolated from the source image',
        builderPhotoAnalysisConfidence: null,
        builderPhotoAnalysisVersion: BUILDER_PHOTO_ANALYSIS_VERSION,
      },
      overrideAccess: true,
    })
  })

  test('records but does not crop parcel photography', async () => {
    mocks.find.mockResolvedValue({
      docs: [
        {
          id: 42,
          builderMappingMode: 'inferred',
          builderMappingStatus: 'pending',
          images: [{ image: { id: 7, url: '/parcel.jpg' } }],
          name: 'Coober Pedy opal parcel',
        },
      ],
    })

    await expect(processBuilderMappings()).resolves.toMatchObject({
      analyzed: 0,
      failed: 0,
      nonIndividual: 1,
    })
    expect(mocks.sharp).not.toHaveBeenCalled()
    expect(mocks.update).toHaveBeenCalledWith({
      collection: 'products',
      id: 42,
      data: {
        builderMappingAnalyzedImageHash: expect.stringMatching(/^[0-9a-f]{64}$/),
        builderMappingAnalysisError:
          'Automatic crop mapping skipped for a multi-stone or specimen listing',
        builderPhotoAnalysisConfidence: null,
        builderPhotoAnalysisVersion: BUILDER_PHOTO_ANALYSIS_VERSION,
      },
      overrideAccess: true,
    })
  })
})
