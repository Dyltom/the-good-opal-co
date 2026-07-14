import { describe, expect, test } from 'vitest'
import { getRingStyleFit, type BuilderOpal, type RingConfig } from '../config'

function opal(
  silhouette: RingConfig['shape'],
  dimensionsMm?: BuilderOpal['visual']['dimensionsMm']
): Pick<BuilderOpal, 'visual'> {
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
      dimensionsMm,
    },
  }
}

describe('sold ring style adaptation', () => {
  test.each([
    ['gemini', 'oval', 'original'],
    ['gemini', 'elongated', 'adapted'],
    ['gemini', 'cushion', 'adapted'],
    ['coral', 'cushion', 'original'],
    ['coral', 'oval', 'adapted'],
    ['coral', 'heart', 'adapted'],
    ['sun-moon', 'oval', 'original'],
    ['sun-moon', 'elongated', 'adapted'],
    ['aurora', 'pear', 'original'],
    ['aurora', 'oval', 'adapted'],
    ['aurora', 'heart', 'adapted'],
  ] as const)('%s with %s is %s', (style, silhouette, fit) => {
    expect(getRingStyleFit(style, opal(silhouette)).kind).toBe(fit)
  })

  test('labels an unmeasured shape match as a reference silhouette only', () => {
    expect(getRingStyleFit('gemini', opal('oval'))).toEqual({
      kind: 'original',
      label: 'Reference silhouette',
    })
  })

  test('reserves reference proportions for measured stones close to the sold reference', () => {
    expect(getRingStyleFit('gemini', opal('oval', { width: 8.2, length: 10.5, depth: 3 }))).toEqual(
      { kind: 'original', label: 'Reference proportions' }
    )
    expect(getRingStyleFit('gemini', opal('oval', { width: 6, length: 7, depth: 3 }))).toEqual({
      kind: 'adapted',
      label: 'Adapted proportions',
    })
  })
})
