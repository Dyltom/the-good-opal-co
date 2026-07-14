import type { BuilderOpal, RingConfig } from '@/components/custom-builder/config'
import {
  hasBuilderDimensionValue,
  parseBuilderPhotoCrop,
  parseBuilderDimensions,
} from '@/lib/product-validation'
import { parseBuilderStoneContour, type BuilderStoneContourV1 } from './stone-contour'

type VisualProfile = BuilderOpal['visual']

// Estimated catalogue crops should sample the opal face, not attempt to trace
// an unreviewed stone boundary. A looser crop leaks fingers, bench tops, and
// shadows into the 3D cabochon when the photographed outline differs slightly
// from the inferred mesh.
export const ESTIMATED_OPAL_PHOTO_ZOOM = 3.2

// Pixel-isolated from the reviewed IMG_0774 source (analysis v3, confidence
// 0.946). The generic heart outline includes black velvet above this hand-cut
// stone's shallow lobes, so the exact source contour is required for a clean
// preview while Payload's durable candidate is still being populated.
const mintabieHeart055Contour = {
  version: 1,
  radii: [
    0.9008, 0.9255, 0.9418, 1.0081, 1.022, 1.0605, 1.1089, 1.1329, 1.1655, 1.1774,
    1.181, 1.2022, 1.2022, 1.199, 1.189, 1.17, 1.1455, 1.1131, 1.0732, 0.975, 0.8914,
    0.7998, 0.7431, 0.7431, 0.7792, 0.8475, 0.9125, 0.9985, 1.0251, 1.0427, 1.0592,
    1.0816, 1.1004, 1.12, 1.1251, 1.1251, 1.1325, 1.1325, 1.1318, 1.1224, 1.1096,
    1.0918, 1.0696, 1.0541, 1.0281, 0.9926, 0.964, 0.926, 0.8928, 0.8577, 0.8371,
    0.8139, 0.7883, 0.7764, 0.7615, 0.7532, 0.7511, 0.7487, 0.7487, 0.7502, 0.7588,
    0.7655, 0.7771, 0.7897, 0.7992, 0.8149, 0.8334, 0.8562, 0.8852, 0.918, 0.9606,
    0.9931, 0.9931, 0.9749, 0.9387, 0.9069, 0.8713, 0.8445, 0.8213, 0.8054, 0.7897,
    0.7771, 0.7665, 0.7588, 0.7502, 0.7458, 0.7458, 0.7475, 0.7507, 0.7615, 0.7704,
    0.7841, 0.8077, 0.8308, 0.8514, 0.8739,
  ],
} satisfies BuilderStoneContourV1

export interface BuilderVisualFields {
  builderEligible?: boolean | null
  builderMappingStatus?: string | null
  builderSilhouette?: string | null
  builderRecommendedStyle?: string | null
  builderBodyColour?: string | null
  builderFlashColourPrimary?: string | null
  builderFlashColourSecondary?: string | null
  builderFlashColourAccent?: string | null
  builderTransmission?: number | null
  builderPhotoFocalX?: number | null
  builderPhotoFocalY?: number | null
  builderPhotoZoom?: number | null
  builderPhotoRotation?: number | null
  builderContour?: unknown
  builderContourCandidate?: unknown
  builderPhotoAnalysisConfidence?: number | null
  builderPhotoCandidateFocalX?: number | null
  builderPhotoCandidateFocalY?: number | null
  builderPhotoCandidateZoom?: number | null
  builderPhotoCandidateRotation?: number | null
  builderContourSourceImageHash?: string | null
  builderMappingAnalyzedImageHash?: string | null
  dimensions?: {
    width?: number | null
    length?: number | null
    depth?: number | null
  } | null
}

export type BuilderOpalSelectionKind = BuilderOpal['selectionKind']

const nonOpalListingPattern = /\b(deposit|gift\s*card|consultation|shipping|repair)\b/i

/**
 * The collection contains one legacy service product filed as a raw opal.
 * Keep the catalogue query broad, then reject only records that are clearly
 * not physical opal listings.
 */
export function isAvailableOpalListing(name: string): boolean {
  return name.trim().length > 0 && !nonOpalListingPattern.test(name)
}

