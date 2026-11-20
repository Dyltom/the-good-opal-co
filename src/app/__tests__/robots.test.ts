import { describe, expect, test } from 'vitest'
import robots from '../robots'

describe('robots policy', () => {
  test('lets search and AI answer crawlers read public pages but never private or transactional routes', () => {
    const policy = robots()
    const rules = Array.isArray(policy.rules) ? policy.rules : [policy.rules]
    const privatePaths = ['/admin/*', '/api/*', '/checkout/*', '/account/*', '/quote/*', '/newsletter/*', '/cart']

    expect(rules[0]?.userAgent).toBe('*')
    expect(rules[1]?.userAgent).toEqual(
      expect.arrayContaining(['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended'])
    )
    for (const rule of rules) {
      expect(rule.allow).toEqual(expect.arrayContaining(['/', '/api/media/file/']))
      expect(rule.disallow).toEqual(expect.arrayContaining(privatePaths))
    }
    expect(policy.sitemap).toMatch(/\/sitemap\.xml$/)
  })
})
