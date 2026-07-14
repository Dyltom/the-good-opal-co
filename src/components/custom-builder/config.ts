import { z } from 'zod'
import type { BuilderStoneContourV1 } from '@/lib/custom-builder/stone-contour'

export const metalIds = [
  'sterling-silver',
  '14k-gold',
  '18k-gold',
  'white-gold',
  'rose-gold',
  'platinum',
] as const
export const stoneIds = ['blue-green', 'sunset', 'lightning', 'crystal'] as const
export const shapeIds = ['oval', 'round', 'elongated', 'cushion', 'pear', 'heart'] as const
export const settingIds = ['bezel', 'beaded'] as const
export const bandIds = ['classic'] as const
export const styleIds = ['gemini', 'coral', 'sun-moon', 'aurora'] as const

export const ringConfigSchema = z.object({
  metal: z.enum(metalIds),
  stone: z.enum(stoneIds),
  style: z.enum(styleIds),
  shape: z.enum(shapeIds),
  setting: z.enum(settingIds),
  band: z.enum(bandIds),
  size: z.number().min(4).max(13),
  opalId: z.string().trim().max(30).optional(),
  opalPositionX: z.number().min(-0.45).max(0.45),
  opalPositionY: z.number().min(-0.45).max(0.45),
  opalScale: z.number().min(1).max(2.25),
  opalRotation: z.number().min(-180).max(180),
})

export type RingConfig = z.infer<typeof ringConfigSchema>

export type OpalPlacement = Pick<
  RingConfig,
  'opalPositionX' | 'opalPositionY' | 'opalScale' | 'opalRotation'
>

export const defaultOpalPlacement: OpalPlacement = {
  opalPositionX: 0,
  opalPositionY: 0,
  opalScale: 1,
  opalRotation: 0,
}

export function opalPlacementFromConfig(config: RingConfig): OpalPlacement {
  return {
    opalPositionX: config.opalPositionX,
    opalPositionY: config.opalPositionY,
    opalScale: config.opalScale,
    opalRotation: config.opalRotation,
  }
}

export interface BuilderOpal {
  id: string
  name: string
  slug: string
  imageUrl: string
  imageAlt: string
  price: number
  stoneType: string
  stoneTypeLabel: string
  originLabel?: string
  weight?: number
  selectionKind: 'individual' | 'assortment' | 'parcel' | 'specimen'
  renderStone: RingConfig['stone']
  visual: {
    silhouette: RingConfig['shape']
    aspectRatio: number
    bodyColour: string
    flashColours: readonly [string, ...string[]]
    transmission: number
    patternSeed: number
    evidence: 'catalogue' | 'type-fallback'
    photoFit?: 'reviewed' | 'estimated'
    contour?: BuilderStoneContourV1
    recommendedStyle: RingConfig['style']
    textureCrop?: {
      focalX: number
      focalY: number
      zoom: number
      rotation?: number
    }
    dimensionsMm?: {
      width: number
      length: number
      depth: number
    }
  }
}

export interface ConfigOption<T extends string> {
  id: T
  label: string
  detail: string
  colour?: string
}

export interface RingStyleOption extends ConfigOption<RingConfig['style']> {
  shape: RingConfig['shape']
  setting: RingConfig['setting']
  band: RingConfig['band']
  referenceName: string
  referenceImage: string
  referenceOpal: Pick<BuilderOpal, 'renderStone' | 'visual'>
}

export interface RingStyleFit {
  kind: 'original' | 'adapted'
  label: string
}

export interface RingStyleGeometryProfile {
  bezelLipProfile: readonly BezelLipProfileKnot[]
  bezelWallOffset: number
  bezelWallThickness: number
  bezelLipOffset: number
  bezelLipRadius: number
  haloOffset: number
  beadRadius: number
  beadCount: number
  beadPitchMm: number
  beadFlattening: number
  beadAsymmetry: number
  beadRoughness: number
  beadShape: 'granulated' | 'none' | 'nugget'
  beadPrimitive: 'none' | 'rounded-granule' | 'rough-nugget'
  beadVariation: number
  haloPhase: number
  haloSupportCoverage: number
  innerSeamOffset: number
  innerSeamRadius: number
  innerSeamVariation: number
  cupDepth: number
  cupTaper: number
  domeHeightRatio: number
  visibleSeatCap: number
  shoulderUnderlap: number
  shoulderJoinDrop: number
  shoulderTransition: number
  shoulderBlendLengthMm: number
  shoulderLandingLengthMm: number
  crossSectionPower: number
  shankInnerFacePower: number
  metalRoughness: number
  shankRadius: number
  shankDepth: number
  shoulderRadius: number
  shoulderDepth: number
  shankForgedVariation: number
}

