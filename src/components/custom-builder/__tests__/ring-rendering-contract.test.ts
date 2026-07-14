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
    expect(sceneSource).toContain('getRingShankCapTopology(tubularSegments, radialSegments)')
    expect(sceneSource).toContain('positions.push(startPoint.x, startPoint.y, startPoint.z')
    expect(sceneSource).toContain('indices.push(...capTopology.indices)')
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
    expect(sceneSource).toContain('envMapIntensity={1.4}')
    expect(sceneSource).toContain('gl.toneMapping = ACESFilmicToneMapping')
    expect(sceneSource).toContain('shadows={{ type: PCFShadowMap }}')
    expect(sceneSource).toContain('<Environment resolution={256}>')
    expect(sceneSource).not.toContain('<ContactShadows')
  })

  test('applies customer crop placement to the photographed opal texture', () => {
    expect(sceneSource).toContain('computePlacedPhotoCrop(')
    expect(sceneSource).toContain('constrainPhotoPlacementRotation(')
    expect(sceneSource).toContain('const rotation = (crop.rotation ?? 0) + customerRotation')
    expect(sceneSource).toContain('const [m00, m01, m02, m10, m11, m12] = transform.matrix')
    expect(sceneSource).toContain('photoTexture.matrix.set(m00, m01, m02, m10, m11, m12, 0, 0, 1)')
    expect(sceneSource).toContain('}, [sourcePhoto])')
  })

  test('settles opals without remounting or pulling their contour away from the bezel', () => {
    expect(sceneSource).toContain('transitionKey={renderedOpal.id}')
    expect(sceneSource).not.toContain('key={renderedOpal.id}')
    expect(sceneSource).not.toContain('group.current.scale.set(')
    expect(sceneSource).not.toContain('group.current.rotation')
    expect(sceneSource).toContain('group.current.position.z = transform.offsetZ')
    expect(sceneSource).toContain(
      'settleStartOffset={getOpalSettleStartOffset(depthProfile, bezelTop)}'
    )
    expect(sceneSource).toContain(
      'const shouldAnimate = animate && previousTransitionKey.current !== transitionKey'
    )
    expect(sceneSource).toContain('else invalidate()')
    expect(sceneSource).toContain('animateOpalPlacement={!reduceMotion}')
  })

  test('keeps the physical opal independent from collection-edge variation', () => {
    expect(sceneSource).toContain(
      'const [x, y] = outlinePoint(shape, angle, width, height, 0, contour)'
    )
    expect(sceneSource).not.toContain(
      'const [x, y] = soldStyleOutlinePoint(style, shape, angle, width, height)\n      positions.push(x * radius'
    )
  })

  test('uses physically lit catalogue colour and fused style-specific solder grains', () => {
    expect(sceneSource).toContain('<meshPhysicalMaterial\n            attach="material-0"')
    expect(sceneSource).toContain('map={photoTexture}')
    expect(sceneSource).toContain('clearcoat={0.38}')
    expect(sceneSource).toContain('roughness={0.24}')
    expect(sceneSource).toContain('specularIntensity={0.32}')
    expect(sceneSource).toContain('toneMapped={false}')
    expect(sceneSource).toContain("profile.beadPrimitive === 'rounded-granule'")
    expect(sceneSource).toContain('<sphereGeometry args={[profile.beadRadius, 20, 14]} />')
    expect(sceneSource).toContain("profile.beadPrimitive === 'organic-granule'")
    expect(sceneSource).toContain('<icosahedronGeometry args={[profile.beadRadius, 1]} />')
    expect(sceneSource).not.toContain('lobeOffset')
    expect(sceneSource).toContain(
      'rotation={isOrganicGrain ? [grainTiltX, grainTiltY, 0] : undefined}'
    )
    expect(sceneSource).toContain('<SolderGrainMaterial')
    expect(sceneSource).toMatch(
      /function SolderGrainMaterial[\s\S]*organicSolderColour[\s\S]*envMapIntensity=\{organic \? 1\.3 : 1\.38\}/
    )
    expect(sceneSource).toContain('organic ? 1.3 : 1.38')
    expect(sceneSource).toContain('organic={isOrganicGrain}')
    expect(sceneSource).toContain('getSolderGrainTone(key, isOrganicGrain)')
    expect(sceneSource).toContain('flatShading={organic}')
    expect(sceneSource).not.toContain('position={[0, 0, -profile.beadRadius * 0.38]}')
    expect(sceneSource).not.toContain('scale={[1.07, 1.07, 0.34]}')
    expect(sceneSource).not.toContain('auroraGrainColours')
    expect(sceneSource).not.toContain('flatShading\n      metalness={0.94}')
    expect(sceneSource).toContain('getGrainDerivedHaloSupportOutline({')
    expect(sceneSource).toContain('<HaloSupport')
    expect(sceneSource).toMatch(
      /function HaloSupport[\s\S]*<SolderSupportMaterial metal=\{config\.metal\}/
    )
  })
})
