import { describe, expect, test } from 'vitest'
import { computePhotoCrop } from '../photo-crop'

describe('custom builder photo crops', () => {
  test.each([
    [1839, 1920, 1 / 1.23, { focalX: 0.501, focalY: 0.493, zoom: 3.61 }],
    [1920, 1865, 1 / 1.16, { focalX: 0.504, focalY: 0.487, zoom: 4.81 }],
    [1825, 1920, 1 / 1.77, { focalX: 0.517, focalY: 0.466, zoom: 4.74 }],
    [1920, 1855, 1 / 1.12, { focalX: 0.507, focalY: 0.495, zoom: 3.08 }],
  ] as const)(
    'keeps a reviewed source crop in bounds without stretching (%i x %i)',
    (imageWidth, imageHeight, stoneAspect, focus) => {
      const crop = computePhotoCrop(imageWidth, imageHeight, stoneAspect, focus)
      const croppedPixelAspect = (crop.width * imageWidth) / (crop.height * imageHeight)

      expect(crop.left).toBeGreaterThanOrEqual(0)
      expect(crop.top).toBeGreaterThanOrEqual(0)
      expect(crop.left + crop.width).toBeLessThanOrEqual(1)
      expect(crop.top + crop.height).toBeLessThanOrEqual(1)
      expect(croppedPixelAspect).toBeCloseTo(stoneAspect, 6)
    }
  )

  test('falls back to the complete image for invalid measurements', () => {
    expect(computePhotoCrop(0, 0, 0, { focalX: 0.5, focalY: 0.5, zoom: 0 })).toEqual({
      left: 0,
      top: 0,
      width: 1,
      height: 1,
    })
  })
})
