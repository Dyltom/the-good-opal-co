import type { BuilderOpal, RingConfig } from '@/components/custom-builder/config'

type VisualProfile = BuilderOpal['visual']

const reviewedProfiles: Record<
  string,
  Pick<
    VisualProfile,
    'silhouette' | 'aspectRatio' | 'evidence' | 'recommendedStyle' | 'textureCrop' | 'bodyColour'
  >
> = {
  'lightning-ridge-white-opal-1-05-cts': {
    silhouette: 'oval',
    aspectRatio: 1.12,
    evidence: 'catalogue',
    recommendedStyle: 'gemini',
    textureCrop: { focalX: 0.507, focalY: 0.495, zoom: 3.08 },
    bodyColour: '#a1a694',
  },
  'mintabie-semi-black-opal-1-05-cts': {
    silhouette: 'cushion',
    aspectRatio: 1.16,
    evidence: 'catalogue',
    recommendedStyle: 'coral',
    textureCrop: { focalX: 0.504, focalY: 0.487, zoom: 4.81 },
    bodyColour: '#8da392',
  },
  'mintabie-semi-black-opal-1-35-cts': {
    silhouette: 'oval',
    aspectRatio: 1.23,
    evidence: 'catalogue',
    recommendedStyle: 'gemini',
    textureCrop: { focalX: 0.501, focalY: 0.493, zoom: 3.61 },
    bodyColour: '#acb1a1',
  },
  'queensland-crystal-pipe-opal-1-45-cts': {
    silhouette: 'elongated',
    aspectRatio: 1.77,
    evidence: 'catalogue',
    recommendedStyle: 'gemini',
    textureCrop: { focalX: 0.517, focalY: 0.466, zoom: 4.74 },
    bodyColour: '#79b7d1',
  },
}

const reviewedSlugAliases: Record<string, keyof typeof reviewedProfiles> = {
  'lightning-ridge-white-opal-105-ct': 'lightning-ridge-white-opal-1-05-cts',
  'mintabie-semi-black-opal-105-cts': 'mintabie-semi-black-opal-1-05-cts',
  'mintabie-semi-black-opal-135-cts': 'mintabie-semi-black-opal-1-35-cts',
  'queensland-crystal-pipe-opal-105-cts': 'queensland-crystal-pipe-opal-1-45-cts',
}

function reviewedProfileFor(slug: string): (typeof reviewedProfiles)[string] | undefined {
  return reviewedProfiles[reviewedSlugAliases[slug] ?? slug]
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

export function isBuilderEligibleOpal(slug: string, name: string): boolean {
  return Boolean(name) && reviewedProfileFor(slug) !== undefined
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
  stoneType: string
): { renderStone: RingConfig['stone']; visual: VisualProfile } {
  const seed = hashString(`${slug}:${name}`)
  const profile = typeProfiles[stoneType] ?? typeProfiles['crystal-opal']!
  const silhouette = inferSilhouette(name)
  const reviewed = reviewedProfileFor(slug)
  const bodyColour = profile.bodies[seed % profile.bodies.length] ?? profile.bodies[0]!
  const flashColours = profile.flashes[(seed >>> 4) % profile.flashes.length] ?? profile.flashes[0]!

  return {
    renderStone: profile.renderStone,
    visual: {
      ...(reviewed ?? silhouette),
      bodyColour: reviewed?.bodyColour ?? bodyColour,
      flashColours,
      transmission: profile.transmission,
      patternSeed: seed,
    },
  }
}
