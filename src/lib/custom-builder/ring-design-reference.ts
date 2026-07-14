import { z } from 'zod'

export const ringDesignStyles = ['gemini', 'coral', 'sun-moon', 'aurora'] as const
export const ringReferenceViews = ['top', 'three-quarter', 'profile', 'underside'] as const

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

export const ringDesignModelDefinitionSchema = z.object({
  assetUrl: z.string().url().optional(),
  notes: z.string().trim().max(2_000).optional(),
  source: z.enum(['procedural', 'artist-authored', 'scanned', 'hybrid']),
  version: z.string().trim().min(1).max(80),
})

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
  if (!ringDesignModelDefinitionSchema.safeParse(document.modelDefinition).success) {
    return 'Published designs require a versioned model definition'
  }

  return true
}
