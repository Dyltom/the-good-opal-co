import { describe, expect, test } from 'vitest'
import {
  parseBuilderStoneContour,
  type BuilderStoneContourV1,
} from '@/lib/custom-builder/stone-contour'
import { ringStyleGeometryProfiles } from '../config'
import {
  applyHandmadeBeadVariation,
  coalesceOverlappingHaloBeads,
  cssSilhouetteClipPath,
  evenlySpacedOutlinePoints,
  fuseContactingHaloBeads,
  getBezelWallContourPoints,
  getHaloBeadSurfaceGap,
  getHaloStoneContour,
  getSettingShoulderHalfWidth,
  getStyleBeadCount,
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

  test('keeps every non-folded grain fused around an accepted wavy contour', () => {
    const wavyContour = parseBuilderStoneContour({
      version: 1,
      radii: Array.from({ length: 96 }, (_, index) => {
        const angle = (index / 96) * Math.PI * 2
        return 1 + Math.sin(angle * 6) * 0.1
      }),
    })
    expect(wavyContour).toBeDefined()

    const profile = ringStyleGeometryProfiles.aurora
    const haloContour = getHaloStoneContour(wavyContour)
    const count = getStyleBeadCount('aurora', 'oval', 0.4, 0.5, haloContour)
    const varied = applyHandmadeBeadVariation(
      evenlySpacedOutlinePoints(
        'oval',
        0.4,
        0.5,
        profile.haloOffset,
        count,
        profile.haloPhase,
        'aurora',
        haloContour
      ),
      profile.beadVariation,
      profile.beadFlattening,
      profile.beadAsymmetry
    )
    const coalesced = coalesceOverlappingHaloBeads(varied, profile.beadRadius)
    const fused = fuseContactingHaloBeads(coalesced, profile.beadRadius)
    const gaps = fused.map((bead, index) =>
      getHaloBeadSurfaceGap(bead, fused[(index + 1) % fused.length]!, profile.beadRadius)
    )

    expect(coalesced).toHaveLength(varied.length)
    expect(Math.min(...gaps)).toBeGreaterThanOrEqual(-0.018)
    expect(Math.max(...gaps)).toBeLessThanOrEqual(0.006)
  })

  test('fits grains around an accepted compound contour without blobs or voids', () => {
    const terms = [
      [2, 0.0034628526493906972, 0.6877147271759518],
      [3, 0.03850963147357106, 2.757098501545037],
      [4, 0.006245822980999946, 5.069776857927168],
      [5, -0.03038160117343068, 1.7611219703704721],
      [6, -0.053133015297353266, 2.9342648063984775],
      [7, 0.05827762925997376, 1.003849571529726],
    ] as const
    const compoundContour = parseBuilderStoneContour({
      version: 1,
      radii: Array.from({ length: 96 }, (_, index) => {
        const angle = (index / 96) * Math.PI * 2
        return 1 + terms.reduce((sum, [frequency, amplitude, phase]) => {
          return sum + amplitude * Math.sin(frequency * angle + phase)
        }, 0)
      }),
    })
    expect(compoundContour).toBeDefined()

    const profile = ringStyleGeometryProfiles['sun-moon']
    const haloContour = getHaloStoneContour(compoundContour)
    const count = getStyleBeadCount('sun-moon', 'oval', 0.4, 0.5, haloContour)
    const varied = applyHandmadeBeadVariation(
      evenlySpacedOutlinePoints(
        'oval',
        0.4,
        0.5,
        profile.haloOffset,
        count,
        profile.haloPhase,
        'sun-moon',
        haloContour
      ),
      profile.beadVariation,
      profile.beadFlattening,
      profile.beadAsymmetry
    )
    const coalesced = coalesceOverlappingHaloBeads(varied, profile.beadRadius)
    const fused = fuseContactingHaloBeads(coalesced, profile.beadRadius)
    const gaps = fused.map((bead, index) =>
      getHaloBeadSurfaceGap(bead, fused[(index + 1) % fused.length]!, profile.beadRadius)
    )

    expect(coalesced.length).toBeGreaterThanOrEqual(varied.length - 1)
    expect(coalesced.length).toBeLessThanOrEqual(varied.length)
    expect(Math.min(...gaps)).toBeGreaterThanOrEqual(-0.0185)
    expect(Math.max(...gaps)).toBeLessThanOrEqual(0.006)
  })
})
