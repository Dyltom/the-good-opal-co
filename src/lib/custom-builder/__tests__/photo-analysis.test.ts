import { describe, expect, test } from 'vitest'
import { analyzeOpalRaster, OPAL_PHOTO_ANALYSIS_VERSION } from '../photo-analysis'
import { BUILDER_STONE_CONTOUR_SAMPLE_COUNT, parseBuilderStoneContour } from '../stone-contour'

type Colour = readonly [number, number, number, number?]

function ellipseRaster({
  background = [238, 234, 226, 255],
  centreX,
  centreY,
  channels = 3,
  height,
  radiusX,
  radiusY,
  stone = [22, 83, 96, 255],
  width,
}: {
  background?: Colour
  centreX: number
  centreY: number
  channels?: 3 | 4
  height: number
  radiusX: number
  radiusY: number
  stone?: Colour
  width: number
}) {
  const data = new Uint8ClampedArray(width * height * channels)
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const inside =
        ((x + 0.5 - centreX) / radiusX) ** 2 + ((y + 0.5 - centreY) / radiusY) ** 2 <= 1
      const colour = inside ? stone : background
      const offset = (y * width + x) * channels
      data[offset] = colour[0]
      data[offset + 1] = colour[1]
      data[offset + 2] = colour[2]
      if (channels === 4) data[offset + 3] = colour[3] ?? 255
    }
  }
  return { channels, data, height, width }
}

function asymmetricShapeRaster({
  shape,
  upsideDown,
}: {
  shape: 'heart' | 'pear'
  upsideDown: boolean
}) {
  const width = 180
  const height = 180
  const channels = 3 as const
  const data = new Uint8ClampedArray(width * height * channels)
  const background = [238, 234, 226] as const
  const stone = [22, 83, 96] as const

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const normalizedX = (x + 0.5 - width / 2) / 54
      const modelY = (height / 2 - y - 0.5) / 58
      const normalizedY = upsideDown ? -modelY : modelY
      const inside =
        shape === 'heart'
          ? (normalizedX ** 2 + normalizedY ** 2 - 1) ** 3 - normalizedX ** 2 * normalizedY ** 3 <=
            0
          : Math.abs(normalizedX) <=
            Math.sqrt(Math.max(0, 1 - normalizedY ** 2)) * (0.72 + normalizedY * 0.25)
      const colour = inside ? stone : background
      const offset = (y * width + x) * channels
      data[offset] = colour[0]
      data[offset + 1] = colour[1]
      data[offset + 2] = colour[2]
    }
  }

  return { channels, data, height, width }
}