export interface BezelLipProfileKnot {
  finish: 'metal' | 'patina'
  heightOffset: number
  radialProgress: number
}

export function getHaloSupportGeometry(
  profile: Pick<
    RingStyleGeometryProfile,
    'beadRadius' | 'bezelWallOffset' | 'bezelWallThickness' | 'haloOffset' | 'haloSupportCoverage'
  >
): { offset: number; thickness: number } {
  const bezelOuterOffset = profile.bezelWallOffset + profile.bezelWallThickness / 2
  const haloOuterOffset = profile.haloOffset + profile.beadRadius * profile.haloSupportCoverage
  const thickness = Math.max(0, haloOuterOffset - bezelOuterOffset)

  return {
    offset: bezelOuterOffset + thickness / 2,
    thickness,
  }
}

export const ringStyleGeometryProfiles: Record<RingConfig['style'], RingStyleGeometryProfile> = {
  gemini: {
    bezelLipProfile: [
      { radialProgress: 0, heightOffset: 0, finish: 'patina' },
      { radialProgress: 0.16, heightOffset: 0.003, finish: 'patina' },
      { radialProgress: 0.46, heightOffset: 0.002, finish: 'metal' },
      { radialProgress: 0.78, heightOffset: -0.001, finish: 'metal' },
      { radialProgress: 1, heightOffset: -0.005, finish: 'metal' },
    ],
    bezelWallOffset: 0.0185,
    bezelWallThickness: 0.036,
    bezelLipOffset: 0.002,
    bezelLipRadius: 0.012,
    haloOffset: 0,
    beadRadius: 0,
    beadCount: 0,
    beadPitchMm: 0,
    beadFlattening: 0.7,
    beadAsymmetry: 0,
    beadRoughness: 0.34,
    beadShape: 'none',
    beadPrimitive: 'none',
    beadVariation: 0,
    haloPhase: 0,
    haloSupportCoverage: 0,
    innerSeamOffset: 0.003,
    innerSeamRadius: 0.018,
    innerSeamVariation: 0.001,
    cupDepth: 0.048,
    cupTaper: 0.022,
    domeHeightRatio: 0.145,
    visibleSeatCap: 0.036,
    shoulderUnderlap: 0.16,
    shoulderJoinDrop: 0.022,
    shoulderTransition: 0.04,
    shoulderBlendLengthMm: 1.4,
    shoulderLandingLengthMm: 1.2,
    crossSectionPower: 0.72,
    shankInnerFacePower: 0.26,
    metalRoughness: 0.31,
    shankRadius: 0.088,
    shankDepth: 0.055,
    shoulderRadius: 0.094,
    shoulderDepth: 0.057,
    shankForgedVariation: 0.012,
  },
  coral: {
    bezelLipProfile: [
      { radialProgress: 0, heightOffset: 0, finish: 'patina' },
      { radialProgress: 0.3, heightOffset: -0.008, finish: 'patina' },
      { radialProgress: 0.75, heightOffset: -0.008, finish: 'patina' },
      { radialProgress: 0.81, heightOffset: 0.001, finish: 'metal' },
      { radialProgress: 1, heightOffset: -0.003, finish: 'metal' },
    ],
    bezelWallOffset: 0.031,
    bezelWallThickness: 0.058,
    bezelLipOffset: 0.002,
    bezelLipRadius: 0.012,
    haloOffset: 0,
    beadRadius: 0,
    beadCount: 0,
    beadPitchMm: 0,
    beadFlattening: 0.7,
    beadAsymmetry: 0,
    beadRoughness: 0.34,
    beadShape: 'none',
    beadPrimitive: 'none',
    beadVariation: 0,
    haloPhase: 0,
    haloSupportCoverage: 0,
    innerSeamOffset: 0.001,
    innerSeamRadius: 0.024,
    innerSeamVariation: 0.0025,
    cupDepth: 0.035,
    cupTaper: 0.02,
    domeHeightRatio: 0.11,
    visibleSeatCap: 0.06,
    shoulderUnderlap: 0.15,
    shoulderJoinDrop: 0.02,
    shoulderTransition: 0.038,
    shoulderBlendLengthMm: 1.3,
    shoulderLandingLengthMm: 1.1,
    crossSectionPower: 0.76,
    shankInnerFacePower: 0.24,
    metalRoughness: 0.31,
    shankRadius: 0.082,
    shankDepth: 0.047,
    shoulderRadius: 0.087,
    shoulderDepth: 0.049,
    shankForgedVariation: 0.016,
  },
  'sun-moon': {
    bezelLipProfile: [
      { radialProgress: 0, heightOffset: 0, finish: 'patina' },
      { radialProgress: 0.18, heightOffset: 0.002, finish: 'patina' },
      { radialProgress: 0.52, heightOffset: 0.001, finish: 'metal' },
      { radialProgress: 1, heightOffset: -0.005, finish: 'metal' },
    ],
    bezelWallOffset: 0.022,
    bezelWallThickness: 0.04,
    bezelLipOffset: 0.002,
    bezelLipRadius: 0.012,
    haloOffset: 0.099,
    beadRadius: 0.04,
    beadCount: 40,
    beadPitchMm: 0.84,
    beadFlattening: 0.48,
    beadAsymmetry: 0.08,
    beadRoughness: 0.62,
    beadShape: 'granulated',
    beadPrimitive: 'rounded-granule',
    beadVariation: 1.3,
    haloPhase: -Math.PI / 2,
    haloSupportCoverage: 0.58,
    innerSeamOffset: 0.003,
    innerSeamRadius: 0.018,
    innerSeamVariation: 0.001,
    cupDepth: 0.06,
    cupTaper: 0.026,
    domeHeightRatio: 0.135,
    visibleSeatCap: 0.044,
    shoulderUnderlap: 0.16,
    shoulderJoinDrop: 0.022,
    shoulderTransition: 0.042,
    shoulderBlendLengthMm: 1.5,
    shoulderLandingLengthMm: 1.3,
    crossSectionPower: 0.72,
    shankInnerFacePower: 0.27,
    metalRoughness: 0.25,
    shankRadius: 0.086,
    shankDepth: 0.05,
    shoulderRadius: 0.092,
    shoulderDepth: 0.052,
    shankForgedVariation: 0.013,
  },
  aurora: {
    bezelLipProfile: [
      { radialProgress: 0, heightOffset: 0, finish: 'patina' },
      { radialProgress: 0.2, heightOffset: 0.002, finish: 'patina' },
      { radialProgress: 0.58, heightOffset: 0, finish: 'metal' },
      { radialProgress: 1, heightOffset: -0.006, finish: 'metal' },
    ],
    bezelWallOffset: 0.022,
    bezelWallThickness: 0.042,
    bezelLipOffset: 0.002,
    bezelLipRadius: 0.012,
    haloOffset: 0.095,
    beadRadius: 0.047,
    beadCount: 28,
    beadPitchMm: 1.12,
    beadFlattening: 0.58,
    beadAsymmetry: 0.18,
    beadRoughness: 0.6,
    beadShape: 'nugget',
    beadPrimitive: 'rough-nugget',
    beadVariation: 1.9,
    haloPhase: -Math.PI / 2,
    haloSupportCoverage: 0.6,
    innerSeamOffset: 0.003,
    innerSeamRadius: 0.02,
    innerSeamVariation: 0.001,
    cupDepth: 0.065,
    cupTaper: 0.03,
    domeHeightRatio: 0.155,
    visibleSeatCap: 0.028,
    shoulderUnderlap: 0.17,
    shoulderJoinDrop: 0.024,
    shoulderTransition: 0.045,
    shoulderBlendLengthMm: 1.5,
    shoulderLandingLengthMm: 1.3,
    crossSectionPower: 0.7,
    shankInnerFacePower: 0.22,
    metalRoughness: 0.25,
    shankRadius: 0.089,
    shankDepth: 0.052,
    shoulderRadius: 0.095,
    shoulderDepth: 0.054,
    shankForgedVariation: 0.017,
  },
}

