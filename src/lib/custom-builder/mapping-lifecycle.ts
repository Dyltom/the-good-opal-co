import { classifyOpalListing, inferBuilderStoneType } from './opal-visual'

export const BUILDER_MAPPING_VERSION = 2

export const builderMappingStatuses = ['pending', 'reviewed', 'manual', 'stale'] as const

export type BuilderMappingStatus = (typeof builderMappingStatuses)[number]

type ProductRecord = Record<string, unknown>

interface Dimensions {
  depth?: number | null
  length?: number | null
  width?: number | null
}

interface InferredMapping {
  builderBodyColour: string
  builderFlashColourAccent: string
  builderFlashColourPrimary: string
  builderFlashColourSecondary: string
  builderPhotoFocalX: number
  builderPhotoFocalY: number
  builderPhotoZoom: number
  builderRecommendedStyle: 'aurora' | 'coral' | 'gemini' | 'sun-moon'
  builderSilhouette: 'cushion' | 'elongated' | 'oval' | 'pear' | 'round'
  builderTransmission: number
}

const inferredFields = [
  'builderBodyColour',
  'builderFlashColourAccent',
  'builderFlashColourPrimary',
  'builderFlashColourSecondary',
  'builderPhotoFocalX',
  'builderPhotoFocalY',
  'builderPhotoZoom',
  'builderRecommendedStyle',
  'builderSilhouette',
  'builderTransmission',
] as const

const visualProfiles: Record<
  string,
  Pick<
    InferredMapping,
    | 'builderBodyColour'
    | 'builderFlashColourAccent'
    | 'builderFlashColourPrimary'
    | 'builderFlashColourSecondary'
    | 'builderTransmission'
  >
> = {
  'black-opal': {
    builderBodyColour: '#102434',
    builderFlashColourPrimary: '#1bd8ed',
    builderFlashColourSecondary: '#38ed91',
    builderFlashColourAccent: '#ffcb45',
    builderTransmission: 0.04,
  },
  'boulder-opal': {
    builderBodyColour: '#523528',
    builderFlashColourPrimary: '#36c9ef',
    builderFlashColourSecondary: '#4ee598',
    builderFlashColourAccent: '#ffb43f',
    builderTransmission: 0.02,
  },
  'crystal-opal': {
    builderBodyColour: '#b9dcd4',
    builderFlashColourPrimary: '#25d5e7',
    builderFlashColourSecondary: '#4bef9a',
    builderFlashColourAccent: '#ffd34f',
    builderTransmission: 0.26,
  },
  'fire-opal': {
    builderBodyColour: '#d5844f',
    builderFlashColourPrimary: '#ffca52',
    builderFlashColourSecondary: '#ff7559',
    builderFlashColourAccent: '#63d5dc',
    builderTransmission: 0.18,
  },
  'matrix-opal': {
    builderBodyColour: '#59443b',
    builderFlashColourPrimary: '#42cbe4',
    builderFlashColourSecondary: '#55de89',
    builderFlashColourAccent: '#efb54a',
    builderTransmission: 0.02,
  },
  'opal-doublet': {
    builderBodyColour: '#172d3d',
    builderFlashColourPrimary: '#36d3ef',
    builderFlashColourSecondary: '#51e78a',
    builderFlashColourAccent: '#9d72ff',
    builderTransmission: 0.03,
  },
  'white-opal': {
    builderBodyColour: '#dce6df',
    builderFlashColourPrimary: '#55cfff',
    builderFlashColourSecondary: '#5bea9a',
    builderFlashColourAccent: '#ffd34e',
    builderTransmission: 0.16,
  },
}

function isRecord(value: unknown): value is ProductRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function finitePositive(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : undefined
}

function dimensionsFrom(value: unknown): Dimensions {
  if (!isRecord(value)) return {}
  return {
    depth: finitePositive(value.depth),
    length: finitePositive(value.length),
    width: finitePositive(value.width),
  }
}

