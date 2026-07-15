import { describe, expect, test } from 'vitest'
import {
  applyRingStyle,
  defaultRingConfig,
  getRingStyleReferenceOpal,
  ringStyleGeometryProfiles,
  ringStyles,
} from '../config'
import { getSettingOuterHalfWidth, getStoneDimensions } from '../geometry'

// Broad regression envelopes inferred from owned face-on photos. These prevent
// accidental proportion drift but are not maker-approved caliper measurements.
const draftReferenceEnvelopes = {
  gemini: {
    bandWidthMm: [1.7, 1.85],
    headWidthMm: [9.2, 9.3],
    setting: 'bezel',
    shape: 'oval',
    stoneMm: [8, 10],
  },
  coral: {
    bandWidthMm: [1.55, 1.7],
    headWidthMm: [11.7, 11.9],
    setting: 'bezel',
    shape: 'cushion',
    stoneMm: [10, 10],
  },
  'sun-moon': {
    bandWidthMm: [1.65, 1.8],
    headWidthMm: [10.6, 10.95],
    setting: 'beaded',
    shape: 'oval',
    stoneMm: [8, 10],
  },
  aurora: {
    bandWidthMm: [1.7, 1.85],
    // Normalized against the visible stone/head landmarks in the owned pear
    // photograph. The earlier 11.5–11.7 estimate counted the cast shadow as
    // metal and produced oversized pearl-like grains.
    headWidthMm: [10.6, 11],
    setting: 'beaded',
    shape: 'pear',
    stoneMm: [8, 10],
  },
} as const

describe('sold ring reference proportions', () => {
  test('uses a reviewed crop from each exact sold-ring photograph in reference mode', () => {
    const references = Object.fromEntries(
      ringStyles.map((style) => {
        const opal = getRingStyleReferenceOpal(style.id)
        return [
          style.id,
          {
            imageUrl: opal.imageUrl,
            photoFit: opal.visual.photoFit,
            renderStone: opal.renderStone,
            textureCrop: opal.visual.textureCrop,
          },
        ]
      })
    )

    expect(references).toEqual({
      aurora: {
        imageUrl: '/images/products/20210819_102625-1.jpg',
        photoFit: 'reviewed',
        renderStone: 'blue-green',
        textureCrop: { focalX: 0.5, focalY: 0.486, zoom: 8.45 },
      },
      coral: {
        imageUrl: '/images/products/20210819_101746.jpg',
        photoFit: 'reviewed',
        renderStone: 'lightning',
        textureCrop: { focalX: 0.503, focalY: 0.487, zoom: 6.26 },
      },
      gemini: {
        imageUrl: '/images/products/20210819_101941.jpg',
        photoFit: 'reviewed',
        renderStone: 'sunset',
        textureCrop: { focalX: 0.528, focalY: 0.524, zoom: 8.2 },
      },
      'sun-moon': {
        imageUrl: '/images/products/20210819_102749.jpg',
        photoFit: 'reviewed',
        renderStone: 'crystal',
        textureCrop: { focalX: 0.5, focalY: 0.49, zoom: 7.5 },
      },
    })
  })

  test.each(ringStyles.map(({ id }) => id))(
    'keeps %s inside its draft owned-photo face-on envelope',
    (style) => {
      const reference = draftReferenceEnvelopes[style]
      const config = applyRingStyle(defaultRingConfig, style)
      const dimensions = getStoneDimensions(config)
      const headWidthMm = getSettingOuterHalfWidth(config, dimensions) * 20
      const profile = ringStyleGeometryProfiles[style]
      const bandWidthMm = profile.shankRadius * 20
      const innerWallClearanceMm = (profile.bezelWallOffset - profile.bezelWallThickness / 2) * 10
      const lipOverlapMm = (profile.bezelLipRadius - profile.bezelLipOffset) * 10
      const crownRatio = profile.domeHeightRatio

      expect(config.shape).toBe(reference.shape)
      expect(config.setting).toBe(reference.setting)
      expect(dimensions.map((value) => value * 20)).toEqual(reference.stoneMm)
      expect(headWidthMm).toBeGreaterThanOrEqual(reference.headWidthMm[0])
      expect(headWidthMm).toBeLessThanOrEqual(reference.headWidthMm[1])
      expect(bandWidthMm).toBeGreaterThanOrEqual(reference.bandWidthMm[0])
      expect(bandWidthMm).toBeLessThanOrEqual(reference.bandWidthMm[1])
      // The vertical wall clears the stone by a hair; the separate burnished
      // lip provides the protective overlap visible in the sold references.
      expect(innerWallClearanceMm).toBeGreaterThanOrEqual(0)
      expect(innerWallClearanceMm).toBeLessThanOrEqual(0.025)
      expect(lipOverlapMm).toBeGreaterThanOrEqual(0.08)
      expect(lipOverlapMm).toBeLessThanOrEqual(0.12)
      expect(crownRatio).toBeGreaterThanOrEqual(
        style === 'coral' ? 0.1 : style === 'aurora' ? 0.11 : 0.13
      )
      expect(crownRatio).toBeLessThanOrEqual(style === 'aurora' ? 0.16 : 0.15)
    }
  )
})
