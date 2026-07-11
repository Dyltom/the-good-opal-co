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
export const shapeIds = ['oval', 'round', 'elongated', 'cushion', 'pear'] as const
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
})

export type RingConfig = z.infer<typeof ringConfigSchema>

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
  renderStone: RingConfig['stone']
  visual: {
    silhouette: RingConfig['shape']
    aspectRatio: number
    bodyColour: string
    flashColours: readonly [string, ...string[]]
    transmission: number
    patternSeed: number
    evidence: 'catalogue' | 'type-fallback'
    recommendedStyle: RingConfig['style']
    textureCrop?: {
      focalX: number
      focalY: number
      zoom: number
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

export interface RingStyleGeometryProfile {
  bezelWallOffset: number
  bezelLipOffset: number
  bezelLipRadius: number
  haloOffset: number
  beadRadius: number
  beadCount: number
  shankRadius: number
  shoulderRadius: number
}

export const ringStyleGeometryProfiles: Record<
  RingConfig['style'],
  RingStyleGeometryProfile
> = {
  gemini: {
    bezelWallOffset: 0.02,
    bezelLipOffset: 0.012,
    bezelLipRadius: 0.021,
    haloOffset: 0,
    beadRadius: 0,
    beadCount: 0,
    shankRadius: 0.078,
    shoulderRadius: 0.078,
  },
  coral: {
    bezelWallOffset: 0.026,
    bezelLipOffset: 0.017,
    bezelLipRadius: 0.026,
    haloOffset: 0,
    beadRadius: 0,
    beadCount: 0,
    shankRadius: 0.086,
    shoulderRadius: 0.088,
  },
  'sun-moon': {
    bezelWallOffset: 0.021,
    bezelLipOffset: 0.013,
    bezelLipRadius: 0.021,
    haloOffset: 0.064,
    beadRadius: 0.027,
    beadCount: 30,
    shankRadius: 0.081,
    shoulderRadius: 0.081,
  },
  aurora: {
    bezelWallOffset: 0.022,
    bezelLipOffset: 0.014,
    bezelLipRadius: 0.022,
    haloOffset: 0.059,
    beadRadius: 0.025,
    beadCount: 27,
    shankRadius: 0.078,
    shoulderRadius: 0.08,
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
    detail: 'Oval opal, clean bezel, dainty shank',
    shape: 'oval',
    setting: 'bezel',
    band: 'classic',
    referenceName: 'White Opal Gemini Ring',
    referenceImage: '/images/products/20210819_101941.jpg',
  },
  {
    id: 'coral',
    label: 'Coral',
    detail: 'Cushion opal, clean bezel, dainty shank',
    shape: 'cushion',
    setting: 'bezel',
    band: 'classic',
    referenceName: 'Crystal Black Opal Coral Ring',
    referenceImage: '/images/products/20210819_101746.jpg',
  },
  {
    id: 'sun-moon',
    label: 'Sun & Moon',
    detail: 'Oval opal with handmade beaded trim',
    shape: 'oval',
    setting: 'beaded',
    band: 'classic',
    referenceName: 'Crystal Opal Sun and Moon Ring',
    referenceImage: '/images/products/20210819_102749.jpg',
  },
  {
    id: 'aurora',
    label: 'Aurora',
    detail: 'Pear opal with handmade beaded trim',
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
}

export function applyRingStyle(
  config: RingConfig,
  styleId: RingConfig['style']
): RingConfig {
  const style = ringStyles.find((option) => option.id === styleId) ?? ringStyles[0]!
  return {
    ...config,
    style: style.id,
    shape: style.shape,
    setting: style.setting,
    band: style.band,
  }
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
  return params
}

export function ringConfigFromRecord(values: Record<string, string | undefined>): RingConfig {
  const requestedStyle = styleIds.find((style) => style === values[queryKeys.style]) ?? 'gemini'
  const style = ringStyles.find((option) => option.id === requestedStyle) ?? ringStyles[0]!
  const candidate = {
    metal: values[queryKeys.metal] ?? defaultRingConfig.metal,
    stone: values[queryKeys.stone] ?? defaultRingConfig.stone,
    style: style.id,
    shape: style.shape,
    setting: style.setting,
    band: style.band,
    size: Number(values[queryKeys.size] ?? defaultRingConfig.size),
    opalId: values[queryKeys.opalId],
  }
  const parsed = ringConfigSchema.safeParse(candidate)
  return parsed.success ? parsed.data : defaultRingConfig
}
