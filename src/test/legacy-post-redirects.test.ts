import { describe, expect, test } from 'vitest'
import { getPathMatch } from 'next/dist/shared/lib/router/utils/path-match'
import config from '../../next.config'

async function redirectFor(path: string): Promise<string | undefined> {
  for (const rule of await config.redirects!()) {
    const params = getPathMatch(rule.source, { strict: true, removeUnnamedParams: true })(path)
    if (params) return rule.destination.replace(/:(\w+)/g, (_, name: string) => params[name] ?? `:${name}`)
  }
  return undefined
}

describe('legacy Journal URLs', () => {
  test.each([
    ['/2021/05/27/lightning-ridge-opal', '/blog/lightning-ridge-opal'],
    ['/2021/03/10/top-10-tips-for-buying-opal-jewellery', '/blog/top-10-tips-for-buying-opal-jewellery-online'],
    ['/blog/top-10-tips-for-buying-opal-jewellery', '/blog/top-10-tips-for-buying-opal-jewellery-online'],
    ['/2020/01/01/a-post-that-never-moved', '/blog'],
    ['/2021/05', '/blog'],
  ])('%s lands on %s', async (path, destination) => {
    expect(await redirectFor(path)).toBe(destination)
  })

  test('current Journal posts are not redirected', async () => {
    expect(await redirectFor('/blog/top-10-tips-for-buying-opal-jewellery-online')).toBeUndefined()
  })
})
