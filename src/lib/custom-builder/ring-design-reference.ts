import { z } from 'zod'
import { parseBuilderStoneContour, type BuilderStoneContourV1 } from './stone-contour'

export const ringDesignStyles = ['gemini', 'coral', 'sun-moon', 'aurora'] as const
export const ringReferenceViews = ['top', 'three-quarter', 'profile', 'underside'] as const
export const ringDesignStoneShapes = [
  'oval',
  'round',
  'elongated',
  'cushion',
  'pear',
  'heart',
] as const
export const ringDesignMetals = [
  'sterling-silver',
  '14k-gold',
  '18k-gold',
  'white-gold',
  'rose-gold',
  'platinum',
] as const

export const ringDesignSourceReferenceSchema = z.object({
  accountHandle: z
    .string()
    .trim()
    .regex(/^@[A-Za-z0-9._]+$/)
    .optional(),
  assetPath: z.string().trim().min(1),
  notes: z.string().trim().max(1_000).optional(),
  observedAt: z.string().datetime().optional(),
  productSlug: z.string().trim().min(1).optional(),
  sourceType: z.enum(['product-gallery', 'instagram', 'calibrated-capture']),
  sourceUrl: z.string().url().optional(),
  verificationLevel: z
    .enum(['route-available', 'content-reviewed', 'asset-snapshotted'])
    .optional(),
  verifiedAt: z.string().datetime().optional(),
  view: z.enum(ringReferenceViews),
})

export const ringDesignMeasurementsSchema = z.object({
  beadCount: z.number().int().positive().optional(),
  beadDiameterMm: z.number().positive().optional(),
  headDepthMm: z.number().positive().optional(),
  headLengthMm: z.number().positive(),
  headWidthMm: z.number().positive(),
  measuredAt: z.string().datetime().optional(),
  measurementMethod: z.enum(['calipers', 'photogrammetry', 'maker-drawing']),
  shankDepthMm: z.number().positive(),
  shankWidthMm: z.number().positive(),
  stoneLengthMm: z.number().positive(),
  stoneWidthMm: z.number().positive(),
})

const modelNotesSchema = z.string().trim().max(2_000).optional()
const modelVersionSchema = z.string().trim().min(1).max(80)
const glbAssetUrlSchema = z
  .string()
  .url()
  .refine(
    (value) => {
      try {
        const url = new URL(value)
        return url.protocol === 'https:' && url.pathname.toLowerCase().endsWith('.glb')
      } catch {
        return false
      }
    },
    { message: 'Ring model assets must be GLB files' }
  )

const usRingSizeSchema = z
  .number()
  .min(4)
  .max(13)
  .refine((value) => Number.isInteger(value * 2), 'Ring size must use half-size increments')

const uniqueNamesSchema = z
  .array(z.string().trim().min(1))
  .min(1)
  .refine((values) => new Set(values).size === values.length, 'Names must be unique')

const builderStoneContourSchema = z.custom<BuilderStoneContourV1>(
  (value) => Boolean(parseBuilderStoneContour(value)),
  'A reviewed 96-sample stone contour is required'
)

const ringAssetIdentitySchema = z
  .strictObject({
    byteLength: z.number().int().positive(),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
    url: glbAssetUrlSchema,
  })
  .superRefine((asset, context) => {
    if (!new URL(asset.url).pathname.toLowerCase().includes(asset.sha256)) {
      context.addIssue({
        code: 'custom',
        message: 'Asset URL must be content-addressed by its SHA-256 digest',
        path: ['url'],
      })
    }
  })

const ringAssetMaterialSlotsSchema = z
  .strictObject({
    metal: uniqueNamesSchema,
    patina: uniqueNamesSchema,
    preserve: uniqueNamesSchema,
  })
  .superRefine((slots, context) => {
    const allNames = [...slots.metal, ...slots.patina, ...slots.preserve]
    if (new Set(allNames).size !== allNames.length) {
      context.addIssue({
        code: 'custom',
        message: 'Material slots must be pairwise disjoint',
      })
    }
  })

const ringAssetStoneFitSchema = z.strictObject({
  allowedOpalIds: z
    .array(z.string().trim().min(1))
    .min(1)
    .refine((values) => new Set(values).size === values.length, 'Opal IDs must be unique')
    .optional(),
  reference: z.strictObject({
    contour: builderStoneContourSchema,
    depthMm: z.number().positive(),
    lengthMm: z.number().positive(),
    widthMm: z.number().positive(),
  }),
  shape: z.enum(ringDesignStoneShapes),
  toleranceMm: z.strictObject({
    contour: z.number().nonnegative().max(0.25),
    depth: z.number().nonnegative().max(0.5),
    length: z.number().nonnegative().max(0.25),
    width: z.number().nonnegative().max(0.25),
  }),
})

const ringAssetSharedFields = {
  approvedMetals: z
    .array(z.enum(ringDesignMetals))
    .min(1)
    .refine((values) => new Set(values).size === values.length, 'Metals must be unique'),
  asset: ringAssetIdentitySchema,
  basis: z.literal('good-opal-world-v1'),
  id: z.string().trim().min(1).max(80),
  materialSlots: ringAssetMaterialSlotsSchema,
  runtimeScale: z.literal(0.1),
  stoneFit: ringAssetStoneFitSchema,
  unit: z.literal('millimeter'),
}

