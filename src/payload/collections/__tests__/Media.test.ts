import type { CollectionAfterChangeHook, CollectionBeforeValidateHook } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import {
  BUILDER_MEDIA_REPLACEMENT_CONTEXT,
  invalidateBuilderMappingsForMediaReplacement,
} from '../../../lib/custom-builder/media-mapping-invalidation.ts'
import { Media } from '../Media.ts'
import { Products } from '../Products.ts'

function hookArguments({
  docs = [],
  file = { data: Buffer.from('replacement') },
  operation = 'update',
}: {
  docs?: Record<string, unknown>[]
  file?: unknown
  operation?: 'create' | 'update'
}) {
  const find = vi.fn().mockResolvedValue({ docs })
  const info = vi.fn()
  const update = vi.fn().mockResolvedValue({})
  return {
    args: {
      collection: {} as never,
      context: { existingContext: true },
      doc: { id: 42 },
      file,
      operation,
      previousDoc: {},
      req: { file, payload: { find, logger: { info }, update } },
    } as unknown as Parameters<CollectionAfterChangeHook>[0],
    find,
    info,
    update,
  }
}

describe('Media builder mapping invalidation', () => {
  it('registers the invalidation hook on the media collection', () => {
    expect(Media.hooks?.afterChange).toContain(invalidateBuilderMappingsForMediaReplacement)
  })

  it('ignores metadata-only updates and media creation', async () => {
    const metadataUpdate = hookArguments({ file: null })
    await invalidateBuilderMappingsForMediaReplacement(metadataUpdate.args)
    expect(metadataUpdate.find).not.toHaveBeenCalled()

    const creation = hookArguments({ operation: 'create' })
    await invalidateBuilderMappingsForMediaReplacement(creation.args)
    expect(creation.find).not.toHaveBeenCalled()
  })

  it('reanalyzes every affected gallery while invalidating active sources only', async () => {
    const { args, find, info, update } = hookArguments({
      docs: [
        {
          id: 1,
          builderMappedImageIndex: 1,
          builderMappingStatus: 'reviewed',
          images: [{ image: 9 }, { image: 42 }],
        },
        {
          id: 2,
          builderMappedImageIndex: 0,
          builderMappingStatus: 'manual',
          images: [{ image: { id: 42 } }],
        },
        {
          id: 3,
          builderMappedImageIndex: 0,
          builderMappingStatus: 'reviewed',
          images: [{ image: 7 }, { image: 42 }],
        },
        {
          id: 4,
          builderMappingStatus: 'pending',
          images: [{ image: 42 }],
        },
      ],
    })

    await invalidateBuilderMappingsForMediaReplacement(args)

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'products',
        depth: 0,
        overrideAccess: true,
        pagination: false,
        where: { category: { equals: 'raw-opals' } },
      })
    )
    expect(update).toHaveBeenCalledTimes(4)
    expect(update.mock.calls.map(([call]) => call.id)).toEqual([1, 2, 3, 4])

    for (const [call] of update.mock.calls) {
      expect(call).toMatchObject({
        collection: 'products',
        context: {
          existingContext: true,
          [BUILDER_MEDIA_REPLACEMENT_CONTEXT]: true,
        },
        data: {
          builderContourCandidate: null,
          builderMappingAnalysisError: null,
          builderMappingAnalyzedImageHash: null,
          builderPhotoAnalysisConfidence: null,
          builderPhotoAnalysisVersion: null,
          builderPhotoCandidateImageIndex: null,
          builderPhotoCandidateFocalX: null,
          builderPhotoCandidateFocalY: null,
          builderPhotoCandidateRotation: null,
          builderPhotoCandidateZoom: null,
        },
        overrideAccess: true,
      })
      expect(call.data).not.toHaveProperty('builderContour')
      expect(call.data).not.toHaveProperty('builderPhotoFocalX')
      expect(call.data).not.toHaveProperty('builderPhotoFocalY')
      expect(call.data).not.toHaveProperty('builderPhotoRotation')
      expect(call.data).not.toHaveProperty('builderPhotoZoom')
    }

    expect(update.mock.calls[0]?.[0].data.builderMappingStatus).toBe('stale')
    expect(update.mock.calls[1]?.[0].data.builderMappingStatus).toBe('stale')
    expect(update.mock.calls[2]?.[0].data).not.toHaveProperty('builderMappingStatus')
    expect(update.mock.calls[2]?.[0].data).not.toHaveProperty('builderEligible')
    expect(update.mock.calls[2]?.[0].data).not.toHaveProperty('builderContourSourceImageHash')
    expect(update.mock.calls[3]?.[0].data.builderMappingStatus).toBe('pending')
    for (const index of [0, 1, 3]) {
      expect(update.mock.calls[index]?.[0].data).toMatchObject({
        builderContourSourceImageHash: null,
        builderEligible: false,
        builderMappingSourceImageHash: null,
      })
    }
    expect(info).toHaveBeenCalledWith({
      mediaId: '42',
      msg: 'Requeued opal builder mappings after source media replacement',
      productCount: 4,
      productIds: [1, 2, 3, 4],
    })
  })

  it('persists the invalidation patch without rebuilding the unchanged media identity', async () => {
    const lifecycleHook = Products.hooks?.beforeValidate?.[0] as
      | CollectionBeforeValidateHook
      | undefined
    const patch = {
      builderContourSourceImageHash: null,
      builderEligible: false,
      builderMappingSourceImageHash: null,
      builderMappingStatus: 'stale',
    }

    expect(lifecycleHook).toBeTypeOf('function')
    const result = await lifecycleHook?.({
      collection: {} as never,
      context: { [BUILDER_MEDIA_REPLACEMENT_CONTEXT]: true },
      data: patch,
      operation: 'update',
      originalDoc: {
        builderEligible: true,
        builderMappingStatus: 'reviewed',
        category: 'raw-opals',
        images: [{ image: 42 }],
      },
      req: {} as never,
    })

    expect(result).toBe(patch)
  })
})
