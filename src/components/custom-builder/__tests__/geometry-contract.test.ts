import { describe, expect, test } from 'vitest'
import { CatmullRomCurve3, Vector3 } from 'three'
import {
  cameraPositions,
  cameraUpVectors,
  cssSilhouetteClipPath,
  evenlySpacedOutlinePoints,
  getBezelWallContourPoints,
  getCabochonDepthProfile,
  getCameraPosition,
  getPortraitFramingScale,
  getRingFramingTarget,
  getRingMeasurements,
  getRingModelBounds,
  getRingShankLandmarks,
  getRingShankPathPoints,
  getRenderableOpalDepthMm,
  getSettingOuterHalfWidth,
  getSettingShoulderHalfWidth,
  getSettingPlacement,
  getStoneDimensions,
  outlinePoint,
  projectWorldAxisToView,
  rotateSettingVectorToWorld,
} from '../geometry'
import {
  applyRingStyle,
  defaultRingConfig,
  ringStyleGeometryProfiles,
  ringStyles,
  type BuilderOpal,
  type RingConfig,
} from '../config'

const measuredOpal: BuilderOpal = {
  id: 'reviewed-opal',
  name: 'Reviewed long opal',
  slug: 'reviewed-long-opal',
  imageUrl: '/reviewed-opal.jpg',
  imageAlt: 'Reviewed long opal',
  price: 125,
  stoneType: 'boulder-opal',
  stoneTypeLabel: 'Boulder opal',
  selectionKind: 'individual',
  renderStone: 'blue-green',
  visual: {
    silhouette: 'elongated',
    aspectRatio: 1.8,
    bodyColour: '#789a8d',
    flashColours: ['#50d9d0'],
    transmission: 0.1,
    patternSeed: 17,
    evidence: 'catalogue',
    recommendedStyle: 'gemini',
    dimensionsMm: { width: 8, length: 14, depth: 3.2 },
  },
}

function sampledExtents(shape: RingConfig['shape'], width: number, height: number) {
  const points = Array.from({ length: 1440 }, (_, index) =>
    outlinePoint(shape, (index / 1440) * Math.PI * 2, width, height)
  )
  const xs = points.map(([x]) => x)
  const ys = points.map(([, y]) => y)
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  }
}