function richTextContent(value: unknown): string {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.map(richTextContent).filter(Boolean).join(' ')
  if (!isRecord(value)) return ''

  const ownText = typeof value.text === 'string' ? value.text : ''
  const childText = 'children' in value ? richTextContent(value.children) : ''
  const rootText = 'root' in value ? richTextContent(value.root) : ''
  return [ownText, childText, rootText].filter(Boolean).join(' ')
}

/**
 * Legacy WooCommerce measurements are embedded in prose and use inconsistent
 * axis order. For a single stone the longest axis is length, the middle axis
 * is width, and the shortest axis is depth, regardless of source order.
 */
export function inferDimensionsFromDescription(value: unknown): Required<Dimensions> | undefined {
  const text = richTextContent(value)
  const match = text.match(
    /\b(\d+(?:\.\d+)?)\s*(?:x|×)\s*(\d+(?:\.\d+)?)\s*(?:x|×)\s*(\d+(?:\.\d+)?)\s*(?:mm|millimet(?:er|re)s?)\b/i
  )
  if (!match) return undefined

  const values = match
    .slice(1, 4)
    .map(Number)
    .filter((number) => Number.isFinite(number) && number > 0 && number <= 100)
    .sort((left, right) => right - left)
  if (values.length !== 3) return undefined

  return { length: values[0]!, width: values[1]!, depth: values[2]! }
}

function stableHash(value: string): string {
  let first = 2166136261
  let second = 2246822519

  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index)
    first = Math.imul(first ^ code, 16777619)
    second = Math.imul(second ^ code, 3266489917)
  }

  return `${(first >>> 0).toString(16).padStart(8, '0')}${(second >>> 0)
    .toString(16)
    .padStart(8, '0')}`
}

function imageIdentity(value: unknown): string | undefined {
  const image = isRecord(value) && 'image' in value ? value.image : value
  if (typeof image === 'string' || typeof image === 'number') return String(image)
  if (!isRecord(image)) return undefined

  const identity = [
    image.id,
    image.updatedAt,
    image.filename,
    image.url,
    image.filesize,
    image.width,
    image.height,
    image.focalX,
    image.focalY,
  ]
    .filter((part) => typeof part === 'string' || typeof part === 'number')
    .map(String)
    .join(':')

  return identity || undefined
}

function normalizedMediaFocus(value: unknown): { focalX: number; focalY: number } | undefined {
  const first = Array.isArray(value) ? value[0] : undefined
  const image = isRecord(first) && 'image' in first ? first.image : first
  if (!isRecord(image)) return undefined

  const normalize = (coordinate: unknown): number | undefined => {
    if (typeof coordinate !== 'number' || !Number.isFinite(coordinate)) return undefined
    if (coordinate >= 0 && coordinate <= 1) return coordinate
    if (coordinate > 1 && coordinate <= 100) return coordinate / 100
    return undefined
  }
  const focalX = normalize(image.focalX)
  const focalY = normalize(image.focalY)
  return focalX === undefined || focalY === undefined ? undefined : { focalX, focalY }
}

export function createBuilderSourceImageHash(images: unknown): string | undefined {
  if (!Array.isArray(images)) return undefined
  const identities = images.map(imageIdentity).filter((value): value is string => Boolean(value))
  return identities.length > 0 ? stableHash(JSON.stringify(identities)) : undefined
}

function explicitShape(name: string): InferredMapping['builderSilhouette'] | undefined {
  if (/\b(pear|teardrop)\b/i.test(name)) return 'pear'
  if (/\b(round|circular)\b/i.test(name)) return 'round'
  if (/\b(marquise|pipe|long|elongated)\b/i.test(name)) return 'elongated'
  if (/\b(cushion|square|heart|fossil|carved)\b/i.test(name)) return 'cushion'
  if (/\boval\b/i.test(name)) return 'oval'
  return undefined
}

function dimensionShape(dimensions: Dimensions): InferredMapping['builderSilhouette'] | undefined {
  const length = finitePositive(dimensions.length)
  const width = finitePositive(dimensions.width)
  if (!length || !width) return undefined
  const ratio = Math.max(length, width) / Math.min(length, width)
  if (ratio <= 1.08) return 'round'
  if (ratio >= 1.55) return 'elongated'
  return 'oval'
}

