import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'

const sceneSource = readFileSync(resolve(__dirname, '../RingScene.tsx'), 'utf8')

describe('catalogue opal gloss contract', () => {
  test('physically lights catalogue pixels and layers restrained white specular', () => {
    expect(sceneSource).toContain('<meshPhysicalMaterial\n            attach="material-0"')
    expect(sceneSource).toContain('map={photoTexture}')
    expect(sceneSource).toContain('clearcoat={0.82}')
    expect(sceneSource).toContain('specularIntensity={0.68}')
    expect(sceneSource).toContain('toneMapped={false}')
    expect(sceneSource).not.toContain('emissiveMap={photoTexture}')
    expect(sceneSource).toContain('<ProductPhotoGloss geometry={geometry} />')
    expect(sceneSource).toContain('vec3 halfDirection = normalize(galleryLight + viewDirection)')
    expect(sceneSource).toContain('gl_FragColor = vec4(vec3(1.0), alpha)')
    expect(sceneSource).toContain('blending={AdditiveBlending}')
    expect(sceneSource).toContain('depthWrite={false}')
    expect(sceneSource).not.toMatch(/photoGloss(?:Vertex|Fragment)Shader[\s\S]*sampler2D/)
  })

  test('keeps gloss restrained and independent from animation time', () => {
    expect(sceneSource).toContain('float alpha = min(0.13, highlight * 0.1 + edgeSheen * 0.025)')
    expect(sceneSource).toContain('vec3 shellPosition = position + normal * 0.0015')
    expect(sceneSource).not.toMatch(/photoGloss(?:Vertex|Fragment)Shader[\s\S]*uTime/)
    expect(sceneSource).toContain("frameloop={allowMotion ? 'always' : 'demand'}")
  })
})
