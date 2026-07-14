import type { CollectionAfterChangeHook } from 'payload'

import type { Product } from '../../types/payload-types.ts'

export const BUILDER_MEDIA_REPLACEMENT_CONTEXT = 'builderMediaReplacementInvalidation'

function relationshipId(value: unknown): string | undefined {
  if (typeof value === 'number' || typeof value === 'string') return String(value)
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined

  const id = Reflect.get(value, 'id')
  return typeof id === 'number' || typeof id === 'string' ? String(id) : undefined
}

function selectedBuilderMediaId(product: Product): string | undefined {
  if (!product.images?.length) return undefined

  const imageIndex =
    typeof product.builderMappedImageIndex === 'number' &&
    Number.isInteger(product.builderMappedImageIndex) &&
    product.builderMappedImageIndex >= 0
      ? product.builderMappedImageIndex
      : 0
  const selected = product.images[imageIndex] ?? product.images[0]
  return relationshipId(selected?.image)
}

function productUsesMedia(product: Product, mediaId: string): boolean {
  return Boolean(product.images?.some((item) => relationshipId(item.image) === mediaId))
}

function requestIncludesUploadedFile(req: object): boolean {
  return 'file' in req && Boolean(req.file)
}

export const invalidateBuilderMappingsForMediaReplacement: CollectionAfterChangeHook = async ({
  context,
  doc,
  operation,
  req,
}) => {
  if (operation !== 'update' || !requestIncludesUploadedFile(req)) return doc

  const changedMediaId = relationshipId(doc)
  if (!changedMediaId) return doc

  const products = await req.payload.find({
    collection: 'products',
    depth: 0,
    overrideAccess: true,
    pagination: false,
    req,
    where: { category: { equals: 'raw-opals' } },
  })
  const affected = products.docs.filter((product) => productUsesMedia(product, changedMediaId))

  for (const product of affected) {
    const activeSourceChanged = selectedBuilderMediaId(product) === changedMediaId
    await req.payload.update({
      collection: 'products',
      id: product.id,
      context: { ...context, [BUILDER_MEDIA_REPLACEMENT_CONTEXT]: true },
      data: {
        builderContourCandidate: null,
        builderMappingAnalysisError: null,
        builderMappingAnalyzedImageHash: null,
        ...(activeSourceChanged
          ? {
              builderContourSourceImageHash: null,
              builderEligible: false,
              builderMappingSourceImageHash: null,
              builderMappingStatus:
                product.builderMappingStatus === 'reviewed' ||
                product.builderMappingStatus === 'manual'
                  ? ('stale' as const)
                  : ('pending' as const),
            }
          : {}),
        builderPhotoAnalysisConfidence: null,
        builderPhotoAnalysisVersion: null,
        builderPhotoCandidateImageIndex: null,
        builderPhotoCandidateFocalX: null,
        builderPhotoCandidateFocalY: null,
        builderPhotoCandidateRotation: null,
        builderPhotoCandidateZoom: null,
      },
      overrideAccess: true,
      req,
    })
  }

  if (affected.length > 0) {
    req.payload.logger.info({
      mediaId: changedMediaId,
      msg: 'Requeued opal builder mappings after source media replacement',
      productCount: affected.length,
      productIds: affected.map((product) => product.id),
    })
  }

  return doc
}
