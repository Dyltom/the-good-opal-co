import { describe, expect, test } from 'vitest'
import { applyRingStyle, defaultRingConfig, ringStyleGeometryProfiles, ringStyles } from '../config'
import { getSettingOuterHalfWidth, getStoneDimensions } from '../geometry'

const soldReferences = {
  gemini: {
    bandWidthMm: [1.9, 2.1],
    headWidthMm: [8.8, 9],
    setting: 'bezel',
    shape: 'oval',
    stoneMm: [8, 10],
  },
  coral: {
    bandWidthMm: [1.7, 1.9],
    headWidthMm: [11.1, 11.3],
    setting: 'bezel',
    shape: 'cushion',
    stoneMm: [10, 10],
  },
  'sun-moon': {
    bandWidthMm: [1.8, 2],
    headWidthMm: [10.8, 11.2],
    setting: 'beaded',
    shape: 'oval',
    stoneMm: [8, 10],
  },
  aurora: {
    bandWidthMm: [2, 2.2],
    headWidthMm: [11, 11.5],
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

      expect(config.shape).toBe(reference.shape)
      expect(config.setting).toBe(reference.setting)
      expect(dimensions.map((value) => value * 20)).toEqual(reference.stoneMm)
      expect(headWidthMm).toBeGreaterThanOrEqual(reference.headWidthMm[0])
      expect(headWidthMm).toBeLessThanOrEqual(reference.headWidthMm[1])
      expect(bandWidthMm).toBeGreaterThanOrEqual(reference.bandWidthMm[0])
      expect(bandWidthMm).toBeLessThanOrEqual(reference.bandWidthMm[1])
      expect(innerWallClearanceMm).toBeGreaterThanOrEqual(-0.05)
      expect(innerWallClearanceMm).toBeLessThanOrEqual(-0.02)
      expect(lipOverlapMm).toBeGreaterThanOrEqual(0.08)
      expect(lipOverlapMm).toBeLessThanOrEqual(0.12)
    }
  )
})