export const ringDesignAssetVariantSchema = z.discriminatedUnion('assembly', [
  z.strictObject({
    ...ringAssetSharedFields,
    assembly: z.literal('complete-ring'),
    nodes: z.strictObject({
      referenceStone: z.literal('REFERENCE_STONE').optional(),
      root: z.literal('RING_ROOT'),
      stoneAnchor: z.literal('STONE_ANCHOR'),
    }),
    ringFit: z.strictObject({
      mode: z.literal('fixed'),
      sizeUs: usRingSizeSchema,
    }),
  }),
  z.strictObject({
    ...ringAssetSharedFields,
    assembly: z.literal('authored-head-procedural-shank'),
    nodes: z.strictObject({
      referenceStone: z.literal('REFERENCE_STONE').optional(),
      root: z.literal('RING_ROOT'),
      shankJoinLeft: z.literal('SHANK_JOIN_LEFT'),
      shankJoinRight: z.literal('SHANK_JOIN_RIGHT'),
      stoneAnchor: z.literal('STONE_ANCHOR'),
    }),
    ringFit: z.strictObject({
      mode: z.literal('procedural-shank'),
      shankVersion: z.string().trim().min(1).max(80),
      sizesUs: z
        .array(usRingSizeSchema)
        .min(1)
        .refine((values) => new Set(values).size === values.length, 'Ring sizes must be unique'),
    }),
  }),
])

/** Immutable calibrated asset contract accepted by the production renderer. */
export const ringDesignAssetContractSchema = z
  .strictObject({
    contractVersion: z.literal('ring-asset-v1'),
    notes: modelNotesSchema,
    source: z.enum(['artist-authored', 'scanned', 'hybrid']),
    variants: z.array(ringDesignAssetVariantSchema).min(1),
    version: modelVersionSchema,
  })
  .superRefine((model, context) => {
    const ids = model.variants.map(({ id }) => id)
    const digests = model.variants.map(({ asset }) => asset.sha256)
    if (new Set(ids).size !== ids.length) {
      context.addIssue({
        code: 'custom',
        message: 'Variant IDs must be unique',
        path: ['variants'],
      })
    }
    if (new Set(digests).size !== digests.length) {
      context.addIssue({
        code: 'custom',
        message: 'Variant asset digests must be unique',
        path: ['variants'],
      })
    }
  })

export const proceduralRingDesignModelDefinitionSchema = z.object({
  assetUrl: z.never().optional(),
  notes: z.string().trim().max(2_000).optional(),
  source: z.literal('procedural'),
  version: modelVersionSchema,
})

export const ringDesignModelDefinitionSchema = z.union([
  proceduralRingDesignModelDefinitionSchema,
  ringDesignAssetContractSchema,
])

interface RingDesignReferenceDocument {
  approvalNotes?: unknown
  approvedAt?: unknown
  makerApproved?: unknown
  measurements?: unknown
  modelDefinition?: unknown
  sourceReferences?: unknown
  status?: unknown
}

const requiredViews = ringReferenceViews

function mergedDocument(
  data: RingDesignReferenceDocument | undefined,
  originalDoc: RingDesignReferenceDocument | undefined
): RingDesignReferenceDocument {
  return { ...originalDoc, ...data }
}

/**
 * Draft references may be incomplete while photography and measurements are
 * gathered. Publishing is the fidelity claim, so it requires calibrated views,
 * physical dimensions, a versioned model, and explicit maker approval.
 */
export function validateRingDesignReference(
  data: RingDesignReferenceDocument | undefined,
  originalDoc?: RingDesignReferenceDocument
): true | string {
  const document = mergedDocument(data, originalDoc)
  const references = z
    .array(ringDesignSourceReferenceSchema)
    .default([])
    .safeParse(document.sourceReferences)
  if (!references.success) return 'Design references must use the documented source schema'

  if (document.status !== 'published') return true
  if (document.makerApproved !== true) {
    return 'A maker must approve this design before it can be published'
  }
  if (typeof document.approvedAt !== 'string' || Number.isNaN(Date.parse(document.approvedAt))) {
    return 'Published designs require an approval date'
  }
  if (typeof document.approvalNotes !== 'string' || document.approvalNotes.trim().length < 10) {
    return 'Published designs require maker approval notes'
  }

  // Product-gallery and Instagram references remain useful provenance, but
  // only calibrated captures may prove physical fidelity. Keep both kinds in
  // the record and evaluate publication coverage from the calibrated subset.
  const calibratedReferences = references.data.filter(
    ({ sourceType }) => sourceType === 'calibrated-capture'
  )
  const capturedViews = new Set(calibratedReferences.map(({ view }) => view))
  const missingViews = requiredViews.filter((view) => !capturedViews.has(view))
  if (missingViews.length > 0) {
    return `Published designs require calibrated ${missingViews.join(', ')} reference views`
  }

  if (!ringDesignMeasurementsSchema.safeParse(document.measurements).success) {
    return 'Published designs require complete physical measurements'
  }
  const modelDefinition = ringDesignModelDefinitionSchema.safeParse(document.modelDefinition)
  if (!modelDefinition.success) {
    return 'Published designs require a versioned model definition'
  }
  if (modelDefinition.data.source === 'procedural') {
    return 'Published designs require an approved calibrated asset model'
  }

  return true
}