export const metals: readonly ConfigOption<RingConfig['metal']>[] = [
  {
    id: 'sterling-silver',
    label: 'Sterling silver',
    detail: 'Bright, cool finish',
    colour: '#d8d8d4',
  },
  { id: '14k-gold', label: '14K gold', detail: 'Warm yellow gold', colour: '#d4a846' },
  { id: '18k-gold', label: '18K gold', detail: 'Richer yellow gold', colour: '#d9ad42' },
  { id: 'white-gold', label: 'White gold', detail: 'Cool polished finish', colour: '#ddd9cf' },
  { id: 'rose-gold', label: 'Rose gold', detail: 'Soft blush tone', colour: '#c98f7a' },
  { id: 'platinum', label: 'Platinum', detail: 'Dense pale lustre', colour: '#e4e3df' },
]

export const stones: readonly ConfigOption<RingConfig['stone']>[] = [
  { id: 'blue-green', label: 'Blue-green', detail: 'Ocean colour play', colour: '#34b9b2' },
  { id: 'sunset', label: 'Sunset fire', detail: 'Coral and gold flashes', colour: '#ee8068' },
  { id: 'lightning', label: 'Lightning Ridge', detail: 'Deep body tone', colour: '#173350' },
  { id: 'crystal', label: 'Crystal opal', detail: 'Luminous and pale', colour: '#bce7df' },
]

