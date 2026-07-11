import { describe, expect, test } from 'vitest'
import { isRingStyleCompatible, type BuilderOpal, type RingConfig } from '../config'

function opal(silhouette: RingConfig['shape']): Pick<BuilderOpal, 'visual'> {
  return {
    visual: {
      silhouette,
      aspectRatio: 1,
      bodyColour: '#888888',
      flashColours: ['#ffffff'],
      transmission: 0,
      patternSeed: 1,
      evidence: 'catalogue',
      recommendedStyle: 'gemini',
    },
  }
}

describe('sold ring style compatibility', () => {
  test.each([
    ['gemini', 'oval', true],
    ['gemini', 'elongated', true],
    ['gemini', 'cushion', false],
    ['coral', 'cushion', true],
    ['coral', 'oval', false],
    ['sun-moon', 'oval', true],
    ['sun-moon', 'elongated', false],
    ['aurora', 'pear', true],
    ['aurora', 'oval', false],
  ] as const)('%s with %s is %s', (style, silhouette, compatible) => {
    expect(isRingStyleCompatible(style, opal(silhouette))).toBe(compatible)
  })
})
