import { beforeEach, describe, expect, test, vi } from 'vitest'
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

const approvedDigest = '9f7b33f54ecf0d93a349fc22965d0f62cdcd6f1d7633e62533e493ccb31a0a0d'
const referenceContour = { version: 1 as const, radii: Array.from({ length: 96 }, () => 1) }
const approvedAssetVariant = {
  approvedMetals: ['sterling-silver'],
  assembly: 'complete-ring',
  asset: {
    byteLength: 124_000,
    sha256: approvedDigest,
    url: `https://assets.goodopalco.com/rings/${approvedDigest}.glb`,
  },
  basis: 'good-opal-world-v1',
  id: 'gemini-size-7-oval',
  materialSlots: {
    metal: ['STERLING_SILVER'],
    patina: ['OXIDIZED_RECESS'],
    preserve: ['MAKER_MARK'],
  },
  nodes: {
    referenceStone: 'REFERENCE_STONE',
    root: 'RING_ROOT',
    stoneAnchor: 'STONE_ANCHOR',
  },
  ringFit: {
    mode: 'fixed',
    sizeUs: 7,
  },
  runtimeScale: 0.1,
  stoneFit: {
    allowedOpalIds: ['opal-1'],
    reference: { contour: referenceContour, depthMm: 3, lengthMm: 10, widthMm: 8 },
    shape: 'oval',
    toleranceMm: { contour: 0.25, depth: 0.5, length: 0.2, width: 0.2 },
  },
  unit: 'millimeter',
} as const

const approvedAssetModel = {
  contractVersion: 'ring-asset-v1',
  source: 'artist-authored',
  variants: [approvedAssetVariant],
  version: 'gemini-v2',
} as const

const approvedStoredAsset = {
  bounds: { min: [-10, -10, -3], max: [10, 10, 3], size: [20, 20, 6] },
  byteLength: approvedAssetVariant.asset.byteLength,
  filename: `${approvedDigest}.glb`,
  filesize: approvedAssetVariant.asset.byteLength,
  materialNames: ['STERLING_SILVER', 'OXIDIZED_RECESS', 'MAKER_MARK'],
  mimeType: 'model/gltf-binary',
  nodeNames: ['REFERENCE_STONE', 'RING_ROOT', 'STONE_ANCHOR'],
  sha256: approvedDigest,
  url: approvedAssetVariant.asset.url,
  validated: true,
      validationVersion: 'glb-ring-v6',
}