export const shapes: readonly ConfigOption<RingConfig['shape']>[] = [
  { id: 'oval', label: 'Oval', detail: 'Classic balance' },
  { id: 'round', label: 'Round', detail: 'Bright symmetry' },
  { id: 'elongated', label: 'Long oval', detail: 'Elegant length' },
  { id: 'cushion', label: 'Cushion', detail: 'Softened square profile' },
  { id: 'pear', label: 'Pear', detail: 'Tapered teardrop profile' },
  { id: 'heart', label: 'Heart', detail: 'Carved double-lobed profile' },
]

export const settings: readonly ConfigOption<RingConfig['setting']>[] = [
  { id: 'bezel', label: 'Full bezel', detail: 'Continuous protective rim' },
  { id: 'beaded', label: 'Bezel with grain halo', detail: 'Full bezel and handmade silver grains' },
]

export const bands: readonly ConfigOption<RingConfig['band']>[] = [
  { id: 'classic', label: 'Classic', detail: 'Thin single shank used across the collection' },
]

export const ringStyles: readonly RingStyleOption[] = [
  {
    id: 'gemini',
    label: 'Gemini',
    detail: 'Clean narrow bezel with a slim forged shank',
    shape: 'oval',
    setting: 'bezel',
    band: 'classic',
    referenceName: 'White Opal Gemini Ring',
    referenceImage: '/images/products/20210819_101941.jpg',
    referenceOpal: {
      renderStone: 'sunset',
      visual: {
        silhouette: 'oval',
        aspectRatio: 1.25,
        bodyColour: '#cbb8ae',
        flashColours: ['#ff5b4d', '#ffe04f', '#4cff8d', '#52a5ff'],
        transmission: 0.2,
        patternSeed: 19,
        evidence: 'catalogue',
        photoFit: 'reviewed',
        recommendedStyle: 'gemini',
        textureCrop: { focalX: 0.528, focalY: 0.524, zoom: 8.2 },
        dimensionsMm: { width: 8, length: 10, depth: 3 },
      },
    },
  },
  {
    id: 'coral',
    label: 'Coral',
    detail: 'Square handmade bezel with a low dainty shank',
    shape: 'cushion',
    setting: 'bezel',
    band: 'classic',
    referenceName: 'Crystal Black Opal Coral Ring',
    referenceImage: '/images/products/20210819_101746.jpg',
    referenceOpal: {
      renderStone: 'lightning',
      visual: {
        silhouette: 'cushion',
        aspectRatio: 1,
        bodyColour: '#0c3152',
        flashColours: ['#2b65ff', '#35e873', '#0ed8e7'],
        transmission: 0.06,
        patternSeed: 29,
        evidence: 'catalogue',
        photoFit: 'reviewed',
        recommendedStyle: 'coral',
        textureCrop: { focalX: 0.503, focalY: 0.487, zoom: 6.26 },
        dimensionsMm: { width: 10, length: 10, depth: 3 },
      },
    },
  },
  {
    id: 'sun-moon',
    label: 'Sun & Moon',
    detail: 'Tight halo of small handmade silver grains',
    shape: 'oval',
    setting: 'beaded',
    band: 'classic',
    referenceName: 'Crystal Opal Sun and Moon Ring',
    referenceImage: '/images/products/20210819_102749.jpg',
    referenceOpal: {
      renderStone: 'crystal',
      visual: {
        silhouette: 'oval',
        aspectRatio: 1.25,
        bodyColour: '#c9cec5',
        flashColours: ['#72ff55', '#ffd93d', '#57b9ff', '#ff746d'],
        transmission: 0.26,
        patternSeed: 41,
        evidence: 'catalogue',
        photoFit: 'reviewed',
        recommendedStyle: 'sun-moon',
        textureCrop: { focalX: 0.5, focalY: 0.49, zoom: 7.5 },
        dimensionsMm: { width: 8, length: 10, depth: 3 },
      },
    },
  },
  {
    id: 'aurora',
    label: 'Aurora',
    detail: 'Larger irregular silver grains around the stone',
    shape: 'pear',
    setting: 'beaded',
    band: 'classic',
    referenceName: 'Aurora Opal Ring',
    referenceImage: '/images/products/20210819_102625-1.jpg',
    referenceOpal: {
      renderStone: 'blue-green',
      visual: {
        silhouette: 'pear',
        aspectRatio: 1.25,
        bodyColour: '#56c8d3',
        flashColours: ['#35dcf0', '#ff7b78', '#637dff', '#5fe29c'],
        transmission: 0.16,
        patternSeed: 53,
        evidence: 'catalogue',
        photoFit: 'reviewed',
        recommendedStyle: 'aurora',
        textureCrop: { focalX: 0.5, focalY: 0.486, zoom: 8.45 },
        dimensionsMm: { width: 8, length: 10, depth: 3 },
      },
    },
  },
]

