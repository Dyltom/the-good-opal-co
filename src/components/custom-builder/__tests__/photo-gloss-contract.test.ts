import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'

const sceneSource = readFileSync(resolve(__dirname, '../RingScene.tsx'), 'utf8')

describe('catalogue opal gloss contract', () => {
  test('layers restrained lighting and view-dependent white specular over catalogue pixels', () => {
    expect(sceneSource).toContain('<meshStandardMaterial')
    expect(sceneSource).toContain('emissiveMap={photoTexture}')
    expect(sceneSource).toContain('emissiveIntensity={0.12}')
    expect(sceneSource).toContain('<ProductPhotoGloss geometry={geometry} />')
    expect(sceneSource).toContain('vec3 halfDirection = normalize(galleryLight + viewDirection)')
    expect(sceneSource).toContain('gl_FragColor = vec4(vec3(1.0), alpha)')
    expect(sceneSource).toContain('blending={AdditiveBlending}')
    expect(sceneSource).toContain('depthWrite={false}')
    expect(sceneSource).not.toMatch(/photoGloss(?:Vertex|Fragment)Shader[\s\S]*sampler2D/)
  })

  test('keeps gloss restrained and independent from animation time', () => {
    expect(sceneSource).toContain('float alpha = min(0.2, highlight * 0.18 + edgeSheen * 0.035)')
    expect(sceneSource).toContain('vec3 shellPosition = position + normal * 0.0015')
    expect(sceneSource).not.toMatch(/photoGloss(?:Vertex|Fragment)Shader[\s\S]*uTime/)
    expect(sceneSource).toContain("frameloop={allowMotion ? 'always' : 'demand'}")
  })
})
