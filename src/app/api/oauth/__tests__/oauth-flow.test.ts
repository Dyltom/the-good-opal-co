import { createHash } from 'node:crypto'
import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, test, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  findByID: vi.fn(),
  getPayload: vi.fn(),
  login: vi.fn(),
}))

vi.mock('@/lib/payload', () => ({ getPayload: mocks.getPayload }))

import { GET as protectedResource } from '../../../.well-known/oauth-protected-resource/[[...resource]]/route'
import { GET as authorizationServer } from '../../../.well-known/oauth-authorization-server/route'
import { POST as mcp } from '../../mcp/route'
import { GET as authorizePage, POST as approve } from '../authorize/route'
import { POST as register } from '../register/route'
import { POST as token } from '../token/route'

const CLAUDE_CALLBACK = 'https://claude.ai/api/mcp/auth_callback'
const SHOP = 'https://example.com'
const verifier = 'claude-pkce-verifier-0123456789-abcdefghijklmnop'
const challenge = createHash('sha256').update(verifier).digest('base64url')

let steph: Record<string, unknown>

async function registerClaude(redirectUris = [CLAUDE_CALLBACK]) {
  return register(
    new Request(`${SHOP}/api/oauth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ client_name: 'Claude', redirect_uris: redirectUris }),
    })
  )
}

function authorizeParams(clientId: string, overrides: Record<string, string> = {}) {
  return new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: CLAUDE_CALLBACK,
    state: 'claude-state',
    code_challenge: challenge,
    code_challenge_method: 'S256',
    ...overrides,
  })
}

function approveRequest(form: URLSearchParams, origin = SHOP) {
  return approve(
    new NextRequest(`${SHOP}/api/oauth/authorize`, {
      method: 'POST',
      headers: {
        origin,
        host: 'example.com',
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
    })
  )
}

async function returnedTo(response: Response): Promise<URL | null> {
  const href = (await response.text()).match(/url=([^"]+)"/)?.[1]
  return href ? new URL(href.replaceAll('&amp;', '&')) : null
}

function exchange(fields: Record<string, string>) {
  return token(
    new Request(`${SHOP}/api/oauth/token`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(fields).toString(),
    })
  )
}

async function signInAndApprove() {
  const { client_id } = await (await registerClaude()).json()
  const form = authorizeParams(client_id)
  form.set('email', 'owner@example.com')
  form.set('password', 'opal-password')
  const back = await returnedTo(await approveRequest(form))
  return { clientId: client_id as string, back }
}

async function connect() {
  const { clientId, back } = await signInAndApprove()
  const response = await exchange({
    grant_type: 'authorization_code',
    client_id: clientId,
    code: back?.searchParams.get('code') ?? '',
    redirect_uri: CLAUDE_CALLBACK,
    code_verifier: verifier,
  })
  return { clientId, tokens: await response.json() }
}

function listTools(accessToken?: string) {
  return mcp(
    new Request(`${SHOP}/api/mcp`, {
      method: 'POST',
      headers: {
        accept: 'application/json, text/event-stream',
        'content-type': 'application/json',
        ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} }),
    })
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  process.env['PAYLOAD_SECRET'] = 'test-payload-secret-at-least-thirty-two-chars'
  steph = {
    id: 1,
    role: 'admin',
    email: 'owner@example.com',
    salt: 'salt-before',
    hash: 'hash-before',
    collection: 'users',
  }
  mocks.getPayload.mockResolvedValue({
    auth: mocks.auth,
    findByID: mocks.findByID,
    login: mocks.login,
    logger: { info: vi.fn() },
  })
  mocks.auth.mockResolvedValue({ user: null })
  mocks.login.mockImplementation(async () => ({ user: steph }))
  mocks.findByID.mockImplementation(async ({ id }: { id: number }) =>
    id === steph['id'] ? steph : null
  )
})

describe('Claude connector sign-in', () => {
  test('an unauthenticated request points Claude at the shop sign-in', async () => {
    const response = await listTools()
    const resourceMetadataUrl = response.headers
      .get('www-authenticate')
      ?.match(/resource_metadata="([^"]+)"/)?.[1]

    expect(response.status).toBe(401)
    expect(resourceMetadataUrl).toMatch(/\/\.well-known\/oauth-protected-resource\/api\/mcp$/)
    const resource = await protectedResource().json()
    expect(resource.resource).toMatch(/\/api\/mcp$/)
    const server = await authorizationServer().json()
    expect(resource.authorization_servers).toEqual([server.issuer])
    expect(server.code_challenge_methods_supported).toEqual(['S256'])
  })

  test('Steph connects by signing in with her shop login and Claude can then use the tools', async () => {
    const { back } = await signInAndApprove()
    expect(mocks.login.mock.calls[0][0].data).toEqual({
      email: 'owner@example.com',
      password: 'opal-password',
    })
    expect(back?.origin + (back?.pathname ?? '')).toBe(CLAUDE_CALLBACK)
    expect(back?.searchParams.get('state')).toBe('claude-state')

    const { tokens } = await connect()
    const response = await listTools(tokens.access_token)

    expect(response.status).toBe(200)
    expect((await response.json()).result.tools.length).toBeGreaterThan(0)
  })

  test('a refresh keeps Claude connected', async () => {
    const { clientId, tokens } = await connect()

    const refreshed = await exchange({
      grant_type: 'refresh_token',
      client_id: clientId,
      refresh_token: tokens.refresh_token,
    })

    expect(refreshed.status).toBe(200)
    expect((await listTools((await refreshed.json()).access_token)).status).toBe(200)
  })

  test('changing the shop password disconnects Claude', async () => {
    const { clientId, tokens } = await connect()
    steph['salt'] = 'salt-after'

    const call = await listTools(tokens.access_token)
    const refreshed = await exchange({
      grant_type: 'refresh_token',
      client_id: clientId,
      refresh_token: tokens.refresh_token,
    })

    expect(call.status).toBe(401)
    expect(call.headers.get('www-authenticate')).toContain('error="invalid_token"')
    expect(refreshed.status).toBe(400)
  })

  test('the sign-in code only works with the verifier that started the sign-in', async () => {
    const { clientId, back } = await signInAndApprove()

    const response = await exchange({
      grant_type: 'authorization_code',
      client_id: clientId,
      code: back?.searchParams.get('code') ?? '',
      redirect_uri: CLAUDE_CALLBACK,
      code_verifier: 'someone-else-verifier-0123456789-abcdefghijklmn',
    })

    expect(response.status).toBe(400)
    expect((await response.json()).error).toBe('invalid_grant')
  })

  test('only Claude and local callbacks can register', async () => {
    expect((await registerClaude(['https://evil.example/callback'])).status).toBe(400)
    expect((await registerClaude(['http://localhost:33418/callback'])).status).toBe(201)
  })

  test('never sends a code to a return address the client did not register', async () => {
    const { client_id } = await (await registerClaude()).json()
    const params = authorizeParams(client_id, {
      redirect_uri: 'https://claude.com/api/mcp/auth_callback',
    })

    const page = await authorizePage(new NextRequest(`${SHOP}/api/oauth/authorize?${params}`))
    params.set('email', 'owner@example.com')
    params.set('password', 'opal-password')
    const approval = await approveRequest(params)

    expect(page.status).toBe(400)
    expect(approval.status).toBe(400)
    expect(mocks.login).not.toHaveBeenCalled()
  })

  test('a customer login cannot connect Claude', async () => {
    mocks.login.mockResolvedValue({ user: { ...steph, role: 'user' } })

    const { back } = await signInAndApprove()

    expect(back).toBeNull()
  })

  test('another site cannot approve with the shop session', async () => {
    mocks.auth.mockResolvedValue({ user: steph })
    const { client_id } = await (await registerClaude()).json()

    const response = await approveRequest(authorizeParams(client_id), 'https://evil.example')

    expect(response.status).toBe(403)
    expect(await returnedTo(response)).toBeNull()
  })
})
