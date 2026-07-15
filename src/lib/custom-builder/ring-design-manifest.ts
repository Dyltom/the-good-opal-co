import { z } from 'zod'
import { getPayload } from '@/lib/payload'
import {
  ringDesignAssetContractSchema,
  ringDesignMeasurementsSchema,
  ringDesignModelDefinitionSchema,
  ringDesignSourceReferenceSchema,
  ringDesignStyles,
  validateRingDesignReference,
} from './ring-design-reference'

const ringDesignRuntimeModelSchema = ringDesignAssetContractSchema

const ringDesignApprovalSchema = z.object({
  approvedAt: z.string().datetime({ offset: true }),
  notes: z.string().trim().min(10),
})

/**
 * Safe, read-only model contract exposed to the ring renderer. Payload status
 * fields stay at the boundary; a returned manifest is necessarily published
 * and explicitly approved by the maker.
 */
export const ringDesignRenderManifestSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  style: z.enum(ringDesignStyles),
  model: ringDesignRuntimeModelSchema,
  approval: ringDesignApprovalSchema,
})

export type RingDesignRenderManifest = z.infer<typeof ringDesignRenderManifestSchema>

const approvedRingDesignRecordSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  style: z.enum(ringDesignStyles),
  status: z.literal('published'),
  makerApproved: z.literal(true),
  approvedAt: z.string().datetime({ offset: true }),
  approvalNotes: z.string().trim().min(10),
  sourceReferences: z.array(ringDesignSourceReferenceSchema),
  measurements: ringDesignMeasurementsSchema,
  modelDefinition: ringDesignModelDefinitionSchema,
})

/** Rejects incomplete, draft, archived, or unapproved database records. */
export function parseRingDesignRenderManifest(value: unknown): RingDesignRenderManifest | null {
  const parsed = approvedRingDesignRecordSchema.safeParse(value)
  if (!parsed.success) return null
  if (validateRingDesignReference(parsed.data) !== true) return null

  const { approvedAt, approvalNotes, id, modelDefinition, name, slug, style } = parsed.data
  const manifest = ringDesignRenderManifestSchema.safeParse({
    id,
    name,
    slug,
    style,
    model: modelDefinition,
    approval: {
      approvedAt,
      notes: approvalNotes,
    },
  })
  return manifest.success ? manifest.data : null
}

/**
 * Loads only render-safe records. The query narrows the normal path while the
 * parser repeats the approval checks so unexpected or malformed data fails
 * closed at the runtime boundary.
 */
export async function loadPublishedRingDesignRenderManifests(): Promise<
  RingDesignRenderManifest[]
> {
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'ring-designs',
    depth: 0,
    limit: ringDesignStyles.length,
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

  return result.docs.flatMap((record) => {
    const manifest = parseRingDesignRenderManifest(record)
    return manifest ? [manifest] : []
  })
}