describe('opal photo crop analysis', () => {
  test('finds a centred vertical stone against its border colour', () => {
    const analysis = analyzeOpalRaster({
      ...ellipseRaster({
        width: 160,
        height: 140,
        centreX: 80,
        centreY: 70,
        radiusX: 24,
        radiusY: 44,
      }),
      stoneAspect: 24 / 44,
    })

    expect(OPAL_PHOTO_ANALYSIS_VERSION).toBe(4)
    expect(analysis).toBeDefined()
    expect(parseBuilderStoneContour(analysis?.contour)?.radii).toHaveLength(
      BUILDER_STONE_CONTOUR_SAMPLE_COUNT
    )
    expect(analysis?.focalX).toBeCloseTo(0.5, 2)
    expect(analysis?.focalY).toBeCloseTo(0.5, 2)
    expect(analysis?.zoom).toBeGreaterThanOrEqual(3.2)
    expect(analysis?.zoom).toBeLessThan(4.1)
    expect(analysis?.rotation).toBeCloseTo(0, 4)
    expect(analysis?.source).toBe('image')
    expect(analysis?.confidence).toBeGreaterThan(0.75)
  })

  test('tracks an off-centre RGBA stone without snapping it to image centre', () => {
    const analysis = analyzeOpalRaster({
      ...ellipseRaster({
        width: 200,
        height: 160,
        centreX: 139,
        centreY: 54,
        radiusX: 23,
        radiusY: 37,
        channels: 4,
      }),
      stoneAspect: 23 / 37,
    })

    expect(analysis).toBeDefined()
    expect(analysis?.focalX).toBeCloseTo(139 / 200, 2)
    expect(analysis?.focalY).toBeCloseTo(54 / 160, 2)
    expect(analysis?.confidence).toBeGreaterThan(0.65)
  })

  test('rotates a horizontal stone toward a vertical aperture', () => {
    const analysis = analyzeOpalRaster({
      ...ellipseRaster({
        width: 180,
        height: 140,
        centreX: 90,
        centreY: 70,
        radiusX: 46,
        radiusY: 18,
      }),
      stoneAspect: 18 / 46,
    })

    expect(analysis).toBeDefined()
    expect(Math.abs(analysis?.rotation ?? 0)).toBeCloseTo(90, 4)
    expect(analysis?.focalX).toBeCloseTo(0.5, 2)
    expect(analysis?.focalY).toBeCloseTo(0.5, 2)
    expect(analysis?.contour.radii).toHaveLength(BUILDER_STONE_CONTOUR_SAMPLE_COUNT)
  })

  test('does not rotate an upright near-square heart or cushion from an ambiguous PCA axis', () => {
    const analysis = analyzeOpalRaster({
      ...ellipseRaster({
        width: 160,
        height: 140,
        centreX: 80,
        centreY: 70,
        radiusX: 36,
        radiusY: 30,
      }),
      stoneAspect: 0.92,
    })

    expect(analysis).toBeDefined()
    expect(analysis?.rotation).toBe(0)
  })

  test.each(['heart', 'pear'] as const)(
    'uses the %s silhouette to resolve an upside-down source photo',
    (shape) => {
      const upright = analyzeOpalRaster({
        ...asymmetricShapeRaster({ shape, upsideDown: false }),
        shapeHint: shape,
        stoneAspect: shape === 'heart' ? 0.96 : 0.72,
      })
      const upsideDown = analyzeOpalRaster({
        ...asymmetricShapeRaster({ shape, upsideDown: true }),
        shapeHint: shape,
        stoneAspect: shape === 'heart' ? 0.96 : 0.72,
      })

      expect(upright).toBeDefined()
      expect(upsideDown).toBeDefined()
      expect(upright?.rotation).toBe(0)
      expect(Math.abs(upsideDown?.rotation ?? 0)).toBe(180)
      expect(upsideDown?.contour.radii).toEqual(upright?.contour.radii)
    }
  )

  test('prefers the substantial component near centre over a corner distraction', () => {
    const raster = ellipseRaster({
      width: 180,
      height: 160,
      centreX: 96,
      centreY: 82,
      radiusX: 25,
      radiusY: 42,
    })
    for (let y = 10; y < 22; y += 1) {
      for (let x = 12; x < 27; x += 1) {
        const offset = (y * raster.width + x) * raster.channels
        raster.data[offset] = 5
        raster.data[offset + 1] = 5
        raster.data[offset + 2] = 5
      }
    }

    const analysis = analyzeOpalRaster({ ...raster, stoneAspect: 25 / 42 })

    expect(analysis).toBeDefined()
    expect(analysis?.focalX).toBeCloseTo(96 / 180, 2)
    expect(analysis?.focalY).toBeCloseTo(82 / 160, 2)
  })

  test('persists an asymmetric freeform boundary instead of reducing it to a named shape', () => {
    const raster = ellipseRaster({
      width: 180,
      height: 160,
      centreX: 90,
      centreY: 80,
      radiusX: 30,
      radiusY: 45,
    })
    for (let y = 68; y < 91; y += 1) {
      for (let x = 116; x < 133; x += 1) {
        const offset = (y * raster.width + x) * raster.channels
        raster.data[offset] = 22
        raster.data[offset + 1] = 83
        raster.data[offset + 2] = 96
      }
    }

    const analysis = analyzeOpalRaster({ ...raster, stoneAspect: 30 / 45 })
    const parsed = parseBuilderStoneContour(analysis?.contour)

    expect(parsed).toBeDefined()
    expect(parsed?.radii).toHaveLength(BUILDER_STONE_CONTOUR_SAMPLE_COUNT)
    expect(Math.max(...parsed!.radii) - Math.min(...parsed!.radii)).toBeGreaterThan(0.12)
  })

  test('returns bounded deterministic output for a stone near an image edge', () => {
    const input = {
      ...ellipseRaster({
        width: 120,
        height: 100,
        centreX: 91,
        centreY: 62,
        radiusX: 17,
        radiusY: 28,
      }),
      stoneAspect: 0.01,
    }
    const first = analyzeOpalRaster(input)
    const second = analyzeOpalRaster(input)

    expect(first).toEqual(second)
    expect(first).toBeDefined()
    expect(first?.focalX).toBeGreaterThanOrEqual(0)
    expect(first?.focalX).toBeLessThanOrEqual(1)
    expect(first?.focalY).toBeGreaterThanOrEqual(0)
    expect(first?.focalY).toBeLessThanOrEqual(1)
    expect(first?.zoom).toBeGreaterThanOrEqual(1)
    expect(first?.zoom).toBeLessThanOrEqual(12)
    expect(first?.rotation).toBeGreaterThanOrEqual(-90)
    expect(first?.rotation).toBeLessThanOrEqual(90)
    expect(first?.confidence).toBeGreaterThanOrEqual(0)
    expect(first?.confidence).toBeLessThanOrEqual(1)
    expect(first?.contour).toEqual(second?.contour)
  })

  test('returns undefined for uniform or malformed rasters', () => {
    expect(
      analyzeOpalRaster({ data: new Uint8Array(48 * 48 * 3).fill(120), width: 48, height: 48 })
    ).toBeUndefined()
    expect(analyzeOpalRaster({ data: new Uint8Array(12), width: 48, height: 48 })).toBeUndefined()
    expect(
      analyzeOpalRaster({ data: new Uint8Array(7 * 7 * 3), width: 7, height: 7 })
    ).toBeUndefined()
  })

  test('uses reviewed framing as a low-confidence candidate when pixels are ambiguous', () => {
    const analysis = analyzeOpalRaster({
      data: new Uint8Array(48 * 48 * 3).fill(120),
      height: 48,
      reviewedCropHint: { focalX: 0.43, focalY: 0.57, rotation: -8, zoom: 5.2 },
      shapeHint: 'pear',
      width: 48,
    })

    expect(analysis).toMatchObject({
      confidence: 0.7,
      focalX: 0.43,
      focalY: 0.57,
      rotation: -8,
      source: 'canonical-fallback',
      zoom: 5.2,
    })
    expect(parseBuilderStoneContour(analysis?.contour)).toBeDefined()
  })
})
