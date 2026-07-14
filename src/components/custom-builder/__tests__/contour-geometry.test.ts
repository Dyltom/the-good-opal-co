import { describe, expect, test } from 'vitest'
import type { BuilderStoneContourV1 } from '@/lib/custom-builder/stone-contour'
import {
  cssSilhouetteClipPath,
  evenlySpacedOutlinePoints,
  getBezelWallContourPoints,
  getSettingShoulderHalfWidth,
  outlinePoint,
} from '../geometry'

const contour: BuilderStoneContourV1 = {
  version: 1,
  radii: Array.from({ length: 96 }, (_, index) => {
    const angle = (index / 96) * Math.PI * 2
    return 0.88 + Math.cos(angle) * 0.08 + Math.sin(angle * 3) * 0.025
  }),
}

describe('per-opal contour geometry', () => {
  test('uses the photographed asymmetric boundary instead of the generic silhouette', () => {
    const diagonal = outlinePoint('oval', 0.7, 0.4, 0.5, 0, contour)
    const opposite = outlinePoint('oval', 0.7 + Math.PI, 0.4, 0.5, 0, contour)
    const generic = outlinePoint('oval', 0.7, 0.4, 0.5)

    expect(diagonal[0]).not.toBeCloseTo(Math.abs(opposite[0]), 3)
    expect(diagonal[1]).not.toBeCloseTo(Math.abs(opposite[1]), 3)
    expect(diagonal[0]).not.toBeCloseTo(generic[0], 3)
  })

  test('uses one contour for stone seat, bezel wall, halo path, and shoulder anchor', () => {
    const wall = getBezelWallContourPoints('gemini', 'oval', 0.7, 0.4, 0.5, 0.02, 0.04, contour)
    const halo = evenlySpacedOutlinePoints('oval', 0.4, 0.5, 0.09, 30, 0, 'aurora', contour)
    const shoulder = getSettingShoulderHalfWidth(
      { shape: 'oval', style: 'gemini' },
      [0.4, 0.5],
      contour
    )

    expect(wall.outer.every(Number.isFinite)).toBe(true)
    expect(wall.inner.every(Number.isFinite)).toBe(true)
    expect(
      Math.hypot(wall.outer[0] - wall.inner[0], wall.outer[1] - wall.inner[1])
    ).toBeGreaterThan(0)
    expect(halo).toHaveLength(30)
    expect(halo.every(({ x, y }) => Number.isFinite(x) && Number.isFinite(y))).toBe(true)
    expect(shoulder).toBeGreaterThan(0.35)
  })

  test('generates a workbench polygon from every stored contour sample', () => {
    const clip = cssSilhouetteClipPath('oval', contour)

    expect(clip).toMatch(/^polygon\(.+\)$/)
    expect(clip?.split(',')).toHaveLength(96)
  })

  test('normalizes an approved contour to the stone documented dimensions', () => {
    const points = Array.from({ length: 960 }, (_, index) =>
      outlinePoint('oval', (index / 960) * Math.PI * 2, 0.4, 0.5, 0, contour)
    )
    const xs = points.map(([x]) => x)
    const ys = points.map(([, y]) => y)

    expect(Math.max(...xs) - Math.min(...xs)).toBeCloseTo(0.8, 3)
    expect(Math.max(...ys) - Math.min(...ys)).toBeCloseTo(1, 3)
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(-0.401)
    expect(Math.max(...xs)).toBeLessThanOrEqual(0.401)
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(-0.501)
    expect(Math.max(...ys)).toBeLessThanOrEqual(0.501)
  })
})
