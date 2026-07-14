import { describe, expect, test } from 'vitest'
import { createContentSecurityPolicy } from '../content-security-policy'

describe('createContentSecurityPolicy', () => {
  test('omits eval permission in production', () => {
    expect(createContentSecurityPolicy('production')).not.toContain("'unsafe-eval'")
  })

  test('allows React development diagnostics during local and CI E2E runs', () => {
    expect(createContentSecurityPolicy('development')).toContain("'unsafe-eval'")
  })

  test('allows Google Analytics scripts only when analytics is configured', () => {
    expect(createContentSecurityPolicy('production', 'G-OPAL')).toContain(
      'https://www.googletagmanager.com'
    )
    expect(createContentSecurityPolicy('production', '')).not.toContain(
      'https://www.googletagmanager.com'
    )
  })
})