function styleForShape(
  shape: InferredMapping['builderSilhouette']
): InferredMapping['builderRecommendedStyle'] {
  if (shape === 'pear') return 'aurora'
  if (shape === 'cushion') return 'coral'
  if (shape === 'round') return 'sun-moon'
  return 'gemini'
}

export function inferBuilderMapping(product: ProductRecord): InferredMapping {
  const name = typeof product.name === 'string' ? product.name : ''
  const description = richTextContent(product.description)
  const structuredDimensions = dimensionsFrom(product.dimensions)
  const dimensions =
    structuredDimensions.length && structuredDimensions.width
      ? structuredDimensions
      : (inferDimensionsFromDescription(product.description) ?? structuredDimensions)
  const shape = explicitShape(`${name} ${description}`) ?? dimensionShape(dimensions) ?? 'oval'
  const stoneType = inferBuilderStoneType(
    typeof product.stoneType === 'string' ? product.stoneType : undefined,
    name
  )
  const colours = visualProfiles[stoneType] ?? visualProfiles['crystal-opal']!
  const listingKind = classifyOpalListing(name)
  const mediaFocus = normalizedMediaFocus(product.images)

  return {
    ...colours,
    builderPhotoFocalX: mediaFocus?.focalX ?? 0.5,
    builderPhotoFocalY: mediaFocus?.focalY ?? 0.5,
    builderPhotoZoom: listingKind === 'individual' ? 2.25 : 1.35,
    builderRecommendedStyle: styleForShape(shape),
    builderSilhouette: shape,
  }
}

function mappingConfidence(product: ProductRecord, sourceHash: string | undefined): number {
  const name = typeof product.name === 'string' ? product.name : ''
  const dimensions = dimensionsFrom(product.dimensions)
  const inferredDimensions = inferDimensionsFromDescription(product.description)
  const availableDimensions =
    finitePositive(dimensions.length) &&
    finitePositive(dimensions.width) &&
    finitePositive(dimensions.depth)
      ? dimensions
      : inferredDimensions
  const hasDimensions = Boolean(
    finitePositive(availableDimensions?.length) &&
    finitePositive(availableDimensions?.width) &&
    finitePositive(availableDimensions?.depth)
  )
  const stoneType = typeof product.stoneType === 'string' && product.stoneType.length > 0
  const shape = Boolean(
    explicitShape(`${name} ${richTextContent(product.description)}`) ??
      dimensionShape(availableDimensions ?? {})
  )
  const confidence =
    0.15 +
    (sourceHash ? 0.3 : 0) +
    (hasDimensions ? 0.25 : 0) +
    (stoneType ? 0.2 : 0) +
    (shape ? 0.1 : 0)
  return Math.round(Math.min(confidence, 1) * 100) / 100
}

function validStatus(value: unknown): value is BuilderMappingStatus {
  return builderMappingStatuses.includes(value as BuilderMappingStatus)
}

function mappingInputHash(product: ProductRecord, sourceHash: string | undefined): string {
  const dimensions = dimensionsFrom(product.dimensions)
  const description = richTextContent(product.description)
  return stableHash(
    JSON.stringify({
      dimensions,
      descriptionDimensions: inferDimensionsFromDescription(product.description) ?? null,
      descriptionShape: explicitShape(description) ?? null,
      name: typeof product.name === 'string' ? product.name.trim() : '',
      slug: typeof product.slug === 'string' ? product.slug.trim() : '',
      sourceHash: sourceHash ?? null,
      stoneType: typeof product.stoneType === 'string' ? product.stoneType : null,
    })
  )
}

function mergeProduct(data: unknown, originalDoc: unknown): ProductRecord {
  const original = isRecord(originalDoc) ? originalDoc : {}
  const incoming = isRecord(data) ? data : {}
  return {
    ...original,
    ...incoming,
    dimensions:
      isRecord(original.dimensions) || isRecord(incoming.dimensions)
        ? {
            ...(isRecord(original.dimensions) ? original.dimensions : {}),
            ...(isRecord(incoming.dimensions) ? incoming.dimensions : {}),
          }
        : incoming.dimensions,
  }
}

