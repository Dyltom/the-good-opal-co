import { describe, expect, test } from 'vitest'
import { applyRingStyle, defaultRingConfig, ringStyleGeometryProfiles, ringStyles } from '../config'
import { getSettingOuterHalfWidth, getStoneDimensions } from '../geometry'

const soldReferences = {
  gemini: {
    bandWidthMm: [1.7, 1.85],
    headWidthMm: [8.65, 8.85],
    setting: 'bezel',
    shape: 'oval',
    stoneMm: [8, 10],
  },
  coral: {
    bandWidthMm: [1.55, 1.7],
    headWidthMm: [11.2, 11.35],
    setting: 'bezel',
    shape: 'cushion',
    stoneMm: [10, 10],
  },
  'sun-moon': {
    bandWidthMm: [1.65, 1.8],
    headWidthMm: [10.65, 10.95],
    setting: 'beaded',
    shape: 'oval',
    stoneMm: [8, 10],
  },
  aurora: {
    bandWidthMm: [1.7, 1.85],
    headWidthMm: [10.9, 11.3],
    setting: 'beaded',
    shape: 'pear',
    stoneMm: [8, 10],
  },
} as const

describe('sold ring reference proportions', () => {
  test.each(ringStyles.map(({ id }) => id))(
    'keeps %s inside its photographed face-on measurements',
    (style) => {
      const reference = soldReferences[style]
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
      expect(crownRatio).toBeGreaterThanOrEqual(style === 'coral' ? 0.1 : 0.13)
      expect(crownRatio).toBeLessThanOrEqual(style === 'aurora' ? 0.16 : 0.15)
    }
  )
})
