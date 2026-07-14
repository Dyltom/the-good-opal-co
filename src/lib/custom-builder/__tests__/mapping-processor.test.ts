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
  OPAL_PHOTO_ANALYSIS_VERSION: 2,
}))

import { processBuilderMappings } from '../mapping-processor'

const imageBytes = new Uint8Array([1, 3, 3, 7])
const contour = { version: 1 as const, radii: Array.from({ length: 96 }, () => 1) }

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
      contour,
      focalX: 0.42,
      focalY: 0.57,
      rotation: -12,
      zoom: 3.4,
    })
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://example.com')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(async () =>
        Promise.resolve(
          new Response(imageBytes, {
            headers: { 'content-type': 'image/jpeg' },
            status: 200,
          })
        )
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
      coverage: {
        activeContours: 0,
        availableIndividuals: 1,
        candidates: 0,
        currentAnalyses: 0,
        eligible: 0,
        failedCurrent: 0,
        individualFailures: [],
        reviewCandidates: [],
        skippedCurrent: 0,
        total: 1,
      },
      failed: 0,
      manual: 0,
      nonIndividual: 0,
      selectedState: {
        currentVersion: 0,
        withCandidate: 0,
        withError: 0,
        withHash: 0,
      },
      unchanged: 0,
    })

    expect(mocks.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'products',
        depth: 1,
        limit: 25,
        where: expect.objectContaining({
          and: expect.arrayContaining([
            { category: { equals: 'raw-opals' } },
            { status: { equals: 'published' } },
            { stock: { greater_than: 0 } },
            expect.objectContaining({
              or: expect.arrayContaining([
                {
                  and: [
                    { builderMappingAnalysisError: { exists: false } },
                    {
                      or: expect.arrayContaining([
                        { builderContourCandidate: { exists: false } },
                      ]),
                    },
                  ],
                },
                {
                  and: [
                    { builderMappingAnalysisError: { exists: true } },
                    {
                      builderPhotoAnalysisVersion: {
                        not_equals: BUILDER_PHOTO_ANALYSIS_VERSION,
                      },
                    },
                  ],
                },
              ]),
            }),
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
        builderContour: contour,
        builderContourCandidate: contour,
        builderContourSourceImageHash: expect.stringMatching(/^[0-9a-f]{64}$/),
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

  test('fetches application-relative media from the active Vercel deployment', async () => {
    vi.stubEnv('VERCEL_URL', 'the-good-opal-co-git-main.example.vercel.app')
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'the-good-opal-co.example.vercel.app')
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://goodopalco.com')
    mocks.find.mockResolvedValue({
      docs: [
        {
          id: 42,
          builderMappingMode: 'inferred',
          builderMappingStatus: 'pending',
          images: [{ image: { id: 7, url: '/api/media/file/opal.jpg' } }],
          name: 'Lightning Ridge black opal',
        },
      ],
    })

    await expect(processBuilderMappings()).resolves.toMatchObject({ analyzed: 1, failed: 0 })

    expect(fetch).toHaveBeenCalledWith(
      'https://the-good-opal-co-git-main.example.vercel.app/api/media/file/opal.jpg',
      expect.objectContaining({ headers: { accept: 'image/*' } })
    )
  })

  test('does not rewrite absolute owned-storage media through a Vercel origin', async () => {
    vi.stubEnv('VERCEL_URL', 'the-good-opal-co-git-main.example.vercel.app')
    mocks.find.mockResolvedValue({
      docs: [
        {
          id: 42,
          builderMappingMode: 'inferred',
          builderMappingStatus: 'pending',
          images: [
            {
              image: {
                id: 7,
                url: 'https://owned.public.blob.vercel-storage.com/opal.jpg',
              },
            },
          ],
          name: 'Lightning Ridge black opal',
        },
      ],
    })

    await expect(processBuilderMappings()).resolves.toMatchObject({ analyzed: 1, failed: 0 })

    expect(fetch).toHaveBeenCalledWith(
      'https://owned.public.blob.vercel-storage.com/opal.jpg',
      expect.objectContaining({ headers: { accept: 'image/*' } })
    )
  })

  test('does not repeat current candidates and analyzes manual mappings without changing active values', async () => {
    const currentHash = createHash('sha256').update(imageBytes).digest('hex')
    mocks.find.mockResolvedValue({
      docs: [
        {
          id: 42,
          builderMappingAnalyzedImageHash: currentHash,
          builderContourCandidate: contour,
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
          name: 'Manual Lightning Ridge black opal',
        },
      ],
    })

    await expect(processBuilderMappings()).resolves.toEqual({
      analyzed: 1,
      checked: 2,
      coverage: {
        activeContours: 0,
        availableIndividuals: 2,
        candidates: 1,
        currentAnalyses: 1,
        eligible: 0,
        failedCurrent: 0,
        individualFailures: [],
        reviewCandidates: [],
        skippedCurrent: 0,
        total: 2,
      },
      failed: 0,
      manual: 1,
      nonIndividual: 0,
      selectedState: {
        currentVersion: 1,
        withCandidate: 1,
        withError: 0,
        withHash: 1,
      },
      unchanged: 1,
    })
    expect(mocks.analyzeOpalRaster).toHaveBeenCalledTimes(1)
    expect(mocks.update).toHaveBeenCalledTimes(1)
    const update = mocks.update.mock.calls[0]?.[0]
    expect(update?.id).toBe(43)
    expect(update?.data).toMatchObject({
      builderContourCandidate: contour,
      builderMappingAnalysisError: null,
    })
    expect(update?.data).not.toHaveProperty('builderContour')
    expect(update?.data).not.toHaveProperty('builderPhotoFocalX')
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
      coverage: {
        activeContours: 0,
        availableIndividuals: 1,
        candidates: 0,
        currentAnalyses: 0,
        eligible: 0,
        failedCurrent: 0,
        individualFailures: [],
        reviewCandidates: [],
        skippedCurrent: 0,
        total: 1,
      },
      failed: 1,
      manual: 0,
      nonIndividual: 0,
      selectedState: {
        currentVersion: 0,
        withCandidate: 0,
        withError: 0,
        withHash: 0,
      },
      unchanged: 0,
    })
    expect(mocks.update).toHaveBeenCalledWith({
      collection: 'products',
      id: 42,
      data: {
        builderContourCandidate: null,
        builderMappingAnalysisError: 'Mapped product image is unavailable',
        builderPhotoAnalysisConfidence: null,
        builderPhotoAnalysisVersion: BUILDER_PHOTO_ANALYSIS_VERSION,
        builderPhotoCandidateFocalX: null,
        builderPhotoCandidateFocalY: null,
        builderPhotoCandidateRotation: null,
        builderPhotoCandidateZoom: null,
      },
      overrideAccess: true,
    })
  })

  test('generates a candidate for a reviewed mapping without overwriting its approved contour or crop', async () => {
    const approvedContour = {
      version: 1 as const,
      radii: Array.from({ length: 96 }, (_, index) => (index === 0 ? 1.1 : 1)),
    }
    mocks.find.mockResolvedValue({
      docs: [
        {
          id: 44,
          builderContour: approvedContour,
          builderMappingMode: 'inferred',
          builderMappingStatus: 'reviewed',
          builderPhotoFocalX: 0.33,
          builderPhotoFocalY: 0.58,
          builderPhotoRotation: -7,
          builderPhotoZoom: 4.2,
          builderSilhouette: 'pear',
          images: [{ image: { id: 9, url: '/reviewed.jpg' } }],
          name: 'Reviewed Lightning Ridge black opal',
        },
      ],
    })

    await expect(processBuilderMappings()).resolves.toMatchObject({ analyzed: 1, failed: 0 })
    expect(mocks.analyzeOpalRaster).toHaveBeenCalledWith(
      expect.objectContaining({
        reviewedCropHint: { focalX: 0.33, focalY: 0.58, rotation: -7, zoom: 4.2 },
        shapeHint: 'pear',
      })
    )
    const update = mocks.update.mock.calls[0]?.[0]
    expect(update?.data).toMatchObject({ builderContourCandidate: contour })
    expect(update?.data).not.toHaveProperty('builderContour')
    expect(update?.data).not.toHaveProperty('builderContourSourceImageHash')
    expect(update?.data).not.toHaveProperty('builderPhotoFocalX')
  })

  test('protects an active contour when legacy status is manual but mode is inconsistent', async () => {
    mocks.find.mockResolvedValue({
      docs: [
        {
          id: 45,
          builderContour: contour,
          builderMappingMode: 'inferred',
          builderMappingStatus: 'manual',
          images: [{ image: { id: 10, url: '/manual-status.jpg' } }],
          name: 'Manual status Lightning Ridge opal',
        },
      ],
    })

    await expect(processBuilderMappings()).resolves.toMatchObject({ analyzed: 1, failed: 0 })
    const update = mocks.update.mock.calls[0]?.[0]
    expect(update?.data).toMatchObject({ builderContourCandidate: contour })
    expect(update?.data).not.toHaveProperty('builderContour')
    expect(update?.data).not.toHaveProperty('builderPhotoFocalX')
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
      contour,
      focalX: 0.42,
      focalY: 0.57,
      rotation: -12,
      zoom: 3.4,
    })

    await expect(processBuilderMappings()).resolves.toMatchObject({ analyzed: 1, failed: 0 })
    expect(mocks.update).toHaveBeenCalledWith({
      collection: 'products',
      id: 42,
      data: {
        builderMappingAnalyzedImageHash: expect.stringMatching(/^[0-9a-f]{64}$/),
        builderContourCandidate: contour,
        builderMappingAnalysisError: 'Opal contour confidence is too low for automatic activation',
        builderPhotoAnalysisConfidence: 0.4,
        builderPhotoAnalysisVersion: BUILDER_PHOTO_ANALYSIS_VERSION,
        builderPhotoCandidateFocalX: 0.42,
        builderPhotoCandidateFocalY: 0.57,
        builderPhotoCandidateRotation: -12,
        builderPhotoCandidateZoom: 3.4,
      },
      overrideAccess: true,
    })
    const update = mocks.update.mock.calls[0]?.[0]
    expect(update?.data).not.toHaveProperty('builderPhotoFocalX')
    expect(update?.data).not.toHaveProperty('builderPhotoRotation')
    expect(update?.data).not.toHaveProperty('builderContour')
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
        builderContourCandidate: null,
        builderMappingAnalyzedImageHash: expect.stringMatching(/^[0-9a-f]{64}$/),
        builderMappingAnalysisError: 'Opal face could not be isolated from the source image',
        builderPhotoAnalysisConfidence: null,
        builderPhotoAnalysisVersion: BUILDER_PHOTO_ANALYSIS_VERSION,
        builderPhotoCandidateFocalX: null,
        builderPhotoCandidateFocalY: null,
        builderPhotoCandidateRotation: null,
        builderPhotoCandidateZoom: null,
      },
      overrideAccess: true,
    })
  })

  test('does not overwrite a product changed while its image was being analyzed', async () => {
    mocks.find.mockResolvedValue({
      docs: [
        {
          id: 46,
          updatedAt: '2026-07-14T01:00:00.000Z',
          builderMappingMode: 'inferred',
          builderMappingStatus: 'pending',
          images: [{ image: { id: 11, url: '/changed.jpg' } }],
          name: 'Lightning Ridge black opal',
        },
      ],
    })
    mocks.update.mockResolvedValue({ docs: [] })

    await expect(processBuilderMappings()).resolves.toEqual({
      analyzed: 0,
      checked: 1,
      coverage: {
        activeContours: 0,
        availableIndividuals: 1,
        candidates: 0,
        currentAnalyses: 0,
        eligible: 0,
        failedCurrent: 0,
        individualFailures: [],
        reviewCandidates: [],
        skippedCurrent: 0,
        total: 1,
      },
      failed: 0,
      manual: 0,
      nonIndividual: 0,
      selectedState: {
        currentVersion: 0,
        withCandidate: 0,
        withError: 0,
        withHash: 0,
      },
      unchanged: 1,
    })
    expect(mocks.update).toHaveBeenCalledWith({
      collection: 'products',
      where: {
        and: [
          { id: { equals: 46 } },
          { updatedAt: { equals: '2026-07-14T01:00:00.000Z' } },
        ],
      },
      data: expect.objectContaining({ builderContourCandidate: contour }),
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
        builderContourCandidate: null,
        builderMappingAnalysisError:
          'Automatic crop mapping skipped for a non-individual or non-opal listing',
        builderPhotoAnalysisConfidence: null,
        builderPhotoAnalysisVersion: BUILDER_PHOTO_ANALYSIS_VERSION,
        builderPhotoCandidateFocalX: null,
        builderPhotoCandidateFocalY: null,
        builderPhotoCandidateRotation: null,
        builderPhotoCandidateZoom: null,
      },
      overrideAccess: true,
    })
  })

  test('does not analyze a legacy non-opal service filed in the raw-opal category', async () => {
    mocks.find.mockResolvedValue({
      docs: [
        {
          id: 42,
          builderMappingMode: 'inferred',
          builderMappingStatus: 'pending',
          images: [{ image: { id: 7, url: '/deposit.jpg' } }],
          name: 'Custom Jewellery Deposit',
        },
      ],
    })

    await expect(processBuilderMappings()).resolves.toMatchObject({
      analyzed: 0,
      failed: 0,
      nonIndividual: 1,
    })
    expect(mocks.sharp).not.toHaveBeenCalled()
  })
})
