import { describe, expect, it } from 'vitest'
import {
  MAX_INSIGHT_BODY_BYTES,
  hashVisitor,
  isBotUserAgent,
  parseInsightBody,
  requestCountry,
  toInsightRow,
} from '../ingest'

const CHROME =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
const IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1'

function body(value: unknown): string {
  return JSON.stringify(value)
}

describe('parseInsightBody', () => {
  it('accepts a small product event', () => {
    const result = parseInsightBody(
      body({ name: 'add_to_cart', path: '/store/black-opal-ring', productId: '42', value: 480, detail: { quantity: 1 } })
    )

    expect(result).toEqual({
      ok: true,
      payload: { name: 'add_to_cart', path: '/store/black-opal-ring', productId: '42', value: 480, detail: { quantity: 1 } },
    })
  })

  it.each([
    ['not JSON', 'nope'],
    ['an unknown event', body({ name: 'purchase', path: '/' })],
    ['a path that is a full URL', body({ name: 'page_view', path: 'https://evil.example/' })],
    ['extra fields', body({ name: 'page_view', path: '/', ip: '1.2.3.4' })],
    ['a negative value', body({ name: 'add_to_cart', path: '/', value: -5 })],
    ['nested detail', body({ name: 'search', path: '/store', detail: { term: { nested: true } } })],
    ['too many detail fields', body({ name: 'search', path: '/', detail: Object.fromEntries('abcdefghi'.split('').map((key) => [key, 1])) })],
  ])('rejects %s', (_label, raw) => {
    expect(parseInsightBody(raw)).toEqual({ ok: false, status: 400 })
  })

  it('rejects oversized bodies before parsing them', () => {
    const raw = body({ name: 'page_view', path: '/', referrer: 'x'.repeat(MAX_INSIGHT_BODY_BYTES) })

    expect(parseInsightBody(raw)).toEqual({ ok: false, status: 413 })
  })

  it('drops the server-only purchase, abandon and server error events so browsers cannot fake them', () => {
    expect(parseInsightBody(body({ name: 'checkout_abandoned', path: '/checkout' })).ok).toBe(false)
    expect(parseInsightBody(body({ name: 'server_error', path: '/', detail: { message: 'x' } })).ok).toBe(false)
  })
})

describe('parseInsightBody for page signals and feedback', () => {
  it.each([
    ['engagement on a piece page', { name: 'engagement', path: '/store/ring', detail: { seconds: 42, scroll: 80, sawPrice: true, sawDetails: false } }],
    ['engagement on a plain page', { name: 'engagement', path: '/about', detail: { seconds: 0, scroll: 0 } }],
    ['a web vital with its value', { name: 'web_vital', path: '/', value: 2310, detail: { metric: 'LCP', rating: 'good' } }],
    ['a rage click', { name: 'rage_click', path: '/cart', detail: { target: 'button "Checkout"' } }],
    ['feedback without a note', { name: 'checkout_feedback', path: '/cart', detail: { reason: 'shipping_cost', source: 'cancelled' } }],
  ])('accepts %s', (_label, event) => {
    expect(parseInsightBody(body(event))).toEqual({ ok: true, payload: event })
  })

  it.each([
    ['engagement longer than half an hour', { name: 'engagement', path: '/', detail: { seconds: 1801, scroll: 10 } }],
    ['scroll beyond the page', { name: 'engagement', path: '/', detail: { seconds: 5, scroll: 101 } }],
    ['engagement with typed text', { name: 'engagement', path: '/', detail: { seconds: 5, scroll: 10, text: 'hello' } }],
    ['a web vital without a value', { name: 'web_vital', path: '/', detail: { metric: 'LCP', rating: 'good' } }],
    ['an untracked web vital', { name: 'web_vital', path: '/', value: 10, detail: { metric: 'FID', rating: 'good' } }],
    ['a rage click with no target', { name: 'rage_click', path: '/', detail: { target: '  ' } }],
    ['a rage click with a long target', { name: 'rage_click', path: '/', detail: { target: 'x'.repeat(81) } }],
    ['feedback with an unknown reason', { name: 'checkout_feedback', path: '/cart', detail: { reason: 'colour', source: 'cart' } }],
    ['feedback with no source', { name: 'checkout_feedback', path: '/cart', detail: { reason: 'other' } }],
    ['feedback with a long note', { name: 'checkout_feedback', path: '/cart', detail: { reason: 'other', source: 'cart', note: 'x'.repeat(281) } }],
  ])('rejects %s', (_label, event) => {
    expect(parseInsightBody(body(event))).toEqual({ ok: false, status: 400 })
  })

  it('trims the feedback note and drops it when blank', () => {
    const trimmed = parseInsightBody(
      body({ name: 'checkout_feedback', path: '/cart', detail: { reason: 'other', source: 'cart', note: '  ring sizes?  ' } })
    )
    const blank = parseInsightBody(
      body({ name: 'checkout_feedback', path: '/cart', detail: { reason: 'other', source: 'cart', note: '   ' } })
    )

    expect(trimmed).toMatchObject({ ok: true, payload: { detail: { reason: 'other', source: 'cart', note: 'ring sizes?' } } })
    expect(blank).toEqual({
      ok: true,
      payload: { name: 'checkout_feedback', path: '/cart', detail: { reason: 'other', source: 'cart' } },
    })
  })
})