export function getRingStyleReferenceOpal(styleId: RingConfig['style']): BuilderOpal {
  const style = ringStyles.find((option) => option.id === styleId) ?? ringStyles[0]!
  return {
    id: `reference-${style.id}`,
    name: style.referenceName,
    slug: `reference-${style.id}`,
    imageUrl: style.referenceImage,
    imageAlt: `${style.referenceName} sold-ring opal`,
    price: 0,
    stoneType: 'opal',
    stoneTypeLabel: 'Sold-ring reference opal',
    selectionKind: 'individual',
    ...style.referenceOpal,
  }
}

export const defaultRingConfig: RingConfig = {
  metal: 'sterling-silver',
  stone: 'blue-green',
  style: 'gemini',
  shape: 'oval',
  setting: 'bezel',
  band: 'classic',
  size: 7,
  ...defaultOpalPlacement,
}

export function applyRingStyle(config: RingConfig, styleId: RingConfig['style']): RingConfig {
  const style = ringStyles.find((option) => option.id === styleId) ?? ringStyles[0]!
  return {
    ...config,
    style: style.id,
    shape: style.shape,
    setting: style.setting,
    band: style.band,
  }
}

export function getRingStyleFit(
  styleId: RingConfig['style'],
  opal: Pick<BuilderOpal, 'visual'>
): RingStyleFit {
  const style = ringStyles.find((option) => option.id === styleId) ?? ringStyles[0]!
  const silhouette = opal.visual.silhouette
  if (style.shape !== silhouette) {
    return { kind: 'adapted', label: `Adapted to ${silhouette} opal` }
  }

  const dimensions = opal.visual.dimensionsMm
  if (!dimensions) return { kind: 'original', label: 'Reference silhouette' }

  const referenceDimensions: Record<RingConfig['style'], readonly [number, number]> = {
    aurora: [8, 10],
    coral: [10, 10],
    gemini: [8, 10],
    'sun-moon': [8, 10],
  }
  const [referenceWidth, referenceLength] = referenceDimensions[style.id]
  const withinReferenceProportions =
    Math.abs(dimensions.width / referenceWidth - 1) <= 0.1 &&
    Math.abs(dimensions.length / referenceLength - 1) <= 0.1

  return withinReferenceProportions
    ? { kind: 'original', label: 'Reference proportions' }
    : { kind: 'adapted', label: 'Adapted proportions' }
}

export function shapeForOpal(opal: BuilderOpal): RingConfig['shape'] {
  return opal.visual.silhouette === 'elongated' ? 'elongated' : opal.visual.silhouette
}