export function classifyOpalListing(name: string): BuilderOpalSelectionKind {
  if (/^queensland boulder opal 20 cts$/i.test(name.trim())) return 'specimen'
  if (/\bspecimen\b/i.test(name)) return 'specimen'
  if (/\bparcel\b/i.test(name)) return 'parcel'
  if (/\b(calibrated|priced individually)\b/i.test(name)) return 'assortment'
  return 'individual'
}

export function inferBuilderStoneType(stoneType: string | null | undefined, name: string): string {
  if (stoneType) return stoneType
  if (/\b(doublet|triplet)\b/i.test(name)) return 'opal-doublet'
  if (/\b(matrix|andamooka)\b/i.test(name)) return 'matrix-opal'
  if (/\b(boulder|koroit|queensland)\b/i.test(name)) return 'boulder-opal'
  if (/\b(crystal|pipe)\b/i.test(name)) return 'crystal-opal'
  if (/\b(black|semi[ -]?black|dark|mintabie)\b/i.test(name)) return 'black-opal'
  if (/\b(white|milky|coober\s*pedy)\b/i.test(name)) return 'white-opal'
  return 'unknown-opal'
}

const reviewedProfiles: Record<
  string,
  Pick<
    VisualProfile,
    | 'silhouette'
    | 'aspectRatio'
    | 'evidence'
    | 'recommendedStyle'
    | 'textureCrop'
    | 'bodyColour'
    | 'dimensionsMm'
    | 'photoFit'
  >
> = {
  'lightning-ridge-white-opal-1-05-cts': {
    silhouette: 'oval',
    aspectRatio: 7 / 6,
    evidence: 'catalogue',
    recommendedStyle: 'gemini',
    textureCrop: { focalX: 0.507, focalY: 0.489, zoom: 4.16 },
    bodyColour: '#d7dcc9',
    dimensionsMm: { width: 6, length: 7, depth: 3 },
    photoFit: 'reviewed',
  },
  'mintabie-semi-black-opal-1-05-cts': {
    silhouette: 'cushion',
    aspectRatio: 1.3,
    evidence: 'catalogue',
    recommendedStyle: 'coral',
    textureCrop: { focalX: 0.515, focalY: 0.49, zoom: 7 },
    bodyColour: '#a8c4b8',
    dimensionsMm: { width: 5, length: 6.5, depth: 3.5 },
    photoFit: 'reviewed',
  },
  'mintabie-semi-black-opal-1-35-cts': {
    silhouette: 'oval',
    aspectRatio: 8 / 7,
    evidence: 'catalogue',
    recommendedStyle: 'gemini',
    textureCrop: { focalX: 0.501, focalY: 0.493, zoom: 3.61 },
    bodyColour: '#cbd5c7',
    dimensionsMm: { width: 7, length: 8, depth: 3.5 },
    photoFit: 'reviewed',
  },
  'queensland-crystal-pipe-opal-1-45-cts': {
    silhouette: 'elongated',
    aspectRatio: 9.5 / 5.3,
    evidence: 'catalogue',
    recommendedStyle: 'gemini',
    textureCrop: { focalX: 0.517, focalY: 0.466, zoom: 4.74 },
    bodyColour: '#78c5df',
    dimensionsMm: { width: 5.3, length: 9.5, depth: 2.5 },
    photoFit: 'reviewed',
  },
}

const cataloguePhotoProfiles: Record<
  string,
  Pick<
    VisualProfile,
    | 'silhouette'
    | 'aspectRatio'
    | 'evidence'
    | 'recommendedStyle'
    | 'textureCrop'
    | 'photoFit'
    | 'contour'
  >
