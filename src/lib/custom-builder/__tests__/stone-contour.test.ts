import { describe, expect, test } from 'vitest'
import {
  BUILDER_STONE_CONTOUR_SAMPLE_COUNT,
  BUILDER_STONE_CONTOUR_VERSION,
  contourRadiusAt,
  parseBuilderStoneContour,
  validateBuilderStoneContour,
} from '../stone-contour'

function contour(radii = Array.from({ length: BUILDER_STONE_CONTOUR_SAMPLE_COUNT }, () => 1)) {
  return { version: BUILDER_STONE_CONTOUR_VERSION, radii }
}

describe('builder stone contour', () => {
  test('parses one bounded versioned contour without retaining caller array identity', () => {
    const value = contour()
    const parsed = parseBuilderStoneContour(value)

    expect(parsed).toEqual(value)
    expect(parsed?.radii).not.toBe(value.radii)
    expect(validateBuilderStoneContour(value)).toBe(true)
    expect(validateBuilderStoneContour(null)).toBe(true)
  })

  test('rejects malformed, unsafe, and implausibly discontinuous contours', () => {
    expect(parseBuilderStoneContour({ version: 2, radii: contour().radii })).toBeUndefined()
    expect(parseBuilderStoneContour({ version: 1, radii: [1] })).toBeUndefined()
    expect(
      parseBuilderStoneContour(contour([Number.NaN, ...Array.from({ length: 95 }, () => 1)]))
    ).toBeUndefined()
    expect(
      parseBuilderStoneContour(contour([2, ...Array.from({ length: 95 }, () => 1)]))
    ).toBeUndefined()
    expect(
      parseBuilderStoneContour(contour([0.1, 0.9, ...Array.from({ length: 94 }, () => 0.9)]))
    ).toBeUndefined()
    expect(
      parseBuilderStoneContour(
        contour(
          Array.from({ length: BUILDER_STONE_CONTOUR_SAMPLE_COUNT }, (_, index) =>
            index % 2 === 0 ? 0.8 : 1
          )
        )
      )
    ).toBeUndefined()
    expect(
      parseBuilderStoneContour(
        contour(Array.from({ length: BUILDER_STONE_CONTOUR_SAMPLE_COUNT }, () => 0.4))
      )
    ).toBeUndefined()
    expect(
      parseBuilderStoneContour(
        contour(
          Array.from({ length: BUILDER_STONE_CONTOUR_SAMPLE_COUNT }, (_, index) =>
            index === 0 || index === 1 || index === 95 ? 1.2 : 1
          )
        )
      )
    ).toBeUndefined()
    expect(validateBuilderStoneContour({ version: 1, radii: [] })).toBeTypeOf('string')
  })

  test('interpolates circular samples across positive, negative, and wrapped angles', () => {
    const radii = Array.from({ length: BUILDER_STONE_CONTOUR_SAMPLE_COUNT }, (_, index) =>
      index === 0 ? 1 : index === 1 ? 1.08 : index === 95 ? 0.92 : 1
    )
    const parsed = parseBuilderStoneContour(contour(radii))!
    const halfSample = Math.PI / BUILDER_STONE_CONTOUR_SAMPLE_COUNT

    expect(contourRadiusAt(parsed, 0)).toBe(1)
    expect(contourRadiusAt(parsed, halfSample)).toBeCloseTo(1.04, 12)
    expect(contourRadiusAt(parsed, -halfSample)).toBeCloseTo(0.96, 12)
    expect(contourRadiusAt(parsed, Math.PI * 2)).toBe(1)
    expect(contourRadiusAt(parsed, Number.NaN)).toBe(1)
  })
})
