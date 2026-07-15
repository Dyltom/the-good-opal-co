import { describe, expect, test } from 'vitest'
import {
  defaultRingConfig,
  type BuilderOpal,
  type RingConfig,
} from '@/components/custom-builder/config'
import type { RingDesignRenderManifest } from '../ring-design-manifest'
import { selectRingRenderModel } from '../ring-render-model'

const digest = '9f7b33f54ecf0d93a349fc22965d0f62cdcd6f1d7633e62533e493ccb31a0a0d'
const referenceContour = { version: 1 as const, radii: Array.from({ length: 96 }, () => 1) }
const variant = {
  approvedMetals: ['sterling-silver'],
  assembly: 'complete-ring',
  asset: {
    byteLength: 124_000,
    sha256: digest,
    url: `https://assets.goodopalco.com/rings/${digest}.glb`,
  },
  basis: 'good-opal-world-v1',
  id: 'gemini-size-7-oval',
  materialSlots: {
    metal: ['STERLING_SILVER'],
    patina: ['OXIDIZED_RECESS'],
    preserve: ['MAKER_MARK'],
  },
  nodes: {
    referenceStone: 'REFERENCE_STONE',
    root: 'RING_ROOT',
    stoneAnchor: 'STONE_ANCHOR',
  },
  ringFit: { mode: 'fixed', sizeUs: 7 },
  runtimeScale: 0.1,
  stoneFit: {
    reference: { contour: referenceContour, depthMm: 3, lengthMm: 10, widthMm: 8 },
    shape: 'oval',
    toleranceMm: { contour: 0.25, depth: 0.5, length: 0.2, width: 0.2 },
  },
  unit: 'millimeter',
} as const

const manifest = {
  approval: {
    approvedAt: '2026-07-15T01:30:00.000Z',
    notes: 'Approved against the physical Gemini master.',
  },
  id: 7,
  model: {
    contractVersion: 'ring-asset-v1',
    source: 'artist-authored',
    variants: [variant],
    version: 'gemini-v2',
  },
  name: 'Gemini',
  slug: 'gemini',
  style: 'gemini',
} as const satisfies RingDesignRenderManifest

function builderOpal(overrides: Partial<BuilderOpal['visual']> = {}): BuilderOpal {
  return {
    id: 'opal-1',
    imageAlt: 'Calibrated oval opal',
    imageUrl: '/images/products/opal-1.jpg',
    name: 'Calibrated oval opal',
    price: 800,
    renderStone: 'blue-green',
    selectionKind: 'individual',
    slug: 'calibrated-oval-opal',
    stoneType: 'light-opal',
    stoneTypeLabel: 'Light opal',
    visual: {
      aspectRatio: 1.25,
      bodyColour: '#d6ece5',
      dimensionsMm: { depth: 3, length: 10, width: 8 },
      evidence: 'catalogue',
      flashColours: ['#55b9a9'],
      patternSeed: 7,
      photoFit: 'reviewed',
      recommendedStyle: 'gemini',
      silhouette: 'oval',
      transmission: 0.45,
      contour: referenceContour,
      ...overrides,
    },
  }
}

function select(
  options: {
    config?: RingConfig
    manifest?: RingDesignRenderManifest | null
    opal?: BuilderOpal
  } = {}
) {
  return selectRingRenderModel({
    config: options.config ?? defaultRingConfig,
    manifest: options.manifest === undefined ? manifest : options.manifest,
    opal: options.opal ?? builderOpal(),
  })
}

describe('ring render model selection', () => {
  test('selects a maker-approved asset only for an exact supported fit', () => {
    expect(select()).toEqual({ kind: 'asset', makerApproved: true, manifest, variant })
  })

  test.each([
    ['missing manifest', { manifest: null }],
    ['shape mismatch', { opal: builderOpal({ silhouette: 'pear' }) }],
    ['unreviewed evidence', { opal: builderOpal({ photoFit: 'estimated' }) }],
    ['non-individual listing', { opal: { ...builderOpal(), selectionKind: 'parcel' as const } }],
    [
      'contour mismatch',
      {
        opal: builderOpal({
          contour: { version: 1, radii: Array.from({ length: 96 }, () => 1.08) },
        }),
      },
    ],
    ['metal mismatch', { config: { ...defaultRingConfig, metal: '14k-gold' as const } }],
    [
      'width mismatch',
      { opal: builderOpal({ dimensionsMm: { depth: 3, length: 10, width: 8.21 } }) },
    ],
    [
      'length mismatch',
      { opal: builderOpal({ dimensionsMm: { depth: 3, length: 10.21, width: 8 } }) },
    ],
    [
      'depth mismatch',
      { opal: builderOpal({ dimensionsMm: { depth: 4.01, length: 10, width: 8 } }) },
    ],
    ['missing calibrated dimensions', { opal: builderOpal({ dimensionsMm: undefined }) }],
    ['ring-size mismatch', { config: { ...defaultRingConfig, size: 8.5 } }],
    ['style mismatch', { config: { ...defaultRingConfig, style: 'coral' } }],
    [
      'head-only assembly',
      {
        manifest: {
          ...manifest,
          model: {
            ...manifest.model,
            variants: [
              {
                ...variant,
                assembly: 'authored-head-procedural-shank' as const,
                nodes: {
                  referenceStone: 'REFERENCE_STONE' as const,
                  root: 'RING_ROOT' as const,
                  shankJoinLeft: 'SHANK_JOIN_LEFT' as const,
                  shankJoinRight: 'SHANK_JOIN_RIGHT' as const,
                  stoneAnchor: 'STONE_ANCHOR' as const,
                },
                ringFit: { mode: 'resizable' as const, sizesUs: [7] },
              },
            ],
          },
        },
      },
    ],
  ] as const)('falls back to procedural rendering for %s', (_, options) => {
    expect(select(options)).toMatchObject({ kind: 'procedural' })
  })
})
