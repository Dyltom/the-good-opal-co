import type { NextRequest } from 'next/server'
import type { Payload } from 'payload'
import { clientRedirectUris, isAllowedRedirectUri, issueCode } from '@/lib/mcp-oauth'
import { getPayload } from '@/lib/payload'
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

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

const STYLES = `
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:grid;place-items:center;padding:16px;background:#f5f2ec;color:#1c1813;font:16px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
main{width:100%;max-width:420px;background:#fff;border:1px solid #e4ddd1;border-radius:12px;padding:28px}
.brand{margin:0 0 20px;font:600 13px/1 system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#7a5c24}
h1{margin:0 0 12px;font:500 26px/1.2 Georgia,serif}
p{margin:0 0 16px;color:#544c42}
ul{margin:0 0 20px;padding-left:20px;color:#544c42}
li{margin:4px 0}
label{display:block;margin:0 0 6px;font-weight:600;font-size:14px}
input{display:block;width:100%;margin:0 0 16px;padding:12px;font:inherit;border:1px solid #cfc7bb;border-radius:8px;background:#fff;color:inherit}
input:focus{outline:2px solid #7a5c24;outline-offset:1px}
button,.button{display:block;width:100%;padding:13px 16px;font:600 16px/1.2 inherit;font-family:inherit;text-align:center;text-decoration:none;border:0;border-radius:8px;background:#1c1813;color:#fff;cursor:pointer}
.secondary{display:block;margin-top:14px;text-align:center;color:#544c42;font-size:14px}
.error{padding:12px;border-radius:8px;background:#fbeaea;color:#8a1f1f}
.who{padding:12px;border-radius:8px;background:#f5f2ec;color:#1c1813}
`

function page(title: string, content: string, status = 200, refreshTo?: string): Response {
  const refresh = refreshTo
    ? `<meta http-equiv="refresh" content="0;url=${escapeHtml(refreshTo)}">`
    : ''
  const html = `<!doctype html><html lang="en-AU"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${escapeHtml(title)} · The Good Opal Co</title>${refresh}<style>${STYLES}</style></head><body><main><p class="brand">The Good Opal Co</p>${content}</main></body></html>`
  return new Response(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  })
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
