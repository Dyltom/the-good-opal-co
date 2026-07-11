export function createContentSecurityPolicy(nodeEnv = process.env.NODE_ENV): string {
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "connect-src 'self' https: wss:",
    "font-src 'self' data:",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "frame-src 'self' https://checkout.stripe.com",
    "img-src 'self' blob: data: https:",
    "object-src 'none'",
    `script-src 'self' 'unsafe-inline'${
      nodeEnv === 'production' ? '' : " 'unsafe-eval'"
    } https://va.vercel-scripts.com`,
    "style-src 'self' 'unsafe-inline'",
    "worker-src 'self' blob:",
    'upgrade-insecure-requests',
  ].join('; ')
}
