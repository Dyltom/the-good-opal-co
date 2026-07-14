import { beforeEach, describe, expect, test, vi } from 'vitest'
import type { RingDesign } from '@/types/payload-types'

const { findMock } = vi.hoisted(() => ({
  findMock: vi.fn(),
}))

vi.mock('@/lib/payload', () => ({
  getPayload: vi.fn(async () => ({ find: findMock })),
}))

import {
  loadPublishedRingDesignRenderManifests,
  parseRingDesignRenderManifest,
  ringDesignRenderManifestSchema,
} from '../ring-design-manifest'

function approvedRecord(overrides: Partial<RingDesign> = {}): RingDesign {
  return {
    id: 7,
    name: 'Gemini',
    slug: 'gemini',
    style: 'gemini',
    status: 'published',
    sourceReferences: ['top', 'three-quarter', 'profile', 'underside'].map((view) => ({
      assetPath: `/ring-references/gemini-${view}.jpg`,
      sourceType: 'calibrated-capture',
      view,
    })),
    measurements: {
      headLengthMm: 10.75,
      headWidthMm: 8.75,
      measurementMethod: 'calipers',
      shankDepthMm: 1.1,
      shankWidthMm: 1.75,
      stoneLengthMm: 10,
      stoneWidthMm: 8,
    },
    modelDefinition: {
      assetUrl: 'https://assets.goodopalco.com/rings/gemini-v2.glb',
      source: 'artist-authored',
      version: 'gemini-v2',
    },
    makerApproved: true,
    approvedAt: '2026-07-15T01:30:00.000Z',
    approvalNotes: 'Approved against the physical Gemini master.',
    createdAt: '2026-07-14T01:30:00.000Z',
    updatedAt: '2026-07-15T01:30:00.000Z',
    ...overrides,
  }
}

describe('ring design render manifest boundary', () => {
  beforeEach(() => {
    findMock.mockReset()
  })

  test('exposes the model identity and maker approval provenance', () => {
    expect(parseRingDesignRenderManifest(approvedRecord())).toEqual({
      id: 7,
      name: 'Gemini',
      slug: 'gemini',
      style: 'gemini',
      model: {
        assetUrl: 'https://assets.goodopalco.com/rings/gemini-v2.glb',
        source: 'artist-authored',
        version: 'gemini-v2',
      },
      approval: {
        approvedAt: '2026-07-15T01:30:00.000Z',
        notes: 'Approved against the physical Gemini master.',
      },
    })
  })

  test('keeps asset URLs optional for an approved procedural model', () => {
    const manifest = parseRingDesignRenderManifest(
      approvedRecord({
        modelDefinition: { source: 'procedural', version: 'gemini-procedural-v2' },
      })
    )

    expect(manifest?.model).toEqual({
      assetUrl: undefined,
      source: 'procedural',
      version: 'gemini-procedural-v2',
    })
  })

  test.each([
    ['draft record', { status: 'draft' }],
    ['archived record', { status: 'archived' }],
    ['unapproved record', { makerApproved: false }],
    ['missing approval date', { approvedAt: null }],
    ['invalid approval date', { approvedAt: 'yesterday' }],
    ['missing approval notes', { approvalNotes: null }],
    ['short approval notes', { approvalNotes: 'Approved' }],
    ['missing model', { modelDefinition: null }],
    ['missing measurements', { measurements: null }],
    [
      'incomplete calibrated evidence',
      {
        sourceReferences: [
          {
            assetPath: '/ring-references/gemini-top.jpg',
            sourceType: 'calibrated-capture',
            view: 'top',
          },
        ],
      },
    ],
    ['invalid model source', { modelDefinition: { source: 'guess', version: 'v2' } }],
    ['empty model version', { modelDefinition: { source: 'procedural', version: '' } }],
    [
      'invalid asset URL',
      { modelDefinition: { assetUrl: '/rings/gemini.glb', source: 'hybrid', version: 'v2' } },
    ],
  ] as const)('rejects a %s', (_, overrides) => {
    expect(parseRingDesignRenderManifest(approvedRecord(overrides))).toBeNull()
  })

  test('loads only valid published maker-approved records through a read-only query', async () => {
    const approved = approvedRecord()
    findMock.mockResolvedValue({
      docs: [
        approved,
        approvedRecord({ id: 8, status: 'draft' }),
        approvedRecord({ id: 9, makerApproved: false }),
        approvedRecord({ id: 10, modelDefinition: { source: 'scanned', version: '' } }),
      ],
    })

    await expect(loadPublishedRingDesignRenderManifests()).resolves.toEqual([
      parseRingDesignRenderManifest(approved),
    ])
    expect(findMock).toHaveBeenCalledWith({
      collection: 'ring-designs',
      depth: 0,
      limit: 4,
      overrideAccess: true,
      pagination: false,
      sort: 'style',
      where: {
        and: [{ status: { equals: 'published' } }, { makerApproved: { equals: true } }],
      },
      select: {
        name: true,
        slug: true,
        style: true,
        status: true,
        sourceReferences: true,
        measurements: true,
        modelDefinition: true,
        makerApproved: true,
        approvedAt: true,
        approvalNotes: true,
      },
    })
  })

  test('exports a schema that independently rejects malformed manifests', () => {
    expect(
      ringDesignRenderManifestSchema.safeParse({
        id: 7,
        name: 'Gemini',
        slug: 'gemini',
        style: 'gemini',
        model: { assetUrl: 'not-a-url', source: 'hybrid', version: 'v2' },
        approval: {
          approvedAt: '2026-07-15T01:30:00.000Z',
          notes: 'Approved against the physical Gemini master.',
        },
      }).success
    ).toBe(false)
  })
})
