import { BufferGeometry, Float32BufferAttribute } from 'three'
import { describe, expect, test } from 'vitest'
import { applyForgedNormalVariation } from '../forged-surface'

function testGeometry(): BufferGeometry {
  const geometry = new BufferGeometry()
  geometry.setAttribute(
    'position',
    new Float32BufferAttribute([0, 0, 0, 0.1, 0.2, 0.3, -0.2, 0.15, 0.08], 3)
  )
  geometry.setAttribute(
    'normal',
    new Float32BufferAttribute([0, 0, 1, 0, 1, 0, 1, 0, 0], 3)
  )
  return geometry
}

function values(geometry: BufferGeometry, name: 'normal' | 'position'): number[] {
  return Array.from(geometry.getAttribute(name).array)
}

describe('forged metal surface', () => {
  test('changes only normals and remains deterministic', () => {
    const first = testGeometry()
    const second = testGeometry()
    const originalPositions = values(first, 'position')

    applyForgedNormalVariation(first, 0.1, 37)
    applyForgedNormalVariation(second, 0.1, 37)

    expect(values(first, 'position')).toEqual(originalPositions)
    expect(values(first, 'normal')).toEqual(values(second, 'normal'))
    expect(values(first, 'normal')).not.toEqual([0, 0, 1, 0, 1, 0, 1, 0, 0])
  })

  test('keeps every normal normalized and bounds excessive input', () => {
    const geometry = testGeometry()
    applyForgedNormalVariation(geometry, 10, 19)
    const normal = geometry.getAttribute('normal')

    for (let index = 0; index < normal.count; index += 1) {
      expect(Math.hypot(normal.getX(index), normal.getY(index), normal.getZ(index))).toBeCloseTo(1, 5)
    }
  })

  test('leaves normals unchanged when strength is not positive', () => {
    const geometry = testGeometry()
    const originalNormals = values(geometry, 'normal')
    applyForgedNormalVariation(geometry, 0, 19)
    expect(values(geometry, 'normal')).toEqual(originalNormals)
  })
})
