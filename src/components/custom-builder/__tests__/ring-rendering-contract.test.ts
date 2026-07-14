import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'

const sceneSource = readFileSync(resolve(__dirname, '../RingScene.tsx'), 'utf8')

describe('photoreal ring rendering contract', () => {
  test('models a complete low bezel rather than a floating outline', () => {
    expect(sceneSource).toContain('function createSettingBaseGeometry(')
    expect(sceneSource).toContain('<SettingBase')
    expect(sceneSource).toContain('bottomZ={bezelBottom - profile.cupDepth}')
    expect(sceneSource).toContain('bottomOffset={outerBezelOffset - profile.cupTaper}')
    expect(sceneSource).toContain('topOffset={outerBezelOffset}')
    expect(sceneSource).toContain('topZ={depthProfile.baseZ + 0.003}')
    expect(sceneSource).toContain('const bezelCapInnerOffset =')
    expect(sceneSource).toContain('function createProfiledBezelLipGeometry(')
    expect(sceneSource).toContain('<ProfiledBezelLip')
    expect(sceneSource).toContain('profile.bezelLipProfile')
    expect(sceneSource).toContain("profile[ring + 1]?.finish === 'patina'")
    expect(sceneSource).toContain('finish="patina"')
    expect(sceneSource).toContain('getPatinaGrooveProfile(')
    expect(sceneSource).toContain('bottomZ={patinaGroove.bottomZ}')
    expect(sceneSource).toContain('thickness={patinaGroove.thickness}')
    expect(sceneSource).toContain('topZ={patinaGroove.topZ}')
    expect(sceneSource).not.toContain('<tubeGeometry args={[curve, 96, radius, 14, true]} />')
  })

  test('drives each forged shank and shoulder join from its sold-style profile', () => {
    expect(sceneSource).toContain('getSettingShoulderHalfWidth(')
    expect(sceneSource).toContain('shoulderAnchorHalfWidth')
    expect(sceneSource).toContain('getRingShankCurve({')
    expect(sceneSource).toContain(
      'getShoulderBlendProgress(progress, curveLength, shoulderBlendLengthMm)'
    )
    expect(sceneSource).toContain('shoulderLandingLengthMm')
    expect(sceneSource).toContain('getDShankCrossSection(')
    expect(sceneSource).toContain('shankInnerFacePower')
    expect(sceneSource).toContain('inPlaneNormal.dot(toCentre) < 0')
    expect(sceneSource).toContain('const radialSegments = 24')
    expect(sceneSource).toContain('shankForgedVariation')
    expect(sceneSource).toContain('getForgedMetalTone(progress, side / radialSegments)')
    expect(sceneSource).toContain("setAttribute('color', new Float32BufferAttribute(colours, 3))")
    expect(sceneSource).toContain('roughness={metalRoughness} vertexColors')
    expect(sceneSource).not.toContain('const startCentre = positions.length / 3')
  })

  test('uses colour-managed PBR metals without a visible contact-shadow plane', () => {
    expect(sceneSource).toContain('metalness={0.96}')
    expect(sceneSource).toContain('envMapIntensity={1.3}')
    expect(sceneSource).toContain('gl.toneMapping = ACESFilmicToneMapping')
    expect(sceneSource).toContain('shadows={{ type: PCFShadowMap }}')
    expect(sceneSource).toContain('<Environment resolution={256}>')
    expect(sceneSource).not.toContain('<ContactShadows')
  })

  test('applies customer crop placement to the photographed opal texture', () => {
    expect(sceneSource).toContain('computePlacedPhotoCrop(')
    expect(sceneSource).toContain('const rotation = (crop.rotation ?? 0) + config.opalRotation')
    expect(sceneSource).toContain('const [m00, m01, m02, m10, m11, m12] = transform.matrix')
    expect(sceneSource).toContain('photoTexture.matrix.set(m00, m01, m02, m10, m11, m12, 0, 0, 1)')
    expect(sceneSource).toContain('}, [sourcePhoto])')
  })

  test('keeps the physical opal independent from collection-edge variation', () => {
    expect(sceneSource).toContain(
      'const [x, y] = outlinePoint(shape, angle, width, height, 0, contour)'
    )
    expect(sceneSource).not.toContain(
      'const [x, y] = soldStyleOutlinePoint(style, shape, angle, width, height)\n      positions.push(x * radius'
    )
  })

  test('uses exact catalogue colour and style-specific solder grains', () => {
    expect(sceneSource).toContain('<meshBasicMaterial\n            attach="material-0"')
    expect(sceneSource).toContain('map={photoTexture}')
    expect(sceneSource).toContain('toneMapped={false}')
    expect(sceneSource).toContain("profile.beadShape === 'granulated'")
    expect(sceneSource).toContain('<sphereGeometry args={[profile.beadRadius, 10, 8]} />')
    expect(sceneSource).toContain('<sphereGeometry args={[profile.beadRadius, 10, 6]} />')
    expect(sceneSource).toContain('<SolderGrainMaterial')
    expect(sceneSource).toContain("if (style !== 'aurora')")
    expect(sceneSource).toContain('envMapIntensity={0.62}')
    expect(sceneSource).toContain('getGrainDerivedHaloSupportOutline({')
    expect(sceneSource).toContain('<HaloSupport')
    expect(sceneSource).toMatch(/function HaloSupport[\s\S]*<PatinaMaterial metal=\{config\.metal\}/)
  })
})