function labelFor<T extends string>(options: readonly ConfigOption<T>[], id: T): string {
  return options.find((option) => option.id === id)?.label ?? id
}

export function describeRingConfig(config: RingConfig, opalName?: string): string {
  return [
    opalName ??
      `${labelFor(shapes, config.shape)} ${labelFor(stones, config.stone).toLowerCase()} opal`,
    `${labelFor(ringStyles, config.style)} design`,
    labelFor(metals, config.metal).toLowerCase(),
    `size ${config.size}`,
  ].join(', ')
}

const queryKeys: Record<keyof RingConfig, string> = {
  metal: 'm',
  stone: 'o',
  style: 'y',
  shape: 's',
  setting: 't',
  band: 'b',
  size: 'z',
  opalId: 'p',
  opalPositionX: 'px',
  opalPositionY: 'py',
  opalScale: 'ps',
  opalRotation: 'pr',
}

export function ringConfigToSearchParams(config: RingConfig): URLSearchParams {
  const params = new URLSearchParams()
  params.set(queryKeys.metal, config.metal)
  params.set(queryKeys.stone, config.stone)
  params.set(queryKeys.style, config.style)
  params.set(queryKeys.shape, config.shape)
  params.set(queryKeys.setting, config.setting)
  params.set(queryKeys.band, config.band)
  params.set(queryKeys.size, String(config.size))
  if (config.opalId) params.set(queryKeys.opalId, config.opalId)
  if (config.opalPositionX !== 0) params.set(queryKeys.opalPositionX, String(config.opalPositionX))
  if (config.opalPositionY !== 0) params.set(queryKeys.opalPositionY, String(config.opalPositionY))
  if (config.opalScale !== 1) params.set(queryKeys.opalScale, String(config.opalScale))
  if (config.opalRotation !== 0) params.set(queryKeys.opalRotation, String(config.opalRotation))
  return params
}

export function mergeRingConfigSearchParams(
  existing: URLSearchParams,
  config: RingConfig
): URLSearchParams {
  const merged = new URLSearchParams(existing)
  for (const key of Object.values(queryKeys)) merged.delete(key)
  for (const [key, value] of ringConfigToSearchParams(config)) merged.set(key, value)
  return merged
}

export function ringConfigFromRecord(values: Record<string, string | undefined>): RingConfig {
  function optionValue<T extends string>(
    options: readonly T[],
    value: string | undefined,
    fallback: T
  ): T {
    return options.some((option) => option === value) ? (value as T) : fallback
  }

  function boundedNumber(
    value: string | undefined,
    fallback: number,
    minimum: number,
    maximum: number
  ): number {
    if (value === undefined) return fallback
    const number = Number(value)
    return Number.isFinite(number) && number >= minimum && number <= maximum ? number : fallback
  }

  const requestedStyle = optionValue(styleIds, values[queryKeys.style], defaultRingConfig.style)
  const style = ringStyles.find((option) => option.id === requestedStyle) ?? ringStyles[0]!
  const opalId = z.string().trim().min(1).max(30).safeParse(values[queryKeys.opalId])
  const candidate = {
    metal: optionValue(metalIds, values[queryKeys.metal], defaultRingConfig.metal),
    stone: optionValue(stoneIds, values[queryKeys.stone], defaultRingConfig.stone),
    style: style.id,
    shape: optionValue(shapeIds, values[queryKeys.shape], style.shape),
    setting: style.setting,
    band: style.band,
    size: boundedNumber(values[queryKeys.size], defaultRingConfig.size, 4, 13),
    opalId: opalId.success ? opalId.data : undefined,
    opalPositionX: boundedNumber(
      values[queryKeys.opalPositionX],
      defaultRingConfig.opalPositionX,
      -0.45,
      0.45
    ),
    opalPositionY: boundedNumber(
      values[queryKeys.opalPositionY],
      defaultRingConfig.opalPositionY,
      -0.45,
      0.45
    ),
    opalScale: boundedNumber(values[queryKeys.opalScale], defaultRingConfig.opalScale, 1, 2.25),
    opalRotation: boundedNumber(
      values[queryKeys.opalRotation],
      defaultRingConfig.opalRotation,
      -180,
      180
    ),
  }
  return ringConfigSchema.parse(candidate)
}