> = {
  'mintabie-dark-opal-heart-055-cts': {
    silhouette: 'heart',
    aspectRatio: 6 / 5.5,
    evidence: 'catalogue',
    recommendedStyle: 'coral',
    contour: mintabieHeart055Contour,
    textureCrop: { focalX: 0.4875, focalY: 0.532, zoom: 3.2 },
    photoFit: 'reviewed',
  },
  'mintabie-dark-opal-heart-070cts': {
    silhouette: 'heart',
    aspectRatio: 6 / 5.5,
    evidence: 'catalogue',
    recommendedStyle: 'coral',
    textureCrop: { focalX: 0.48, focalY: 0.43, zoom: 2.25 },
    photoFit: 'reviewed',
  },
  'coober-pedy-carved-heart-1-ct': {
    silhouette: 'heart',
    aspectRatio: 1,
    evidence: 'catalogue',
    recommendedStyle: 'coral',
    textureCrop: { focalX: 0.5, focalY: 0.56, zoom: 3.2 },
    photoFit: 'reviewed',
  },
  'large-queensland-boulder-opal-teardrop-4-cts': {
    silhouette: 'pear',
    aspectRatio: 1.5,
    evidence: 'catalogue',
    recommendedStyle: 'aurora',
    textureCrop: { focalX: 0.54, focalY: 0.57, zoom: 4.7 },
    photoFit: 'reviewed',
  },
  'lightning-ridge-black-opal-6-30ct': {
    silhouette: 'pear',
    aspectRatio: 1.3,
    evidence: 'catalogue',
    recommendedStyle: 'aurora',
    textureCrop: { focalX: 0.452, focalY: 0.537, zoom: 3.2 },
    photoFit: 'estimated',
  },
  'lightning-ridge-black-opal-1-45-cts': {
    silhouette: 'elongated',
    aspectRatio: 2.25,
    evidence: 'catalogue',
    recommendedStyle: 'gemini',
    textureCrop: { focalX: 0.465, focalY: 0.52, zoom: 10 },
    photoFit: 'reviewed',
  },
  'lightning-ridge-semi-black-opal-1-40-cts': {
    silhouette: 'elongated',
    aspectRatio: 1.5,
    evidence: 'catalogue',
    recommendedStyle: 'gemini',
    textureCrop: { focalX: 0.45, focalY: 0.52, zoom: 8 },
    photoFit: 'reviewed',
  },
  'lightning-ridge-semi-black-opal-5-50-cts': {
    silhouette: 'elongated',
    aspectRatio: 1.75,
    evidence: 'catalogue',
    recommendedStyle: 'gemini',
    textureCrop: { focalX: 0.526, focalY: 0.584, zoom: 3.91 },
    photoFit: 'estimated',
  },
  'coober-pedy-white-opal-6-35-cts': {
    silhouette: 'cushion',
    aspectRatio: 1.3,
    evidence: 'catalogue',
    recommendedStyle: 'coral',
    textureCrop: { focalX: 0.5, focalY: 0.52, zoom: 3.35 },
    photoFit: 'estimated',
  },
  'queensland-boulder-opal-20-cts': {
    silhouette: 'cushion',
    aspectRatio: 1.25,
    evidence: 'catalogue',
    recommendedStyle: 'coral',
    textureCrop: { focalX: 0.52, focalY: 0.5, zoom: 2.35 },
    photoFit: 'estimated',
  },
  'mintabie-semi-black-opal-6-80-cts': {
    silhouette: 'pear',
    aspectRatio: 1.55,
    evidence: 'catalogue',
    recommendedStyle: 'aurora',
    textureCrop: { focalX: 0.525, focalY: 0.52, zoom: 6.5 },
    photoFit: 'reviewed',
  },
  'coober-pedy-white-opal-2-30-cts-copy': {
    silhouette: 'pear',
    aspectRatio: 1.55,
    evidence: 'catalogue',
    recommendedStyle: 'aurora',
    textureCrop: { focalX: 0.48, focalY: 0.48, zoom: 6 },
    photoFit: 'reviewed',
  },
  'lightning-ridge-white-opal-1-70-cts-2': {
    silhouette: 'pear',
    aspectRatio: 13 / 8.5,
    evidence: 'catalogue',
    recommendedStyle: 'aurora',
    textureCrop: { focalX: 0.55, focalY: 0.48, zoom: 5.5 },
    photoFit: 'reviewed',
  },
}

const reviewedSlugAliases: Readonly<Record<string, string>> = {
  'lightning-ridge-white-opal-105-ct': 'lightning-ridge-white-opal-1-05-cts',
  'mintabie-carved-heart': 'mintabie-dark-opal-heart-055-cts',
  'mintabie-semi-black-opal-105-cts': 'mintabie-semi-black-opal-1-05-cts',
  'mintabie-semi-black-opal-135-cts': 'mintabie-semi-black-opal-1-35-cts',
  'queensland-crystal-pipe-opal-105-cts': 'queensland-crystal-pipe-opal-1-45-cts',
}

