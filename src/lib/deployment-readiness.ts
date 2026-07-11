import { getConfiguredStripeSecretKey, getConfiguredStripeWebhookSecret } from '@/lib/stripe-config'

export type ReadinessIssueCode =
  | 'payload_secret_invalid'
  | 'app_url_invalid'
  | 'email_from_invalid'
  | 'stripe_secret_key_invalid'
  | 'stripe_live_mode_required'
  | 'stripe_webhook_secret_invalid'
  | 'resend_api_key_invalid'
  | 'email_delivery_unverified'
  | 'blob_storage_unavailable'
  | 'redis_url_invalid'
  | 'redis_token_missing'

export type DeploymentReadiness = {
  ready: boolean
  revenueReady: boolean
  status: 'ready' | 'degraded'
  checks: {
    core: boolean
    payments: boolean
    email: boolean
    storage: boolean
    rateLimiting: boolean
  }
  issues: ReadinessIssueCode[]
}

type Environment = Readonly<Record<string, string | undefined>>

const PLACEHOLDER_MARKERS = [
  'xxxxxxxx',
  'placeholder',
  'change-me',
  'changeme',
  'your-secret',
  'your_',
  'your-',
  'example.com',
  'localhost.invalid',
]

function value(env: Environment, name: string): string {
  return env[name]?.trim() ?? ''
}

function isObviousPlaceholder(candidate: string): boolean {
  const normalized = candidate.toLowerCase()
  return PLACEHOLDER_MARKERS.some((marker) => normalized.includes(marker))
}

function hasValidPayloadSecret(env: Environment): boolean {
  const secret = value(env, 'PAYLOAD_SECRET')
  return secret.length >= 32 && !isObviousPlaceholder(secret)
}

function hasValidAppUrl(env: Environment, production: boolean): boolean {
  const configured = value(env, 'NEXT_PUBLIC_APP_URL')

  try {
    const url = new URL(configured)
    return (
      (url.protocol === 'https:' || (!production && url.protocol === 'http:')) &&
      Boolean(url.hostname) &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash
    )
  } catch {
    return false
  }
}

function hasValidEmailFrom(env: Environment): boolean {
  const configured = value(env, 'EMAIL_FROM')
  if (!configured || /[\r\n]/.test(configured) || isObviousPlaceholder(configured)) return false

  const namedAddress = configured.match(/^\s*[^<>]+\s*<([^<>]+)>\s*$/)
  const address = namedAddress?.[1]?.trim() ?? configured
  return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(address)
}

function hasValidProviderSecret(env: Environment, name: string, pattern: RegExp): boolean {
  const secret = value(env, name)
  return pattern.test(secret) && !isObviousPlaceholder(secret)
}

function getRedisUrl(env: Environment): string {
  return value(env, 'UPSTASH_REDIS_REST_URL') || value(env, 'UPSTASH_REDIS_REST_KV_REST_API_URL')
}

function getRedisToken(env: Environment): string {
  return (
    value(env, 'UPSTASH_REDIS_REST_TOKEN') || value(env, 'UPSTASH_REDIS_REST_KV_REST_API_TOKEN')
  )
}

function hasValidRedisUrl(env: Environment): boolean {
  try {
    const url = new URL(getRedisUrl(env))
    return url.protocol === 'https:' && Boolean(url.hostname)
  } catch {
    return false
  }
}

export function assessDeploymentReadiness(env: Environment = process.env): DeploymentReadiness {
  const production = value(env, 'NODE_ENV') === 'production'
  const issues: ReadinessIssueCode[] = []

  if (!hasValidPayloadSecret(env)) issues.push('payload_secret_invalid')
  if (!hasValidAppUrl(env, production)) issues.push('app_url_invalid')
  if (!hasValidEmailFrom(env)) issues.push('email_from_invalid')
  const stripeSecretKey = getConfiguredStripeSecretKey(value(env, 'STRIPE_SECRET_KEY'))
  if (!stripeSecretKey) {
    issues.push('stripe_secret_key_invalid')
  } else if (production && !/^(?:sk|rk)_live_/.test(stripeSecretKey)) {
    issues.push('stripe_live_mode_required')
  }
  if (!getConfiguredStripeWebhookSecret(value(env, 'STRIPE_WEBHOOK_SECRET'))) {
    issues.push('stripe_webhook_secret_invalid')
  }
  if (!hasValidProviderSecret(env, 'RESEND_API_KEY', /^re_[A-Za-z0-9_-]{10,}$/)) {
    issues.push('resend_api_key_invalid')
  }
  if (production && value(env, 'EMAIL_DELIVERY_VERIFIED') !== 'true') {
    issues.push('email_delivery_unverified')
  }

  const blobToken = value(env, 'BLOB_READ_WRITE_TOKEN')
  if (!blobToken || isObviousPlaceholder(blobToken)) issues.push('blob_storage_unavailable')
  if (!hasValidRedisUrl(env)) issues.push('redis_url_invalid')

  const redisToken = getRedisToken(env)
  if (!redisToken || isObviousPlaceholder(redisToken)) issues.push('redis_token_missing')

  const core = !issues.some(
    (issue) => issue === 'payload_secret_invalid' || issue === 'app_url_invalid'
  )
  const payments = !issues.some(
    (issue) =>
      issue === 'stripe_secret_key_invalid' ||
      issue === 'stripe_live_mode_required' ||
      issue === 'stripe_webhook_secret_invalid'
  )
  const email = !issues.some(
    (issue) =>
      issue === 'email_from_invalid' ||
      issue === 'resend_api_key_invalid' ||
      issue === 'email_delivery_unverified'
  )
  const storage = !issues.includes('blob_storage_unavailable')
  const rateLimiting = !issues.some(
    (issue) => issue === 'redis_url_invalid' || issue === 'redis_token_missing'
  )
  const ready = core && payments && email && storage && rateLimiting

  return {
    ready,
    revenueReady: payments && email,
    status: ready ? 'ready' : 'degraded',
    checks: { core, payments, email, storage, rateLimiting },
    issues,
  }
}

export function assertValidCoreProductionConfiguration(env: Environment = process.env): void {
  if (value(env, 'NODE_ENV') !== 'production') return

  const readiness = assessDeploymentReadiness(env)
  const coreIssues = readiness.issues.filter(
    (issue) => issue === 'payload_secret_invalid' || issue === 'app_url_invalid'
  )

  if (coreIssues.length > 0) {
    throw new Error(`Invalid production core configuration: ${coreIssues.join(', ')}`)
  }
}