describe('custom ring geometry contract', () => {
  test('mounts the opal face outward and its long axis upright', () => {
    const faceNormal = rotateSettingVectorToWorld([0, 0, 1])
    const longStoneAxis = rotateSettingVectorToWorld([0, 1, 0])
    const stoneWidthAxis = rotateSettingVectorToWorld([1, 0, 0])

    expect(faceNormal).toEqual([0, 1, expect.closeTo(0, 12)])
    expect(longStoneAxis).toEqual([0, expect.closeTo(0, 12), -1])
    expect(stoneWidthAxis).toEqual([1, 0, 0])

    const target = getRingFramingTarget(defaultRingConfig)
    const frontProjection = projectWorldAxisToView(
      longStoneAxis,
      cameraPositions.front,
      target,
      cameraUpVectors.front
    )
    const faceProjection = projectWorldAxisToView(
      faceNormal,
      cameraPositions.front,
      target,
      cameraUpVectors.front
    )

    expect(frontProjection.horizontal).toBeCloseTo(0, 12)
    expect(frontProjection.vertical).toBeCloseTo(1, 12)
    expect(Math.abs(faceProjection.depth)).toBeCloseTo(1, 12)
  })

  test('keeps front, profile, and three-quarter views geometrically distinct', () => {
    const target = getRingFramingTarget(defaultRingConfig)
    const faceNormal = rotateSettingVectorToWorld([0, 0, 1])
    const projectedDepth = Object.fromEntries(
      (['front', 'profile', 'three-quarter'] as const).map((view) => [
        view,
        Math.abs(
          projectWorldAxisToView(faceNormal, cameraPositions[view], target, cameraUpVectors[view])
            .depth
        ),
      ])
    )

    expect(projectedDepth.front).toBeGreaterThan(0.99)
    expect(projectedDepth.profile).toBeLessThan(0.2)
    expect(projectedDepth['three-quarter']).toBeGreaterThan(0.5)
    expect(projectedDepth['three-quarter']).toBeLessThan(0.9)
  })

  test('shows the setting long axis in profile instead of looking into its end', () => {
    const target = getRingFramingTarget(defaultRingConfig)
    const longStoneAxis = rotateSettingVectorToWorld([0, 1, 0])
    const projection = projectWorldAxisToView(
      longStoneAxis,
      cameraPositions.profile,
      target,
      cameraUpVectors.profile
    )

    expect(Math.abs(projection.depth)).toBeLessThan(0.01)
    expect(Math.abs(projection.horizontal)).toBeGreaterThan(0.99)
  })

  test('scales portrait cameras without changing the selected view direction ratios', () => {
    expect(getPortraitFramingScale(1200, 800)).toBe(1)
    expect(getPortraitFramingScale(390, 844)).toBe(1.7)
    expect(getPortraitFramingScale(768, 1024)).toBeCloseTo(1.226_667, 5)

    const landscape = getCameraPosition('three-quarter', 1200, 800)
    const portrait = getCameraPosition('three-quarter', 390, 844)
    portrait.forEach((coordinate, index) => {
      expect(coordinate / landscape[index]!).toBeCloseTo(1.7, 12)
    })
  })

  test('seats the bezel exactly on top of the shank', () => {
    const placement = getSettingPlacement(defaultRingConfig)
    const mountedBottom = rotateSettingVectorToWorld([0, 0, placement.settingBottom])
    const worldBottom = placement.settingY + mountedBottom[1]

    expect(worldBottom).toBeCloseTo(placement.measurements.outerRadius, 12)
    expect(placement.depthProfile.baseZ).toBeGreaterThan(placement.settingBottom)
    expect(placement.depthProfile.girdleZ).toBeGreaterThan(placement.depthProfile.baseZ)
  })

  test('centres every camera on the actual model bounds', () => {
    for (const size of [4, 7, 13]) {
      const config = { ...defaultRingConfig, size }
      const bounds = getRingModelBounds(config, measuredOpal)
      const target = getRingFramingTarget(config, measuredOpal)

      expect(bounds.top).toBeGreaterThan(0)
      expect(bounds.bottom).toBeLessThan(0)
      expect(target).toEqual([0, (bounds.top + bounds.bottom) / 2, 0])
      expect(target[1] - bounds.bottom).toBeCloseTo(bounds.top - target[1], 12)
    }
  })

  test('maps supported ring sizes to physical diameters monotonically', () => {
    const size4 = getRingMeasurements({ ...defaultRingConfig, size: 4 })
    const size13 = getRingMeasurements({ ...defaultRingConfig, size: 13 })
    const innerDiameter = (
      config: RingConfig,
      measurements: ReturnType<typeof getRingMeasurements>
    ) => (measurements.centreRadius - ringStyleGeometryProfiles[config.style].shankDepth) * 20

    expect(innerDiameter({ ...defaultRingConfig, size: 4 }, size4)).toBeCloseTo(14.8812, 4)
    expect(innerDiameter({ ...defaultRingConfig, size: 13 }, size13)).toBeCloseTo(22.1964, 4)
    expect(size13.centreRadius).toBeGreaterThan(size4.centreRadius)
    expect(size13.outerRadius).toBeGreaterThan(size4.outerRadius)
  })

  test.each(ringStyles.map(({ id }) => id))(
    'preserves the requested inside diameter for the %s shank',
    (style) => {
      const config = { ...defaultRingConfig, style, size: 7 }
      const measurements = getRingMeasurements(config)
      const radialThickness = ringStyleGeometryProfiles[style].shankDepth

      expect((measurements.centreRadius - radialThickness) * 20).toBeCloseTo(17.3196, 4)
      expect((measurements.outerRadius - measurements.centreRadius) * 10).toBeCloseTo(
        radialThickness * 10,
        12
      )
    }
  )

  test('keeps one exact inner opal seat through every collection construction', () => {
    for (const style of ringStyles) {
      const profile = ringStyleGeometryProfiles[style.id]
      for (let index = 0; index < 360; index += 1) {
        const angle = (index / 360) * Math.PI * 2
        const contours = getBezelWallContourPoints(
          style.id,
          style.shape,
          angle,
          0.4,
          0.5,
          profile.bezelWallOffset,
          profile.bezelWallThickness
        )
        const exactSeat = outlinePoint(
          style.shape,
          angle,
          0.4,
          0.5,
          profile.bezelWallOffset - profile.bezelWallThickness / 2
        )
        expect(contours.inner).toEqual(exactSeat)
      }
    }
  })

  test('uses reviewed store measurements only for compatible catalogue silhouettes', () => {
    const measuredDimensions = getStoneDimensions(defaultRingConfig, measuredOpal)
    expect(measuredDimensions[0]).toBeCloseTo(0.4, 12)
    expect(measuredDimensions[1]).toBeCloseTo(0.7, 12)
    expect(getStoneDimensions({ ...defaultRingConfig, shape: 'round' }, measuredOpal)).toEqual([
      0.42, 0.42,
    ])
    expect(
      getStoneDimensions(defaultRingConfig, {
        ...measuredOpal,
        visual: { ...measuredOpal.visual, evidence: 'type-fallback' },
      })
    ).toEqual([0.4, 0.5])
    expect(
      getStoneDimensions(defaultRingConfig, {
        ...measuredOpal,
        selectionKind: 'parcel',
      })
    ).toEqual([0.4, 0.5])
  })

  test('uses plausible reviewed individual depth and ignores representative listings', () => {
    expect(getRenderableOpalDepthMm(measuredOpal)).toBe(3.2)
    expect(
      getRenderableOpalDepthMm({
        ...measuredOpal,
        visual: {
          ...measuredOpal.visual,
          dimensionsMm: { width: 4, length: 8, depth: 9 },
        },
      })
    ).toBe(3)
    expect(getRenderableOpalDepthMm({ ...measuredOpal, selectionKind: 'parcel' })).toBeUndefined()
    expect(
      getRenderableOpalDepthMm({
        ...measuredOpal,
        visual: { ...measuredOpal.visual, evidence: 'type-fallback' },
      })
    ).toBeUndefined()
  })

  test('caps both the visible seat and mounted dome independently from loose depth', () => {
    const shallow = getCabochonDepthProfile(0.4, 0.5, 1)
    const deep = getCabochonDepthProfile(0.4, 0.5, 10)

    expect(shallow.domeHeight).toBeCloseTo(0.042, 12)
    expect(shallow.girdleZ - shallow.baseZ).toBeCloseTo(0.058, 12)
    expect(deep.domeHeight).toBeCloseTo(0.18, 12)
    expect(deep.girdleZ - deep.baseZ).toBeCloseTo(0.08, 12)
  })

  test('keeps unmeasured opal crowns visible above each sold setting profile', () => {
    expect(getCabochonDepthProfile(0.4, 0.5, undefined, 'gemini').domeHeight).toBeCloseTo(
      0.116,
      12
    )
    expect(getCabochonDepthProfile(0.5, 0.5, undefined, 'coral').domeHeight).toBeCloseTo(
      0.11,
      12
    )
    expect(getCabochonDepthProfile(0.4, 0.5, undefined, 'sun-moon').domeHeight).toBeCloseTo(
      0.108,
      12
    )
    expect(getCabochonDepthProfile(0.4, 0.5, undefined, 'aurora').domeHeight).toBeCloseTo(
      0.124,
      12
    )
  })

  test.each([
    ['round', 0.42, 0.42],
    ['oval', 0.4, 0.5],
    ['elongated', 0.35, 0.62],
    ['cushion', 0.5, 0.5],
    ['pear', 0.4, 0.5],
    ['heart', 0.5, 0.5],
  ] as const)('preserves documented %s silhouette extents', (shape, width, height) => {
    const extents = sampledExtents(shape, width, height)
    expect(extents.maxX - extents.minX).toBeCloseTo(width * 2, 2)
    // The handmade heart's lobe maximum falls between sampled angles.
    expect(extents.maxY - extents.minY).toBeCloseTo(height * 2, shape === 'heart' ? 3 : 8)
  })

  test('keeps the heart point down, lobes symmetric, and offsets finite', () => {
    const width = 0.5
    const height = 0.5
    const point = outlinePoint('heart', -Math.PI / 2, width, height)
    const notch = outlinePoint('heart', Math.PI / 2, width, height)
    const leftLobe = outlinePoint('heart', Math.PI / 2 + 0.45, width, height)
    const rightLobe = outlinePoint('heart', Math.PI / 2 - 0.45, width, height)

    expect(point[0]).toBeCloseTo(0, 12)
    expect(point[1]).toBeCloseTo(-height, 12)
    expect(leftLobe[0]).toBeCloseTo(-rightLobe[0], 12)
    expect(leftLobe[1]).toBeCloseTo(rightLobe[1], 12)
    expect(leftLobe[1]).toBeGreaterThan(notch[1])
    expect(notch[1]).toBeGreaterThan(height * 0.8)

    for (let index = 0; index < 360; index += 1) {
      const angle = (index / 360) * Math.PI * 2
      const base = outlinePoint('heart', angle, width, height)
      const expanded = outlinePoint('heart', angle, width, height, 0.03)
      expect(expanded.every(Number.isFinite)).toBe(true)
      expect(Math.hypot(expanded[0] - base[0], expanded[1] - base[1])).toBeCloseTo(0.03, 10)
    }
  })

  test('keeps the sold pear broad through its lower body before the final point', () => {
    const upperRight = outlinePoint('pear', Math.PI / 4, 1, 1)
    const lowerRight = outlinePoint('pear', -Math.PI / 4, 1, 1)

    expect(upperRight[0]).toBeGreaterThanOrEqual(0.74)
    expect(upperRight[0]).toBeLessThanOrEqual(0.83)
    expect(lowerRight[0]).toBeGreaterThanOrEqual(0.53)
    expect(lowerRight[0]).toBeLessThanOrEqual(0.61)
    expect(outlinePoint('pear', -Math.PI / 2, 1, 1)).toEqual([expect.closeTo(0, 12), -1])
  })

  test('generates the workbench heart and pear clips from the 3D contour', () => {
    const heartClip = cssSilhouetteClipPath('heart')
    const pearClip = cssSilhouetteClipPath('pear')

    expect(heartClip).toMatch(/^polygon\(.+\)$/)
    expect(heartClip?.split(',')).toHaveLength(72)
    expect(heartClip).toContain('50% 100%')
    expect(pearClip).toMatch(/^polygon\(.+\)$/)
    expect(cssSilhouetteClipPath('oval')).toBeUndefined()
  })

  test('spaces handmade halo beads consistently along an oval perimeter', () => {
    const points = evenlySpacedOutlinePoints('oval', 0.4, 0.5, 0.08, 38)
    const chordLengths = points.map((point, index) => {
      const next = points[(index + 1) % points.length]!
      return Math.hypot(next.x - point.x, next.y - point.y)
    })
    const average = chordLengths.reduce((sum, length) => sum + length, 0) / chordLengths.length

    expect(points).toHaveLength(38)
    expect(new Set(points.map(({ key }) => key))).toHaveLength(38)
    expect(Math.max(...chordLengths) - Math.min(...chordLengths)).toBeLessThan(average * 0.16)
  })

  test('gives every photographed style plausible, distinct geometry', () => {
    const profiles = Object.entries(ringStyleGeometryProfiles)
    expect(profiles).toHaveLength(ringStyles.length)
    expect(new Set(profiles.map(([, profile]) => JSON.stringify(profile)))).toHaveLength(
      profiles.length
    )

    for (const [style, profile] of profiles) {
      expect(profile.shankRadius, style).toBeGreaterThanOrEqual(0.075)
      expect(profile.shankRadius, style).toBeLessThanOrEqual(0.11)
      expect(profile.shankRadius * 20, style).toBeGreaterThanOrEqual(1.5)
      expect(profile.shankRadius * 20, style).toBeLessThanOrEqual(2.2)
      expect(profile.shankDepth, style).toBeLessThan(profile.shankRadius)
      expect(profile.shoulderDepth, style).toBeLessThan(profile.shoulderRadius)
      expect(profile.crossSectionPower, style).toBeGreaterThanOrEqual(0.85)
      expect(profile.crossSectionPower, style).toBeLessThanOrEqual(1)
      expect(profile.shoulderRadius / profile.shankRadius, style).toBeLessThanOrEqual(1.1)
      expect(profile.shoulderBlend, style).toBeLessThanOrEqual(0.1)
      expect(profile.shoulderUnderlap, style).toBeGreaterThanOrEqual(0.06)
      expect(profile.shoulderUnderlap, style).toBeLessThanOrEqual(0.09)
      expect(profile.shoulderJoinDrop, style).toBeGreaterThanOrEqual(0.02)
      expect(profile.shoulderJoinDrop, style).toBeLessThanOrEqual(0.035)

      if (profile.beadCount > 0) {
        expect(profile.beadRadius, style).toBeGreaterThan(0)
        expect(profile.beadPitchMm, style).toBeGreaterThan(0)
        expect(profile.haloOffset - profile.beadRadius, style).toBeGreaterThan(
          profile.bezelLipOffset
        )
      } else {
        expect(profile.beadRadius, style).toBe(0)
        expect(profile.haloOffset, style).toBe(0)
      }
    }
  })

  test.each(ringStyles.map(({ id }) => id))(
    'keeps the %s shoulder transition monotonic, symmetric, and hidden beneath the head',
    (style) => {
      const config = { ...defaultRingConfig, ...applyRingStyle(defaultRingConfig, style) }
      const profile = ringStyleGeometryProfiles[style]
      const measurements = getRingMeasurements(config)
      const referenceDimensions = getStoneDimensions(config)

      for (const dimensions of [referenceDimensions, [0.25, 0.3], [1, 1.4]] as const) {
        const headHalfWidth = getSettingOuterHalfWidth(config, dimensions)
        const settingHalfWidth = getSettingShoulderHalfWidth(config, dimensions)
        const pathOptions = {
          radius: measurements.centreRadius,
          settingBaseY: measurements.outerRadius,
          settingHalfWidth,
          shoulderJoinDrop: profile.shoulderJoinDrop,
          shoulderTransition: profile.shoulderTransition,
          shoulderUnderlap: profile.shoulderUnderlap,
        }
        const path = getRingShankLandmarks(pathOptions)

        expect(path.joinLeft[0]).toBeCloseTo(-path.joinRight[0], 12)
        expect(path.transitionLeft[0]).toBeCloseTo(-path.transitionRight[0], 12)
        expect(path.arcStart[0]).toBeCloseTo(-path.arcEnd[0], 12)
        expect(path.joinLeft[1]).toBeCloseTo(path.joinRight[1], 12)
        expect(path.transitionLeft[1]).toBeCloseTo(path.transitionRight[1], 12)
        expect(path.arcStart[1]).toBeCloseTo(path.arcEnd[1], 12)

        // Moving from the buried left join into the circular shank must never
        // reverse horizontally or rise. The old overshooting waypoint produced
        // the hooked shoulders visible in profile.
        expect(path.joinLeft[0]).toBeGreaterThan(path.transitionLeft[0])
        expect(path.transitionLeft[0]).toBeGreaterThan(path.arcStart[0])
        expect(path.joinLeft[1]).toBeGreaterThan(path.transitionLeft[1])
        expect(path.transitionLeft[1]).toBeGreaterThan(path.arcStart[1])
        expect(Math.abs(path.joinLeft[0])).toBeLessThan(settingHalfWidth)
        expect(settingHalfWidth).toBeLessThanOrEqual(headHalfWidth)
        if (config.setting === 'beaded') {
          expect(settingHalfWidth).toBeLessThan(headHalfWidth)
        }

        const curve = new CatmullRomCurve3(
          getRingShankPathPoints(pathOptions).map((point) => new Vector3(...point)),
          false,
          'centripetal'
        )
        const shoulderSamples = Array.from({ length: 401 }, (_, index) =>
          curve.getPointAt(index / 400)
        ).filter((point) => point.x <= 0 && point.y >= path.arcStart[1])
        for (let index = 1; index < shoulderSamples.length; index += 1) {
          const previous = shoulderSamples[index - 1]!
          const current = shoulderSamples[index]!
          expect(current.x).toBeLessThanOrEqual(previous.x + 0.000_001)
          expect(current.y).toBeLessThanOrEqual(previous.y + 0.000_001)
        }
      }
    }
  )
})