// These three source photographs produced pixel-isolated contours that also
// passed a live rendered-fit audit in July 2026. Keep this allow-list separate
// from automatic activation: other candidates still require maker review, and
// the analyser's exact 0.70 canonical fallback must never masquerade as a
// traced stone edge.
const visuallyAuditedImageCandidateSlugs = new Set([
  'lightning-ridge-black-opal-6-30ct',
  'mintabie-dark-opal-heart-055-cts',
  'queensland-crystal-pipe-opal-1-45-cts',
])

const reviewedPhotoBySlug: Record<string, string> = {
  'lightning-ridge-white-opal-1-05-cts': '/images/products/20211104_234659-1-1.jpg',
  'mintabie-semi-black-opal-1-05-cts': '/images/products/20210923_174046.jpg',
  'mintabie-semi-black-opal-1-35-cts': '/images/products/20210923_173846-1.jpg',
  'queensland-crystal-pipe-opal-1-45-cts': '/images/products/20211012_173649.jpg',
  'mintabie-dark-opal-heart-055-cts': '/images/products/IMG_0774.jpg',
  'mintabie-dark-opal-heart-070cts': '/images/products/IMG_0779.jpg',
  'coober-pedy-carved-heart-1-ct': '/images/products/heartthing-1.jpg',
  'large-queensland-boulder-opal-teardrop-4-cts': '/images/products/20211104_230316.jpg',
  'lightning-ridge-black-opal-1-45-cts': '/images/products/20211129_164200-1-1.jpg',
  'lightning-ridge-semi-black-opal-1-40-cts':
    '/images/products/Screenshot_20211129-234455_Gallery.jpg',
  'mintabie-semi-black-opal-6-80-cts': '/images/products/20210523_092426-1.jpg',
  'coober-pedy-white-opal-2-30-cts-copy': '/images/products/20210606_144434.jpg',
  'lightning-ridge-white-opal-1-70-cts-2': '/images/products/20211104_231959.jpg',
}

export function reviewedOpalImageUrl(
  slug: string,
  mappingStatus?: string | null
): string | undefined {
  if (mappingStatus !== undefined && mappingStatus !== 'reviewed' && mappingStatus !== 'manual') {
    return undefined
  }
  const reviewedSlug = reviewedSlugAliases[slug] ?? slug
  return reviewedPhotoBySlug[reviewedSlug]
}

function reviewedProfileFor(slug: string): (typeof reviewedProfiles)[string] | undefined {
  return reviewedProfiles[reviewedSlugAliases[slug] ?? slug]
}

function auditedImageCandidate(
  slug: string,
  fields?: BuilderVisualFields
): Pick<VisualProfile, 'contour' | 'textureCrop' | 'photoFit'> | undefined {
  const reviewedSlug = reviewedSlugAliases[slug] ?? slug
  const mappingApproved =
    fields?.builderMappingStatus === 'reviewed' || fields?.builderMappingStatus === 'manual'
  const confidence = fields?.builderPhotoAnalysisConfidence
  const contour = parseBuilderStoneContour(fields?.builderContourCandidate)
  const focalX = fields?.builderPhotoCandidateFocalX
  const focalY = fields?.builderPhotoCandidateFocalY
  const zoom = fields?.builderPhotoCandidateZoom
  const rotation = fields?.builderPhotoCandidateRotation
  const candidateCrop = parseBuilderPhotoCrop(focalX, focalY, zoom, rotation)

  if (
    !mappingApproved ||
    !visuallyAuditedImageCandidateSlugs.has(reviewedSlug) ||
    !contour ||
    typeof confidence !== 'number' ||
    !Number.isFinite(confidence) ||
    confidence < 0.9 ||
    confidence > 1 ||
    Math.abs(confidence - 0.7) < 0.0001 ||
    !candidateCrop
  ) {
    return undefined
  }

  return {
    contour,
    textureCrop: candidateCrop,
    photoFit: 'reviewed',
  }
}

