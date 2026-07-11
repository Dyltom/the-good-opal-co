import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'
import { ringStyleGeometryProfiles, ringStyles } from '../config'

const sceneSource = readFileSync(resolve(__dirname, '../RingScene.tsx'), 'utf8')
const configSource = readFileSync(resolve(__dirname, '../config.ts'), 'utf8')

function capturedNumber(pattern: RegExp, label: string): number {
  const value = sceneSource.match(pattern)?.[1]
  if (!value) throw new Error(`Could not find ${label} in RingScene.tsx`)
  return Number(value)
}

describe('custom ring geometry contract', () => {
  test('mounts the setting face upright at the top of the shank', () => {
    expect(sceneSource).toContain(
      '<group position={[0, settingY, 0]} rotation={[-Math.PI / 2, 0, 0]}>'
    )

    // Local stone +Z becomes world +Y after this rotation: the face points away
    // from the finger instead of sideways along its axis.
    const localFaceNormal = { x: 0, y: 0, z: 1 }
    const angle = -Math.PI / 2
    const worldFaceNormal = {
      x: localFaceNormal.x,
      y: localFaceNormal.y * Math.cos(angle) - localFaceNormal.z * Math.sin(angle),
      z: localFaceNormal.y * Math.sin(angle) + localFaceNormal.z * Math.cos(angle),
    }

    expect(worldFaceNormal.x).toBeCloseTo(0)
    expect(worldFaceNormal.y).toBeCloseTo(1)
    expect(worldFaceNormal.z).toBeCloseTo(0)
  })

  test('seats the bezel on the band while keeping the stone base clear', () => {
    expect(sceneSource).toContain('const bezelBottom = depthProfile.baseZ - 0.012')
    expect(sceneSource).toContain('const bezelTop = depthProfile.girdleZ + 0.025')
    expect(sceneSource).toContain('const settingBottom = depthProfile.baseZ - 0.012')
    expect(sceneSource).toContain('const settingY = measurements.outerRadius - settingBottom')
    expect(sceneSource).toContain('bottomZ={bezelBottom}')
    expect(sceneSource).toContain('topZ={bezelTop}')
  })

  test('keeps ring and cabochon proportions monotonic and shape-specific', () => {
    const baseDiameter = capturedNumber(
      /const insideDiameterMm = ([\d.]+) \+ [\d.]+ \* config\.size/,
      'ring diameter intercept'
    )
    const sizeIncrement = capturedNumber(
      /const insideDiameterMm = [\d.]+ \+ ([\d.]+) \* config\.size/,
      'ring diameter increment'
    )
    const size4Diameter = baseDiameter + sizeIncrement * 4
    const size13Diameter = baseDiameter + sizeIncrement * 13

    expect(size4Diameter).toBeCloseTo(14.8812, 4)
    expect(size13Diameter).toBeCloseTo(22.1964, 4)
    expect(size13Diameter).toBeGreaterThan(size4Diameter)

    expect(sceneSource).toContain('round: [0.42, 0.42]')
    expect(sceneSource).toContain('oval: [0.4, 0.5]')
    expect(sceneSource).toContain('elongated: [0.35, 0.62]')
    expect(sceneSource).toContain('cushion: [0.5, 0.5]')
    expect(sceneSource).toContain('pear: [0.4, 0.5]')
    expect(sceneSource).toContain('depthMm * 0.1')
    expect(sceneSource).toContain(': Math.min(width, height) * 0.38')
    expect(sceneSource).toContain('const domeHeight = totalDepth * 0.58')
    expect(sceneSource).toContain("if (shape === 'elongated')")
    expect(sceneSource).toContain('Math.pow(Math.abs(cosine), 0.62)')
    expect(sceneSource).toContain('const pearWidthCorrection = 1.321')
  })

  test('gives each named design meaningful geometry consumed by the scene', () => {
    const profiles = Object.entries(ringStyleGeometryProfiles)
    expect(profiles).toHaveLength(ringStyles.length)
    expect(new Set(profiles.map(([, profile]) => JSON.stringify(profile)))).toHaveLength(
      profiles.length
    )

    for (const [style, profile] of profiles) {
      expect(profile.shankRadius, style).toBeGreaterThanOrEqual(0.085)
      expect(profile.shankRadius, style).toBeLessThanOrEqual(0.1)
      expect(profile.shankDepth, style).toBeLessThan(profile.shankRadius)
      expect(profile.shoulderDepth, style).toBeLessThan(profile.shoulderRadius)
      expect(profile.shoulderRadius / profile.shankRadius, style).toBeGreaterThanOrEqual(0.95)
      expect(profile.shoulderRadius / profile.shankRadius, style).toBeLessThanOrEqual(1.25)

      if (profile.beadCount > 0) {
        expect(profile.beadRadius, style).toBeGreaterThan(0)
        expect(profile.haloOffset - profile.beadRadius, style).toBeGreaterThan(
          profile.bezelLipOffset
        )
      } else {
        expect(profile.beadRadius, style).toBe(0)
        expect(profile.haloOffset, style).toBe(0)
      }
    }

    expect(sceneSource).toContain('ringStyleGeometryProfiles[config.style]')
    for (const property of [
      'bezelWallOffset',
      'bezelWallThickness',
      'bezelLipOffset',
      'bezelLipRadius',
      'haloOffset',
      'haloSupportOffset',
      'haloSupportRadius',
      'beadRadius',
      'beadCount',
      'shankRadius',
      'shankDepth',
      'shoulderRadius',
      'shoulderDepth',
    ]) {
      expect(sceneSource, property).toMatch(new RegExp(`(?:profile|styleProfile)\\.${property}\\b`))
    }
  })

  test('keeps reviewed product photography colour-faithful without scene-light tinting', () => {
    expect(sceneSource).toContain('map={photoTexture}')
    expect(sceneSource).toContain('<meshBasicMaterial')
    expect(sceneSource).toContain('toneMapped={false}')
    expect(sceneSource).toContain('nextTexture.generateMipmaps = false')
    expect(sceneSource).toContain('nextTexture.minFilter = LinearFilter')
    expect(sceneSource).toContain('nextTexture.magFilter = LinearFilter')
    expect(sceneSource).toContain('dpr={[1, 2]}')
    expect(sceneSource).not.toContain('emissiveMap={photoTexture}')
    expect(sceneSource).not.toContain('iridescence={0.06}')
  })

  test('uses handmade sterling and soldered halo proportions from sold pieces', () => {
    expect(sceneSource).toContain("'sterling-silver': '#d2d3cf'")
    expect(sceneSource).toContain('envMapIntensity={1.2}')
    expect(sceneSource).toContain('const size = 0.94 + ((key * 5) % 7) * 0.022')
    expect(ringStyleGeometryProfiles['sun-moon']).toMatchObject({
      haloOffset: 0.08,
      beadRadius: 0.036,
      beadCount: 38,
      shankRadius: 0.09,
    })
    expect(ringStyleGeometryProfiles.aurora).toMatchObject({
      haloOffset: 0.07,
      beadRadius: 0.038,
      beadCount: 30,
    })
  })

  test('uses measured bezel, halo, and tapered shoulder proportions', () => {
    expect(configSource).toContain('bezelWallThickness: 0.056')
    expect(configSource).toContain('bezelLipRadius: 0.013')
    expect(configSource).toContain('beadRadius: 0.036')
    expect(configSource).toContain('beadCount: 38')
    expect(sceneSource).toContain('shoulderDistance')
    expect(sceneSource).toContain('shoulderBlend')
    expect(sceneSource).toContain('localHalfWidth')
    expect(sceneSource).toContain('localHalfDepth')
    expect(sceneSource).not.toContain('const solderedRadius =')
  })
})
