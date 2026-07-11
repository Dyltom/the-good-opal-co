import { describe, expect, test } from 'vitest'
import { getHaloSupportGeometry, ringStyleGeometryProfiles, ringStyles } from '../config'

describe('sold ring style geometry', () => {
  test('maps each named sold construction to its photographed silhouette', () => {
    expect(ringStyles.map(({ id, setting, shape }) => ({ id, setting, shape }))).toEqual([
      { id: 'gemini', setting: 'bezel', shape: 'oval' },
      { id: 'coral', setting: 'bezel', shape: 'cushion' },
      { id: 'sun-moon', setting: 'beaded', shape: 'oval' },
      { id: 'aurora', setting: 'beaded', shape: 'pear' },
    ])
  })

  test('keeps the Coral bezel broader than the dainty Gemini bezel', () => {
    const gemini = ringStyleGeometryProfiles.gemini
    const coral = ringStyleGeometryProfiles.coral

    expect(coral.bezelWallOffset).toBeGreaterThan(gemini.bezelWallOffset)
    expect(coral.bezelWallThickness).toBeGreaterThan(gemini.bezelWallThickness)
    expect(coral.shankRadius).toBeGreaterThan(gemini.shankRadius)
  })

  test('distinguishes the tight Sun and Moon pearls from the larger Aurora pearls', () => {
    const sunMoon = ringStyleGeometryProfiles['sun-moon']
    const aurora = ringStyleGeometryProfiles.aurora

    expect(sunMoon.beadCount).toBeGreaterThan(aurora.beadCount)
    expect(sunMoon.beadRadius).toBeLessThan(aurora.beadRadius)
    expect(sunMoon.haloOffset).toBeGreaterThan(aurora.haloOffset)
  })

  test.each(['sun-moon', 'aurora'] as const)(
    'supports the %s soldered beads with a continuous backplate',
    (style) => {
      const profile = ringStyleGeometryProfiles[style]
      const support = getHaloSupportGeometry(profile)
      const bezelOuterEdge = profile.bezelWallOffset + profile.bezelWallThickness / 2
      const haloOuterEdge = profile.haloOffset + profile.beadRadius

      expect(support.thickness).toBeGreaterThan(profile.beadRadius)
      expect(support.offset - support.thickness / 2).toBeCloseTo(bezelOuterEdge)
      expect(support.offset + support.thickness / 2).toBeCloseTo(haloOuterEdge)
    }
  )

  test.each(['gemini', 'coral'] as const)('%s has no decorative halo backplate', (style) => {
    expect(getHaloSupportGeometry(ringStyleGeometryProfiles[style]).thickness).toBe(0)
  })
})