const validSilhouettes = new Set<RingConfig['shape']>([
  'oval',
  'round',
  'elongated',
  'cushion',
  'pear',
  'heart',
])
const validStyles = new Set<RingConfig['style']>(['gemini', 'coral', 'sun-moon', 'aurora'])
const hexColourPattern = /^#[0-9a-f]{6}$/i

function cmsReviewedProfile(
  fields?: BuilderVisualFields,
  fallbackAspectRatio?: number
): VisualProfile | undefined {
  const mappingApproved =
    fields?.builderMappingStatus === 'reviewed' || fields?.builderMappingStatus === 'manual'
  if (!fields || !mappingApproved) {
    return undefined
  }

  const silhouette = fields.builderSilhouette
  const recommendedStyle = fields.builderRecommendedStyle
  const dimensionsMm = completeDimensions(fields)
  const reviewedCrop = parseBuilderPhotoCrop(
    fields.builderPhotoFocalX,
    fields.builderPhotoFocalY,
    fields.builderPhotoZoom,
    fields.builderPhotoRotation
  )
  const contour =
    fields.builderContourSourceImageHash &&
    fields.builderContourSourceImageHash === fields.builderMappingAnalyzedImageHash
      ? parseBuilderStoneContour(fields.builderContour)
      : undefined
  const colours = [
    fields.builderFlashColourPrimary,
    fields.builderFlashColourSecondary,
    fields.builderFlashColourAccent,
  ]

  if (
    !silhouette ||
    !validSilhouettes.has(silhouette as RingConfig['shape']) ||
    !recommendedStyle ||
    !validStyles.has(recommendedStyle as RingConfig['style']) ||
    !fields.builderBodyColour ||
    !hexColourPattern.test(fields.builderBodyColour) ||
    !colours.every((colour) => typeof colour === 'string' && hexColourPattern.test(colour)) ||
    typeof fields.builderTransmission !== 'number' ||
    !Number.isFinite(fields.builderTransmission) ||
    fields.builderTransmission < 0 ||
    fields.builderTransmission > 1 ||
    !reviewedCrop ||
    (hasBuilderDimensionValue(fields.dimensions) && !dimensionsMm) ||
    (!dimensionsMm &&
      (!fallbackAspectRatio || !Number.isFinite(fallbackAspectRatio) || fallbackAspectRatio <= 0))
  ) {
    return undefined
  }

  return {
    silhouette: silhouette as RingConfig['shape'],
    aspectRatio: dimensionsMm ? dimensionsMm.length / dimensionsMm.width : fallbackAspectRatio!,
    evidence: 'catalogue',
    recommendedStyle: recommendedStyle as RingConfig['style'],
    textureCrop: reviewedCrop,
    bodyColour: fields.builderBodyColour,
    flashColours: colours as [string, string, string],
    transmission: fields.builderTransmission,
    patternSeed: 0,
    photoFit: 'reviewed',
    contour,
    dimensionsMm,
  }
}

const typeProfiles: Record<
  string,
  {
    renderStone: RingConfig['stone']
    bodies: readonly string[]
    flashes: readonly (readonly [string, ...string[]])[]
    transmission: number
  }
