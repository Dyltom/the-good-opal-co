import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import type { Payload } from 'payload'
import { APP_URL } from '@/lib/constants'
import type { User } from '@/types/payload-types'

export const MCP_RESOURCE = `${APP_URL}/api/mcp`
export const PROTECTED_RESOURCE_METADATA_URL = `${APP_URL}/.well-known/oauth-protected-resource/api/mcp`

export const CLIENT_AUTH_METHODS = ['none', 'client_secret_post', 'client_secret_basic'] as const
export type ClientAuthMethod = (typeof CLIENT_AUTH_METHODS)[number]

const CODE_SECONDS = 5 * 60
const ACCESS_SECONDS = 30 * 24 * 60 * 60
const REFRESH_SECONDS = 365 * 24 * 60 * 60
const PHOTO_UPLOAD_SECONDS = 24 * 60 * 60
const CLAUDE_CALLBACKS = new Set([
  'https://claude.ai/api/mcp/auth_callback',
  'https://claude.com/api/mcp/auth_callback',
])
const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]'])

type ClientClaims = { typ: 'client'; ru: string[] }
type CodeClaims = { typ: 'code'; uid: number; cid: string; ru: string; cc: string; exp: number }
type AccessClaims = { typ: 'access'; uid: number; sv: string; exp: number }
type RefreshClaims = { typ: 'refresh'; uid: number; cid: string; sv: string; exp: number }
type PhotoUploadClaims = { typ: 'photos'; uid: number; sv: string; pid?: number; exp: number }
type Claims = ClientClaims | CodeClaims | AccessClaims | RefreshClaims | PhotoUploadClaims

function signingKey(): Buffer {
  const secret = process.env['PAYLOAD_SECRET'] ?? ''
  if (!secret.trim()) throw new Error('PAYLOAD_SECRET is required to sign Claude connector tokens')
  return createHash('sha256').update(`mcp-oauth:${secret}`).digest()
}

function mac(value: string): string {
  return createHmac('sha256', signingKey()).update(value).digest('base64url')
}

function sameText(supplied: string, expected: string): boolean {
  const a = Buffer.from(supplied)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000)
}

function sign(claims: Claims): string {
  const body = Buffer.from(JSON.stringify(claims)).toString('base64url')
  return `${body}.${mac(body)}`
}

function verify<T extends Claims['typ']>(
  token: string | null | undefined,
  typ: T
): Extract<Claims, { typ: T }> | null {
  const [body, signature, extra] = (token ?? '').split('.')
  if (!body || !signature || extra !== undefined || !sameText(signature, mac(body))) return null
  let claims: unknown
  try {
    claims = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
  } catch {
    return null
  }
  if (typeof claims !== 'object' || claims === null || !('typ' in claims) || claims.typ !== typ)
    return null
  if ('exp' in claims && (typeof claims.exp !== 'number' || claims.exp <= nowSeconds())) return null
  return claims as Extract<Claims, { typ: T }>
}

export function looksLikeOAuthToken(token: string): boolean {
  return token.includes('.')
}

export function isAllowedRedirectUri(uri: string): boolean {
  if (CLAUDE_CALLBACKS.has(uri)) return true
  try {
    const url = new URL(uri)
    return (
      url.protocol === 'http:' &&
      LOOPBACK_HOSTS.has(url.hostname) &&
      !url.username &&
      !url.password &&
      !url.hash
    )
  } catch {
    return false
  }
}

export function registerClient(redirectUris: string[]): string {
  return sign({ typ: 'client', ru: redirectUris })
}

export function clientRedirectUris(clientId: string | null | undefined): string[] | null {
  return verify(clientId, 'client')?.ru ?? null
}

export function clientSecretFor(clientId: string): string {
  return mac(`secret:${clientId}`)
}

export function clientSecretMatches(clientId: string, secret: string): boolean {
  return sameText(secret, clientSecretFor(clientId))
}

