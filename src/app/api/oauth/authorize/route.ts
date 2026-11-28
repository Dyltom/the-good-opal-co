import type { NextRequest } from 'next/server'
import type { Payload } from 'payload'
import { clientRedirectUris, isAllowedRedirectUri, issueCode } from '@/lib/mcp-oauth'
import { getPayload } from '@/lib/payload'
import { escapeHtml, page } from '@/lib/plain-page'
import { isSameOriginRequest } from '@/lib/same-origin'

const FORWARDED_PARAMS = [
  'response_type',
  'client_id',
  'redirect_uri',
  'state',
  'code_challenge',
  'code_challenge_method',
] as const

type AuthorizeRequest = {
  params: URLSearchParams
  clientId: string
  redirectUri: string
  state: string | null
  codeChallenge: string
}

type SignedInAdmin = { id: number; email: string }

function readAuthorizeRequest(source: URLSearchParams): AuthorizeRequest | string {
  const clientId = source.get('client_id')
  const redirectUri = source.get('redirect_uri') ?? ''
  const registered = clientRedirectUris(clientId)
  if (!clientId || !registered)
    return 'Claude sent an unknown connection. Remove the connector in Claude and add it again.'
  if (!registered.includes(redirectUri) || !isAllowedRedirectUri(redirectUri))
    return 'Claude sent an unexpected return address. Remove the connector in Claude and add it again.'
  const codeChallenge = source.get('code_challenge') ?? ''
  if (
    source.get('response_type') !== 'code' ||
    source.get('code_challenge_method') !== 'S256' ||
    !/^[A-Za-z0-9_-]{43}$/.test(codeChallenge)
  )
    return 'Claude sent an incomplete sign-in request. Try connecting again.'
  const params = new URLSearchParams()
  for (const name of FORWARDED_PARAMS) {
    const value = source.get(name)
    if (value !== null) params.set(name, value)
  }
  return { params, clientId, redirectUri, state: source.get('state'), codeChallenge }
}

function returnUrl(
  { redirectUri, state }: AuthorizeRequest,
  result: Record<string, string>
): string {
  const url = new URL(redirectUri)
  for (const [name, value] of Object.entries(result)) url.searchParams.set(name, value)
  if (state !== null) url.searchParams.set('state', state)
  return url.toString()
}

function problemPage(message: string, status = 400): Response {
  return page(
    'Cannot connect Claude',
    `<h1>Cannot connect Claude</h1><p class="error">${escapeHtml(message)}</p>`,
    status
  )
}

function consentPage(
  request: AuthorizeRequest,
  admin: SignedInAdmin | null,
  error?: string,
  status = 200,
  email = ''
): Response {
  const hidden = [...request.params]
    .map(
      ([name, value]) =>
        `<input type="hidden" name="${escapeHtml(name)}" value="${escapeHtml(value)}">`
    )
    .join('')
  const signIn = admin
    ? `<p class="who">Signed in as ${escapeHtml(admin.email)}</p><button type="submit">Allow Claude</button>`
    : `<label for="email">Shop login email</label><input id="email" name="email" type="email" autocomplete="username" value="${escapeHtml(email)}" required${email ? '' : ' autofocus'}><label for="password">Password</label><input id="password" name="password" type="password" autocomplete="current-password" required${email ? ' autofocus' : ''}><button type="submit">Sign in and allow Claude</button><a class="secondary" href="/admin/forgot">Forgot your password?</a>`
  const cancel = escapeHtml(returnUrl(request, { error: 'access_denied' }))
  return page(
    'Connect Claude',
    `<h1>Connect Claude to your shop</h1>
<p>Claude will be able to:</p>
<ul><li>look up your products, photos and recent orders</li><li>create draft products and blog posts, and upload photos, for you to check and publish</li></ul>
<p>It cannot publish, delete, change a live product or email customers.</p>
${error ? `<p class="error" role="alert">${escapeHtml(error)}</p>` : ''}
<form method="post" action="/api/oauth/authorize">${hidden}${signIn}</form>
<a class="secondary" href="${cancel}">Cancel</a>`,
    status
  )
}

async function sessionAdmin(payload: Payload, headers: Headers): Promise<SignedInAdmin | null> {
  const { user } = await payload.auth({ headers, canSetHeaders: false })
  return user && 'role' in user && user.role === 'admin' ? { id: user.id, email: user.email } : null
}

function loginFailure(error: unknown): string {
  const status = error instanceof Error && 'status' in error ? error.status : undefined
  if ((status === 429 || status === 423) && error instanceof Error) return error.message
  return 'That email and password do not match a shop login.'
}

export async function GET(request: NextRequest): Promise<Response> {
  const authorize = readAuthorizeRequest(request.nextUrl.searchParams)
  if (typeof authorize === 'string') return problemPage(authorize)
  const payload = await getPayload()
  return consentPage(authorize, await sessionAdmin(payload, request.headers))
}

export async function POST(request: NextRequest): Promise<Response> {
  if (!isSameOriginRequest(request)) return problemPage('Open this page from Claude.', 403)
  const form = new URLSearchParams()
  for (const [name, value] of await request.formData())
    if (typeof value === 'string') form.set(name, value)
  const authorize = readAuthorizeRequest(form)
  if (typeof authorize === 'string') return problemPage(authorize)

  const payload = await getPayload()
  const email = form.get('email')?.trim()
  const password = form.get('password')
  let admin: SignedInAdmin | null
  if (email && password) {
    try {
      const { user } = await payload.login({
        collection: 'users',
        data: { email, password },
        req: { headers: request.headers },
      })
      if (user?.role !== 'admin')
        return consentPage(authorize, null, 'That login is not a shop admin.', 403, email)
      admin = { id: user.id, email: user.email }
    } catch (error) {
      return consentPage(authorize, null, loginFailure(error), 401, email)
    }
  } else {
    admin = await sessionAdmin(payload, request.headers)
    if (!admin) return consentPage(authorize, null, 'Sign in with your shop login.', 401)
  }

  const destination = returnUrl(authorize, {
    code: issueCode({
      userId: admin.id,
      clientId: authorize.clientId,
      redirectUri: authorize.redirectUri,
      codeChallenge: authorize.codeChallenge,
    }),
  })
  return page(
    'Claude connected',
    `<h1>Claude is connected</h1><p>Taking you back to Claude…</p><a class="button" href="${escapeHtml(destination)}">Continue to Claude</a>`,
    200,
    destination
  )
}