> = {
  'black-opal': {
    renderStone: 'lightning',
    bodies: ['#071521', '#102434', '#182b3a'],
    flashes: [
      ['#1bd8ed', '#38ed91', '#315cff', '#ffcb45'],
      ['#315cff', '#9b68ff', '#ff4d8d', '#42e29a'],
      ['#16bde8', '#48df70', '#ff6a45', '#f2ca3f'],
    ],
    transmission: 0.035,
  },
  'white-opal': {
    renderStone: 'crystal',
    bodies: ['#dce6df', '#e8e4d9', '#d5e5e2'],
    flashes: [
      ['#55cfff', '#5bea9a', '#ffd34e', '#ff758a'],
      ['#75ddff', '#ad86ff', '#ffdd5b', '#61d897'],
      ['#4fc5ec', '#7ee078', '#ff8c72', '#f3cf42'],
    ],
    transmission: 0.16,
  },
  'crystal-opal': {
    renderStone: 'blue-green',
    bodies: ['#b9dcd4', '#c6ded8', '#a9d3ce'],
    flashes: [
      ['#25d5e7', '#4bef9a', '#4169ff', '#ffd34f'],
      ['#52cfff', '#5ee68f', '#ff705d', '#9c7cff'],
      ['#3ec9ea', '#61e1c1', '#f6d34e', '#ff7f9a'],
    ],
    transmission: 0.26,
  },
  'boulder-opal': {
    renderStone: 'sunset',
    bodies: ['#523528', '#674232', '#493832'],
    flashes: [
      ['#36c9ef', '#4ee598', '#ffb43f', '#ff655a'],
      ['#2d8eff', '#48e0bd', '#efce42', '#ee6a4e'],
      ['#5bd5e8', '#7ce66b', '#ff874d', '#9b76ff'],
    ],
    transmission: 0.02,
  },
  'fire-opal': {
    renderStone: 'sunset',
    bodies: ['#d55a32', '#e27838', '#bd432d'],
    flashes: [
      ['#ffbf38', '#ff7046', '#f6e75a', '#55df9d'],
      ['#ff8b3d', '#ffd54a', '#ee554b', '#7ce3b4'],
      ['#ffc04d', '#f05f47', '#e8df57', '#5bd6cb'],
    ],
    transmission: 0.12,
  },
  'matrix-opal': {
    renderStone: 'lightning',
    bodies: ['#3b2d29', '#49362e', '#2e2927'],
    flashes: [
      ['#2bcfe5', '#51df89', '#f2b740', '#e95c55'],
      ['#3c82f5', '#48d9b0', '#e4cc48', '#f16e49'],
      ['#56cfe2', '#74de69', '#ec9548', '#8b70ed'],
    ],
    transmission: 0.01,
  },
  'opal-doublet': {
    renderStone: 'lightning',
    bodies: ['#0a1d29', '#122936', '#172331'],
    flashes: [
      ['#1cdbec', '#44ef8a', '#385dff', '#ffcf45'],
      ['#278cf7', '#42dfb7', '#ae6fff', '#f05d79'],
      ['#22c9e5', '#60e276', '#ffb43f', '#566aff'],
    ],
    transmission: 0.015,
  },
}

