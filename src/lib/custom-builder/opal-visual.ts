import type { BuilderOpal, RingConfig } from '@/components/custom-builder/config'

type VisualProfile = BuilderOpal['visual']

export interface BuilderVisualFields {
  builderEligible?: boolean | null
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
  dimensions?: {
    width?: number | null
    length?: number | null
    depth?: number | null
  } | null
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
  >
> = {
  'lightning-ridge-white-opal-1-05-cts': {
    silhouette: 'oval',
    aspectRatio: 7 / 6,
    evidence: 'catalogue',
    recommendedStyle: 'gemini',
    textureCrop: { focalX: 0.507, focalY: 0.495, zoom: 3.08 },
    bodyColour: '#d7dcc9',
    dimensionsMm: { width: 6, length: 7, depth: 3 },
  },
  'mintabie-semi-black-opal-1-05-cts': {
    silhouette: 'oval',
    aspectRatio: 1.3,
    evidence: 'catalogue',
    recommendedStyle: 'gemini',
    textureCrop: { focalX: 0.504, focalY: 0.487, zoom: 4.81 },
    bodyColour: '#a8c4b8',
    dimensionsMm: { width: 5, length: 6.5, depth: 3.5 },
  },
  'mintabie-semi-black-opal-1-35-cts': {
    silhouette: 'oval',
    aspectRatio: 8 / 7,
    evidence: 'catalogue',
    recommendedStyle: 'gemini',
    textureCrop: { focalX: 0.501, focalY: 0.493, zoom: 3.61 },
    bodyColour: '#cbd5c7',
    dimensionsMm: { width: 7, length: 8, depth: 3.5 },
  },
  'queensland-crystal-pipe-opal-1-45-cts': {
    silhouette: 'elongated',
    aspectRatio: 9.5 / 5.3,
    evidence: 'catalogue',
    recommendedStyle: 'gemini',
    textureCrop: { focalX: 0.517, focalY: 0.466, zoom: 4.74 },
    bodyColour: '#78c5df',
    dimensionsMm: { width: 5.3, length: 9.5, depth: 2.5 },
  },
}

const reviewedSlugAliases: Record<string, keyof typeof reviewedProfiles> = {
  'lightning-ridge-white-opal-105-ct': 'lightning-ridge-white-opal-1-05-cts',
  'mintabie-semi-black-opal-105-cts': 'mintabie-semi-black-opal-1-05-cts',
  'mintabie-semi-black-opal-135-cts': 'mintabie-semi-black-opal-1-35-cts',
  'queensland-crystal-pipe-opal-105-cts': 'queensland-crystal-pipe-opal-1-45-cts',
}

const reviewedPhotoBySlug: Record<keyof typeof reviewedProfiles, string> = {
  'lightning-ridge-white-opal-1-05-cts': '/images/products/20211104_234659-1-1.jpg',
  'mintabie-semi-black-opal-1-05-cts': '/images/products/20210923_174046.jpg',
  'mintabie-semi-black-opal-1-35-cts': '/images/products/20210923_173846-1.jpg',
  'queensland-crystal-pipe-opal-1-45-cts': '/images/products/20211012_173649.jpg',
}

export function reviewedOpalImageUrl(slug: string): string | undefined {
  const reviewedSlug = reviewedSlugAliases[slug] ?? slug
  return reviewedPhotoBySlug[reviewedSlug]
}

function reviewedProfileFor(slug: string): (typeof reviewedProfiles)[string] | undefined {
  return reviewedProfiles[reviewedSlugAliases[slug] ?? slug]
}

const validSilhouettes = new Set<RingConfig['shape']>([
  'oval',
  'round',
  'elongated',
  'cushion',
  'pear',
])
const validStyles = new Set<RingConfig['style']>(['gemini', 'coral', 'sun-moon', 'aurora'])
const hexColourPattern = /^#[0-9a-f]{6}$/i

function cmsReviewedProfile(fields?: BuilderVisualFields): VisualProfile | undefined {
  if (!fields?.builderEligible) return undefined

  const silhouette = fields.builderSilhouette
  const recommendedStyle = fields.builderRecommendedStyle
  const dimensions = fields.dimensions
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
    typeof fields.builderPhotoFocalX !== 'number' ||
    typeof fields.builderPhotoFocalY !== 'number' ||
    typeof fields.builderPhotoZoom !== 'number' ||
    typeof dimensions?.width !== 'number' ||
    typeof dimensions.length !== 'number' ||
    typeof dimensions.depth !== 'number' ||
    dimensions.width <= 0 ||
    dimensions.length <= 0 ||
    dimensions.depth <= 0
  ) {
    return undefined
  }

  return {
    silhouette: silhouette as RingConfig['shape'],
    aspectRatio: dimensions.length / dimensions.width,
    evidence: 'catalogue',
    recommendedStyle: recommendedStyle as RingConfig['style'],
    textureCrop: {
      focalX: fields.builderPhotoFocalX,
      focalY: fields.builderPhotoFocalY,
      zoom: fields.builderPhotoZoom,
    },
    bodyColour: fields.builderBodyColour,
    flashColours: colours as [string, string, string],
    transmission: fields.builderTransmission,
    patternSeed: 0,
    dimensionsMm: {
      width: dimensions.width,
      length: dimensions.length,
      depth: dimensions.depth,
    },
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
  return Boolean(name) && Boolean(cmsReviewedProfile(fields) ?? reviewedProfileFor(slug))
}

function inferSilhouette(
  name: string
): Pick<VisualProfile, 'silhouette' | 'aspectRatio' | 'evidence' | 'recommendedStyle'> {
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
  const managed = cmsReviewedProfile(fields)
  const bodyColour = profile.bodies[seed % profile.bodies.length] ?? profile.bodies[0]!
  const flashColours = profile.flashes[(seed >>> 4) % profile.flashes.length] ?? profile.flashes[0]!

  return {
    renderStone: profile.renderStone,
    visual: {
      ...(managed ?? reviewed ?? silhouette),
      bodyColour: managed?.bodyColour ?? reviewed?.bodyColour ?? bodyColour,
      flashColours: managed?.flashColours ?? flashColours,
      transmission: managed?.transmission ?? profile.transmission,
      patternSeed: seed,
    },
  }
}
