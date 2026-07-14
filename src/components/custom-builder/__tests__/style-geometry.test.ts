import { describe, expect, test } from 'vitest'
import { getHaloSupportGeometry, ringStyleGeometryProfiles, ringStyles } from '../config'
import {
  applyHandmadeBeadVariation,
  evenlySpacedOutlinePoints,
  getBezelWallContourPoints,
  getCabochonDepthProfile,
  getDShankCrossSection,
  getGrainDerivedHaloSupportOutline,
  getProfiledBezelLipRings,
  getSoldStyleOuterVariation,
  getStyleBeadCount,
  getSolderGrainTone,
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

  test.each(ringStyles.map(({ id }) => id))(
    'keeps %s handmade variation outside the exact opal seat',
    (style) => {
      const profile = ringStyleGeometryProfiles[style]
      const shape = style === 'coral' ? 'cushion' : style === 'aurora' ? 'pear' : 'oval'
      const samples = Array.from({ length: 1024 }, (_, index) => {
        const angle = (index / 1024) * Math.PI * 2
        const contours = getBezelWallContourPoints(
          style,
          shape,
          angle,
          0.4,
          0.5,
          profile.bezelWallOffset,
          profile.bezelWallThickness
        )
        return {
          delta: getSoldStyleOuterVariation(style, angle),
          thickness: Math.hypot(
            contours.outer[0] - contours.inner[0],
            contours.outer[1] - contours.inner[1]
          ),
        }
      })

      expect(Math.max(...samples.map(({ delta }) => delta))).toBeGreaterThan(0)
      expect(Math.min(...samples.map(({ delta }) => delta))).toBeLessThan(0)
      expect(Math.min(...samples.map(({ thickness }) => thickness))).toBeGreaterThan(0.03)
    }
  )

  test('matches Coral to the sold 10 mm square head and low forged shank', () => {
    const coral = ringStyleGeometryProfiles.coral

    expect(coral).toMatchObject({
      bezelWallOffset: 0.031,
      bezelWallThickness: 0.058,
      bezelLipOffset: 0.002,
      innerSeamRadius: 0.024,
      shankRadius: 0.082,
      shoulderRadius: 0.087,
      crossSectionPower: 0.92,
    })
    const outerHalfWidth = 0.5 + coral.bezelWallOffset + coral.bezelWallThickness / 2
    expect((outerHalfWidth * 2) / 1).toBeGreaterThanOrEqual(1.12)
    expect((outerHalfWidth * 2) / 1).toBeLessThanOrEqual(1.13)
  })

  test('keeps Coral square with constant normal-width setting walls', () => {
    const diagonal = outlinePoint('cushion', Math.PI / 4, 0.5, 0.5)
    expect(diagonal[0] / 0.5).toBeGreaterThanOrEqual(0.88)
    expect(diagonal[0] / 0.5).toBeLessThanOrEqual(0.9)

    for (const angle of [0, Math.PI / 8, Math.PI / 4, (3 * Math.PI) / 8]) {
      const inner = outlinePoint('cushion', angle, 0.5, 0.5)
      const outer = outlinePoint('cushion', angle, 0.5, 0.5, 0.04)
      expect(Math.hypot(outer[0] - inner[0], outer[1] - inner[1])).toBeCloseTo(0.04, 5)
    }
  })

  test('distinguishes rounded Sun and Moon grains from organic Aurora granules', () => {
    const sunMoon = ringStyleGeometryProfiles['sun-moon']
    const aurora = ringStyleGeometryProfiles.aurora

    expect(sunMoon.beadRadius).toBeLessThan(aurora.beadRadius)
    expect(sunMoon.beadVariation).toBeLessThan(aurora.beadVariation)
    expect(sunMoon.beadAsymmetry).toBe(0.06)
    expect(aurora.beadAsymmetry).toBe(0.18)
    expect(sunMoon.beadShape).toBe('granulated')
    expect(aurora.beadShape).toBe('granulated')
    expect(sunMoon.beadPrimitive).toBe('rounded-granule')
    expect(aurora.beadPrimitive).toBe('organic-granule')
    expect(ringStyleGeometryProfiles.gemini.beadPrimitive).toBe('none')
    expect(ringStyleGeometryProfiles.coral.beadPrimitive).toBe('none')
    expect(sunMoon).toMatchObject({
      beadCount: 40,
      beadPitchMm: 0.84,
      beadRadius: 0.036,
      haloOffset: 0.097,
    })
    expect(aurora).toMatchObject({
      beadCount: 28,
      beadPitchMm: 1.12,
      beadRadius: 0.046,
      haloOffset: 0.095,
    })
    // More, smaller Sun & Moon granules preserve the photographed outer head
    // while reading as one fused granular trim instead of a pearl necklace.
    expect(sunMoon.haloOffset + sunMoon.beadRadius).toBeCloseTo(0.133, 12)
    expect(aurora.haloOffset + aurora.beadRadius).toBeCloseTo(0.141, 12)
    expect(sunMoon.beadPitchMm - sunMoon.beadRadius * 20).toBeCloseTo(0.12, 12)
    expect(aurora.beadPitchMm - aurora.beadRadius * 20).toBeCloseTo(0.2, 12)
  })

  test('makes Aurora grains asymmetric without changing their official outer envelope', () => {
    const profile = ringStyleGeometryProfiles.aurora
    const count = getStyleBeadCount('aurora', 'pear', 0.4, 0.5)
    const points = evenlySpacedOutlinePoints(
      'pear',
      0.4,
      0.5,
      profile.haloOffset,
      count,
      profile.haloPhase,
      'aurora'
    )
    const baseline = applyHandmadeBeadVariation(
      points,
      profile.beadVariation,
      profile.beadFlattening
    )
    const handmade = applyHandmadeBeadVariation(
      points,
      profile.beadVariation,
      profile.beadFlattening,
      profile.beadAsymmetry
    )

    expect(count).toBe(28)
    expect(handmade).toEqual(
      applyHandmadeBeadVariation(
        points,
        profile.beadVariation,
        profile.beadFlattening,
        profile.beadAsymmetry
      )
    )
    expect(
      handmade.map(({ size, stretchX, stretchY }) => size * Math.max(stretchX, stretchY))
    ).toEqual(baseline.map(({ size, stretchX, stretchY }) => size * Math.max(stretchX, stretchY)))

    const aspectRatios = handmade.map(
      ({ stretchX, stretchY }) => Math.min(stretchX, stretchY) / Math.max(stretchX, stretchY)
    )
    expect(Math.min(...aspectRatios)).toBeGreaterThanOrEqual(0.81)
    expect(Math.min(...aspectRatios)).toBeLessThanOrEqual(0.83)
    expect(new Set(aspectRatios.map((ratio) => ratio.toFixed(3))).size).toBeGreaterThanOrEqual(6)
  })

  test('gives solder grains bounded deterministic tarnish variation', () => {
    const rounded = Array.from({ length: 40 }, (_, key) => getSolderGrainTone(key, false))
    const organic = Array.from({ length: 28 }, (_, key) => getSolderGrainTone(key, true))

    expect(Math.min(...rounded)).toBeCloseTo(0.92, 12)
    expect(Math.max(...rounded)).toBeCloseTo(1.04, 12)
    expect(Math.min(...organic)).toBeCloseTo(0.82, 12)
    expect(Math.max(...organic)).toBeCloseTo(1.09, 12)
    expect(new Set(organic)).toHaveLength(7)
  })

  test('keeps Sun and Moon granules near-round, fused, and deterministically handmade', () => {
    const profile = ringStyleGeometryProfiles['sun-moon']
    const count = getStyleBeadCount('sun-moon', 'oval', 0.4, 0.5)
    const points = evenlySpacedOutlinePoints(
      'oval',
      0.4,
      0.5,
      profile.haloOffset,
      count,
      profile.haloPhase,
      'sun-moon'
    )
    const granules = applyHandmadeBeadVariation(
      points,
      profile.beadVariation,
      profile.beadFlattening,
      profile.beadAsymmetry
    )
    const aspectRatios = granules.map(
      ({ stretchX, stretchY }) => Math.min(stretchX, stretchY) / Math.max(stretchX, stretchY)
    )

    expect(count).toBe(40)
    expect(granules).toEqual(
      applyHandmadeBeadVariation(
        points,
        profile.beadVariation,
        profile.beadFlattening,
        profile.beadAsymmetry
      )
    )
    expect(Math.min(...aspectRatios)).toBeGreaterThanOrEqual(0.93)
    expect(Math.min(...aspectRatios)).toBeLessThanOrEqual(0.95)
    expect(new Set(aspectRatios.map((ratio) => ratio.toFixed(3))).size).toBeGreaterThanOrEqual(6)
  })

  test.each([
    ['sun-moon', 'oval', 0.3, 0.35, 31],
    ['sun-moon', 'oval', 0.4, 0.5, 40],
    ['aurora', 'pear', 0.4, 0.5, 28],
    ['aurora', 'pear', 0.5, 0.75, 37],
  ] as const)(
    'adapts %s bead count to the %s opal perimeter',
    (style, shape, width, height, expectedCount) => {
      const count = getStyleBeadCount(style, shape, width, height)

      expect(count).toBeGreaterThanOrEqual(expectedCount - 2)
      expect(count).toBeLessThanOrEqual(expectedCount + 2)
    }
  )

  test.each(['sun-moon', 'aurora'] as const)(
    'keeps %s bead pitch within its photographed range',
    (style) => {
      const profile = ringStyleGeometryProfiles[style]
      const shape = style === 'aurora' ? 'pear' : 'oval'
      const count = getStyleBeadCount(style, shape, 0.4, 0.5)
      const points = evenlySpacedOutlinePoints(
        shape,
        0.4,
        0.5,
        profile.haloOffset,
        count,
        profile.haloPhase,
        style
      )
      const chordPitchMm =
        (points.reduce((sum, point, index) => {
          const next = points[(index + 1) % points.length]!
          return sum + Math.hypot(next.x - point.x, next.y - point.y)
        }, 0) /
          points.length) *
        10

      // Aurora's photographed 28-grain layout spans a wider irregular pear
      // perimeter than the denser Sun & Moon halo.
      const [minimum, maximum] = style === 'sun-moon' ? [0.83, 0.9] : [1.12, 1.24]
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
      expect(profile.haloSupportCoverage).toBeGreaterThanOrEqual(0.8)
      expect(profile.haloSupportCoverage).toBeLessThanOrEqual(0.82)
      expect(supportOuterEdge).toBeGreaterThanOrEqual(
        profile.haloOffset + profile.beadRadius * 0.8
      )
    }
  )

  test.each(['sun-moon', 'aurora'] as const)(
    'keeps the %s handmade variation clear of adjacent beads',
    (style) => {
      const profile = ringStyleGeometryProfiles[style]
      const shape = style === 'aurora' ? 'pear' : 'oval'
      const count = getStyleBeadCount(style, shape, 0.4, 0.5)
      const beads = applyHandmadeBeadVariation(
        evenlySpacedOutlinePoints(
          shape,
          0.4,
          0.5,
          profile.haloOffset,
          count,
          profile.haloPhase,
          style
        ),
        profile.beadVariation,
        profile.beadFlattening,
        profile.beadAsymmetry
      )
      const gaps = beads.map((bead, index) => {
        const next = beads[(index + 1) % beads.length]!
        return (
          Math.hypot(next.x - bead.x, next.y - bead.y) -
          profile.beadRadius * bead.size -
          profile.beadRadius * next.size
        )
      })

      // Handmade soldered grains should touch or very slightly overlap rather
      // than read as disconnected stones.
      expect(Math.min(...gaps)).toBeGreaterThanOrEqual(-0.012)
      expect(Math.max(...gaps)).toBeLessThanOrEqual(style === 'aurora' ? 0.04 : 0.035)
    }
  )

  test.each(['sun-moon', 'aurora'] as const)(
    'anchors the %s halo at the point and opposite crown',
    (style) => {
      const profile = ringStyleGeometryProfiles[style]
      const shape = style === 'aurora' ? 'pear' : 'oval'
      const count = getStyleBeadCount(style, shape, 0.4, 0.5)
      const points = evenlySpacedOutlinePoints(
        shape,
        0.4,
        0.5,
        profile.haloOffset,
        count,
        profile.haloPhase,
        style
      )
      const point = points.reduce((lowest, candidate) =>
        candidate.y < lowest.y ? candidate : lowest
      )
      const crown = points.reduce((highest, candidate) =>
        candidate.y > highest.y ? candidate : highest
      )

      const halfPitch = profile.beadPitchMm / 20
      expect(Math.abs(point.x)).toBeLessThanOrEqual(halfPitch + 0.005)
      expect(point.y).toBeLessThan(0)
      expect(Math.abs(crown.x)).toBeLessThanOrEqual(halfPitch + 0.005)
      expect(crown.y).toBeGreaterThan(0)
    }
  )

  test.each(['gemini', 'coral'] as const)('%s has no decorative halo backplate', (style) => {
    expect(getHaloSupportGeometry(ringStyleGeometryProfiles[style]).thickness).toBe(0)
  })

  test.each(ringStyles.map(({ id }) => id))(
    'profiles the %s bezel crown without moving its exact inner or outer edge',
    (style) => {
      const profile = ringStyleGeometryProfiles[style]
      const shape = style === 'coral' ? 'cushion' : style === 'aurora' ? 'pear' : 'oval'
      const width = style === 'coral' ? 0.5 : 0.4
      const height = 0.5
      const innerOffset = profile.bezelLipOffset - profile.bezelLipRadius
      const outerOffset = profile.bezelWallOffset + profile.bezelWallThickness / 2
      const depthProfile = getCabochonDepthProfile(width, height, undefined, style)
      const rings = getProfiledBezelLipRings({
        angle: Math.PI / 5,
        depthProfile,
        height,
        innerOffset,
        outerOffset,
        profile: profile.bezelLipProfile,
        shape,
        style,
        topZ: depthProfile.girdleZ + 0.025,
        width,
      })
      const expectedInner = outlinePoint(shape, Math.PI / 5, width, height, innerOffset)
      const expectedOuter = getBezelWallContourPoints(
        style,
        shape,
        Math.PI / 5,
        width,
        height,
        profile.bezelWallOffset,
        profile.bezelWallThickness
      ).outer

      expect(rings[0]?.point[0]).toBeCloseTo(expectedInner[0], 8)
      expect(rings[0]?.point[1]).toBeCloseTo(expectedInner[1], 8)
      expect(rings.at(-1)?.point[0]).toBeCloseTo(expectedOuter[0], 8)
      expect(rings.at(-1)?.point[1]).toBeCloseTo(expectedOuter[1], 8)
      expect(profile.bezelLipProfile[0]?.radialProgress).toBe(0)
      expect(profile.bezelLipProfile.at(-1)?.radialProgress).toBe(1)
    }
  )

  test('gives Coral a real recessed patina moat and raised bright outer rail', () => {
    const knots = ringStyleGeometryProfiles.coral.bezelLipProfile
    const patina = knots.filter(({ finish }) => finish === 'patina')
    const metal = knots.filter(({ finish }) => finish === 'metal')

    expect(patina).toHaveLength(3)
    expect(Math.min(...patina.slice(1).map(({ heightOffset }) => heightOffset)) * 10).toBe(-0.08)
    expect(Math.max(...metal.map(({ heightOffset }) => heightOffset)) * 10).toBe(0.01)
    expect(metal[0]?.radialProgress).toBeGreaterThan(patina.at(-1)?.radialProgress ?? 1)
    const profile = ringStyleGeometryProfiles.coral
    const innerOffset = profile.bezelLipOffset - profile.bezelLipRadius
    const outerOffset = profile.bezelWallOffset + profile.bezelWallThickness / 2
    const lastPatinaOffset =
      innerOffset + (outerOffset - innerOffset) * (patina.at(-1)?.radialProgress ?? 0)
    const firstMetalOffset =
      innerOffset + (outerOffset - innerOffset) * (metal[0]?.radialProgress ?? 1)
    const visibleMoatWidthMm = Math.max(0, lastPatinaOffset) * 10
    const brightRailWidthMm = (outerOffset - firstMetalOffset) * 10

    // Measure only the moat outside the stone edge. Counting the lip's hidden
    // underlap produced a false positive while the production moat looked lost.
    expect(visibleMoatWidthMm).toBeGreaterThanOrEqual(0.42)
    expect(visibleMoatWidthMm).toBeLessThanOrEqual(0.43)
    expect(brightRailWidthMm).toBeGreaterThanOrEqual(0.13)
    expect(brightRailWidthMm).toBeLessThanOrEqual(0.14)
  })

  test.each([
    ['gemini', 0.16],
    ['sun-moon', 0.18],
    ['aurora', 0.2],
  ] as const)('gives %s its photographed narrow oxidized burnish seam', (style, seamExtent) => {
    const profile = ringStyleGeometryProfiles[style]
    const knots = profile.bezelLipProfile
    const patina = knots.filter(({ finish }) => finish === 'patina')
    const metal = knots.filter(({ finish }) => finish === 'metal')
    const innerOffset = profile.bezelLipOffset - profile.bezelLipRadius
    const outerOffset = profile.bezelWallOffset + profile.bezelWallThickness / 2
    const seamWidthMm = (outerOffset - innerOffset) * seamExtent * 10

    expect(patina).toHaveLength(2)
    expect(patina[0]?.radialProgress).toBe(0)
    expect(patina.at(-1)?.radialProgress).toBe(seamExtent)
    expect(metal[0]?.radialProgress).toBeGreaterThan(seamExtent)
    expect(seamWidthMm).toBeGreaterThanOrEqual(0.07)
    expect(seamWidthMm).toBeLessThanOrEqual(0.11)
    expect(knots.at(-1)?.radialProgress).toBe(1)
  })

  test.each(['sun-moon', 'aurora'] as const)(
    'derives the %s solder web from the varied grain footprints',
    (style) => {
      const profile = ringStyleGeometryProfiles[style]
      const shape = style === 'aurora' ? 'pear' : 'oval'
      const count = getStyleBeadCount(style, shape, 0.4, 0.5)
      const beads = applyHandmadeBeadVariation(
        evenlySpacedOutlinePoints(
          shape,
          0.4,
          0.5,
          profile.haloOffset,
          count,
          profile.haloPhase,
          style
        ),
        profile.beadVariation,
        profile.beadFlattening,
        profile.beadAsymmetry
      )
      const contour = getGrainDerivedHaloSupportOutline({
        beadRadius: profile.beadRadius,
        beads,
        bezelOuterOffset: profile.bezelWallOffset + profile.bezelWallThickness / 2,
        coverage: profile.haloSupportCoverage,
        haloOffset: profile.haloOffset,
        height: 0.5,
        shape,
        style,
        width: 0.4,
      })

      expect(contour).toHaveLength(count * 2)
      expect(
        contour.every(
          ({ inner, outer }) =>
            [...inner, ...outer].every(Number.isFinite) &&
            Math.hypot(outer[0], outer[1]) > Math.hypot(inner[0], inner[1])
        )
      ).toBe(true)
      const crestRadii = contour
        .filter((_, index) => index % 2 === 0)
        .map(({ outer }) => Math.hypot(outer[0], outer[1]))
      const valleyRadii = contour
        .filter((_, index) => index % 2 === 1)
        .map(({ outer }) => Math.hypot(outer[0], outer[1]))
      expect(Math.max(...crestRadii)).toBeGreaterThan(Math.max(...valleyRadii))
      expect(Math.min(...valleyRadii)).toBeGreaterThan(
        Math.min(
          ...beads.map(({ x, y }) => Math.hypot(x, y))
        ) -
          profile.beadRadius * 0.6
      )
    }
  )

  test.each(ringStyles.map(({ id }) => id))(
    'uses a flat finger-side and curved exterior for the %s D shank',
    (style) => {
      const profile = ringStyleGeometryProfiles[style]
      const inner = getDShankCrossSection(
        Math.PI / 3,
        profile.crossSectionPower,
        profile.shankInnerFacePower
      )
      const outer = getDShankCrossSection(
        (Math.PI * 2) / 3,
        profile.crossSectionPower,
        profile.shankInnerFacePower
      )

      expect(
        getDShankCrossSection(0, profile.crossSectionPower, profile.shankInnerFacePower)
      ).toEqual({ axial: 0, radial: 1 })
      expect(inner.radial).toBeGreaterThan(Math.abs(outer.radial))
      expect(inner.axial).toBeCloseTo(outer.axial, 10)
      expect(profile.shankInnerFacePower).toBeLessThan(profile.crossSectionPower)
    }
  )
})
