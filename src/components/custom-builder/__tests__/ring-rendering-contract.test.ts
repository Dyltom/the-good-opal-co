import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'

const sceneSource = readFileSync(resolve(__dirname, '../RingScene.tsx'), 'utf8')

describe('photoreal ring rendering contract', () => {
  test('models a complete low bezel rather than a floating outline', () => {
    expect(sceneSource).toContain('function createSettingBaseGeometry(')
    expect(sceneSource).toContain('<SettingBase')
    expect(sceneSource).toContain('offset={profile.bezelLipOffset}')
    expect(sceneSource).toContain('finish="patina"')
  })

  test('drives each forged shank and shoulder join from its sold-style profile', () => {
    expect(sceneSource).toContain('shoulderDepth * joinInsetFactor')
    expect(sceneSource).toContain('shoulderDistance / shoulderBlend')
    expect(sceneSource).toContain('Math.pow(Math.abs(cosine), crossSectionPower)')
    expect(sceneSource).toContain('const acrossBand =')
    expect(sceneSource).toContain('const throughBand =')
  })

  test('uses colour-managed PBR metals and studio shadows', () => {
    expect(sceneSource).toContain('metalness={1}')
    expect(sceneSource).toContain('gl.toneMapping = ACESFilmicToneMapping')
    expect(sceneSource).toContain('shadows={{ type: PCFShadowMap }}')
    expect(sceneSource).toContain('<Environment resolution={256}>')
    expect(sceneSource).toContain('<ContactShadows')
  })

  test('applies customer crop placement to the photographed opal texture', () => {
    expect(sceneSource).toContain('computePlacedPhotoCrop(')
    expect(sceneSource).toContain('nextTexture.rotation = (-config.opalRotation * Math.PI) / 180')
    expect(sceneSource).toContain('nextTexture.center.set(0.5, 0.5)')
  })
})
