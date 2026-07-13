import { z } from 'zod'

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
  opalScale: z.number().min(0.75).max(2.25),
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
    recommendedStyle: RingConfig['style']
    textureCrop?: {
      focalX: number
      focalY: number
      zoom: number
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
}

export interface RingStyleFit {
  kind: 'original' | 'adapted'
  label: string
}

export interface RingStyleGeometryProfile {
  contourLean: number
  contourWave: number
  contourWaveFrequency: number
  contourWavePhase: number
  bezelWallOffset: number
  bezelWallThickness: number
  bezelLipOffset: number
  bezelLipRadius: number
  haloOffset: number
  beadRadius: number
  beadCount: number
  beadPitchMm: number
  beadFlattening: number
  beadRoughness: number
  beadVariation: number
  haloPhase: number
  haloSupportCoverage: number
  innerSeamOffset: number
  innerSeamRadius: number
  innerSeamVariation: number
  joinInsetFactor: number
  joinLiftFactor: number
  shoulderLead: number
  shoulderBlend: number
  crossSectionPower: number
  metalRoughness: number
  shankRadius: number
  shankDepth: number
  shoulderRadius: number
  shoulderDepth: number
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
    contourLean: 0.012,
    contourWave: 0.012,
    contourWaveFrequency: 3,
    contourWavePhase: 0.55,
    bezelWallOffset: 0.032,
    bezelWallThickness: 0.056,
    bezelLipOffset: 0.014,
    bezelLipRadius: 0.013,
    haloOffset: 0,
    beadRadius: 0,
    beadCount: 0,
    beadPitchMm: 0,
    beadFlattening: 0.7,
    beadRoughness: 0.34,
    beadVariation: 0,
    haloPhase: 0,
    haloSupportCoverage: 0,
    innerSeamOffset: 0.003,
    innerSeamRadius: 0.0045,
    innerSeamVariation: 0.001,
    joinInsetFactor: 1.25,
    joinLiftFactor: -0.4,
    shoulderLead: 0.075,
    shoulderBlend: 0.08,
    crossSectionPower: 0.9,
    metalRoughness: 0.31,
    shankRadius: 0.102,
    shankDepth: 0.06,
    shoulderRadius: 0.108,
    shoulderDepth: 0.066,
  },
  coral: {
    contourLean: -0.008,
    contourWave: 0.016,
    contourWaveFrequency: 3,
    contourWavePhase: 1.15,
    bezelWallOffset: 0.032,
    bezelWallThickness: 0.052,
    bezelLipOffset: 0.01,
    bezelLipRadius: 0.014,
    haloOffset: 0,
    beadRadius: 0,
    beadCount: 0,
    beadPitchMm: 0,
    beadFlattening: 0.7,
    beadRoughness: 0.34,
    beadVariation: 0,
    haloPhase: 0,
    haloSupportCoverage: 0,
    innerSeamOffset: 0.001,
    innerSeamRadius: 0.008,
    innerSeamVariation: 0.0025,
    joinInsetFactor: 1.25,
    joinLiftFactor: -0.4,
    shoulderLead: 0.065,
    shoulderBlend: 0.08,
    crossSectionPower: 0.9,
    metalRoughness: 0.31,
    shankRadius: 0.094,
    shankDepth: 0.052,
    shoulderRadius: 0.099,
    shoulderDepth: 0.058,
  },
  'sun-moon': {
    contourLean: 0.016,
    contourWave: 0.014,
    contourWaveFrequency: 5,
    contourWavePhase: -0.35,
    bezelWallOffset: 0.028,
    bezelWallThickness: 0.05,
    bezelLipOffset: 0.014,
    bezelLipRadius: 0.013,
    haloOffset: 0.095,
    beadRadius: 0.042,
    beadCount: 34,
    beadPitchMm: 1.06,
    beadFlattening: 0.68,
    beadRoughness: 0.34,
    beadVariation: 0.55,
    haloPhase: -Math.PI / 2,
    haloSupportCoverage: 0.15,
    innerSeamOffset: 0.003,
    innerSeamRadius: 0.0045,
    innerSeamVariation: 0.001,
    joinInsetFactor: 1.25,
    joinLiftFactor: -0.4,
    shoulderLead: 0.03,
    shoulderBlend: 0.075,
    crossSectionPower: 0.9,
    metalRoughness: 0.25,
    shankRadius: 0.096,
    shankDepth: 0.05,
    shoulderRadius: 0.102,
    shoulderDepth: 0.055,
  },
  aurora: {
    contourLean: -0.032,
    contourWave: 0.022,
    contourWaveFrequency: 3,
    contourWavePhase: 0.8,
    bezelWallOffset: 0.028,
    bezelWallThickness: 0.05,
    bezelLipOffset: 0.014,
    bezelLipRadius: 0.013,
    haloOffset: 0.086,
    beadRadius: 0.046,
    beadCount: 28,
    beadPitchMm: 1.1,
    beadFlattening: 0.76,
    beadRoughness: 0.4,
    beadVariation: 1.35,
    haloPhase: -Math.PI / 2,
    haloSupportCoverage: 0.15,
    innerSeamOffset: 0.003,
    innerSeamRadius: 0.0045,
    innerSeamVariation: 0.001,
    joinInsetFactor: 1.25,
    joinLiftFactor: -0.4,
    shoulderLead: 0.03,
    shoulderBlend: 0.075,
    crossSectionPower: 0.9,
    metalRoughness: 0.25,
    shankRadius: 0.106,
    shankDepth: 0.052,
    shoulderRadius: 0.112,
    shoulderDepth: 0.057,
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
  { id: 'beaded', label: 'Bezel with bead halo', detail: 'Full bezel and handmade silver pearls' },
]

export const bands: readonly ConfigOption<RingConfig['band']>[] = [
  { id: 'classic', label: 'Classic', detail: 'Thin single shank used across the collection' },
]

export const ringStyles: readonly RingStyleOption[] = [
  {
    id: 'gemini',
    label: 'Gemini',
    detail: 'Clean raised bezel with a broad rounded shank',
    shape: 'oval',
    setting: 'bezel',
    band: 'classic',
    referenceName: 'White Opal Gemini Ring',
    referenceImage: '/images/products/20210819_101941.jpg',
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
  },
]

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
  const original = style.shape === silhouette

  return original
    ? { kind: 'original', label: 'Reference proportions' }
    : { kind: 'adapted', label: `Adapted to ${silhouette} opal` }
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
    opalScale: boundedNumber(values[queryKeys.opalScale], defaultRingConfig.opalScale, 0.75, 2.25),
    opalRotation: boundedNumber(
      values[queryKeys.opalRotation],
      defaultRingConfig.opalRotation,
      -180,
      180
    ),
  }
  return ringConfigSchema.parse(candidate)
}