function hashString(value: string): number {
  let hash = 2166136261
  for (const character of value) {
    hash ^= character.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function isBuilderEligibleOpal(
  slug: string,
  name: string,
  fields?: BuilderVisualFields
): boolean {
  if (!name || classifyOpalListing(name) !== 'individual') return false

  const reviewed = reviewedProfileFor(slug)
  if (!fields) return Boolean(reviewed)

  const cataloguePhoto = cataloguePhotoProfiles[reviewedSlugAliases[slug] ?? slug]
  const fallbackAspectRatio =
    reviewed?.aspectRatio ?? cataloguePhoto?.aspectRatio ?? inferSilhouette(name).aspectRatio
  return Boolean(cmsReviewedProfile(fields, fallbackAspectRatio))
}

function inferSilhouette(
  name: string
): Pick<VisualProfile, 'silhouette' | 'aspectRatio' | 'evidence' | 'recommendedStyle'> {
  if (/\bheart\b/i.test(name)) {
    return {
      silhouette: 'heart',
      aspectRatio: 1,
      evidence: 'catalogue',
      recommendedStyle: 'coral',
    }
  }
  if (/(pear|teardrop)/i.test(name)) {
    return {
      silhouette: 'pear',
      aspectRatio: 1.38,
      evidence: 'catalogue',
      recommendedStyle: 'aurora',
    }
  }
  if (/(round)/i.test(name)) {
    return {
      silhouette: 'round',
      aspectRatio: 1,
      evidence: 'catalogue',
      recommendedStyle: 'gemini',
    }
  }
  if (/(long|elongated)/i.test(name)) {
    return {
      silhouette: 'elongated',
      aspectRatio: 1.62,
      evidence: 'catalogue',
      recommendedStyle: 'gemini',
    }
  }
  if (/oval/i.test(name)) {
    return {
      silhouette: 'oval',
      aspectRatio: 1.3,
      evidence: 'catalogue',
      recommendedStyle: 'gemini',
    }
  }
  return {
    silhouette: 'oval',
    aspectRatio: 1.3,
    evidence: 'type-fallback',
    recommendedStyle: 'gemini',
  }
}

function completeDimensions(
  fields?: BuilderVisualFields
): VisualProfile['dimensionsMm'] | undefined {
  return parseBuilderDimensions(fields?.dimensions)
}

export function createOpalVisualProfile(
  slug: string,
  name: string,
  stoneType: string,
  fields?: BuilderVisualFields
): { renderStone: RingConfig['stone']; visual: VisualProfile } {
  const seed = hashString(`${slug}:${name}`)
  const profile = typeProfiles[stoneType] ?? typeProfiles['crystal-opal']!
  const silhouette = inferSilhouette(name)
  const reviewed = reviewedProfileFor(slug)
  const cataloguePhoto = cataloguePhotoProfiles[reviewedSlugAliases[slug] ?? slug]
  const fallbackProfile = reviewed ?? cataloguePhoto ?? silhouette
  const managed = cmsReviewedProfile(fields, fallbackProfile.aspectRatio)
  const imageCandidate = auditedImageCandidate(slug, fields)
  const mappingApproved =
    !fields ||
    fields.builderMappingStatus === 'reviewed' ||
    fields.builderMappingStatus === 'manual'
  const approvedReviewed = mappingApproved ? reviewed : undefined
  const approvedCataloguePhoto = mappingApproved ? cataloguePhoto : undefined
  const dimensionsMm = completeDimensions(fields)
  const baseVisual = managed ?? approvedReviewed ?? approvedCataloguePhoto ?? silhouette
  const baseContour =
    'contour' in baseVisual ? parseBuilderStoneContour(baseVisual.contour) : undefined
  // A contour and its photo crop are one calibration. Never combine a stale
  // CMS crop with a different outline: prefer a complete reviewed CMS pair,
  // then an analyzed candidate pair, then the audited catalogue fallback.
  const pairedContourProfile = managed?.contour
    ? managed
    : imageCandidate?.contour
      ? imageCandidate
      : approvedCataloguePhoto?.contour
        ? approvedCataloguePhoto
        : undefined
  const pairedContour = parseBuilderStoneContour(pairedContourProfile?.contour)
  const usesIndividualPhoto = classifyOpalListing(name) === 'individual'
  const baseTextureCrop =
    pairedContourProfile?.textureCrop ??
    managed?.textureCrop ??
    imageCandidate?.textureCrop ??
    approvedReviewed?.textureCrop ??
    approvedCataloguePhoto?.textureCrop
  const basePhotoFit =
    pairedContourProfile?.photoFit ??
    managed?.photoFit ??
    imageCandidate?.photoFit ??
    approvedReviewed?.photoFit ??
    approvedCataloguePhoto?.photoFit
  const estimatedTextureCrop = baseTextureCrop
    ? { ...baseTextureCrop, zoom: Math.max(baseTextureCrop.zoom, ESTIMATED_OPAL_PHOTO_ZOOM) }
    : { focalX: 0.5, focalY: 0.5, zoom: ESTIMATED_OPAL_PHOTO_ZOOM }
  const bodyColour = profile.bodies[seed % profile.bodies.length] ?? profile.bodies[0]!
  const flashColours = profile.flashes[(seed >>> 4) % profile.flashes.length] ?? profile.flashes[0]!

  return {
    renderStone: profile.renderStone,
    visual: {
      ...baseVisual,
      bodyColour: managed?.bodyColour ?? approvedReviewed?.bodyColour ?? bodyColour,
      flashColours: managed?.flashColours ?? flashColours,
      transmission: managed?.transmission ?? profile.transmission,
      patternSeed: seed,
      contour: pairedContour ?? baseContour,
      dimensionsMm: managed?.dimensionsMm ?? approvedReviewed?.dimensionsMm ?? dimensionsMm,
      textureCrop: usesIndividualPhoto
        ? basePhotoFit === 'reviewed'
          ? baseTextureCrop
          : estimatedTextureCrop
        : undefined,
      photoFit: usesIndividualPhoto ? (basePhotoFit ?? 'estimated') : undefined,
    },
  }
}
