import { describe, expect, test } from 'vitest'
import robots from '../robots'

describe('robots policy', () => {
  test('allows public discovery while keeping private and transactional routes out', () => {
    const policy = robots()

    expect(policy.rules).toEqual([
      expect.objectContaining({
        userAgent: '*',
        allow: '/',
        disallow: expect.arrayContaining([
          '/admin/*',
          '/api/*',
          '/checkout/*',
          '/account/*',
          '/quote/*',
          '/newsletter/*',
        ]),
      }),
    ])
    expect(policy.sitemap).toMatch(/\/sitemap\.xml$/)
    expect(policy.host).toBeTruthy()
  })
})