export function issueCode(grant: {
  userId: number
  clientId: string
  redirectUri: string
  codeChallenge: string
}): string {
  return sign({
    typ: 'code',
    uid: grant.userId,
    cid: grant.clientId,
    ru: grant.redirectUri,
    cc: grant.codeChallenge,
    exp: nowSeconds() + CODE_SECONDS,
  })
}

export function redeemCode(
  code: string | null,
  exchange: { clientId: string; redirectUri: string | null; codeVerifier: string | null }
): number | null {
  const claims = verify(code, 'code')
  if (!claims || claims.cid !== exchange.clientId || claims.ru !== exchange.redirectUri) return null
  const verifier = exchange.codeVerifier ?? ''
  if (!/^[A-Za-z0-9._~-]{43,128}$/.test(verifier)) return null
  const challenge = createHash('sha256').update(verifier).digest('base64url')
  return sameText(challenge, claims.cc) ? claims.uid : null
}

function sessionVersion(user: Pick<User, 'salt'>): string {
  return mac(`session:${user.salt ?? ''}`).slice(0, 22)
}

export type ShopAdmin = { user: User; sessionVersion: string }

export function issueTokens({ user, sessionVersion: sv }: ShopAdmin, clientId: string) {
  const now = nowSeconds()
  return {
    access_token: sign({ typ: 'access', uid: user.id, sv, exp: now + ACCESS_SECONDS }),
    token_type: 'Bearer',
    expires_in: ACCESS_SECONDS,
    refresh_token: sign({
      typ: 'refresh',
      uid: user.id,
      cid: clientId,
      sv,
      exp: now + REFRESH_SECONDS,
    }),
  }
}

export function readRefreshToken(
  token: string | null,
  clientId: string
): { userId: number; sessionVersion: string } | null {
  const claims = verify(token, 'refresh')
  return claims && claims.cid === clientId
    ? { userId: claims.uid, sessionVersion: claims.sv }
    : null
}

export function readAccessToken(token: string): { userId: number; sessionVersion: string } | null {
  const claims = verify(token, 'access')
  return claims ? { userId: claims.uid, sessionVersion: claims.sv } : null
}

export function photoUploadUrl({ user, sessionVersion: sv }: ShopAdmin, productId?: number) {
  const exp = nowSeconds() + PHOTO_UPLOAD_SECONDS
  const token = sign({ typ: 'photos', uid: user.id, sv, ...(productId && { pid: productId }), exp })
  return {
    url: `${APP_URL}/api/photo-upload/${token}`,
    expiresAt: new Date(exp * 1000).toISOString(),
  }
}

export function readPhotoUploadToken(
  token: string
): { userId: number; sessionVersion: string; productId: number | null } | null {
  const claims = verify(token, 'photos')
  return claims
    ? { userId: claims.uid, sessionVersion: claims.sv, productId: claims.pid ?? null }
    : null
}

export async function findShopAdmin(
  payload: Payload,
  userId: number,
  expectedSessionVersion?: string
): Promise<ShopAdmin | null> {
  const found = await payload.findByID({
    collection: 'users',
    id: userId,
    depth: 0,
    overrideAccess: true,
    showHiddenFields: true,
    disableErrors: true,
  })
  if (!found || found.role !== 'admin') return null
  const current = sessionVersion(found)
  if (expectedSessionVersion !== undefined && current !== expectedSessionVersion) return null
  const user: User & { _strategy: string } = {
    ...found,
    hash: undefined,
    salt: undefined,
    collection: 'users',
    _strategy: 'claude-oauth',
  }
  return { user, sessionVersion: current }
}

export function authorizationServerMetadata() {
  return {
    issuer: APP_URL,
    authorization_endpoint: `${APP_URL}/api/oauth/authorize`,
    token_endpoint: `${APP_URL}/api/oauth/token`,
    registration_endpoint: `${APP_URL}/api/oauth/register`,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: CLIENT_AUTH_METHODS,
  }
}

export function protectedResourceMetadata() {
  return {
    resource: MCP_RESOURCE,
    authorization_servers: [APP_URL],
    bearer_methods_supported: ['header'],
    resource_name: 'The Good Opal Co shop',
  }
}
