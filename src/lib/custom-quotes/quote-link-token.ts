import { createHmac, timingSafeEqual } from 'node:crypto'

const TOKEN_AUDIENCE = 'custom-quote'
const TOKEN_PREFIX = 'v1'
const MINIMUM_SECRET_BYTES = 32
const MAXIMUM_TOKEN_LENGTH = 1024
const MAXIMUM_QUOTE_ID_LENGTH = 128
const SHA256_BASE64URL_LENGTH = 43
const SHA256_HEX_PATTERN = /^[a-f0-9]{64}$/
const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/

export interface QuoteLinkClaims {
  audience: typeof TOKEN_AUDIENCE
  expiresAt: number
  linkVersion: number
  quoteId: string
  revision: number
  termsHash: string
}

export interface CreateQuoteLinkTokenInput {
  expiresAt: number
  linkVersion?: number
  quoteId: string | number
  revision: number
  termsHash: string
}

interface QuoteLinkTokenOptions {
  now?: number
  secret?: string
}

interface EncodedClaims {
  aud: typeof TOKEN_AUDIENCE
  e: number
  q: string
  r: number
  th: string
  v: number
}

function secretFrom(options: QuoteLinkTokenOptions): string | undefined {
  return options.secret ?? process.env['QUOTE_LINK_SECRET']
}

export function isValidQuoteLinkSecret(secret: string | undefined): secret is string {
  return typeof secret === 'string' && Buffer.byteLength(secret, 'utf8') >= MINIMUM_SECRET_BYTES
}

function assertValidSecret(secret: string | undefined): asserts secret is string {
  if (!isValidQuoteLinkSecret(secret)) {
    throw new Error('QUOTE_LINK_SECRET must contain at least 32 bytes')
  }
}

function isValidClaims(value: unknown): value is EncodedClaims {
  if (typeof value !== 'object' || value === null) return false

  const claims = value as Partial<EncodedClaims>
  return (
    claims.aud === TOKEN_AUDIENCE &&
    typeof claims.v === 'number' &&
    Number.isSafeInteger(claims.v) &&
    claims.v > 0 &&
    typeof claims.q === 'string' &&
    claims.q.length > 0 &&
    claims.q.length <= MAXIMUM_QUOTE_ID_LENGTH &&
    claims.q.trim() === claims.q &&
    typeof claims.r === 'number' &&
    Number.isSafeInteger(claims.r) &&
    claims.r > 0 &&
    typeof claims.e === 'number' &&
    Number.isSafeInteger(claims.e) &&
    claims.e > 0 &&
    typeof claims.th === 'string' &&
    SHA256_HEX_PATTERN.test(claims.th)
  )
}

function signingInput(payload: string): string {
  return `${TOKEN_PREFIX}.${payload}`
}

function signatureFor(payload: string, secret: string): Buffer {
  return createHmac('sha256', secret).update(signingInput(payload)).digest()
}

function currentEpochSeconds(now: number | undefined): number {
  const milliseconds = now ?? Date.now()
  if (!Number.isFinite(milliseconds)) throw new Error('Quote link clock must be finite')
  return Math.floor(milliseconds / 1000)
}

export function createQuoteLinkToken(
  input: CreateQuoteLinkTokenInput,
  options: QuoteLinkTokenOptions = {}
): string {
  const secret = secretFrom(options)
  assertValidSecret(secret)

  const claims: EncodedClaims = {
    aud: TOKEN_AUDIENCE,
    e: input.expiresAt,
    q: String(input.quoteId),
    r: input.revision,
    th: input.termsHash,
    v: input.linkVersion ?? 1,
  }

  if (!isValidClaims(claims)) throw new Error('Quote link claims are invalid')
  if (claims.e <= currentEpochSeconds(options.now)) {
    throw new Error('Quote link expiry must be in the future')
  }

  const payload = Buffer.from(JSON.stringify(claims), 'utf8').toString('base64url')
  const signature = signatureFor(payload, secret).toString('base64url')
  return `${signingInput(payload)}.${signature}`
}

export function verifyQuoteLinkToken(
  token: string,
  options: QuoteLinkTokenOptions = {}
): QuoteLinkClaims | null {
  const secret = secretFrom(options)
  if (!isValidQuoteLinkSecret(secret) || token.length > MAXIMUM_TOKEN_LENGTH) return null

  const [prefix, payload, suppliedSignature, extra] = token.split('.')
  if (
    prefix !== TOKEN_PREFIX ||
    !payload ||
    !suppliedSignature ||
    extra !== undefined ||
    !BASE64URL_PATTERN.test(payload) ||
    suppliedSignature.length !== SHA256_BASE64URL_LENGTH ||
    !BASE64URL_PATTERN.test(suppliedSignature)
  ) {
    return null
  }

  const supplied = Buffer.from(suppliedSignature, 'base64url')
  const expected = signatureFor(payload, secret)
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null

  try {
    const decoded = Buffer.from(payload, 'base64url')
    if (decoded.toString('base64url') !== payload) return null

    const claims = JSON.parse(decoded.toString('utf8')) as unknown
    if (!isValidClaims(claims) || claims.e <= currentEpochSeconds(options.now)) return null

    return {
      audience: claims.aud,
      expiresAt: claims.e,
      linkVersion: claims.v,
      quoteId: claims.q,
      revision: claims.r,
      termsHash: claims.th,
    }
  } catch {
    return null
  }
}
