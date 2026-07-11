import { createHmac } from 'node:crypto'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createQuoteLinkToken,
  isValidQuoteLinkSecret,
  verifyQuoteLinkToken,
} from '../quote-link-token'

const SECRET = '0123456789abcdef0123456789abcdef'
const OTHER_SECRET = 'fedcba9876543210fedcba9876543210'
const NOW = Date.UTC(2026, 6, 12, 10, 0, 0)
const EXPIRY = Math.floor(NOW / 1000) + 900
const TERMS_HASH = 'a'.repeat(64)

function signEncodedClaims(claims: unknown): string {
  const payload = Buffer.from(JSON.stringify(claims), 'utf8').toString('base64url')
  const input = `v1.${payload}`
  const signature = createHmac('sha256', SECRET).update(input).digest('base64url')
  return `${input}.${signature}`
}

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('quote link tokens', () => {
  it('round-trips the exact signed quote revision and terms snapshot', () => {
    const token = createQuoteLinkToken(
      { expiresAt: EXPIRY, linkVersion: 4, quoteId: 42, revision: 3, termsHash: TERMS_HASH },
      { now: NOW, secret: SECRET }
    )

    expect(verifyQuoteLinkToken(token, { now: NOW, secret: SECRET })).toEqual({
      audience: 'custom-quote',
      expiresAt: EXPIRY,
      linkVersion: 4,
      quoteId: '42',
      revision: 3,
      termsHash: TERMS_HASH,
    })
  })

  it('uses QUOTE_LINK_SECRET when no secret is injected', () => {
    vi.stubEnv('QUOTE_LINK_SECRET', SECRET)
    const token = createQuoteLinkToken(
      {
        expiresAt: EXPIRY,
        quoteId: 'quote_42',
        revision: 1,
        termsHash: TERMS_HASH,
      },
      { now: NOW }
    )

    expect(verifyQuoteLinkToken(token, { now: NOW })?.quoteId).toBe('quote_42')
  })

  it('rejects the token at the exact expiry boundary and afterwards', () => {
    const token = createQuoteLinkToken(
      { expiresAt: EXPIRY, quoteId: 42, revision: 1, termsHash: TERMS_HASH },
      { now: NOW, secret: SECRET }
    )

    expect(verifyQuoteLinkToken(token, { now: EXPIRY * 1000 - 1, secret: SECRET })).not.toBeNull()
    expect(verifyQuoteLinkToken(token, { now: EXPIRY * 1000, secret: SECRET })).toBeNull()
    expect(verifyQuoteLinkToken(token, { now: EXPIRY * 1000 + 1, secret: SECRET })).toBeNull()
  })

  it('rejects tampered payloads, signatures, versions, and the wrong secret', () => {
    const token = createQuoteLinkToken(
      { expiresAt: EXPIRY, quoteId: 42, revision: 1, termsHash: TERMS_HASH },
      { now: NOW, secret: SECRET }
    )
    const [prefix, payload, signature] = token.split('.') as [string, string, string]
    const flippedPayload = `${payload.slice(0, -1)}${payload.endsWith('A') ? 'B' : 'A'}`
    const flippedSignature = `${signature.slice(0, -1)}${signature.endsWith('A') ? 'B' : 'A'}`

    expect(
      verifyQuoteLinkToken(`${prefix}.${flippedPayload}.${signature}`, { now: NOW, secret: SECRET })
    ).toBeNull()
    expect(
      verifyQuoteLinkToken(`${prefix}.${payload}.${flippedSignature}`, { now: NOW, secret: SECRET })
    ).toBeNull()
    expect(
      verifyQuoteLinkToken(`v2.${payload}.${signature}`, { now: NOW, secret: SECRET })
    ).toBeNull()
    expect(verifyQuoteLinkToken(token, { now: NOW, secret: OTHER_SECRET })).toBeNull()
  })

  it.each([
    { aud: 'orders', e: EXPIRY, q: '42', r: 1, th: TERMS_HASH, v: 1 },
    { aud: 'custom-quote', e: EXPIRY, q: '42', r: 0, th: TERMS_HASH, v: 1 },
    { aud: 'custom-quote', e: EXPIRY, q: '42', r: 1, th: 'not-a-hash', v: 1 },
    { aud: 'custom-quote', e: EXPIRY, q: '42', r: 1, th: TERMS_HASH, v: 0 },
    { aud: 'custom-quote', e: EXPIRY, q: ' '.repeat(1), r: 1, th: TERMS_HASH, v: 1 },
  ])('rejects correctly signed invalid claims: $claims', (claims) => {
    expect(verifyQuoteLinkToken(signEncodedClaims(claims), { now: NOW, secret: SECRET })).toBeNull()
  })

  it('rejects malformed and oversized input without throwing', () => {
    expect(verifyQuoteLinkToken('', { now: NOW, secret: SECRET })).toBeNull()
    expect(
      verifyQuoteLinkToken('v1.payload.signature.extra', { now: NOW, secret: SECRET })
    ).toBeNull()
    expect(verifyQuoteLinkToken('x'.repeat(1025), { now: NOW, secret: SECRET })).toBeNull()
  })

  it('requires a future expiry and a secret of at least 32 bytes', () => {
    expect(isValidQuoteLinkSecret('x'.repeat(31))).toBe(false)
    expect(isValidQuoteLinkSecret('x'.repeat(32))).toBe(true)
    expect(() =>
      createQuoteLinkToken(
        { expiresAt: Math.floor(NOW / 1000), quoteId: 42, revision: 1, termsHash: TERMS_HASH },
        { now: NOW, secret: SECRET }
      )
    ).toThrow('Quote link expiry must be in the future')
    expect(() =>
      createQuoteLinkToken(
        { expiresAt: EXPIRY, quoteId: 42, revision: 1, termsHash: TERMS_HASH },
        { now: NOW, secret: 'short' }
      )
    ).toThrow('QUOTE_LINK_SECRET must contain at least 32 bytes')
    expect(verifyQuoteLinkToken('anything', { now: NOW, secret: 'short' })).toBeNull()
  })
})
