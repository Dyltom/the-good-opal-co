# Verification status

Last updated: 11 July 2026.

This file records evidence, not a blanket production-readiness claim. Live Vercel,
Blob, Stripe, and Resend behavior must be accepted against the provisioned
production resources before launch.

## Verified locally

- TypeScript and ESLint pass on supported Node.js 24 (Vercel target: Node.js 22).
- 123 unit and source-regression tests pass.
- Production dependency audit reports zero known advisories.
- All committed migrations apply to a fresh PostgreSQL database.
- Fresh-database bootstrap rejects the wrong owner email, promotes the configured
  `ADMIN_EMAIL`, and blocks later anonymous user creation.
- Desktop and 390 px mobile Chromium smoke tests cover public routes, navigation,
  catalog state, cart mutations, checkout validation, health, robots, sitemap,
  redirects, 404 behavior, and browser/runtime errors.
- Signed invalid and supported no-side-effect Stripe webhook requests are checked
  locally. A real test purchase and replay remain an environment acceptance test.

## Not independently verified without provisioned services

- Vercel Preview and Production deployments.
- Persistent Payload media upload and retrieval through a real Vercel Blob store.
- Stripe test purchase, paid-event replay, refund, dispute, inventory, and email
  effects using the production endpoint configuration.
- Resend delivery, bounce/rejection behavior, password reset, newsletter confirm,
  unsubscribe, and order/contact messages from a verified sender domain.
- Neon backup restore/PITR and rollback across a deployment.
- Final catalog inventory and product origin, treatment, sourcing, and certificate
  claims.
- Owner-approved legal entity, ABN, address, privacy, terms, returns, shipping,
  cookie, tax, settlement, refund, and dispute facts.

## Commands

Use Node.js 22 or 24:

```bash
pnpm install --frozen-lockfile
pnpm audit --prod
pnpm test:unit --run
pnpm validate:build
pnpm test:e2e
```

Use [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for provisioning and
[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for acceptance.