/**
 * Produces the cheap, deterministic lifecycle patch persisted with a product.
 * The pending/stale state is the durable review queue; no image processing or
 * network call runs inside the Payload write hook.
 */
export function applyBuilderMappingLifecycle(
  data: unknown,
  originalDoc: unknown,
  now: string
): ProductRecord {
  const incoming = isRecord(data) ? { ...data } : {}
  const previous = isRecord(originalDoc) ? originalDoc : {}
  let product = mergeProduct(incoming, previous)

  if (product.category !== 'raw-opals') {
    if (product.builderEligible === true) incoming.builderEligible = false
    return incoming
  }

  const dimensions = dimensionsFrom(product.dimensions)
  const hasStructuredDimensions = Boolean(
    dimensions.length || dimensions.width || dimensions.depth
  )
  const name = typeof product.name === 'string' ? product.name : ''
  if (!hasStructuredDimensions && classifyOpalListing(name) === 'individual') {
    const inferredDimensions = inferDimensionsFromDescription(product.description)
    if (inferredDimensions) {
      incoming.dimensions = inferredDimensions
      product = mergeProduct(incoming, previous)
    }
  }

  const sourceHash = createBuilderSourceImageHash(product.images)
  const inputHash = mappingInputHash(product, sourceHash)
  const inferred = inferBuilderMapping(product)
  const previousStatus = validStatus(previous.builderMappingStatus)
    ? previous.builderMappingStatus
    : undefined
  const requestedStatus = validStatus(incoming.builderMappingStatus)
    ? incoming.builderMappingStatus
    : undefined
  const explicitStatusChange = Boolean(requestedStatus && requestedStatus !== previousStatus)
  const legacyReviewed = !previousStatus && previous.builderEligible === true
  const previousHash =
    typeof previous.builderMappingInputHash === 'string'
      ? previous.builderMappingInputHash
      : undefined
  const inputsChanged = Boolean(previousHash && previousHash !== inputHash)
  const versionChanged =
    typeof previous.builderMappingVersion === 'number' &&
    previous.builderMappingVersion < BUILDER_MAPPING_VERSION

  let status: BuilderMappingStatus =
    requestedStatus ?? previousStatus ?? (legacyReviewed ? 'reviewed' : 'pending')
  if (
    !explicitStatusChange &&
    (inputsChanged || versionChanged) &&
    (status === 'reviewed' || status === 'manual')
  ) {
    status = 'stale'
  }

  incoming.builderMappingStatus = status
  incoming.builderMappingVersion = BUILDER_MAPPING_VERSION
  incoming.builderMappingConfidence = mappingConfidence(product, sourceHash)
  incoming.builderMappingSourceImageHash = sourceHash ?? null
  incoming.builderMappingInputHash = inputHash

  for (const field of inferredFields) {
    if (product[field] === null || product[field] === undefined || product[field] === '') {
      incoming[field] = inferred[field]
    }
  }

  if (explicitStatusChange && (status === 'reviewed' || status === 'manual')) {
    incoming.builderMappingReviewedAt = now
  }

  if (status === 'pending' || status === 'stale' || !sourceHash) {
    incoming.builderEligible = false
  }

  return incoming
}

export function isBuilderMappingApproved(status: unknown): boolean {
  // Undefined preserves the four legacy, explicitly reviewed catalogue records
  // until the lifecycle migration/backfill reaches them.
  return status === undefined || status === null || status === 'reviewed' || status === 'manual'
}

export function builderMappingNeedsReview(doc: unknown, previousDoc: unknown): boolean {
  if (!isRecord(doc) || doc.category !== 'raw-opals') return false
  if (doc.builderMappingStatus !== 'pending' && doc.builderMappingStatus !== 'stale') return false
  if (!isRecord(previousDoc)) return true
  return (
    doc.builderMappingStatus !== previousDoc.builderMappingStatus ||
    doc.builderMappingInputHash !== previousDoc.builderMappingInputHash ||
    doc.builderMappingVersion !== previousDoc.builderMappingVersion
  )
}
