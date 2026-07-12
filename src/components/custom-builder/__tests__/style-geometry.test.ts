import { describe, expect, test } from 'vitest'
import { getHaloSupportGeometry, ringStyleGeometryProfiles, ringStyles } from '../config'
import { applyHandmadeBeadVariation, evenlySpacedOutlinePoints, outlinePoint } from '../geometry'

describe('sold ring style geometry', () => {
  test('maps each named sold construction to its photographed silhouette', () => {
    expect(ringStyles.map(({ id, setting, shape }) => ({ id, setting, shape }))).toEqual([
      { id: 'gemini', setting: 'bezel', shape: 'oval' },
      { id: 'coral', setting: 'bezel', shape: 'cushion' },
      { id: 'sun-moon', setting: 'beaded', shape: 'oval' },
      { id: 'aurora', setting: 'beaded', shape: 'pear' },
    ])
  })

  test('matches Coral to the sold 10 mm square head and low forged shank', () => {
    const coral = ringStyleGeometryProfiles.coral

    expect(coral).toMatchObject({
      bezelWallOffset: 0.032,
      bezelWallThickness: 0.052,
      bezelLipOffset: 0.01,
      shankRadius: 0.09,
      shoulderRadius: 0.096,
      crossSectionPower: 0.6,
    })
    const outerHalfWidth = 0.5 + coral.bezelWallOffset + coral.bezelWallThickness / 2
    expect((outerHalfWidth * 2) / 1).toBeGreaterThanOrEqual(1.11)
    expect((outerHalfWidth * 2) / 1).toBeLessThanOrEqual(1.13)
  })

  test('keeps Coral square with constant normal-width setting walls', () => {
    const diagonal = outlinePoint('cushion', Math.PI / 4, 0.5, 0.5)
    expect(diagonal[0] / 0.5).toBeGreaterThanOrEqual(0.885)
    expect(diagonal[0] / 0.5).toBeLessThanOrEqual(0.905)

    for (const angle of [0, Math.PI / 8, Math.PI / 4, (3 * Math.PI) / 8]) {
      const inner = outlinePoint('cushion', angle, 0.5, 0.5)
      const outer = outlinePoint('cushion', angle, 0.5, 0.5, 0.04)
      expect(Math.hypot(outer[0] - inner[0], outer[1] - inner[1])).toBeCloseTo(0.04, 5)
    }
  })

  test('distinguishes the tight Sun and Moon pearls from the larger Aurora pearls', () => {
    const sunMoon = ringStyleGeometryProfiles['sun-moon']
    const aurora = ringStyleGeometryProfiles.aurora

    expect(sunMoon.beadCount).toBeGreaterThan(aurora.beadCount)
    expect(sunMoon.beadRadius).toBeLessThan(aurora.beadRadius)
    expect(sunMoon.haloOffset).toBeGreaterThan(aurora.haloOffset)
    expect(sunMoon).toMatchObject({ beadCount: 34, beadRadius: 0.042, haloOffset: 0.095 })
    expect(aurora).toMatchObject({ beadCount: 28, beadRadius: 0.046, haloOffset: 0.086 })
  })

  test.each(['sun-moon', 'aurora'] as const)(
    'supports the %s soldered beads with a continuous backplate',
    (style) => {
      const profile = ringStyleGeometryProfiles[style]
      const support = getHaloSupportGeometry(profile)
      const bezelOuterEdge = profile.bezelWallOffset + profile.bezelWallThickness / 2
      const beadOuterEdge = profile.haloOffset + profile.beadRadius
      const supportOuterEdge = support.offset + support.thickness / 2

      expect(support.offset - support.thickness / 2).toBeCloseTo(bezelOuterEdge)
      expect(supportOuterEdge).toBeCloseTo(
        profile.haloOffset + profile.beadRadius * profile.haloSupportCoverage
      )
      expect(supportOuterEdge).toBeLessThan(beadOuterEdge)
      expect(supportOuterEdge).toBeLessThanOrEqual(
        profile.haloOffset + profile.beadRadius * 0.2
      )
    }
  )

  test.each(['sun-moon', 'aurora'] as const)(
    'keeps the %s handmade variation clear of adjacent beads',
    (style) => {
      const profile = ringStyleGeometryProfiles[style]
      const shape = style === 'aurora' ? 'pear' : 'oval'
      const beads = applyHandmadeBeadVariation(
        evenlySpacedOutlinePoints(
          shape,
          0.4,
          0.5,
          profile.haloOffset,
          profile.beadCount,
          profile.haloPhase
        )
      )
      const gaps = beads.map((bead, index) => {
        const next = beads[(index + 1) % beads.length]!
        return (
          Math.hypot(next.x - bead.x, next.y - bead.y) -
          profile.beadRadius * bead.size -
          profile.beadRadius * next.size
        )
      })

      expect(Math.min(...gaps)).toBeGreaterThanOrEqual(0.004)
    }
  )

  test.each(['sun-moon', 'aurora'] as const)(
    'anchors the %s halo at the point and opposite crown',
    (style) => {
      const profile = ringStyleGeometryProfiles[style]
      const shape = style === 'aurora' ? 'pear' : 'oval'
      const points = evenlySpacedOutlinePoints(
        shape,
        0.4,
        0.5,
        profile.haloOffset,
        profile.beadCount,
        profile.haloPhase
      )
      const point = points[0]!
      const crown = points[profile.beadCount / 2]!

      expect(point.x).toBeCloseTo(0, 2)
      expect(point.y).toBeLessThan(0)
      expect(crown.x).toBeCloseTo(0, 2)
      expect(crown.y).toBeGreaterThan(0)
    }
  )

  test.each(['gemini', 'coral'] as const)('%s has no decorative halo backplate', (style) => {
    expect(getHaloSupportGeometry(ringStyleGeometryProfiles[style]).thickness).toBe(0)
  })
})
