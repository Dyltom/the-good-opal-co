import { describe, test, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

/**
 * Regression test for UI audit 01-critical #2:
 * The About page canonicalises the founder as Stephanie Caruana.
 * Earlier audit flagged that other pages still referenced the
 * legacy name "Sarah Henderson" — an ACL / trust concern for a
 * luxury-goods site. Guard against regressions here.
 */
describe('Founder name consistency (ACL / trust)', () => {
  const read = (rel: string) =>
    readFileSync(resolve(__dirname, '..', '..', rel), 'utf-8')

  const forbiddenName = /Sarah Henderson/
  const canonicalName = /Stephanie Caruana/

  test.each([
    'src/app/(marketing)/courses/page.tsx',
    'src/app/(marketing)/blog/[slug]/page.tsx',
    'src/scripts/seed-blog-posts.ts',
  ])('%s does not reference the legacy founder name', (file) => {
    const source = read(file)
    expect(source).not.toMatch(forbiddenName)
  })

  test('about page still names Stephanie Caruana as the founder', () => {
    const source = read('src/app/(marketing)/about/page.tsx')
    expect(source).toMatch(canonicalName)
  })
})
