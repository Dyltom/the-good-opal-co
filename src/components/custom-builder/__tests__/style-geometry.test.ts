import { describe, expect, test } from 'vitest'
import { getHaloSupportGeometry, ringStyleGeometryProfiles, ringStyles } from '../config'
import {
  adaptiveOutlinePointCount,
  applyHandmadeBeadVariation,
  evenlySpacedOutlinePoints,
  outlinePoint,
} from '../geometry'

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
      innerSeamRadius: 0.008,
      shankRadius: 0.094,
      shoulderRadius: 0.099,
      crossSectionPower: 0.9,
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

    expect(sunMoon.beadRadius).toBeLessThan(aurora.beadRadius)
    expect(sunMoon.beadVariation).toBeLessThan(aurora.beadVariation)
    expect(sunMoon.beadFlattening).toBeLessThan(aurora.beadFlattening)
    expect(sunMoon).toMatchObject({ beadPitchMm: 1.06, beadRadius: 0.042, haloOffset: 0.095 })
    expect(aurora).toMatchObject({ beadPitchMm: 1.1, beadRadius: 0.046, haloOffset: 0.086 })
  })

  test.each([
    ['sun-moon', 'oval', 0.3, 0.35, 25],
    ['sun-moon', 'oval', 0.4, 0.5, 32],
    ['aurora', 'pear', 0.4, 0.5, 30],
    ['aurora', 'pear', 0.5, 0.75, 40],
  ] as const)(
    'adapts %s bead count to the %s opal perimeter',
    (style, shape, width, height, expectedCount) => {
      const profile = ringStyleGeometryProfiles[style]
      const count = adaptiveOutlinePointCount(
        shape,
        width,
        height,
        profile.haloOffset,
        profile.beadPitchMm
      )

      expect(count).toBeGreaterThanOrEqual(expectedCount - 2)
      expect(count).toBeLessThanOrEqual(expectedCount + 2)
    }
  )

  test.each(['sun-moon', 'aurora'] as const)(
    'keeps %s bead pitch within its photographed range',
    (style) => {
      const profile = ringStyleGeometryProfiles[style]
      const shape = style === 'aurora' ? 'pear' : 'oval'
      const count = adaptiveOutlinePointCount(
        shape,
        0.4,
        0.5,
        profile.haloOffset,
        profile.beadPitchMm
      )
      const points = evenlySpacedOutlinePoints(
        shape,
        0.4,
        0.5,
        profile.haloOffset,
        count,
        profile.haloPhase
      )
      const chordPitchMm =
        (points.reduce((sum, point, index) => {
          const next = points[(index + 1) % points.length]!
          return sum + Math.hypot(next.x - point.x, next.y - point.y)
        }, 0) /
          points.length) *
        10

      const [minimum, maximum] = style === 'sun-moon' ? [1.0, 1.1] : [1.04, 1.15]
      expect(chordPitchMm).toBeGreaterThanOrEqual(minimum)
      expect(chordPitchMm).toBeLessThanOrEqual(maximum)
    }
  )
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
      expect(supportOuterEdge).toBeLessThanOrEqual(profile.haloOffset + profile.beadRadius * 0.2)
    }
  )

  test.each(['sun-moon', 'aurora'] as const)(
    'keeps the %s handmade variation clear of adjacent beads',
    (style) => {
      const profile = ringStyleGeometryProfiles[style]
      const shape = style === 'aurora' ? 'pear' : 'oval'
      const count = adaptiveOutlinePointCount(
        shape,
        0.4,
        0.5,
        profile.haloOffset,
        profile.beadPitchMm
      )
      const beads = applyHandmadeBeadVariation(
        evenlySpacedOutlinePoints(shape, 0.4, 0.5, profile.haloOffset, count, profile.haloPhase),
        profile.beadVariation,
        profile.beadFlattening
      )
      const gaps = beads.map((bead, index) => {
        const next = beads[(index + 1) % beads.length]!
        return (
          Math.hypot(next.x - bead.x, next.y - bead.y) -
          profile.beadRadius * bead.size -
          profile.beadRadius * next.size
        )
      })

      // Handmade soldered beads should touch or very slightly overlap rather
      // than read as a disconnected string of pearls.
      expect(Math.min(...gaps)).toBeGreaterThanOrEqual(-0.012)
      expect(Math.max(...gaps)).toBeLessThanOrEqual(0.035)
    }
  )

  test.each(['sun-moon', 'aurora'] as const)(
    'anchors the %s halo at the point and opposite crown',
    (style) => {
      const profile = ringStyleGeometryProfiles[style]
      const shape = style === 'aurora' ? 'pear' : 'oval'
      const count = adaptiveOutlinePointCount(
        shape,
        0.4,
        0.5,
        profile.haloOffset,
        profile.beadPitchMm
      )
      const points = evenlySpacedOutlinePoints(
        shape,
        0.4,
        0.5,
        profile.haloOffset,
        count,
        profile.haloPhase
      )
      const point = points[0]!
      const crown = points[Math.floor(count / 2)]!

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