describe('isBotUserAgent', () => {
  it.each([
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/130.0.0.0 Safari/537.36',
    'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
    'curl/8.5.0',
    '',
    null,
  ])('treats %s as a bot', (userAgent) => {
    expect(isBotUserAgent(userAgent)).toBe(true)
  })

  it.each([CHROME, IPHONE])('keeps real browsers', (userAgent) => {
    expect(isBotUserAgent(userAgent)).toBe(false)
  })
})

describe('hashVisitor', () => {
  it('gives the same visitor the same key within a day and a new key when the salt rotates', () => {
    const today = hashVisitor('salt-a', '203.0.113.9', CHROME)

    expect(hashVisitor('salt-a', '203.0.113.9', CHROME)).toBe(today)
    expect(hashVisitor('salt-b', '203.0.113.9', CHROME)).not.toBe(today)
    expect(hashVisitor('salt-a', '203.0.113.10', CHROME)).not.toBe(today)
    expect(today).toMatch(/^[0-9a-f]{32}$/)
    expect(today).not.toContain('203')
  })
})

describe('toInsightRow', () => {
  const context = { userAgent: IPHONE, visitor: 'v1', country: 'AU', ownHost: 'goodopal.com.au', now: new Date('2026-11-20T01:02:03Z') }

  it('keeps only the referring host and coarse device details', () => {
    const row = toInsightRow(
      {
        name: 'page_view',
        path: '/store?search=ring#top',
        landing: '/quote/secret-token',
        referrer: 'https://www.instagram.com/p/abc?igsh=123',
        utmSource: 'instagram',
      },
      context
    )

    expect(row).toMatchObject({
      name: 'page_view',
      path: '/store',
      landingPage: '/quote',
      referrerHost: 'instagram.com',
      utmSource: 'instagram',
      country: 'AU',
      device: 'mobile',
      browser: 'Safari',
      visitor: 'v1',
      occurredAt: '2026-11-20T01:02:03.000Z',
    })
    expect(JSON.stringify(row)).not.toContain(IPHONE)
  })

  it('treats links from the shop itself as internal, not as a source', () => {
    const row = toInsightRow({ name: 'page_view', path: '/', referrer: 'https://goodopal.com.au/store' }, context)

    expect(row.referrerHost).toBeUndefined()
  })
})

describe('requestCountry', () => {
  it('reads the hosting country header and ignores unknown values', () => {
    expect(requestCountry(new Headers({ 'x-vercel-ip-country': 'au' }))).toBe('AU')
    expect(requestCountry(new Headers({ 'cf-ipcountry': 'NZ' }))).toBe('NZ')
    expect(requestCountry(new Headers({ 'cf-ipcountry': 'XX' }))).toBeUndefined()
    expect(requestCountry(new Headers())).toBeUndefined()
  })
})
