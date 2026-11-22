import { describe, expect, test } from 'vitest'
import { applyRingStyle, configWithOpal, defaultRingConfig, type BuilderOpal } from '../config'

function opal(silhouette: BuilderOpal['visual']['silhouette']) {
  return {
    id: '42',
    renderStone: 'lightning',
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
  } satisfies Pick<BuilderOpal, 'id' | 'renderStone' | 'visual'>
}

describe('picking an opal in the builder', () => {
  test('keeps the chosen design when the opal fits it', () => {
    const dewdrop = applyRingStyle(defaultRingConfig, 'dewdrop')

    expect(configWithOpal(dewdrop, opal('pear'))).toMatchObject({
      style: 'dewdrop',
      setting: 'claw-4',
      shape: 'pear',
      opalId: '42',
      stone: 'lightning',
    })
  })

  test('moves to the opal’s recommended design when the chosen one cannot hold it', () => {
    const aurora = applyRingStyle(defaultRingConfig, 'aurora')

    expect(configWithOpal(aurora, opal('oval'))).toMatchObject({
      style: 'gemini',
      shape: 'oval',
      opalId: '42',
    })
  })
})
