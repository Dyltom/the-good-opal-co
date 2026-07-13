import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'

const sceneSource = readFileSync(resolve(__dirname, '../RingScene.tsx'), 'utf8')

describe('photoreal ring rendering contract', () => {
  test('models a complete low bezel rather than a floating outline', () => {
    expect(sceneSource).toContain('function createSettingBaseGeometry(')
    expect(sceneSource).toContain('<SettingBase')
    expect(sceneSource).toContain('const bezelCapInnerOffset =')
    expect(sceneSource).toContain('thickness={bezelCapThickness}')
    expect(sceneSource).toContain('finish="patina"')
  })

  test('drives each forged shank and shoulder join from its sold-style profile', () => {
    expect(sceneSource).toContain('getSettingOuterHalfWidth(')
    expect(sceneSource).toContain('getRingShankPathPoints({')
    expect(sceneSource).toContain('shoulderDistance / shoulderBlend')
    expect(sceneSource).toContain('Math.pow(Math.abs(cosine), crossSectionPower)')
    expect(sceneSource).toContain('const acrossBand =')
    expect(sceneSource).toContain('const throughBand =')
    expect(sceneSource).toContain('const startCentre = positions.length / 3')
  })

  test('uses colour-managed PBR metals and studio shadows', () => {
    expect(sceneSource).toContain('metalness={0.96}')
    expect(sceneSource).toContain('envMapIntensity={2.2}')
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

  test('keeps the physical opal independent from collection-edge variation', () => {
    expect(sceneSource).toContain('const [x, y] = outlinePoint(shape, angle, width, height)')
    expect(sceneSource).not.toContain(
      'const [x, y] = soldStyleOutlinePoint(style, shape, angle, width, height)\n      positions.push(x * radius'
    )
  })

  test('uses exact catalogue colour and faceted Aurora grains', () => {
    expect(sceneSource).toContain('<meshBasicMaterial attach="material-0" map={photoTexture}')
    expect(sceneSource).toContain("config.style === 'aurora'")
    expect(sceneSource).toContain('<icosahedronGeometry')
  })
})
