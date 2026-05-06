import { describe, expect, test } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const read = (rel: string) => readFileSync(resolve(__dirname, '..', '..', rel), 'utf-8')

describe('deployment config', () => {
  test('Payload generates types at the path imported by the app', () => {
    const source = read('src/payload.config.ts')

    expect(source).toMatch(/path\.resolve\(dirname,\s*'types',\s*'payload-types\.ts'\)/)
  })

  test('Payload does not use the scaffolded secret in production', () => {
    const source = read('src/payload.config.ts')

    expect(source).not.toContain('your-secret-key-here')
    expect(source).toMatch(/PAYLOAD_SECRET/)
    expect(source).toMatch(/NODE_ENV.+production|production.+NODE_ENV/s)
  })

  test('marketing layout defines metadataBase for social image URLs', () => {
    const source = read('src/app/(marketing)/layout.tsx')

    expect(source).toContain('metadataBase')
    expect(source).toContain('new URL(APP_URL)')
  })

  test('session signing secret is documented for deployment', () => {
    expect(read('.env.example')).toContain('JWT_SECRET=')
    expect(read('docs/DEPLOYMENT_CHECKLIST.md')).toContain('JWT_SECRET')
  })
})