function approvedRecord(overrides: Record<string, unknown> = {}): Record<string, unknown> {
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
    modelDefinition: approvedAssetModel,
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
        ...approvedAssetModel,
      },
      approval: {
        approvedAt: '2026-07-15T01:30:00.000Z',
        notes: 'Approved against the physical Gemini master.',
      },
    })
  })

  test('rejects an approved procedural record at the render boundary', () => {
    const manifest = parseRingDesignRenderManifest(
      approvedRecord({
        modelDefinition: { source: 'procedural', version: 'gemini-procedural-v2' },
      })
    )

    expect(manifest).toBeNull()
  })

  test.each([
    [
      'mutable asset URL',
      {
        ...approvedAssetVariant,
        asset: {
          ...approvedAssetVariant.asset,
          url: 'https://assets.goodopalco.com/rings/gemini-v2.glb',
        },
      },
    ],
    [
      'one complete-ring asset claiming multiple sizes',
      {
        ...approvedAssetVariant,
        ringFit: { mode: 'fixed', sizeUs: 7, sizes: [6, 7, 8] },
      },
    ],
    ['missing approved metal', { ...approvedAssetVariant, approvedMetals: [] }],
    [
      'asset without explicit opal bindings',
      {
        ...approvedAssetVariant,
        stoneFit: { ...approvedAssetVariant.stoneFit, allowedOpalIds: undefined },
      },
    ],
    [
      'overlapping material assignments',
      {
        ...approvedAssetVariant,
        materialSlots: {
          ...approvedAssetVariant.materialSlots,
          patina: ['STERLING_SILVER'],
        },
      },
    ],
    ['unknown contract field', { ...approvedAssetVariant, stretchesToFit: true }],
    [
      'authored head without shank join anchors',
      {
        ...approvedAssetVariant,
        assembly: 'authored-head-procedural-shank',
        ringFit: { mode: 'procedural-shank', shankVersion: 'procedural-v3', sizesUs: [7] },
      },
    ],
  ] as const)('rejects %s', (_, variant) => {
    expect(
      parseRingDesignRenderManifest(
        approvedRecord({ modelDefinition: { ...approvedAssetModel, variants: [variant] } })
      )
    ).toBeNull()
  })

  test.each([
    ['contract version', { ...approvedAssetModel, contractVersion: undefined }],
    [
      'asset URL',
      {
        ...approvedAssetModel,
        variants: [
          { ...approvedAssetVariant, asset: { ...approvedAssetVariant.asset, url: undefined } },
        ],
      },
    ],
    [
      'SHA-256 digest',
      {
        ...approvedAssetModel,
        variants: [
          { ...approvedAssetVariant, asset: { ...approvedAssetVariant.asset, sha256: 'bad' } },
        ],
      },
    ],
    [
      'millimeter units',
      { ...approvedAssetModel, variants: [{ ...approvedAssetVariant, unit: 'meter' }] },
    ],
    [
      'world basis',
      { ...approvedAssetModel, variants: [{ ...approvedAssetVariant, basis: 'y-up' }] },
    ],
    [
      'runtime scale',
      { ...approvedAssetModel, variants: [{ ...approvedAssetVariant, runtimeScale: 1 }] },
    ],
    [
      'assembly mode',
      { ...approvedAssetModel, variants: [{ ...approvedAssetVariant, assembly: 'unknown' }] },
    ],
    [
      'root node',
      {
        ...approvedAssetModel,
        variants: [
          {
            ...approvedAssetVariant,
            nodes: { referenceStone: 'REFERENCE_STONE', stoneAnchor: 'STONE_ANCHOR' },
          },
        ],
      },
    ],
    [
      'stone anchor',
      {
        ...approvedAssetModel,
        variants: [
          {
            ...approvedAssetVariant,
            nodes: { referenceStone: 'REFERENCE_STONE', root: 'RING_ROOT' },
          },
        ],
      },
    ],
    [
      'metal material slot',
      {
        ...approvedAssetModel,
        variants: [
          {
            ...approvedAssetVariant,
            materialSlots: { ...approvedAssetVariant.materialSlots, metal: [] },
          },
        ],
      },
    ],
    [
      'patina material slot',
      {
        ...approvedAssetModel,
        variants: [
          {
            ...approvedAssetVariant,
            materialSlots: { ...approvedAssetVariant.materialSlots, patina: [] },
          },
        ],
      },
    ],
    [
      'supported stone shapes',
      {
        ...approvedAssetModel,
        variants: [
          {
            ...approvedAssetVariant,
            stoneFit: { ...approvedAssetVariant.stoneFit, shape: 'triangle' },
          },
        ],
      },
    ],
    [
      'stone width bounds',
      {
        ...approvedAssetModel,
        variants: [
          {
            ...approvedAssetVariant,
            stoneFit: {
              ...approvedAssetVariant.stoneFit,
              toleranceMm: { ...approvedAssetVariant.stoneFit.toleranceMm, width: 0.3 },
            },
          },
        ],
      },
    ],
    [
      'stone length bounds',
      {
        ...approvedAssetModel,
        variants: [
          {
            ...approvedAssetVariant,
            stoneFit: {
              ...approvedAssetVariant.stoneFit,
              reference: { ...approvedAssetVariant.stoneFit.reference, lengthMm: undefined },
            },
          },
        ],
      },
    ],
    [
      'ring fit',
      { ...approvedAssetModel, variants: [{ ...approvedAssetVariant, ringFit: undefined }] },
    ],
  ] as const)('rejects a nonprocedural model missing a valid %s contract', (_, modelDefinition) => {
    expect(parseRingDesignRenderManifest(approvedRecord({ modelDefinition }))).toBeNull()
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
    ['scanned model without an asset', { modelDefinition: { source: 'scanned', version: 'v2' } }],
    [
      'artist-authored model without an asset',
      { modelDefinition: { source: 'artist-authored', version: 'v2' } },
    ],
    ['hybrid model without an asset', { modelDefinition: { source: 'hybrid', version: 'v2' } }],
    [
      'invalid asset URL',
      { modelDefinition: { assetUrl: '/rings/gemini.glb', source: 'hybrid', version: 'v2' } },
    ],
  ] as const)('rejects a %s', (_, overrides) => {
    expect(parseRingDesignRenderManifest(approvedRecord(overrides))).toBeNull()
  })

  test('loads only valid published maker-approved records through a read-only query', async () => {
    const approved = approvedRecord()
    findMock.mockImplementation(async ({ collection }: { collection: string }) => {
      if (collection === 'ring-assets') return { docs: [approvedStoredAsset] }
      return {
        docs: [
          approved,
          approvedRecord({ id: 8, status: 'draft' }),
          approvedRecord({ id: 9, makerApproved: false }),
          approvedRecord({ id: 10, modelDefinition: { source: 'scanned', version: '' } }),
        ],
      }
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
    expect(findMock).toHaveBeenCalledWith({
      collection: 'ring-assets',
      depth: 0,
      overrideAccess: true,
      pagination: false,
      where: { sha256: { in: [approvedDigest] } },
    })
  })

  test('fails closed at runtime when the CMS asset identity has drifted', async () => {
    findMock.mockImplementation(async ({ collection }: { collection: string }) => ({
      docs:
        collection === 'ring-assets'
          ? [{ ...approvedStoredAsset, byteLength: approvedStoredAsset.byteLength + 1 }]
          : [approvedRecord()],
    }))

    await expect(loadPublishedRingDesignRenderManifests()).resolves.toEqual([])
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
