import { describe, expect, test, vi } from 'vitest'
import type { CollectionBeforeValidateHook } from 'payload'
import { makeRingGlbFixture } from '@/test/ring-glb-fixture'
import { inspectRingGlb } from '@/lib/custom-builder/ring-asset-ingestion'
import { applyRingDesignApprovalLifecycle } from '@/lib/custom-builder/ring-design-reference'
import {
  invalidateRingDesignApprovalOnFidelityChange,
  requireStoredRingAssetsForApproval,
  RingDesigns,
} from '../RingDesigns'

const approvedDesign = {
  approvalNotes: 'Approved against physical Gemini master.',
  approvedAt: '2026-07-15T01:30:00.000Z',
  makerApproved: true,
  measurements: { headWidthMm: 8.8 },
  modelDefinition: { source: 'procedural', version: 'procedural-v3' },
  sourceReferences: [{ assetPath: '/references/gemini-top.jpg', view: 'top' }],
  status: 'published',
  style: 'gemini',
}

async function runInvalidation(data: Record<string, unknown>, originalDoc = approvedDesign) {
  return applyRingDesignApprovalLifecycle(data, originalDoc, 'update')
}

describe('ring design approval lifecycle', () => {
  test.each([
    ['style', { style: 'coral' }],
    ['source references', { sourceReferences: [] }],
    ['measurements', { measurements: { headWidthMm: 9.1 } }],
    ['model definition', { modelDefinition: { source: 'procedural', version: 'procedural-v4' } }],
  ] as const)('returns approved designs to draft when %s change', async (_, patch) => {
    await expect(runInvalidation(patch)).resolves.toMatchObject({
      approvalNotes: null,
      approvedAt: null,
      makerApproved: false,
      status: 'draft',
    })
  })

  test('does not let the fidelity edit reassert approval in the same save', async () => {
    await expect(
      runInvalidation({
        approvalNotes: 'Reapproved without a separate review save.',
        approvedAt: '2026-07-16T01:30:00.000Z',
        makerApproved: true,
        modelDefinition: { source: 'procedural', version: 'procedural-v4' },
        status: 'published',
      })
    ).resolves.toMatchObject({
      approvalNotes: null,
      approvedAt: null,
      makerApproved: false,
      status: 'draft',
    })
  })

  test('preserves approval when a non-fidelity field changes', async () => {
    const patch = { name: 'Gemini ring' }
    await expect(runInvalidation(patch)).resolves.toBe(patch)
  })

  test('clears stale approval metadata from already-draft evidence edits', async () => {
    const patch = { measurements: { headWidthMm: 9.1 } }
    await expect(
      runInvalidation(patch, { ...approvedDesign, makerApproved: false, status: 'draft' })
    ).resolves.toMatchObject({
      approvalNotes: null,
      approvedAt: null,
      makerApproved: false,
      status: 'draft',
    })
  })

  test('compares JSON object keys canonically while preserving array order', async () => {
    const measurements = { method: 'calipers', width: 8.8 }
    const patch = { measurements: { width: 8.8, method: 'calipers' } }

    await expect(runInvalidation(patch, { ...approvedDesign, measurements })).resolves.toBe(patch)
  })

  test('forces newly created records through a separate approval save', () => {
    expect(
      applyRingDesignApprovalLifecycle(
        {
          approvalNotes: 'Attempted approval during creation.',
          approvedAt: '2026-07-16T01:30:00.000Z',
          makerApproved: true,
          status: 'published',
        },
        undefined,
        'create'
      )
    ).toMatchObject({
      approvalNotes: null,
      approvedAt: null,
      makerApproved: false,
      status: 'draft',
    })
  })

  test('runs invalidation before publication validation', () => {
    const hooks = RingDesigns.hooks?.beforeValidate as CollectionBeforeValidateHook[] | undefined
    expect(hooks?.[0]).toBe(invalidateRingDesignApprovalOnFidelityChange)
    expect(hooks?.[1]).toBe(requireStoredRingAssetsForApproval)
  })

  test('requires exact validated CMS asset identity before approval', async () => {
    const inspection = inspectRingGlb(makeRingGlbFixture())
    const url = `https://assets.goodopalco.com/rings/${inspection.sha256}-immutable.glb`
    const modelDefinition = {
      contractVersion: 'ring-asset-v1',
      source: 'hybrid',
      variants: [
        {
          approvedMetals: ['sterling-silver'],
          assembly: 'authored-head-procedural-shank',
          asset: { byteLength: inspection.byteLength, sha256: inspection.sha256, url },
          basis: 'good-opal-world-v1',
          id: 'gemini-head-oval',
          materialSlots: {
            metal: ['STERLING_SILVER'],
            patina: ['OXIDIZED_RECESS'],
            preserve: ['MAKER_MARK'],
          },
          nodes: {
            root: 'RING_ROOT',
            shankJoinLeft: 'SHANK_JOIN_LEFT',
            shankJoinRight: 'SHANK_JOIN_RIGHT',
            stoneAnchor: 'STONE_ANCHOR',
          },
          ringFit: {
            mode: 'procedural-shank',
            shankVersion: 'procedural-v4',
            sizesUs: [7],
          },
          runtimeScale: 0.1,
          stoneFit: {
            allowedOpalIds: ['opal-1'],
            reference: {
              contour: { version: 1, radii: Array.from({ length: 96 }, () => 1) },
              depthMm: 3,
              lengthMm: 10,
              widthMm: 8,
            },
            shape: 'oval',
            toleranceMm: { contour: 0.2, depth: 0.5, length: 0.2, width: 0.2 },
          },
          unit: 'millimeter',
        },
      ],
      version: 'gemini-cad-v1',
    }
    const stored = {
      ...inspection,
      filename: `${inspection.sha256}.glb`,
      filesize: inspection.byteLength,
      mimeType: 'model/gltf-binary',
      url,
      validated: true,
    }
    const find = vi.fn().mockResolvedValue({ docs: [stored] })

    await expect(
      requireStoredRingAssetsForApproval({
        data: { modelDefinition, status: 'published' },
        req: { payload: { find } },
      } as never)
    ).resolves.toMatchObject({ status: 'published' })
    expect(find).toHaveBeenCalledWith({
      collection: 'ring-assets',
      depth: 0,
      overrideAccess: true,
      pagination: false,
      req: expect.anything(),
      where: { sha256: { in: [inspection.sha256] } },
    })

    find.mockResolvedValueOnce({ docs: [] })
    await expect(
      requireStoredRingAssetsForApproval({
        data: { modelDefinition, status: 'published' },
        req: { payload: { find } },
      } as never)
    ).rejects.toThrow('must match one CMS-owned validated upload')
  })
})
